/**
 * Idempotency Controls
 *
 * Prevents duplicate operations (charges, invoices, webhooks, etc.)
 * Uses idempotency keys to ensure each critical operation runs only once.
 *
 * Server-side: Uses MongoDB for persistence
 * Client-side: Uses in-memory + localStorage for request dedup
 */

import logger from "./logger";

// ─── Client-Side Idempotency (In-Memory) ───────────────────────────────────

const pendingOperations = new Map<
  string,
  { timestamp: number; result?: unknown }
>();
const OPERATION_TTL_MS = 5 * 60 * 1000; // 5 minutes

/**
 * Generate an idempotency key from operation parameters
 */
export function generateIdempotencyKey(
  ...parts: (string | number | undefined)[]
): string {
  return parts.filter(Boolean).join(":");
}

/**
 * Check if an operation is already in progress or completed recently
 */
export function isOperationPending(key: string): boolean {
  const op = pendingOperations.get(key);
  if (!op) return false;

  // Check if expired
  if (Date.now() - op.timestamp > OPERATION_TTL_MS) {
    pendingOperations.delete(key);
    return false;
  }

  return true;
}

/**
 * Mark an operation as started (returns false if already pending)
 */
export function startOperation(key: string): boolean {
  if (isOperationPending(key)) {
    logger.warn(`Duplicate operation prevented: ${key}`, {
      module: "System",
      action: "idempotency:duplicate",
      metadata: { key },
    });
    return false;
  }

  pendingOperations.set(key, { timestamp: Date.now() });
  return true;
}

/**
 * Mark an operation as completed
 */
export function completeOperation(key: string, result?: unknown): void {
  pendingOperations.set(key, { timestamp: Date.now(), result });
}

/**
 * Remove an operation (e.g., on failure, allow retry)
 */
export function cancelOperation(key: string): void {
  pendingOperations.delete(key);
}

/**
 * Get result of a completed operation (if still in cache)
 */
export function getOperationResult(key: string): unknown | undefined {
  const op = pendingOperations.get(key);
  if (!op || Date.now() - op.timestamp > OPERATION_TTL_MS) return undefined;
  return op.result;
}

/**
 * Cleanup expired operations
 */
export function cleanupOperations(): number {
  const now = Date.now();
  let cleaned = 0;
  pendingOperations.forEach((op, key) => {
    if (now - op.timestamp > OPERATION_TTL_MS) {
      pendingOperations.delete(key);
      cleaned++;
    }
  });
  return cleaned;
}

// Auto-cleanup every 2 minutes
if (typeof setInterval !== "undefined") {
  setInterval(cleanupOperations, 2 * 60 * 1000);
}

// ─── HOC: Execute with Idempotency ─────────────────────────────────────────

/**
 * Execute an async operation with idempotency protection.
 * If the same key is already being processed, returns null instead of running again.
 * On failure, the operation is cancelled so it can be retried.
 */
export async function withIdempotency<T>(
  key: string,
  fn: () => Promise<T>,
): Promise<T | null> {
  // Check if operation is already pending
  if (!startOperation(key)) {
    logger.info(`Idempotent skip: "${key}" already in progress`, {
      module: "System",
      action: "idempotency:skip",
      metadata: { key },
    });

    // Return cached result if available
    const cachedResult = getOperationResult(key);
    if (cachedResult !== undefined) return cachedResult as T;

    return null;
  }

  try {
    const result = await fn();
    completeOperation(key, result);
    return result;
  } catch (error) {
    // On failure, allow the operation to be retried
    cancelOperation(key);
    throw error;
  }
}

// ─── Server-Side Idempotency (for API routes) ──────────────────────────────

/**
 * Server-side idempotency check using MongoDB.
 * Call this at the start of critical API handlers (invoices, payments, etc.)
 *
 * Usage in API route:
 *   const idempotencyKey = req.headers.get('idempotency-key');
 *   if (idempotencyKey) {
 *     const existing = await checkServerIdempotency(idempotencyKey);
 *     if (existing) return Response.json(existing.result, { status: existing.statusCode });
 *   }
 */
export interface ServerIdempotencyRecord {
  key: string;
  result: unknown;
  statusCode: number;
  createdAt: Date;
  expiresAt: Date;
}

/**
 * Check server-side idempotency (requires MongoDB model)
 * Returns the cached response if this key was already processed, null otherwise.
 */
export async function checkServerIdempotency(
  key: string,
): Promise<ServerIdempotencyRecord | null> {
  try {
    const { default: dbConnect } = await import("@/lib/db/connect");
    await dbConnect();

    // Use mongoose directly to avoid model dependency issues
    const mongoose = await import("mongoose");

    // Get or create the idempotency collection
    const schema = new mongoose.Schema({
      key: { type: String, unique: true, required: true },
      result: { type: mongoose.Schema.Types.Mixed },
      statusCode: { type: Number, default: 200 },
      createdAt: { type: Date, default: Date.now },
      expiresAt: {
        type: Date,
        default: () => new Date(Date.now() + 24 * 60 * 60 * 1000),
      },
    });
    schema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

    const IdempotencyModel =
      mongoose.models.IdempotencyRecord ||
      mongoose.model("IdempotencyRecord", schema);

    const record = await IdempotencyModel.findOne({
      key,
      expiresAt: { $gt: new Date() },
    }).lean();

    if (record) {
      logger.info(`Server idempotency hit: ${key}`, {
        module: "System",
        action: "idempotency:server:hit",
        metadata: { key },
      });
      return record as unknown as ServerIdempotencyRecord;
    }

    return null;
  } catch (error) {
    // If idempotency check fails, allow the operation (fail-open)
    logger.warn(
      "Server idempotency check failed, allowing operation",
      {
        module: "System",
        action: "idempotency:server:error",
      },
      error,
    );
    return null;
  }
}

/**
 * Save a server-side idempotency record
 */
export async function saveServerIdempotency(
  key: string,
  result: unknown,
  statusCode: number = 200,
  ttlMs: number = 24 * 60 * 60 * 1000, // 24 hours
): Promise<void> {
  try {
    const mongoose = await import("mongoose");
    const IdempotencyModel = mongoose.models.IdempotencyRecord;
    if (!IdempotencyModel) return;

    await IdempotencyModel.findOneAndUpdate(
      { key },
      {
        key,
        result,
        statusCode,
        createdAt: new Date(),
        expiresAt: new Date(Date.now() + ttlMs),
      },
      { upsert: true },
    );
  } catch (error) {
    logger.warn(
      "Failed to save idempotency record",
      {
        module: "System",
        action: "idempotency:server:save-error",
      },
      error,
    );
  }
}

export default withIdempotency;

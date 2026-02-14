/**
 * Auto-Recovery & Stability System — Main Barrel Export
 *
 * This module provides a comprehensive set of tools for system stability:
 *
 * 1. RETRY WITH BACKOFF  — Auto-retry transient failures with exponential backoff
 * 2. CIRCUIT BREAKER     — Prevent cascading failures when services are down
 * 3. ISSUE CLASSIFIER    — Classify errors as minor (auto-fix) or major (alert user)
 * 4. AUTO-CORRECTION     — Safe defaults and auto-correction for minor issues
 * 5. SYSTEM ALERTS       — User-facing warning banners for major issues
 * 6. FEATURE FLAGS       — Enable/disable modules without redeploying
 * 7. IDEMPOTENCY         — Prevent duplicate charges, invoices, operations
 * 8. HEALTH CHECK        — System health monitoring
 * 9. STRUCTURED LOGGING  — Contextual, structured logs (no sensitive data)
 *
 * STRATEGIC PRINCIPLE:
 * The system prioritizes stability, traceability, and financial integrity.
 * ✅ Auto-recover: missing values, transient errors, format issues, stale data
 * ❌ Never auto-modify: business logic, financial calculations, payment rules
 */

// ─── Structured Logging ────────────────────────────────────────────────────
export {
  logger,
  type LogLevel,
  type LogContext,
  type SystemModule,
  type LogEntry,
} from "./logger";

// ─── Retry with Exponential Backoff ────────────────────────────────────────
export {
  retryWithBackoff,
  retryFetch,
  type RetryOptions,
} from "./retryWithBackoff";

// ─── Circuit Breaker ───────────────────────────────────────────────────────
export {
  CircuitBreaker,
  CircuitOpenError,
  getCircuitBreaker,
  getAllCircuitStatuses,
  type CircuitState,
  type CircuitBreakerOptions,
} from "./circuitBreaker";

// ─── Issue Classifier & Auto-Correction ────────────────────────────────────
export {
  classifyIssue,
  withAutoRecovery,
  withAsyncAutoRecovery,
  AutoRecoveryError,
  SAFE_DEFAULTS,
  type IssueSeverity,
  type IssueCategory,
  type ClassifiedIssue,
  type IssueContext,
} from "./issueClassifier";

// ─── System Alerts (UI) ───────────────────────────────────────────────────
export {
  emitSystemAlert,
  dismissAlert,
  clearAlerts,
  getActiveAlerts,
  getAllAlerts,
  onSystemAlert,
  type SystemAlert,
} from "./systemAlerts";

// ─── Feature Flags ─────────────────────────────────────────────────────────
export {
  isFeatureEnabled,
  setFeatureFlag,
  getAllFeatureFlags,
  resetFeatureFlags,
  withFeatureFlag,
  withAsyncFeatureFlag,
  type FeatureFlag,
} from "./featureFlags";

// ─── Idempotency ──────────────────────────────────────────────────────────
export {
  generateIdempotencyKey,
  withIdempotency,
  isOperationPending,
  startOperation,
  completeOperation,
  cancelOperation,
  checkServerIdempotency,
  saveServerIdempotency,
} from "./idempotency";

// ─── Health Check ─────────────────────────────────────────────────────────
export {
  performHealthCheck,
  type SystemHealth,
  type ServiceHealth,
  type ServiceStatus,
} from "./healthCheck";
// ─── Resilient Fetch (Client-Side) ───────────────────────────────────
export { resilientFetch, type ResilientFetchOptions } from "./resilientFetch";

// ─── API Route Middleware (Server-Side) ──────────────────────────────
export { withRecovery, type ApiMiddlewareOptions } from "./apiMiddleware";

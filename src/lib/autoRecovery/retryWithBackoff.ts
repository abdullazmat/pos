/**
 * Retry with Exponential Backoff
 *
 * Automatically retries transient failures with increasing delays.
 * Used for external API calls (AFIP/ARCA, Mercado Pago, etc.)
 */

import logger, { SystemModule } from "./logger";

export interface RetryOptions {
  /** Maximum number of retry attempts (default: 3) */
  maxRetries?: number;
  /** Initial delay in ms before first retry (default: 1000) */
  initialDelayMs?: number;
  /** Maximum delay in ms between retries (default: 30000) */
  maxDelayMs?: number;
  /** Backoff multiplier (default: 2) */
  backoffMultiplier?: number;
  /** Add random jitter to prevent thundering herd (default: true) */
  jitter?: boolean;
  /** Module name for logging */
  module?: SystemModule;
  /** Action description for logging */
  action?: string;
  /** Optional: determine if error is retryable (default: all errors are retryable) */
  isRetryable?: (error: unknown) => boolean;
  /** Optional: callback on each retry */
  onRetry?: (attempt: number, error: unknown, delayMs: number) => void;
}

/** Default function to determine if an error is retryable */
function defaultIsRetryable(error: unknown): boolean {
  // Don't retry validation errors, auth errors, or client errors
  if (error instanceof Error) {
    const msg = error.message.toLowerCase();
    // Not retryable: client errors (400-level)
    if (
      msg.includes("400") ||
      msg.includes("validation") ||
      msg.includes("invalid")
    )
      return false;
    if (msg.includes("401") || msg.includes("unauthorized")) return false;
    if (msg.includes("403") || msg.includes("forbidden")) return false;
    if (msg.includes("404") || msg.includes("not found")) return false;
    if (msg.includes("409") || msg.includes("conflict")) return false;
    if (msg.includes("422") || msg.includes("unprocessable")) return false;
  }

  // Check for HTTP response status
  if (typeof error === "object" && error !== null && "status" in error) {
    const status = (error as any).status;
    if (typeof status === "number" && status >= 400 && status < 500)
      return false;
  }

  // All other errors (network, 500s, timeouts) are retryable
  return true;
}

/**
 * Execute a function with automatic retry and exponential backoff
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {},
): Promise<T> {
  const {
    maxRetries = 3,
    initialDelayMs = 1000,
    maxDelayMs = 30000,
    backoffMultiplier = 2,
    jitter = true,
    module = "System",
    action = "unknown",
    isRetryable = defaultIsRetryable,
    onRetry,
  } = options;

  let lastError: unknown;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const result = await fn();

      // Log recovery if we retried successfully
      if (attempt > 0) {
        logger.info(`Recovered after ${attempt} retries`, {
          module,
          action,
          metadata: { attempt, totalAttempts: attempt + 1 },
        });
      }

      return result;
    } catch (error) {
      lastError = error;

      // If it's the last attempt or error is not retryable, throw
      if (attempt >= maxRetries || !isRetryable(error)) {
        if (attempt >= maxRetries) {
          logger.error(
            `All ${maxRetries} retries exhausted`,
            {
              module,
              action,
              metadata: { maxRetries },
            },
            error,
          );
        }
        throw error;
      }

      // Calculate delay with exponential backoff
      let delay = Math.min(
        initialDelayMs * Math.pow(backoffMultiplier, attempt),
        maxDelayMs,
      );

      // Add jitter (±25%)
      if (jitter) {
        const jitterRange = delay * 0.25;
        delay += Math.random() * jitterRange * 2 - jitterRange;
        delay = Math.max(0, Math.round(delay));
      }

      logger.warn(
        `Retry ${attempt + 1}/${maxRetries} in ${delay}ms`,
        {
          module,
          action,
          metadata: { attempt: attempt + 1, delayMs: delay, maxRetries },
        },
        error,
      );

      onRetry?.(attempt + 1, error, delay);

      // Wait before retrying
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  // Should not reach here, but just in case
  throw lastError;
}

/**
 * Convenience wrapper for retrying fetch requests
 */
export async function retryFetch(
  url: string,
  fetchOptions: RequestInit = {},
  retryOptions: RetryOptions = {},
): Promise<Response> {
  return retryWithBackoff(
    async () => {
      const response = await fetch(url, fetchOptions);

      // Treat 5xx as errors for retry purposes
      if (response.status >= 500) {
        const body = await response.text().catch(() => "");
        const error = new Error(
          `HTTP ${response.status}: ${body.slice(0, 200)}`,
        );
        (error as any).status = response.status;
        throw error;
      }

      return response;
    },
    {
      module: retryOptions.module || "API",
      action: retryOptions.action || `fetch:${url}`,
      ...retryOptions,
    },
  );
}

export default retryWithBackoff;

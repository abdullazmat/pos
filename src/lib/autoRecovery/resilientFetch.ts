/**
 * Resilient API Fetch — Enhanced fetch wrapper with full auto-recovery
 *
 * Combines:
 * - Token refresh (from existing apiFetch)
 * - Retry with exponential backoff
 * - Circuit breaker protection
 * - Issue classification (minor → silent fix, major → alert user)
 * - Idempotency for mutation requests
 *
 * Drop-in replacement for apiFetch in critical paths.
 */

import { retryWithBackoff, type RetryOptions } from "./retryWithBackoff";
import { getCircuitBreaker } from "./circuitBreaker";
import {
  classifyIssue,
  AutoRecoveryError,
  type IssueContext,
} from "./issueClassifier";
import { emitSystemAlert } from "./systemAlerts";
import { isFeatureEnabled } from "./featureFlags";
import {
  isOperationPending,
  startOperation,
  completeOperation,
  cancelOperation,
  generateIdempotencyKey,
} from "./idempotency";
import logger, { type SystemModule } from "./logger";

export interface ResilientFetchOptions extends RequestInit {
  /** Skip token refresh */
  skipRefresh?: boolean;
  /** Module making the request (for logging & classification) */
  module?: SystemModule;
  /** Action description */
  action?: string;
  /** Custom retry options */
  retry?: Partial<RetryOptions>;
  /** Circuit breaker name (requests to the same service share a breaker) */
  circuitName?: string;
  /** Idempotency key for mutation requests (POST/PUT/DELETE) */
  idempotencyKey?: string;
  /** Skip auto-recovery (pass errors through as-is) */
  skipAutoRecovery?: boolean;
}

/**
 * Make a resilient API request with automatic recovery for transient errors
 */
export async function resilientFetch(
  url: string,
  options: ResilientFetchOptions = {},
): Promise<Response> {
  const {
    skipRefresh = false,
    module = "API",
    action = `fetch:${url.split("?")[0]}`,
    retry = {},
    circuitName,
    idempotencyKey,
    skipAutoRecovery = false,
    ...fetchOptions
  } = options;

  const startTime = Date.now();

  // ─── Token refresh (reuse existing logic) ───────────────────────────
  let token =
    typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;
  const refreshToken =
    typeof window !== "undefined" ? localStorage.getItem("refreshToken") : null;

  if (token && !skipRefresh && typeof window !== "undefined") {
    try {
      const { isTokenExpiredSoon } = await import("@/lib/utils/token");
      if (isTokenExpiredSoon(token) && refreshToken) {
        const refreshResponse = await fetch("/api/auth/refresh", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ refreshToken }),
        });
        if (refreshResponse.ok) {
          const data = await refreshResponse.json();
          if (data.data?.accessToken) {
            localStorage.setItem("accessToken", data.data.accessToken);
            token = data.data.accessToken;
          }
          if (data.data?.refreshToken) {
            localStorage.setItem("refreshToken", data.data.refreshToken);
          }
        }
      }
    } catch {
      // Continue with current token
    }
  }

  // Set auth header
  const headers = new Headers(fetchOptions.headers);
  if (token) headers.set("Authorization", `Bearer ${token}`);

  // ─── Idempotency check for mutations ────────────────────────────────
  const method = (fetchOptions.method || "GET").toUpperCase();
  if (idempotencyKey && ["POST", "PUT", "DELETE", "PATCH"].includes(method)) {
    if (isOperationPending(idempotencyKey)) {
      logger.warn(`Duplicate request prevented: ${idempotencyKey}`, {
        module,
        action,
        metadata: { idempotencyKey, url },
      });
      // Return a synthetic "conflict" response
      return new Response(
        JSON.stringify({
          error: "Duplicate request",
          message: "This operation is already in progress",
        }),
        { status: 409, headers: { "Content-Type": "application/json" } },
      );
    }
    startOperation(idempotencyKey);
    headers.set("Idempotency-Key", idempotencyKey);
  }

  // ─── Build the actual fetch function ────────────────────────────────
  const doFetch = async (): Promise<Response> => {
    const response = await fetch(url, { ...fetchOptions, headers });

    // Server errors are thrown so retry logic can catch them
    if (response.status >= 500) {
      const body = await response
        .clone()
        .text()
        .catch(() => "");
      const err = new Error(`HTTP ${response.status}: ${body.slice(0, 200)}`);
      (err as any).status = response.status;
      throw err;
    }

    return response;
  };

  // ─── Wrap with circuit breaker ──────────────────────────────────────
  const withCircuit =
    circuitName && isFeatureEnabled("circuit_breaker_enabled")
      ? () => getCircuitBreaker({ name: circuitName, module }).execute(doFetch)
      : doFetch;

  // ─── Wrap with retry ───────────────────────────────────────────────
  const withRetry = isFeatureEnabled("auto_retry_enabled")
    ? () =>
        retryWithBackoff(withCircuit, {
          maxRetries: retry.maxRetries ?? 2,
          initialDelayMs: retry.initialDelayMs ?? 800,
          module,
          action,
          ...retry,
        })
    : withCircuit;

  try {
    const response = await withRetry();

    // Log successful request
    logger.debug(`API request completed: ${method} ${url}`, {
      module,
      action,
      duration_ms: Date.now() - startTime,
      metadata: { status: response.status, url },
    });

    // Handle 401 with token refresh retry
    if (
      response.status === 401 &&
      !skipRefresh &&
      refreshToken &&
      typeof window !== "undefined"
    ) {
      try {
        const refreshResponse = await fetch("/api/auth/refresh", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ refreshToken }),
        });
        if (refreshResponse.ok) {
          const data = await refreshResponse.json();
          if (data.data?.accessToken) {
            localStorage.setItem("accessToken", data.data.accessToken);
            return resilientFetch(url, { ...options, skipRefresh: true });
          }
        }
      } catch {
        // Fall through to login redirect
      }
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("user");
      window.location.href = "/auth/login";
    }

    // Mark idempotent operation as complete
    if (idempotencyKey)
      completeOperation(idempotencyKey, { status: response.status });

    return response;
  } catch (error) {
    // Cancel idempotent operation on failure (allow retry)
    if (idempotencyKey) cancelOperation(idempotencyKey);

    // ─── Issue classification ─────────────────────────────────────────
    if (!skipAutoRecovery && isFeatureEnabled("auto_correct_minor")) {
      const issueContext: IssueContext = { module, action };
      const issue = classifyIssue(error, issueContext);

      // Major issue → emit alert for the user
      if (
        issue.severity === "major" &&
        isFeatureEnabled("system_alerts_enabled")
      ) {
        emitSystemAlert(issue);
      }

      // Log with full context
      logger.error(
        `API request failed: ${method} ${url}`,
        {
          module,
          action,
          duration_ms: Date.now() - startTime,
          metadata: {
            url,
            severity: issue.severity,
            category: issue.category,
            autoRecoverable: issue.autoRecoverable,
          },
        },
        error,
      );

      throw new AutoRecoveryError(issue);
    }

    throw error;
  }
}

export default resilientFetch;

/**
 * API Route Wrapper with Auto-Recovery
 *
 * Wraps Next.js API route handlers with:
 * - Structured logging (request/response)
 * - Error classification (minor → fallback, major → proper error response)
 * - Idempotency for mutations
 * - Feature flag checks
 * - Duration tracking
 *
 * Usage:
 *   import { withRecovery } from '@/lib/autoRecovery/apiMiddleware';
 *
 *   export const POST = withRecovery(async (req) => {
 *     // your handler logic
 *     return NextResponse.json({ success: true, data: result });
 *   }, { module: 'Invoice', action: 'create' });
 */

import { NextRequest, NextResponse } from "next/server";
import { classifyIssue, type IssueContext } from "./issueClassifier";
import { isFeatureEnabled } from "./featureFlags";
import { checkServerIdempotency, saveServerIdempotency } from "./idempotency";
import logger, { type SystemModule } from "./logger";

export interface ApiMiddlewareOptions {
  /** Module making the request */
  module: SystemModule;
  /** Action description */
  action?: string;
  /** Feature flag that must be enabled for this route to work */
  requiredFeatureFlag?: string;
  /** Enable server-side idempotency (reads Idempotency-Key header) */
  idempotent?: boolean;
}

type RouteHandler = (req: NextRequest) => Promise<NextResponse | Response>;

/**
 * Wrap an API route handler with auto-recovery
 */
export function withRecovery(
  handler: RouteHandler,
  options: ApiMiddlewareOptions,
): RouteHandler {
  return async (req: NextRequest) => {
    const startTime = Date.now();
    const { module, action, requiredFeatureFlag, idempotent } = options;
    const requestAction = action || `${req.method}:${req.nextUrl.pathname}`;

    // ─── Feature flag check ─────────────────────────────────────────
    if (requiredFeatureFlag && !isFeatureEnabled(requiredFeatureFlag)) {
      logger.info(`Route disabled by feature flag: ${requiredFeatureFlag}`, {
        module,
        action: requestAction,
      });
      return NextResponse.json(
        { success: false, error: "This feature is currently disabled" },
        { status: 503 },
      );
    }

    // ─── Maintenance mode check ─────────────────────────────────────
    if (isFeatureEnabled("maintenance_mode")) {
      return NextResponse.json(
        {
          success: false,
          error: "System is in maintenance mode. Please try again later.",
        },
        { status: 503 },
      );
    }

    // ─── Server-side idempotency ────────────────────────────────────
    if (idempotent) {
      const idempotencyKey =
        req.headers.get("idempotency-key") ||
        req.headers.get("Idempotency-Key");
      if (idempotencyKey) {
        try {
          const existing = await checkServerIdempotency(idempotencyKey);
          if (existing) {
            logger.info(
              `Idempotent response returned for key: ${idempotencyKey}`,
              {
                module,
                action: requestAction,
                metadata: { idempotencyKey },
              },
            );
            return NextResponse.json(existing.result, {
              status: existing.statusCode,
            });
          }
        } catch {
          // Fail-open: if idempotency check fails, continue processing
        }
      }
    }

    // ─── Execute handler with error classification ──────────────────
    try {
      const response = await handler(req);

      // Log successful request
      logger.debug(`API ${req.method} ${req.nextUrl.pathname} completed`, {
        module,
        action: requestAction,
        duration_ms: Date.now() - startTime,
        metadata: { status: (response as any).status || 200 },
      });

      // Save idempotency record for successful mutations
      if (
        idempotent &&
        ["POST", "PUT", "DELETE", "PATCH"].includes(req.method)
      ) {
        const idempotencyKey =
          req.headers.get("idempotency-key") ||
          req.headers.get("Idempotency-Key");
        if (idempotencyKey) {
          try {
            const responseClone = response.clone();
            const responseBody = await responseClone.json().catch(() => null);
            await saveServerIdempotency(
              idempotencyKey,
              responseBody,
              (response as any).status || 200,
            );
          } catch {
            // Non-critical: don't fail the request
          }
        }
      }

      return response;
    } catch (error) {
      const durationMs = Date.now() - startTime;
      const context: IssueContext = { module, action: requestAction };
      const issue = classifyIssue(error, context);

      // Log based on severity
      if (issue.severity === "major") {
        logger.error(
          `MAJOR error in API ${req.method} ${req.nextUrl.pathname}`,
          {
            module,
            action: requestAction,
            duration_ms: durationMs,
            metadata: {
              category: issue.category,
              severity: issue.severity,
              requiresDeveloper: issue.requiresDeveloper,
            },
          },
          error,
        );

        // For major errors: return a proper error response
        return NextResponse.json(
          {
            success: false,
            error: issue.userMessage || "An unexpected error occurred",
            category: issue.category,
            requiresDeveloper: issue.requiresDeveloper,
            ...(process.env.NODE_ENV === "development" && {
              debug: {
                message: error instanceof Error ? error.message : String(error),
                category: issue.category,
              },
            }),
          },
          { status: 500 },
        );
      } else {
        // Minor error: log it and return a graceful degradation response
        logger.info(
          `Minor error auto-handled in API ${req.method} ${req.nextUrl.pathname}: [${issue.category}]`,
          {
            module,
            action: requestAction,
            duration_ms: durationMs,
            metadata: { category: issue.category },
          },
        );

        return NextResponse.json(
          {
            success: false,
            error: "A temporary issue occurred. Please try again.",
            retryable: true,
          },
          { status: 503 },
        );
      }
    }
  };
}

export default withRecovery;

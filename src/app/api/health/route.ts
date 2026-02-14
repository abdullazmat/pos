/**
 * Health Check API Endpoint
 * GET /api/health
 *
 * Returns system health status including:
 * - Database connectivity
 * - External service status
 * - Circuit breaker states
 * - Error metrics
 */

import { NextResponse } from "next/server";
import { performHealthCheck } from "@/lib/autoRecovery/healthCheck";
import { isFeatureEnabled } from "@/lib/autoRecovery/featureFlags";

export async function GET() {
  // Feature flag check
  if (!isFeatureEnabled("health_check_enabled")) {
    return NextResponse.json(
      { status: "disabled", message: "Health check is currently disabled" },
      { status: 503 },
    );
  }

  try {
    const health = await performHealthCheck();

    const statusCode =
      health.status === "healthy"
        ? 200
        : health.status === "degraded"
          ? 200
          : 503;

    return NextResponse.json(health, { status: statusCode });
  } catch (error) {
    return NextResponse.json(
      {
        status: "unhealthy",
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : "Health check failed",
      },
      { status: 503 },
    );
  }
}

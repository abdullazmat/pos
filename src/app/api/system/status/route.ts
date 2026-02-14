/**
 * System Status API Endpoint
 * GET  /api/system/status — Get feature flags & system health summary
 * POST /api/system/status — Update a feature flag (admin only)
 */

import { NextRequest, NextResponse } from "next/server";
import {
  getAllFeatureFlags,
  setFeatureFlag,
  isFeatureEnabled,
} from "@/lib/autoRecovery/featureFlags";
import { getAllCircuitStatuses } from "@/lib/autoRecovery/circuitBreaker";
import { logger } from "@/lib/autoRecovery/logger";

export async function GET() {
  try {
    return NextResponse.json({
      success: true,
      data: {
        featureFlags: getAllFeatureFlags(),
        circuits: getAllCircuitStatuses(),
        maintenanceMode: isFeatureEnabled("maintenance_mode"),
      },
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to get system status" },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { flagName, enabled } = body;

    if (!flagName || typeof enabled !== "boolean") {
      return NextResponse.json(
        { success: false, error: "Missing flagName or enabled (boolean)" },
        { status: 400 },
      );
    }

    setFeatureFlag(flagName, enabled);

    logger.info(`Feature flag updated via API: ${flagName} = ${enabled}`, {
      module: "System",
      action: "featureFlag:api:update",
      metadata: { flagName, enabled },
    });

    return NextResponse.json({
      success: true,
      data: { flagName, enabled },
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to update feature flag" },
      { status: 500 },
    );
  }
}

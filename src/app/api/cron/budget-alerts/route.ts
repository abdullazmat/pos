import { NextRequest, NextResponse } from "next/server";
import { runBudgetAlertChecks } from "@/lib/services/cronJobs";

export const dynamic = "force-dynamic";

/**
 * POST /api/cron/budget-alerts
 *
 * Cron job to check all budgets across businesses and send email alerts
 * when spending crosses 80% or 100% thresholds.
 * Protected by CRON_SECRET header.
 *
 * Recommended schedule: daily at 08:00 or every 6 hours
 */
export async function POST(req: NextRequest) {
  const secret = req.headers.get("x-cron-secret") || "";
  if (!process.env.CRON_SECRET || secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await runBudgetAlertChecks();
    return NextResponse.json({
      success: true,
      ...result,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error("[CRON] Budget alerts error:", error);
    return NextResponse.json(
      { error: "Budget alert check failed", details: error.message },
      { status: 500 },
    );
  }
}

export async function GET(req: NextRequest) {
  return POST(req);
}

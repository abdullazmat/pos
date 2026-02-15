import { NextRequest, NextResponse } from "next/server";
import { generateRecurringExpenses } from "@/lib/services/cronJobs";

export const dynamic = "force-dynamic";

/**
 * POST /api/cron/recurring-expenses
 *
 * Daily cron job to generate expenses from active recurring expense configurations.
 * Protected by CRON_SECRET header.
 *
 * Recommended schedule: daily at 00:05 or 06:00
 */
export async function POST(req: NextRequest) {
  const secret = req.headers.get("x-cron-secret") || "";
  if (!process.env.CRON_SECRET || secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await generateRecurringExpenses();
    return NextResponse.json({
      success: true,
      ...result,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error("[CRON] Recurring expenses error:", error);
    return NextResponse.json(
      { error: "Recurring expense generation failed", details: error.message },
      { status: 500 },
    );
  }
}

export async function GET(req: NextRequest) {
  return POST(req);
}

import { NextRequest, NextResponse } from "next/server";
import { runArcaRetry } from "@/lib/server/arcaRetryService";

export const dynamic = "force-dynamic";

const handleRetry = async (req: NextRequest) => {
  const secret = req.headers.get("x-cron-secret") || "";
  if (!process.env.CRON_SECRET || secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const limitParam = req.nextUrl.searchParams.get("limit");
  const limitRaw = limitParam ? Number.parseInt(limitParam, 10) : NaN;
  const limit = Number.isFinite(limitRaw) ? limitRaw : undefined;

  try {
    const summary = await runArcaRetry({ limit, source: "cron" });
    return NextResponse.json(summary);
  } catch (error) {
    console.error("[ARCA RETRY] Cron error:", error);
    return NextResponse.json({ error: "ARCA retry failed" }, { status: 500 });
  }
};

export async function POST(req: NextRequest) {
  return handleRetry(req);
}

export async function GET(req: NextRequest) {
  return handleRetry(req);
}

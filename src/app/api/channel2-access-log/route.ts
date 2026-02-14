import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db/connect";
import Channel2AccessLog from "@/lib/models/Channel2AccessLog";
import { verifyToken } from "@/lib/utils/jwt";

/**
 * GET /api/channel2-access-log
 * Retrieve Channel 2 access logs. Admin/Supervisor only.
 * Query params: ?limit=50&userId=xxx
 */
export async function GET(req: NextRequest) {
  try {
    const token = req.headers.get("authorization")?.split(" ")[1];
    if (!token)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const decoded = verifyToken(token);
    if (!decoded)
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });

    // Only admin and supervisor can view logs
    if (decoded.role === "cashier") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const limit = Math.min(Number(searchParams.get("limit")) || 50, 200);
    const userId = searchParams.get("userId");

    await dbConnect();

    const filter: Record<string, unknown> = {
      businessId: decoded.businessId,
    };
    if (userId) filter.userId = userId;

    const logs = await Channel2AccessLog.find(filter)
      .sort({ timestamp: -1 })
      .limit(limit)
      .lean();

    return NextResponse.json({ logs });
  } catch (error) {
    console.error("Channel 2 access log error:", error);
    return NextResponse.json(
      { error: "Failed to fetch access logs" },
      { status: 500 },
    );
  }
}

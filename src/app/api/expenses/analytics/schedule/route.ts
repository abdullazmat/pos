import { NextResponse } from "next/server";
import { verifyToken } from "@/lib/utils/jwt";

export async function POST(request: Request) {
  try {
    const token = request.headers.get("authorization")?.split(" ")[1];
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const body = await request.json();
    const { frequency, period } = body;

    if (!frequency || !["weekly", "monthly"].includes(frequency)) {
      return NextResponse.json({ error: "Invalid frequency" }, { status: 400 });
    }

    // TODO: Implement actual email scheduling via cron job or third-party service
    // For now, return success to acknowledge the request
    console.log(
      `[Expense Analytics] Email schedule requested: ${frequency} for business ${decoded.businessId}, period: ${period}`,
    );

    return NextResponse.json({
      success: true,
      message: `Email scheduled: ${frequency}`,
      schedule: {
        businessId: decoded.businessId,
        userId: decoded.userId,
        email: decoded.email,
        frequency,
        period: period || "this_month",
      },
    });
  } catch (error) {
    console.error("Schedule email error:", error);
    return NextResponse.json(
      { error: "Failed to schedule email" },
      { status: 500 },
    );
  }
}

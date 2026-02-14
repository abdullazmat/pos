import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import dbConnect from "@/lib/db/connect";
import User from "@/lib/models/User";
import Channel2AccessLog from "@/lib/models/Channel2AccessLog";
import { verifyToken } from "@/lib/utils/jwt";

/**
 * POST /api/channel2-auth
 * Verify user PIN to activate Channel 2 (Internal mode).
 * Body: { pin: string }
 * Returns: { activated: true, expiresAt: string }
 */
export async function POST(req: NextRequest) {
  try {
    const token = req.headers.get("authorization")?.split(" ")[1];
    if (!token)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const decoded = verifyToken(token);
    if (!decoded)
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });

    const body = await req.json();
    const { pin } = body;

    if (!pin || typeof pin !== "string" || pin.length < 4) {
      return NextResponse.json(
        { error: "PIN must be at least 4 characters" },
        { status: 400 },
      );
    }

    await dbConnect();

    // Fetch user with internalPin (excluded by default via select: false)
    const user = await User.findOne({
      _id: decoded.userId,
      businessId: decoded.businessId,
      isActive: true,
    }).select("+internalPin");

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (!user.internalPin) {
      return NextResponse.json(
        { error: "No internal PIN configured. Set one first." },
        { status: 400 },
      );
    }

    const isMatch = await bcrypt.compare(pin, user.internalPin);
    if (!isMatch) {
      return NextResponse.json({ error: "Invalid PIN" }, { status: 403 });
    }

    // Channel 2 session expires in 10 minutes
    const TIMEOUT_MINUTES = 10;
    const expiresAt = new Date(
      Date.now() + TIMEOUT_MINUTES * 60 * 1000,
    ).toISOString();

    // Log activation
    await Channel2AccessLog.create({
      businessId: decoded.businessId,
      userId: decoded.userId,
      userEmail: decoded.email,
      userRole: decoded.role,
      action: "ACTIVATE",
      description: `Channel 2 activated by ${decoded.email}`,
      ipAddress: req.headers.get("x-forwarded-for") || undefined,
      metadata: { expiresAt, timeoutMinutes: TIMEOUT_MINUTES },
    });

    return NextResponse.json({
      activated: true,
      expiresAt,
      timeoutMinutes: TIMEOUT_MINUTES,
    });
  } catch (error) {
    console.error("Channel 2 auth error:", error);
    return NextResponse.json(
      { error: "Failed to authenticate for Channel 2" },
      { status: 500 },
    );
  }
}

/**
 * DELETE /api/channel2-auth
 * Deactivate Channel 2 session (manual or timeout).
 * Body: { reason?: "manual" | "timeout" }
 */
export async function DELETE(req: NextRequest) {
  try {
    const token = req.headers.get("authorization")?.split(" ")[1];
    if (!token)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const decoded = verifyToken(token);
    if (!decoded)
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });

    await dbConnect();

    let reason = "manual";
    try {
      const body = await req.json();
      reason = body.reason || "manual";
    } catch {
      // No body is fine
    }

    await Channel2AccessLog.create({
      businessId: decoded.businessId,
      userId: decoded.userId,
      userEmail: decoded.email,
      userRole: decoded.role,
      action: reason === "timeout" ? "TIMEOUT" : "DEACTIVATE",
      description: `Channel 2 deactivated (${reason}) by ${decoded.email}`,
      ipAddress: req.headers.get("x-forwarded-for") || undefined,
    });

    return NextResponse.json({ deactivated: true });
  } catch (error) {
    console.error("Channel 2 deactivate error:", error);
    return NextResponse.json(
      { error: "Failed to deactivate Channel 2" },
      { status: 500 },
    );
  }
}

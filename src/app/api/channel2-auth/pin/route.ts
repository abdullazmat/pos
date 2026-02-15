import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import dbConnect from "@/lib/db/connect";
import User from "@/lib/models/User";
import { verifyToken } from "@/lib/utils/jwt";

/**
 * GET /api/channel2-auth/pin
 * Check if the current user has a PIN configured.
 */
export async function GET(req: NextRequest) {
  try {
    const token = req.headers.get("authorization")?.split(" ")[1];
    if (!token)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const decoded = verifyToken(token);
    if (!decoded)
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });

    await dbConnect();

    const user = await User.findOne({
      _id: decoded.userId,
      businessId: decoded.businessId,
    }).select("+internalPin");

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ hasPin: !!user.internalPin });
  } catch (error) {
    console.error("Check PIN status error:", error);
    return NextResponse.json(
      { error: "Failed to check PIN status" },
      { status: 500 },
    );
  }
}

/**
 * PUT /api/channel2-auth/pin
 * Set or update the internal PIN for the current user.
 * Body: { pin: string, currentPassword: string }
 * Requires current password for security.
 */
export async function PUT(req: NextRequest) {
  try {
    const token = req.headers.get("authorization")?.split(" ")[1];
    if (!token)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const decoded = verifyToken(token);
    if (!decoded)
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });

    const body = await req.json();
    const { pin, currentPassword } = body;

    if (!pin || typeof pin !== "string" || pin.length < 4 || pin.length > 8) {
      return NextResponse.json(
        { error: "PIN must be 4-8 characters" },
        { status: 400 },
      );
    }

    if (!currentPassword) {
      return NextResponse.json(
        { error: "Current password is required" },
        { status: 400 },
      );
    }

    await dbConnect();

    const user = await User.findOne({
      _id: decoded.userId,
      businessId: decoded.businessId,
      isActive: true,
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Verify current password
    const passwordMatch = await bcrypt.compare(currentPassword, user.password);
    if (!passwordMatch) {
      return NextResponse.json(
        { error: "Incorrect password" },
        { status: 403 },
      );
    }

    // Hash and store PIN
    const hashedPin = await bcrypt.hash(pin, 10);
    await User.updateOne(
      { _id: user._id },
      { $set: { internalPin: hashedPin } },
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Set PIN error:", error);
    return NextResponse.json({ error: "Failed to set PIN" }, { status: 500 });
  }
}

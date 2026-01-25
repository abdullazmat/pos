import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db/connect";
import User from "@/lib/models/User";
import bcrypt from "bcryptjs";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  try {
    await dbConnect();

    const { token, password } = await req.json();

    console.log(
      "Reset password attempt - Token received:",
      token ? "Yes" : "No",
    );
    console.log("Token length:", token?.length);

    if (!token || !password) {
      return NextResponse.json(
        { error: "Token and password are required" },
        { status: 400 },
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters" },
        { status: 400 },
      );
    }

    // Hash the token to compare with stored hash
    const resetTokenHash = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    console.log("Looking for token hash:", resetTokenHash);
    console.log("Current time:", new Date());

    // Find user with valid token
    const user = await User.findOne({
      resetPasswordToken: resetTokenHash,
      resetPasswordExpires: { $gt: new Date() },
    });

    console.log("User found:", user ? "Yes" : "No");

    if (user) {
      console.log("Token expires at:", user.resetPasswordExpires);
      console.log(
        "Time remaining:",
        user.resetPasswordExpires
          ? (user.resetPasswordExpires.getTime() - Date.now()) / 1000 / 60 +
              " minutes"
          : "N/A",
      );
    }

    if (!user) {
      // Try to find user with just the token to see if it's an expiration issue
      const expiredUser = await User.findOne({
        resetPasswordToken: resetTokenHash,
      });

      if (expiredUser) {
        console.log(
          "Token found but expired. Expiration was:",
          expiredUser.resetPasswordExpires,
        );
        return NextResponse.json(
          {
            error:
              "Reset token has expired. Please request a new password reset.",
          },
          { status: 400 },
        );
      }

      console.log("Token not found in database at all");
      return NextResponse.json(
        { error: "Invalid or expired reset token" },
        { status: 400 },
      );
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Update password and clear reset token fields
    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    return NextResponse.json({
      success: true,
      message: "Password reset successfully",
    });
  } catch (error) {
    console.error("Reset password error:", error);
    return NextResponse.json({ error: "An error occurred" }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db/connect";
import User from "@/lib/models/User";
import crypto from "crypto";
import { sendPasswordResetEmail } from "@/lib/utils/sendEmail";

export async function POST(req: NextRequest) {
  try {
    await dbConnect();

    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    // Find user by email
    const user = await User.findOne({ email: email.toLowerCase() });

    // For security, always return success even if user doesn't exist
    if (!user) {
      return NextResponse.json({
        success: true,
        message: "If an account exists, a password reset email will be sent",
      });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenHash = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    console.log("Generated token (plain):", resetToken);
    console.log("Generated token hash:", resetTokenHash);
    console.log("Token will expire at:", new Date(Date.now() + 3600000));

    // Set token and expiration (1 hour from now)
    user.resetPasswordToken = resetTokenHash;
    user.resetPasswordExpires = new Date(Date.now() + 3600000); // 1 hour
    await user.save();

    console.log("Token saved to database for user:", user.email);

    // Generate reset URL
    const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/auth/reset-password?token=${resetToken}`;

    // Send password reset email
    try {
      await sendPasswordResetEmail(email, resetUrl, user.fullName);
      console.log("Password reset email sent successfully to:", email);
    } catch (emailError) {
      console.error("Failed to send password reset email:", emailError);
      // Continue anyway - don't reveal if email failed for security
    }

    return NextResponse.json({
      success: true,
      message: "If an account exists, a password reset email will be sent",
      // Remove this in production - only for development
      ...(process.env.NODE_ENV === "development" && { resetUrl }),
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    return NextResponse.json({ error: "An error occurred" }, { status: 500 });
  }
}

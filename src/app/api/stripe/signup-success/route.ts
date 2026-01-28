import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import dbConnect from "@/lib/db/connect";
import User from "@/lib/models/User";
import Business from "@/lib/models/Business";
import Plan from "@/lib/models/Plan";
import Subscription from "@/lib/models/Subscription";
import { hashPassword } from "@/lib/utils/password";
import { createAccessToken, createRefreshToken } from "@/lib/utils/jwt";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const sessionId = searchParams.get("session_id");

    if (!sessionId) {
      return NextResponse.redirect(
        new URL("/auth/register?error=missing_session", req.url),
      );
    }

    // Retrieve the checkout session
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status !== "paid") {
      return NextResponse.redirect(
        new URL("/auth/register?error=payment_failed", req.url),
      );
    }

    const { email, fullName, password, plan } = session.metadata || {};

    if (!email || !fullName || !password) {
      return NextResponse.redirect(
        new URL("/auth/register?error=invalid_metadata", req.url),
      );
    }

    await dbConnect();

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.redirect(
        new URL("/auth/login?message=account_exists", req.url),
      );
    }

    const hashedPassword = await hashPassword(password);

    // Get the paid plan
    const paidPlan = await Plan.findOne({ name: "pro" });
    if (!paidPlan) {
      return NextResponse.redirect(
        new URL("/auth/register?error=plan_not_found", req.url),
      );
    }

    // Create user
    const newUser = new User({
      email,
      password: hashedPassword,
      fullName,
      role: "admin",
      isActive: true,
      businessId: null,
    });

    // Create business
    const business = new Business({
      name: fullName + "'s Business",
      owner: newUser._id,
      email,
    });

    newUser.businessId = business._id;

    // Create subscription
    const subscription = new Subscription({
      businessId: business._id,
      planId: paidPlan._id,
      status: "active",
      stripeSubscriptionId: session.subscription as string,
      stripeCustomerId: session.customer as string,
      currentPeriodStart: new Date(),
      currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    });

    await newUser.save();
    await business.save();
    await subscription.save();

    business.subscriptionId = subscription._id;
    await business.save();

    // Create tokens
    const accessToken = createAccessToken({
      userId: newUser._id.toString(),
      businessId: business._id.toString(),
      email: newUser.email,
      role: newUser.role,
    });

    const refreshToken = createRefreshToken({
      userId: newUser._id.toString(),
      businessId: business._id.toString(),
      email: newUser.email,
      role: newUser.role,
    });

    // Create response with redirect
    const response = NextResponse.redirect(new URL("/dashboard", req.url));

    // Set tokens in cookies
    response.cookies.set("accessToken", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 15 * 60, // 15 minutes
    });

    response.cookies.set("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 7 * 24 * 60 * 60, // 7 days
    });

    return response;
  } catch (error) {
    console.error("Signup success error:", error);
    return NextResponse.redirect(
      new URL("/auth/register?error=server_error", req.url),
    );
  }
}

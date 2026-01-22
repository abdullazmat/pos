import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import dbConnect from "@/lib/db/connect";
import Subscription from "@/lib/models/Subscription";
import User from "@/lib/models/User";

export async function GET(req: NextRequest) {
  try {
    const sessionId = req.nextUrl.searchParams.get("session_id");

    if (!sessionId) {
      return NextResponse.redirect(
        new URL("/upgrade?error=no_session", req.nextUrl.origin)
      );
    }

    // Retrieve the session from Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (!session) {
      return NextResponse.redirect(
        new URL("/upgrade?error=session_not_found", req.nextUrl.origin)
      );
    }

    await dbConnect();

    // Update subscription to professional plan
    const userId = session.metadata?.userId;
    if (userId) {
      // Update subscription
      await Subscription.findOneAndUpdate(
        { businessId: userId },
        {
          planId: "PROFESSIONAL",
          status: "active",
          stripeCustomerId: session.customer as string,
          stripeSubscriptionId: session.subscription as string,
          currentPeriodStart: new Date(),
          currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        },
        { upsert: true }
      );

      // Also update user if needed
      await User.findByIdAndUpdate(userId, { plan: "PROFESSIONAL" });
    }

    // Redirect to success page
    return NextResponse.redirect(
      new URL(`/upgrade-success?session_id=${sessionId}`, req.nextUrl.origin)
    );
  } catch (error) {
    console.error("Stripe success handler error:", error);
    return NextResponse.redirect(
      new URL("/upgrade?error=processing_failed", req.nextUrl.origin)
    );
  }
}

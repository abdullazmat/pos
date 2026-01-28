import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import dbConnect from "@/lib/db/connect";
import Subscription from "@/lib/models/Subscription";
import User from "@/lib/models/User";
import { getPlanConfig } from "@/lib/services/subscriptions/PlanConfig";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const sessionId = req.nextUrl.searchParams.get("session_id");

    if (!sessionId) {
      return NextResponse.redirect(
        new URL("/upgrade?error=no_session", req.nextUrl.origin),
      );
    }

    // Retrieve the session from Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (!session) {
      return NextResponse.redirect(
        new URL("/upgrade?error=session_not_found", req.nextUrl.origin),
      );
    }

    await dbConnect();

    // Update subscription to professional plan using business metadata
    const businessId = session.metadata?.businessId;
    const planId = (session.metadata?.planId as string) || "PROFESSIONAL";
    const planConfig = getPlanConfig(planId) || getPlanConfig("PROFESSIONAL");

    if (businessId && planConfig) {
      const now = new Date();
      const nextMonth = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

      await Subscription.findOneAndUpdate(
        { businessId },
        {
          planId: planConfig.id,
          status: "active",
          stripeCustomerId: session.customer as string,
          stripeSubscriptionId: session.subscription as string,
          currentPeriodStart: now,
          currentPeriodEnd: nextMonth,
          provider: "stripe",
          autoRenew: true,
          features: planConfig.features,
        },
        { upsert: true },
      );

      // Also tag the owning user to the plan (best-effort)
      const userId = session.metadata?.userId;
      if (userId) {
        await User.findByIdAndUpdate(userId, { plan: planConfig.id });
      }
    }

    // Redirect to success page
    return NextResponse.redirect(
      new URL(`/upgrade-success?session_id=${sessionId}`, req.nextUrl.origin),
    );
  } catch (error) {
    console.error("Stripe success handler error:", error);
    return NextResponse.redirect(
      new URL("/upgrade?error=processing_failed", req.nextUrl.origin),
    );
  }
}

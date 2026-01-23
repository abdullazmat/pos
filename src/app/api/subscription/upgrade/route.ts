import { NextRequest } from "next/server";
import dbConnect from "@/lib/db/connect";
import Subscription from "@/lib/models/Subscription";
import { authMiddleware } from "@/lib/middleware/auth";
import {
  generateErrorResponse,
  generateSuccessResponse,
} from "@/lib/utils/helpers";
import {
  getPlanConfig,
  SUBSCRIPTION_PLANS,
} from "@/lib/services/subscriptions/PlanConfig";

export async function POST(req: NextRequest) {
  try {
    const authResult = await authMiddleware(req);
    if (!authResult.authorized) {
      return generateErrorResponse(authResult.error || "Unauthorized", 401);
    }

    const { businessId } = authResult.user!;
    const body = await req.json();
    const { planId } = body;

    // Validate plan against canonical plan list
    const plan = planId ? getPlanConfig(planId) : null;
    if (!plan) {
      return generateErrorResponse("Invalid plan ID", 400);
    }

    await dbConnect();

    const now = new Date();
    const nextMonth = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    // Update or create subscription
    const subscription = await Subscription.findOneAndUpdate(
      { businessId },
      {
        businessId,
        planId,
        status: "active",
        currentPeriodStart: now,
        currentPeriodEnd: nextMonth,
        features: plan.features,
        updatedAt: now,
      },
      { upsert: true, new: true, lean: true },
    );

    return generateSuccessResponse({
      message: `Plan upgraded to ${plan.name}`,
      subscription,
    });
  } catch (error) {
    console.error("Upgrade subscription error:", error);
    return generateErrorResponse("Internal server error", 500);
  }
}

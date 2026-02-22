import { NextRequest } from "next/server";
import dbConnect from "@/lib/db/connect";
import Subscription from "@/lib/models/Subscription";
import { PLAN_FEATURES, PlanType } from "@/lib/utils/planFeatures";

/**
 * Check if user has exceeded a plan limit
 * Used in API endpoints to enforce plan-based restrictions
 */
export async function checkPlanLimit(
  businessId: string,
  limitType:
    | "maxProducts"
    | "maxCategories"
    | "maxClients"
    | "maxSuppliers"
    | "maxUsers",
  currentCount: number
): Promise<{ allowed: boolean; message: string }> {
  try {
    await dbConnect();

    const subscription = await Subscription.findOne({ businessId }).lean();
    if (!subscription) {
      return { allowed: false, message: "No subscription found" };
    }

    const planId = (subscription as any).planId || "BASIC";
    const plan = (planId.toUpperCase() as PlanType) || "BASIC";
    const planConfig = PLAN_FEATURES[plan] || PLAN_FEATURES["BASIC"];

    const limit = planConfig[limitType];
    if (limit === -1) return { allowed: true, message: "Unlimited" };

    if (currentCount >= limit) {
      return {
        allowed: false,
        message: `Has alcanzado el límite de ${limitType} (${limit}) en tu plan`,
      };
    }

    return { allowed: true, message: "Within limit" };
  } catch (error) {
    console.error("Check plan limit error:", error);
    return { allowed: true, message: "Could not verify limit" };
  }
}

/**
 * Check if user has access to a specific feature
 */
export async function checkPlanFeature(
  businessId: string,
  feature: keyof typeof PLAN_FEATURES.free.features
): Promise<{ allowed: boolean; message: string }> {
  try {
    await dbConnect();

    const subscription = await Subscription.findOne({ businessId }).lean();
    if (!subscription) {
      return { allowed: false, message: "No feature access" };
    }

    const planId = (subscription as any).planId || "BASIC";
    const plan = (planId.toUpperCase() as PlanType) || "BASIC";
    const planConfig = PLAN_FEATURES[plan] || PLAN_FEATURES["BASIC"];

    const hasFeature = planConfig.features[feature] || false;
    if (!hasFeature) {
      return {
        allowed: false,
        message: `Feature ${feature} not available in your plan`,
      };
    }

    return { allowed: true, message: "Feature available" };
  } catch (error) {
    console.error("Check plan feature error:", error);
    return { allowed: true, message: "Could not verify feature" };
  }
}


/**
 * Response helper for plan-blocked actions
 */
export function generatePlanBlockedResponse(reason: string) {
  return new Response(
    JSON.stringify({
      error: reason,
      code: "PLAN_LIMIT_EXCEEDED",
    }),
    {
      status: 403,
      headers: { "Content-Type": "application/json" },
    }
  );
}

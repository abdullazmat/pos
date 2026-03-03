import { NextRequest } from "next/server";
import dbConnect from "@/lib/db/connect";
import Subscription, { SubscriptionPlan } from "@/lib/models/Subscription";
import Sale from "@/lib/models/Sale";
import { PLAN_FEATURES, PlanType } from "@/lib/utils/planFeatures";
/**
 * Count sales for the current calendar month
 */
export async function countMonthlySales(businessId: string): Promise<number> {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  const end = new Date(
    now.getFullYear(),
    now.getMonth() + 1,
    0,
    23,
    59,
    59,
    999
  );

  return await Sale.countDocuments({
    businessId,
    createdAt: { $gte: start, $lte: end },
  });
}

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
    | "maxUsers"
    | "maxSalesPerMonth"
    | "maxPaymentMethods",
  currentCount?: number
): Promise<{ allowed: boolean; message: string; limit?: number }> {
  try {
    await dbConnect();

    const subscription = await Subscription.findOne({ businessId }).lean();
    if (!subscription) {
      return { allowed: false, message: "No subscription found" };
    }

    const planId = (subscription as any).planId || SubscriptionPlan.BASIC;
    const plan = (planId.toUpperCase() as PlanType) || "BASIC";
    const planConfig = PLAN_FEATURES[plan] || PLAN_FEATURES["BASIC"];

    // Use provided count or fetch if needed
    let count = currentCount;
    if (count === undefined) {
      if (limitType === "maxSalesPerMonth") {
        count = await countMonthlySales(businessId);
      } else {
        // For other limits, we should ideally fetch them here if not provided, 
        // but current implementation expects them to be passed.
        // Defaulting to 0 if not provided for safety (incorrect but avoids crash)
        count = 0; 
      }
    }

    const limit = planConfig[limitType] as number;
    if (limit === -1 || limit === 999999) return { allowed: true, message: "Unlimited", limit };

    if (count >= limit) {
      let limitName = limitType.replace("max", "").toLowerCase();
      if (limitType === "maxSalesPerMonth") limitName = "ventas mensuales";
      
      return {
        allowed: false,
        message: `Has alcanzado el límite de ${limitName} (${limit}) en tu plan actual.`,
        limit
      };
    }

    return { allowed: true, message: "Within limit", limit };
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
  feature: string
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
        message: `Esta funcionalidad no está disponible en el plan ${planConfig.name}. Por favor, actualiza tu plan para acceder.`,
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
export function generatePlanBlockedResponse(reason: string, limitReached?: boolean) {
  return new Response(
    JSON.stringify({
      error: reason,
      code: "PLAN_LIMIT_EXCEEDED",
      upgradeOption: true,
      limitReached: limitReached === true
    }),
    {
      status: 403,
      headers: { "Content-Type": "application/json" },
    }
  );
}

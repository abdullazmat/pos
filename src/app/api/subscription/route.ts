import { NextRequest } from "next/server";
import dbConnect from "@/lib/db/connect";
import Subscription from "@/lib/models/Subscription";
import { authMiddleware } from "@/lib/middleware/auth";
import { getPlanConfig } from "@/lib/services/subscriptions/PlanConfig";
import {
  generateErrorResponse,
  generateSuccessResponse,
} from "@/lib/utils/helpers";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const authResult = await authMiddleware(req);
    if (!authResult.authorized) {
      return generateErrorResponse(authResult.error || "Unauthorized", 401);
    }

    const { businessId } = authResult.user!;
    await dbConnect();

    let subscription = await Subscription.findOne({ businessId });

    const basicPlan = getPlanConfig("BASIC");

    // If no subscription exists, create a default FREE plan subscription
    if (!subscription) {
      const newSub = new Subscription({
        businessId,
        planId: "BASIC",
        status: "active",
        currentPeriodStart: new Date(),
        currentPeriodEnd: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        features: basicPlan
          ? {
              maxProducts: basicPlan.features.maxProducts,
              maxUsers: basicPlan.features.maxUsers,
              maxCategories: basicPlan.features.maxCategories,
              maxClients: basicPlan.features.maxClients,
              maxSuppliers: basicPlan.features.maxSuppliers,
              arcaIntegration: basicPlan.features.arcaIntegration,
              advancedReporting: basicPlan.features.advancedReporting,
              customBranding: basicPlan.features.customBranding,
              invoiceChannels: basicPlan.features.invoiceChannels,
            }
          : undefined,
      });
      await newSub.save();
      subscription = newSub;
    }

    const now = new Date();
    const isExpired = subscription.currentPeriodEnd < now;

    if (isExpired && basicPlan) {
      subscription.planId = "BASIC";
      subscription.status = "active";
      subscription.provider = undefined;
      subscription.currentPeriodStart = now;
      subscription.currentPeriodEnd = new Date(
        Date.now() + 365 * 24 * 60 * 60 * 1000,
      );
      subscription.features = {
        maxProducts: basicPlan.features.maxProducts,
        maxUsers: basicPlan.features.maxUsers,
        maxCategories: basicPlan.features.maxCategories,
        maxClients: basicPlan.features.maxClients,
        maxSuppliers: basicPlan.features.maxSuppliers,
        arcaIntegration: basicPlan.features.arcaIntegration,
        advancedReporting: basicPlan.features.advancedReporting,
        customBranding: basicPlan.features.customBranding,
        invoiceChannels: basicPlan.features.invoiceChannels,
      };
      await subscription.save();
    }

    return generateSuccessResponse({ subscription });
  } catch (error) {
    console.error("Get subscription error:", error);
    return generateErrorResponse("Internal server error", 500);
  }
}

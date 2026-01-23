import { NextRequest } from "next/server";
import dbConnect from "@/lib/db/connect";
import Subscription from "@/lib/models/Subscription";
import { authMiddleware } from "@/lib/middleware/auth";
import {
  generateErrorResponse,
  generateSuccessResponse,
} from "@/lib/utils/helpers";

const PLANS = {
  FREE: {
    id: "FREE",
    name: "Gratuito",
    price: 0,
    features: {
      maxProducts: 100,
      maxCategories: 10,
      maxClients: 0,
      maxSuppliers: 5,
      maxUsers: 2,
      arcaIntegration: false,
      advancedReporting: false,
      customBranding: false,
      invoiceChannels: 1,
      apiAccess: false,
    },
  },
  PRO: {
    id: "PRO",
    name: "Pro",
    price: 19990,
    features: {
      maxProducts: 999999,
      maxCategories: 999999,
      maxClients: 999999,
      maxSuppliers: 999999,
      maxUsers: 999999,
      arcaIntegration: true,
      advancedReporting: true,
      customBranding: true,
      invoiceChannels: 5,
      apiAccess: true,
    },
  },
};

export async function POST(req: NextRequest) {
  try {
    const authResult = await authMiddleware(req);
    if (!authResult.authorized) {
      return generateErrorResponse(authResult.error || "Unauthorized", 401);
    }

    const { businessId } = authResult.user!;
    const body = await req.json();
    const { planId } = body;

    // Validate plan
    if (!planId || !PLANS[planId as keyof typeof PLANS]) {
      return generateErrorResponse("Invalid plan ID", 400);
    }

    await dbConnect();

    const plan = PLANS[planId as keyof typeof PLANS];
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

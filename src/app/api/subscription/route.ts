import { NextRequest } from "next/server";
import dbConnect from "@/lib/db/connect";
import Subscription from "@/lib/models/Subscription";
import { authMiddleware } from "@/lib/middleware/auth";
import {
  generateErrorResponse,
  generateSuccessResponse,
} from "@/lib/utils/helpers";

export async function GET(req: NextRequest) {
  try {
    const authResult = await authMiddleware(req);
    if (!authResult.authorized) {
      return generateErrorResponse(authResult.error || "Unauthorized", 401);
    }

    const { businessId } = authResult.user!;
    await dbConnect();

    let subscription = await Subscription.findOne({ businessId }).lean();

    // If no subscription exists, create a default FREE plan subscription
    if (!subscription) {
      const newSub = new Subscription({
        businessId,
        planId: "BASIC",
        status: "active",
        currentPeriodStart: new Date(),
        currentPeriodEnd: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        features: {
          maxProducts: 100,
          maxCategories: 10,
          maxClients: 0,
          maxSuppliers: 5,
          maxUsers: 1,
          arcaIntegration: false,
          advancedReporting: false,
          customBranding: false,
          invoiceChannels: 1,
        },
      });
      await newSub.save();
      subscription = newSub.toObject();
    }

    return generateSuccessResponse({ subscription });
  } catch (error) {
    console.error("Get subscription error:", error);
    return generateErrorResponse("Internal server error", 500);
  }
}

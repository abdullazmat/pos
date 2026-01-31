import { NextResponse } from "next/server";
import dbConnect from "@/lib/db/connect";
import Subscription from "@/lib/models/Subscription";
import { getPlanConfig } from "@/lib/services/subscriptions/PlanConfig";
import { verifyToken } from "@/lib/utils/jwt";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const token = request.headers.get("authorization")?.split(" ")[1];
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    await dbConnect();

    const subscription = await Subscription.findOne({
      businessId: decoded.businessId,
    });

    if (!subscription) {
      return NextResponse.json({
        subscription: null,
        message: "No active subscription",
      });
    }

    // Check if subscription has expired and downgrade to BASIC
    const now = new Date();
    const isExpired = subscription.currentPeriodEnd < now;

    if (isExpired) {
      const basicPlan = getPlanConfig("BASIC");
      if (basicPlan) {
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
      } else if (subscription.status === "active") {
        subscription.status = "expired";
      }

      await subscription.save();
    }

    return NextResponse.json({
      subscription: {
        id: subscription._id,
        planId: subscription.planId,
        status: subscription.status,
        features: subscription.features,
        currentPeriodStart: subscription.currentPeriodStart,
        currentPeriodEnd: subscription.currentPeriodEnd,
        isExpired,
      },
    });
  } catch (error) {
    console.error("Get subscription status error:", error);
    return NextResponse.json(
      { error: "Failed to fetch subscription status" },
      { status: 500 },
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db/connect";
import Subscription from "@/lib/models/Subscription";
import { getPlanConfig } from "@/lib/services/subscriptions/PlanConfig";
import { verifyToken } from "@/lib/utils/jwt";

/**
 * GET /api/subscriptions/status
 * Get current subscription status for the business
 */
export async function GET(request: NextRequest) {
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
      const basicPlan = getPlanConfig("BASIC");
      return NextResponse.json(
        {
          planId: "BASIC",
          status: "active",
          features: basicPlan?.features || {
            maxProducts: 100,
            maxUsers: 1,
            maxCategories: 10,
            maxClients: 10,
            maxSuppliers: 5,
            arcaIntegration: false,
            advancedReporting: false,
            customBranding: false,
            invoiceChannels: 1,
          },
          currentPeriodStart: new Date(),
          currentPeriodEnd: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
          isPremium: false,
        },
        { status: 200 },
      );
    }

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
      } else {
        subscription.status = "expired";
      }

      await subscription.save();
    }
    if (!isExpired) {
      const planConfig = getPlanConfig(subscription.planId);
      if (planConfig) {
        subscription.features = {
          maxProducts: planConfig.features.maxProducts,
          maxUsers: planConfig.features.maxUsers,
          maxCategories: planConfig.features.maxCategories,
          maxClients: planConfig.features.maxClients,
          maxSuppliers: planConfig.features.maxSuppliers,
          arcaIntegration: planConfig.features.arcaIntegration,
          advancedReporting: planConfig.features.advancedReporting,
          customBranding: planConfig.features.customBranding,
          invoiceChannels: planConfig.features.invoiceChannels,
        };
        await subscription.save();
      }
    }

    return NextResponse.json({
      planId: subscription.planId,
      status: subscription.status,
      features: subscription.features,
      provider: subscription.provider,
      currentPeriodStart: subscription.currentPeriodStart,
      currentPeriodEnd: subscription.currentPeriodEnd,
      isPremium: subscription.planId !== "BASIC",
    });
  } catch (error) {
    console.error("Get subscription error:", error);
    return NextResponse.json(
      { error: "Failed to get subscription status" },
      { status: 500 },
    );
  }
}

/**
 * PUT /api/subscriptions/status
 * Update subscription status (used by webhooks)
 */
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { businessId, planId, status, provider, features } = body;

    if (!businessId || !planId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    await dbConnect();

    const subscription = await Subscription.findOneAndUpdate(
      { businessId },
      {
        planId,
        status: status || "active",
        provider: provider || "mercado_pago",
        features: features || {},
        currentPeriodStart: new Date(),
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      },
      { new: true, upsert: true },
    );

    return NextResponse.json({
      message: "Subscription updated successfully",
      subscription,
    });
  } catch (error) {
    console.error("Update subscription error:", error);
    return NextResponse.json(
      { error: "Failed to update subscription" },
      { status: 500 },
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db/connect";
import { verifyToken } from "@/lib/utils/jwt";
import Subscription from "@/lib/models/Subscription";
import Product from "@/lib/models/Product";
import Client from "@/lib/models/Client";

export const dynamic = "force-dynamic";

/**
 * GET /api/subscription/limits
 * Get current usage and limits for the business
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

    // Get subscription
    const subscription = await Subscription.findOne({
      businessId: decoded.businessId,
    });

    if (!subscription) {
      return NextResponse.json(
        { error: "No subscription found" },
        { status: 404 },
      );
    }

    // Get current counts
    const productCount = await Product.countDocuments({
      business: decoded.businessId,
    });
    const clientCount = await Client.countDocuments({
      business: decoded.businessId,
    });

    const { features } = subscription;

    return NextResponse.json({
      subscription: {
        planId: subscription.planId,
        status: subscription.status,
        isPremium: subscription.planId !== "BASIC",
      },
      limits: {
        products: {
          current: productCount,
          max: features.maxProducts,
          remaining: Math.max(0, features.maxProducts - productCount),
          reached: productCount >= features.maxProducts,
        },
        clients: {
          current: clientCount,
          max: features.maxClients,
          remaining: Math.max(0, features.maxClients - clientCount),
          reached: clientCount >= features.maxClients,
        },
        categories: {
          max: features.maxCategories,
        },
        suppliers: {
          max: features.maxSuppliers,
        },
        users: {
          max: features.maxUsers,
        },
      },
      features: {
        advancedReporting: features.advancedReporting,
        arcaIntegration: features.arcaIntegration,
        customBranding: features.customBranding,
        invoiceChannels: features.invoiceChannels,
      },
    });
  } catch (error) {
    console.error("Get limits error:", error);
    return NextResponse.json(
      { error: "Failed to get subscription limits" },
      { status: 500 },
    );
  }
}

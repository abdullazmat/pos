import { NextResponse } from "next/server";
import dbConnect from "@/lib/db/connect";
import Subscription from "@/lib/models/Subscription";
import { verifyToken } from "@/lib/utils/jwt";

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

    // Check if subscription has expired
    const now = new Date();
    const isExpired = subscription.currentPeriodEnd < now;

    if (isExpired && subscription.status === "active") {
      subscription.status = "expired";
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
      { status: 500 }
    );
  }
}

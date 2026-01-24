import { NextRequest } from "next/server";
import dbConnect from "@/lib/db/connect";
import Subscription from "@/lib/models/Subscription";
import {
  generateErrorResponse,
  generateSuccessResponse,
} from "@/lib/utils/helpers";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { data } = body;

    if (!data || !data.id) {
      return generateErrorResponse("Invalid webhook payload", 400);
    }

    await dbConnect();

    // In production, you would verify the payment with Mercado Pago API
    // For now, we'll process the webhook data directly

    const paymentId = data.id;
    const externalReference = data.external_reference;

    if (!externalReference) {
      return generateErrorResponse("Missing external reference", 400);
    }

    const [businessId, plan] = externalReference.split("-");

    // Find and update subscription
    const subscription = await Subscription.findOne({
      businessId,
      plan,
      mercadopagoPaymentId: paymentId,
    });

    if (!subscription) {
      // Create new subscription if it doesn't exist
      const preferenceId = data.preference_id;
      const existingSubscription = await Subscription.findOne({
        businessId,
        mercadopagoPreferenceId: preferenceId,
      });

      if (!existingSubscription) {
        return generateErrorResponse("Subscription not found", 404);
      }

      existingSubscription.mercadopagoPaymentId = paymentId;
      existingSubscription.status =
        data.status === "approved" ? "active" : "failed";
      existingSubscription.paymentDate = new Date();

      if (data.status === "approved") {
        // Calculate subscription dates
        const now = new Date();
        const expiresAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 days
        existingSubscription.expiresAt = expiresAt;
      }

      await existingSubscription.save();
    } else {
      subscription.status = data.status === "approved" ? "active" : "failed";
      subscription.paymentDate = new Date();

      if (data.status === "approved") {
        const now = new Date();
        const expiresAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
        subscription.expiresAt = expiresAt;
      }

      await subscription.save();
    }

    return generateSuccessResponse({ status: "received" });
  } catch (error) {
    console.error("Mercado Pago webhook error:", error);
    return generateErrorResponse("Internal server error", 500);
  }
}

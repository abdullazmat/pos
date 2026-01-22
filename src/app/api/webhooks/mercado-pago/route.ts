import { NextResponse } from "next/server";
import dbConnect from "@/lib/db/connect";
import Payment from "@/lib/models/Payment";
import Subscription from "@/lib/models/Subscription";
import mercadoPagoService from "@/lib/services/payment/MercadoPagoService";
import { getPlanConfig } from "@/lib/services/subscriptions/PlanConfig";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    console.log("Mercado Pago webhook received:", {
      type: body.type,
      action: body.action,
      dataId: body.data?.id,
    });

    // Validate webhook
    if (!mercadoPagoService.validateWebhook(body, "")) {
      console.warn("Invalid webhook signature");
      return NextResponse.json({ error: "Invalid webhook" }, { status: 400 });
    }

    // Extract payment info
    const paymentInfo = mercadoPagoService.extractPaymentInfo(body);
    if (!paymentInfo) {
      return NextResponse.json(
        { error: "Unable to extract payment info" },
        { status: 400 }
      );
    }

    await dbConnect();

    // Find payment by preference ID or external reference
    let payment = await Payment.findOne({
      preferenceId: paymentInfo.externalReference,
    });

    if (!payment) {
      payment = await Payment.findOne({
        business: paymentInfo.externalReference,
      });
    }

    if (!payment) {
      console.error("Payment not found for webhook:", paymentInfo);
      return NextResponse.json({ error: "Payment not found" }, { status: 404 });
    }

    // Update payment status
    const statusMap: Record<string, any> = {
      approved: "APPROVED",
      pending: "PENDING",
      rejected: "REJECTED",
      cancelled: "CANCELLED",
    };

    payment.status = statusMap[paymentInfo.status] || "PENDING";
    payment.providerTransactionId = paymentInfo.transactionId;

    // If payment approved, create/activate subscription
    if (payment.status === "APPROVED") {
      const planConfig = getPlanConfig(payment.planId);
      if (!planConfig) {
        console.error("Plan config not found:", payment.planId);
        return NextResponse.json({ error: "Plan not found" }, { status: 404 });
      }

      const startDate = new Date();
      const endDate = new Date();
      endDate.setMonth(endDate.getMonth() + 1); // 1 month subscription

      // Create or update subscription
      let subscription = await Subscription.findOne({
        businessId: payment.business,
      });

      if (subscription) {
        subscription.planId = payment.planId;
        subscription.status = "active";
        subscription.provider = "mercado_pago";
        subscription.mercadoPagoCustomerId = paymentInfo.externalReference;
        subscription.currentPeriodStart = startDate;
        subscription.currentPeriodEnd = endDate;
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
      } else {
        subscription = await Subscription.create({
          businessId: payment.business,
          planId: payment.planId,
          status: "active",
          provider: "mercado_pago",
          mercadoPagoCustomerId: paymentInfo.externalReference,
          currentPeriodStart: startDate,
          currentPeriodEnd: endDate,
          autoRenew: false,
          features: {
            maxProducts: planConfig.features.maxProducts,
            maxUsers: planConfig.features.maxUsers,
            maxCategories: planConfig.features.maxCategories,
            maxClients: planConfig.features.maxClients,
            maxSuppliers: planConfig.features.maxSuppliers,
            arcaIntegration: planConfig.features.arcaIntegration,
            advancedReporting: planConfig.features.advancedReporting,
            customBranding: planConfig.features.customBranding,
            invoiceChannels: planConfig.features.invoiceChannels,
          },
        });
      }

      payment.startDate = startDate;
      payment.endDate = endDate;

      console.log("Subscription activated:", {
        businessId: payment.business,
        planId: payment.planId,
        endDate: endDate,
      });
    }

    await payment.save();

    return NextResponse.json({
      success: true,
      message: "Webhook processed successfully",
    });
  } catch (error) {
    console.error("Webhook processing error:", error);
    return NextResponse.json(
      {
        error: "Webhook processing failed",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

// GET endpoint for testing webhook
export async function GET(request: Request) {
  return NextResponse.json({
    message: "Mercado Pago webhook endpoint",
    method: "POST",
  });
}

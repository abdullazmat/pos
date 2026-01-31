import { NextResponse } from "next/server";
import dbConnect from "@/lib/db/connect";
import Payment from "@/lib/models/Payment";
import Subscription from "@/lib/models/Subscription";
import mercadoPagoService from "@/lib/services/payment/MercadoPagoService";
import { getPlanConfig } from "@/lib/services/subscriptions/PlanConfig";
import { verifyToken } from "@/lib/utils/jwt";

export async function POST(request: Request) {
  try {
    const token = request.headers.get("authorization")?.split(" ")[1];
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const body = await request.json();
    const { paymentId, preferenceId } = body || {};

    if (!paymentId) {
      return NextResponse.json(
        { error: "Missing required field: paymentId" },
        { status: 400 },
      );
    }

    await dbConnect();

    let payment = null;
    if (preferenceId) {
      payment = await Payment.findOne({ preferenceId });
    }

    if (!payment) {
      payment = await Payment.findOne({
        business: decoded.businessId,
        provider: "MERCADO_PAGO",
      }).sort({ createdAt: -1 });
    }

    if (!payment) {
      return NextResponse.json({ error: "Payment not found" }, { status: 404 });
    }

    if (payment.business.toString() !== decoded.businessId.toString()) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const paymentStatus = await mercadoPagoService.getPaymentById(paymentId);

    payment.status = paymentStatus.status;
    payment.providerTransactionId = paymentStatus.transactionId;

    if (payment.status === "APPROVED") {
      const planConfig = getPlanConfig(payment.planId);
      if (!planConfig) {
        return NextResponse.json({ error: "Plan not found" }, { status: 404 });
      }

      const startDate = new Date();
      const endDate = new Date();
      endDate.setMonth(endDate.getMonth() + 1);

      let subscription = await Subscription.findOne({
        businessId: payment.business,
      });

      if (subscription) {
        subscription.planId = payment.planId;
        subscription.status = "active";
        subscription.provider = "mercado_pago";
        subscription.mercadoPagoCustomerId = payment.business.toString();
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
          mercadoPagoCustomerId: payment.business.toString(),
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
    }

    await payment.save();

    return NextResponse.json({
      status: payment.status,
      transactionId: payment.providerTransactionId,
      amount: payment.amount,
      currency: payment.currency,
    });
  } catch (error) {
    console.error("Verify payment error:", error);
    return NextResponse.json(
      {
        error: "Failed to verify payment",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
}

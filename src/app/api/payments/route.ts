import { NextResponse } from "next/server";
import dbConnect from "@/lib/db/connect";
import mercadoPagoService from "@/lib/services/payment/MercadoPagoService";
import { getPlanConfig } from "@/lib/services/subscriptions/PlanConfig";
import Payment from "@/lib/models/Payment";
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
    const { planId, email, businessName } = body;

    if (!planId || !email || !businessName) {
      return NextResponse.json(
        { error: "Missing required fields: planId, email, businessName" },
        { status: 400 }
      );
    }

    const planConfig = getPlanConfig(planId);
    if (!planConfig || planConfig.price === 0) {
      return NextResponse.json(
        { error: "Invalid or unavailable plan" },
        { status: 400 }
      );
    }

    // Create Mercado Pago preference
    const preference = await mercadoPagoService.createPaymentPreference({
      businessName,
      planName: planConfig.name,
      amount: planConfig.price,
      currency: planConfig.currency,
      email,
      metadata: {
        businessId: decoded.businessId.toString(),
        planId,
        userId: decoded.userId,
      },
    });

    await dbConnect();

    // Store payment record
    const payment = await Payment.create({
      business: decoded.businessId,
      planId,
      provider: "MERCADO_PAGO",
      preferenceId: preference.id,
      paymentLink: preference.preferenceLink,
      status: "PENDING",
      amount: planConfig.price,
      currency: planConfig.currency,
    });

    return NextResponse.json({
      payment: {
        id: payment._id,
        preferenceLink: preference.preferenceLink,
        qrCode: preference.qrCode,
        amount: planConfig.price,
        planName: planConfig.name,
      },
      message: "Payment preference created successfully",
    });
  } catch (error) {
    console.error("Create payment error:", error);
    return NextResponse.json(
      {
        error: "Failed to create payment",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

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

    const payments = await Payment.find({ business: decoded.businessId })
      .sort({ createdAt: -1 })
      .limit(50);

    return NextResponse.json({ payments });
  } catch (error) {
    console.error("Get payments error:", error);
    return NextResponse.json(
      { error: "Failed to fetch payments" },
      { status: 500 }
    );
  }
}

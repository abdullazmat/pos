import { NextRequest } from "next/server";
import dbConnect from "@/lib/db/connect";
import Subscription from "@/lib/models/Subscription";
import User from "@/lib/models/User";
import { authMiddleware } from "@/lib/middleware/auth";
import {
  generateErrorResponse,
  generateSuccessResponse,
} from "@/lib/utils/helpers";

if (!process.env.MERCADO_PAGO_ACCESS_TOKEN) {
  throw new Error("MERCADO_PAGO_ACCESS_TOKEN is not defined");
}

export async function POST(req: NextRequest) {
  try {
    const authResult = await authMiddleware(req);
    if (!authResult.authorized) {
      return generateErrorResponse(authResult.error || "Unauthorized", 401);
    }

    const { userId, businessId } = authResult.user!;
    const body = await req.json();
    const { plan } = body;

    if (!plan || !["pro"].includes(plan)) {
      return generateErrorResponse("Invalid plan", 400);
    }

    await dbConnect();

    const user = await User.findById(userId);
    if (!user) {
      return generateErrorResponse("User not found", 404);
    }

    // Create Mercado Pago preference
    const preference = {
      items: [
        {
          title: `Plan Pro - POS Cloud`,
          description: "Acceso completo a todas las funciones",
          quantity: 1,
          currency_id: "ARS",
          unit_price: 24990,
        },
      ],
      payer: {
        email: user.email,
        name: user.name,
      },
      back_urls: {
        success: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/subscribe/mercadopago/success`,
        failure: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/subscribe/mercadopago/failure`,
        pending: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/subscribe/mercadopago/pending`,
      },
      notification_url: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/payment/mercadopago/webhook`,
      external_reference: `${businessId}-${plan}`,
      auto_return: "approved",
    };

    // For now, return a mock response
    // In production, you would call Mercado Pago API
    const mockPreferenceId = `PREF_${Date.now()}`;
    const mockInitPoint = `https://www.mercadopago.com/checkout/v1/redirect?pref_id=${mockPreferenceId}`;

    // Store preference ID for webhook handling
    const subscription = new Subscription({
      businessId,
      userId,
      plan,
      status: "pending",
      paymentMethod: "mercadopago",
      mercadopagoPreferenceId: mockPreferenceId,
    });

    await subscription.save();

    return generateSuccessResponse({
      preference_id: mockPreferenceId,
      init_point: mockInitPoint,
      sandbox_init_point: mockInitPoint.replace(
        "mercadopago.com",
        "sandbox.mercadopago.com",
      ),
    });
  } catch (error) {
    console.error("Mercado Pago error:", error);
    return generateErrorResponse("Internal server error", 500);
  }
}

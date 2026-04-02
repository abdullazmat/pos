import { NextRequest } from "next/server";
import dbConnect from "@/lib/db/connect";
import Subscription from "@/lib/models/Subscription";
import User from "@/lib/models/User";
import { authMiddleware } from "@/lib/middleware/auth";
import {
  generateErrorResponse,
  generateSuccessResponse,
} from "@/lib/utils/helpers";
import { createMercadoPagoPreference } from "@/lib/mercadopago";

export async function POST(req: NextRequest) {
  try {
    if (!process.env.MERCADO_PAGO_ACCESS_TOKEN) {
      return generateErrorResponse(
        "MERCADO_PAGO_ACCESS_TOKEN is not configured",
        500,
      );
    }

    const authResult = await authMiddleware(req);
    if (!authResult.authorized) {
      return generateErrorResponse(authResult.error || "Unauthorized", 401);
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL;
    if (!appUrl) {
      return generateErrorResponse(
        "NEXT_PUBLIC_APP_URL is not configured",
        500,
      );
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

    const preference = await createMercadoPagoPreference(
      [
        {
          title: "Plan Pro - POS Cloud",
          description: "Acceso completo a todas las funciones",
          quantity: 1,
          unit_price: 24990,
          currency_id: "ARS",
        },
      ],
      user.email,
      user.name,
      `${businessId}-${plan}`,
      {
        success: `${appUrl}/subscribe/mercadopago/success`,
        failure: `${appUrl}/subscribe/mercadopago/failure`,
        pending: `${appUrl}/subscribe/mercadopago/pending`,
      },
      `${appUrl}/api/payment/mercadopago/webhook`,
    );

    // Store preference ID for webhook handling
    const subscription = new Subscription({
      businessId,
      userId,
      plan,
      status: "pending",
      paymentMethod: "mercadopago",
      mercadopagoPreferenceId: preference.id,
    });

    await subscription.save();

    return generateSuccessResponse({
      preference_id: preference.id,
      init_point: preference.init_point,
      sandbox_init_point: preference.sandbox_init_point,
    });
  } catch (error) {
    console.error("Mercado Pago error:", error);
    return generateErrorResponse(
      `Payment preference creation failed: ${error instanceof Error ? error.message : "Unknown error"}`,
      500,
    );
  }
}

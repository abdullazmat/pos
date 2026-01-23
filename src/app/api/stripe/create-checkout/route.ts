import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { verifyAccessToken } from "@/lib/utils/jwt";
import {
  generateErrorResponse,
  generateSuccessResponse,
} from "@/lib/utils/helpers";

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      return generateErrorResponse("Unauthorized", 401);
    }

    const token = authHeader.split(" ")[1];
    const decoded = verifyAccessToken(token);
    if (!decoded) {
      return generateErrorResponse("Invalid token", 401);
    }

    const { email, fullName } = await req.json();

    if (!email || !fullName) {
      return generateErrorResponse("Missing required fields", 400);
    }

    const planId = "PROFESSIONAL"; // Stripe checkout is for Pro plan

    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: "Plan Pro POS SaaS",
              description:
                "Productos ilimitados, reportes avanzados y soporte prioritario",
            },
            unit_amount: 2900, // $29.00
            recurring: {
              interval: "month",
            },
          },
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: `${
        process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
      }/api/stripe/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${
        process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
      }/upgrade?canceled=true`,
      customer_email: email,
      metadata: {
        email,
        fullName,
        planId,
        userId: decoded.userId,
        businessId: decoded.businessId,
      },
    });

    return generateSuccessResponse({ sessionId: session.id, url: session.url });
  } catch (error: any) {
    console.error("Stripe checkout error:", error);
    return generateErrorResponse(
      error.message || "Failed to create checkout session",
      500,
    );
  }
}

import { NextRequest } from "next/server";
import { stripe } from "@/lib/stripe";
import {
  generateErrorResponse,
  generateSuccessResponse,
} from "@/lib/utils/helpers";

export async function POST(req: NextRequest) {
  try {
    const { email, fullName, password, plan } = await req.json();

    if (!email || !fullName || !password || !plan) {
      return generateErrorResponse("Missing required fields", 400);
    }

    if (plan !== "paid") {
      return generateErrorResponse("Invalid plan selection", 400);
    }

    // Create Stripe Checkout Session for signup
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
      }/api/stripe/signup-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${
        process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
      }/auth/register?canceled=true`,
      customer_email: email,
      metadata: {
        email,
        fullName,
        password, // Will be hashed on success
        plan,
        isSignup: "true",
      },
    });

    return generateSuccessResponse({ sessionId: session.id, url: session.url });
  } catch (error: any) {
    console.error("Stripe checkout error:", error);
    return generateErrorResponse(
      error.message || "Failed to create checkout session",
      500
    );
  }
}

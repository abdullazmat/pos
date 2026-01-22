import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import dbConnect from "@/lib/db/connect";
import Subscription from "@/lib/models/Subscription";
import { getPlanConfig } from "@/lib/services/subscriptions/PlanConfig";
import Business from "@/lib/models/Business";

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || "";

export async function POST(req: NextRequest) {
  try {
    const body = await req.text();
    const signature = req.headers.get("stripe-signature");

    if (!signature) {
      return NextResponse.json(
        { error: "No signature found" },
        { status: 400 },
      );
    }

    let event;
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err: any) {
      console.error("Webhook signature verification failed:", err.message);
      return NextResponse.json(
        { error: `Webhook Error: ${err.message}` },
        { status: 400 },
      );
    }

    await dbConnect();

    // Handle the event
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as any;
        console.log("Checkout session completed:", session.id);

        // Get the business ID from metadata
        const businessId = session.metadata?.businessId;
        if (businessId) {
          // Find or create subscription
          const business = await Business.findById(businessId);
          if (business) {
            const planId = session.metadata?.planId || "PROFESSIONAL";
            const planConfig = getPlanConfig(planId);

            if (planConfig) {
              await Subscription.findOneAndUpdate(
                { businessId },
                {
                  planId: planId as any,
                  status: "active",
                  provider: "stripe",
                  stripeSubscriptionId: session.subscription || session.id,
                  stripeCustomerId: session.customer,
                  currentPeriodStart: new Date(),
                  currentPeriodEnd: new Date(
                    Date.now() + 30 * 24 * 60 * 60 * 1000,
                  ), // 30 days
                  features: planConfig.features as any,
                  autoRenew: true,
                },
                { upsert: true, new: true },
              );
            }
          }
        }
        break;
      }

      case "customer.subscription.created":
      case "customer.subscription.updated": {
        const subscription = event.data.object as any;
        console.log("Subscription event:", event.type, subscription.id);

        // Find subscription by Stripe ID
        let sub = await Subscription.findOne({
          stripeSubscriptionId: subscription.id,
        });

        if (sub) {
          const planConfig = getPlanConfig(sub.planId);
          if (planConfig) {
            await Subscription.findByIdAndUpdate(sub._id, {
              status: subscription.status === "active" ? "active" : "inactive",
              currentPeriodStart: new Date(
                subscription.current_period_start * 1000,
              ),
              currentPeriodEnd: new Date(
                subscription.current_period_end * 1000,
              ),
              features: planConfig.features as any,
            });
          }
        }
        break;
      }

      case "customer.subscription.deleted": {
        const deletedSub = event.data.object as any;
        await Subscription.findOneAndUpdate(
          { stripeSubscriptionId: deletedSub.id },
          { status: "cancelled", autoRenew: false },
        );
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as any;
        if (invoice.subscription) {
          await Subscription.findOneAndUpdate(
            { stripeSubscriptionId: invoice.subscription as string },
            {
              status: "past_due",
              failedPayments: { $inc: 1 },
            },
          );
        }
        break;
      }

      case "invoice.payment_succeeded": {
        const invoice = event.data.object as any;
        if (invoice.subscription) {
          await Subscription.findOneAndUpdate(
            { stripeSubscriptionId: invoice.subscription as string },
            {
              status: "active",
              failedPayments: 0,
            },
          );
        }
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 500 },
    );
  }
}

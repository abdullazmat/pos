import { Schema, model, Document, models } from "mongoose";

export enum SubscriptionPlan {
  BASIC = "BASIC",
  ESENCIAL = "ESENCIAL",
  PROFESIONAL = "PROFESIONAL",
  CRECIMIENTO = "CRECIMIENTO",
}

export interface ISubscription extends Document {
  businessId: Schema.Types.ObjectId;
  planId: SubscriptionPlan;
  status: "active" | "inactive" | "cancelled" | "expired" | "past_due";

  // Payment provider info
  provider: "stripe" | "mercado_pago";
  stripeSubscriptionId?: string;
  stripeCustomerId?: string;
  mercadoPagoCustomerId?: string;

  // Dates
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  canceledAt?: Date;

  // Subscription settings
  failedPayments: number;
  autoRenew: boolean;

  // Plan features
  features: {
    maxProducts: number;
    maxUsers: number;
    maxCategories: number;
    maxClients: number;
    maxSuppliers: number;
    arcaIntegration: boolean;
    advancedReporting: boolean;
    customBranding: boolean;
    invoiceChannels: number;
  };

  createdAt: Date;
  updatedAt: Date;
}

const subscriptionSchema = new Schema<ISubscription>(
  {
    businessId: {
      type: Schema.Types.ObjectId,
      ref: "Business",
      required: true,
      unique: true,
    },
    planId: {
      type: String,
      enum: Object.values(SubscriptionPlan),
      required: true,
    },
    status: {
      type: String,
      enum: ["active", "inactive", "cancelled", "expired", "past_due"],
      default: "inactive",
    },

    provider: {
      type: String,
      enum: ["stripe", "mercado_pago"],
    },
    stripeSubscriptionId: String,
    stripeCustomerId: String,
    mercadoPagoCustomerId: String,

    currentPeriodStart: {
      type: Date,
      required: true,
    },
    currentPeriodEnd: {
      type: Date,
      required: true,
    },
    canceledAt: Date,

    failedPayments: {
      type: Number,
      default: 0,
    },
    autoRenew: {
      type: Boolean,
      default: true,
    },

    features: {
      maxProducts: { type: Number, default: 500 },
      maxUsers: { type: Number, default: 2 },
      maxCategories: { type: Number, default: 50 },
      maxClients: { type: Number, default: 0 },
      maxSuppliers: { type: Number, default: 10 },
      arcaIntegration: { type: Boolean, default: false },
      advancedReporting: { type: Boolean, default: false },
      customBranding: { type: Boolean, default: false },
      invoiceChannels: { type: Number, default: 1 },
    },
  },
  {
    timestamps: true,
  },
);

subscriptionSchema.index({ businessId: 1 });

export default models.Subscription ||
  model<ISubscription>("Subscription", subscriptionSchema);

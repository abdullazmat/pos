import mongoose, { Document, Schema } from "mongoose";

export enum SubscriptionPlan {
  BASIC = "BASIC",
  PROFESSIONAL = "PROFESSIONAL",
  ENTERPRISE = "ENTERPRISE",
}

export enum PaymentProvider {
  MERCADO_PAGO = "MERCADO_PAGO",
  STRIPE = "STRIPE",
}

export interface IPayment extends Document {
  business: Schema.Types.ObjectId;
  planId: SubscriptionPlan;
  provider: PaymentProvider;
  providerTransactionId?: string; // Mercado Pago ID

  status: "PENDING" | "APPROVED" | "REJECTED" | "CANCELLED";
  amount: number;
  currency: string;

  // Mercado Pago specific
  preferenceId?: string; // MP preference ID
  paymentLink?: string; // MP checkout link

  // Subscription dates
  startDate?: Date;
  endDate?: Date;
  autoRenew: boolean;

  // Metadata
  metadata?: Record<string, any>;

  createdAt: Date;
  updatedAt: Date;
}

const PaymentSchema = new Schema<IPayment>(
  {
    business: {
      type: Schema.Types.ObjectId,
      ref: "Business",
      required: true,
    },
    planId: {
      type: String,
      enum: Object.values(SubscriptionPlan),
      required: true,
    },
    provider: {
      type: String,
      enum: Object.values(PaymentProvider),
      required: true,
    },
    providerTransactionId: String,

    status: {
      type: String,
      enum: ["PENDING", "APPROVED", "REJECTED", "CANCELLED"],
      default: "PENDING",
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    currency: {
      type: String,
      default: "ARS",
    },

    // Mercado Pago
    preferenceId: String,
    paymentLink: String,

    // Subscription
    startDate: Date,
    endDate: Date,
    autoRenew: {
      type: Boolean,
      default: false,
    },

    metadata: Schema.Types.Mixed,
  },
  {
    timestamps: true,
  }
);

// Indexes
PaymentSchema.index({ business: 1, status: 1 });
PaymentSchema.index({ business: 1, provider: 1 });
PaymentSchema.index({ providerTransactionId: 1 });
PaymentSchema.index({ preferenceId: 1 });

export default mongoose.models.Payment ||
  mongoose.model<IPayment>("Payment", PaymentSchema);

import { Schema, model, Document, models } from "mongoose";

export type PaymentOrderAuditAction = "CREATE" | "CONFIRM" | "CANCEL";

export interface IPaymentOrderAudit extends Document {
  businessId: Schema.Types.ObjectId;
  paymentOrderId: Schema.Types.ObjectId;
  action: PaymentOrderAuditAction;
  actionDescription: string;
  userId: Schema.Types.ObjectId;
  userEmail?: string;
  ipAddress?: string;
  timestamp: Date;
  metadata?: Record<string, any>;
}

const paymentOrderAuditSchema = new Schema<IPaymentOrderAudit>(
  {
    businessId: {
      type: Schema.Types.ObjectId,
      ref: "Business",
      required: true,
    },
    paymentOrderId: {
      type: Schema.Types.ObjectId,
      ref: "PaymentOrder",
      required: true,
    },
    action: {
      type: String,
      enum: ["CREATE", "CONFIRM", "CANCEL"],
      required: true,
    },
    actionDescription: {
      type: String,
      required: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    userEmail: String,
    ipAddress: String,
    timestamp: {
      type: Date,
      default: Date.now,
    },
    metadata: Schema.Types.Mixed,
  },
  {
    timestamps: { createdAt: false, updatedAt: false },
  },
);

paymentOrderAuditSchema.index({ businessId: 1, timestamp: -1 });
paymentOrderAuditSchema.index({ paymentOrderId: 1, timestamp: -1 });

export default models.PaymentOrderAudit ||
  model<IPaymentOrderAudit>("PaymentOrderAudit", paymentOrderAuditSchema);

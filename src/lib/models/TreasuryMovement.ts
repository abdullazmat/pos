import { Schema, model, Document, models } from "mongoose";

export type TreasuryMovementType = "EGRESO" | "INGRESO";

export interface ITreasuryMovement extends Document {
  businessId: Schema.Types.ObjectId;
  type: TreasuryMovementType;
  referenceType: "PAYMENT_ORDER";
  referenceId: Schema.Types.ObjectId;
  method: "cash" | "transfer" | "mercadopago" | "check" | "card";
  amount: number;
  description: string;
  createdBy: Schema.Types.ObjectId;
  createdAt: Date;
}

const treasuryMovementSchema = new Schema<ITreasuryMovement>(
  {
    businessId: {
      type: Schema.Types.ObjectId,
      ref: "Business",
      required: true,
    },
    type: {
      type: String,
      enum: ["EGRESO", "INGRESO"],
      required: true,
    },
    referenceType: {
      type: String,
      enum: ["PAYMENT_ORDER"],
      required: true,
    },
    referenceId: {
      type: Schema.Types.ObjectId,
      required: true,
    },
    method: {
      type: String,
      enum: ["cash", "transfer", "mercadopago", "check", "card"],
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    description: {
      type: String,
      required: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  },
);

treasuryMovementSchema.index({ businessId: 1, createdAt: -1 });

treasuryMovementSchema.index({ businessId: 1, referenceId: 1 });

export default models.TreasuryMovement ||
  model<ITreasuryMovement>("TreasuryMovement", treasuryMovementSchema);

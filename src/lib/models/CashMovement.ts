import { Schema, model, Document, models } from "mongoose";

export interface ICashMovement extends Document {
  businessId: Schema.Types.ObjectId;
  cashRegisterId: Schema.Types.ObjectId;
  type: "apertura" | "cierre" | "venta" | "retiro" | "nota_credito";
  description: string;
  amount: number;
  createdBy: Schema.Types.ObjectId;
  notes?: string;
  createdAt: Date;
}

const cashMovementSchema = new Schema<ICashMovement>(
  {
    businessId: {
      type: Schema.Types.ObjectId,
      ref: "Business",
      required: true,
    },
    cashRegisterId: {
      type: Schema.Types.ObjectId,
      ref: "CashRegister",
      required: true,
    },
    type: {
      type: String,
      enum: ["apertura", "cierre", "venta", "retiro", "nota_credito"],
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    notes: String,
  },
  {
    timestamps: true,
  }
);

cashMovementSchema.index({ businessId: 1, cashRegisterId: 1 });
cashMovementSchema.index({ createdAt: -1 });

export default models.CashMovement ||
  model<ICashMovement>("CashMovement", cashMovementSchema);

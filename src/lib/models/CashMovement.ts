import { Schema, model, Document, models } from "mongoose";

export interface ICashMovementOperator {
  user_id: Schema.Types.ObjectId;
  visible_name: string;
  role: "cashier" | "supervisor" | "admin";
  session_id: string;
}

export interface ICashMovementApprover {
  user_id: Schema.Types.ObjectId;
  visible_name: string;
  role: "cashier" | "supervisor" | "admin";
}

export interface ICashMovement extends Document {
  businessId: Schema.Types.ObjectId;
  cashRegisterId: Schema.Types.ObjectId;
  type: "apertura" | "cierre" | "venta" | "retiro" | "nota_credito" | "ingreso";
  description: string;
  amount: number;
  createdBy: Schema.Types.ObjectId;
  operator: ICashMovementOperator;
  approvedBy?: ICashMovementApprover;
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
      enum: [
        "apertura",
        "cierre",
        "venta",
        "retiro",
        "nota_credito",
        "ingreso",
      ],
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
    operator: {
      user_id: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
      visible_name: {
        type: String,
        required: true,
      },
      role: {
        type: String,
        enum: ["cashier", "supervisor", "admin"],
        required: true,
      },
      session_id: {
        type: String,
        required: true,
      },
    },
    approvedBy: {
      user_id: {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
      visible_name: {
        type: String,
      },
      role: {
        type: String,
        enum: ["cashier", "supervisor", "admin"],
      },
    },
  },
  {
    timestamps: true,
  },
);

cashMovementSchema.index({ businessId: 1, cashRegisterId: 1 });
cashMovementSchema.index({ createdAt: -1 });

export default models.CashMovement ||
  model<ICashMovement>("CashMovement", cashMovementSchema);

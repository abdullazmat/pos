import { Schema, model, Document, models } from "mongoose";

export interface ICashRegister extends Document {
  businessId: Schema.Types.ObjectId;
  openedBy: Schema.Types.ObjectId;
  openingBalance: number;
  currentBalance: number;
  status: "open" | "closed";
  openedAt: Date;
  closedAt?: Date;
  closedBy?: Schema.Types.ObjectId;
  closingBalance?: number;
  salesTotal?: number;
  withdrawalsTotal?: number;
  creditNotesTotal?: number;
  depositsTotal?: number;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const cashRegisterSchema = new Schema<ICashRegister>(
  {
    businessId: {
      type: Schema.Types.ObjectId,
      ref: "Business",
      required: true,
    },
    openedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    openingBalance: {
      type: Number,
      required: true,
      default: 0,
    },
    currentBalance: {
      type: Number,
      required: true,
      default: 0,
    },
    status: {
      type: String,
      enum: ["open", "closed"],
      default: "open",
    },
    openedAt: {
      type: Date,
      default: () => new Date(),
    },
    closedAt: Date,
    closedBy: Schema.Types.ObjectId,
    closingBalance: Number,
    salesTotal: {
      type: Number,
      default: 0,
    },
    withdrawalsTotal: {
      type: Number,
      default: 0,
    },
    creditNotesTotal: {
      type: Number,
      default: 0,
    },
    depositsTotal: {
      type: Number,
      default: 0,
    },
    notes: String,
  },
  {
    timestamps: true,
  },
);

cashRegisterSchema.index({ businessId: 1, status: 1 });

export default models.CashRegister ||
  model<ICashRegister>("CashRegister", cashRegisterSchema);

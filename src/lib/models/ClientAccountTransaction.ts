import mongoose, { Document, Schema } from "mongoose";

export type ClientAccountTransactionType = "charge" | "payment" | "adjustment";

export interface IClientAccountTransaction extends Document {
  businessId: Schema.Types.ObjectId;
  clientId: Schema.Types.ObjectId;
  type: ClientAccountTransactionType;
  amount: number;
  currency: string;
  description?: string;
  referenceSaleId?: Schema.Types.ObjectId;
  referenceInvoiceId?: Schema.Types.ObjectId;
  createdBy?: Schema.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const ClientAccountTransactionSchema = new Schema<IClientAccountTransaction>(
  {
    businessId: {
      type: Schema.Types.ObjectId,
      ref: "Business",
      required: true,
    },
    clientId: {
      type: Schema.Types.ObjectId,
      ref: "Client",
      required: true,
    },
    type: {
      type: String,
      enum: ["charge", "payment", "adjustment"],
      required: true,
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
    description: String,
    referenceSaleId: {
      type: Schema.Types.ObjectId,
      ref: "Sale",
    },
    referenceInvoiceId: {
      type: Schema.Types.ObjectId,
      ref: "Invoice",
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  },
);

ClientAccountTransactionSchema.index({ businessId: 1, clientId: 1 });
ClientAccountTransactionSchema.index({ businessId: 1, createdAt: -1 });

export default mongoose.models.ClientAccountTransaction ||
  mongoose.model<IClientAccountTransaction>(
    "ClientAccountTransaction",
    ClientAccountTransactionSchema,
  );

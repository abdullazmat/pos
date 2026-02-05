import { Schema, model, Document, models } from "mongoose";

export type SupplierDocumentType = "INVOICE" | "DEBIT_NOTE" | "CREDIT_NOTE";
export type SupplierDocumentStatus = "OPEN" | "PAID" | "CANCELLED";

export interface ISupplierDocument extends Document {
  businessId: Schema.Types.ObjectId;
  supplierId: Schema.Types.ObjectId;
  type: SupplierDocumentType;
  documentNumber: string;
  date: Date;
  totalAmount: number;
  balance: number;
  status: SupplierDocumentStatus;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const supplierDocumentSchema = new Schema<ISupplierDocument>(
  {
    businessId: {
      type: Schema.Types.ObjectId,
      ref: "Business",
      required: true,
    },
    supplierId: {
      type: Schema.Types.ObjectId,
      ref: "Supplier",
      required: true,
    },
    type: {
      type: String,
      enum: ["INVOICE", "DEBIT_NOTE", "CREDIT_NOTE"],
      required: true,
    },
    documentNumber: {
      type: String,
      required: true,
      trim: true,
    },
    date: {
      type: Date,
      required: true,
      default: Date.now,
    },
    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    balance: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: String,
      enum: ["OPEN", "PAID", "CANCELLED"],
      default: "OPEN",
      required: true,
    },
    notes: String,
  },
  {
    timestamps: true,
  },
);

supplierDocumentSchema.index({ businessId: 1, supplierId: 1, date: -1 });
supplierDocumentSchema.index({ businessId: 1, documentNumber: 1 });

export default models.SupplierDocument ||
  model<ISupplierDocument>("SupplierDocument", supplierDocumentSchema);

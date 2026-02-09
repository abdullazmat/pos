import { Schema, model, Document, models } from "mongoose";

export type SupplierDocumentType = "INVOICE" | "DEBIT_NOTE" | "CREDIT_NOTE";
export type SupplierDocumentStatus =
  | "PENDING"
  | "DUE_SOON"
  | "OVERDUE"
  | "PARTIALLY_APPLIED"
  | "APPLIED"
  | "CANCELLED";

export interface SupplierDocumentAttachment {
  fileName: string;
  fileUrl: string;
  mimeType: string;
  fileSize: number;
  uploadedAt: Date;
}

export interface ISupplierDocument extends Document {
  businessId: Schema.Types.ObjectId;
  supplierId: Schema.Types.ObjectId;
  type: SupplierDocumentType;
  pointOfSale?: string;
  documentNumber: string;
  date: Date;
  dueDate?: Date;
  totalAmount: number;
  balance: number;
  appliedPaymentsTotal: number;
  appliedCreditsTotal: number;
  status: SupplierDocumentStatus;
  notes?: string;
  attachments?: SupplierDocumentAttachment[];
  cancelledAt?: Date;
  cancelledBy?: Schema.Types.ObjectId;
  cancelReason?: string;
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
    pointOfSale: {
      type: String,
      trim: true,
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
    dueDate: {
      type: Date,
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
    appliedPaymentsTotal: {
      type: Number,
      default: 0,
      min: 0,
    },
    appliedCreditsTotal: {
      type: Number,
      default: 0,
      min: 0,
    },
    status: {
      type: String,
      enum: [
        "PENDING",
        "DUE_SOON",
        "OVERDUE",
        "PARTIALLY_APPLIED",
        "APPLIED",
        "CANCELLED",
      ],
      default: "PENDING",
      required: true,
    },
    notes: String,
    attachments: {
      type: [
        {
          fileName: String,
          fileUrl: String,
          mimeType: String,
          fileSize: Number,
          uploadedAt: Date,
        },
      ],
      default: [],
    },
    cancelledAt: Date,
    cancelledBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    cancelReason: String,
  },
  {
    timestamps: true,
  },
);

supplierDocumentSchema.index({ businessId: 1, supplierId: 1, date: -1 });
supplierDocumentSchema.index({ businessId: 1, documentNumber: 1 });
supplierDocumentSchema.index({ businessId: 1, status: 1, dueDate: 1 });

export default models.SupplierDocument ||
  model<ISupplierDocument>("SupplierDocument", supplierDocumentSchema);

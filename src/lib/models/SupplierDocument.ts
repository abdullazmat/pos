import { Schema, model, Document, models } from "mongoose";

export type SupplierDocumentType =
  | "INVOICE"
  | "INVOICE_A"
  | "INVOICE_B"
  | "INVOICE_C"
  | "DEBIT_NOTE"
  | "CREDIT_NOTE"
  | "FISCAL_DELIVERY_NOTE";

export type SupplierDocumentChannel = 1 | 2;

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
  channel: SupplierDocumentChannel;
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
  impactsStock: boolean;
  impactsCosts: boolean;
  notes?: string;
  attachments?: SupplierDocumentAttachment[];
  cancelledAt?: Date;
  cancelledBy?: Schema.Types.ObjectId;
  cancelReason?: string;
  createdBy?: Schema.Types.ObjectId;
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
    channel: {
      type: Number,
      enum: [1, 2],
      default: 1,
      required: true,
    },
    type: {
      type: String,
      enum: [
        "INVOICE",
        "INVOICE_A",
        "INVOICE_B",
        "INVOICE_C",
        "DEBIT_NOTE",
        "CREDIT_NOTE",
        "FISCAL_DELIVERY_NOTE",
      ],
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
    impactsStock: {
      type: Boolean,
      default: true,
    },
    impactsCosts: {
      type: Boolean,
      default: true,
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
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  },
);

supplierDocumentSchema.index({ businessId: 1, supplierId: 1, date: -1 });
supplierDocumentSchema.index({ businessId: 1, documentNumber: 1 });
supplierDocumentSchema.index({ businessId: 1, status: 1, dueDate: 1 });
supplierDocumentSchema.index({ businessId: 1, channel: 1 });

export default models.SupplierDocument ||
  model<ISupplierDocument>("SupplierDocument", supplierDocumentSchema);

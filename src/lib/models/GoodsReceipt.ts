import { Schema, model, Document, models } from "mongoose";

export type ReceiptDocumentType =
  | "INVOICE_A"
  | "INVOICE_B"
  | "INVOICE_C"
  | "DELIVERY_NOTE"
  | "RECEIPT"
  | "OTHER";

export type ReceiptStatus =
  | "DRAFT"
  | "CONFIRMED"
  | "PENDING_BILLING"
  | "BILLED"
  | "CANCELLED";

export interface IGoodsReceiptItem {
  productId: Schema.Types.ObjectId;
  productName: string;
  productCode: string;
  quantity: number;
  unitCost: number;
  subtotal: number;
  lot?: string;
  expirationDate?: Date;
}

export interface IGoodsReceipt extends Document {
  businessId: Schema.Types.ObjectId;
  supplierId: Schema.Types.ObjectId;
  documentType: ReceiptDocumentType;
  documentNumber: string;
  documentDate: Date;
  receiptDate: Date;
  notes?: string;
  receivingUserId: Schema.Types.ObjectId;
  receivingUserEmail: string;
  items: IGoodsReceiptItem[];
  totalAmount: number;
  totalItems: number;
  status: ReceiptStatus;
  supplierBillId?: Schema.Types.ObjectId;
  cancelledAt?: Date;
  cancelledBy?: Schema.Types.ObjectId;
  cancelReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

const goodsReceiptItemSchema = new Schema<IGoodsReceiptItem>(
  {
    productId: {
      type: Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    productName: {
      type: String,
      required: true,
    },
    productCode: {
      type: String,
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 0.0001,
    },
    unitCost: {
      type: Number,
      required: true,
      min: 0,
    },
    subtotal: {
      type: Number,
      required: true,
      min: 0,
    },
    lot: String,
    expirationDate: Date,
  },
  { _id: false },
);

const goodsReceiptSchema = new Schema<IGoodsReceipt>(
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
    documentType: {
      type: String,
      enum: [
        "INVOICE_A",
        "INVOICE_B",
        "INVOICE_C",
        "DELIVERY_NOTE",
        "RECEIPT",
        "OTHER",
      ],
      required: true,
    },
    documentNumber: {
      type: String,
      required: true,
      trim: true,
    },
    documentDate: {
      type: Date,
      required: true,
    },
    receiptDate: {
      type: Date,
      required: true,
      default: Date.now,
    },
    notes: String,
    receivingUserId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    receivingUserEmail: {
      type: String,
      required: true,
    },
    items: {
      type: [goodsReceiptItemSchema],
      required: true,
      validate: {
        validator: (v: IGoodsReceiptItem[]) => v.length > 0,
        message: "Receipt must have at least one item",
      },
    },
    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    totalItems: {
      type: Number,
      required: true,
      min: 1,
    },
    status: {
      type: String,
      enum: ["DRAFT", "CONFIRMED", "PENDING_BILLING", "BILLED", "CANCELLED"],
      default: "DRAFT",
      required: true,
    },
    supplierBillId: {
      type: Schema.Types.ObjectId,
      ref: "SupplierDocument",
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

goodsReceiptSchema.index({ businessId: 1, createdAt: -1 });
goodsReceiptSchema.index({ businessId: 1, supplierId: 1 });
goodsReceiptSchema.index(
  { businessId: 1, supplierId: 1, documentNumber: 1 },
  { unique: true },
);
goodsReceiptSchema.index({ businessId: 1, status: 1 });

export default models.GoodsReceipt ||
  model<IGoodsReceipt>("GoodsReceipt", goodsReceiptSchema);

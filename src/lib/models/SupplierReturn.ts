import { Schema, model, Document, models } from "mongoose";

export type SupplierReturnType = "PHYSICAL_RETURN" | "ECONOMIC_ADJUSTMENT";

export type SupplierReturnStatus = "DRAFT" | "CONFIRMED" | "CANCELLED";

export type SupplierReturnReason =
  | "EXPIRED"
  | "DAMAGED"
  | "WRONG_DELIVERY"
  | "QUALITY_ISSUE"
  | "EXCESS_STOCK"
  | "BONUS_DISCOUNT"
  | "PRICE_ADJUSTMENT"
  | "OTHER";

export interface ISupplierReturnItem {
  productId: Schema.Types.ObjectId;
  productName: string;
  productCode: string;
  quantity: number;
  unitCost: number;
  subtotal: number;
}

export interface ISupplierReturn extends Document {
  businessId: Schema.Types.ObjectId;
  supplierId: Schema.Types.ObjectId;
  date: Date;
  returnType: SupplierReturnType;
  reason: SupplierReturnReason;
  notes?: string;
  physicalStockExit: boolean;
  receiptId?: Schema.Types.ObjectId;
  supplierBillId?: Schema.Types.ObjectId;
  creditNoteId?: Schema.Types.ObjectId;
  creditNoteNumber?: string;
  creditNoteDate?: Date;
  documentNumber: string;
  items: ISupplierReturnItem[];
  totalAmount: number;
  totalItems: number;
  status: SupplierReturnStatus;
  createdByUserId: Schema.Types.ObjectId;
  createdByEmail: string;
  cancelledAt?: Date;
  cancelledBy?: Schema.Types.ObjectId;
  cancelReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

const supplierReturnItemSchema = new Schema<ISupplierReturnItem>(
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
  },
  { _id: false },
);

const supplierReturnSchema = new Schema<ISupplierReturn>(
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
    date: {
      type: Date,
      required: true,
      default: Date.now,
    },
    returnType: {
      type: String,
      enum: ["PHYSICAL_RETURN", "ECONOMIC_ADJUSTMENT"],
      required: true,
    },
    reason: {
      type: String,
      enum: [
        "EXPIRED",
        "DAMAGED",
        "WRONG_DELIVERY",
        "QUALITY_ISSUE",
        "EXCESS_STOCK",
        "BONUS_DISCOUNT",
        "PRICE_ADJUSTMENT",
        "OTHER",
      ],
      required: true,
    },
    notes: String,
    physicalStockExit: {
      type: Boolean,
      required: true,
      default: true,
    },
    receiptId: {
      type: Schema.Types.ObjectId,
      ref: "GoodsReceipt",
    },
    supplierBillId: {
      type: Schema.Types.ObjectId,
      ref: "SupplierDocument",
    },
    creditNoteId: {
      type: Schema.Types.ObjectId,
      ref: "SupplierDocument",
    },
    creditNoteNumber: String,
    creditNoteDate: Date,
    documentNumber: {
      type: String,
      required: true,
      unique: true,
    },
    items: {
      type: [supplierReturnItemSchema],
      required: true,
      validate: {
        validator: (v: ISupplierReturnItem[]) => v.length > 0,
        message: "Return must have at least one item",
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
      enum: ["DRAFT", "CONFIRMED", "CANCELLED"],
      default: "DRAFT",
      required: true,
    },
    createdByUserId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    createdByEmail: {
      type: String,
      required: true,
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

supplierReturnSchema.index({ businessId: 1, createdAt: -1 });
supplierReturnSchema.index({ businessId: 1, supplierId: 1 });
supplierReturnSchema.index({ businessId: 1, receiptId: 1 });
supplierReturnSchema.index({ businessId: 1, status: 1 });

supplierReturnSchema.pre("validate", function (next) {
  if (!this.documentNumber) {
    // Generate a temporary document number if not provided
    // This can be replaced by a more formal sequence later
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 5).toUpperCase();
    this.documentNumber = `RET-${timestamp}-${random}`;
  }
  next();
});

export const SupplierReturn =
  models.SupplierReturn ||
  model<ISupplierReturn>("SupplierReturn", supplierReturnSchema);

export default SupplierReturn;

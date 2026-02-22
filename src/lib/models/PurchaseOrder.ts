import { Schema, model, Document, models } from "mongoose";

export type PurchaseOrderStatus =
  | "DRAFT"
  | "SENT"
  | "PARTIAL"
  | "RECEIVED"
  | "CANCELLED";

export interface IPurchaseOrderItem {
  productId: Schema.Types.ObjectId;
  productName: string;
  productCode: string;
  requestedQuantity: number;
  receivedQuantity: number;
  estimatedCost: number;
  finalCost: number;
  subtotal: number;
  suggestionReason?: string;
}

export interface IPurchaseOrder extends Document {
  businessId: Schema.Types.ObjectId;
  supplierId: Schema.Types.ObjectId;
  orderNumber: string;
  date: Date;
  estimatedDeliveryDate?: Date;
  status: PurchaseOrderStatus;
  items: IPurchaseOrderItem[];
  estimatedTotal: number;
  finalTotal: number;
  notes?: string;
  warehouse?: string;
  budgetLimit?: number;
  createdBy: Schema.Types.ObjectId;
  receivedBy?: Schema.Types.ObjectId;
  receivedAt?: Date;
  cancelledAt?: Date;
  cancelledBy?: Schema.Types.ObjectId;
  cancelReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

const purchaseOrderItemSchema = new Schema<IPurchaseOrderItem>(
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
    requestedQuantity: {
      type: Number,
      required: true,
      min: 0,
    },
    receivedQuantity: {
      type: Number,
      default: 0,
      min: 0,
    },
    estimatedCost: {
      type: Number,
      required: true,
      min: 0,
    },
    finalCost: {
      type: Number,
      default: 0,
      min: 0,
    },
    subtotal: {
      type: Number,
      required: true,
      min: 0,
    },
    suggestionReason: String,
  },
  { _id: false },
);

const purchaseOrderSchema = new Schema<IPurchaseOrder>(
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
    orderNumber: {
      type: String,
      required: true,
      trim: true,
    },
    date: {
      type: Date,
      required: true,
      default: Date.now,
    },
    estimatedDeliveryDate: Date,
    status: {
      type: String,
      enum: ["DRAFT", "SENT", "PARTIAL", "RECEIVED", "CANCELLED"],
      default: "DRAFT",
      required: true,
    },
    items: {
      type: [purchaseOrderItemSchema],
      required: true,
      validate: {
        validator: (v: IPurchaseOrderItem[]) => v.length > 0,
        message: "Purchase order must have at least one item",
      },
    },
    estimatedTotal: {
      type: Number,
      required: true,
      min: 0,
    },
    finalTotal: {
      type: Number,
      default: 0,
      min: 0,
    },
    notes: String,
    warehouse: String,
    budgetLimit: {
      type: Number,
      min: 0,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    receivedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    receivedAt: Date,
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

purchaseOrderSchema.index({ businessId: 1, createdAt: -1 });
purchaseOrderSchema.index({ businessId: 1, supplierId: 1 });
purchaseOrderSchema.index({ businessId: 1, status: 1 });
purchaseOrderSchema.index(
  { businessId: 1, orderNumber: 1 },
  { unique: true },
);

export default models.PurchaseOrder ||
  model<IPurchaseOrder>("PurchaseOrder", purchaseOrderSchema);

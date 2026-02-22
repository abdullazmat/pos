import { Schema, model, Document, models } from "mongoose";

export interface IProductSupplier extends Document {
  businessId: Schema.Types.ObjectId;
  supplierId: Schema.Types.ObjectId;
  productId: Schema.Types.ObjectId;
  supplierCode?: string;
  lastCost: number;
  averageCost: number;
  purchasePresentation: "unit" | "pack" | "box";
  purchaseMultiple: number;
  leadTimeDays: number;
  minimumPurchase: number;
  active: boolean;
  preferredSupplier: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const productSupplierSchema = new Schema<IProductSupplier>(
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
    productId: {
      type: Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    supplierCode: {
      type: String,
      trim: true,
    },
    lastCost: {
      type: Number,
      default: 0,
      min: 0,
    },
    averageCost: {
      type: Number,
      default: 0,
      min: 0,
    },
    purchasePresentation: {
      type: String,
      enum: ["unit", "pack", "box"],
      default: "unit",
    },
    purchaseMultiple: {
      type: Number,
      default: 1,
      min: 1,
    },
    leadTimeDays: {
      type: Number,
      default: 1,
      min: 0,
    },
    minimumPurchase: {
      type: Number,
      default: 1,
      min: 0,
    },
    active: {
      type: Boolean,
      default: true,
    },
    preferredSupplier: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

// Ensure unique product-supplier relationship per business
productSupplierSchema.index(
  { businessId: 1, supplierId: 1, productId: 1 },
  { unique: true },
);
productSupplierSchema.index({ businessId: 1, productId: 1 });
productSupplierSchema.index({ businessId: 1, supplierId: 1 });

export default models.ProductSupplier ||
  model<IProductSupplier>("ProductSupplier", productSupplierSchema);

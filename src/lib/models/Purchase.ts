import { Schema, model, Document, models } from "mongoose";

export interface IPurchase extends Document {
  businessId: Schema.Types.ObjectId;
  productId: Schema.Types.ObjectId;
  quantity: number;
  costPrice: number;
  totalCost: number;
  supplier?: string;
  invoiceNumber?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const purchaseSchema = new Schema<IPurchase>(
  {
    businessId: {
      type: Schema.Types.ObjectId,
      ref: "Business",
      required: true,
    },
    productId: {
      type: Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
    costPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    totalCost: {
      type: Number,
      required: true,
    },
    supplier: String,
    invoiceNumber: String,
    notes: String,
  },
  {
    timestamps: true,
  }
);

purchaseSchema.index({ businessId: 1, createdAt: -1 });

export default models.Purchase || model<IPurchase>("Purchase", purchaseSchema);

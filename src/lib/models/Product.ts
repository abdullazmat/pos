import { Schema, model, Document, models } from "mongoose";

export interface IProduct extends Document {
  name: string;
  code: string;
  barcode?: string;
  description?: string;
  cost: number;
  price: number;
  margin: number;
  stock: number;
  minStock?: number;
  category?: string;
  active: boolean;
  isSoldByWeight: boolean;
  businessId: Schema.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const productSchema = new Schema<IProduct>(
  {
    name: {
      type: String,
      required: true,
    },
    code: {
      type: String,
      required: true,
    },
    barcode: String,
    description: String,
    cost: {
      type: Number,
      required: true,
      min: 0,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    margin: {
      type: Number,
      required: true,
    },
    stock: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    minStock: {
      type: Number,
      default: 0,
      min: 0,
    },
    category: String,
    active: {
      type: Boolean,
      default: true,
    },
    isSoldByWeight: {
      type: Boolean,
      default: false,
    },
    businessId: {
      type: Schema.Types.ObjectId,
      ref: "Business",
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

productSchema.index({ businessId: 1, code: 1 }, { unique: true });
productSchema.index({ businessId: 1, barcode: 1 });

export default models.Product || model<IProduct>("Product", productSchema);

import { Schema, model, Document, models } from "mongoose";
import ProductSequence from "./ProductSequence";

export interface IProduct extends Document {
  name: string;
  internalId: number;
  code: string;
  barcodes?: string[];
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
    internalId: {
      type: Number,
      required: true,
      min: 1,
    },
    code: {
      type: String,
      required: true,
    },
    barcodes: [String],
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

productSchema.pre("validate", async function (next) {
  if (this.internalId || !this.businessId) {
    return next();
  }

  try {
    const sequence = await ProductSequence.findOneAndUpdate(
      { businessId: this.businessId },
      { $inc: { seq: 1 } },
      { new: true, upsert: true, setDefaultsOnInsert: true },
    );

    this.internalId = sequence.seq;
    return next();
  } catch (error) {
    return next(error as Error);
  }
});

productSchema.index({ businessId: 1, code: 1 }, { unique: true });
productSchema.index({ businessId: 1, internalId: 1 }, { unique: true });
productSchema.index({ businessId: 1, barcodes: 1 });

export default models.Product || model<IProduct>("Product", productSchema);

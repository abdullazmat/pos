import { Schema, model, Document, models } from "mongoose";

interface SaleItem {
  productId: Schema.Types.ObjectId;
  productName: string;
  quantity: number;
  unitPrice: number;
  discount: number;
  total: number;
}

export interface ISale extends Document {
  businessId: Schema.Types.ObjectId;
  userId: Schema.Types.ObjectId;
  items: SaleItem[];
  subtotal: number;
  discount: number;
  total: number;
  paymentMethod: "cash" | "card" | "check" | "online";
  paymentStatus: "pending" | "completed" | "failed";
  cashRegisterId?: Schema.Types.ObjectId;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const saleItemSchema = new Schema<SaleItem>(
  {
    productId: {
      type: Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    productName: String,
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
    unitPrice: Number,
    discount: {
      type: Number,
      default: 0,
    },
    total: Number,
  },
  { _id: false }
);

const saleSchema = new Schema<ISale>(
  {
    businessId: {
      type: Schema.Types.ObjectId,
      ref: "Business",
      required: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    items: [saleItemSchema],
    subtotal: Number,
    discount: {
      type: Number,
      default: 0,
    },
    total: Number,
    paymentMethod: {
      type: String,
      enum: ["cash", "card", "check", "online"],
      default: "cash",
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "completed", "failed"],
      default: "completed",
    },
    cashRegisterId: Schema.Types.ObjectId,
    notes: String,
  },
  {
    timestamps: true,
  }
);

saleSchema.index({ businessId: 1, createdAt: -1 });

export default models.Sale || model<ISale>("Sale", saleSchema);

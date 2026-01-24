import { Schema, model, Document, models } from "mongoose";

interface SaleItem {
  productId: Schema.Types.ObjectId;
  productName: string;
  quantity: number; // Supports integers for unit sales and decimals (max 3 places) for weight sales. E.g., 1 for unit, 1.254 for 1.254 kg
  unitPrice: number;
  discount: number;
  total: number;
  isSoldByWeight?: boolean; // Flag to track if this item is weight-based (for validation)
}

export interface ISale extends Document {
  businessId: Schema.Types.ObjectId;
  userId: Schema.Types.ObjectId;
  items: SaleItem[];
  subtotal: number;
  discount: number;
  total: number;
  paymentMethod: "cash" | "card" | "check" | "online" | "bankTransfer" | "qr";
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
      min: 0.001, // Allows both integers and decimals up to 3 places (e.g., 1.254 kg)
      validate: {
        validator: function (value: number) {
          // Check for maximum 3 decimal places
          // Multiply by 1000, round, then check if it equals the result
          return Math.round(value * 1000) / 1000 === value;
        },
        message:
          "Quantity must have a maximum of 3 decimal places (e.g., 1.254)",
      },
    },
    unitPrice: Number,
    discount: {
      type: Number,
      default: 0,
    },
    total: Number,
    isSoldByWeight: {
      type: Boolean,
      default: false,
    },
  },
  { _id: false },
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
      enum: ["cash", "card", "check", "online", "bankTransfer", "qr"],
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
  },
);

saleSchema.index({ businessId: 1, createdAt: -1 });

// Delete the model from cache if it exists to ensure schema updates are applied
if (models.Sale) {
  delete models.Sale;
}

export default model<ISale>("Sale", saleSchema);

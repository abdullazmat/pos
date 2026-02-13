import { Schema, model, Document, models } from "mongoose";

interface SaleItem {
  productId: Schema.Types.ObjectId;
  productName: string;
  quantity: any; // Decimal128 for precision (up to 4 decimals)
  unitPrice: number;
  discount: number;
  total: number;
  isSoldByWeight?: boolean; // Flag to track if this item is weight-based (for validation)
}

export interface ISale extends Document {
  businessId: Schema.Types.ObjectId;
  userId: Schema.Types.ObjectId;
  clientId?: Schema.Types.ObjectId;
  items: SaleItem[];
  subtotal: number;
  tax?: number;
  totalWithTax?: number;
  discount: number;
  total: number;
  paymentMethod:
    | "cash"
    | "card"
    | "check"
    | "online"
    | "bankTransfer"
    | "qr"
    | "mercadopago"
    | "multiple";
  paymentStatus: "pending" | "completed" | "failed" | "partial";
  invoice?: Schema.Types.ObjectId;
  cashRegisterId?: Schema.Types.ObjectId;
  paymentLink?: string;
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
      type: Schema.Types.Decimal128,
      required: true,
      min: 0.0001, // Allows up to 4 decimals (e.g., 1.5600 kg)
      validate: {
        validator: function (value: any) {
          // Accept both string and Decimal128
          const num = typeof value === "string" ? value : value?.toString();
          if (!num) return false;
          // Check for max 4 decimals
          const parts = num.split(".");
          return (
            parts.length === 1 ||
            (parts[1].length >= 3 && parts[1].length <= 4) ||
            parts[1].length === 0 ||
            parts[1].length <= 4
          );
        },
        message:
          "Quantity must have 3 or 4 decimal places (e.g., 1.560 or 1.5600)",
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
    clientId: {
      type: Schema.Types.ObjectId,
      ref: "Client",
    },
    items: [saleItemSchema],
    subtotal: Number,
    tax: {
      type: Number,
      default: 0,
    },
    totalWithTax: Number,
    discount: {
      type: Number,
      default: 0,
    },
    total: Number,
    paymentMethod: {
      type: String,
      enum: [
        "cash",
        "card",
        "check",
        "online",
        "bankTransfer",
        "qr",
        "mercadopago",
        "multiple",
      ],
      default: "cash",
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "completed", "failed", "partial"],
      default: "completed",
    },
    invoice: { type: Schema.Types.ObjectId, ref: "Invoice" },
    cashRegisterId: { type: Schema.Types.ObjectId, ref: "CashRegister" },
    paymentLink: String,
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

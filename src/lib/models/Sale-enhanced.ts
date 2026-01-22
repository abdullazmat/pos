import { Schema, model, Document, models } from "mongoose";

interface SaleItem {
  productId: Schema.Types.ObjectId;
  productName: string;
  quantity: number;
  unitPrice: number;
  discount?: number;
  total: number;
}

export interface ISale extends Document {
  business: Schema.Types.ObjectId;
  user: Schema.Types.ObjectId;
  items: SaleItem[];
  subtotal: number;
  tax: number;
  totalWithTax: number;
  discount: number;
  total: number;
  paymentMethod:
    | "cash"
    | "card"
    | "check"
    | "online"
    | "mercadopago"
    | "multiple";
  paymentStatus: "pending" | "completed" | "failed" | "partial";
  invoice?: Schema.Types.ObjectId; // Reference to Invoice
  cashRegister?: Schema.Types.ObjectId;
  paymentLink?: string; // For Mercado Pago
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
    productName: {
      type: String,
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
    unitPrice: {
      type: Number,
      required: true,
    },
    discount: {
      type: Number,
      default: 0,
    },
    total: {
      type: Number,
      required: true,
    },
  },
  { _id: false }
);

const saleSchema = new Schema<ISale>(
  {
    business: {
      type: Schema.Types.ObjectId,
      ref: "Business",
      required: true,
      index: true,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    items: {
      type: [saleItemSchema],
      required: true,
      validate: {
        validator: function (items: SaleItem[]) {
          return items.length > 0;
        },
        message: "Sale must have at least one item",
      },
    },
    subtotal: {
      type: Number,
      required: true,
    },
    tax: {
      type: Number,
      default: 0,
    },
    totalWithTax: {
      type: Number,
      required: true,
    },
    discount: {
      type: Number,
      default: 0,
    },
    total: {
      type: Number,
      required: true,
    },
    paymentMethod: {
      type: String,
      enum: ["cash", "card", "check", "online", "mercadopago", "multiple"],
      default: "cash",
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "completed", "failed", "partial"],
      default: "pending",
    },
    invoice: {
      type: Schema.Types.ObjectId,
      ref: "Invoice",
    },
    cashRegister: {
      type: Schema.Types.ObjectId,
      ref: "CashRegister",
    },
    paymentLink: {
      type: String,
    },
    notes: {
      type: String,
    },
  },
  { timestamps: true }
);

// Indexes for performance
saleSchema.index({ business: 1, createdAt: -1 });
saleSchema.index({ business: 1, paymentStatus: 1 });
saleSchema.index({ invoice: 1 });
saleSchema.index({ user: 1 });

const Sale = models.Sale || model<ISale>("Sale", saleSchema);

export default Sale;

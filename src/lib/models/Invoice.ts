import mongoose, { Document, Schema } from "mongoose";

export enum InvoiceChannel {
  ARCA = "ARCA",
  INTERNAL = "INTERNAL",
}

export enum InvoiceType {
  SALE = "SALE",
  PURCHASE = "PURCHASE",
}

export interface IInvoice extends Document {
  business: Schema.Types.ObjectId;
  invoiceNumber: string;
  invoiceType: InvoiceType;
  channel: InvoiceChannel;
  reportedToArca: boolean;

  // Customer/Supplier Info
  customerName: string;
  customerCuit?: string; // Required for ARCA
  customerEmail?: string;
  customerPhone?: string;

  // ARCA-specific fields
  ivaType?: "RESPONSABLE_INSCRIPTO" | "MONOTRIBUTISTA" | "NO_CATEGORIZADO";
  arcaStatus?: "PENDING" | "SENT" | "APPROVED" | "REJECTED";

  // Invoice details
  date: Date;
  dueDate?: Date;
  items: Array<{
    productId?: Schema.Types.ObjectId;
    description: string;
    quantity: number;
    unitPrice: number;
    discount?: number;
  }>;

  // Amounts
  subtotal: number;
  taxAmount: number;
  discountAmount: number;
  totalAmount: number;

  // Payment info
  paymentMethod?: string;
  paymentStatus: "PENDING" | "PARTIAL" | "PAID" | "CANCELLED";

  // Notes
  notes?: string;

  createdAt: Date;
  updatedAt: Date;
}

const InvoiceSchema = new Schema<IInvoice>(
  {
    business: {
      type: Schema.Types.ObjectId,
      ref: "Business",
      required: true,
    },
    invoiceNumber: {
      type: String,
      required: true,
      trim: true,
    },
    invoiceType: {
      type: String,
      enum: Object.values(InvoiceType),
      default: InvoiceType.SALE,
    },
    channel: {
      type: String,
      enum: Object.values(InvoiceChannel),
      default: InvoiceChannel.INTERNAL,
    },
    reportedToArca: {
      type: Boolean,
      default: false,
    },

    // Customer/Supplier Info
    customerName: {
      type: String,
      required: true,
    },
    customerCuit: {
      type: String,
      trim: true,
    },
    customerEmail: {
      type: String,
      trim: true,
    },
    customerPhone: {
      type: String,
      trim: true,
    },

    // ARCA-specific
    ivaType: {
      type: String,
      enum: ["RESPONSABLE_INSCRIPTO", "MONOTRIBUTISTA", "NO_CATEGORIZADO"],
    },
    arcaStatus: {
      type: String,
      enum: ["PENDING", "SENT", "APPROVED", "REJECTED"],
      default: "PENDING",
    },

    // Invoice details
    date: {
      type: Date,
      required: true,
      default: Date.now,
    },
    dueDate: Date,
    items: [
      {
        productId: Schema.Types.ObjectId,
        description: {
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
          min: 0,
        },
        discount: {
          type: Number,
          min: 0,
        },
      },
    ],

    // Amounts
    subtotal: {
      type: Number,
      required: true,
      min: 0,
    },
    taxAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    discountAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },

    // Payment
    paymentMethod: String,
    paymentStatus: {
      type: String,
      enum: ["PENDING", "PARTIAL", "PAID", "CANCELLED"],
      default: "PENDING",
    },

    notes: String,
  },
  {
    timestamps: true,
  }
);

// Indexes for efficient querying
InvoiceSchema.index({ business: 1, invoiceNumber: 1 });
InvoiceSchema.index({ business: 1, channel: 1 });
InvoiceSchema.index({ business: 1, date: -1 });
InvoiceSchema.index({ business: 1, reportedToArca: 1, channel: 1 });

export default mongoose.models.Invoice ||
  mongoose.model<IInvoice>("Invoice", InvoiceSchema);

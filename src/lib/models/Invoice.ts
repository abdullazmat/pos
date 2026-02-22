import mongoose, { Document, Schema } from "mongoose";

export enum InvoiceChannel {
  ARCA = "ARCA",
  INTERNAL = "INTERNAL",
  WSFE = "WSFE", // WSFEv1 - Electronic invoicing
}

export enum InvoiceType {
  SALE = "SALE",
  PURCHASE = "PURCHASE",
}

export enum InvoiceStatus {
  DRAFT = "DRAFT",
  PENDING_CAE = "PENDING_CAE", // Awaiting CAE from AFIP
  AUTHORIZED = "AUTHORIZED", // Has valid CAE
  VOIDED = "VOIDED", // Invalidated
  CANCELLED = "CANCELLED", // Cancelled
}

export interface IInvoice extends Document {
  business: Schema.Types.ObjectId;
  invoiceNumber: string;
  invoiceType: InvoiceType;
  channel: InvoiceChannel;
  reportedToArca: boolean;
  status?: InvoiceStatus;

  // Customer/Supplier Info
  customerName: string;
  customerCuit?: string; // Required for ARCA
  customerEmail?: string;
  customerPhone?: string;

  // ARCA-specific fields
  ivaType?:
    | "RESPONSABLE_INSCRIPTO"
    | "MONOTRIBUTISTA"
    | "NO_CATEGORIZADO"
    | "CONSUMIDOR_FINAL"
    | "EXENTO";
  arcaStatus?: "PENDING" | "SENT" | "APPROVED" | "REJECTED";

  // Fiscal/WSFEv1 fields (Electronic Invoicing)
  fiscalData?: {
    // Tipo de Comprobante (Document type code)
    comprobanteTipo?: number; // 1=Factura A, 6=Factura B, 3=NC A, 7=NC B, 8=ND A, 13=ND B

    // CAE (Código de Autorización Electrónica)
    cae?: string;
    caeVto?: string; // CAE expiry date (YYYYMMDD)
    caeNro?: string; // CAE number (13 digits)
    caeStatus?: "PENDING" | "AUTHORIZED" | "REJECTED" | "EXPIRED";

    // Point of sale and consecutive number
    pointOfSale?: number;
    invoiceSequence?: number; // Sequential number for this type at POS

    // Tax breakdown (for Libro IVA)
    taxBreakdown?: Array<{
      taxType: string; // "IVA", "OTROS", etc.
      aliquot: number; // 0, 10.5, 21, etc.
      baseAmount: number;
      taxAmount: number;
    }>;

    // Invoice status tracking
    ivoiceVoid?: boolean; // Whether invoice was voided/invalidated
    ivoiceVoidReason?: string;

    // Request tracking for idempotency
    requestId?: string;
    requestTimestamp?: Date;
    afipResponseTimestamp?: Date;
    afipRequestNumber?: string;
  };

  // Invoice details
  date: Date;
  dueDate?: Date;
  items: Array<{
    productId?: Schema.Types.ObjectId;
    description: string;
    quantity: number;
    unitPrice: number;
    discount?: number;
    // Tax detail per item
    ivaAliquot?: number; // Tax rate for this item
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
    status: {
      type: String,
      enum: Object.values(InvoiceStatus),
      default: InvoiceStatus.DRAFT,
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
      enum: [
        "RESPONSABLE_INSCRIPTO",
        "MONOTRIBUTISTA",
        "NO_CATEGORIZADO",
        "CONSUMIDOR_FINAL",
        "EXENTO",
      ],
    },
    arcaStatus: {
      type: String,
      enum: ["PENDING", "SENT", "APPROVED", "REJECTED"],
      default: "PENDING",
    },

    // Fiscal/WSFEv1
    fiscalData: {
      type: {
        comprobanteTipo: Number,
        cae: String,
        caeVto: String,
        caeNro: String,
        caeStatus: {
          type: String,
          enum: ["PENDING", "AUTHORIZED", "REJECTED", "EXPIRED"],
        },
        pointOfSale: Number,
        invoiceSequence: Number,
        taxBreakdown: [
          {
            taxType: String,
            aliquot: Number,
            baseAmount: Number,
            taxAmount: Number,
          },
        ],
        ivoiceVoid: Boolean,
        ivoiceVoidReason: String,
        requestId: String,
        requestTimestamp: Date,
        afipResponseTimestamp: Date,
        afipRequestNumber: String,
      },
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
          min: 0.001,
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
        ivaAliquot: Number,
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
  },
);

// Indexes for efficient querying
InvoiceSchema.index({ business: 1, invoiceNumber: 1 });
InvoiceSchema.index({ business: 1, channel: 1 });
InvoiceSchema.index({ business: 1, date: -1 });
InvoiceSchema.index({ business: 1, reportedToArca: 1, channel: 1 });
InvoiceSchema.index({ business: 1, status: 1 });
InvoiceSchema.index({ business: 1, "fiscalData.cae": 1 }); // For CAE lookup
InvoiceSchema.index({ business: 1, date: -1, "fiscalData.caeStatus": 1 }); // For fiscal reports

// Force re-registration to pick up schema changes (especially in dev/hot-reload)
if (mongoose.models.Invoice) {
  delete (mongoose.models as any).Invoice;
}
export default mongoose.model<IInvoice>("Invoice", InvoiceSchema);


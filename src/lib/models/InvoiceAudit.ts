import mongoose, { Document, Schema } from "mongoose";

export interface IInvoiceAudit extends Document {
  business: Schema.Types.ObjectId;
  invoice?: Schema.Types.ObjectId;

  // Action tracking
  action:
    | "CREATE"
    | "UPDATE"
    | "DELETE"
    | "CAE_REQUEST"
    | "CAE_RECEIVED"
    | "EXPORT"
    | "VOID";
  actionDescription: string;
  timestamp: Date;

  // User who performed the action
  userId?: Schema.Types.ObjectId;
  userEmail?: string;

  // Report/Export tracking
  reportType?: "LIBRO_VENTAS" | "LIBRO_IVA" | "LIBRO_IVA_DIGITAL" | "RESUMEN";
  reportDateRange?: {
    startDate: Date;
    endDate: Date;
  };

  // File information (for exports)
  exportedFileName?: string;
  exportFormat?: "CSV" | "XLSX" | "TXT";
  exportedRowCount?: number;
  fileHash?: string; // SHA256 hash for validation

  // CAE tracking
  requestId?: string;
  afipResponse?: {
    success: boolean;
    cae?: string;
    caeVto?: string;
    errorCode?: string;
    errorMessage?: string;
  };

  // Additional metadata
  metadata?: Record<string, any>;

  createdAt: Date;
}

const InvoiceAuditSchema = new Schema<IInvoiceAudit>(
  {
    business: {
      type: Schema.Types.ObjectId,
      ref: "Business",
      required: true,
    },
    invoice: {
      type: Schema.Types.ObjectId,
      ref: "Invoice",
    },
    action: {
      type: String,
      enum: [
        "CREATE",
        "UPDATE",
        "DELETE",
        "CAE_REQUEST",
        "CAE_RECEIVED",
        "EXPORT",
        "VOID",
      ],
      required: true,
    },
    actionDescription: {
      type: String,
      required: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
      required: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    userEmail: String,

    reportType: {
      type: String,
      enum: ["LIBRO_VENTAS", "LIBRO_IVA", "LIBRO_IVA_DIGITAL", "RESUMEN"],
    },
    reportDateRange: {
      type: {
        startDate: Date,
        endDate: Date,
      },
    },

    exportedFileName: String,
    exportFormat: {
      type: String,
      enum: ["CSV", "XLSX", "TXT"],
    },
    exportedRowCount: Number,
    fileHash: String,

    requestId: String,
    afipResponse: {
      type: {
        success: Boolean,
        cae: String,
        caeVto: String,
        errorCode: String,
        errorMessage: String,
      },
    },

    metadata: Schema.Types.Mixed,
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  },
);

// Indexes
InvoiceAuditSchema.index({ business: 1, timestamp: -1 });
InvoiceAuditSchema.index({ invoice: 1 });
InvoiceAuditSchema.index({ business: 1, action: 1 });
InvoiceAuditSchema.index({ business: 1, reportType: 1, timestamp: -1 });

export default mongoose.models.InvoiceAudit ||
  mongoose.model<IInvoiceAudit>("InvoiceAudit", InvoiceAuditSchema);

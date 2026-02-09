import { Schema, model, Document, models } from "mongoose";

export type SupplierDocumentAuditAction =
  | "CREATE"
  | "UPDATE"
  | "CANCEL"
  | "APPLY_CREDIT"
  | "APPLY_PAYMENT";

export interface ISupplierDocumentAudit extends Document {
  businessId: Schema.Types.ObjectId;
  documentId: Schema.Types.ObjectId;
  supplierId: Schema.Types.ObjectId;
  action: SupplierDocumentAuditAction;
  actionDescription: string;
  userId: Schema.Types.ObjectId;
  userEmail?: string;
  ipAddress?: string;
  timestamp: Date;
  metadata?: Record<string, any>;
}

const supplierDocumentAuditSchema = new Schema<ISupplierDocumentAudit>(
  {
    businessId: {
      type: Schema.Types.ObjectId,
      ref: "Business",
      required: true,
    },
    documentId: {
      type: Schema.Types.ObjectId,
      ref: "SupplierDocument",
      required: true,
    },
    supplierId: {
      type: Schema.Types.ObjectId,
      ref: "Supplier",
      required: true,
    },
    action: {
      type: String,
      enum: ["CREATE", "UPDATE", "CANCEL", "APPLY_CREDIT", "APPLY_PAYMENT"],
      required: true,
    },
    actionDescription: {
      type: String,
      required: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    userEmail: String,
    ipAddress: String,
    timestamp: {
      type: Date,
      default: Date.now,
    },
    metadata: Schema.Types.Mixed,
  },
  {
    timestamps: { createdAt: false, updatedAt: false },
  },
);

supplierDocumentAuditSchema.index({ businessId: 1, timestamp: -1 });
supplierDocumentAuditSchema.index({ documentId: 1, timestamp: -1 });

export default models.SupplierDocumentAudit ||
  model<ISupplierDocumentAudit>(
    "SupplierDocumentAudit",
    supplierDocumentAuditSchema,
  );

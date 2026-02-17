import { Schema, model, Document, models } from "mongoose";

export type PaymentOrderStatus = "PENDING" | "CONFIRMED" | "CANCELLED";
export type PaymentMethodType =
  | "cash"
  | "transfer"
  | "mercadopago"
  | "check"
  | "card";

export type PaymentOrderDocumentType =
  | "INVOICE"
  | "INVOICE_A"
  | "INVOICE_B"
  | "INVOICE_C"
  | "DEBIT_NOTE"
  | "CREDIT_NOTE"
  | "FISCAL_DELIVERY_NOTE";

export interface IPaymentOrderDocument {
  documentId: Schema.Types.ObjectId;
  documentType: PaymentOrderDocumentType;
  documentNumber: string;
  date: Date;
  amount: number;
  balanceBefore: number;
  balanceAfter: number;
}

export const PAYMENT_ORDER_DOCUMENT_TYPES: PaymentOrderDocumentType[] = [
  "INVOICE",
  "INVOICE_A",
  "INVOICE_B",
  "INVOICE_C",
  "DEBIT_NOTE",
  "CREDIT_NOTE",
  "FISCAL_DELIVERY_NOTE",
];

export interface IPaymentOrderPayment {
  method: PaymentMethodType;
  reference?: string;
  amount: number;
}

export interface IPaymentOrder extends Document {
  businessId: Schema.Types.ObjectId;
  orderNumber: number;
  date: Date;
  supplierId: Schema.Types.ObjectId;
  channel: 1 | 2;
  status: PaymentOrderStatus;
  documents: IPaymentOrderDocument[];
  creditNotes: IPaymentOrderDocument[];
  payments: IPaymentOrderPayment[];
  documentsTotal: number;
  creditNotesTotal: number;
  paymentsTotal: number;
  netPayable: number;
  notes?: string;
  createdBy: Schema.Types.ObjectId;
  createdByEmail?: string;
  approvedBy?: Schema.Types.ObjectId;
  approvedByEmail?: string;
  confirmedAt?: Date;
  confirmationIp?: string;
  cancelledAt?: Date;
  cancelledBy?: Schema.Types.ObjectId;
  cancelledByEmail?: string;
  cancelReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

const paymentOrderSchema = new Schema<IPaymentOrder>(
  {
    businessId: {
      type: Schema.Types.ObjectId,
      ref: "Business",
      required: true,
    },
    orderNumber: {
      type: Number,
      required: true,
    },
    date: {
      type: Date,
      required: true,
      default: Date.now,
    },
    supplierId: {
      type: Schema.Types.ObjectId,
      ref: "Supplier",
      required: true,
    },
    channel: {
      type: Number,
      enum: [1, 2],
      default: 1,
      required: true,
    },
    status: {
      type: String,
      enum: ["PENDING", "CONFIRMED", "CANCELLED"],
      default: "PENDING",
      required: true,
    },
    documents: {
      type: [
        {
          documentId: {
            type: Schema.Types.ObjectId,
            ref: "SupplierDocument",
            required: true,
          },
          documentType: {
            type: String,
            enum: PAYMENT_ORDER_DOCUMENT_TYPES,
            required: true,
          },
          documentNumber: {
            type: String,
            required: true,
          },
          date: {
            type: Date,
            required: true,
          },
          amount: {
            type: Number,
            required: true,
            min: 0,
          },
          balanceBefore: {
            type: Number,
            required: true,
            min: 0,
          },
          balanceAfter: {
            type: Number,
            required: true,
            min: 0,
          },
        },
      ],
      default: [],
    },
    creditNotes: {
      type: [
        {
          documentId: {
            type: Schema.Types.ObjectId,
            ref: "SupplierDocument",
            required: true,
          },
          documentType: {
            type: String,
            enum: PAYMENT_ORDER_DOCUMENT_TYPES,
            required: true,
          },
          documentNumber: {
            type: String,
            required: true,
          },
          date: {
            type: Date,
            required: true,
          },
          amount: {
            type: Number,
            required: true,
            min: 0,
          },
          balanceBefore: {
            type: Number,
            required: true,
            min: 0,
          },
          balanceAfter: {
            type: Number,
            required: true,
            min: 0,
          },
        },
      ],
      default: [],
    },
    payments: {
      type: [
        {
          method: {
            type: String,
            enum: ["cash", "transfer", "mercadopago", "check", "card"],
            required: true,
          },
          reference: String,
          amount: {
            type: Number,
            required: true,
            min: 0,
          },
        },
      ],
      default: [],
    },
    documentsTotal: {
      type: Number,
      required: true,
      min: 0,
    },
    creditNotesTotal: {
      type: Number,
      required: true,
      min: 0,
    },
    paymentsTotal: {
      type: Number,
      required: true,
      min: 0,
    },
    netPayable: {
      type: Number,
      required: true,
      min: 0,
    },
    notes: String,
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    createdByEmail: String,
    approvedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    approvedByEmail: String,
    confirmedAt: Date,
    confirmationIp: String,
    cancelledAt: Date,
    cancelledBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    cancelledByEmail: String,
    cancelReason: String,
  },
  {
    timestamps: true,
  },
);

paymentOrderSchema.index({ businessId: 1, orderNumber: -1 });
paymentOrderSchema.index({ businessId: 1, supplierId: 1, date: -1 });
paymentOrderSchema.index({ businessId: 1, channel: 1, date: -1 });

// Delete cached model to prevent stale schema enum issues during hot reload
if (models.PaymentOrder) {
  delete (models as any).PaymentOrder;
}

export default model<IPaymentOrder>("PaymentOrder", paymentOrderSchema);

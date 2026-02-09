import { Schema, model, Document, models } from "mongoose";

export interface IBusiness extends Document {
  name: string;

  businessId?: string;
  owner: Schema.Types.ObjectId;
  email: string;
  phone?: string;
  address?: string;
  website?: string;
  cuitRucDni?: string;
  ticketMessage?: string;
  ticketLogo?: string;
  paymentMethods?: Array<{
    id: string;
    name: string;
    enabled: boolean;
  }>;
  city?: string;
  country?: string;
  subscriptionId?: Schema.Types.ObjectId;

  migrations?: {
    discountLimitMax5?: Date;
  };

  // Fiscal Configuration
  fiscalConfig?: {
    country?: string; // "Argentina", "Chile", "Perú", etc.
    fiscalRegime?: "RESPONSABLE_INSCRIPTO" | "MONOTRIBUTO" | "EXENTO"; // Régimen Fiscal
    ivaRate?: number; // Default IVA rate in %
    cuit?: string; // CUIT/CUIL/CDI - for fiscal reporting
    pointOfSale?: number; // Punto de Venta for invoicing (default: 1)
    lastInvoiceNumber?: {
      typeA?: number; // Last number for Factura A
      typeB?: number; // Last number for Factura B
    };
    certificateStatus?: "PENDING" | "VALID" | "EXPIRED";
    certificateExpiryDate?: Date;
  };

  createdAt: Date;
  updatedAt: Date;
}

const businessSchema = new Schema<IBusiness>(
  {
    name: {
      type: String,
      required: true,
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    phone: String,
    address: String,
    website: String,
    cuitRucDni: String,
    ticketMessage: {
      type: String,
      default: "¡GRACIAS POR SU COMPRA!\nVuelva pronto",
    },
    ticketLogo: {
      type: String,
      default: "",
    },
    paymentMethods: {
      type: [
        {
          id: String,
          name: String,
          enabled: Boolean,
        },
      ],
      default: [
        { id: "cash", name: "Efectivo", enabled: true },
        { id: "bankTransfer", name: "Transferencia Bancaria", enabled: true },
        { id: "qr", name: "Código QR", enabled: true },
        { id: "card", name: "Tarjeta", enabled: false },
        { id: "check", name: "Cheque", enabled: false },
      ],
    },
    city: String,
    country: String,
    subscriptionId: {
      type: Schema.Types.ObjectId,
      ref: "Subscription",
    },
    migrations: {
      type: {
        discountLimitMax5: Date,
      },
      default: {},
    },
    // Fiscal Configuration
    fiscalConfig: {
      type: {
        country: String,
        fiscalRegime: {
          type: String,
          enum: ["RESPONSABLE_INSCRIPTO", "MONOTRIBUTO", "EXENTO"],
          default: "RESPONSABLE_INSCRIPTO",
        },
        ivaRate: {
          type: Number,
          default: 21,
        },
        cuit: String,
        pointOfSale: {
          type: Number,
          default: 1,
        },
        lastInvoiceNumber: {
          type: {
            typeA: Number,
            typeB: Number,
          },
          default: {
            typeA: 0,
            typeB: 0,
          },
        },
        certificateStatus: {
          type: String,
          enum: ["PENDING", "VALID", "EXPIRED"],
          default: "PENDING",
        },
        certificateExpiryDate: Date,
      },
      default: {
        country: "Argentina",
        fiscalRegime: "RESPONSABLE_INSCRIPTO",
        ivaRate: 21,
        pointOfSale: 1,
        lastInvoiceNumber: { typeA: 0, typeB: 0 },
        certificateStatus: "PENDING",
      },
    },
  },
  {
    timestamps: true,
  },
);

export default models.Business || model<IBusiness>("Business", businessSchema);

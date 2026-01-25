import mongoose, { Document, Schema } from "mongoose";

export interface IFiscalConfiguration extends Document {
  business: Schema.Types.ObjectId;

  // Certificate Management
  certificateDigital?: {
    fileName: string;
    mimeType: string;
    fileSize: number;
    thumbprint?: string; // Certificate fingerprint for validation
    expiryDate?: Date;
    status: "PENDING" | "VALID" | "EXPIRED" | "REVOKED";
    uploadedAt: Date;
    // File stored encrypted - path/reference only
    storagePath?: string;
  };

  privateKey?: {
    fileName: string;
    mimeType: string;
    fileSize: number;
    status: "PENDING" | "VALID" | "INVALID";
    uploadedAt: Date;
    // File stored encrypted - path/reference only (NEVER expose actual key)
    storagePath?: string;
    // Hash for validation (SHA256)
    hash?: string;
  };

  // Fiscal Information
  country: string; // "Argentina", "Chile", "Perú"
  fiscalRegime:
    | "RESPONSABLE_INSCRIPTO"
    | "MONOTRIBUTO"
    | "EXENTO"
    | "NO_CATEGORIZADO";

  // Tax Identification
  cuit?: string; // CUIT (Código Único de Identificación Tributaria)
  cuil?: string; // CUIL (Code for individuals)
  cdi?: string; // CDI (for some regions)

  // VAT Configuration
  defaultIvaRate: number; // Default VAT rate (21, 10.5, 0, etc.)

  // Invoicing Configuration
  pointOfSale: number; // Punto de Venta (e.g., 1, 2, 3...)

  // Last issued invoice numbers (for CAE validation/tracking)
  lastIssuedNumbers: {
    typeA?: number; // Factura A (código 01)
    typeB?: number; // Factura B (código 06)
    creditNote?: number; // Nota de Crédito (códigos 03, 07, 13)
    debitNote?: number; // Nota de Débito (códigos 08, 13)
  };

  // WSAA Authentication (for AFIP)
  wsaaToken?: {
    token: string;
    sign: string;
    expiryTime: Date;
  };

  // Audit trail
  createdAt: Date;
  updatedAt: Date;
  certificateLastValidated?: Date;
  certificateValidationStatus?: string;
  certificateValidationError?: string;
}

const FiscalConfigurationSchema = new Schema<IFiscalConfiguration>(
  {
    business: {
      type: Schema.Types.ObjectId,
      ref: "Business",
      required: true,
      unique: true, // One config per business
    },

    // Certificate Management
    certificateDigital: {
      type: {
        fileName: String,
        mimeType: String,
        fileSize: Number,
        thumbprint: String,
        expiryDate: Date,
        status: {
          type: String,
          enum: ["PENDING", "VALID", "EXPIRED", "REVOKED"],
          default: "PENDING",
        },
        uploadedAt: Date,
        storagePath: String,
      },
    },

    privateKey: {
      type: {
        fileName: String,
        mimeType: String,
        fileSize: Number,
        status: {
          type: String,
          enum: ["PENDING", "VALID", "INVALID"],
          default: "PENDING",
        },
        uploadedAt: Date,
        storagePath: String,
        hash: String,
      },
    },

    // Fiscal Information
    country: {
      type: String,
      default: "Argentina",
      required: true,
    },
    fiscalRegime: {
      type: String,
      enum: [
        "RESPONSABLE_INSCRIPTO",
        "MONOTRIBUTO",
        "EXENTO",
        "NO_CATEGORIZADO",
      ],
      default: "RESPONSABLE_INSCRIPTO",
      required: true,
    },

    // Tax Identification
    cuit: String,
    cuil: String,
    cdi: String,

    // VAT Configuration
    defaultIvaRate: {
      type: Number,
      default: 21,
      min: 0,
      max: 100,
    },

    // Invoicing
    pointOfSale: {
      type: Number,
      default: 1,
      min: 1,
    },

    // Last issued numbers
    lastIssuedNumbers: {
      type: {
        typeA: { type: Number, default: 0 },
        typeB: { type: Number, default: 0 },
        creditNote: { type: Number, default: 0 },
        debitNote: { type: Number, default: 0 },
      },
      default: {
        typeA: 0,
        typeB: 0,
        creditNote: 0,
        debitNote: 0,
      },
    },

    // WSAA Token
    wsaaToken: {
      type: {
        token: String,
        sign: String,
        expiryTime: Date,
      },
    },

    // Audit
    certificateLastValidated: Date,
    certificateValidationStatus: String,
    certificateValidationError: String,
  },
  {
    timestamps: true,
  },
);

// Indexes
FiscalConfigurationSchema.index({ business: 1 });
FiscalConfigurationSchema.index({ "certificateDigital.expiryDate": 1 });
FiscalConfigurationSchema.index({ cuit: 1 });

export default mongoose.models.FiscalConfiguration ||
  mongoose.model<IFiscalConfiguration>(
    "FiscalConfiguration",
    FiscalConfigurationSchema,
  );

/**
 * AFIP/ARCA Integration Configuration
 *
 * ARCA (Customs Collection and Control Agency) replaced AFIP's functions:
 * - Tax Collection (VAT, Income Tax, Monotributo, Personal Assets Tax)
 * - Tax Control (Electronic Invoicing, Audits, Inspections)
 * - Customs (Imports, Exports)
 * - Taxpayer Registration (CUIT, Tax Key)
 */

export const AFIP_CONFIG = {
  // Environment: 'production' or 'testing'
  environment: process.env.AFIP_ENVIRONMENT || "testing",

  // CUIT (Código Único de Identificación Tributaria)
  cuit: process.env.AFIP_CUIT || "",

  // Certificate and Key paths for WSAA authentication
  certificatePath: process.env.AFIP_CERT_PATH || "",
  keyPath: process.env.AFIP_KEY_PATH || "",

  // AFIP endpoints
  wsaaUrl: {
    production: "https://wsaa.afip.gov.ar/ws/services/LoginCms",
    testing: "https://wsaahomo.afip.gov.ar/ws/services/LoginCms",
  },

  invoicingServiceUrl: {
    production: "https://servicios1.afip.gov.ar/wsfev1/service.asmx",
    testing: "https://wswhomo.afip.gov.ar/wsfev1/service.asmx",
  },

  // Default company data
  companyName: process.env.AFIP_COMPANY_NAME || "",
  incomeTaxCategory: process.env.AFIP_INCOME_TAX_CATEGORY || "Monotributo",
};

// Invoice types
export const INVOICE_TYPES = {
  A: { id: 1, name: "Factura A", description: "Para clientes con CUIT" },
  B: { id: 6, name: "Factura B", description: "Para clientes sin CUIT" },
  C: { id: 11, name: "Ticket", description: "Para consumidor final" },
  M: { id: 51, name: "Factura M", description: "Compras de importación" },
};

// VAT rates (Impuesto al Valor Agregado)
export const VAT_RATES = {
  exempt: { id: 1, rate: 0, name: "Exento" },
  not_taxable: { id: 2, rate: 0, name: "No Gravado" },
  zero: { id: 3, rate: 0, name: "IVA 0%" },
  reduced: { id: 4, rate: 10.5, name: "IVA 10.5%" },
  standard: { id: 5, rate: 21, name: "IVA 21%" },
  additional: { id: 6, rate: 27, name: "IVA 27%" },
};

// Document types
export const DOCUMENT_TYPES = {
  cuit: { id: 80, name: "CUIT" },
  cuil: { id: 86, name: "CUIL" },
  dni: { id: 96, name: "DNI" },
  passport: { id: 94, name: "Pasaporte" },
};

// Runtime validation on startup (best-effort, non-blocking)
import { validateAfipFiles } from "@/lib/services/afipValidator";

export function runAfipStartupValidation() {
  try {
    const res = validateAfipFiles({
      certPath: AFIP_CONFIG.certificatePath,
      keyPath: AFIP_CONFIG.keyPath,
      cuit: AFIP_CONFIG.cuit,
    });
    if (!res.ok) {
      // Log but do not throw — app can still run in mock mode
      // Important issues should be surfaced to admin UI
      // eslint-disable-next-line no-console
      console.warn("[AFIP STARTUP VALIDATION] Issues detected:", res.issues);
    } else {
      // eslint-disable-next-line no-console
      console.log("[AFIP STARTUP VALIDATION] Certificate and key validated.");
    }
    return res;
  } catch (e: any) {
    // eslint-disable-next-line no-console
    console.warn(
      "[AFIP STARTUP VALIDATION] Unexpected error:",
      e && e.message ? e.message : e,
    );
    return {
      ok: false,
      issues: [
        {
          code: "STARTUP_VALIDATION_ERROR",
          message: e && e.message ? e.message : String(e),
        },
      ],
    };
  }
}

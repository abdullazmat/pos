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
    production: "https://wsaa.afip.gov.ar/ws/services/LoginCMS",
    testing: "https://wsaahomo.afip.gov.ar/ws/services/LoginCMS",
  },

  invoicingServiceUrl: {
    production: "https://servicios1.afip.gov.ar/wsfev1/service.asmx",
    testing: "https://servicios1905.afip.gov.ar/wsfev1/service.asmx",
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
  standard: { id: 3, rate: 21, name: "IVA 21%" },
  reduced: { id: 4, rate: 10.5, name: "IVA 10.5%" },
  additional: { id: 5, rate: 27, name: "IVA 27%" },
};

// Document types
export const DOCUMENT_TYPES = {
  cuit: { id: 80, name: "CUIT" },
  cuil: { id: 86, name: "CUIL" },
  dni: { id: 96, name: "DNI" },
  passport: { id: 94, name: "Pasaporte" },
};

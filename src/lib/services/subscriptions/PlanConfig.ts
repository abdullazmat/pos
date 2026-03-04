/**
 * Plan Configuration
 * Defines plan features and pricing
 */
export interface PlanConfig {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  billingPeriod: "monthly" | "yearly";
  features: {
    maxProducts: number;
    maxUsers: number;
    maxCategories: number;
    maxClients: number;
    maxSuppliers: number;
    maxPaymentMethods: number;
    maxSalesPerMonth: number;
    saleHistoryDays: number;
    arcaIntegration: boolean;
    advancedReporting: boolean;
    customBranding: boolean;
    invoiceChannels: number;
    discounts: boolean;
    combinedPaymentMethods: boolean;
    creditSales: boolean;
    productNotes: boolean;
    cashRegisterAudit: boolean;
    expenseTracking: boolean;
    chartsAndGraphs: boolean;
    reportExport: boolean;
    excelImport: boolean;
    customTicketDesign: boolean;
    customBrandingRemoval: boolean;
    mercadoPagoIntegration: boolean;
    mandatoryBranding: string;
  };
}

export const SUBSCRIPTION_PLANS: Record<string, PlanConfig> = {
  BASIC: {
    id: "BASIC",
    name: "Básico (Gratis)",
    description: "Versión de prueba con límites estructurales",
    price: 0,
    currency: "ARS",
    billingPeriod: "monthly",
    features: {
      maxProducts: 100,
      maxUsers: 1,
      maxCategories: 10,
      maxClients: 10,
      maxSuppliers: 5,
      maxPaymentMethods: 2,
      maxSalesPerMonth: 100,
      saleHistoryDays: 30,
      arcaIntegration: false,
      advancedReporting: false,
      customBranding: false,
      invoiceChannels: 1,
      discounts: false,
      combinedPaymentMethods: false,
      creditSales: false,
      productNotes: false,
      cashRegisterAudit: false,
      expenseTracking: false,
      chartsAndGraphs: false,
      reportExport: false,
      excelImport: false,
      customTicketDesign: false,
      customBrandingRemoval: false,
      mercadoPagoIntegration: false,
      mandatoryBranding: "Powered by VentaPlus",
    },
  },
  ESENCIAL: {
    id: "ESENCIAL",
    name: "Esencial",
    description: "Ideal para kioscos y pequeños comercios",
    price: 14999,
    currency: "ARS",
    billingPeriod: "monthly",
    features: {
      maxProducts: 500,
      maxUsers: 1,
      maxCategories: 100,
      maxClients: 500,
      maxSuppliers: 20,
      maxPaymentMethods: 5,
      maxSalesPerMonth: 999999,
      saleHistoryDays: 365,
      arcaIntegration: false,
      advancedReporting: false,
      customBranding: false,
      invoiceChannels: 1,
      discounts: true,
      combinedPaymentMethods: true,
      creditSales: true,
      productNotes: true,
      cashRegisterAudit: true,
      expenseTracking: true,
      chartsAndGraphs: true,
      reportExport: true,
      excelImport: true,
      customTicketDesign: false,
      customBrandingRemoval: false,
      mercadoPagoIntegration: true,
      mandatoryBranding: "",
    },
  },
  PROFESIONAL: {
    id: "PROFESIONAL",
    name: "Profesional",
    description: "Facturación ARCA y gestión avanzada",
    price: 29999,
    currency: "ARS",
    billingPeriod: "monthly",
    features: {
      maxProducts: 3000,
      maxUsers: 3,
      maxCategories: 9999,
      maxClients: 3000,
      maxSuppliers: 100,
      maxPaymentMethods: 10,
      maxSalesPerMonth: 999999,
      saleHistoryDays: 730,
      arcaIntegration: true,
      advancedReporting: true,
      customBranding: true,
      invoiceChannels: 2,
      discounts: true,
      combinedPaymentMethods: true,
      creditSales: true,
      productNotes: true,
      cashRegisterAudit: true,
      expenseTracking: true,
      chartsAndGraphs: true,
      reportExport: true,
      excelImport: true,
      customTicketDesign: true,
      customBrandingRemoval: true,
      mercadoPagoIntegration: true,
      mandatoryBranding: "",
    },
  },
  CRECIMIENTO: {
    id: "CRECIMIENTO",
    name: "Crecimiento",
    description: "Para negocios con múltiples depósitos y gran volumen",
    price: 54999,
    currency: "ARS",
    billingPeriod: "monthly",
    features: {
      maxProducts: 10000,
      maxUsers: 10,
      maxCategories: 99999,
      maxClients: 10000,
      maxSuppliers: 99999,
      maxPaymentMethods: 20,
      maxSalesPerMonth: 999999,
      saleHistoryDays: 3650,
      arcaIntegration: true,
      advancedReporting: true,
      customBranding: true,
      invoiceChannels: 2,
      discounts: true,
      combinedPaymentMethods: true,
      creditSales: true,
      productNotes: true,
      cashRegisterAudit: true,
      expenseTracking: true,
      chartsAndGraphs: true,
      reportExport: true,
      excelImport: true,
      customTicketDesign: true,
      customBrandingRemoval: true,
      mercadoPagoIntegration: true,
      mandatoryBranding: "",
    },
  },
};

/**
 * Get plan configuration by ID
 */
export function getPlanConfig(planId: string): PlanConfig | null {
  return SUBSCRIPTION_PLANS[planId] || null;
}

/**
 * Get all available plans
 */
export function getAllPlans(): PlanConfig[] {
  return Object.values(SUBSCRIPTION_PLANS).filter((plan) => plan.price > 0);
}

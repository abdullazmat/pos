/**
 * Plan feature definitions and limits
 * Synced with Subscription model features
 */

import { SubscriptionPlan } from "@/lib/models/Subscription";

export interface UserFeatures {
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
}

export const PLAN_FEATURES: Record<
  SubscriptionPlan | "free",
  {
    name: string;
    maxProducts: number;
    maxCategories: number;
    maxClients: number;
    maxSuppliers: number;
    maxUsers: number;
    maxPaymentMethods: number;
    maxSalesPerMonth: number;
    saleHistoryDays: number;
    features: Record<string, boolean>;
    mandatoryBranding?: string;
  }
> = {
  BASIC: {
    name: "Free",
    maxProducts: 100,
    maxCategories: 10,
    maxClients: 10,
    maxSuppliers: 5,
    maxUsers: 1,
    maxPaymentMethods: 2,
    maxSalesPerMonth: 100,
    saleHistoryDays: 30,
    mandatoryBranding: "Powered by VentaPlus",
    features: {
      advancedReports: false,
      stockManagement: true,
      multipleLocations: false,
      apiAccess: false,
      customBranding: false,
      arcaInvoicing: false,
      mercadoPago: false,
      bulkOperations: false,
      customReceipts: false,
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
    },
  },
  ESENCIAL: {
    name: "Esencial",
    maxProducts: 500,
    maxCategories: 100,
    maxClients: 500,
    maxSuppliers: 20,
    maxUsers: 1,
    maxPaymentMethods: 5,
    maxSalesPerMonth: 999999,
    saleHistoryDays: 365,
    features: {
      advancedReports: false,
      stockManagement: true,
      multipleLocations: false,
      apiAccess: false,
      customBranding: false,
      arcaInvoicing: false,
      mercadoPago: true,
      bulkOperations: true,
      customReceipts: true,
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
    },
  },
  PROFESIONAL: {
    name: "Profesional",
    maxProducts: 3000,
    maxCategories: 9999,
    maxClients: 3000,
    maxSuppliers: 100,
    maxUsers: 3,
    maxPaymentMethods: 10,
    maxSalesPerMonth: 999999,
    saleHistoryDays: 730,
    features: {
      advancedReports: true,
      stockManagement: true,
      multipleLocations: true,
      apiAccess: true,
      customBranding: true,
      arcaInvoicing: true,
      mercadoPago: true,
      bulkOperations: true,
      customReceipts: true,
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
    },
  },
  CRECIMIENTO: {
    name: "Crecimiento",
    maxProducts: 10000,
    maxCategories: 99999,
    maxClients: 10000,
    maxSuppliers: 99999,
    maxUsers: 10,
    maxPaymentMethods: 20,
    maxSalesPerMonth: 999999,
    saleHistoryDays: 3650,
    features: {
      advancedReports: true,
      stockManagement: true,
      multipleLocations: true,
      apiAccess: true,
      customBranding: true,
      arcaInvoicing: true,
      mercadoPago: true,
      bulkOperations: true,
      customReceipts: true,
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
    },
  },
  free: {
    name: "Free",
    maxProducts: 100,
    maxCategories: 10,
    maxClients: 10,
    maxSuppliers: 5,
    maxUsers: 1,
    maxPaymentMethods: 2,
    maxSalesPerMonth: 100,
    saleHistoryDays: 30,
    mandatoryBranding: "Powered by VentaPlus",
    features: {
      advancedReports: false,
      stockManagement: true,
      multipleLocations: false,
      apiAccess: false,
      customBranding: false,
      arcaInvoicing: false,
      mercadoPago: false,
      bulkOperations: false,
      customReceipts: false,
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
    },
  },
};

export type PlanType =
  | "BASIC"
  | "ESENCIAL"
  | "PROFESIONAL"
  | "CRECIMIENTO"
  | "free";

/**
 * Check if a feature is available in a plan
 */
export function hasFeature(plan: PlanType, feature: string): boolean {
  return PLAN_FEATURES[plan]?.features?.[feature] || false;
}

/**
 * Check if limit is reached (returns true if at/over limit, false if unlimited or under limit)
 */
export function isLimitReached(
  plan: PlanType,
  limitType:
    | "maxProducts"
    | "maxCategories"
    | "maxClients"
    | "maxSuppliers"
    | "maxUsers"
    | "maxSalesPerMonth"
    | "maxPaymentMethods",
  currentCount: number,
): boolean {
  const limit = PLAN_FEATURES[plan][limitType];
  if (limit === -1 || limit === 999999) return false; // unlimited
  return currentCount >= limit;
}

/**
 * Get remaining count for a limit
 */
export function getRemainingCount(
  plan: PlanType,
  limitType:
    | "maxProducts"
    | "maxCategories"
    | "maxClients"
    | "maxSuppliers"
    | "maxUsers"
    | "maxSalesPerMonth"
    | "maxPaymentMethods",
  currentCount: number,
): number | string {
  const limit = PLAN_FEATURES[plan][limitType];
  if (limit === -1 || limit === 999999) return "∞";
  return Math.max(0, limit - currentCount);
}

/**
 * Check if user needs to upgrade for a specific feature
 */
export function needsUpgrade(
  currentPlan: PlanType,
  requiredFeature: string,
): boolean {
  if (currentPlan === "CRECIMIENTO") return false;
  return !hasFeature(currentPlan, requiredFeature);
}

/**
 * Get plan limit display text
 */
export function getLimitText(
  plan: PlanType,
  limitType: keyof Omit<typeof PLAN_FEATURES.free, "features" | "name">,
): string {
  const limit = PLAN_FEATURES[plan][limitType];
  if (limit === -1 || limit === 999999) return "Ilimitado";
  return limit?.toString() || "0";
}

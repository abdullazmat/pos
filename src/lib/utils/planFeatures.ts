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
  arcaIntegration: boolean;
  advancedReporting: boolean;
  customBranding: boolean;
  invoiceChannels: number;
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
    features: Record<string, boolean>;
  }
> = {
  BASIC: {
    name: "Free",
    maxProducts: 100,
    maxCategories: 10,
    maxClients: 10,
    maxSuppliers: 5,
    maxUsers: 1,
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
    },
  },
  ESENCIAL: {
    name: "Esencial",
    maxProducts: 500,
    maxCategories: 100,
    maxClients: 500,
    maxSuppliers: 20,
    maxUsers: 1,
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
    },
  },
  PROFESIONAL: {
    name: "Profesional",
    maxProducts: 3000,
    maxCategories: 9999,
    maxClients: 3000,
    maxSuppliers: 100,
    maxUsers: 3,
    features: {
      advancedReports: true,
      stockManagement: true,
      multipleLocations: true,
      apiAccess: true,
      customBranding: false,
      arcaInvoicing: true,
      mercadoPago: true,
      bulkOperations: true,
      customReceipts: true,
    },
  },
  CRECIMIENTO: {
    name: "Crecimiento",
    maxProducts: 10000,
    maxCategories: 99999,
    maxClients: 10000,
    maxSuppliers: 99999,
    maxUsers: 10,
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
    },
  },
  free: {
    name: "Free",
    maxProducts: 100,
    maxCategories: 10,
    maxClients: 0,
    maxSuppliers: 5,
    maxUsers: 1,
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
    },
  },
};

export type PlanType = "BASIC" | "ESENCIAL" | "PROFESIONAL" | "CRECIMIENTO" | "free";

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
    | "maxUsers",
  currentCount: number,
): boolean {
  const limit = PLAN_FEATURES[plan][limitType];
  if (limit === -1 || limit === 99999) return false; // unlimited
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
    | "maxUsers",
  currentCount: number,
): number | string {
  const limit = PLAN_FEATURES[plan][limitType];
  if (limit === -1 || limit === 99999) return "∞";
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
  limitType: keyof typeof PLAN_FEATURES.free,
): string {
  const limit = PLAN_FEATURES[plan][limitType];
  if (limit === -1) return "Ilimitado";
  return limit.toString();
}

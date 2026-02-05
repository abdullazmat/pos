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
    arcaIntegration: boolean;
    advancedReporting: boolean;
    customBranding: boolean;
    invoiceChannels: number;
  };
}

export const SUBSCRIPTION_PLANS: Record<string, PlanConfig> = {
  BASIC: {
    id: "BASIC",
    name: "Básico",
    description: "Ideal para kioscos y negocios pequeños",
    price: 9990, // ARS
    currency: "ARS",
    billingPeriod: "monthly",
    features: {
      maxProducts: 100,
      maxUsers: 2,
      maxCategories: 20,
      maxClients: 0,
      maxSuppliers: 5,
      arcaIntegration: false,
      advancedReporting: false,
      customBranding: false,
      invoiceChannels: 1, // INTERNAL only
    },
  },
  PROFESSIONAL: {
    id: "PROFESSIONAL",
    name: "Profesional",
    description: "Para negocios en crecimiento",
    price: 24990, // ARS
    currency: "ARS",
    billingPeriod: "monthly",
    features: {
      maxProducts: 99999,
      maxUsers: 99999,
      maxCategories: 99999,
      maxClients: 99999,
      maxSuppliers: 99999,
      arcaIntegration: true,
      advancedReporting: true,
      customBranding: true,
      invoiceChannels: 2, // ARCA + INTERNAL
    },
  },
  ENTERPRISE: {
    id: "ENTERPRISE",
    name: "Empresarial",
    description: "Para grandes empresas",
    price: 0, // Custom pricing
    currency: "ARS",
    billingPeriod: "monthly",
    features: {
      maxProducts: 99999,
      maxUsers: 99999,
      maxCategories: 99999,
      maxClients: 99999,
      maxSuppliers: 99999,
      arcaIntegration: true,
      advancedReporting: true,
      customBranding: true,
      invoiceChannels: 2,
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

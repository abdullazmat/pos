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
    name: "Básico (Histórico)",
    description: "Plan gratuito de prueba",
    price: 0,
    currency: "ARS",
    billingPeriod: "monthly",
    features: {
      maxProducts: 100,
      maxUsers: 1,
      maxCategories: 10,
      maxClients: 10,
      maxSuppliers: 5,
      arcaIntegration: false,
      advancedReporting: false,
      customBranding: false,
      invoiceChannels: 1,
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
      arcaIntegration: false,
      advancedReporting: false,
      customBranding: false,
      invoiceChannels: 1,
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
      arcaIntegration: true,
      advancedReporting: true,
      customBranding: true,
      invoiceChannels: 2,
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

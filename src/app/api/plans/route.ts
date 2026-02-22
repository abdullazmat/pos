import { NextRequest } from "next/server";
import {
  generateErrorResponse,
  generateSuccessResponse,
} from "@/lib/utils/helpers";

export const dynamic = "force-dynamic";

const PLANS_DATA = {
  es: [
    {
      id: "ESENCIAL",
      name: "Esencial",
      price: 14999,
      billing: "/mes",
      description: "Ideal para kioscos y pequeños comercios",
      features: {
        maxProducts: 500,
        maxCategories: 100,
        maxUsers: 1,
        arcaIntegration: false,
        advancedReporting: false,
        customBranding: false,
        invoiceChannels: 1,
        apiAccess: false,
      },
      limits: ["500 productos", "1 usuario"],
      icon: "🎯",
      popular: false,
    },
    {
      id: "PROFESIONAL",
      name: "Profesional",
      price: 29999,
      billing: "/mes",
      description: "Facturación ARCA y gestión avanzada",
      features: {
        maxProducts: 3000,
        maxCategories: 9999,
        maxUsers: 3,
        arcaIntegration: true,
        advancedReporting: true,
        customBranding: true,
        invoiceChannels: 2,
        apiAccess: true,
      },
      limits: ["3.000 productos", "3 usuarios", "✓ Logo", "✓ ARCA"],
      icon: "⭐",
      popular: true,
    },
    {
      id: "CRECIMIENTO",
      name: "Crecimiento",
      price: 54999,
      billing: "/mes",
      description: "Para negocios con gran volumen y multi-depósito",
      features: {
        maxProducts: 10000,
        maxCategories: 99999,
        maxUsers: 10,
        arcaIntegration: true,
        advancedReporting: true,
        customBranding: true,
        invoiceChannels: 2,
        apiAccess: true,
      },
      limits: ["10.000 productos", "10 usuarios", "✓ Multi-depósito"],
      icon: "🚀",
      popular: false,
    },
  ],
  en: [
    {
      id: "ESENCIAL",
      name: "Essential",
      price: 14999,
      billing: "/month",
      description: "Ideal for kiosks and small shops",
      features: {
        maxProducts: 500,
        maxCategories: 100,
        maxUsers: 1,
        arcaIntegration: false,
        advancedReporting: false,
        customBranding: false,
        invoiceChannels: 1,
        apiAccess: false,
      },
      limits: ["500 products", "1 user"],
      icon: "🎯",
      popular: false,
    },
    {
      id: "PROFESIONAL",
      name: "Professional",
      price: 29999,
      billing: "/month",
      description: "ARCA Invoicing and advanced management",
      features: {
        maxProducts: 3000,
        maxCategories: 9999,
        maxUsers: 3,
        arcaIntegration: true,
        advancedReporting: true,
        customBranding: true,
        invoiceChannels: 2,
        apiAccess: true,
      },
      limits: ["3,000 products", "3 users", "✓ Logo", "✓ ARCA"],
      icon: "⭐",
      popular: true,
    },
    {
      id: "CRECIMIENTO",
      name: "Growth",
      price: 54999,
      billing: "/month",
      description: "For high volume and multi-warehouse businesses",
      features: {
        maxProducts: 10000,
        maxCategories: 99999,
        maxUsers: 10,
        arcaIntegration: true,
        advancedReporting: true,
        customBranding: true,
        invoiceChannels: 2,
        apiAccess: true,
      },
      limits: ["10,000 products", "10 users", "✓ Multi-warehouse"],
      icon: "🚀",
      popular: false,
    },
  ],
  pt: [
    {
      id: "ESENCIAL",
      name: "Essencial",
      price: 14999,
      billing: "/mês",
      description: "Ideal para quiosques e pequenos negócios",
      features: {
        maxProducts: 500,
        maxCategories: 100,
        maxUsers: 1,
        arcaIntegration: false,
        advancedReporting: false,
        customBranding: false,
        invoiceChannels: 1,
        apiAccess: false,
      },
      limits: ["500 produtos", "1 usuário"],
      icon: "🎯",
      popular: false,
    },
    {
      id: "PROFESIONAL",
      name: "Profissional",
      price: 29999,
      billing: "/mês",
      description: "Faturamento ARCA e gestão avançada",
      features: {
        maxProducts: 3000,
        maxCategories: 9999,
        maxUsers: 3,
        arcaIntegration: true,
        advancedReporting: true,
        customBranding: true,
        invoiceChannels: 2,
        apiAccess: true,
      },
      limits: ["3.000 produtos", "3 usuários", "✓ Logo", "✓ ARCA"],
      icon: "⭐",
      popular: true,
    },
    {
      id: "CRECIMIENTO",
      name: "Crescimento",
      price: 54999,
      billing: "/mês",
      description: "Para negócios com grande volume e multi-depósito",
      features: {
        maxProducts: 10000,
        maxCategories: 99999,
        maxUsers: 10,
        arcaIntegration: true,
        advancedReporting: true,
        customBranding: true,
        invoiceChannels: 2,
        apiAccess: true,
      },
      limits: ["10.000 produtos", "10 usuários", "✓ Multi-depósito"],
      icon: "🚀",
      popular: false,
    },
  ],
};

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const lang = searchParams.get("lang") || "es";
    const validLang = ["es", "en", "pt"].includes(lang) ? lang : "es";

    return generateSuccessResponse({
      plans: PLANS_DATA[validLang as keyof typeof PLANS_DATA],
    });
  } catch (error) {
    console.error("Get plans error:", error);
    return generateErrorResponse("Internal server error", 500);
  }
}

import { NextRequest } from "next/server";
import {
  generateErrorResponse,
  generateSuccessResponse,
} from "@/lib/utils/helpers";

const PLANS_DATA = {
  es: [
    {
      id: "FREE",
      name: "Gratuito",
      price: 0,
      billing: "/mes",
      description: "Perfecto para empezar y probar el sistema sin costo",
      features: {
        maxProducts: 100,
        maxCategories: 10,
        maxUsers: 2,
        arcaIntegration: false,
        advancedReporting: false,
        customBranding: false,
        invoiceChannels: 1,
        apiAccess: false,
      },
      limits: ["100 productos", "2 usuarios"],
      icon: "🎯",
      popular: false,
    },
    {
      id: "PRO",
      name: "Pro",
      price: 24990,
      billing: "/mes",
      description:
        "Todo lo que necesitas para administrar tu negocio profesionalmente",
      features: {
        maxProducts: 999999,
        maxCategories: 999999,
        maxUsers: 999999,
        arcaIntegration: true,
        advancedReporting: true,
        customBranding: true,
        invoiceChannels: 5,
        apiAccess: true,
      },
      limits: ["∞ productos", "∞ usuarios", "✓ Logo"],
      icon: "⭐",
      popular: true,
    },
  ],
  en: [
    {
      id: "FREE",
      name: "Free",
      price: 0,
      billing: "/month",
      description: "Perfect to start and try the system at no cost",
      features: {
        maxProducts: 100,
        maxCategories: 10,
        maxUsers: 2,
        arcaIntegration: false,
        advancedReporting: false,
        customBranding: false,
        invoiceChannels: 1,
        apiAccess: false,
      },
      limits: ["100 products", "2 users"],
      icon: "🎯",
      popular: false,
    },
    {
      id: "PRO",
      name: "Pro",
      price: 24990,
      billing: "/month",
      description: "Everything you need to manage your business professionally",
      features: {
        maxProducts: 999999,
        maxCategories: 999999,
        maxUsers: 999999,
        arcaIntegration: true,
        advancedReporting: true,
        customBranding: true,
        invoiceChannels: 5,
        apiAccess: true,
      },
      limits: ["∞ products", "∞ users", "✓ Logo"],
      icon: "⭐",
      popular: true,
    },
  ],
  pt: [
    {
      id: "FREE",
      name: "Gratuito",
      price: 0,
      billing: "/mês",
      description: "Perfeito para começar e testar o sistema sem custo",
      features: {
        maxProducts: 100,
        maxCategories: 10,
        maxUsers: 2,
        arcaIntegration: false,
        advancedReporting: false,
        customBranding: false,
        invoiceChannels: 1,
        apiAccess: false,
      },
      limits: ["100 produtos", "2 usuários"],
      icon: "🎯",
      popular: false,
    },
    {
      id: "PRO",
      name: "Pro",
      price: 24990,
      billing: "/mês",
      description:
        "Tudo o que você precisa para gerenciar seu negócio profissionalmente",
      features: {
        maxProducts: 999999,
        maxCategories: 999999,
        maxUsers: 999999,
        arcaIntegration: true,
        advancedReporting: true,
        customBranding: true,
        invoiceChannels: 5,
        apiAccess: true,
      },
      limits: ["∞ produtos", "∞ usuários", "✓ Logo"],
      icon: "⭐",
      popular: true,
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

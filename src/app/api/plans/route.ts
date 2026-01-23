import { NextRequest } from "next/server";
import {
  generateErrorResponse,
  generateSuccessResponse,
} from "@/lib/utils/helpers";

const PLANS = [
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
    price: 19990,
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
];

export async function GET(req: NextRequest) {
  try {
    return generateSuccessResponse({
      plans: PLANS,
    });
  } catch (error) {
    console.error("Get plans error:", error);
    return generateErrorResponse("Internal server error", 500);
  }
}

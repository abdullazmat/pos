"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Header from "@/components/layout/Header";
import { useGlobalLanguage } from "@/lib/hooks/useGlobalLanguage";
import { toast } from "react-toastify";
import { AlertCircle } from "lucide-react";
import { Check, CreditCard, TrendingUp, Shield, Users } from "lucide-react";

const UPGRADE_COPY = {
  es: {
    title: "Actualizá tu Plan",
    subtitle:
      "Desbloqueá funciones avanzadas y llevá tu negocio al siguiente nivel",
    payment: {
      canceled: "Pago Cancelado",
      canceledDesc:
        "Tu pago fue cancelado. Intentá de nuevo cuando estés listo para actualizar tu plan.",
      retryWhenReady: "Intentá de nuevo cuando estés listo.",
    },
    plans: {
      basic: {
        title: "Plan Básico",
        price: "$0",
        billing: "/mes",
        features: [
          "Hasta 100 productos",
          "Control manual",
          "1 usuario",
        ],
        button: "Plan Actual",
      },
      esencial: {
        id: "ESENCIAL",
        title: "Plan Esencial",
        subtitle: "Ideal para Kioscos",
        price: "AR$14.999",
        billing: "/mes",
        features: [
          "Hasta 500 productos",
          "1 usuario",
          "Gestión de stock",
          "Sin facturación ARCA",
        ],
        button: "Elegir Esencial",
      },
      profesional: {
        id: "PROFESIONAL",
        title: "Plan Profesional",
        subtitle: "El más recomendado",
        recommended: "RECOMENDADO",
        price: "AR$29.999",
        billing: "/mes",
        features: [
          "Hasta 3.000 productos",
          "Hasta 3 usuarios",
          "Facturación ARCA Inc.",
          "Notas de Crédito",
          "Proveedores",
        ],
        button: "Elegir Profesional",
      },
      crecimiento: {
        id: "CRECIMIENTO",
        title: "Plan Crecimiento",
        subtitle: "Escalamiento total",
        price: "AR$54.999",
        billing: "/mes",
        features: [
          "Hasta 10.000 productos",
          "Hasta 10 usuarios",
          "Reportes avanzados",
          "Soporte Prioritario",
        ],
        button: "Elegir Crecimiento",
      },
    },
    common: {
      opening: "Abriendo Mercado Pago...",
      security: "Pagos seguros con Mercado Pago",
      success: "Mercado Pago listo. El plan se activa al confirmar el pago.",
    },
    highlights: {
      scale: {
        title: "Escalá Tu Negocio",
        desc: "Sin límites en productos, ventas o usuarios. Crecé sin restricciones.",
      },
      support: {
        title: "Soporte Prioritario",
        desc: "Ayuda directa cuando la necesites por WhatsApp y Email.",
      },
      team: {
        title: "Gestión de Equipo",
        desc: "Añadí cajeros y administradores con permisos detallados.",
      },
    },
  },
  en: {
    title: "Upgrade Your Plan",
    subtitle:
      "Unlock advanced features and take your business to the next level",
    payment: {
      canceled: "Payment Canceled",
      canceledDesc:
        "Your payment was canceled. Try again when you're ready to upgrade your plan.",
      retryWhenReady: "Try again when you're ready.",
    },
    plans: {
      basic: {
        title: "Basic Plan",
        price: "$0",
        billing: "/month",
        features: [
          "Up to 100 products",
          "Manual control",
          "1 user",
        ],
        button: "Current Plan",
      },
      esencial: {
        id: "ESENCIAL",
        title: "Essential Plan",
        subtitle: "Ideal for Kiosks",
        price: "AR$14,999",
        billing: "/month",
        features: [
          "Up to 500 products",
          "1 user",
          "Stock management",
          "No ARCA invoicing",
        ],
        button: "Choose Essential",
      },
      profesional: {
        id: "PROFESIONAL",
        title: "Professional Plan",
        subtitle: "Most recommended",
        recommended: "RECOMMENDED",
        price: "AR$29,999",
        billing: "/month",
        features: [
          "Up to 3,000 products",
          "Up to 3 users",
          "ARCA invoicing Inc.",
          "Credit Notes",
          "Suppliers",
        ],
        button: "Choose Professional",
      },
      crecimiento: {
        id: "CRECIMIENTO",
        title: "Growth Plan",
        subtitle: "Total scaling",
        price: "AR$54,999",
        billing: "/month",
        features: [
          "Up to 10,000 products",
          "Up to 10 users",
          "Advanced reports",
          "Priority Support",
        ],
        button: "Choose Growth",
      },
    },
    common: {
      opening: "Opening Mercado Pago...",
      security: "Secure payments with Mercado Pago",
      success: "Mercado Pago ready. Plan activates upon confirmation.",
    },
    highlights: {
      scale: {
        title: "Scale Your Business",
        desc: "No limits on products, sales, or users. Grow without restrictions.",
      },
      support: {
        title: "Priority Support",
        desc: "Get help when you need it via WhatsApp and Email.",
      },
      team: {
        title: "Team Management",
        desc: "Add cashiers and admins with detailed permissions.",
      },
    },
  },
  pt: {
    title: "Atualize seu Plano",
    subtitle:
      "Desbloqueie recursos avançados e leve seu negócio para o próximo nível",
    payment: {
      canceled: "Pagamento Cancelado",
      canceledDesc:
        "Seu pagamento foi cancelado. Tente novamente quando estiver pronto para atualizar seu plano.",
      retryWhenReady: "Tente novamente quando estiver pronto.",
    },
    plans: {
      basic: {
        title: "Plano Básico",
        price: "$0",
        billing: "/mês",
        features: [
          "Até 100 produtos",
          "Controle manual",
          "1 usuário",
        ],
        button: "Plano Atual",
      },
      esencial: {
        id: "ESENCIAL",
        title: "Plano Essencial",
        subtitle: "Ideal para Quiosques",
        price: "AR$14.999",
        billing: "/mês",
        features: [
          "Até 500 produtos",
          "1 usuário",
          "Gestão de estoque",
          "Sem fatura ARCA",
        ],
        button: "Escolher Essencial",
      },
      profesional: {
        id: "PROFESIONAL",
        title: "Plano Profissional",
        subtitle: "O mais recomendado",
        recommended: "RECOMENDADO",
        price: "AR$29.999",
        billing: "/mês",
        features: [
          "Até 3.000 produtos",
          "Até 3 usuários",
          "Fatura ARCA Inc.",
          "Notas de Crédito",
          "Fornecedores",
        ],
        button: "Escolher Profissional",
      },
      crecimiento: {
        id: "CRECIMIENTO",
        title: "Plano Crescimento",
        subtitle: "Escalamento total",
        price: "AR$54.999",
        billing: "/mês",
        features: [
          "Até 10.000 produtos",
          "Até 10 usuários",
          "Relatórios avançados",
          "Suporte Prioritário",
        ],
        button: "Escolher Crescimento",
      },
    },
    common: {
      opening: "Abrindo Mercado Pago...",
      security: "Pagamentos seguros com Mercado Pago",
      success: "Mercado Pago pronto. Plano é ativado ao confirmar pagamento.",
    },
    highlights: {
      scale: {
        title: "Escala Seu Negócio",
        desc: "Sem limites em produtos, vendas ou usuários. Cresça sem restrições.",
      },
      support: {
        title: "Suporte Prioritário",
        desc: "Ajuda direta pelo WhatsApp e Email quando precisar.",
      },
      team: {
        title: "Gestão de Equipe",
        desc: "Adicione caixas e admins com permissões detalhadas.",
      },
    },
  },
} as const;

export default function UpgradePage() {
  const { currentLanguage } = useGlobalLanguage();
  const copy = (UPGRADE_COPY[currentLanguage] ||
    UPGRADE_COPY.en) as typeof UPGRADE_COPY.en;
  const [mounted, setMounted] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [mpUpgrading, setMpUpgrading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const canceled = searchParams.get("canceled") === "true";

  useEffect(() => {
    setMounted(true);
    const userStr = localStorage.getItem("user");
    if (!userStr) {
      router.push("/auth/login");
      return;
    }
    setUser(JSON.parse(userStr));
    setLoading(false);
  }, [router]);

  const handleUpgradeMercadoPago = async (targetPlanId: string) => {
    setMpUpgrading(true);
    try {
      const token = localStorage.getItem("accessToken");
      const response = await fetch("/api/payments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          planId: targetPlanId,
          email: user?.email,
          businessName: user?.businessName || user?.fullName || "Mi Negocio",
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "No se pudo crear el pago");
      }

      if (data.payment?.preferenceLink) {
        window.open(data.payment.preferenceLink, "_blank");
        toast.success(copy.common.success);
      } else {
        throw new Error("No se recibió el enlace de pago");
      }
    } catch (error) {
      console.error("Upgrade Mercado Pago error:", error);
      const msg = getPaymentErrorMessage(
        error instanceof Error ? error.message : String(error),
        currentLanguage as any,
      );
      toast.error(msg);
    } finally {
      setMpUpgrading(false);
    }
  };

  // Localized payment error mapping
  function getPaymentErrorMessage(raw: string, lang: "es" | "en" | "pt") {
    const M = {
      es: {
        createFailed: "No se pudo crear el pago",
        linkMissing: "No se recibió el enlace de pago",
        unauthorized: "No autorizado. Inicia sesión nuevamente.",
        invalidToken: "Token inválido. Inicia sesión nuevamente.",
        invalidPlan: "Plan inválido o no disponible.",
        missingFields: "Faltan datos requeridos.",
        generic: "Ocurrió un error al procesar el pago",
      },
      en: {
        createFailed: "Failed to create payment",
        linkMissing: "Payment link was not received",
        unauthorized: "Unauthorized. Please sign in again.",
        invalidToken: "Invalid token. Please sign in again.",
        invalidPlan: "Invalid or unavailable plan.",
        missingFields: "Missing required fields.",
        generic: "An error occurred while processing the payment",
      },
      pt: {
        createFailed: "Não foi possível criar o pagamento",
        linkMissing: "O link de pagamento não foi recebido",
        unauthorized: "Não autorizado. Entre novamente.",
        invalidToken: "Token inválido. Entre novamente.",
        invalidPlan: "Plano inválido ou indisponível.",
        missingFields: "Faltam dados obrigatórios.",
        generic: "Ocorreu um erro ao processar o pagamento",
      },
    } as const;

    const L = M[lang] || M.en;
    const s = (raw || "").toLowerCase();
    if (s.includes("failed to create payment")) return L.createFailed;
    if (s.includes("no checkout url") || s.includes("enlace de pago"))
      return L.linkMissing;
    if (s.includes("unauthorized")) return L.unauthorized;
    if (s.includes("invalid token")) return L.invalidToken;
    if (s.includes("invalid or unavailable plan")) return L.invalidPlan;
    if (s.includes("missing required fields")) return L.missingFields;
    return L.generic;
  }

  if (!mounted || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800 text-slate-900 dark:text-slate-100">
      <Header user={user} showBackButton={true} />

      <main className="max-w-6xl mx-auto px-4 py-12">
        {canceled && (
          <div className="mb-8 p-4 bg-amber-100 border border-amber-400 dark:bg-amber-900/40 dark:border-amber-700 rounded-lg flex items-start gap-3">
            <AlertCircle className="w-6 h-6 text-amber-700 dark:text-amber-300 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-amber-900 dark:text-amber-100">
                {copy.payment.canceled}
              </h3>
              <p className="text-amber-800 dark:text-amber-100/80 text-sm">
                {copy.payment.canceledDesc}
              </p>
            </div>
          </div>
        )}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">
            {copy.title}
          </h1>
          <p className="text-xl text-slate-700 dark:text-slate-200">
            {copy.subtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {/* Basic Plan */}
          <div className="bg-white/80 dark:bg-slate-900/60 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 flex flex-col">
            <h3 className="text-lg font-bold mb-1">{copy.plans.basic.title}</h3>
            <div className="text-3xl font-black mb-4">
               {copy.plans.basic.price} <span className="text-xs font-normal text-slate-500">{copy.plans.basic.billing}</span>
            </div>
            <ul className="space-y-3 mb-8 flex-grow">
              {copy.plans.basic.features.map((f, i) => (
                <li key={i} className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                  <Check className="w-4 h-4 text-green-500" /> {f}
                </li>
              ))}
            </ul>
            <button disabled className="w-full py-2 bg-slate-100 dark:bg-slate-800 text-slate-400 rounded-lg text-xs font-bold">
               {copy.plans.basic.button}
            </button>
          </div>

          {/* Esencial Plan */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 flex flex-col shadow-lg">
            <h3 className="text-lg font-bold mb-1">{copy.plans.esencial.title}</h3>
            <p className="text-[10px] text-blue-500 font-bold uppercase mb-2">{copy.plans.esencial.subtitle}</p>
            <div className="text-3xl font-black mb-4">
               {copy.plans.esencial.price} <span className="text-xs font-normal text-slate-500">{copy.plans.esencial.billing}</span>
            </div>
            <ul className="space-y-3 mb-8 flex-grow">
              {copy.plans.esencial.features.map((f, i) => (
                <li key={i} className="flex items-center gap-2 text-sm">
                  <Check className="w-4 h-4 text-blue-500" /> {f}
                </li>
              ))}
            </ul>
            <button 
              onClick={() => handleUpgradeMercadoPago(copy.plans.esencial.id)}
              disabled={mpUpgrading}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-black transition-all"
            >
               {mpUpgrading ? copy.common.opening : copy.plans.esencial.button}
            </button>
          </div>

          {/* Profesional Plan */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border-2 border-purple-500 flex flex-col shadow-2xl relative overflow-hidden transform hover:scale-[1.02] transition-all">
            <div className="absolute top-0 right-0 bg-purple-500 text-white text-[8px] font-black px-3 py-1 rounded-bl-lg uppercase">
               {copy.plans.profesional.recommended}
            </div>
            <h3 className="text-lg font-bold mb-1">{copy.plans.profesional.title}</h3>
            <p className="text-[10px] text-purple-500 font-bold uppercase mb-2">{copy.plans.profesional.subtitle}</p>
            <div className="text-3xl font-black mb-4">
               {copy.plans.profesional.price} <span className="text-xs font-normal text-slate-500">{copy.plans.profesional.billing}</span>
            </div>
            <ul className="space-y-3 mb-8 flex-grow">
              {copy.plans.profesional.features.map((f, i) => (
                <li key={i} className="flex items-center gap-2 text-sm font-medium">
                  <Check className="w-4 h-4 text-purple-500" /> {f}
                </li>
              ))}
            </ul>
            <button 
              onClick={() => handleUpgradeMercadoPago(copy.plans.profesional.id)}
              disabled={mpUpgrading}
              className="w-full py-4 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-sm font-black shadow-lg shadow-purple-500/25 transition-all"
            >
               {mpUpgrading ? copy.common.opening : copy.plans.profesional.button}
            </button>
          </div>

          {/* Crecimiento Plan */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 flex flex-col shadow-lg">
            <h3 className="text-lg font-bold mb-1">{copy.plans.crecimiento.title}</h3>
            <p className="text-[10px] text-yellow-600 font-bold uppercase mb-2">{copy.plans.crecimiento.subtitle}</p>
            <div className="text-3xl font-black mb-4">
               {copy.plans.crecimiento.price} <span className="text-xs font-normal text-slate-500">{copy.plans.crecimiento.billing}</span>
            </div>
            <ul className="space-y-3 mb-8 flex-grow">
              {copy.plans.crecimiento.features.map((f, i) => (
                <li key={i} className="flex items-center gap-2 text-sm">
                  <Check className="w-4 h-4 text-yellow-500" /> {f}
                </li>
              ))}
            </ul>
            <button 
              onClick={() => handleUpgradeMercadoPago(copy.plans.crecimiento.id)}
              disabled={mpUpgrading}
              className="w-full py-3 bg-slate-900 dark:bg-white dark:text-slate-900 text-white hover:opacity-90 rounded-xl text-xs font-black transition-all"
            >
               {mpUpgrading ? copy.common.opening : copy.plans.crecimiento.button}
            </button>
          </div>
        </div>

        {/* Feature Highlights */}
        <div className="grid md:grid-cols-3 gap-6 mt-12">
          <div className="bg-white/90 dark:bg-slate-900/80 rounded-xl p-6 shadow-xl border border-slate-300 dark:border-slate-800">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/50 rounded-lg flex items-center justify-center mb-4">
              <TrendingUp className="w-6 h-6 text-blue-600 dark:text-blue-300" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
              {copy.highlights.scale.title}
            </h3>
            <p className="text-slate-700 dark:text-slate-200">
              {copy.highlights.scale.desc}
            </p>
          </div>

          <div className="bg-white/90 dark:bg-slate-900/80 rounded-xl p-6 shadow-xl border border-slate-300 dark:border-slate-800">
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/50 rounded-lg flex items-center justify-center mb-4">
              <Shield className="w-6 h-6 text-purple-600 dark:text-purple-300" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
              {copy.highlights.support.title}
            </h3>
            <p className="text-slate-700 dark:text-slate-200">
              {copy.highlights.support.desc}
            </p>
          </div>

          <div className="bg-white/90 dark:bg-slate-900/80 rounded-xl p-6 shadow-xl border border-slate-300 dark:border-slate-800">
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/50 rounded-lg flex items-center justify-center mb-4">
              <Users className="w-6 h-6 text-green-600 dark:text-green-300" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
              {copy.highlights.team.title}
            </h3>
            <p className="text-slate-700 dark:text-slate-200">
              {copy.highlights.team.desc}
            </p>
          </div>
        </div>

        {/* Payment Security */}
        <div className="mt-12 text-center">
          <div className="inline-flex items-center gap-2 text-slate-700 dark:text-slate-200 bg-white/90 dark:bg-slate-900/80 px-6 py-3 rounded-full shadow border border-slate-200 dark:border-slate-800">
            <CreditCard className="w-4 h-4" />
            <span className="text-xs font-bold uppercase tracking-widest">{copy.common.security}</span>
          </div>
        </div>
      </main>
    </div>
  );
}

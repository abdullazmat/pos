"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Header from "@/components/layout/Header";
import { useGlobalLanguage } from "@/lib/hooks/useGlobalLanguage";
import { toast } from "react-toastify";
import { AlertCircle } from "lucide-react";
import {
  Check,
  CreditCard,
  Zap,
  TrendingUp,
  Shield,
  Users,
} from "lucide-react";

const UPGRADE_COPY = {
  es: {
    title: "Actualizar a Plan Pro",
    subtitle:
      "Desbloquea funciones ilimitadas y lleva tu negocio al siguiente nivel",
    payment: {
      canceled: "Pago Cancelado",
      canceledDesc:
        "Tu pago fue cancelado. Intenta de nuevo cuando estés listo para actualizar tu plan.",
      retryWhenReady: "Intenta de nuevo cuando estés listo.",
    },
    plans: {
      free: {
        title: "Plan Gratuito",
        current: "Tu plan actual",
        price: "$0",
        features: [
          "Hasta 100 productos",
          "Seguimiento básico de inventario",
          "Reportes de ventas diarios",
          "1 cuenta de usuario",
          "Soporte comunitario",
        ],
        button: "Plan Actual",
      },
      pro: {
        title: "Plan Pro",
        subtitle: "Todo lo que necesitas para crecer",
        recommended: "RECOMENDADO",
        price: "AR$24.990",
        billing: "/mes",
        paymentMethods: "Paga en ARS con Mercado Pago o en USD con Stripe",
        features: [
          "Productos ilimitados",
          "Gestión avanzada de inventario",
          "Análisis y reportes en tiempo real",
          "Cuentas de usuario ilimitadas",
          "Soporte prioritario",
          "Integraciones personalizadas",
          "Reportes avanzados",
        ],
        buttons: {
          stripe: "Pagar con Stripe",
          mercadoPago: "Pagar con Mercado Pago",
          processing: "Procesando...",
          opening: "Abriendo Mercado Pago...",
        },
        note: "El plan Pro se activa automáticamente cuando el pago se confirma.",
      },
    },
    highlights: {
      scale: {
        title: "Escala Tu Negocio",
        desc: "Sin límites en productos, ventas o usuarios. Crece sin restricciones.",
      },
      support: {
        title: "Soporte Prioritario",
        desc: "Obtén ayuda cuando la necesites con nuestro equipo de soporte dedicado.",
      },
      team: {
        title: "Gestión de Equipo",
        desc: "Añade miembros ilimitados con permisos basados en roles.",
      },
    },
    security: "Pagos seguros con Stripe o Mercado Pago",
    successMessage:
      "Mercado Pago listo. El plan se activa al confirmar el pago.",
  },
  en: {
    title: "Upgrade to Pro Plan",
    subtitle:
      "Unlock unlimited features and take your business to the next level",
    payment: {
      canceled: "Payment Canceled",
      canceledDesc:
        "Your payment was canceled. Try again when you're ready to upgrade your plan.",
      retryWhenReady: "Try again when you're ready.",
    },
    plans: {
      free: {
        title: "Free Plan",
        current: "Your current plan",
        price: "$0",
        features: [
          "Up to 100 products",
          "Basic inventory tracking",
          "Daily sales reports",
          "1 user account",
          "Community support",
        ],
        button: "Current Plan",
      },
      pro: {
        title: "Pro Plan",
        subtitle: "Everything you need to grow",
        recommended: "RECOMMENDED",
        price: "AR$24.990",
        billing: "/month",
        paymentMethods: "Pay in ARS with Mercado Pago or in USD with Stripe",
        features: [
          "Unlimited products",
          "Advanced inventory management",
          "Real-time analytics and reports",
          "Unlimited user accounts",
          "Priority support",
          "Custom integrations",
          "Advanced reports",
        ],
        buttons: {
          stripe: "Pay with Stripe",
          mercadoPago: "Pay with Mercado Pago",
          processing: "Processing...",
          opening: "Opening Mercado Pago...",
        },
        note: "Pro plan activates automatically when payment is confirmed.",
      },
    },
    highlights: {
      scale: {
        title: "Scale Your Business",
        desc: "No limits on products, sales, or users. Grow without restrictions.",
      },
      support: {
        title: "Priority Support",
        desc: "Get help when you need it with our dedicated support team.",
      },
      team: {
        title: "Team Management",
        desc: "Add unlimited team members with role-based permissions.",
      },
    },
    security: "Secure payments with Stripe or Mercado Pago",
    successMessage:
      "Mercado Pago ready. Plan activates when you confirm payment.",
  },
  pt: {
    title: "Atualizar para Plano Pro",
    subtitle:
      "Desbloqueie recursos ilimitados e leve seu negócio para o próximo nível",
    payment: {
      canceled: "Pagamento Cancelado",
      canceledDesc:
        "Seu pagamento foi cancelado. Tente novamente quando estiver pronto para atualizar seu plano.",
      retryWhenReady: "Tente novamente quando estiver pronto.",
    },
    plans: {
      free: {
        title: "Plano Gratuito",
        current: "Seu plano atual",
        price: "$0",
        features: [
          "Até 100 produtos",
          "Rastreamento básico de inventário",
          "Relatórios de vendas diários",
          "1 conta de usuário",
          "Suporte comunitário",
        ],
        button: "Plano Atual",
      },
      pro: {
        title: "Plano Pro",
        subtitle: "Tudo o que você precisa para crescer",
        recommended: "RECOMENDADO",
        price: "AR$24.990",
        billing: "/mês",
        paymentMethods: "Pague em ARS com Mercado Pago ou em USD com Stripe",
        features: [
          "Produtos ilimitados",
          "Gerenciamento avançado de inventário",
          "Análises e relatórios em tempo real",
          "Contas de usuário ilimitadas",
          "Suporte prioritário",
          "Integrações personalizadas",
          "Relatórios avançados",
        ],
        buttons: {
          stripe: "Pagar com Stripe",
          mercadoPago: "Pagar com Mercado Pago",
          processing: "Processando...",
          opening: "Abrindo Mercado Pago...",
        },
        note: "O plano Pro é ativado automaticamente quando o pagamento é confirmado.",
      },
    },
    highlights: {
      scale: {
        title: "Dimensione Seu Negócio",
        desc: "Sem limites em produtos, vendas ou usuários. Cresça sem restrições.",
      },
      support: {
        title: "Suporte Prioritário",
        desc: "Obtenha ajuda quando precisar com nossa equipe de suporte dedicada.",
      },
      team: {
        title: "Gerenciamento de Equipe",
        desc: "Adicione membros ilimitados com permissões baseadas em funções.",
      },
    },
    security: "Pagamentos seguros com Stripe ou Mercado Pago",
    successMessage:
      "Mercado Pago pronto. O plano é ativado quando você confirma o pagamento.",
  },
} as const;

export default function UpgradePage() {
  const { currentLanguage } = useGlobalLanguage();
  const copy = (UPGRADE_COPY[currentLanguage] ||
    UPGRADE_COPY.en) as typeof UPGRADE_COPY.en;
  const [mounted, setMounted] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [upgrading, setUpgrading] = useState(false);
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

  const handleUpgrade = async () => {
    setUpgrading(true);
    try {
      const token = localStorage.getItem("accessToken");
      const response = await fetch("/api/stripe/create-checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          email: user?.email,
          fullName: user?.fullName,
          plan: "paid",
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to create checkout session");
      }

      const data = await response.json();

      if (data.data?.url) {
        window.location.href = data.data.url;
      } else {
        throw new Error("No checkout URL returned");
      }
    } catch (error) {
      console.error("Upgrade error:", error);
      const msg = getPaymentErrorMessage(
        error instanceof Error ? error.message : String(error),
        currentLanguage,
      );
      toast.error(msg);
      setUpgrading(false);
    }
  };

  const handleUpgradeMercadoPago = async () => {
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
          planId: "PROFESSIONAL",
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
        toast.success(copy.successMessage);
      } else {
        throw new Error("No se recibió el enlace de pago");
      }
    } catch (error) {
      console.error("Upgrade Mercado Pago error:", error);
      const msg = getPaymentErrorMessage(
        error instanceof Error ? error.message : String(error),
        currentLanguage,
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
        checkoutFailed: "No se pudo crear la sesión de pago",
        linkMissing: "No se recibió el enlace de pago",
        unauthorized: "No autorizado. Inicia sesión nuevamente.",
        invalidToken: "Token inválido. Inicia sesión nuevamente.",
        invalidPlan: "Plan inválido o no disponible.",
        missingFields: "Faltan datos requeridos.",
        generic: "Ocurrió un error al procesar el pago",
      },
      en: {
        createFailed: "Failed to create payment",
        checkoutFailed: "Failed to create checkout session",
        linkMissing: "Payment link was not received",
        unauthorized: "Unauthorized. Please sign in again.",
        invalidToken: "Invalid token. Please sign in again.",
        invalidPlan: "Invalid or unavailable plan.",
        missingFields: "Missing required fields.",
        generic: "An error occurred while processing the payment",
      },
      pt: {
        createFailed: "Não foi possível criar o pagamento",
        checkoutFailed: "Não foi possível criar a sessão de pagamento",
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
    if (s.includes("failed to create checkout")) return L.checkoutFailed;
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

        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {/* Free Plan */}
          <div className="bg-white/90 dark:bg-slate-900/80 rounded-2xl shadow-2xl p-8 border-2 border-slate-300 dark:border-slate-700 backdrop-blur">
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                {copy.plans.free.title}
              </h3>
              <p className="text-slate-600 dark:text-slate-300">
                {copy.plans.free.current}
              </p>
              <div className="mt-4">
                <span className="text-5xl font-bold text-slate-900 dark:text-white">
                  {copy.plans.free.price}
                </span>
                <span className="text-slate-600 dark:text-slate-300">
                  /{copy.plans.free.price === "$0" ? "mes" : "mês"}
                </span>
              </div>
            </div>

            <ul className="space-y-4">
              {copy.plans.free.features.map((feature, idx) => (
                <li key={idx} className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                  <span className="text-slate-700 dark:text-slate-200">
                    {feature}
                  </span>
                </li>
              ))}
            </ul>

            <div className="mt-8">
              <button
                disabled
                className="w-full py-3 bg-slate-300 text-slate-500 dark:bg-slate-800 dark:text-slate-500 rounded-lg font-semibold cursor-not-allowed"
              >
                {copy.plans.free.button}
              </button>
            </div>
          </div>

          {/* Pro Plan */}
          <div className="bg-gradient-to-br from-blue-700 via-indigo-700 to-purple-700 rounded-2xl shadow-2xl p-8 border-2 border-purple-400 relative overflow-hidden">
            <div className="absolute top-4 right-4">
              <span className="bg-yellow-400 text-yellow-900 px-3 py-1 rounded-full text-xs font-bold">
                {copy.plans.pro.recommended}
              </span>
            </div>

            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold text-white mb-2">
                {copy.plans.pro.title}
              </h3>
              <p className="text-blue-100">{copy.plans.pro.subtitle}</p>
              <div className="mt-4">
                <span className="text-5xl font-bold text-white">
                  {copy.plans.pro.price}
                </span>
                <span className="text-blue-100">{copy.plans.pro.billing}</span>
                <p className="text-blue-100 text-sm mt-1">
                  {copy.plans.pro.paymentMethods}
                </p>
              </div>
            </div>

            <ul className="space-y-4 mb-8">
              {copy.plans.pro.features.map((feature, idx) => (
                <li key={idx} className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                  <span className="text-white font-medium">{feature}</span>
                </li>
              ))}
            </ul>

            <div className="space-y-3">
              <button
                onClick={handleUpgrade}
                disabled={upgrading}
                className="w-full py-3 bg-white text-blue-600 rounded-lg font-bold hover:bg-blue-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {upgrading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                    <span>{copy.plans.pro.buttons.processing}</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-5 h-5" />
                    <span>{copy.plans.pro.buttons.stripe}</span>
                  </>
                )}
              </button>

              <button
                onClick={handleUpgradeMercadoPago}
                disabled={mpUpgrading}
                className="w-full py-3 bg-[#00a650] text-white rounded-lg font-bold hover:bg-[#009444] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {mpUpgrading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>{copy.plans.pro.buttons.opening}</span>
                  </>
                ) : (
                  <>
                    <CreditCard className="w-5 h-5" />
                    <span>{copy.plans.pro.buttons.mercadoPago}</span>
                  </>
                )}
              </button>

              <p className="text-center text-xs text-blue-100">
                {copy.plans.pro.note}
              </p>
            </div>
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
          <div className="inline-flex items-center gap-2 text-slate-700 dark:text-slate-200 bg-white/90 dark:bg-slate-900/80 px-6 py-3 rounded-full shadow border border-slate-300 dark:border-slate-800">
            <CreditCard className="w-5 h-5" />
            <span className="text-sm font-medium">{copy.security}</span>
          </div>
        </div>
      </main>
    </div>
  );
}

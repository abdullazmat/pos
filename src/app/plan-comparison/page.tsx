"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useGlobalLanguage } from "@/lib/hooks/useGlobalLanguage";
import Header from "@/components/layout/Header";
import Link from "next/link";
import { Crown, Star } from "lucide-react";

interface User {
  id: string;
  email: string;
  fullName: string;
  role: string;
}

interface Plan {
  id: string; // "FREE" | "PRO"
  name: string;
  price: number;
  billing: string;
  popular?: boolean;
}

interface Subscription {
  planId: string; // "FREE" | "PRO" | others
}

const PLAN_COMPARISON_COPY = {
  es: {
    title: "Comparación de Planes",
    currentPlan: "Plan Actual:",
    loading: "Cargando...",
    free: "Gratuito",
    unlimited: "ilimitado",
    notAvailable: "No disponible",
    characteristics: "Características",
    limitsSection: "Límites",
    posSection: "POS",
    cashBoxSection: "Control de Caja",
    managementSection: "Gestión",
    reportsSection: "Reportes",
    configSection: "Configuración",
    freeHeader: "Gratuito",
    proHeader: "Pro",
    codeScan: "Escaneo de Códigos",
    multiPaymentMethods: "Múltiples Métodos de Pago",
    creditSales: "Ventas a Crédito/Fiado",
    basicCashControl: "Control de Caja Básico",
    cashWithdrawals: "Retiros de Caja",
    cashAudit: "Auditoría de Caja",
    returns: "Devoluciones",
    stockManagement: "Gestión de Stock",
    userManagement: "Gestión de Usuarios",
    excelImport: "Importación Excel/CSV",
    basicReports: "Reportes Básicos",
    advancedReports: "Reportes Avanzados",
    chartsGraphs: "Gráficos y Charts",
    exportReports: "Exportar Reportes",
    businessConfig: "Configuración del Negocio",
    customTickets: "Tickets Personalizados",
    customBranding: "Marca Personalizada",
    legend: "Leyenda:",
    availableFeature: "Característica disponible",
    unavailableFeature: "Característica no disponible",
    changeMethod: "Cambiar de Plan:",
    changeLinkText: "Configuración del Negocio",
    changePlanMessage: "para cambiar tu plan de suscripción.",
    limits: {
      products: "Productos",
      users: "Usuarios",
      categories: "Categorías",
      clients: "Clientes",
      suppliers: "Proveedores",
      paymentMethods: "Métodos de Pago",
      maxDiscount: "Descuento Máximo",
    },
    features: {
      pos: "Sistema POS",
      weightProducts: "Productos por Peso",
      inventory: "Gestión de Inventario",
      productNotes: "Notas en Productos",
      discounts: "Descuentos",
      reports: "Reportes",
      clients: "Gestión de Clientes",
      suppliers: "Gestión de Proveedores",
      expenses: "Registro de Gastos",
      cashBox: "Caja y Cierre",
      customKeyboard: "Teclado Personalizado",
      mercadoPago: "Mercado Pago",
    },
    buttons: {
      select: "Seleccionar Plan",
      current: "Plan seleccionado",
      subscribe: "Click para suscribirse →",
    },
    planNames: {
      free: "Gratuito",
      pro: "Pro",
    },
    billing: {
      perMonth: "/mes",
    },
    labels: {
      popular: "Popular",
    },
  },
  en: {
    title: "Plan Comparison",
    currentPlan: "Current Plan:",
    loading: "Loading...",
    free: "Free",
    unlimited: "unlimited",
    notAvailable: "Not available",
    characteristics: "Features",
    limitsSection: "Limits",
    posSection: "POS",
    cashBoxSection: "Cash Control",
    managementSection: "Management",
    reportsSection: "Reports",
    configSection: "Configuration",
    freeHeader: "Free",
    proHeader: "Pro",
    codeScan: "Code Scanning",
    multiPaymentMethods: "Multiple Payment Methods",
    creditSales: "Credit/Installment Sales",
    basicCashControl: "Basic Cash Control",
    cashWithdrawals: "Cash Withdrawals",
    cashAudit: "Cash Audit",
    returns: "Returns",
    stockManagement: "Stock Management",
    userManagement: "User Management",
    excelImport: "Excel/CSV Import",
    basicReports: "Basic Reports",
    advancedReports: "Advanced Reports",
    chartsGraphs: "Charts & Graphs",
    exportReports: "Export Reports",
    businessConfig: "Business Configuration",
    customTickets: "Custom Tickets",
    customBranding: "Custom Branding",
    legend: "Legend:",
    availableFeature: "Feature available",
    unavailableFeature: "Feature not available",
    changeMethod: "Change Plan:",
    changeLinkText: "Business Configuration",
    changePlanMessage: "to change your subscription plan.",
    limits: {
      products: "Products",
      users: "Users",
      categories: "Categories",
      clients: "Clients",
      suppliers: "Suppliers",
      paymentMethods: "Payment Methods",
      maxDiscount: "Max Discount",
    },
    features: {
      pos: "POS System",
      weightProducts: "Weight Products",
      inventory: "Inventory Management",
      productNotes: "Product Notes",
      discounts: "Discounts",
      reports: "Reports",
      clients: "Client Management",
      suppliers: "Supplier Management",
      expenses: "Expense Tracking",
      cashBox: "Cash & Closure",
      customKeyboard: "Custom Keyboard",
      mercadoPago: "Mercado Pago",
    },
    buttons: {
      select: "Select Plan",
      current: "Selected plan",
      subscribe: "Subscribe now →",
    },
    planNames: {
      free: "Free",
      pro: "Pro",
    },
    billing: {
      perMonth: "/month",
    },
    labels: {
      popular: "Popular",
    },
  },
  pt: {
    title: "Comparação de Planos",
    currentPlan: "Plano Atual:",
    loading: "Carregando...",
    free: "Gratuito",
    unlimited: "ilimitado",
    notAvailable: "Não disponível",
    characteristics: "Características",
    limitsSection: "Limites",
    posSection: "PDV",
    cashBoxSection: "Controle de Caixa",
    managementSection: "Gerenciamento",
    reportsSection: "Relatórios",
    configSection: "Configuração",
    freeHeader: "Gratuito",
    proHeader: "Pro",
    codeScan: "Escaneamento de Códigos",
    multiPaymentMethods: "Múltiplos Métodos de Pagamento",
    creditSales: "Vendas a Crédito/Parceladas",
    basicCashControl: "Controle Básico de Caixa",
    cashWithdrawals: "Retiradas de Caixa",
    cashAudit: "Auditoria de Caixa",
    returns: "Devoluções",
    stockManagement: "Gerenciamento de Estoque",
    userManagement: "Gerenciamento de Usuários",
    excelImport: "Importação Excel/CSV",
    basicReports: "Relatórios Básicos",
    advancedReports: "Relatórios Avançados",
    chartsGraphs: "Gráficos e Tabelas",
    exportReports: "Exportar Relatórios",
    businessConfig: "Configuração de Negócios",
    customTickets: "Tíquetes Personalizados",
    customBranding: "Marca Personalizada",
    legend: "Legenda:",
    availableFeature: "Recurso disponível",
    unavailableFeature: "Recurso não disponível",
    changeMethod: "Alterar Plano:",
    changeLinkText: "Configuração de Negócios",
    changePlanMessage: "para alterar seu plano de assinatura.",
    limits: {
      products: "Produtos",
      users: "Usuários",
      categories: "Categorias",
      clients: "Clientes",
      suppliers: "Fornecedores",
      paymentMethods: "Métodos de Pagamento",
      maxDiscount: "Desconto Máximo",
    },
    features: {
      pos: "Sistema PDV",
      weightProducts: "Produtos por Peso",
      inventory: "Gerenciamento de Inventário",
      productNotes: "Notas em Produtos",
      discounts: "Descontos",
      reports: "Relatórios",
      clients: "Gerenciamento de Clientes",
      suppliers: "Gerenciamento de Fornecedores",
      expenses: "Registro de Despesas",
      cashBox: "Caixa e Fechamento",
      customKeyboard: "Teclado Personalizado",
      mercadoPago: "Mercado Pago",
    },
    buttons: {
      select: "Selecionar Plano",
      current: "Plano selecionado",
      subscribe: "Clique para assinar →",
    },
    planNames: {
      free: "Gratuito",
      pro: "Pro",
    },
    billing: {
      perMonth: "/mês",
    },
    labels: {
      popular: "Popular",
    },
  },
};

export default function PlanComparisonPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const router = useRouter();
  const { currentLanguage } = useGlobalLanguage();
  const copy =
    PLAN_COMPARISON_COPY[
      currentLanguage as keyof typeof PLAN_COMPARISON_COPY
    ] || PLAN_COMPARISON_COPY.es;

  const normalizePlanId = (planId?: string | null) => {
    const normalized = (planId || "").toUpperCase();

    if (normalized === "FREE") return "BASIC";
    if (normalized === "PRO") return "PROFESSIONAL";
    if (normalized === "PREMIUM") return "ENTERPRISE";

    return normalized;
  };

  const isCurrentPlan = (planId: string) => {
    const normalizedCurrentPlan = normalizePlanId(subscription?.planId);
    const normalizedPlan = normalizePlanId(planId);

    return Boolean(
      normalizedCurrentPlan &&
      normalizedPlan &&
      normalizedCurrentPlan === normalizedPlan,
    );
  };

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (!storedUser) {
      router.push("/auth/login");
      return;
    }
    const parsedUser = JSON.parse(storedUser);
    setUser(parsedUser);
    if (parsedUser?.role !== "admin") {
      router.push("/dashboard");
      return;
    }
    fetchPlans();
    fetchSubscription();
  }, [router]);

  const fetchPlans = async () => {
    try {
      const res = await fetch("/api/plans");
      if (res.ok) {
        const data = await res.json();
        setPlans(data.data.plans || []);
      }
    } catch (e) {
      console.error("fetch plans", e);
    } finally {
      setLoading(false);
    }
  };

  const fetchSubscription = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      const res = await fetch("/api/subscription", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setSubscription(data.data.subscription);
      }
    } catch (e) {
      console.error("fetch subscription", e);
    }
  };

  const currentPlanName = (() => {
    const normalizedCurrentPlan = normalizePlanId(subscription?.planId);
    const plan = plans.find(
      (p) => normalizePlanId(p.id) === normalizedCurrentPlan,
    );
    return (
      plan?.name ||
      (normalizedCurrentPlan === "PROFESSIONAL" ? "Pro" : copy.free)
    );
  })();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white dark:bg-slate-950">
        <div className="text-slate-600 dark:text-slate-400">
          {copy.loading}
        </div>
      </div>
    );
  }

  // Comparison data based on screenshot
  const limitsRows: { label: string; free: string; pro: string }[] = [
    { label: copy.limits.products, free: "100", pro: copy.unlimited },
    { label: copy.limits.users, free: "2", pro: copy.unlimited },
    { label: copy.limits.categories, free: "20", pro: copy.unlimited },
    {
      label: copy.limits.clients,
      free: copy.notAvailable,
      pro: copy.unlimited,
    },
    { label: copy.limits.suppliers, free: "5", pro: copy.unlimited },
    { label: copy.limits.paymentMethods, free: "2", pro: copy.unlimited },
    { label: copy.limits.maxDiscount, free: copy.notAvailable, pro: "100%" },
  ];

  const checkRowsPOS: { label: string; free: boolean; pro: boolean }[] = [
    { label: copy.features.pos, free: true, pro: true },
    { label: copy.codeScan, free: true, pro: true },
    { label: copy.features.weightProducts, free: true, pro: true },
    { label: copy.features.discounts, free: false, pro: true },
    { label: copy.multiPaymentMethods, free: false, pro: true },
    { label: copy.creditSales, free: false, pro: true },
    { label: copy.features.productNotes, free: false, pro: true },
  ];

  const checkRowsCaja: { label: string; free: boolean; pro: boolean }[] = [
    { label: copy.basicCashControl, free: true, pro: true },
    { label: copy.cashWithdrawals, free: false, pro: true },
    { label: copy.cashAudit, free: false, pro: true },
    { label: copy.returns, free: true, pro: true },
  ];

  const checkRowsGestion: { label: string; free: boolean; pro: boolean }[] = [
    { label: copy.stockManagement, free: true, pro: true },
    { label: copy.features.clients, free: false, pro: true },
    { label: copy.features.suppliers, free: true, pro: true },
    { label: copy.features.expenses, free: false, pro: true },
    { label: copy.userManagement, free: true, pro: true },
    { label: copy.excelImport, free: false, pro: true },
  ];

  const checkRowsReportes: { label: string; free: boolean; pro: boolean }[] = [
    { label: copy.basicReports, free: true, pro: true },
    { label: copy.advancedReports, free: false, pro: true },
    { label: copy.chartsGraphs, free: false, pro: true },
    { label: copy.exportReports, free: false, pro: true },
  ];

  const checkRowsConfig: { label: string; free: boolean; pro: boolean }[] = [
    { label: copy.features.customKeyboard, free: true, pro: true },
    { label: copy.businessConfig, free: true, pro: true },
    { label: copy.customTickets, free: false, pro: true },
    { label: copy.customBranding, free: false, pro: true },
  ];

  const Section = ({
    title,
    children,
  }: {
    title: string;
    children: React.ReactNode;
  }) => (
    <section className="bg-white border border-slate-300 dark:bg-slate-900/80 dark:border-slate-800 rounded-xl overflow-hidden">
      <div className="px-4 py-3 bg-slate-100 border-b border-slate-300 dark:bg-slate-900/60 dark:border-slate-800 flex items-center gap-2">
        <h2 className="text-slate-900 dark:text-slate-200 font-semibold">
          {title}
        </h2>
      </div>
      <div>{children}</div>
    </section>
  );

  const RowLimits = ({
    label,
    free,
    pro,
  }: {
    label: string;
    free: string;
    pro: string;
  }) => (
    <div className="grid grid-cols-3 px-4 py-3 text-sm border-t border-slate-200 dark:border-slate-800/60">
      <div className="text-slate-700 dark:text-slate-300">{label}</div>
      <div className="text-center text-slate-900 dark:text-slate-200">
        {free}
      </div>
      <div className="text-center text-slate-900 dark:text-slate-200">
        {pro}
      </div>
    </div>
  );

  const RowCheck = ({
    label,
    free,
    pro,
  }: {
    label: string;
    free: boolean;
    pro: boolean;
  }) => (
    <div className="grid grid-cols-3 px-4 py-3 text-sm border-t border-slate-200 dark:border-slate-800/60">
      <div className="text-slate-700 dark:text-slate-300">{label}</div>
      <div className="text-center">
        {free ? (
          <span className="text-green-600 dark:text-green-400">✓</span>
        ) : (
          <span className="text-slate-600 dark:text-slate-500">✕</span>
        )}
      </div>
      <div className="text-center">
        {pro ? (
          <span className="text-green-600 dark:text-green-400">✓</span>
        ) : (
          <span className="text-slate-600 dark:text-slate-500">✕</span>
        )}
      </div>
    </div>
  );

  const freePlan = plans.find((p) => p.id === "FREE") || {
    id: "FREE",
    name: copy.planNames.free,
    price: 0,
    billing: copy.billing.perMonth,
  };
  const proPlan = plans.find((p) => p.id === "PRO") || {
    id: "PRO",
    name: copy.planNames.pro,
    price: 24990,
    billing: copy.billing.perMonth,
    popular: true,
  };

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 text-gray-900 dark:text-slate-100">
      <Header user={user} showBackButton />
      <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        {/* Title */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white text-center">
            {copy.title}
          </h1>
          <p className="text-center text-slate-600 dark:text-slate-400 mt-1">
            {copy.currentPlan}{" "}
            <span className="text-purple-600 dark:text-purple-300 font-semibold">
              {currentPlanName}
            </span>
          </p>
        </div>

        {/* Plans header */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
          {/* Free */}
          <div
            className={`rounded-xl border ${isCurrentPlan("FREE") ? "border-purple-600" : "border-slate-300 dark:border-slate-800"} bg-white dark:bg-slate-900 p-5`}
          >
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2 py-0.5 text-xs font-semibold bg-slate-200 border border-slate-300 text-slate-700 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300 rounded">
                FREE
              </span>
            </div>
            <div className="text-slate-900 dark:text-white font-semibold">
              {freePlan.name}
            </div>
            <div className="mt-1 text-slate-700 dark:text-slate-300 text-sm">
              $ {freePlan.price}
              {copy.billing.perMonth}
            </div>
            <div className="mt-4">
              <button
                className={`w-full py-2 rounded-lg text-sm font-semibold ${isCurrentPlan("FREE") ? "bg-purple-700 text-white" : "bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300"}`}
              >
                {isCurrentPlan("FREE")
                  ? copy.buttons.current
                  : copy.buttons.select}
              </button>
            </div>
          </div>

          {/* Pro */}
          <div
            className={`rounded-xl border ${isCurrentPlan("PRO") ? "border-purple-600" : "border-slate-300 dark:border-slate-800"} bg-white dark:bg-slate-900 p-5`}
          >
            <div className="flex items-center gap-2 mb-2">
              <Star className="w-4 h-4 text-yellow-500 dark:text-yellow-300" />
              <span className="px-2 py-0.5 text-xs font-semibold text-yellow-700 bg-yellow-100 border border-yellow-300 dark:text-yellow-300 dark:bg-yellow-900/40 dark:border-yellow-700/50 rounded">
                {copy.labels.popular}
              </span>
            </div>
            <div className="text-slate-900 dark:text-white font-semibold">
              {proPlan.name}
            </div>
            <div className="mt-1 text-slate-700 dark:text-slate-300 text-sm">
              $ {proPlan.price.toLocaleString()}
              {copy.billing.perMonth}
            </div>
            <div className="mt-4">
              <Link
                href="/business-config"
                className={`block w-full py-2 rounded-lg text-sm font-semibold ${isCurrentPlan("PRO") ? "bg-purple-700 text-white" : "bg-purple-600 hover:bg-purple-500 text-white"}`}
              >
                {isCurrentPlan("PRO")
                  ? copy.buttons.current
                  : copy.buttons.subscribe}
              </Link>
            </div>
          </div>
        </div>

        {/* Characteristics label */}
        <div className="text-slate-700 dark:text-slate-300 mb-2">
          {copy.characteristics}
        </div>

        {/* Limits */}
        <Section title={copy.limitsSection}>
          <div className="grid grid-cols-3 px-4 py-2 text-xs bg-slate-100 dark:bg-slate-900/40 text-slate-700 dark:text-slate-300">
            <div></div>
            <div className="text-center">{copy.freeHeader}</div>
            <div className="text-center">{copy.proHeader}</div>
          </div>
          {limitsRows.map((r) => (
            <RowLimits key={r.label} {...r} />
          ))}
        </Section>

        {/* POS */}
        <div className="mt-6">
          <Section title={copy.posSection}>
            <div className="grid grid-cols-3 px-4 py-2 text-xs bg-slate-100 dark:bg-slate-900/40 text-slate-700 dark:text-slate-300">
              <div></div>
              <div className="text-center">{copy.freeHeader}</div>
              <div className="text-center">{copy.proHeader}</div>
            </div>
            {checkRowsPOS.map((r) => (
              <RowCheck key={r.label} {...r} />
            ))}
          </Section>
        </div>

        {/* Control de Caja */}
        <div className="mt-6">
          <Section title={copy.cashBoxSection}>
            <div className="grid grid-cols-3 px-4 py-2 text-xs bg-slate-100 dark:bg-slate-900/40 text-slate-700 dark:text-slate-300">
              <div></div>
              <div className="text-center">{copy.freeHeader}</div>
              <div className="text-center">{copy.proHeader}</div>
            </div>
            {checkRowsCaja.map((r) => (
              <RowCheck key={r.label} {...r} />
            ))}
          </Section>
        </div>

        {/* Gestión */}
        <div className="mt-6">
          <Section title={copy.managementSection}>
            <div className="grid grid-cols-3 px-4 py-2 text-xs bg-slate-100 dark:bg-slate-900/40 text-slate-700 dark:text-slate-300">
              <div></div>
              <div className="text-center">{copy.freeHeader}</div>
              <div className="text-center">{copy.proHeader}</div>
            </div>
            {checkRowsGestion.map((r) => (
              <RowCheck key={r.label} {...r} />
            ))}
          </Section>
        </div>

        {/* Reportes */}
        <div className="mt-6">
          <Section title={copy.reportsSection}>
            <div className="grid grid-cols-3 px-4 py-2 text-xs bg-slate-100 dark:bg-slate-900/40 text-slate-700 dark:text-slate-300">
              <div></div>
              <div className="text-center">{copy.freeHeader}</div>
              <div className="text-center">{copy.proHeader}</div>
            </div>
            {checkRowsReportes.map((r) => (
              <RowCheck key={r.label} {...r} />
            ))}
          </Section>
        </div>

        {/* Configuración */}
        <div className="mt-6">
          <Section title={copy.configSection}>
            <div className="grid grid-cols-3 px-4 py-2 text-xs bg-slate-100 dark:bg-slate-900/40 text-slate-700 dark:text-slate-300">
              <div></div>
              <div className="text-center">{copy.freeHeader}</div>
              <div className="text-center">{copy.proHeader}</div>
            </div>
            {checkRowsConfig.map((r) => (
              <RowCheck key={r.label} {...r} />
            ))}
          </Section>
        </div>

        {/* Legend */}
        <div className="mt-6 bg-white border border-slate-300 dark:bg-slate-900 dark:border-slate-800 rounded-xl p-4">
          <div className="text-slate-700 dark:text-slate-300 text-sm">
            💡 <span className="font-semibold">{copy.legend}</span>
          </div>
          <div className="mt-2 text-xs text-slate-600 dark:text-slate-400 flex gap-6">
            <span>✓ {copy.availableFeature}</span>
            <span>✕ {copy.unavailableFeature}</span>
          </div>
        </div>

        {/* Callout */}
        <div className="mt-4 bg-purple-50 border border-purple-300 dark:bg-purple-900/30 dark:border-purple-700/40 rounded-xl p-4 text-sm text-purple-800 dark:text-purple-200">
          📦 {copy.changeMethod} Ve a Configuración →{" "}
          <Link href="/business-config" className="underline">
            {copy.changeLinkText}
          </Link>{" "}
          {copy.changePlanMessage}
        </div>
      </div>
    </div>
  );
}

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
      free: "Básico",
      esencial: "Esencial",
      profesional: "Profesional",
      crecimiento: "Crecimiento",
    },
    billing: {
      perMonth: "/mes",
    },
    labels: {
      popular: "Popular",
      bestValue: "Mejor Valor",
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
      free: "Basic",
      esencial: "Essential",
      profesional: "Professional",
      crecimiento: "Growth",
    },
    billing: {
      perMonth: "/month",
    },
    labels: {
      popular: "Popular",
      bestValue: "Best Value",
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
      free: "Básico",
      esencial: "Essencial",
      profesional: "Profissional",
      crecimiento: "Crescimento",
    },
    billing: {
      perMonth: "/mês",
    },
    labels: {
      popular: "Popular",
      bestValue: "Melhor Valor",
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
    if (normalized === "PRO") return "PROFESIONAL";
    if (normalized === "PREMIUM") return "CRECIMIENTO";
    if (normalized === "PROFESSIONAL") return "PROFESIONAL";
    if (normalized === "ENTERPRISE") return "CRECIMIENTO";

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
    if (plan) return plan.name;
    
    if (normalizedCurrentPlan === "PROFESIONAL" || normalizedCurrentPlan === "PROFESSIONAL") return copy.planNames.profesional;
    if (normalizedCurrentPlan === "ESENCIAL") return copy.planNames.esencial;
    if (normalizedCurrentPlan === "CRECIMIENTO") return copy.planNames.crecimiento;
    return copy.planNames.free;
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
  const limitsRows = [
    { label: copy.limits.products, free: "100", esencial: "500", profesional: "3.000", crecimiento: "10.000" },
    { label: copy.limits.users, free: "1", esencial: "1", profesional: "3", crecimiento: "10" },
    { label: copy.limits.categories, free: "10", esencial: "100", profesional: "9.999", crecimiento: copy.unlimited },
    { label: copy.limits.clients, free: "10", esencial: "500", profesional: "3.000", crecimiento: copy.unlimited },
    { label: copy.limits.suppliers, free: "5", esencial: "20", profesional: "100", crecimiento: copy.unlimited },
    { label: copy.limits.paymentMethods, free: "2", esencial: "5", profesional: copy.unlimited, crecimiento: copy.unlimited },
    { label: copy.limits.maxDiscount, free: copy.notAvailable, esencial: "15%", profesional: "100%", crecimiento: "100%" },
  ];

  const checkRowsPOS = [
    { label: copy.features.pos, free: true, esencial: true, profesional: true, crecimiento: true },
    { label: copy.codeScan, free: true, esencial: true, profesional: true, crecimiento: true },
    { label: copy.features.weightProducts, free: true, esencial: true, profesional: true, crecimiento: true },
    { label: copy.features.discounts, free: false, esencial: true, profesional: true, crecimiento: true },
    { label: copy.multiPaymentMethods, free: false, esencial: true, profesional: true, crecimiento: true },
    { label: copy.creditSales, free: false, esencial: false, profesional: true, crecimiento: true },
    { label: copy.features.productNotes, free: false, esencial: true, profesional: true, crecimiento: true },
  ];

  const checkRowsCaja = [
    { label: copy.basicCashControl, free: true, esencial: true, profesional: true, crecimiento: true },
    { label: copy.cashWithdrawals, free: false, esencial: true, profesional: true, crecimiento: true },
    { label: copy.cashAudit, free: false, esencial: false, profesional: true, crecimiento: true },
    { label: copy.returns, free: true, esencial: true, profesional: true, crecimiento: true },
  ];

  const checkRowsGestion = [
    { label: copy.stockManagement, free: true, esencial: true, profesional: true, crecimiento: true },
    { label: copy.features.clients, free: true, esencial: true, profesional: true, crecimiento: true },
    { label: copy.features.suppliers, free: true, esencial: true, profesional: true, crecimiento: true },
    { label: copy.features.expenses, free: false, esencial: true, profesional: true, crecimiento: true },
    { label: copy.userManagement, free: true, esencial: true, profesional: true, crecimiento: true },
    { label: copy.excelImport, free: false, esencial: true, profesional: true, crecimiento: true },
  ];

  const checkRowsReportes = [
    { label: copy.basicReports, free: true, esencial: true, profesional: true, crecimiento: true },
    { label: copy.advancedReports, free: false, esencial: false, profesional: true, crecimiento: true },
    { label: copy.chartsGraphs, free: false, esencial: false, profesional: true, crecimiento: true },
    { label: copy.exportReports, free: false, esencial: true, profesional: true, crecimiento: true },
  ];

  const checkRowsConfig = [
    { label: copy.features.customKeyboard, free: true, esencial: true, profesional: true, crecimiento: true },
    { label: copy.businessConfig, free: true, esencial: true, profesional: true, crecimiento: true },
    { label: copy.customTickets, free: false, esencial: false, profesional: true, crecimiento: true },
    { label: copy.customBranding, free: false, esencial: false, profesional: true, crecimiento: true },
    { label: copy.features.mercadoPago, free: false, esencial: true, profesional: true, crecimiento: true },
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
    esencial,
    profesional,
    crecimiento,
  }: {
    label: string;
    free: string;
    esencial: string;
    profesional: string;
    crecimiento: string;
  }) => (
    <div className="grid grid-cols-5 px-4 py-3 text-[10px] md:text-sm border-t border-slate-200 dark:border-slate-800/60">
      <div className="text-slate-700 dark:text-slate-300 font-medium">{label}</div>
      <div className="text-center text-slate-800 dark:text-slate-200">{free}</div>
      <div className="text-center text-slate-800 dark:text-slate-200">{esencial}</div>
      <div className="text-center text-slate-800 dark:text-slate-200">{profesional}</div>
      <div className="text-center text-slate-800 dark:text-slate-200">{crecimiento}</div>
    </div>
  );

  const RowCheck = ({
    label,
    free,
    esencial,
    profesional,
    crecimiento,
  }: {
    label: string;
    free: boolean;
    esencial: boolean;
    profesional: boolean;
    crecimiento: boolean;
  }) => (
    <div className="grid grid-cols-5 px-4 py-3 text-[10px] md:text-sm border-t border-slate-200 dark:border-slate-800/60">
      <div className="text-slate-700 dark:text-slate-300 font-medium">{label}</div>
      <div className="text-center">
        {free ? <span className="text-green-500 font-bold">✓</span> : <span className="text-slate-400">✕</span>}
      </div>
      <div className="text-center">
        {esencial ? <span className="text-green-500 font-bold">✓</span> : <span className="text-slate-400">✕</span>}
      </div>
      <div className="text-center">
        {profesional ? <span className="text-green-500 font-bold">✓</span> : <span className="text-slate-400">✕</span>}
      </div>
      <div className="text-center">
        {crecimiento ? <span className="text-green-500 font-bold">✓</span> : <span className="text-slate-400">✕</span>}
      </div>
    </div>
  );

  const basicPlan = plans.find((p) => p.id === "BASIC" || p.id === "FREE") || {
    id: "BASIC",
    name: copy.planNames.free,
    price: 0,
    billing: copy.billing.perMonth,
  };
  const esencialPlan = plans.find((p) => p.id === "ESENCIAL") || {
    id: "ESENCIAL",
    name: copy.planNames.esencial,
    price: 14999,
    billing: copy.billing.perMonth,
  };
  const profesionalPlan = plans.find((p) => p.id === "PROFESIONAL") || {
    id: "PROFESIONAL",
    name: copy.planNames.profesional,
    price: 29999,
    billing: copy.billing.perMonth,
    popular: true,
  };
  const crecimientoPlan = plans.find((p) => p.id === "CRECIMIENTO") || {
    id: "CRECIMIENTO",
    name: copy.planNames.crecimiento,
    price: 54999,
    billing: copy.billing.perMonth,
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

        {/* Plans cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {/* Basic */}
          <div className={`rounded-xl border ${isCurrentPlan(basicPlan.id) ? "border-purple-500 bg-purple-50/10" : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900"} p-4 flex flex-col`}>
             <div className="text-[10px] font-bold text-slate-400 mb-1 uppercase tracking-wider">Plan Trial</div>
             <div className="text-lg font-bold dark:text-white">{basicPlan.name}</div>
             <div className="text-2xl font-black mt-2">$0 <span className="text-xs font-normal text-slate-500">{copy.billing.perMonth}</span></div>
             <div className="mt-auto pt-4">
                <button disabled className="w-full py-2 rounded-lg text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-400">
                  {isCurrentPlan(basicPlan.id) ? copy.buttons.current : copy.buttons.select}
                </button>
             </div>
          </div>

          {/* Esencial */}
          <div className={`rounded-xl border ${isCurrentPlan(esencialPlan.id) ? "border-purple-500 bg-purple-50/10" : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900"} p-4 flex flex-col relative`}>
             <div className="text-[10px] font-bold text-blue-500 mb-1 uppercase tracking-wider">Ideal Kioscos</div>
             <div className="text-lg font-bold dark:text-white">{esencialPlan.name}</div>
             <div className="text-2xl font-black mt-2">AR$14.999 <span className="text-xs font-normal text-slate-500">{copy.billing.perMonth}</span></div>
             <div className="mt-auto pt-4">
                <Link href="/business-config" className={`block w-full py-2 rounded-lg text-xs font-bold text-center transition-colors ${isCurrentPlan(esencialPlan.id) ? "bg-purple-600 text-white" : "bg-purple-100 text-purple-700 hover:bg-purple-200 dark:bg-purple-900/40 dark:text-purple-300"}`}>
                  {isCurrentPlan(esencialPlan.id) ? copy.buttons.current : copy.buttons.subscribe}
                </Link>
             </div>
          </div>

          {/* Profesional */}
          <div className={`rounded-xl border ${isCurrentPlan(profesionalPlan.id) ? "border-purple-500 bg-purple-50/10" : "border-blue-400 bg-blue-50/5 dark:bg-blue-900/5"} p-4 flex flex-col relative overflow-hidden`}>
             <div className="absolute top-0 right-0 bg-blue-500 text-white text-[8px] font-black px-2 py-0.5 rounded-bl-lg uppercase">{copy.labels.popular}</div>
             <div className="text-[10px] font-bold text-purple-500 mb-1 uppercase tracking-wider">RECOMENDADO</div>
             <div className="text-lg font-bold dark:text-white">{profesionalPlan.name}</div>
             <div className="text-2xl font-black mt-2">AR$29.999 <span className="text-xs font-normal text-slate-500">{copy.billing.perMonth}</span></div>
             <div className="mt-auto pt-4">
                <Link href="/business-config" className={`block w-full py-2 rounded-lg text-xs font-bold text-center transition-colors ${isCurrentPlan(profesionalPlan.id) ? "bg-purple-600 text-white" : "bg-purple-600 text-white hover:bg-purple-700 shadow-lg shadow-purple-500/20"}`}>
                  {isCurrentPlan(profesionalPlan.id) ? copy.buttons.current : copy.buttons.subscribe}
                </Link>
             </div>
          </div>

          {/* Crecimiento */}
          <div className={`rounded-xl border ${isCurrentPlan(crecimientoPlan.id) ? "border-purple-500 bg-purple-50/10" : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900"} p-4 flex flex-col`}>
             <div className="text-[10px] font-bold text-yellow-600 mb-1 uppercase tracking-wider">SIN LÍMITES</div>
             <div className="text-lg font-bold dark:text-white">{crecimientoPlan.name}</div>
             <div className="text-2xl font-black mt-2">AR$54.999 <span className="text-xs font-normal text-slate-500">{copy.billing.perMonth}</span></div>
             <div className="mt-auto pt-4">
                <Link href="/business-config" className={`block w-full py-2 rounded-lg text-xs font-bold text-center transition-colors ${isCurrentPlan(crecimientoPlan.id) ? "bg-purple-600 text-white" : "bg-slate-900 text-white hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200"}`}>
                  {isCurrentPlan(crecimientoPlan.id) ? copy.buttons.current : copy.buttons.subscribe}
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
          <div className="grid grid-cols-5 px-4 py-2 text-[8px] md:text-[10px] bg-slate-100 dark:bg-slate-900/40 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
            <div></div>
            <div className="text-center">{copy.planNames.free}</div>
            <div className="text-center">{copy.planNames.esencial}</div>
            <div className="text-center">{copy.planNames.profesional}</div>
            <div className="text-center">{copy.planNames.crecimiento}</div>
          </div>
          {limitsRows.map((r) => (
            <RowLimits key={r.label} {...r} />
          ))}
        </Section>

        {/* POS */}
        <div className="mt-6">
          <Section title={copy.posSection}>
            <div className="grid grid-cols-5 px-4 py-2 text-[8px] md:text-[10px] bg-slate-100 dark:bg-slate-900/40 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
              <div></div>
              <div className="text-center">{copy.planNames.free}</div>
              <div className="text-center">{copy.planNames.esencial}</div>
              <div className="text-center">{copy.planNames.profesional}</div>
              <div className="text-center">{copy.planNames.crecimiento}</div>
            </div>
            {checkRowsPOS.map((r) => (
              <RowCheck key={r.label} {...r} />
            ))}
          </Section>
        </div>

        {/* Control de Caja */}
        <div className="mt-6">
          <Section title={copy.cashBoxSection}>
            <div className="grid grid-cols-5 px-4 py-2 text-[8px] md:text-[10px] bg-slate-100 dark:bg-slate-900/40 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
              <div></div>
              <div className="text-center">{copy.planNames.free}</div>
              <div className="text-center">{copy.planNames.esencial}</div>
              <div className="text-center">{copy.planNames.profesional}</div>
              <div className="text-center">{copy.planNames.crecimiento}</div>
            </div>
            {checkRowsCaja.map((r) => (
              <RowCheck key={r.label} {...r} />
            ))}
          </Section>
        </div>

        {/* Gestión */}
        <div className="mt-6">
          <Section title={copy.managementSection}>
            <div className="grid grid-cols-5 px-4 py-2 text-[8px] md:text-[10px] bg-slate-100 dark:bg-slate-900/40 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
              <div></div>
              <div className="text-center">{copy.planNames.free}</div>
              <div className="text-center">{copy.planNames.esencial}</div>
              <div className="text-center">{copy.planNames.profesional}</div>
              <div className="text-center">{copy.planNames.crecimiento}</div>
            </div>
            {checkRowsGestion.map((r) => (
              <RowCheck key={r.label} {...r} />
            ))}
          </Section>
        </div>

        {/* Reportes */}
        <div className="mt-6">
          <Section title={copy.reportsSection}>
            <div className="grid grid-cols-5 px-4 py-2 text-[8px] md:text-[10px] bg-slate-100 dark:bg-slate-900/40 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
              <div></div>
              <div className="text-center">{copy.planNames.free}</div>
              <div className="text-center">{copy.planNames.esencial}</div>
              <div className="text-center">{copy.planNames.profesional}</div>
              <div className="text-center">{copy.planNames.crecimiento}</div>
            </div>
            {checkRowsReportes.map((r) => (
              <RowCheck key={r.label} {...r} />
            ))}
          </Section>
        </div>

        {/* Configuración */}
        <div className="mt-6">
          <Section title={copy.configSection}>
            <div className="grid grid-cols-5 px-4 py-2 text-[8px] md:text-[10px] bg-slate-100 dark:bg-slate-900/40 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
              <div></div>
              <div className="text-center">{copy.planNames.free}</div>
              <div className="text-center">{copy.planNames.esencial}</div>
              <div className="text-center">{copy.planNames.profesional}</div>
              <div className="text-center">{copy.planNames.crecimiento}</div>
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

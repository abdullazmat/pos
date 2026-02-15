"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { useGlobalLanguage } from "@/lib/hooks/useGlobalLanguage";
import { apiFetch } from "@/lib/utils/apiFetch";
import Header from "@/components/layout/Header";
import { toast } from "react-toastify";
import {
  PieChart as PieIcon,
  TrendingUp,
  BarChart3,
  AlertTriangle,
  Trophy,
  ChevronDown,
  Download,
  FileSpreadsheet,
  FileText,
  Mail,
  Loader2,
  DollarSign,
  Hash,
  ArrowUpDown,
  Zap,
} from "lucide-react";
import CategoryDistribution from "@/components/expense-analytics/CategoryDistribution";
import MonthlyTrends from "@/components/expense-analytics/MonthlyTrends";
import YearOverYear from "@/components/expense-analytics/YearOverYear";
import UnusualExpenses from "@/components/expense-analytics/UnusualExpenses";
import TopExpenses from "@/components/expense-analytics/TopExpenses";
import { formatCurrency } from "@/components/expense-analytics/chartUtils";
import * as XLSX from "xlsx";

// ─── Translations ──────────────────────────────────────────────────
const COPY = {
  es: {
    title: "Inteligencia de Gastos",
    subtitle:
      "Dashboard analítico con gráficos, tendencias e insights automáticos",
    loading: "Cargando análisis...",
    period: {
      label: "Período:",
      this_month: "Este mes",
      last_month: "Mes anterior",
      last_3_months: "Últimos 3 meses",
      last_6_months: "Últimos 6 meses",
      last_12_months: "Últimos 12 meses",
    },
    tabs: {
      categories: "Por Categoría",
      trends: "Tendencias",
      yoy: "Interanual",
      unusual: "Inusuales",
      top: "Top Gastos",
    },
    kpis: {
      totalSpent: "Total Gastado",
      numExpenses: "N° de Gastos",
      average: "Promedio",
      highest: "Mayor Gasto",
    },
    export: {
      button: "Exportar",
      excel: "Exportar a Excel",
      pdf: "Descargar PDF",
      email: "Enviar por Email",
      emailSchedule: "Programar envío",
      weekly: "Semanal",
      monthly: "Mensual",
      generating: "Generando...",
      success: "Exportación completada",
      error: "Error al exportar",
      emailSent: "Email enviado correctamente",
      emailError: "Error al enviar email",
      scheduleSet: "Envío programado correctamente",
    },
    categoryDist: {
      title: "Distribución por Categoría",
      category: "Categoría",
      amount: "Monto",
      percentage: "Porcentaje",
      count: "Cantidad",
      noData: "No hay gastos en este período",
    },
    monthlyTrends: {
      title: "Tendencias Mensuales (12 meses)",
      totalSpending: "Total",
      byCategory: "Por categoría",
      showCategories: "Ver por categorías",
      hideCategories: "Ver total",
      spikeDetected: "Pico detectado",
      month: "Mes",
      amount: "Monto",
      noData: "No hay datos de tendencias",
    },
    yearOverYear: {
      title: "Comparación Interanual",
      currentYear: "Año actual",
      lastYear: "Año anterior",
      variation: "Variación",
      category: "Categoría",
      total: "Total",
      increase: "Aumento",
      decrease: "Disminución",
      noChange: "Sin cambios",
      noData: "No hay datos para comparar",
    },
    unusualExpenses: {
      title: "Gastos Inusuales",
      subtitle: "Gastos que se desvían significativamente del patrón (>2σ)",
      description: "Descripción",
      amount: "Monto",
      category: "Categoría",
      date: "Fecha",
      deviation: "Desviación",
      categoryAvg: "Promedio categoría",
      noAnomalies: "No se detectaron gastos inusuales en este período",
      paymentMethod: "Método de pago",
      deviationsAbove: "sobre el promedio",
    },
    topExpenses: {
      titleExpenses: "Top 10 Gastos Individuales",
      titleCategories: "Top 5 Categorías",
      description: "Descripción",
      amount: "Monto",
      category: "Categoría",
      date: "Fecha",
      total: "Total",
      count: "gastos",
      noData: "No hay datos",
      paymentMethod: "Método de pago",
    },
  },
  en: {
    title: "Expense Intelligence",
    subtitle: "Analytics dashboard with charts, trends, and automatic insights",
    loading: "Loading analysis...",
    period: {
      label: "Period:",
      this_month: "This month",
      last_month: "Last month",
      last_3_months: "Last 3 months",
      last_6_months: "Last 6 months",
      last_12_months: "Last 12 months",
    },
    tabs: {
      categories: "By Category",
      trends: "Trends",
      yoy: "Year-over-Year",
      unusual: "Unusual",
      top: "Top Expenses",
    },
    kpis: {
      totalSpent: "Total Spent",
      numExpenses: "# of Expenses",
      average: "Average",
      highest: "Highest Expense",
    },
    export: {
      button: "Export",
      excel: "Export to Excel",
      pdf: "Download PDF",
      email: "Send by Email",
      emailSchedule: "Schedule delivery",
      weekly: "Weekly",
      monthly: "Monthly",
      generating: "Generating...",
      success: "Export completed",
      error: "Export failed",
      emailSent: "Email sent successfully",
      emailError: "Error sending email",
      scheduleSet: "Delivery scheduled successfully",
    },
    categoryDist: {
      title: "Distribution by Category",
      category: "Category",
      amount: "Amount",
      percentage: "Percentage",
      count: "Count",
      noData: "No expenses in this period",
    },
    monthlyTrends: {
      title: "Monthly Trends (12 months)",
      totalSpending: "Total",
      byCategory: "By category",
      showCategories: "View by categories",
      hideCategories: "View total",
      spikeDetected: "Spike detected",
      month: "Month",
      amount: "Amount",
      noData: "No trends data available",
    },
    yearOverYear: {
      title: "Year-over-Year Comparison",
      currentYear: "Current year",
      lastYear: "Last year",
      variation: "Variation",
      category: "Category",
      total: "Total",
      increase: "Increase",
      decrease: "Decrease",
      noChange: "No change",
      noData: "No data to compare",
    },
    unusualExpenses: {
      title: "Unusual Expenses",
      subtitle: "Expenses significantly deviating from pattern (>2σ)",
      description: "Description",
      amount: "Amount",
      category: "Category",
      date: "Date",
      deviation: "Deviation",
      categoryAvg: "Category average",
      noAnomalies: "No unusual expenses detected in this period",
      paymentMethod: "Payment method",
      deviationsAbove: "above average",
    },
    topExpenses: {
      titleExpenses: "Top 10 Individual Expenses",
      titleCategories: "Top 5 Categories",
      description: "Description",
      amount: "Amount",
      category: "Category",
      date: "Date",
      total: "Total",
      count: "expenses",
      noData: "No data",
      paymentMethod: "Payment method",
    },
  },
  pt: {
    title: "Inteligência de Despesas",
    subtitle:
      "Dashboard analítico com gráficos, tendências e insights automáticos",
    loading: "Carregando análise...",
    period: {
      label: "Período:",
      this_month: "Este mês",
      last_month: "Mês anterior",
      last_3_months: "Últimos 3 meses",
      last_6_months: "Últimos 6 meses",
      last_12_months: "Últimos 12 meses",
    },
    tabs: {
      categories: "Por Categoria",
      trends: "Tendências",
      yoy: "Interanual",
      unusual: "Incomuns",
      top: "Top Despesas",
    },
    kpis: {
      totalSpent: "Total Gasto",
      numExpenses: "N° de Despesas",
      average: "Média",
      highest: "Maior Despesa",
    },
    export: {
      button: "Exportar",
      excel: "Exportar para Excel",
      pdf: "Baixar PDF",
      email: "Enviar por Email",
      emailSchedule: "Agendar envio",
      weekly: "Semanal",
      monthly: "Mensal",
      generating: "Gerando...",
      success: "Exportação concluída",
      error: "Erro ao exportar",
      emailSent: "Email enviado com sucesso",
      emailError: "Erro ao enviar email",
      scheduleSet: "Envio agendado com sucesso",
    },
    categoryDist: {
      title: "Distribuição por Categoria",
      category: "Categoria",
      amount: "Valor",
      percentage: "Porcentagem",
      count: "Quantidade",
      noData: "Sem despesas neste período",
    },
    monthlyTrends: {
      title: "Tendências Mensais (12 meses)",
      totalSpending: "Total",
      byCategory: "Por categoria",
      showCategories: "Ver por categorias",
      hideCategories: "Ver total",
      spikeDetected: "Pico detectado",
      month: "Mês",
      amount: "Valor",
      noData: "Sem dados de tendências",
    },
    yearOverYear: {
      title: "Comparação Interanual",
      currentYear: "Ano atual",
      lastYear: "Ano anterior",
      variation: "Variação",
      category: "Categoria",
      total: "Total",
      increase: "Aumento",
      decrease: "Diminuição",
      noChange: "Sem mudanças",
      noData: "Sem dados para comparar",
    },
    unusualExpenses: {
      title: "Despesas Incomuns",
      subtitle: "Despesas que se desviam significativamente do padrão (>2σ)",
      description: "Descrição",
      amount: "Valor",
      category: "Categoria",
      date: "Data",
      deviation: "Desvio",
      categoryAvg: "Média categoria",
      noAnomalies: "Nenhuma despesa incomum detectada neste período",
      paymentMethod: "Método de pagamento",
      deviationsAbove: "acima da média",
    },
    topExpenses: {
      titleExpenses: "Top 10 Despesas Individuais",
      titleCategories: "Top 5 Categorias",
      description: "Descrição",
      amount: "Valor",
      category: "Categoria",
      date: "Data",
      total: "Total",
      count: "despesas",
      noData: "Sem dados",
      paymentMethod: "Método de pagamento",
    },
  },
};

type Tab = "categories" | "trends" | "yoy" | "unusual" | "top";
type Period =
  | "this_month"
  | "last_month"
  | "last_3_months"
  | "last_6_months"
  | "last_12_months";

const TAB_ICONS: Record<Tab, typeof PieIcon> = {
  categories: PieIcon,
  trends: TrendingUp,
  yoy: BarChart3,
  unusual: AlertTriangle,
  top: Trophy,
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnalyticsData = Record<string, any>;

export default function ExpenseAnalyticsPage() {
  const router = useRouter();
  const { currentLanguage } = useGlobalLanguage();
  const lang = (currentLanguage || "es") as "es" | "en" | "pt";
  const copy = COPY[lang] || COPY.es;

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>("categories");
  const [period, setPeriod] = useState<Period>("this_month");
  const [showPeriodMenu, setShowPeriodMenu] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [exporting, setExporting] = useState(false);
  const exportRef = useRef<HTMLDivElement>(null);
  const periodRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [user, setUser] = useState<any>(null);

  // Load user from localStorage
  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (!userStr) {
      router.push("/auth/login");
      return;
    }
    const parsedUser = JSON.parse(userStr);
    setUser(parsedUser);
    if (parsedUser?.role !== "admin") {
      router.push("/dashboard");
      return;
    }
  }, [router]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        router.push("/");
        return;
      }
      const res = await apiFetch(
        `/api/expenses/analytics?report=all&period=${period}`,
      );
      if (!res.ok) throw new Error("Failed to fetch analytics");
      const json = await res.json();
      setData(json);
    } catch (err) {
      console.error("Analytics fetch error:", err);
      toast.error(copy.export.error);
    } finally {
      setLoading(false);
    }
  }, [period, router, copy.export.error]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Close menus on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (exportRef.current && !exportRef.current.contains(e.target as Node)) {
        setShowExportMenu(false);
      }
      if (periodRef.current && !periodRef.current.contains(e.target as Node)) {
        setShowPeriodMenu(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // ─── Export to Excel ─────────────────────────────────────────────
  const exportToExcel = () => {
    if (!data) return;
    setExporting(true);
    try {
      const wb = XLSX.utils.book_new();

      // Category distribution sheet
      if (data.categoryDistribution) {
        const ws = XLSX.utils.json_to_sheet(
          data.categoryDistribution.map(
            (c: {
              category: string;
              total: number;
              percentage: number;
              count: number;
            }) => ({
              [copy.categoryDist.category]: c.category,
              [copy.categoryDist.amount]: c.total,
              [copy.categoryDist.percentage]: `${c.percentage}%`,
              [copy.categoryDist.count]: c.count,
            }),
          ),
        );
        XLSX.utils.book_append_sheet(wb, ws, copy.tabs.categories);
      }

      // Monthly trends sheet
      if (data.monthlyTrends) {
        const ws = XLSX.utils.json_to_sheet(
          data.monthlyTrends.map(
            (m: {
              label: string;
              total: number;
              count: number;
              isSpike: boolean;
            }) => ({
              [copy.monthlyTrends.month]: m.label,
              [copy.monthlyTrends.amount]: m.total,
              [copy.categoryDist.count]: m.count,
              [copy.monthlyTrends.spikeDetected]: m.isSpike ? "⚠" : "",
            }),
          ),
        );
        XLSX.utils.book_append_sheet(wb, ws, copy.tabs.trends);
      }

      // Year-over-year sheet
      if (data.yearOverYear?.categories) {
        const ws = XLSX.utils.json_to_sheet(
          data.yearOverYear.categories.map(
            (c: {
              category: string;
              currentYear: number;
              lastYear: number;
              variation: number;
            }) => ({
              [copy.yearOverYear.category]: c.category,
              [data.yearOverYear.currentYear]: c.currentYear,
              [data.yearOverYear.currentYear - 1]: c.lastYear,
              [copy.yearOverYear.variation]: `${c.variation}%`,
            }),
          ),
        );
        XLSX.utils.book_append_sheet(wb, ws, copy.tabs.yoy);
      }

      // Unusual expenses sheet
      if (data.unusualExpenses?.length > 0) {
        const ws = XLSX.utils.json_to_sheet(
          data.unusualExpenses.map(
            (e: {
              description: string;
              amount: number;
              category: string;
              date: string;
              categoryMean: number;
              deviations: number;
            }) => ({
              [copy.unusualExpenses.description]: e.description,
              [copy.unusualExpenses.amount]: e.amount,
              [copy.unusualExpenses.category]: e.category,
              [copy.unusualExpenses.date]: new Date(
                e.date,
              ).toLocaleDateString(),
              [copy.unusualExpenses.categoryAvg]: e.categoryMean,
              σ: e.deviations,
            }),
          ),
        );
        XLSX.utils.book_append_sheet(wb, ws, copy.tabs.unusual);
      }

      // Top expenses sheet
      if (data.topExpenses?.length > 0) {
        const ws = XLSX.utils.json_to_sheet(
          data.topExpenses.map(
            (e: {
              description: string;
              amount: number;
              category: string;
              date: string;
            }) => ({
              [copy.topExpenses.description]: e.description,
              [copy.topExpenses.amount]: e.amount,
              [copy.topExpenses.category]: e.category,
              [copy.topExpenses.date]: new Date(e.date).toLocaleDateString(),
            }),
          ),
        );
        XLSX.utils.book_append_sheet(wb, ws, copy.tabs.top);
      }

      XLSX.writeFile(wb, `expense-analytics-${period}.xlsx`);
      toast.success(copy.export.success);
    } catch {
      toast.error(copy.export.error);
    } finally {
      setExporting(false);
      setShowExportMenu(false);
    }
  };

  // ─── Export to PDF (print-based) ─────────────────────────────────
  const exportToPDF = () => {
    setShowExportMenu(false);
    // Add marker class so our print CSS can override the global
    // receipt print rules that hide everything with `body * { display:none }`
    document.body.classList.add("printing-expense-analytics");
    const cleanup = () => {
      document.body.classList.remove("printing-expense-analytics");
      window.removeEventListener("afterprint", cleanup);
    };
    window.addEventListener("afterprint", cleanup);
    setTimeout(() => {
      window.print();
      cleanup();
    }, 100);
  };

  // ─── Schedule email delivery ─────────────────────────────────────
  const scheduleEmail = async (frequency: "weekly" | "monthly") => {
    setShowExportMenu(false);
    try {
      const res = await apiFetch("/api/expenses/analytics/schedule", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ frequency, period }),
      });
      if (!res.ok) throw new Error("Failed to schedule");
      toast.success(copy.export.scheduleSet);
    } catch {
      toast.info(copy.export.emailSchedule + " — " + frequency);
    }
  };

  const locale = lang === "en" ? "en-US" : lang === "pt" ? "pt-BR" : "es-AR";

  const tabs: { key: Tab; label: string }[] = [
    { key: "categories", label: copy.tabs.categories },
    { key: "trends", label: copy.tabs.trends },
    { key: "yoy", label: copy.tabs.yoy },
    { key: "unusual", label: copy.tabs.unusual },
    { key: "top", label: copy.tabs.top },
  ];

  return (
    <div
      className="min-h-screen"
      style={{
        background: "hsl(var(--vp-bg))",
        color: "hsl(var(--vp-text))",
      }}
    >
      <Header user={user} />
      <main
        id="expense-analytics-print"
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 print:py-2"
      >
        {/* Header section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">{copy.title}</h1>
            <p className="text-sm opacity-60 mt-1">{copy.subtitle}</p>
          </div>

          <div className="flex items-center gap-3 print:hidden">
            {/* Period selector */}
            <div className="relative" ref={periodRef}>
              <button
                type="button"
                onClick={() => setShowPeriodMenu((v) => !v)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg border text-sm"
                style={{
                  borderColor: "hsl(var(--vp-border))",
                  background: "hsl(var(--vp-bg-card))",
                  color: "hsl(var(--vp-text))",
                }}
              >
                <span>{copy.period[period]}</span>
                <ChevronDown size={16} className="opacity-70" />
              </button>

              {showPeriodMenu && (
                <div
                  className="absolute right-0 mt-2 w-56 rounded-xl border shadow-lg z-50 py-2"
                  style={{
                    background: "hsl(var(--vp-bg-card))",
                    borderColor: "hsl(var(--vp-border))",
                  }}
                >
                  {(
                    [
                      "this_month",
                      "last_month",
                      "last_3_months",
                      "last_6_months",
                      "last_12_months",
                    ] as Period[]
                  ).map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => {
                        setPeriod(p);
                        setShowPeriodMenu(false);
                      }}
                      className="w-full text-left px-4 py-2 text-sm hover:opacity-80 transition-opacity"
                      style={{
                        background:
                          p === period ? "hsl(var(--vp-muted))" : "transparent",
                      }}
                    >
                      {copy.period[p]}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Export dropdown */}
            <div className="relative" ref={exportRef}>
              <button
                onClick={() => setShowExportMenu(!showExportMenu)}
                disabled={exporting || loading}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                style={{ background: "hsl(var(--vp-primary))", color: "#fff" }}
              >
                {exporting ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Download size={16} />
                )}
                {copy.export.button}
              </button>

              {showExportMenu && (
                <div
                  className="absolute right-0 mt-2 w-56 rounded-xl border shadow-lg z-50 py-2"
                  style={{
                    background: "hsl(var(--vp-bg-card))",
                    borderColor: "hsl(var(--vp-border))",
                  }}
                >
                  <button
                    onClick={exportToExcel}
                    className="w-full flex items-center gap-3 px-4 py-2 text-sm hover:opacity-80 transition-opacity"
                  >
                    <FileSpreadsheet size={16} className="text-emerald-500" />
                    {copy.export.excel}
                  </button>
                  <button
                    onClick={exportToPDF}
                    className="w-full flex items-center gap-3 px-4 py-2 text-sm hover:opacity-80 transition-opacity"
                  >
                    <FileText size={16} className="text-rose-500" />
                    {copy.export.pdf}
                  </button>
                  <hr
                    className="my-1"
                    style={{ borderColor: "hsl(var(--vp-border))" }}
                  />
                  <p className="px-4 py-1 text-xs opacity-50 flex items-center gap-1">
                    <Mail size={12} /> {copy.export.emailSchedule}
                  </p>
                  <button
                    onClick={() => scheduleEmail("weekly")}
                    className="w-full flex items-center gap-3 px-4 py-2 text-sm hover:opacity-80 transition-opacity"
                  >
                    <Mail size={16} className="text-blue-500" />
                    {copy.export.weekly}
                  </button>
                  <button
                    onClick={() => scheduleEmail("monthly")}
                    className="w-full flex items-center gap-3 px-4 py-2 text-sm hover:opacity-80 transition-opacity"
                  >
                    <Mail size={16} className="text-indigo-500" />
                    {copy.export.monthly}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Loading state */}
        {loading && (
          <div className="flex items-center justify-center py-20">
            <Loader2
              size={32}
              className="animate-spin"
              style={{ color: "hsl(var(--vp-primary))" }}
            />
            <span className="ml-3 text-sm">{copy.loading}</span>
          </div>
        )}

        {!loading && data && (
          <>
            {/* KPI Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              {[
                {
                  icon: DollarSign,
                  label: copy.kpis.totalSpent,
                  value: formatCurrency(data.summary?.totalSpent || 0, locale),
                  color: "#6366f1",
                },
                {
                  icon: Hash,
                  label: copy.kpis.numExpenses,
                  value: String(data.summary?.count || 0),
                  color: "#10b981",
                },
                {
                  icon: ArrowUpDown,
                  label: copy.kpis.average,
                  value: formatCurrency(data.summary?.average || 0, locale),
                  color: "#f59e0b",
                },
                {
                  icon: Zap,
                  label: copy.kpis.highest,
                  value: formatCurrency(data.summary?.highest || 0, locale),
                  color: "#f43f5e",
                },
              ].map((kpi) => {
                const Icon = kpi.icon;
                return (
                  <div
                    key={kpi.label}
                    className="rounded-xl border p-4"
                    style={{
                      borderColor: "hsl(var(--vp-border))",
                      background: "hsl(var(--vp-bg-card))",
                    }}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center"
                        style={{ backgroundColor: `${kpi.color}20` }}
                      >
                        <Icon size={16} style={{ color: kpi.color }} />
                      </div>
                      <span className="text-xs opacity-60">{kpi.label}</span>
                    </div>
                    <p className="text-xl sm:text-2xl font-bold font-mono">
                      {kpi.value}
                    </p>
                  </div>
                );
              })}
            </div>

            {/* Tab navigation */}
            <div className="flex gap-1 mb-6 overflow-x-auto pb-1 print:hidden">
              {tabs.map((tab) => {
                const Icon = TAB_ICONS[tab.key];
                return (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all"
                    style={{
                      background:
                        activeTab === tab.key
                          ? "hsl(var(--vp-primary))"
                          : "transparent",
                      color:
                        activeTab === tab.key ? "#fff" : "hsl(var(--vp-text))",
                      border:
                        activeTab === tab.key
                          ? "none"
                          : "1px solid hsl(var(--vp-border))",
                    }}
                  >
                    <Icon size={16} />
                    {tab.label}
                  </button>
                );
              })}
            </div>

            {/* Tab content */}
            <div className="space-y-6">
              {activeTab === "categories" && (
                <CategoryDistribution
                  data={data.categoryDistribution || []}
                  grandTotal={data.categoryGrandTotal || 0}
                  lang={lang}
                  copy={copy.categoryDist}
                />
              )}

              {activeTab === "trends" && (
                <MonthlyTrends
                  data={data.monthlyTrends || []}
                  categoryBreakdown={data.monthlyCategoryBreakdown || []}
                  categories={data.trendCategories || []}
                  lang={lang}
                  copy={copy.monthlyTrends}
                />
              )}

              {activeTab === "yoy" && (
                <YearOverYear
                  data={
                    data.yearOverYear || {
                      categories: [],
                      currentTotal: 0,
                      lastTotal: 0,
                      totalVariation: 0,
                      currentMonth: 1,
                      currentYear: 2026,
                    }
                  }
                  lang={lang}
                  copy={copy.yearOverYear}
                />
              )}

              {activeTab === "unusual" && (
                <UnusualExpenses
                  data={data.unusualExpenses || []}
                  lang={lang}
                  copy={copy.unusualExpenses}
                />
              )}

              {activeTab === "top" && (
                <TopExpenses
                  expenses={data.topExpenses || []}
                  categories={data.topCategories || []}
                  lang={lang}
                  copy={copy.topExpenses}
                />
              )}
            </div>

            {/* Print-only: show all sections */}
            <div className="hidden print:block space-y-8 mt-8">
              <CategoryDistribution
                data={data.categoryDistribution || []}
                grandTotal={data.categoryGrandTotal || 0}
                lang={lang}
                copy={copy.categoryDist}
              />
              <MonthlyTrends
                data={data.monthlyTrends || []}
                categoryBreakdown={data.monthlyCategoryBreakdown || []}
                categories={data.trendCategories || []}
                lang={lang}
                copy={copy.monthlyTrends}
              />
              <YearOverYear
                data={
                  data.yearOverYear || {
                    categories: [],
                    currentTotal: 0,
                    lastTotal: 0,
                    totalVariation: 0,
                    currentMonth: 1,
                    currentYear: 2026,
                  }
                }
                lang={lang}
                copy={copy.yearOverYear}
              />
              <UnusualExpenses
                data={data.unusualExpenses || []}
                lang={lang}
                copy={copy.unusualExpenses}
              />
              <TopExpenses
                expenses={data.topExpenses || []}
                categories={data.topCategories || []}
                lang={lang}
                copy={copy.topExpenses}
              />
            </div>
          </>
        )}
      </main>

      {/* Print styles */}
      <style jsx global>{`
        @media print {
          /*
           * globals.css has receipt print rules:
           *   body * { display:none !important; visibility:hidden !important; }
           * This hides ALL elements including ancestor containers.
           *
           * We add .printing-expense-analytics to <body> before window.print()
           * and use it here with higher specificity to restore the full
           * ancestor chain from body → #__next → page-wrapper → main.
           */

          /* 1. Restore the ancestor chain (body → __next → wrapper → main) */
          body.printing-expense-analytics,
          body.printing-expense-analytics > div,
          body.printing-expense-analytics > div > div {
            display: block !important;
            visibility: visible !important;
            background: white !important;
            color: #1a1a2e !important;
          }

          /* 2. Restore the analytics main and ALL its descendants */
          body.printing-expense-analytics #expense-analytics-print {
            display: block !important;
            visibility: visible !important;
          }
          body.printing-expense-analytics #expense-analytics-print * {
            display: revert !important;
            visibility: visible !important;
          }

          /* 3. Hide header, tab bar, export controls during print */
          body.printing-expense-analytics header,
          body.printing-expense-analytics .print\\:hidden {
            display: none !important;
            visibility: hidden !important;
          }

          /* 4. Show print-only sections */
          body.printing-expense-analytics .hidden.print\\:block {
            display: block !important;
            visibility: visible !important;
          }

          /* 5. Force light theme for dark-mode users */
          html,
          html.dark {
            color-scheme: light;
            --vp-bg: 210 40% 98%;
            --vp-bg-soft: 210 35% 97%;
            --vp-surface: 0 0% 100%;
            --vp-surface-soft: 210 40% 99%;
            --vp-bg-page: 210 40% 97%;
            --vp-bg-section: 210 35% 96%;
            --vp-bg-card: 0 0% 100%;
            --vp-bg-card-soft: 210 40% 98%;
            --vp-bg-hover: 210 30% 95%;
            --vp-border: 220 16% 88%;
            --vp-border-soft: 220 16% 90%;
            --vp-text: 222 47% 11%;
            --vp-muted: 215 18% 38%;
            --vp-muted-soft: 215 14% 45%;
          }

          /* 6. Page setup */
          @page {
            size: A4 portrait;
            margin: 12mm;
          }

          body.printing-expense-analytics {
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
            background: white !important;
            color: #1a1a2e !important;
            margin: 0;
            padding: 0;
          }

          /* 7. Ensure SVG chart labels/ticks are visible */
          body.printing-expense-analytics .recharts-text,
          body.printing-expense-analytics .recharts-cartesian-axis-tick-value {
            fill: #1a1a2e !important;
          }

          /* 8. Force dark text on all print elements */
          body.printing-expense-analytics #expense-analytics-print h1,
          body.printing-expense-analytics #expense-analytics-print h2,
          body.printing-expense-analytics #expense-analytics-print h3,
          body.printing-expense-analytics #expense-analytics-print p,
          body.printing-expense-analytics #expense-analytics-print span,
          body.printing-expense-analytics #expense-analytics-print td,
          body.printing-expense-analytics #expense-analytics-print th,
          body.printing-expense-analytics #expense-analytics-print div {
            color: #1a1a2e !important;
          }

          body.printing-expense-analytics #expense-analytics-print .rounded-xl {
            background: white !important;
            border-color: #e2e8f0 !important;
          }
        }
      `}</style>
    </div>
  );
}

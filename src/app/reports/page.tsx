"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useGlobalLanguage } from "@/lib/hooks/useGlobalLanguage";
import { apiFetch } from "@/lib/utils/apiFetch";
import Header from "@/components/layout/Header";
import { useSubscription } from "@/lib/hooks/useSubscription";
import {
  Calendar,
  Download,
  TrendingUp,
  Package,
  DollarSign,
  ShoppingCart,
  BarChart3,
} from "lucide-react";

const REPORTS_COPY = {
  es: {
    title: "Reportes y Estadísticas",
    subtitle: "Analiza el rendimiento completo de tu negocio",
    loading: "Cargando...",
    exportCSV: "Exportar CSV",
    dateRange: "Período de análisis:",
    tabs: {
      general: "Resumen General",
      categories: "Por Categorías",
      profitability: "Rentabilidad",
      products: "Productos",
      premium: "Premium",
    },
    kpis: {
      totalSales: {
        title: "Ventas Totales",
        desc: "En el período seleccionado",
      },
      numSales: {
        title: "Nº de Ventas",
        desc: "Transacciones realizadas",
      },
      itemsSold: {
        title: "Items Vendidos",
        desc: "Productos en total",
      },
      avgTicket: {
        title: "Ticket Promedio",
        desc: "Por transacción",
      },
    },
    limitedAccess: {
      title: "Acceso Limitado",
      desc: "Las gráficas están disponibles en el Plan Profesional o superior. Actualiza tu plan para acceder a esta funcionalidad.",
    },
    recentSales: {
      title: "Ventas Recientes",
      date: "Fecha",
      time: "Hora",
      items: "Items",
      total: "Total",
      noSales: "Sin ventas en este período",
    },
    topProducts: {
      title: "Detalle de Productos Más Vendidos",
      subtitle: "Incluye análisis de costos y ganancias",
      product: "Producto",
      quantitySold: "Cantidad Vendida",
      totalRevenue: "Ingresos Totales",
      approxCost: "Costo Aprox.",
      approxProfit: "Ganancia Aprox.",
      margin: "Margen",
    },
  },
  en: {
    title: "Reports and Statistics",
    subtitle: "Analyze your business performance",
    loading: "Loading...",
    exportCSV: "Export CSV",
    dateRange: "Analysis period:",
    tabs: {
      general: "Overview",
      categories: "By Categories",
      profitability: "Profitability",
      products: "Products",
      premium: "Premium",
    },
    kpis: {
      totalSales: {
        title: "Total Sales",
        desc: "In the selected period",
      },
      numSales: {
        title: "Number of Sales",
        desc: "Transactions completed",
      },
      itemsSold: {
        title: "Items Sold",
        desc: "Products total",
      },
      avgTicket: {
        title: "Average Ticket",
        desc: "Per transaction",
      },
    },
    limitedAccess: {
      title: "Limited Access",
      desc: "Charts are available in Professional Plan or higher. Upgrade your plan to access this feature.",
    },
    recentSales: {
      title: "Recent Sales",
      date: "Date",
      time: "Time",
      items: "Items",
      total: "Total",
      noSales: "No sales in this period",
    },
    topProducts: {
      title: "Best Selling Products Details",
      subtitle: "Includes cost and profit analysis",
      product: "Product",
      quantitySold: "Quantity Sold",
      totalRevenue: "Total Revenue",
      approxCost: "Approx. Cost",
      approxProfit: "Approx. Profit",
      margin: "Margin",
    },
  },
  pt: {
    title: "Relatórios e Estatísticas",
    subtitle: "Analise o desempenho completo do seu negócio",
    loading: "Carregando...",
    exportCSV: "Exportar CSV",
    dateRange: "Período de análise:",
    tabs: {
      general: "Resumo Geral",
      categories: "Por Categorias",
      profitability: "Rentabilidade",
      products: "Produtos",
      premium: "Premium",
    },
    kpis: {
      totalSales: {
        title: "Vendas Totais",
        desc: "No período selecionado",
      },
      numSales: {
        title: "Nº de Vendas",
        desc: "Transações realizadas",
      },
      itemsSold: {
        title: "Itens Vendidos",
        desc: "Produtos no total",
      },
      avgTicket: {
        title: "Ticket Médio",
        desc: "Por transação",
      },
    },
    limitedAccess: {
      title: "Acesso Limitado",
      desc: "Os gráficos estão disponíveis no Plano Profissional ou superior. Atualize seu plano para acessar este recurso.",
    },
    recentSales: {
      title: "Vendas Recentes",
      date: "Data",
      time: "Hora",
      items: "Itens",
      total: "Total",
      noSales: "Sem vendas neste período",
    },
    topProducts: {
      title: "Detalhes dos Produtos Mais Vendidos",
      subtitle: "Inclui análise de custos e lucros",
      product: "Produto",
      quantitySold: "Quantidade Vendida",
      totalRevenue: "Receita Total",
      approxCost: "Custo Aprox.",
      approxProfit: "Lucro Aprox.",
      margin: "Margem",
    },
  },
};

export default function ReportsPage() {
  const { t } = useGlobalLanguage();
  const { currentLanguage } = useGlobalLanguage();
  const router = useRouter();
  const { subscription, loading: subLoading } = useSubscription();
  const [activeTab, setActiveTab] = useState("general");
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [fromDate, setFromDate] = useState<string>("");
  const [toDate, setToDate] = useState<string>("");
  const [reportData, setReportData] = useState<any>(null);

  const copy =
    REPORTS_COPY[currentLanguage as keyof typeof REPORTS_COPY] ||
    REPORTS_COPY.es;

  const planId = (subscription?.planId || "BASIC").toUpperCase();
  const subscriptionReady = !subLoading;
  const hasAdvancedReports = subscriptionReady
    ? subscription?.features?.advancedReporting || planId !== "BASIC"
    : true;

  const CURRENCY_LOCALE: Record<string, string> = {
    es: "es-AR",
    en: "en-US",
    pt: "pt-BR",
  };

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat(CURRENCY_LOCALE[currentLanguage] || "es-AR", {
      style: "currency",
      currency: "ARS",
      minimumFractionDigits: 2,
    }).format(value || 0);
  const formatQuantity = (value: number) =>
    new Intl.NumberFormat(CURRENCY_LOCALE[currentLanguage] || "es-AR", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 3,
    }).format(value || 0);

  const buildProductAggregates = (products: any[]) => {
    const toNumber = (val: any) => {
      if (typeof val === "number") return val;
      if (typeof val === "string") {
        const normalized = val.replace(",", ".");
        const parsed = Number.parseFloat(normalized);
        return Number.isFinite(parsed) ? parsed : 0;
      }
      return 0;
    };

    const normalizedProducts = products.map((p: any) => {
      const sold = toNumber(p.sold);
      const revenue = toNumber(p.revenue);
      const cost = toNumber(p.cost);
      const totalCost = cost * sold;
      const profit = revenue - totalCost;
      const margin = revenue > 0 ? (profit / revenue) * 100 : 0;
      return {
        name: p.name,
        quantity: sold,
        revenue,
        cost,
        totalCost,
        profit,
        margin,
        isSoldByWeight: p.isSoldByWeight || false,
        category: p.category || "Sin categoría",
      };
    });

    const topProducts = normalizedProducts.sort(
      (a: any, b: any) => b.quantity - a.quantity || b.revenue - a.revenue,
    );

    const categoryMap: Record<
      string,
      {
        name: string;
        revenue: number;
        quantityUnits: number;
        quantityWeight: number;
      }
    > = {};
    normalizedProducts.forEach((p: any) => {
      const category = p.category || "Sin categoría";
      if (!categoryMap[category]) {
        categoryMap[category] = {
          name: category,
          revenue: 0,
          quantityUnits: 0,
          quantityWeight: 0,
        };
      }
      categoryMap[category].revenue += p.revenue;
      if (p.isSoldByWeight) {
        categoryMap[category].quantityWeight += p.quantity;
      } else {
        categoryMap[category].quantityUnits += p.quantity;
      }
    });
    const categories = Object.values(categoryMap).sort(
      (a, b) => b.revenue - a.revenue,
    );

    const profitability = normalizedProducts
      .sort((a: any, b: any) => b.profit - a.profit || b.revenue - a.revenue)
      .map((p: any) => ({
        name: p.name,
        revenue: p.revenue,
        cost: p.totalCost,
        profit: p.profit,
        margin: p.margin,
        quantity: p.quantity,
      }));

    return { topProducts, categories, profitability };
  };

  // Format a Date to yyyy-mm-dd
  const fmt = (d: Date) => {
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  };

  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (!userStr) {
      setLoading(false);
      router.push("/auth/login");
      return;
    }

    try {
      const parsedUser = JSON.parse(userStr);
      if (!parsedUser?.id || !parsedUser?.email) {
        localStorage.removeItem("user");
        setLoading(false);
        router.push("/auth/login");
        return;
      }
      setUser(parsedUser);
      if (parsedUser?.role !== "admin") {
        setLoading(false);
        router.push("/dashboard");
        return;
      }
    } catch {
      localStorage.removeItem("user");
      setLoading(false);
      router.push("/auth/login");
      return;
    }

    // Set default range to last 30 days
    const today = new Date();
    const start = new Date();
    start.setDate(today.getDate() - 30);
    setFromDate(fmt(start));
    setToDate(fmt(today));
  }, [router]);

  useEffect(() => {
    if (fromDate && toDate) {
      fetchReportData(activeTab);
    }
  }, [fromDate, toDate, activeTab]);

  const fetchReportData = async (tab: string) => {
    setLoading(true);
    try {
      const dailyUrl = `/api/reports?type=daily&from=${fromDate}&to=${toDate}`;
      const productsUrl = `/api/reports?type=products&from=${fromDate}&to=${toDate}`;

      if (tab === "general") {
        const [dailyResponse, productsResponse] = await Promise.all([
          apiFetch(dailyUrl),
          apiFetch(productsUrl),
        ]);

        let dailyPayload: any = null;
        if (dailyResponse.ok) {
          dailyPayload = await dailyResponse.json();
        }

        const sales = dailyPayload?.data?.sales || dailyPayload?.sales || [];
        const totalSales =
          dailyPayload?.data?.totalSales ??
          dailyPayload?.totalSales ??
          sales.length;
        const totalRevenue =
          dailyPayload?.data?.totalRevenue ?? dailyPayload?.totalRevenue ?? 0;
        const totalItems = sales.reduce(
          (sum: number, s: any) =>
            sum +
            (s.items?.reduce(
              (itemSum: number, item: any) =>
                itemSum + (Number(item.quantity) || 0),
              0,
            ) || 0),
          0,
        );
        const avgTicket = totalSales > 0 ? totalRevenue / totalSales : 0;

        let productPayload: any = null;
        if (productsResponse.ok) {
          productPayload = await productsResponse.json();
        }
        const products =
          productPayload?.data?.products || productPayload?.products || [];
        const aggregates = buildProductAggregates(products);

        setReportData({
          totalSales,
          totalRevenue,
          totalItems,
          avgTicket,
          recentSales: sales.slice(0, 5),
          topProducts: aggregates.topProducts,
          categories: aggregates.categories,
          profitability: aggregates.profitability,
        });
        return;
      }

      const response = await apiFetch(productsUrl);

      if (!response.ok) {
        setReportData({
          totalSales: 0,
          totalRevenue: 0,
          totalItems: 0,
          avgTicket: 0,
          recentSales: [],
          topProducts: [],
          categories: [],
          profitability: [],
        });
        return;
      }

      const data = await response.json();
      const products = data.data?.products || data.products || [];
      const aggregates = buildProductAggregates(products);

      setReportData({
        totalSales: reportData?.totalSales || 0,
        totalRevenue: reportData?.totalRevenue || 0,
        totalItems: reportData?.totalItems || 0,
        avgTicket: reportData?.avgTicket || 0,
        recentSales: reportData?.recentSales || [],
        topProducts: aggregates.topProducts,
        categories: aggregates.categories,
        profitability: aggregates.profitability,
      });
    } catch (error) {
      console.error("Error fetching report data:", error);
      setReportData({
        totalSales: 0,
        totalRevenue: 0,
        totalItems: 0,
        avgTicket: 0,
        recentSales: [],
        topProducts: [],
        categories: [],
        profitability: [],
      });
    } finally {
      setLoading(false);
    }
  };

  const exportToCSV = () => {
    if (!reportData || !reportData.recentSales) {
      alert(t("noDataToExport", "errors"));
      return;
    }

    const sales = reportData.recentSales;
    const headers = ["Date", "Time", "Items", "Total"];
    const rows = sales.map((sale: any) => [
      sale.createdAt?.slice(0, 10) || "-",
      sale.createdAt?.slice(11, 19) || "-",
      sale.items?.length || 0,
      sale.total || 0,
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row: any[]) => row.join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `reports-${fromDate}-to-${toDate}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const tabs = [
    { id: "general", icon: BarChart3 },
    { id: "categories", icon: Package, premium: true },
    {
      id: "profitability",
      icon: DollarSign,
      premium: true,
    },
    { id: "products", icon: ShoppingCart, premium: true },
  ];

  const getTabLabel = (tabId: string): string => {
    const tabLabels: Record<string, string> = {
      general: copy.tabs.general,
      categories: copy.tabs.categories,
      profitability: copy.tabs.profitability,
      products: copy.tabs.products,
    };
    return tabLabels[tabId] || "";
  };

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 text-gray-900 dark:text-slate-100">
      <Header user={user} showBackButton />

      <main className="max-w-7xl mx-auto px-4 py-10">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
              {copy.title}
            </h1>
            <p className="text-slate-600 dark:text-slate-400 text-sm">
              {copy.subtitle}
            </p>
          </div>
          <button
            onClick={exportToCSV}
            className="bg-emerald-600 hover:bg-emerald-500 text-white px-5 py-2.5 rounded-lg font-semibold flex items-center gap-2 shadow-lg shadow-emerald-600/20"
          >
            <Download className="w-5 h-5" />
            {copy.exportCSV}
          </button>
        </div>

        {/* Date Range */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 flex items-center gap-3 mb-6">
          <Calendar className="w-5 h-5 text-slate-600 dark:text-slate-400" />
          <span className="text-sm text-slate-700 dark:text-slate-300 font-medium">
            {copy.dateRange}
          </span>
          <input
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            className="px-3 py-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <span className="text-slate-400 dark:text-slate-500">-</span>
          <input
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            className="px-3 py-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Tabs */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden mb-6">
          <div className="flex overflow-x-auto border-b border-slate-200 dark:border-slate-800">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const active = activeTab === tab.id;
              const isLocked = tab.premium && !hasAdvancedReports;
              return (
                <button
                  key={tab.id}
                  onClick={() => !isLocked && setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-5 py-4 text-sm font-semibold whitespace-nowrap border-b-2 transition-colors ${
                    active
                      ? "border-blue-500 text-blue-500 bg-blue-50 dark:bg-slate-850 dark:text-blue-400"
                      : "border-transparent text-slate-700 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-850"
                  } ${isLocked ? "opacity-60 cursor-not-allowed" : ""}`}
                >
                  <Icon className="w-4 h-4" />
                  {getTabLabel(tab.id)}
                  {isLocked && (
                    <span className="ml-1 px-2 py-0.5 text-xs bg-purple-900/40 text-purple-200 rounded-full">
                      {copy.tabs.premium}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {activeTab === "general" && (
            <div className="p-6 space-y-6">
              {/* KPI cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-xl p-5">
                  <div className="flex items-center justify-between text-slate-600 dark:text-slate-400 text-sm mb-2">
                    {copy.kpis.totalSales.title}
                    <TrendingUp className="w-5 h-5 text-green-400" />
                  </div>
                  <div className="text-3xl font-bold text-slate-900 dark:text-white">
                    {loading
                      ? "..."
                      : reportData?.totalRevenue
                        ? formatCurrency(reportData.totalRevenue)
                        : "$0"}
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-500 mt-1">
                    {copy.kpis.totalSales.desc}
                  </p>
                </div>

                <div className="bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-xl p-5">
                  <div className="flex items-center justify-between text-slate-600 dark:text-slate-400 text-sm mb-2">
                    {copy.kpis.numSales.title}
                    <ShoppingCart className="w-5 h-5 text-blue-400" />
                  </div>
                  <div className="text-3xl font-bold text-slate-900 dark:text-white">
                    {loading ? "..." : reportData?.totalSales || 0}
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-500 mt-1">
                    {copy.kpis.numSales.desc}
                  </p>
                </div>

                <div className="bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-xl p-5">
                  <div className="flex items-center justify-between text-slate-600 dark:text-slate-400 text-sm mb-2">
                    {copy.kpis.itemsSold.title}
                    <Package className="w-5 h-5 text-purple-400" />
                  </div>
                  <div className="text-3xl font-bold text-slate-900 dark:text-white">
                    {loading
                      ? "..."
                      : reportData?.totalItems
                        ? Math.floor(Number(reportData.totalItems))
                        : 0}
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-500 mt-1">
                    {copy.kpis.itemsSold.desc}
                  </p>
                </div>

                <div className="bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-xl p-5">
                  <div className="flex items-center justify-between text-slate-600 dark:text-slate-400 text-sm mb-2">
                    {copy.kpis.avgTicket.title}
                    <DollarSign className="w-5 h-5 text-amber-400" />
                  </div>
                  <div className="text-3xl font-bold text-slate-900 dark:text-white">
                    {loading
                      ? "..."
                      : reportData?.avgTicket
                        ? formatCurrency(reportData.avgTicket)
                        : "$0.00"}
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                    {copy.kpis.avgTicket.desc}
                  </p>
                </div>
              </div>

              {/* Access limited */}
              {subscriptionReady && !hasAdvancedReports && (
                <div className="rounded-xl border border-red-300 bg-red-50 text-red-800 p-4 flex items-start gap-3 dark:border-red-900/70 dark:bg-red-900/30 dark:text-red-200">
                  <div className="bg-red-200 p-2 rounded-lg dark:bg-red-800/70">
                    <BarChart3 className="w-5 h-5 text-red-700 dark:text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold">
                      {copy.limitedAccess.title}
                    </h3>
                    <p className="text-sm text-red-700 dark:text-red-200/90">
                      {copy.limitedAccess.desc}
                    </p>
                  </div>
                </div>
              )}

              {/* Recent sales table */}
              <div className="bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-xl p-5">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
                  {copy.recentSales.title}
                </h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead>
                      <tr className="text-slate-700 border-b border-slate-300 dark:text-slate-400 dark:border-slate-800">
                        <th className="text-left py-3 px-4">
                          {copy.recentSales.date}
                        </th>
                        <th className="text-left py-3 px-4">
                          {copy.recentSales.time}
                        </th>
                        <th className="text-left py-3 px-4">
                          {copy.recentSales.items}
                        </th>
                        <th className="text-left py-3 px-4">
                          {copy.recentSales.total}
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                      {reportData?.recentSales?.length ? (
                        reportData.recentSales.map((sale: any, idx: number) => (
                          <tr
                            key={sale._id || idx}
                            className="text-slate-900 dark:text-slate-200"
                          >
                            <td className="py-3 px-4">
                              {sale.createdAt?.slice(0, 10) || "-"}
                            </td>
                            <td className="py-3 px-4 text-slate-700 dark:text-slate-400">
                              {sale.createdAt?.slice(11, 19) || "-"}
                            </td>
                            <td className="py-3 px-4 text-slate-900 dark:text-slate-200">
                              {sale.items?.length || 0}
                            </td>
                            <td className="py-3 px-4 text-slate-900 dark:text-slate-200">
                              {formatCurrency(sale.total || 0)}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td
                            colSpan={4}
                            className="py-4 px-4 text-center text-slate-600 dark:text-slate-400"
                          >
                            {loading ? "Cargando..." : copy.recentSales.noSales}
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Top products placeholder */}
              <div className="bg-white border border-slate-200 rounded-xl p-5 dark:bg-slate-900/80 dark:border-slate-800">
                <h3 className="text-lg font-semibold text-slate-900 mb-4 dark:text-white">
                  {copy.topProducts.title}
                </h3>
                <p className="text-sm text-slate-600 mb-4 dark:text-slate-400">
                  {copy.topProducts.subtitle}
                </p>
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead>
                      <tr className="text-slate-700 border-b border-slate-300 dark:text-slate-400 dark:border-slate-800">
                        <th className="text-left py-3 px-4">
                          {copy.topProducts.product}
                        </th>
                        <th className="text-left py-3 px-4">
                          {copy.topProducts.quantitySold}
                        </th>
                        <th className="text-left py-3 px-4">
                          {copy.topProducts.totalRevenue}
                        </th>
                        <th className="text-left py-3 px-4">
                          {copy.topProducts.approxCost}
                        </th>
                        <th className="text-left py-3 px-4">
                          {copy.topProducts.approxProfit}
                        </th>
                        <th className="text-left py-3 px-4">
                          {copy.topProducts.margin}
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 text-slate-900 dark:divide-slate-800 dark:text-slate-200">
                      {reportData?.topProducts?.length ? (
                        reportData.topProducts.map((p: any, idx: number) => (
                          <tr key={`${p.name}-${idx}`}>
                            <td className="py-3 px-4">{p.name}</td>
                            <td className="py-3 px-4">{p.quantity}</td>
                            <td className="py-3 px-4">
                              {formatCurrency(p.revenue)}
                            </td>
                            <td className="py-3 px-4">
                              {formatCurrency(p.totalCost || 0)}
                            </td>
                            <td className="py-3 px-4">
                              {formatCurrency(p.profit || 0)}
                            </td>
                            <td className="py-3 px-4">
                              {(p.margin || 0) > 0 ? p.margin.toFixed(1) : 0}%
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td className="py-3 px-4" colSpan={6}>
                            {loading ? "..." : "-"}
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === "categories" && (
            <div className="p-6">
              <div className="bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-xl p-5">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
                  {copy.tabs.categories}
                </h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead>
                      <tr className="text-slate-700 border-b border-slate-300 dark:text-slate-400 dark:border-slate-800">
                        <th className="text-left py-3 px-4">
                          {copy.tabs.categories}
                        </th>
                        <th className="text-left py-3 px-4">
                          {copy.kpis.itemsSold.title}
                        </th>
                        <th className="text-left py-3 px-4">
                          {copy.kpis.totalSales.title}
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                      {reportData?.categories?.length ? (
                        reportData.categories.map((c: any, idx: number) => (
                          <tr key={`${c.name}-${idx}`}>
                            <td className="py-3 px-4 text-slate-900 dark:text-slate-200">
                              {c.name}
                            </td>
                            <td className="py-3 px-4 text-slate-900 dark:text-slate-200">
                              {c.quantityUnits === 0 &&
                              c.quantityWeight === 0 ? (
                                <span className="text-slate-500 dark:text-slate-400">
                                  0
                                </span>
                              ) : (
                                <div className="flex flex-wrap items-center gap-2 text-sm">
                                  {c.quantityUnits > 0 && (
                                    <span className="px-2 py-0.5 rounded-full bg-slate-200/60 dark:bg-slate-800/70 text-slate-700 dark:text-slate-200">
                                      {formatQuantity(c.quantityUnits)} u
                                    </span>
                                  )}
                                  {c.quantityWeight > 0 && (
                                    <span className="px-2 py-0.5 rounded-full bg-emerald-200/60 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-200">
                                      {formatQuantity(c.quantityWeight)} kg
                                    </span>
                                  )}
                                </div>
                              )}
                            </td>
                            <td className="py-3 px-4 text-slate-900 dark:text-slate-200">
                              {formatCurrency(c.revenue)}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td
                            colSpan={3}
                            className="py-4 px-4 text-center text-slate-600 dark:text-slate-400"
                          >
                            {loading ? copy.loading : copy.recentSales.noSales}
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === "profitability" && (
            <div className="p-6">
              <div className="bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-xl p-5">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
                  {copy.tabs.profitability}
                </h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead>
                      <tr className="text-slate-700 border-b border-slate-300 dark:text-slate-400 dark:border-slate-800">
                        <th className="text-left py-3 px-4">
                          {copy.topProducts.product}
                        </th>
                        <th className="text-left py-3 px-4">
                          {copy.topProducts.totalRevenue}
                        </th>
                        <th className="text-left py-3 px-4">
                          {copy.topProducts.approxCost}
                        </th>
                        <th className="text-left py-3 px-4">
                          {copy.topProducts.approxProfit}
                        </th>
                        <th className="text-left py-3 px-4">
                          {copy.topProducts.margin}
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                      {reportData?.profitability?.length ? (
                        reportData.profitability.map((p: any, idx: number) => (
                          <tr key={`${p.name}-${idx}`}>
                            <td className="py-3 px-4 text-slate-900 dark:text-slate-200">
                              {p.name}
                            </td>
                            <td className="py-3 px-4 text-slate-900 dark:text-slate-200">
                              {formatCurrency(p.revenue)}
                            </td>
                            <td className="py-3 px-4 text-slate-900 dark:text-slate-200">
                              {formatCurrency(p.cost)}
                            </td>
                            <td className="py-3 px-4 text-slate-900 dark:text-slate-200">
                              {formatCurrency(p.profit)}
                            </td>
                            <td className="py-3 px-4 text-slate-900 dark:text-slate-200">
                              {p.margin > 0 ? p.margin.toFixed(1) : 0}%
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td
                            colSpan={5}
                            className="py-4 px-4 text-center text-slate-600 dark:text-slate-400"
                          >
                            {loading ? copy.loading : copy.recentSales.noSales}
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === "products" && (
            <div className="p-6">
              <div className="bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-xl p-5">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
                  {copy.tabs.products}
                </h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead>
                      <tr className="text-slate-700 border-b border-slate-300 dark:text-slate-400 dark:border-slate-800">
                        <th className="text-left py-3 px-4">
                          {copy.topProducts.product}
                        </th>
                        <th className="text-left py-3 px-4">
                          {copy.topProducts.quantitySold}
                        </th>
                        <th className="text-left py-3 px-4">
                          {copy.topProducts.totalRevenue}
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                      {reportData?.topProducts?.length ? (
                        reportData.topProducts.map((p: any, idx: number) => (
                          <tr key={`${p.name}-${idx}`}>
                            <td className="py-3 px-4 text-slate-900 dark:text-slate-200">
                              {p.name}
                            </td>
                            <td className="py-3 px-4 text-slate-900 dark:text-slate-200">
                              {formatQuantity(p.quantity)}
                              {p.isSoldByWeight ? " kg" : ""}
                            </td>
                            <td className="py-3 px-4 text-slate-900 dark:text-slate-200">
                              {formatCurrency(p.revenue)}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td
                            colSpan={3}
                            className="py-4 px-4 text-center text-slate-600 dark:text-slate-400"
                          >
                            {loading ? copy.loading : copy.recentSales.noSales}
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

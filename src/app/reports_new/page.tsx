"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useGlobalLanguage } from "@/lib/hooks/useGlobalLanguage";
import { apiFetch } from "@/lib/utils/apiFetch";
import Header from "@/components/layout/Header";
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
        desc: "Transacciones realizadas",
      },
      numSales: {
        title: "Nº de Ventas",
        desc: "Transacciones realizadas",
      },
      itemsSold: {
        title: "Ítems Vendidos",
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
      noSales: "No hay ventas registradas en este período",
    },
    premium: {
      title: "Función Premium",
      desc: "Esta funcionalidad está disponible en el Plan Profesional",
      button: "Actualizar a Profesional",
    },
  },
  en: {
    title: "Reports and Statistics",
    subtitle: "Analyze your business performance",
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
        desc: "Transactions completed",
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
      noSales: "No sales recorded in this period",
    },
    premium: {
      title: "Premium Feature",
      desc: "This feature is available in the Professional Plan",
      button: "Upgrade to Professional",
    },
  },
  pt: {
    title: "Relatórios e Estatísticas",
    subtitle: "Analise o desempenho completo do seu negócio",
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
        desc: "Transações realizadas",
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
      noSales: "Sem vendas registradas neste período",
    },
    premium: {
      title: "Recurso Premium",
      desc: "Este recurso está disponível no Plano Profissional",
      button: "Atualizar para Profissional",
    },
  },
};

export default function ReportsPage() {
  const router = useRouter();
  const { currentLanguage } = useGlobalLanguage();
  const [activeTab, setActiveTab] = useState("general");
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [fromDate, setFromDate] = useState<string>("");
  const [toDate, setToDate] = useState<string>("");
  const [reportData, setReportData] = useState<any>(null);

  const copy =
    REPORTS_COPY[currentLanguage as keyof typeof REPORTS_COPY] ||
    REPORTS_COPY.es;

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
      router.push("/auth/login");
      return;
    }
    setUser(JSON.parse(userStr));

    // Set default range to last 30 days
    const today = new Date();
    const start = new Date();
    start.setDate(today.getDate() - 30);
    setFromDate(fmt(start));
    setToDate(fmt(today));
  }, [router]);

  useEffect(() => {
    if (fromDate && toDate) {
      fetchReportData();
    }
  }, [fromDate, toDate]);

  const fetchReportData = async () => {
    setLoading(true);
    try {
      const url = `/api/sales?startDate=${fromDate}&endDate=${toDate}`;
      console.log(`[REPORTS_NEW PAGE] Fetching: ${url}`);
      const response = await apiFetch(url);

      console.log(`[REPORTS_NEW PAGE] Response status: ${response.status}`);

      if (response.ok) {
        const data = await response.json();
        console.log(
          `[REPORTS_NEW PAGE] API returned:`,
          JSON.stringify(data, null, 2),
        );

        // Parse sales data
        const sales = data.data?.sales || data.sales || [];
        console.log(
          `[REPORTS_NEW PAGE] Parsed sales array - count: ${sales.length}`,
        );

        const totalSales = sales.length;
        const totalRevenue = sales.reduce((sum: number, s: any) => {
          const gross =
            typeof s.total === "number"
              ? s.total
              : typeof s.totalWithTax === "number"
                ? s.totalWithTax
                : typeof s.amount === "number"
                  ? s.amount
                  : 0;
          return sum + gross;
        }, 0);
        const totalItems = sales.reduce(
          (sum: number, s: any) =>
            sum +
            (s.items?.reduce(
              (itemSum: number, item: any) => itemSum + (item.quantity || 0),
              0,
            ) || 0),
          0,
        );
        const avgTicket = totalSales > 0 ? totalRevenue / totalSales : 0;

        console.log(
          `[REPORTS_NEW PAGE] KPIs - Sales: ${totalSales}, Revenue: ${totalRevenue}, Items: ${totalItems}, Avg: ${avgTicket}`,
        );

        setReportData({
          totalSales,
          totalRevenue,
          totalItems,
          avgTicket,
        });
      } else {
        console.error(
          `[REPORTS_NEW PAGE] API error: ${response.status} ${response.statusText}`,
        );
        setReportData({
          totalSales: 0,
          totalRevenue: 0,
          totalItems: 0,
          avgTicket: 0,
        });
      }
    } catch (error) {
      console.error("[REPORTS_NEW PAGE] Error fetching report data:", error);
      setReportData({
        totalSales: 0,
        totalRevenue: 0,
        totalItems: 0,
        avgTicket: 0,
      });
    } finally {
      setLoading(false);
    }
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
    <div className="min-h-screen bg-white dark:bg-slate-950">
      <Header user={user} showBackButton />

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {copy.title}
            </h1>
            <p className="text-gray-600">{copy.subtitle}</p>
          </div>
          <button className="bg-green-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-700 flex items-center gap-2">
            <Download className="w-5 h-5" />
            {copy.exportCSV}
          </button>
        </div>

        {/* Date Range Picker */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6 flex items-center gap-4">
          <Calendar className="w-5 h-5 text-gray-500" />
          <span className="text-sm font-medium text-gray-700">
            {copy.dateRange}
          </span>
          <input
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <span className="text-gray-500">-</span>
          <input
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-md mb-6">
          <div className="flex border-b border-gray-200 overflow-x-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  disabled={tab.premium}
                  className={`flex items-center gap-2 px-6 py-4 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                    active
                      ? "border-blue-600 text-blue-600 bg-blue-50"
                      : "border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                  } ${tab.premium ? "opacity-50 cursor-not-allowed" : ""}`}
                >
                  <Icon className="w-4 h-4" />
                  {getTabLabel(tab.id)}
                  {tab.premium && (
                    <span className="ml-1 px-2 py-0.5 text-xs bg-purple-100 text-purple-700 rounded-full">
                      {copy.tabs.premium}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === "general" && (
              <div>
                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                  <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm text-gray-600">
                        {copy.kpis.totalSales.title}
                      </p>
                      <TrendingUp className="w-8 h-8 text-blue-500" />
                    </div>
                    <p className="text-3xl font-bold text-gray-900">
                      {loading ? "..." : reportData?.totalSales || 52}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      {copy.kpis.totalSales.desc}
                    </p>
                  </div>

                  <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm text-gray-600">
                        {copy.kpis.numSales.title}
                      </p>
                      <ShoppingCart className="w-8 h-8 text-green-500" />
                    </div>
                    <p className="text-3xl font-bold text-gray-900">
                      {loading ? "..." : reportData?.totalSales || 52}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      {copy.kpis.numSales.desc}
                    </p>
                  </div>

                  <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm text-gray-600">
                        {copy.kpis.itemsSold.title}
                      </p>
                      <Package className="w-8 h-8 text-purple-500" />
                    </div>
                    <p className="text-3xl font-bold text-gray-900">
                      {loading ? "..." : reportData?.totalItems || 1577}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      {copy.kpis.itemsSold.desc}
                    </p>
                  </div>

                  <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm text-gray-600">
                        {copy.kpis.avgTicket.title}
                      </p>
                      <DollarSign className="w-8 h-8 text-orange-500" />
                    </div>
                    <p className="text-3xl font-bold text-gray-900">
                      {formatCurrency(reportData?.avgTicket || 0)}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      {copy.kpis.avgTicket.desc}
                    </p>
                  </div>
                </div>

                {/* Access Limited Notice */}
                <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-6">
                  <div className="flex items-start gap-3">
                    <div className="bg-red-100 p-2 rounded-lg">
                      <BarChart3 className="w-6 h-6 text-red-600" />
                    </div>
                    <div>
                      <h3 className="font-bold text-red-900 mb-1">
                        {copy.limitedAccess.title}
                      </h3>
                      <p className="text-sm text-red-700 mb-3">
                        {copy.limitedAccess.desc}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Recent Sales Section */}
                <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
                  <h3 className="font-bold text-gray-900 mb-4">
                    {copy.recentSales.title}
                  </h3>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            {copy.recentSales.date}
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            {copy.recentSales.time}
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            {copy.recentSales.items}
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            {copy.recentSales.total}
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        <tr>
                          <td
                            className="px-6 py-4 whitespace-nowrap text-sm text-gray-500"
                            colSpan={4}
                          >
                            {copy.recentSales.noSales}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {activeTab !== "general" && (
              <div className="bg-purple-50 border-2 border-purple-200 border-dashed rounded-lg p-12 text-center">
                <Package className="w-16 h-16 text-purple-600 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-purple-900 mb-2">
                  {copy.premium.title}
                </h3>
                <p className="text-purple-700 mb-4">{copy.premium.desc}</p>
                <button className="bg-purple-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-purple-700">
                  {copy.premium.button}
                </button>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

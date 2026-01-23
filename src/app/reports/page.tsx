"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
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

export default function ReportsPage() {
  const router = useRouter();
  const { subscription, loading: subLoading } = useSubscription();
  const [activeTab, setActiveTab] = useState("general");
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [fromDate, setFromDate] = useState<string>("");
  const [toDate, setToDate] = useState<string>("");
  const [reportData, setReportData] = useState<any>(null);

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("es-AR", {
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
    try {
      const token = localStorage.getItem("accessToken");
      const url = `/api/sales?from=${fromDate}&to=${toDate}`;
      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        // Calculate actual data from database
        const sales = data.sales || [];
        const totalSales = sales.length;
        const totalRevenue = sales.reduce(
          (sum: number, s: any) => sum + (s.total || 0),
          0,
        );
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

        setReportData({
          totalSales,
          totalRevenue,
          totalItems,
          avgTicket,
          recentSales: sales.slice(0, 5),
        });
      }
    } catch (error) {
      console.error("Error fetching report data:", error);
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: "general", label: "Resumen General", icon: BarChart3 },
    { id: "categories", label: "Por Categorías", icon: Package, premium: true },
    {
      id: "profitability",
      label: "Rentabilidad",
      icon: DollarSign,
      premium: true,
    },
    { id: "products", label: "Productos", icon: ShoppingCart, premium: true },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <Header user={user} showBackButton />

      <main className="max-w-7xl mx-auto px-4 py-10">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-white">
              Reportes y Estadísticas
            </h1>
            <p className="text-slate-400 text-sm">
              Analiza el rendimiento completo de tu negocio
            </p>
          </div>
          <button className="bg-emerald-600 hover:bg-emerald-500 text-white px-5 py-2.5 rounded-lg font-semibold flex items-center gap-2 shadow-lg shadow-emerald-600/20">
            <Download className="w-5 h-5" />
            Exportar CSV
          </button>
        </div>

        {/* Date Range */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 flex items-center gap-3 mb-6">
          <Calendar className="w-5 h-5 text-slate-400" />
          <span className="text-sm text-slate-300 font-medium">
            Período de análisis:
          </span>
          <input
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            className="px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <span className="text-slate-500">-</span>
          <input
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            className="px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Tabs */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden mb-6">
          <div className="flex overflow-x-auto border-b border-slate-800">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => !tab.premium && setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-5 py-4 text-sm font-semibold whitespace-nowrap border-b-2 transition-colors ${
                    active
                      ? "border-blue-500 text-blue-400 bg-slate-850"
                      : "border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-850"
                  } ${tab.premium ? "opacity-60 cursor-not-allowed" : ""}`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                  {tab.premium && (
                    <span className="ml-1 px-2 py-0.5 text-xs bg-purple-900/40 text-purple-200 rounded-full">
                      Premium
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
                <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5">
                  <div className="flex items-center justify-between text-slate-400 text-sm mb-2">
                    Ventas Totales
                    <TrendingUp className="w-5 h-5 text-green-400" />
                  </div>
                  <div className="text-3xl font-bold text-white">
                    {loading
                      ? "..."
                      : reportData?.totalRevenue
                        ? formatCurrency(reportData.totalRevenue)
                        : "$0"}
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    En el período seleccionado
                  </p>
                </div>

                <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5">
                  <div className="flex items-center justify-between text-slate-400 text-sm mb-2">
                    Nº de Ventas
                    <ShoppingCart className="w-5 h-5 text-blue-400" />
                  </div>
                  <div className="text-3xl font-bold text-white">
                    {loading ? "..." : reportData?.totalSales || 0}
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    Transacciones realizadas
                  </p>
                </div>

                <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5">
                  <div className="flex items-center justify-between text-slate-400 text-sm mb-2">
                    Items Vendidos
                    <Package className="w-5 h-5 text-purple-400" />
                  </div>
                  <div className="text-3xl font-bold text-white">
                    {loading ? "..." : reportData?.totalItems || 0}
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    Productos en total
                  </p>
                </div>

                <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5">
                  <div className="flex items-center justify-between text-slate-400 text-sm mb-2">
                    Ticket Promedio
                    <DollarSign className="w-5 h-5 text-amber-400" />
                  </div>
                  <div className="text-3xl font-bold text-white">
                    {loading
                      ? "..."
                      : reportData?.avgTicket
                        ? formatCurrency(reportData.avgTicket)
                        : "$0.00"}
                  </div>
                  <p className="text-xs text-slate-500 mt-1">Por transacción</p>
                </div>
              </div>

              {/* Access limited */}
              <div className="rounded-xl border border-red-900/70 bg-red-900/30 text-red-200 p-4 flex items-start gap-3">
                <div className="bg-red-800/70 p-2 rounded-lg">
                  <BarChart3 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold">Acceso Limitado</h3>
                  <p className="text-sm text-red-200/90">
                    Las gráficas están disponibles en el Plan Profesional o
                    superior. Actualiza tu plan para acceder a esta
                    funcionalidad.
                  </p>
                </div>
              </div>

              {/* Recent sales table */}
              <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5">
                <h3 className="text-lg font-semibold text-white mb-4">
                  Ventas Recientes
                </h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead>
                      <tr className="text-slate-400 border-b border-slate-800">
                        <th className="text-left py-3 px-4">Fecha</th>
                        <th className="text-left py-3 px-4">Hora</th>
                        <th className="text-left py-3 px-4">Items</th>
                        <th className="text-left py-3 px-4">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                      {reportData?.recentSales?.length ? (
                        reportData.recentSales.map((sale: any, idx: number) => (
                          <tr key={sale._id || idx} className="text-slate-200">
                            <td className="py-3 px-4">
                              {sale.createdAt?.slice(0, 10) || "-"}
                            </td>
                            <td className="py-3 px-4 text-slate-400">
                              {sale.createdAt?.slice(11, 19) || "-"}
                            </td>
                            <td className="py-3 px-4 text-slate-200">
                              {sale.items?.length || 0}
                            </td>
                            <td className="py-3 px-4 text-slate-200">
                              {formatCurrency(sale.total || 0)}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td
                            colSpan={4}
                            className="py-4 px-4 text-center text-slate-400"
                          >
                            {loading
                              ? "Cargando..."
                              : "No hay ventas recientes en el período"}
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Top products placeholder */}
              <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5">
                <h3 className="text-lg font-semibold text-white mb-4">
                  Detalle de Productos Más Vendidos
                </h3>
                <p className="text-sm text-slate-400 mb-4">
                  Incluye análisis de costos y ganancias
                </p>
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead>
                      <tr className="text-slate-400 border-b border-slate-800">
                        <th className="text-left py-3 px-4">Producto</th>
                        <th className="text-left py-3 px-4">
                          Cantidad Vendida
                        </th>
                        <th className="text-left py-3 px-4">
                          Ingresos Totales
                        </th>
                        <th className="text-left py-3 px-4">Costo Aprox.</th>
                        <th className="text-left py-3 px-4">Ganancia Aprox.</th>
                        <th className="text-left py-3 px-4">Margen</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800 text-slate-200">
                      <tr>
                        <td className="py-3 px-4">-</td>
                        <td className="py-3 px-4">-</td>
                        <td className="py-3 px-4">-</td>
                        <td className="py-3 px-4">-</td>
                        <td className="py-3 px-4">-</td>
                        <td className="py-3 px-4">-</td>
                      </tr>
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

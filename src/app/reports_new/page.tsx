"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
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

export default function ReportsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("general");
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [fromDate, setFromDate] = useState<string>("");
  const [toDate, setToDate] = useState<string>("");
  const [reportData, setReportData] = useState<any>(null);

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

    fetchReportData();
  }, [router]);

  const fetchReportData = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      const response = await fetch("/api/sales", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        // Mock report data
        const totalSales = data.sales?.length || 52;
        const totalRevenue =
          data.sales?.reduce((sum: number, s: any) => sum + s.total, 0) || 0;
        const totalItems =
          data.sales?.reduce(
            (sum: number, s: any) => sum + s.items.length,
            0
          ) || 1577;

        setReportData({
          totalSales,
          totalRevenue,
          totalItems,
          avgTicket: totalRevenue / (totalSales || 1),
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
    <div className="min-h-screen bg-gray-50">
      <Header user={user} showBackButton />

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Reportes y Estadísticas
            </h1>
            <p className="text-gray-600">
              Analiza el rendimiento completo de tu negocio
            </p>
          </div>
          <button className="bg-green-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-700 flex items-center gap-2">
            <Download className="w-5 h-5" />
            Exportar CSV
          </button>
        </div>

        {/* Date Range Picker */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6 flex items-center gap-4">
          <Calendar className="w-5 h-5 text-gray-500" />
          <span className="text-sm font-medium text-gray-700">
            Período de análisis:
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
                  {tab.label}
                  {tab.premium && (
                    <span className="ml-1 px-2 py-0.5 text-xs bg-purple-100 text-purple-700 rounded-full">
                      Premium
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
                      <p className="text-sm text-gray-600">Ventas Totales</p>
                      <TrendingUp className="w-8 h-8 text-blue-500" />
                    </div>
                    <p className="text-3xl font-bold text-gray-900">
                      {loading ? "..." : reportData?.totalSales || 52}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      Transacciones realizadas
                    </p>
                  </div>

                  <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm text-gray-600">Nº de Ventas</p>
                      <ShoppingCart className="w-8 h-8 text-green-500" />
                    </div>
                    <p className="text-3xl font-bold text-gray-900">
                      {loading ? "..." : reportData?.totalSales || 52}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      Transacciones realizadas
                    </p>
                  </div>

                  <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm text-gray-600">Ítems Vendidos</p>
                      <Package className="w-8 h-8 text-purple-500" />
                    </div>
                    <p className="text-3xl font-bold text-gray-900">
                      {loading ? "..." : reportData?.totalItems || 1577}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      Productos en total
                    </p>
                  </div>

                  <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm text-gray-600">Ticket Promedio</p>
                      <DollarSign className="w-8 h-8 text-orange-500" />
                    </div>
                    <p className="text-3xl font-bold text-gray-900">$NaN</p>
                    <p className="text-sm text-gray-500 mt-1">
                      Por transacción
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
                        Acceso Limitado
                      </h3>
                      <p className="text-sm text-red-700 mb-3">
                        Las gráficas están disponibles en el Plan Profesional o
                        superior. Actualiza tu plan para acceder a esta
                        funcionalidad.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Recent Sales Section */}
                <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
                  <h3 className="font-bold text-gray-900 mb-4">
                    Ventas Recientes
                  </h3>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Fecha
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Hora
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Items
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Total
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        <tr>
                          <td
                            className="px-6 py-4 whitespace-nowrap text-sm text-gray-500"
                            colSpan={4}
                          >
                            No hay ventas registradas en este período
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
                  Función Premium
                </h3>
                <p className="text-purple-700 mb-4">
                  Esta funcionalidad está disponible en el Plan Profesional
                </p>
                <button className="bg-purple-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-purple-700">
                  Actualizar a Profesional
                </button>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

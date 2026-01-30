"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useGlobalLanguage } from "@/lib/hooks/useGlobalLanguage";
import { useBusinessDateTime } from "@/lib/hooks/useBusinessDateTime";
import Header from "@/components/layout/Header";
import Loading from "@/components/common/Loading";
import { apiFetch } from "@/lib/utils/apiFetch";
import { toast } from "react-toastify";

interface Sale {
  _id: string;
  discount?: number;
  subtotal?: number;
  totalWithTax: number;
  paymentMethod: string;
  paymentStatus: string;
  invoice: any;
  user: any;
  items: any[];
  createdAt: string;
}

export default function SalesPage() {
  const router = useRouter();
  const { t } = useGlobalLanguage();
  const { formatDateTime } = useBusinessDateTime();
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [analytics, setAnalytics] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<"list" | "analytics">("list");
  const [filters, setFilters] = useState({
    startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0],
    endDate: new Date().toISOString().split("T")[0],
    paymentStatus: "",
  });

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
    } catch {
      localStorage.removeItem("user");
      setLoading(false);
      router.push("/auth/login");
      return;
    }

    fetchSales();
  }, [filters, router, t]);

  const fetchSales = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        startDate: filters.startDate,
        endDate: filters.endDate,
        ...(filters.paymentStatus && { paymentStatus: filters.paymentStatus }),
      });

      const response = await apiFetch(`/api/sales/manage?${params}`, {
        method: "GET",
      });

      if (!response.ok) {
        const errorPayload = await response.json().catch(() => null);
        throw new Error(
          errorPayload?.error || String(t("errorLoadingSales", "errors")),
        );
      }

      const data = await response.json();
      setSales(data.sales);

      // Fetch analytics
      const analyticsParams = new URLSearchParams({
        type: "analytics",
        startDate: filters.startDate,
        endDate: filters.endDate,
      });

      const analyticsRes = await apiFetch(
        `/api/sales/manage?${analyticsParams}`,
        { method: "GET" },
      );

      if (analyticsRes.ok) {
        const analyticsData = await analyticsRes.json();
        setAnalytics(analyticsData.analytics);
      } else {
        setAnalytics(null);
      }
    } catch (error) {
      console.error("Error fetching sales:", error);
      toast.error(t("errorLoadingSales", "errors"));
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    // Use locale-aware formatting based on current language
    const locale = t("__locale__", "common") || "es-AR"; // Fallback to es-AR
    return new Intl.NumberFormat(String(locale), {
      style: "currency",
      currency: "ARS",
    }).format(value);
  };

  const getPaymentMethodLabel = (method: string) => {
    const emojis: any = {
      cash: "💵 ",
      card: "💳 ",
      check: "📋 ",
      online: "🏦 ",
      mercadopago: "🟔 ",
    };
    const methodKey = `paymentOptions.${method}` as const;
    return `${emojis[method] || ""}${String(t(methodKey, "pos"))}`;
  };

  const getStatusBadge = (status: string) => {
    const classes: any = {
      completed: "bg-green-100 text-green-800",
      pending: "bg-yellow-100 text-yellow-800",
      failed: "bg-red-100 text-red-800",
      partial: "bg-orange-100 text-orange-800",
    };
    const statusKey = `pos.labels.${status}` as const;
    return (
      <span
        className={`px-3 py-1 rounded-full text-xs font-medium ${
          classes[status] || ""
        }`}
      >
        {String(t(statusKey, "pos"))}
      </span>
    );
  };

  if (loading && !user) {
    return <Loading label="Cargando ventas..." />;
  }

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">
      <Header user={user} showBackButton={true} />

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Historial de Ventas
          </h1>
          <p className="text-gray-600">
            Gestiona y visualiza todas tus ventas e invoices
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-6 border-b">
          <button
            onClick={() => setActiveTab("list")}
            className={`px-4 py-3 font-medium border-b-2 transition ${
              activeTab === "list"
                ? "text-blue-600 border-blue-600"
                : "text-gray-600 border-transparent hover:text-gray-800"
            }`}
          >
            📋 Lista de Ventas
          </button>
          <button
            onClick={() => setActiveTab("analytics")}
            className={`px-4 py-3 font-medium border-b-2 transition ${
              activeTab === "analytics"
                ? "text-blue-600 border-blue-600"
                : "text-gray-600 border-transparent hover:text-gray-800"
            }`}
          >
            📊 Analítica
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white p-4 rounded-lg shadow mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fecha Desde
              </label>
              <input
                type="date"
                value={filters.startDate}
                onChange={(e) =>
                  setFilters({ ...filters, startDate: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fecha Hasta
              </label>
              <input
                type="date"
                value={filters.endDate}
                onChange={(e) =>
                  setFilters({ ...filters, endDate: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Estado Pago
              </label>
              <select
                value={filters.paymentStatus}
                onChange={(e) =>
                  setFilters({ ...filters, paymentStatus: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              >
                <option value="">Todos</option>
                <option value="completed">Completadas</option>
                <option value="pending">Pendientes</option>
                <option value="failed">Fallidas</option>
                <option value="partial">Parciales</option>
              </select>
            </div>
            <div className="flex items-end">
              <button
                onClick={() => fetchSales()}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition"
              >
                Buscar
              </button>
            </div>
          </div>
        </div>

        {/* List Tab */}
        {activeTab === "list" && (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            {loading ? (
              <div className="p-8 text-center text-gray-500">Cargando...</div>
            ) : sales.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                No hay ventas para el período seleccionado
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                        Fecha
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                        Comprobante
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                        Vendedor
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                        Monto
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                        Descuento
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                        Método
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                        Estado
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-700 uppercase">
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {sales.map((sale) => (
                      <tr
                        key={sale._id}
                        className="hover:bg-gray-50 transition"
                      >
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {formatDateTime(sale.createdAt)}
                        </td>
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">
                          {sale.invoice?.invoiceNumber || "S/N"}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {sale.user?.fullName || "Usuario"}
                        </td>
                        <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                          {formatCurrency(sale.totalWithTax)}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-700">
                          {formatCurrency(sale.discount || 0)}
                        </td>
                        <td className="px-6 py-4 text-sm">
                          {getPaymentMethodLabel(sale.paymentMethod)}
                        </td>
                        <td className="px-6 py-4 text-sm">
                          {getStatusBadge(sale.paymentStatus)}
                        </td>
                        <td className="px-6 py-4 text-right space-x-2">
                          <button
                            onClick={() =>
                              window.open(
                                `/api/sales/receipt?saleId=${sale._id}&format=html`,
                                "_blank",
                              )
                            }
                            className="text-blue-600 hover:text-blue-800 font-medium text-sm"
                          >
                            Ver Comprobante
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === "analytics" && analytics && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Total Sales */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">
                    Total de Ventas
                  </p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">
                    {analytics.totalSales}
                  </p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-2xl">📊</span>
                </div>
              </div>
            </div>

            {/* Revenue */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">
                    Ingresos Totales
                  </p>
                  <p className="text-3xl font-bold text-green-600 mt-2">
                    {formatCurrency(analytics.totalRevenue)}
                  </p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-2xl">💰</span>
                </div>
              </div>
            </div>

            {/* Average Ticket */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">
                    Ticket Promedio
                  </p>
                  <p className="text-3xl font-bold text-purple-600 mt-2">
                    {formatCurrency(analytics.averageTicket)}
                  </p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                  <span className="text-2xl">📈</span>
                </div>
              </div>
            </div>

            {/* Total Tax */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">
                    IVA Total 21%
                  </p>
                  <p className="text-3xl font-bold text-orange-600 mt-2">
                    {formatCurrency(analytics.totalTax)}
                  </p>
                </div>
                <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                  <span className="text-2xl">🧾</span>
                </div>
              </div>
            </div>

            {/* Payment Methods */}
            <div className="bg-white rounded-lg shadow p-6 md:col-span-2">
              <h3 className="font-semibold text-gray-900 mb-4">
                Por Método de Pago
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">💵 Efectivo</span>
                  <span className="font-medium">
                    {analytics.byPaymentMethod.cash}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">💳 Tarjeta</span>
                  <span className="font-medium">
                    {analytics.byPaymentMethod.card}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">🏦 Online</span>
                  <span className="font-medium">
                    {analytics.byPaymentMethod.online}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">🟔 Mercado Pago</span>
                  <span className="font-medium">
                    {analytics.byPaymentMethod.mercadopago}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">📋 Cheque</span>
                  <span className="font-medium">
                    {analytics.byPaymentMethod.check}
                  </span>
                </div>
              </div>
            </div>

            {/* Payment Status */}
            <div className="bg-white rounded-lg shadow p-6 md:col-span-2">
              <h3 className="font-semibold text-gray-900 mb-4">
                Por Estado de Pago
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-green-600 font-medium">
                    ✓ Completadas
                  </span>
                  <span className="font-bold text-lg">
                    {analytics.byPaymentStatus.completed}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-yellow-600 font-medium">
                    ⏳ Pendientes
                  </span>
                  <span className="font-bold text-lg">
                    {analytics.byPaymentStatus.pending}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-orange-600 font-medium">
                    ⚠️ Parciales
                  </span>
                  <span className="font-bold text-lg">
                    {analytics.byPaymentStatus.partial}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-red-600 font-medium">✕ Fallidas</span>
                  <span className="font-bold text-lg">
                    {analytics.byPaymentStatus.failed}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

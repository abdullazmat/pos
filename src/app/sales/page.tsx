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
    <div className="vp-page">
      <Header user={user} showBackButton={true} />

      <main className="vp-page-inner">
        <div className="mb-8">
          <h1 className="vp-section-title">Historial de Ventas</h1>
          <p className="vp-section-subtitle">
            Gestiona y visualiza todas tus ventas e invoices
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-6 border-b border-[hsl(var(--vp-border))]">
          <button
            onClick={() => setActiveTab("list")}
            className={`vp-tab ${activeTab === "list" ? "vp-tab-active" : ""}`}
          >
            📋 Lista de Ventas
          </button>
          <button
            onClick={() => setActiveTab("analytics")}
            className={`vp-tab ${
              activeTab === "analytics" ? "vp-tab-active" : ""
            }`}
          >
            📊 Analítica
          </button>
        </div>

        {/* Filters */}
        <div className="vp-card p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[hsl(var(--vp-muted))] mb-1">
                Fecha Desde
              </label>
              <input
                type="date"
                value={filters.startDate}
                onChange={(e) =>
                  setFilters({ ...filters, startDate: e.target.value })
                }
                className="w-full text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[hsl(var(--vp-muted))] mb-1">
                Fecha Hasta
              </label>
              <input
                type="date"
                value={filters.endDate}
                onChange={(e) =>
                  setFilters({ ...filters, endDate: e.target.value })
                }
                className="w-full text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[hsl(var(--vp-muted))] mb-1">
                Estado Pago
              </label>
              <select
                value={filters.paymentStatus}
                onChange={(e) =>
                  setFilters({ ...filters, paymentStatus: e.target.value })
                }
                className="w-full text-sm"
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
                className="w-full vp-button vp-button-primary"
              >
                Buscar
              </button>
            </div>
          </div>
        </div>

        {/* List Tab */}
        {activeTab === "list" && (
          <div className="vp-card overflow-hidden">
            {loading ? (
              <div className="p-8 text-center text-[hsl(var(--vp-muted))]">
                Cargando...
              </div>
            ) : sales.length === 0 ? (
              <div className="p-8 text-center text-[hsl(var(--vp-muted))]">
                No hay ventas para el período seleccionado
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="vp-table">
                  <thead>
                    <tr>
                      <th>Fecha</th>
                      <th>Comprobante</th>
                      <th>Vendedor</th>
                      <th>Monto</th>
                      <th>Descuento</th>
                      <th>Método</th>
                      <th>Estado</th>
                      <th className="text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sales.map((sale) => (
                      <tr key={sale._id}>
                        <td className="text-sm text-[hsl(var(--vp-text))]">
                          {formatDateTime(sale.createdAt)}
                        </td>
                        <td className="text-sm font-semibold text-[hsl(var(--vp-text))]">
                          {sale.invoice?.invoiceNumber || "S/N"}
                        </td>
                        <td className="text-sm text-[hsl(var(--vp-muted))]">
                          {sale.user?.fullName || "Usuario"}
                        </td>
                        <td className="text-sm font-semibold text-[hsl(var(--vp-text))]">
                          {formatCurrency(sale.totalWithTax)}
                        </td>
                        <td className="text-sm text-[hsl(var(--vp-muted))]">
                          {formatCurrency(sale.discount || 0)}
                        </td>
                        <td className="text-sm">
                          {getPaymentMethodLabel(sale.paymentMethod)}
                        </td>
                        <td className="text-sm">
                          {getStatusBadge(sale.paymentStatus)}
                        </td>
                        <td className="text-right">
                          <button
                            onClick={() =>
                              window.open(
                                `/api/sales/receipt?saleId=${sale._id}&format=html`,
                                "_blank",
                              )
                            }
                            className="text-[hsl(var(--vp-primary))] hover:text-[hsl(var(--vp-primary-strong))] font-semibold text-sm"
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
            <div className="vp-card p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[hsl(var(--vp-muted))] text-sm font-medium">
                    Total de Ventas
                  </p>
                  <p className="text-3xl font-semibold text-[hsl(var(--vp-text))] mt-2">
                    {analytics.totalSales}
                  </p>
                </div>
                <div className="w-12 h-12 bg-[hsl(var(--vp-bg-soft))] rounded-full flex items-center justify-center">
                  <span className="text-xl">📊</span>
                </div>
              </div>
            </div>

            {/* Revenue */}
            <div className="vp-card p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[hsl(var(--vp-muted))] text-sm font-medium">
                    Ingresos Totales
                  </p>
                  <p className="text-3xl font-semibold text-[hsl(var(--vp-primary))] mt-2">
                    {formatCurrency(analytics.totalRevenue)}
                  </p>
                </div>
                <div className="w-12 h-12 bg-[hsl(var(--vp-bg-soft))] rounded-full flex items-center justify-center">
                  <span className="text-xl">💰</span>
                </div>
              </div>
            </div>

            {/* Average Ticket */}
            <div className="vp-card p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[hsl(var(--vp-muted))] text-sm font-medium">
                    Ticket Promedio
                  </p>
                  <p className="text-3xl font-semibold text-[hsl(var(--vp-text))] mt-2">
                    {formatCurrency(analytics.averageTicket)}
                  </p>
                </div>
                <div className="w-12 h-12 bg-[hsl(var(--vp-bg-soft))] rounded-full flex items-center justify-center">
                  <span className="text-xl">📈</span>
                </div>
              </div>
            </div>

            {/* Total Tax */}
            <div className="vp-card p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[hsl(var(--vp-muted))] text-sm font-medium">
                    IVA Total 21%
                  </p>
                  <p className="text-3xl font-semibold text-[hsl(var(--vp-text))] mt-2">
                    {formatCurrency(analytics.totalTax)}
                  </p>
                </div>
                <div className="w-12 h-12 bg-[hsl(var(--vp-bg-soft))] rounded-full flex items-center justify-center">
                  <span className="text-xl">🧾</span>
                </div>
              </div>
            </div>

            {/* Payment Methods */}
            <div className="vp-card p-6 md:col-span-2">
              <h3 className="font-semibold text-[hsl(var(--vp-text))] mb-4">
                Por Método de Pago
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-[hsl(var(--vp-muted))]">
                    💵 Efectivo
                  </span>
                  <span className="font-medium">
                    {analytics.byPaymentMethod.cash}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[hsl(var(--vp-muted))]">
                    💳 Tarjeta
                  </span>
                  <span className="font-medium">
                    {analytics.byPaymentMethod.card}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[hsl(var(--vp-muted))]">🏦 Online</span>
                  <span className="font-medium">
                    {analytics.byPaymentMethod.online}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[hsl(var(--vp-muted))]">
                    🟔 Mercado Pago
                  </span>
                  <span className="font-medium">
                    {analytics.byPaymentMethod.mercadopago}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[hsl(var(--vp-muted))]">📋 Cheque</span>
                  <span className="font-medium">
                    {analytics.byPaymentMethod.check}
                  </span>
                </div>
              </div>
            </div>

            {/* Payment Status */}
            <div className="vp-card p-6 md:col-span-2">
              <h3 className="font-semibold text-[hsl(var(--vp-text))] mb-4">
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

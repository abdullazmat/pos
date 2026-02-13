"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useGlobalLanguage } from "@/lib/hooks/useGlobalLanguage";
import { useBusinessDateTime } from "@/lib/hooks/useBusinessDateTime";
import Header from "@/components/layout/Header";
import Loading from "@/components/common/Loading";
import { apiFetch } from "@/lib/utils/apiFetch";
import { toast } from "react-toastify";

/** Safely convert MongoDB Decimal128 ({$numberDecimal: "x"}) to a plain number */
const toNum = (v: any): number => {
  if (v == null) return 0;
  if (typeof v === "number") return v;
  if (typeof v === "object" && v.$numberDecimal != null)
    return parseFloat(v.$numberDecimal);
  if (typeof v === "string") return parseFloat(v) || 0;
  return Number(v) || 0;
};

interface Sale {
  _id: string;
  discount?: number;
  subtotal?: number;
  totalWithTax: number;
  tax?: number;
  paymentMethod: string;
  paymentStatus: string;
  invoice: any;
  user: any;
  userId: any;
  items: any[];
  createdAt: string;
  notes?: string;
}

export default function SalesPage() {
  const router = useRouter();
  const { t, currentLanguage } = useGlobalLanguage();
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
      toast.error(String(t("errorLoadingSales", "errors")));
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: any) => {
    // Use locale-aware formatting based on current language
    const locale = t("__locale__", "common") || "es-AR"; // Fallback to es-AR
    return new Intl.NumberFormat(String(locale), {
      style: "currency",
      currency: "ARS",
    }).format(toNum(value));
  };

  /** Localize common ARCA/AFIP error messages */
  const localizeArcaError = (error: string): string => {
    if (!error) return "";
    // Strip common server prefixes so regex patterns match the raw AFIP message
    const raw = error.replace(/^AFIP rejected:\s*/i, "").trim();
    // Map known AFIP error patterns to localized messages
    const patterns: Array<{ pattern: RegExp; key: string }> = [
      {
        pattern: /ImpNeto.*mayor.*0.*IVA.*obligatorio|10070/i,
        key: "arcaErrIvaObligatorio",
      },
      {
        pattern: /Factura A.*Consumidor Final/i,
        key: "arcaErrFacturaAConsumidorFinal",
      },
      {
        pattern: /DocTipo.*debe ser igual a 80|10013/i,
        key: "arcaErrDocTipoMustBeCuit",
      },
      { pattern: /DocNro.*inv[áa]lid|10015/i, key: "arcaErrDocNroInvalido" },
      {
        pattern: /Condicion.*IVA.*receptor|CondicionIvaReceptor|10243/i,
        key: "arcaErrCondicionIvaReceptor",
      },
      { pattern: /DocTipo.*no v[áa]lido/i, key: "arcaErrDocTipoInvalido" },
      { pattern: /CUIT.*inv[áa]lid/i, key: "arcaErrCuitInvalido" },
      { pattern: /El campo.*CbteDesde/i, key: "arcaErrCbteDesde" },
      { pattern: /El campo.*CbteHasta/i, key: "arcaErrCbteHasta" },
      { pattern: /Comprobante.*duplicado/i, key: "arcaErrDuplicado" },
      {
        pattern: /ImpTotal.*no coincide|MontoTotal/i,
        key: "arcaErrMontoTotal",
      },
      {
        pattern: /PtoVta.*no corresponde|punto de venta/i,
        key: "arcaErrPtoVta",
      },
      {
        pattern: /fecha.*fuera.*rango|FchVto|vencimiento/i,
        key: "arcaErrFechaFueraRango",
      },
      { pattern: /certificado|certificate/i, key: "arcaErrCertificado" },
      { pattern: /timeout|timed? ?out/i, key: "arcaErrTimeout" },
      { pattern: /ECONNREFUSED|ENOTFOUND|network/i, key: "arcaErrConexion" },
      { pattern: /cancelada|cancelled/i, key: "arcaErrCancelada" },
    ];
    for (const { pattern, key } of patterns) {
      if (pattern.test(raw)) {
        const localized = String(t(`salesPage.${key}`, "pos"));
        // If translation key not found (returns the key itself), fall back to raw error
        if (localized.includes(key)) return error;
        return `${localized}\n\n📋 ${String(t("salesPage.arcaOriginalError", "pos"))}: ${raw}`;
      }
    }
    return error;
  };

  const getPaymentMethodLabel = (method: string) => {
    const emojis: Record<string, string> = {
      cash: "💵 ",
      card: "💳 ",
      check: "📋 ",
      online: "🏦 ",
      mercadopago: "🟔 ",
      qr: "📱 ",
      bankTransfer: "🏦 ",
      multiple: "🔀 ",
    };
    const keyMap: Record<string, string> = {
      cash: "cash",
      card: "card",
      check: "checkPayment",
      online: "online",
      mercadopago: "mercadopago",
      qr: "qr",
      bankTransfer: "bankTransfer",
      multiple: "multiple",
    };
    const translationKey = keyMap[method] || method;
    return `${emojis[method] || ""}${String(t(`salesPage.${translationKey}`, "pos"))}`;
  };

  const getStatusBadge = (status: string) => {
    const classes: Record<string, string> = {
      completed: "bg-green-100 text-green-800",
      pending: "bg-yellow-100 text-yellow-800",
      failed: "bg-red-100 text-red-800",
      partial: "bg-orange-100 text-orange-800",
    };
    return (
      <span
        className={`px-3 py-1 rounded-full text-xs font-medium ${
          classes[status] || "bg-gray-100 text-gray-800"
        }`}
      >
        {String(t(`salesPage.${status}`, "pos"))}
      </span>
    );
  };

  const [retryingId, setRetryingId] = useState<string | null>(null);
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  const getArcaStatusBadge = (invoice: any) => {
    if (!invoice || invoice.channel !== "ARCA") {
      return <span className="text-xs text-[hsl(var(--vp-muted))]">—</span>;
    }

    const status = invoice.status || invoice.arcaStatus;
    const cae = invoice.fiscalData?.cae;

    if (status === "AUTHORIZED" && cae) {
      return (
        <div className="flex flex-col gap-0.5">
          <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            ✅ {String(t("salesPage.arcaApproved", "pos"))}
          </span>
          <span className="text-[10px] text-[hsl(var(--vp-muted))] font-mono">
            CAE: {cae}
          </span>
        </div>
      );
    }

    if (status === "PENDING_CAE") {
      return (
        <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
          ⏳ {String(t("salesPage.arcaPending", "pos"))}
        </span>
      );
    }

    if (invoice.arcaStatus === "REJECTED") {
      return (
        <div className="flex flex-col gap-0.5">
          <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            ❌ {String(t("salesPage.arcaRejected", "pos"))}
          </span>
          {invoice.arcaLastError && (
            <span
              className="text-[10px] text-red-600 max-w-[200px] truncate"
              title={invoice.arcaLastError}
            >
              {invoice.arcaLastError}
            </span>
          )}
        </div>
      );
    }

    if (status === "CANCELLED") {
      return (
        <div className="flex flex-col gap-0.5">
          <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400">
            🚫 {String(t("salesPage.arcaCancelled", "pos"))}
          </span>
          {invoice.arcaLastError && (
            <span
              className="text-[10px] text-gray-500 max-w-[200px] truncate"
              title={invoice.arcaLastError}
            >
              {invoice.arcaLastError}
            </span>
          )}
        </div>
      );
    }

    return (
      <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
        {status || "—"}
      </span>
    );
  };

  const handleRetryInvoice = async (invoiceId: string) => {
    if (retryingId) return;
    setRetryingId(invoiceId);
    try {
      const res = await apiFetch(`/api/invoices/${invoiceId}/retry`, {
        method: "POST",
      });
      const data = await res.json();
      if (res.ok && data.cae) {
        toast.success(
          `${String(t("salesPage.retryCaeSuccess", "pos"))}: ${data.cae}`,
        );
        // Refresh the selected sale if modal is open
        if (selectedSale && selectedSale.invoice?._id === invoiceId) {
          openSaleDetail(selectedSale._id);
        }
      } else if (res.ok) {
        // Non-error response without CAE (e.g. "already authorized")
        const code = data.messageCode;
        const localized = code ? String(t(`salesPage.api_${code}`, "pos")) : "";
        toast.info(
          localized && !localized.includes(`api_${code}`)
            ? localized
            : data.message || String(t("salesPage.retrySent", "pos")),
        );
      } else {
        // Error response – use errorCode for localization, fall back to AFIP error pattern matching
        const code = data.errorCode;
        if (code && code !== "AFIP_REJECTED") {
          const localized = String(t(`salesPage.api_${code}`, "pos"));
          toast.error(
            !localized.includes(`api_${code}`)
              ? localized
              : data.error || String(t("salesPage.retryError", "pos")),
          );
        } else {
          // AFIP rejection or unknown error – use pattern-matching localizer
          const errorMsg =
            data.error || String(t("salesPage.retryError", "pos"));
          toast.error(localizeArcaError(errorMsg));
        }
      }
      // Silent refresh — don't set loading to avoid full-page flash
      try {
        const params = new URLSearchParams({
          startDate: filters.startDate,
          endDate: filters.endDate,
          ...(filters.paymentStatus && {
            paymentStatus: filters.paymentStatus,
          }),
        });
        const refreshRes = await apiFetch(`/api/sales/manage?${params}`, {
          method: "GET",
        });
        if (refreshRes.ok) {
          const refreshData = await refreshRes.json();
          setSales(refreshData.sales);
        }
      } catch {
        /* silent */
      }
    } catch {
      toast.error(String(t("salesPage.connectionError", "pos")));
    } finally {
      setRetryingId(null);
    }
  };

  const openSaleDetail = async (saleId: string) => {
    setLoadingDetail(true);
    try {
      const res = await apiFetch(`/api/sales/manage?type=detail&id=${saleId}`, {
        method: "GET",
      });
      if (res.ok) {
        const data = await res.json();
        setSelectedSale(data.sale || data);
      } else {
        // Fallback: use the sale data we already have
        const existing = sales.find((s) => s._id === saleId);
        if (existing) setSelectedSale(existing);
      }
    } catch {
      const existing = sales.find((s) => s._id === saleId);
      if (existing) setSelectedSale(existing);
    } finally {
      setLoadingDetail(false);
    }
  };

  if (loading && !user) {
    return <Loading label={String(t("salesPage.loadingPage", "pos"))} />;
  }

  return (
    <div className="vp-page">
      <Header user={user} showBackButton={true} />

      <main className="vp-page-inner">
        <div className="mb-8">
          <h1 className="vp-section-title">
            {String(t("salesPage.title", "pos"))}
          </h1>
          <p className="vp-section-subtitle">
            {String(t("salesPage.subtitle", "pos"))}
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-6 border-b border-[hsl(var(--vp-border))]">
          <button
            onClick={() => setActiveTab("list")}
            className={`vp-tab ${activeTab === "list" ? "vp-tab-active" : ""}`}
          >
            📋 {String(t("salesPage.tabList", "pos"))}
          </button>
          <button
            onClick={() => setActiveTab("analytics")}
            className={`vp-tab ${
              activeTab === "analytics" ? "vp-tab-active" : ""
            }`}
          >
            📊 {String(t("salesPage.tabAnalytics", "pos"))}
          </button>
        </div>

        {/* Filters */}
        <div className="vp-card p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[hsl(var(--vp-muted))] mb-1">
                {String(t("salesPage.dateFrom", "pos"))}
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
                {String(t("salesPage.dateTo", "pos"))}
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
                {String(t("salesPage.paymentState", "pos"))}
              </label>
              <select
                value={filters.paymentStatus}
                onChange={(e) =>
                  setFilters({ ...filters, paymentStatus: e.target.value })
                }
                className="w-full text-sm"
              >
                <option value="">{String(t("salesPage.all", "pos"))}</option>
                <option value="completed">
                  {String(t("salesPage.completed", "pos"))}
                </option>
                <option value="pending">
                  {String(t("salesPage.pending", "pos"))}
                </option>
                <option value="failed">
                  {String(t("salesPage.failed", "pos"))}
                </option>
                <option value="partial">
                  {String(t("salesPage.partial", "pos"))}
                </option>
              </select>
            </div>
            <div className="flex items-end">
              <button
                onClick={() => fetchSales()}
                className="w-full vp-button vp-button-primary"
              >
                {String(t("salesPage.search", "pos"))}
              </button>
            </div>
          </div>
        </div>

        {/* List Tab */}
        {activeTab === "list" && (
          <div className="vp-card overflow-hidden">
            {loading ? (
              <div className="p-8 text-center text-[hsl(var(--vp-muted))]">
                {String(t("salesPage.loading", "pos"))}
              </div>
            ) : sales.length === 0 ? (
              <div className="p-8 text-center text-[hsl(var(--vp-muted))]">
                {String(t("salesPage.noSalesFound", "pos"))}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="vp-table">
                  <thead>
                    <tr>
                      <th>{String(t("salesPage.date", "pos"))}</th>
                      <th>{String(t("salesPage.receipt", "pos"))}</th>
                      <th>{String(t("salesPage.seller", "pos"))}</th>
                      <th>{String(t("salesPage.amount", "pos"))}</th>
                      <th>{String(t("salesPage.method", "pos"))}</th>
                      <th>{String(t("salesPage.status", "pos"))}</th>
                      <th>{String(t("salesPage.arca", "pos"))}</th>
                      <th className="text-right">
                        {String(t("salesPage.actions", "pos"))}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {sales.map((sale) => (
                      <tr key={sale._id}>
                        <td className="text-sm text-[hsl(var(--vp-text))]">
                          {formatDateTime(sale.createdAt)}
                        </td>
                        <td className="text-sm font-semibold text-[hsl(var(--vp-text))]">
                          {sale.invoice?.invoiceNumber ||
                            String(t("salesPage.noInvoice", "pos"))}
                        </td>
                        <td className="text-sm text-[hsl(var(--vp-muted))]">
                          {sale.userId?.fullName ||
                            sale.user?.fullName ||
                            String(t("salesPage.unknownUser", "pos"))}
                        </td>
                        <td className="text-sm font-semibold text-[hsl(var(--vp-text))]">
                          {formatCurrency(sale.totalWithTax)}
                        </td>
                        <td className="text-sm">
                          {getPaymentMethodLabel(sale.paymentMethod)}
                        </td>
                        <td className="text-sm">
                          {getStatusBadge(sale.paymentStatus)}
                        </td>
                        <td className="text-sm">
                          {getArcaStatusBadge(sale.invoice)}
                        </td>
                        <td className="text-right">
                          <button
                            onClick={() => openSaleDetail(sale._id)}
                            className="text-[hsl(var(--vp-primary))] hover:text-[hsl(var(--vp-primary-strong))] font-semibold text-sm"
                          >
                            {String(t("salesPage.view", "pos"))}
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
                    {String(t("salesPage.totalSales", "pos"))}
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
                    {String(t("salesPage.totalRevenue", "pos"))}
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
                    {String(t("salesPage.averageTicket", "pos"))}
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
                    {String(t("salesPage.totalTax", "pos"))}
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
                {String(t("salesPage.byPaymentMethod", "pos"))}
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-[hsl(var(--vp-muted))]">
                    💵 {String(t("salesPage.cash", "pos"))}
                  </span>
                  <span className="font-medium">
                    {analytics.byPaymentMethod.cash}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[hsl(var(--vp-muted))]">
                    💳 {String(t("salesPage.card", "pos"))}
                  </span>
                  <span className="font-medium">
                    {analytics.byPaymentMethod.card}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[hsl(var(--vp-muted))]">
                    🏦 {String(t("salesPage.online", "pos"))}
                  </span>
                  <span className="font-medium">
                    {analytics.byPaymentMethod.online}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[hsl(var(--vp-muted))]">
                    🟔 {String(t("salesPage.mercadopago", "pos"))}
                  </span>
                  <span className="font-medium">
                    {analytics.byPaymentMethod.mercadopago}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[hsl(var(--vp-muted))]">
                    📋 {String(t("salesPage.checkPayment", "pos"))}
                  </span>
                  <span className="font-medium">
                    {analytics.byPaymentMethod.check}
                  </span>
                </div>
              </div>
            </div>

            {/* Payment Status */}
            <div className="vp-card p-6 md:col-span-2">
              <h3 className="font-semibold text-[hsl(var(--vp-text))] mb-4">
                {String(t("salesPage.byPaymentStatus", "pos"))}
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-green-600 font-medium">
                    ✓ {String(t("salesPage.completed", "pos"))}
                  </span>
                  <span className="font-bold text-lg">
                    {analytics.byPaymentStatus.completed}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-yellow-600 font-medium">
                    ⏳ {String(t("salesPage.pending", "pos"))}
                  </span>
                  <span className="font-bold text-lg">
                    {analytics.byPaymentStatus.pending}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-orange-600 font-medium">
                    ⚠️ {String(t("salesPage.partial", "pos"))}
                  </span>
                  <span className="font-bold text-lg">
                    {analytics.byPaymentStatus.partial}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-red-600 font-medium">
                    ✕ {String(t("salesPage.failed", "pos"))}
                  </span>
                  <span className="font-bold text-lg">
                    {analytics.byPaymentStatus.failed}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Sale Detail Modal */}
      {selectedSale && (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedSale(null)}
        >
          <div
            className="bg-[hsl(var(--vp-bg))] rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="sticky top-0 bg-[hsl(var(--vp-bg))] border-b border-[hsl(var(--vp-border))] px-6 py-4 flex items-center justify-between rounded-t-2xl z-10">
              <h2 className="text-lg font-bold text-[hsl(var(--vp-text))]">
                🧾 {String(t("salesPage.saleDetail", "pos"))}
              </h2>
              <button
                onClick={() => setSelectedSale(null)}
                className="text-[hsl(var(--vp-muted))] hover:text-[hsl(var(--vp-text))] text-xl font-bold w-8 h-8 flex items-center justify-center rounded-full hover:bg-[hsl(var(--vp-bg-soft))]"
              >
                ✕
              </button>
            </div>

            <div className="px-6 py-5 space-y-6">
              {loadingDetail ? (
                <div className="text-center py-8 text-[hsl(var(--vp-muted))]">
                  {String(t("salesPage.loading", "pos"))}
                </div>
              ) : (
                <>
                  {/* Invoice & Date Info */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-xs font-semibold text-[hsl(var(--vp-muted))] uppercase">
                        {String(t("salesPage.invoiceNumber", "pos"))}
                      </span>
                      <p className="text-sm font-bold text-[hsl(var(--vp-text))] mt-1">
                        {selectedSale.invoice?.invoiceNumber || "—"}
                      </p>
                    </div>
                    <div>
                      <span className="text-xs font-semibold text-[hsl(var(--vp-muted))] uppercase">
                        {String(t("salesPage.createdAt", "pos"))}
                      </span>
                      <p className="text-sm text-[hsl(var(--vp-text))] mt-1">
                        {formatDateTime(selectedSale.createdAt)}
                      </p>
                    </div>
                    <div>
                      <span className="text-xs font-semibold text-[hsl(var(--vp-muted))] uppercase">
                        {String(t("salesPage.paymentMethod", "pos"))}
                      </span>
                      <p className="text-sm text-[hsl(var(--vp-text))] mt-1">
                        {getPaymentMethodLabel(selectedSale.paymentMethod)}
                      </p>
                    </div>
                    <div>
                      <span className="text-xs font-semibold text-[hsl(var(--vp-muted))] uppercase">
                        {String(t("salesPage.paymentStatus", "pos"))}
                      </span>
                      <div className="mt-1">
                        {getStatusBadge(selectedSale.paymentStatus)}
                      </div>
                    </div>
                    {selectedSale.invoice?.channel && (
                      <div>
                        <span className="text-xs font-semibold text-[hsl(var(--vp-muted))] uppercase">
                          {String(t("salesPage.channel", "pos"))}
                        </span>
                        <p className="text-sm text-[hsl(var(--vp-text))] mt-1">
                          {selectedSale.invoice.channel}
                        </p>
                      </div>
                    )}
                    {(selectedSale.userId?.fullName ||
                      selectedSale.user?.fullName) && (
                      <div>
                        <span className="text-xs font-semibold text-[hsl(var(--vp-muted))] uppercase">
                          {String(t("salesPage.seller", "pos"))}
                        </span>
                        <p className="text-sm text-[hsl(var(--vp-text))] mt-1">
                          {selectedSale.userId?.fullName ||
                            selectedSale.user?.fullName}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* ARCA / Fiscal Info */}
                  {selectedSale.invoice?.channel === "ARCA" && (
                    <div className="bg-[hsl(var(--vp-bg-soft))] rounded-xl p-4 space-y-3">
                      <h3 className="text-sm font-bold text-[hsl(var(--vp-text))]">
                        📡 {String(t("salesPage.arcaStatus", "pos"))}
                      </h3>
                      <div className="flex items-center gap-3">
                        {getArcaStatusBadge(selectedSale.invoice)}
                      </div>
                      {selectedSale.invoice?.fiscalData?.cae && (
                        <div className="grid grid-cols-2 gap-3 mt-2">
                          <div>
                            <span className="text-xs text-[hsl(var(--vp-muted))]">
                              {String(t("salesPage.cae", "pos"))}
                            </span>
                            <p className="text-sm font-mono font-bold text-[hsl(var(--vp-text))]">
                              {selectedSale.invoice.fiscalData.cae}
                            </p>
                          </div>
                          <div>
                            <span className="text-xs text-[hsl(var(--vp-muted))]">
                              {String(t("salesPage.caeExpiry", "pos"))}
                            </span>
                            <p className="text-sm text-[hsl(var(--vp-text))]">
                              {selectedSale.invoice.fiscalData.caeVto ||
                                selectedSale.invoice.fiscalData.caeExpiry ||
                                "—"}
                            </p>
                          </div>
                        </div>
                      )}
                      {selectedSale.invoice?.arcaLastError && (
                        <div className="mt-3 rounded-lg border border-red-200 dark:border-red-800/50 bg-red-50/50 dark:bg-red-900/10 p-3">
                          <span className="text-xs font-semibold text-red-700 dark:text-red-400 uppercase">
                            ⚠️ {String(t("salesPage.arcaError", "pos"))}
                          </span>
                          <p className="text-sm text-red-600 dark:text-red-400 mt-1 break-words whitespace-pre-wrap">
                            {localizeArcaError(
                              selectedSale.invoice.arcaLastError,
                            )}
                          </p>
                        </div>
                      )}
                      {/* Retry button in modal */}
                      {(selectedSale.invoice?.status === "PENDING_CAE" ||
                        selectedSale.invoice?.arcaStatus === "REJECTED") &&
                        selectedSale.invoice?.status !== "CANCELLED" &&
                        selectedSale.invoice?.arcaStatus !== "CANCELLED" && (
                          <button
                            onClick={() =>
                              handleRetryInvoice(selectedSale.invoice._id)
                            }
                            disabled={retryingId === selectedSale.invoice._id}
                            className="w-full mt-2 px-4 py-2 rounded-lg text-sm font-semibold bg-amber-500 text-white hover:bg-amber-600 disabled:opacity-50 transition-colors"
                          >
                            {retryingId === selectedSale.invoice._id
                              ? `⏳ ${String(t("salesPage.retrying", "pos"))}`
                              : `🔄 ${String(t("salesPage.retryInvoice", "pos"))}`}
                          </button>
                        )}
                    </div>
                  )}

                  {/* Items Table */}
                  <div>
                    <h3 className="text-sm font-bold text-[hsl(var(--vp-text))] mb-3">
                      🛒 {String(t("salesPage.items", "pos"))}
                    </h3>
                    {selectedSale.items && selectedSale.items.length > 0 ? (
                      <div className="overflow-x-auto rounded-lg border border-[hsl(var(--vp-border))]">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="bg-[hsl(var(--vp-bg-soft))]">
                              <th className="text-left px-3 py-2 text-xs font-semibold text-[hsl(var(--vp-muted))]">
                                {String(t("salesPage.product", "pos"))}
                              </th>
                              <th className="text-center px-3 py-2 text-xs font-semibold text-[hsl(var(--vp-muted))]">
                                {String(t("salesPage.qty", "pos"))}
                              </th>
                              <th className="text-right px-3 py-2 text-xs font-semibold text-[hsl(var(--vp-muted))]">
                                {String(t("salesPage.unitPrice", "pos"))}
                              </th>
                              <th className="text-right px-3 py-2 text-xs font-semibold text-[hsl(var(--vp-muted))]">
                                {String(t("salesPage.itemDiscount", "pos"))}
                              </th>
                              <th className="text-right px-3 py-2 text-xs font-semibold text-[hsl(var(--vp-muted))]">
                                {String(t("salesPage.itemTotal", "pos"))}
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {selectedSale.items.map(
                              (item: any, idx: number) => (
                                <tr
                                  key={idx}
                                  className="border-t border-[hsl(var(--vp-border))]"
                                >
                                  <td className="px-3 py-2 text-[hsl(var(--vp-text))]">
                                    {item.productName ||
                                      item.productId?.name ||
                                      item.name ||
                                      `Item ${idx + 1}`}
                                  </td>
                                  <td className="px-3 py-2 text-center text-[hsl(var(--vp-muted))]">
                                    {toNum(item.quantity)}
                                  </td>
                                  <td className="px-3 py-2 text-right text-[hsl(var(--vp-muted))]">
                                    {formatCurrency(
                                      toNum(item.unitPrice) ||
                                        toNum(item.price) ||
                                        0,
                                    )}
                                  </td>
                                  <td className="px-3 py-2 text-right text-[hsl(var(--vp-muted))]">
                                    {toNum(item.discount)
                                      ? `${toNum(item.discount)}%`
                                      : "—"}
                                  </td>
                                  <td className="px-3 py-2 text-right font-semibold text-[hsl(var(--vp-text))]">
                                    {formatCurrency(
                                      toNum(item.totalPrice) ||
                                        toNum(item.quantity) *
                                          (toNum(item.unitPrice) ||
                                            toNum(item.price) ||
                                            0),
                                    )}
                                  </td>
                                </tr>
                              ),
                            )}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <p className="text-sm text-[hsl(var(--vp-muted))] italic">
                        {String(t("salesPage.noItems", "pos"))}
                      </p>
                    )}
                  </div>

                  {/* Totals */}
                  <div className="border-t border-[hsl(var(--vp-border))] pt-4 space-y-2">
                    {selectedSale.subtotal != null && (
                      <div className="flex justify-between text-sm">
                        <span className="text-[hsl(var(--vp-muted))]">
                          {String(t("salesPage.subtotal", "pos"))}
                        </span>
                        <span className="text-[hsl(var(--vp-text))]">
                          {formatCurrency(selectedSale.subtotal)}
                        </span>
                      </div>
                    )}
                    {selectedSale.tax != null &&
                      toNum(selectedSale.tax) > 0 && (
                        <div className="flex justify-between text-sm">
                          <span className="text-[hsl(var(--vp-muted))]">
                            {String(t("salesPage.tax", "pos"))}
                          </span>
                          <span className="text-[hsl(var(--vp-text))]">
                            {formatCurrency(selectedSale.tax)}
                          </span>
                        </div>
                      )}
                    {selectedSale.discount != null &&
                      toNum(selectedSale.discount) > 0 && (
                        <div className="flex justify-between text-sm">
                          <span className="text-[hsl(var(--vp-muted))]">
                            {String(t("salesPage.discount", "pos"))}
                          </span>
                          <span className="text-red-600">
                            -{formatCurrency(selectedSale.discount)}
                          </span>
                        </div>
                      )}
                    <div className="flex justify-between text-base font-bold border-t border-[hsl(var(--vp-border))] pt-2">
                      <span className="text-[hsl(var(--vp-text))]">
                        {String(t("salesPage.total", "pos"))}
                      </span>
                      <span className="text-[hsl(var(--vp-primary))]">
                        {formatCurrency(selectedSale.totalWithTax)}
                      </span>
                    </div>
                  </div>

                  {/* Notes */}
                  {selectedSale.notes && (
                    <div>
                      <span className="text-xs font-semibold text-[hsl(var(--vp-muted))] uppercase">
                        {String(t("salesPage.notes", "pos"))}
                      </span>
                      <p className="text-sm text-[hsl(var(--vp-text))] mt-1 bg-[hsl(var(--vp-bg-soft))] rounded-lg p-3">
                        {selectedSale.notes}
                      </p>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Modal Footer */}
            <div className="sticky bottom-0 bg-[hsl(var(--vp-bg))] border-t border-[hsl(var(--vp-border))] px-6 py-4 flex justify-between items-center rounded-b-2xl">
              <button
                onClick={async () => {
                  try {
                    const res = await apiFetch(
                      `/api/sales/receipt?saleId=${selectedSale._id}&format=html&lang=${currentLanguage}`,
                    );
                    if (!res.ok) {
                      // Parse the error response to show the right localized message
                      try {
                        const errData = await res.json();
                        const status = errData.fiscalStatus;
                        if (status) {
                          const key = `salesPage.receiptBlocked_${status}`;
                          const localized = String(t(key, "pos"));
                          // If key resolves, show it; otherwise fall back to generic
                          if (!localized.includes(`receiptBlocked_${status}`)) {
                            toast.warning(localized);
                          } else {
                            toast.error(
                              errData.error ||
                                String(
                                  t("salesPage.receiptUnavailable", "pos"),
                                ),
                            );
                          }
                        } else {
                          toast.error(
                            errData.error ||
                              String(t("salesPage.receiptUnavailable", "pos")),
                          );
                        }
                      } catch {
                        toast.error(
                          String(t("salesPage.receiptUnavailable", "pos")),
                        );
                      }
                      return;
                    }
                    const html = await res.text();
                    const w = window.open("", "_blank");
                    if (w) {
                      w.document.write(html);
                      w.document.close();
                    }
                  } catch {
                    toast.error(String(t("salesPage.connectionError", "pos")));
                  }
                }}
                className="text-sm text-[hsl(var(--vp-primary))] hover:text-[hsl(var(--vp-primary-strong))] font-semibold"
              >
                🖨️ {String(t("salesPage.receipt", "pos"))}
              </button>
              <button
                onClick={() => setSelectedSale(null)}
                className="vp-button px-6 py-2 text-sm"
              >
                {String(t("salesPage.close", "pos"))}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

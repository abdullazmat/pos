"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useGlobalLanguage } from "@/lib/hooks/useGlobalLanguage";
import Header from "@/components/layout/Header";
import { toast } from "react-toastify";
import { apiFetch } from "@/lib/utils/apiFetch";
import {
  Package,
  Plus,
  Send,
  CheckCircle,
  XCircle,
  Truck,
  Brain,
  AlertTriangle,
  ArrowLeft,
  Search,
  Filter,
  ChevronDown,
  Sparkles,
  TrendingUp,
  ShoppingCart,
  ClipboardCheck,
  X,
  Clock,
  DollarSign,
  BarChart3,
} from "lucide-react";

interface OrderItem {
  productId: string;
  productName: string;
  productCode: string;
  requestedQuantity: number;
  receivedQuantity: number;
  estimatedCost: number;
  finalCost: number;
  subtotal: number;
  suggestionReason?: string;
}

interface PurchaseOrder {
  _id: string;
  orderNumber: string;
  supplierId: { _id: string; name: string; phone?: string; email?: string } | string;
  date: string;
  estimatedDeliveryDate?: string;
  status: string;
  items: OrderItem[];
  estimatedTotal: number;
  finalTotal: number;
  notes?: string;
  warehouse?: string;
}

interface Suggestion {
  productId: string;
  productName: string;
  productCode: string;
  currentStock: number;
  suggestedQuantity: number;
  estimatedCost: number;
  subtotal: number;
  priority: string;
  reason: string;
  reasonParts?: Array<{ key: string; params?: Record<string, any> }>;
  daysUntilStockout: number;
  avgDailySales14: number;
  trendMultiplier: number;
  purchaseMultiple: number;
  purchasePresentation: string;
}

interface Supplier {
  _id: string;
  name: string;
  phone?: string;
  email?: string;
}

interface Product {
  _id: string;
  name: string;
  code: string;
  stock: number;
  cost: number;
  price: number;
}

type ViewMode = "list" | "create" | "detail" | "receive";

const STATUS_CONFIG: Record<string, { color: string; bg: string; icon: React.ElementType; labelKey: string }> = {
  DRAFT: { color: "text-[hsl(var(--vp-muted))]", bg: "bg-[hsl(var(--vp-bg-soft))]", icon: Clock, labelKey: "stats.draft" },
  SENT: { color: "text-blue-600 dark:text-blue-400", bg: "bg-blue-50 dark:bg-blue-900/20", icon: Send, labelKey: "stats.sent" },
  PARTIAL: { color: "text-amber-600 dark:text-amber-400", bg: "bg-amber-50 dark:bg-amber-900/20", icon: Package, labelKey: "stats.partial" },
  RECEIVED: { color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-50 dark:bg-emerald-900/20", icon: CheckCircle, labelKey: "stats.received" },
  CANCELLED: { color: "text-rose-600 dark:text-rose-400", bg: "bg-rose-50 dark:bg-rose-900/20", icon: XCircle, labelKey: "stats.cancelled" },
};

const PRIORITY_CONFIG: Record<string, { color: string; bg: string; labelKey: string }> = {
  critical: { color: "text-rose-700 dark:text-rose-300", bg: "bg-rose-100 dark:bg-rose-900/30", labelKey: "priorities.critical" },
  high: { color: "text-amber-700 dark:text-amber-300", bg: "bg-amber-100 dark:bg-amber-900/30", labelKey: "priorities.high" },
  medium: { color: "text-blue-700 dark:text-blue-300", bg: "bg-blue-100 dark:bg-blue-900/30", labelKey: "priorities.medium" },
  low: { color: "text-emerald-700 dark:text-emerald-300", bg: "bg-emerald-100 dark:bg-emerald-900/30", labelKey: "priorities.low" },
};

export default function PurchaseOrdersPage() {
  const router = useRouter();
  const { t } = useGlobalLanguage();
  const [user, setUser] = useState<{ id?: string; fullName?: string; email?: string; role?: string } | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [orders, setOrders] = useState<PurchaseOrder[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [suggestionsLoading, setSuggestionsLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<PurchaseOrder | null>(null);

  // Create form state
  const [selectedSupplierId, setSelectedSupplierId] = useState("");
  const [estimatedDeliveryDate, setEstimatedDeliveryDate] = useState("");
  const [orderNotes, setOrderNotes] = useState("");
  const [orderWarehouse, setOrderWarehouse] = useState("");
  const [orderItems, setOrderItems] = useState<Array<{
    productId: string; productName: string; productCode: string;
    quantity: number; cost: number; reason?: string;
  }>>([]);
  const [coverageDays, setCoverageDays] = useState(14);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [supplierLinks, setSupplierLinks] = useState<any[]>([]);
  const [shouldAutoLink, setShouldAutoLink] = useState(true);

  // Reception state
  const [receivedItems, setReceivedItems] = useState<Array<{
    productId: string; quantity: number; finalCost: number;
  }>>([]);

  // Manual add product state
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [manualProductId, setManualProductId] = useState("");
  const [manualQuantity, setManualQuantity] = useState(1);
  const [manualCost, setManualCost] = useState(0);

  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (!userStr) { router.push("/auth/login"); return; }
    setUser(JSON.parse(userStr));
    loadData();
  }, [router]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [ordersRes, suppliersRes, productsRes] = await Promise.all([
        apiFetch("/api/purchase-orders"),
        apiFetch("/api/suppliers"),
        apiFetch("/api/products"),
      ]);
      const [ordersData, suppliersData, productsData] = await Promise.all([
        ordersRes.json(), suppliersRes.json(), productsRes.json(),
      ]);
      setOrders(ordersData.data?.orders || []);
      setSuppliers(suppliersData.suppliers || []);
      setProducts(productsData.data?.products || []);
    } catch (e) {
      console.error("Load data error:", e);
      toast.error(t("toasts.error", "purchaseOrders"));
    }
    finally { setLoading(false); }
  };

  const loadSuggestions = useCallback(async () => {
    if (!selectedSupplierId) return;
    setSuggestionsLoading(true);
    try {
      const [suggestionsRes, linksRes] = await Promise.all([
        apiFetch(`/api/purchase-orders/suggestions?supplierId=${selectedSupplierId}&coverageDays=${coverageDays}`),
        apiFetch(`/api/product-suppliers?supplierId=${selectedSupplierId}`),
      ]);
      const [suggestionsData, linksData] = await Promise.all([
        suggestionsRes.json(), linksRes.json()
      ]);
      setSuggestions(suggestionsData.data?.suggestions || []);
      setSupplierLinks(linksData.data?.links || []);
      setShowSuggestions(true);
    } catch (e) { console.error("Suggestions error:", e); }
    finally { setSuggestionsLoading(false); }
  }, [selectedSupplierId, coverageDays]);

  useEffect(() => {
    if (selectedSupplierId && viewMode === "create") {
      loadSuggestions();
    } else {
      setSuggestions([]);
      setSupplierLinks([]);
      setShowSuggestions(false);
    }
  }, [selectedSupplierId, viewMode, loadSuggestions]);

  const addSuggestionToOrder = (s: Suggestion) => {
    if (orderItems.find(i => i.productId === s.productId)) {
      toast.warning(t("toasts.alreadyAdded", "purchaseOrders"));
      return;
    }
    const reasonString = s.reasonParts?.map(part => 
      t(part.key, "purchaseOrders", { ...part.params, unit: t("create.unitAbr", "purchaseOrders") })
    ).join(" | ") || s.reason;

    setOrderItems(prev => [...prev, {
      productId: s.productId, productName: s.productName, productCode: s.productCode,
      quantity: s.suggestedQuantity, cost: s.estimatedCost, reason: reasonString,
    }]);
    toast.success(t("toasts.added", "purchaseOrders", { name: s.productName }));
  };

  const addAllSuggestions = () => {
    let added = 0;
    const newItems = [...orderItems];
    for (const s of suggestions) {
      if (!newItems.find(i => i.productId === s.productId)) {
        const reasonString = s.reasonParts?.map(part => 
          t(part.key, "purchaseOrders", { ...part.params, unit: t("create.unitAbr", "purchaseOrders") })
        ).join(" | ") || s.reason;

        newItems.push({
          productId: s.productId, productName: s.productName, productCode: s.productCode,
          quantity: s.suggestedQuantity, cost: s.estimatedCost, reason: reasonString,
        });
        added++;
      }
    }
    setOrderItems(newItems);
    toast.success(t("toasts.addedMany", "purchaseOrders", { count: added }));
  };

  const addManualProduct = async () => {
    const product = products.find(p => p._id === manualProductId);
    if (!product) return;
    if (orderItems.find(i => i.productId === manualProductId)) {
      toast.warning(t("toasts.alreadyAdded", "purchaseOrders")); return;
    }

    const isLinked = supplierLinks.some(l => String(l.productId._id) === manualProductId || String(l.productId) === manualProductId);

    if (!isLinked && shouldAutoLink) {
      try {
        await apiFetch("/api/product-suppliers", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            supplierId: selectedSupplierId,
            productId: manualProductId,
            lastCost: manualCost,
          }),
        });
        toast.success(t("toasts.linked", "purchaseOrders"));
        // Refresh links
        const linksRes = await apiFetch(`/api/product-suppliers?supplierId=${selectedSupplierId}`);
        const linksData = await linksRes.json();
        setSupplierLinks(linksData.data?.links || []);
      } catch (e) { console.error("Auto-link error:", e); }
    }

    setOrderItems(prev => [...prev, {
      productId: product._id, productName: product.name, productCode: product.code,
      quantity: manualQuantity, cost: manualCost || product.cost,
    }]);
    setShowAddProduct(false);
    setManualProductId(""); setManualQuantity(1); setManualCost(0);
  };

  const removeItem = (productId: string) => {
    setOrderItems(prev => prev.filter(i => i.productId !== productId));
  };

  const createOrder = async () => {
    if (!selectedSupplierId || orderItems.length === 0 || actionLoading) {
      if (!actionLoading) toast.error(t("toasts.error", "purchaseOrders"));
      return;
    }
    setActionLoading(true);
    try {
      const res = await apiFetch("/api/purchase-orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          supplierId: selectedSupplierId,
          estimatedDeliveryDate: estimatedDeliveryDate || undefined,
          notes: orderNotes || undefined,
          warehouse: orderWarehouse || undefined,
          items: orderItems.map(i => ({
            productId: i.productId, requestedQuantity: i.quantity,
            estimatedCost: i.cost, suggestionReason: i.reason,
          })),
        }),
      });
      if (res.ok) {
        toast.success(t("toasts.created", "purchaseOrders"));
        resetCreateForm();
        setViewMode("list");
        loadData();
      } else {
        const err = await res.json();
        const errMsg = err.error && err.error.startsWith("errors.") 
          ? t(err.error.replace("errors.", ""), "errors") 
          : err.error || t("toasts.error", "purchaseOrders");
        toast.error(errMsg);
      }
    } catch (e) { 
      toast.error(t("toasts.error", "purchaseOrders")); 
    } finally {
      setActionLoading(false);
    }
  };

  const [actionLoading, setActionLoading] = useState(false);

  const updateOrderStatus = async (orderId: string, action: string, extra?: Record<string, unknown>) => {
    setActionLoading(true);
    try {
      const res = await apiFetch("/api/purchase-orders", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: orderId, action, ...extra }),
      });
      if (res.ok) {
        toast.success(
          action === "send"
            ? t("toasts.sent", "purchaseOrders")
            : action === "cancel"
            ? t("toasts.cancelled", "purchaseOrders")
            : action === "receive"
            ? t("toasts.received", "purchaseOrders")
            : t("toasts.created", "purchaseOrders")
        );
        loadData();
        const data = await res.json();
        const updatedOrder = data.data?.order || null;
        if (selectedOrder?._id === orderId) {
          setSelectedOrder(updatedOrder);
        }
        return { success: true, order: updatedOrder };
      } else {
        const err = await res.json();
        const errMsg = err.error && err.error.startsWith("errors.") 
          ? t(err.error.replace("errors.", ""), "errors") 
          : err.error || t("toasts.error", "purchaseOrders");
        toast.error(errMsg);
        return { success: false, error: errMsg };
      }
    } catch (e) { 
      toast.error(t("toasts.error", "purchaseOrders"));
      return { success: false };
    } finally {
      setActionLoading(false);
    }
  };

  const receiveOrder = async () => {
    if (!selectedOrder || receivedItems.length === 0 || actionLoading) return;
    const result = await updateOrderStatus(selectedOrder._id, "receive", { receivedItems });
    if (result.success) {
      setViewMode("detail");
    }
  };

  const resetCreateForm = () => {
    setSelectedSupplierId(""); setEstimatedDeliveryDate(""); setOrderNotes("");
    setOrderWarehouse(""); setOrderItems([]); setSuggestions([]); setShowSuggestions(false);
  };

  const estimatedTotal = orderItems.reduce((s, i) => s + i.quantity * i.cost, 0);

  const filteredOrders = orders.filter(o => {
    if (statusFilter && o.status !== statusFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const supplierName = typeof o.supplierId === "object" ? o.supplierId.name : "";
      return o.orderNumber.toLowerCase().includes(q) || supplierName.toLowerCase().includes(q);
    }
    return true;
  });

  const stats = {
    total: orders.length,
    draft: orders.filter(o => o.status === "DRAFT").length,
    sent: orders.filter(o => o.status === "SENT").length,
    partial: orders.filter(o => o.status === "PARTIAL").length,
    received: orders.filter(o => o.status === "RECEIVED").length,
  };

  if (loading) {
    return (
      <div className="vp-page flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-3 border-[hsl(var(--vp-primary))] border-t-transparent rounded-full animate-spin" />
          <p className="text-[hsl(var(--vp-muted))] text-sm font-medium">{t("ui.loading", "pos")}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="vp-page">
      <Header user={user} showBackButton={true} />
      <main className="vp-page-inner">
        {/* ─── LIST VIEW ─── */}
        {viewMode === "list" && (
          <div className="space-y-6 vp-fade-in">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-[hsl(var(--vp-text))]">
                  <ShoppingCart className="inline w-7 h-7 mr-2 text-[hsl(var(--vp-primary))]" />
                  {t("title", "purchaseOrders")}
                </h1>
                <p className="text-sm text-[hsl(var(--vp-muted))] mt-1">
                  {t("subtitle", "purchaseOrders")}
                </p>
              </div>
              <button onClick={() => { resetCreateForm(); setViewMode("create"); }}
                className="vp-button vp-button-primary vp-press gap-2">
                <Plus className="w-5 h-5" /> {t("newOrder", "purchaseOrders")}
              </button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              {[
                { label: t("stats.total", "purchaseOrders"), value: stats.total, icon: ClipboardCheck, color: "var(--vp-primary)" },
                { label: t("stats.draft", "purchaseOrders"), value: stats.draft, icon: Clock, color: "var(--vp-muted)" },
                { label: t("stats.sent", "purchaseOrders"), value: stats.sent, icon: Send, color: "201 96% 56%" },
                { label: t("stats.partial", "purchaseOrders"), value: stats.partial, icon: Package, color: "var(--vp-warning)" },
                { label: t("stats.received", "purchaseOrders"), value: stats.received, icon: CheckCircle, color: "var(--vp-success)" },
              ].map(stat => (
                <div key={stat.label} className="vp-card p-4 flex items-center gap-3">
                  <div className="p-2.5 rounded-xl" style={{ background: `hsl(${stat.color} / 0.12)` }}>
                    <stat.icon className="w-5 h-5" style={{ color: `hsl(${stat.color})` }} />
                  </div>
                  <div>
                    <p className="text-xl font-bold text-[hsl(var(--vp-text))]">{stat.value}</p>
                    <p className="text-xs text-[hsl(var(--vp-muted))]">{stat.label}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Filters */}
            <div className="vp-card p-4 flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[hsl(var(--vp-muted))]" />
                <input className="vp-input pl-10" placeholder={t("filters.searchPlaceholder", "purchaseOrders")}
                  value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
              </div>
              <select className="vp-input w-full sm:w-48" value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}>
                <option value="">{t("filters.allStatuses", "purchaseOrders")}</option>
                {Object.entries(STATUS_CONFIG).map(([k, v]) => (
                  <option key={k} value={k}>{t(v.labelKey, "purchaseOrders")}</option>
                ))}
              </select>
            </div>

            {/* Orders Table */}
            <div className="vp-card overflow-hidden">
              {filteredOrders.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="vp-table">
                    <thead>
                      <tr>
                        <th>{t("table.number", "purchaseOrders")}</th><th>{t("table.supplier", "purchaseOrders")}</th><th>{t("table.date", "purchaseOrders")}</th>
                        <th>{t("table.status", "purchaseOrders")}</th><th>{t("table.items", "purchaseOrders")}</th><th className="text-right">{t("table.totalEst", "purchaseOrders")}</th>
                        <th className="text-right">{t("table.actions", "purchaseOrders")}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredOrders.map(order => {
                        const sc = STATUS_CONFIG[order.status] || STATUS_CONFIG.DRAFT;
                        const StatusIcon = sc.icon;
                        const supplier = typeof order.supplierId === "object" ? order.supplierId : null;
                        return (
                          <tr key={order._id} className="cursor-pointer"
                            onClick={() => { setSelectedOrder(order); setViewMode("detail"); }}>
                            <td className="font-mono font-semibold text-[hsl(var(--vp-primary))]">
                              {order.orderNumber}
                            </td>
                            <td>{supplier?.name || "—"}</td>
                            <td className="text-[hsl(var(--vp-muted))]">
                              {new Date(order.date).toLocaleDateString()}
                            </td>
                            <td>
                              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${sc.color} ${sc.bg}`}>
                                <StatusIcon className="w-3.5 h-3.5" /> {t(sc.labelKey, "purchaseOrders")}
                              </span>
                            </td>
                            <td>{order.items.length}</td>
                            <td className="text-right font-semibold">
                              ${order.estimatedTotal.toFixed(2)}
                            </td>
                            <td className="text-right" onClick={e => e.stopPropagation()}>
                              {order.status === "DRAFT" && (
                                <button className="vp-button vp-button-sm vp-button-primary vp-press gap-1.5"
                                  disabled={actionLoading}
                                  onClick={() => updateOrderStatus(order._id, "send")}>
                                  {actionLoading ? <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white" /> : <Send className="w-3.5 h-3.5" />}
                                  {t("table.send", "purchaseOrders")}
                                </button>
                              )}
                              {(order.status === "SENT" || order.status === "PARTIAL") && (
                                <button className="vp-button vp-button-sm vp-press gap-1.5"
                                  disabled={actionLoading}
                                  style={{ borderColor: "hsl(var(--vp-success))", color: "hsl(var(--vp-success))" }}
                                  onClick={() => {
                                    setSelectedOrder(order);
                                    setReceivedItems(order.items.map(i => ({
                                      productId: i.productId, quantity: 0, finalCost: i.estimatedCost,
                                    })));
                                    setViewMode("receive");
                                  }}>
                                  <Truck className="w-3.5 h-3.5" /> {t("table.receive", "purchaseOrders")}
                                </button>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="vp-empty-state m-6">
                  <ShoppingCart className="w-12 h-12 mx-auto mb-3 vp-empty-icon" />
                  <p className="font-semibold text-[hsl(var(--vp-text))]">{t("table.noOrders", "purchaseOrders")}</p>
                  <p className="text-sm mt-1">{t("table.noOrdersSubtitle", "purchaseOrders")}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ─── CREATE VIEW ─── */}
        {viewMode === "create" && (
          <div className="space-y-6 vp-fade-in">
            <div className="flex items-center gap-3">
              <button onClick={() => { resetCreateForm(); setViewMode("list"); }}
                className="vp-button vp-button-ghost vp-press p-2">
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-[hsl(var(--vp-text))]">{t("create.title", "purchaseOrders")}</h1>
                <p className="text-sm text-[hsl(var(--vp-muted))]">
                  {t("create.subtitle", "purchaseOrders")}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left: Form */}
              <div className="lg:col-span-2 space-y-5">
                <div className="vp-card p-5 space-y-4">
                  <h2 className="font-semibold text-[hsl(var(--vp-text))]">{t("create.generalInfo", "purchaseOrders")}</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="vp-label">{t("create.supplier", "purchaseOrders")}</label>
                      <select className="vp-input" value={selectedSupplierId}
                        onChange={e => { setSelectedSupplierId(e.target.value); setSuggestions([]); }}>
                        <option value="">{t("create.selectSupplier", "purchaseOrders")}</option>
                        {suppliers.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="vp-label">{t("create.deliveryDate", "purchaseOrders")}</label>
                      <input type="date" className="vp-input" value={estimatedDeliveryDate}
                        onChange={e => setEstimatedDeliveryDate(e.target.value)} />
                    </div>
                    <div>
                      <label className="vp-label">{t("create.warehouse", "purchaseOrders")}</label>
                      <input className="vp-input" placeholder={t("create.warehousePlaceholder", "purchaseOrders")} value={orderWarehouse}
                        onChange={e => setOrderWarehouse(e.target.value)} />
                    </div>
                    <div>
                      <label className="vp-label">{t("create.notes", "purchaseOrders")}</label>
                      <input className="vp-input" placeholder={t("create.notesPlaceholder", "purchaseOrders")} value={orderNotes}
                        onChange={e => setOrderNotes(e.target.value)} />
                    </div>
                  </div>
                </div>

                {/* AI Suggestions */}
                {selectedSupplierId && (
                  <div className="vp-card p-5 border-[hsl(var(--vp-primary)/0.3)]"
                    style={{ background: "linear-gradient(135deg, hsl(var(--vp-bg-card)), hsl(var(--vp-primary) / 0.04))" }}>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Brain className="w-5 h-5 text-[hsl(var(--vp-primary))]" />
                        <h3 className="font-semibold text-[hsl(var(--vp-text))]">{t("create.aiSuggestions", "purchaseOrders")}</h3>
                        <span className="vp-pill text-xs">{t("create.aiPill", "purchaseOrders")}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <label className="text-xs text-[hsl(var(--vp-muted))]">{t("create.coverage", "purchaseOrders")}</label>
                        <select className="vp-input text-xs !min-h-[32px] !py-1 w-20" value={coverageDays}
                          onChange={e => setCoverageDays(Number(e.target.value))}>
                          <option value={7}>{t("create.days", "purchaseOrders", { count: 7 })}</option>
                          <option value={14}>{t("create.days", "purchaseOrders", { count: 14 })}</option>
                          <option value={21}>{t("create.days", "purchaseOrders", { count: 21 })}</option>
                          <option value={30}>{t("create.days", "purchaseOrders", { count: 30 })}</option>
                        </select>
                        <button className="vp-button vp-button-primary vp-button-sm vp-press"
                          onClick={loadSuggestions} disabled={suggestionsLoading}>
                          <Sparkles className="w-4 h-4" />
                          {suggestionsLoading ? t("create.analyzing", "purchaseOrders") : t("create.generate", "purchaseOrders")}
                        </button>
                      </div>
                    </div>

                    {suggestionsLoading ? (
                      <div className="flex flex-col items-center justify-center p-8 bg-[hsl(var(--vp-bg-soft))] rounded-xl border border-dashed border-[hsl(var(--vp-border))]">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[hsl(var(--vp-primary))] mb-3"></div>
                        <p className="text-sm text-[hsl(var(--vp-muted))]">{t("create.analyzing", "purchaseOrders")}</p>
                      </div>
                    ) : suggestions.length > 0 ? (
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <p className="text-xs text-[hsl(var(--vp-muted))]">
                            {t("create.suggestedProducts", "purchaseOrders", { count: suggestions.length })}
                          </p>
                          <button className="text-xs font-semibold text-[hsl(var(--vp-primary))] hover:underline"
                            onClick={addAllSuggestions}>
                            {t("create.addAll", "purchaseOrders")}
                          </button>
                        </div>
                        <div className="max-h-64 overflow-y-auto space-y-2">
                          {suggestions.map(s => {
                            const pc = PRIORITY_CONFIG[s.priority] || PRIORITY_CONFIG.low;
                            const alreadyAdded = orderItems.some(i => i.productId === s.productId);
                            return (
                              <div key={s.productId}
                                className={`flex items-center justify-between p-3 rounded-xl border border-[hsl(var(--vp-border-soft))] bg-[hsl(var(--vp-bg-card))] ${alreadyAdded ? "opacity-50" : ""}`}>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2">
                                    <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${pc.color} ${pc.bg}`}>
                                      {t(pc.labelKey, "purchaseOrders")}
                                    </span>
                                    <span className="font-semibold text-sm text-[hsl(var(--vp-text))] truncate">
                                      {s.productName}
                                    </span>
                                  </div>
                                  <p className="text-xs text-[hsl(var(--vp-muted))] mt-0.5 truncate">
                                    {s.reasonParts?.map((part, pIdx) => (
                                      <span key={pIdx}>
                                        {t(part.key, "purchaseOrders", { ...part.params, unit: t("create.unitAbr", "purchaseOrders") })}
                                        {pIdx < s.reasonParts!.length - 1 ? " | " : ""}
                                      </span>
                                    )) || s.reason}
                                  </p>
                                </div>
                                <div className="flex items-center gap-3 ml-3 shrink-0">
                                  <div className="text-right">
                                    <p className="text-sm font-semibold">{s.suggestedQuantity} {t("create.unitAbr", "purchaseOrders")}</p>
                                    <p className="text-xs text-[hsl(var(--vp-muted))]">${s.subtotal.toFixed(2)}</p>
                                  </div>
                                  <button className="vp-button vp-button-sm vp-button-primary vp-press"
                                    onClick={() => addSuggestionToOrder(s)} disabled={alreadyAdded}>
                                    <Plus className="w-4 h-4" />
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ) : showSuggestions && (
                      <div className="p-6 text-center bg-[hsl(var(--vp-bg-soft))] rounded-xl border border-[hsl(var(--vp-border-soft))]">
                        <p className="text-sm text-[hsl(var(--vp-muted))] mb-1">
                          {t("create.noSuggestions", "purchaseOrders") || "No suggestions found for this supplier."}
                        </p>
                        <p className="text-xs text-[hsl(var(--vp-muted))] opacity-75">
                          {t("create.noSuggestionsSubtitle", "purchaseOrders") || "Linking products to this supplier or recording more sales will help the AI."}
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* Order Items */}
                <div className="vp-card p-5">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="font-semibold text-[hsl(var(--vp-text))]">
                      {t("table.items", "purchaseOrders")} ({orderItems.length})
                    </h2>
                    <button className="vp-button vp-button-sm vp-press"
                      onClick={() => setShowAddProduct(true)}>
                      <Plus className="w-4 h-4" /> {t("create.manualAdd", "purchaseOrders")}
                    </button>
                  </div>

                  {showAddProduct && (
                    <div className="p-4 mb-4 rounded-xl border border-[hsl(var(--vp-border))] bg-[hsl(var(--vp-bg-soft))]">
                      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                        <select className="vp-input sm:col-span-2" value={manualProductId}
                          onChange={e => { setManualProductId(e.target.value);
                            const p = products.find(pr => pr._id === e.target.value);
                            if (p) setManualCost(p.cost); }}>
                          <option value="">{t("create.selectProduct", "purchaseOrders")}</option>
                          {products.map(p => <option key={p._id} value={p._id}>{p.name} ({p.code})</option>)}
                        </select>
                        <input type="number" className="vp-input" placeholder={t("create.quantity", "purchaseOrders")} min={1}
                          value={manualQuantity} onChange={e => setManualQuantity(Number(e.target.value))} />
                        <input type="number" className="vp-input" placeholder={t("create.cost", "purchaseOrders")} step="0.01" min={0}
                          value={manualCost} onChange={e => setManualCost(Number(e.target.value))} />
                      </div>

                      {manualProductId && !supplierLinks.some(l => String(l.productId._id) === manualProductId || String(l.productId) === manualProductId) && (
                        <div className="mt-3 p-3 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/50">
                          <p className="text-xs text-amber-700 dark:text-amber-400 mb-2 flex items-center gap-2">
                            <AlertTriangle className="w-3.5 h-3.5" />
                            {t("create.unlinkedWarning", "purchaseOrders")}
                          </p>
                          <label className="flex items-center gap-2 cursor-pointer group">
                            <input type="checkbox" className="vp-checkbox" checked={shouldAutoLink}
                              onChange={e => setShouldAutoLink(e.target.checked)} />
                            <span className="text-xs text-[hsl(var(--vp-text))] group-hover:text-[hsl(var(--vp-primary))] transition-colors">
                              {t("create.autoLinkCheckbox", "purchaseOrders")}
                            </span>
                          </label>
                        </div>
                      )}

                      <div className="flex justify-end gap-2 mt-3">
                        <button className="vp-button vp-button-sm" onClick={() => setShowAddProduct(false)}>{t("cancel", "common")}</button>
                        <button className="vp-button vp-button-sm vp-button-primary vp-press"
                          onClick={addManualProduct} disabled={!manualProductId}>{t("create.add", "purchaseOrders")}</button>
                      </div>
                    </div>
                  )}

                  {orderItems.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="vp-table">
                        <thead><tr>
                          <th>{t("create.selectProduct", "purchaseOrders")}</th><th>{t("table.code", "purchaseOrders")}</th><th className="text-right">{t("create.quantity", "purchaseOrders")}</th>
                          <th className="text-right">{t("create.cost", "purchaseOrders")}</th><th className="text-right">{t("detail.subtotal", "purchaseOrders")}</th><th></th>
                        </tr></thead>
                        <tbody>
                          {orderItems.map((item, idx) => (
                            <tr key={item.productId}>
                              <td>
                                <span className="font-medium">{item.productName}</span>
                                {item.reason && <p className="text-xs text-[hsl(var(--vp-muted))] mt-0.5 truncate max-w-[200px]">{item.reason}</p>}
                              </td>
                              <td className="font-mono text-sm">{item.productCode}</td>
                              <td className="text-right">
                                <input type="number" className="vp-input !min-h-[32px] !py-1 w-20 text-right"
                                  value={item.quantity} min={1}
                                  onChange={e => { const newItems = [...orderItems]; newItems[idx].quantity = Number(e.target.value); setOrderItems(newItems); }} />
                              </td>
                              <td className="text-right">
                                <input type="number" className="vp-input !min-h-[32px] !py-1 w-24 text-right"
                                  value={item.cost} step="0.01" min={0}
                                  onChange={e => { const newItems = [...orderItems]; newItems[idx].cost = Number(e.target.value); setOrderItems(newItems); }} />
                              </td>
                              <td className="text-right font-semibold">${(item.quantity * item.cost).toFixed(2)}</td>
                              <td><button className="text-rose-500 hover:text-rose-700 p-1" onClick={() => removeItem(item.productId)}><X className="w-4 h-4" /></button></td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="vp-empty-state">
                      <Package className="w-10 h-10 mx-auto mb-2 vp-empty-icon" />
                      <p className="text-sm">{t("create.subtitle", "purchaseOrders")}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Right: Summary */}
              <div className="space-y-4">
                <div className="vp-card p-5 sticky top-32">
                  <h3 className="font-semibold text-[hsl(var(--vp-text))] mb-4">{t("create.summary", "purchaseOrders")}</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-[hsl(var(--vp-muted))]">{t("table.items", "purchaseOrders")}</span>
                      <span className="font-semibold">{orderItems.length}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-[hsl(var(--vp-muted))]">{t("create.totalUnits", "purchaseOrders")}</span>
                      <span className="font-semibold">{orderItems.reduce((s, i) => s + i.quantity, 0)}</span>
                    </div>
                    <hr className="border-[hsl(var(--vp-border))]" />
                    <div className="flex justify-between">
                      <span className="font-semibold text-[hsl(var(--vp-text))]">{t("create.totalEstimated", "purchaseOrders")}</span>
                      <span className="text-xl font-bold text-[hsl(var(--vp-primary))]">
                        ${estimatedTotal.toFixed(2)}
                      </span>
                    </div>
                  </div>
                  <button className="vp-button vp-button-primary vp-press w-full py-3 text-lg flex items-center justify-center gap-3 mt-5"
                  onClick={createOrder} disabled={actionLoading || orderItems.length === 0 || !selectedSupplierId}>
                  {actionLoading ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  ) : (
                    <ClipboardCheck className="w-5 h-5" />
                  )}
                  {t("create.createButton", "purchaseOrders")}
                </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ─── DETAIL VIEW ─── */}
        {viewMode === "detail" && selectedOrder && (() => {
          const sc = STATUS_CONFIG[selectedOrder.status] || STATUS_CONFIG.DRAFT;
          const StatusIcon = sc.icon;
          const supplier = typeof selectedOrder.supplierId === "object" ? selectedOrder.supplierId : null;
          return (
            <div className="space-y-6 vp-fade-in">
              <div className="flex items-center gap-3">
                <button onClick={() => { setSelectedOrder(null); setViewMode("list"); }}
                  className="vp-button vp-button-ghost vp-press p-2">
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <div className="flex-1">
                  <h1 className="text-2xl font-bold text-[hsl(var(--vp-text))] font-mono">
                    {selectedOrder.orderNumber}
                  </h1>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${sc.color} ${sc.bg}`}>
                      <StatusIcon className="w-3.5 h-3.5" /> {t(sc.labelKey, "purchaseOrders")}
                    </span>
                    <span className="text-sm text-[hsl(var(--vp-muted))]">
                      {supplier?.name} • {new Date(selectedOrder.date).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <div className="flex gap-2">
                  {selectedOrder.status === "DRAFT" && (
                    <>
                      <button className="vp-button vp-button-primary vp-button-sm vp-press gap-1.5"
                        disabled={actionLoading}
                        onClick={() => updateOrderStatus(selectedOrder._id, "send")}>
                        {actionLoading ? <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white" /> : <Send className="w-4 h-4" />}
                        {t("table.send", "purchaseOrders")}
                      </button>
                      <button className="vp-button vp-button-sm vp-press text-rose-600 border-rose-300 gap-1.5"
                        disabled={actionLoading}
                        onClick={() => {
                          if (confirm(t("messages.confirmAction", "common"))) {
                            updateOrderStatus(selectedOrder._id, "cancel");
                          }
                        }}>
                        <XCircle className="w-4 h-4" /> {t("stats.cancelled", "purchaseOrders")}
                      </button>
                    </>
                  )}
                  {(selectedOrder.status === "SENT" || selectedOrder.status === "PARTIAL") && (
                    <button className="vp-button vp-button-sm vp-press gap-1.5"
                      disabled={actionLoading}
                      style={{ borderColor: "hsl(var(--vp-success))", color: "hsl(var(--vp-success))" }}
                      onClick={() => {
                        setReceivedItems(selectedOrder.items.map(i => ({
                          productId: i.productId, quantity: 0, finalCost: i.estimatedCost,
                        })));
                        setViewMode("receive");
                      }}>
                      <Truck className="w-4 h-4" /> {t("detail.receiveAction", "purchaseOrders")}
                    </button>
                  )}
                </div>
              </div>

              {/* Order info cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="vp-card p-4">
                  <p className="text-xs text-[hsl(var(--vp-muted))]">{t("create.totalEstimated", "purchaseOrders")}</p>
                  <p className="text-lg font-bold text-[hsl(var(--vp-primary))]">${selectedOrder.estimatedTotal.toFixed(2)}</p>
                </div>
                <div className="vp-card p-4">
                  <p className="text-xs text-[hsl(var(--vp-muted))]">{t("detail.finalTotal", "purchaseOrders")}</p>
                  <p className="text-lg font-bold text-[hsl(var(--vp-text))]">${selectedOrder.finalTotal.toFixed(2)}</p>
                </div>
                <div className="vp-card p-4">
                  <p className="text-xs text-[hsl(var(--vp-muted))]">{t("table.items", "purchaseOrders")}</p>
                  <p className="text-lg font-bold">{selectedOrder.items.length}</p>
                </div>
                <div className="vp-card p-4">
                  <p className="text-xs text-[hsl(var(--vp-muted))]">{t("create.deliveryDate", "purchaseOrders")}</p>
                  <p className="text-lg font-bold">{selectedOrder.estimatedDeliveryDate ? new Date(selectedOrder.estimatedDeliveryDate).toLocaleDateString() : "—"}</p>
                </div>
              </div>

              {/* Items table */}
              <div className="vp-card overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="vp-table">
                    <thead><tr>
                      <th>{t("create.selectProduct", "purchaseOrders")}</th><th>{t("table.code", "purchaseOrders")}</th><th className="text-right">{t("detail.requested", "purchaseOrders")}</th>
                      <th className="text-right">{t("detail.received", "purchaseOrders")}</th><th className="text-right">{t("detail.costEst", "purchaseOrders")}</th>
                      <th className="text-right">{t("detail.costFinal", "purchaseOrders")}</th><th className="text-right">{t("detail.subtotal", "purchaseOrders")}</th>
                    </tr></thead>
                    <tbody>
                      {selectedOrder.items.map(item => {
                        const received = item.receivedQuantity >= item.requestedQuantity;
                        const partial = item.receivedQuantity > 0 && !received;
                        return (
                          <tr key={item.productId}>
                            <td>
                              <span className="font-medium">{item.productName}</span>
                              {item.suggestionReason && <p className="text-xs text-[hsl(var(--vp-muted))] mt-0.5">{item.suggestionReason}</p>}
                            </td>
                            <td className="font-mono text-sm">{item.productCode}</td>
                            <td className="text-right">{item.requestedQuantity}</td>
                            <td className="text-right">
                              <span className={received ? "text-emerald-600 font-semibold" : partial ? "text-amber-600 font-semibold" : ""}>
                                {item.receivedQuantity}
                              </span>
                            </td>
                            <td className="text-right">${item.estimatedCost.toFixed(2)}</td>
                            <td className="text-right">{item.finalCost > 0 ? `$${item.finalCost.toFixed(2)}` : "—"}</td>
                            <td className="text-right font-semibold">${item.subtotal.toFixed(2)}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {selectedOrder.notes && (
                <div className="vp-card p-4">
                  <p className="text-xs text-[hsl(var(--vp-muted))] mb-1">{t("create.notes", "purchaseOrders")}</p>
                  <p className="text-sm">{selectedOrder.notes}</p>
                </div>
              )}
            </div>
          );
        })()}

        {/* ─── RECEIVE VIEW ─── */}
        {viewMode === "receive" && selectedOrder && (
          <div className="space-y-6 vp-fade-in">
            <div className="flex items-center gap-3">
              <button onClick={() => setViewMode("detail")}
                className="vp-button vp-button-ghost vp-press p-2">
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-[hsl(var(--vp-text))]">
                  <Truck className="inline w-6 h-6 mr-2 text-[hsl(var(--vp-success))]" />
                  {t("reception.title", "purchaseOrders")}: {selectedOrder.orderNumber}
                </h1>
                <p className="text-sm text-[hsl(var(--vp-muted))]">
                  {t("reception.subtitle", "purchaseOrders")}
                </p>
              </div>
            </div>

            <div className="vp-card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="vp-table">
                  <thead><tr>
                    <th>{t("create.selectProduct", "purchaseOrders")}</th><th className="text-right">{t("detail.requested", "purchaseOrders")}</th>
                    <th className="text-right">{t("reception.alreadyReceived", "purchaseOrders")}</th>
                    <th className="text-right">{t("reception.receiveNow", "purchaseOrders")}</th>
                    <th className="text-right">{t("detail.costFinal", "purchaseOrders")}</th>
                  </tr></thead>
                  <tbody>
                    {selectedOrder.items.map((item, idx) => {
                      const ri = receivedItems[idx];
                      const remaining = item.requestedQuantity - item.receivedQuantity;
                      return (
                        <tr key={item.productId}>
                          <td className="font-medium">{item.productName}</td>
                          <td className="text-right">{item.requestedQuantity}</td>
                          <td className="text-right text-[hsl(var(--vp-muted))]">{item.receivedQuantity}</td>
                          <td className="text-right">
                            <input type="number" className="vp-input !min-h-[32px] !py-1 w-20 text-right"
                              value={ri?.quantity || ""} min={0} max={remaining}
                              onChange={e => {
                                const val = e.target.value === "" ? 0 : Number(e.target.value);
                                const newItems = [...receivedItems];
                                newItems[idx] = { ...newItems[idx], quantity: val };
                                setReceivedItems(newItems);
                              }} />
                          </td>
                          <td className="text-right">
                            <input type="number" className="vp-input !min-h-[32px] !py-1 w-24 text-right"
                              value={ri?.finalCost || ""} step="0.01" min={0}
                              onChange={e => {
                                const val = e.target.value === "" ? 0 : Number(e.target.value);
                                const newItems = [...receivedItems];
                                newItems[idx] = { ...newItems[idx], finalCost: val };
                                setReceivedItems(newItems);
                              }} />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <button className="vp-button vp-press" onClick={() => setViewMode("detail")}>
                {t("cancel", "common")}
              </button>
              <button className="vp-button vp-button-primary vp-press flex items-center gap-2"
                onClick={receiveOrder}
                disabled={actionLoading}>
                {actionLoading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : (
                  <CheckCircle className="w-5 h-5" />
                )}
                {t("reception.confirm", "purchaseOrders")}
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

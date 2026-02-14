"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/layout/Header";
import {
  Channel2Modal,
  Channel2Bar,
} from "@/components/supplier-documents/Channel2Modal";
import { useGlobalLanguage } from "@/lib/hooks/useGlobalLanguage";
import { apiFetch } from "@/lib/utils/apiFetch";
import { toast } from "react-toastify";
import SupplierSearch from "@/components/shared/SupplierSearch";

/* ─────────────────  Interfaces  ───────────────── */

interface Supplier {
  _id: string;
  name: string;
  document?: string;
}

interface SupplierDocument {
  _id: string;
  supplierId: string;
  channel: 1 | 2;
  type: string;
  documentNumber: string;
  pointOfSale?: string;
  date: string;
  dueDate?: string;
  totalAmount: number;
  balance: number;
  appliedPaymentsTotal?: number;
  appliedCreditsTotal?: number;
  status: string;
}

interface PaymentOrderDoc {
  documentId: string;
  documentType: string;
  documentNumber: string;
  date: string;
  amount: number;
  balanceBefore: number;
  balanceAfter: number;
}

interface PaymentOrderPayment {
  method: string;
  reference?: string;
  amount: number;
}

interface PaymentOrder {
  _id: string;
  orderNumber: number;
  supplierId: string;
  channel: 1 | 2;
  status: "PENDING" | "CONFIRMED" | "CANCELLED";
  documents: PaymentOrderDoc[];
  creditNotes: PaymentOrderDoc[];
  payments: PaymentOrderPayment[];
  documentsTotal: number;
  creditNotesTotal: number;
  paymentsTotal: number;
  netPayable: number;
  notes?: string;
  date: string;
  createdAt: string;
  createdByEmail?: string;
  approvedByEmail?: string;
  confirmedAt?: string;
}

interface PaymentItem {
  method: "cash" | "transfer" | "mercadopago" | "check" | "card";
  reference?: string;
  amount: string;
}

/* ─────────────────  i18n  ───────────────── */

const COPY = {
  es: {
    title: "Órdenes de Pago",
    subtitle: "Cuentas a pagar y pagos a proveedores",
    supplierLabel: "Proveedor",
    allSuppliers: "Todos los proveedores",
    documentsTitle: "Comprobantes pendientes",
    creditNotesTitle: "Notas de Crédito disponibles",
    paymentsTitle: "Medios de pago",
    createOrder: "Crear Orden de Pago",
    addPayment: "Agregar medio",
    removePayment: "Quitar",
    applyAmount: "Aplicar",
    balance: "Saldo",
    totalDocuments: "Total comprobantes",
    totalCreditNotes: "Total NC",
    totalPayments: "Total medios",
    netPayable: "Total a pagar",
    orderList: "Órdenes de Pago",
    confirm: "Confirmar",
    cancel: "Anular",
    detail: "Detalle",
    print: "Imprimir",
    printA4: "A4",
    printTicket: "Ticket",
    close: "Cerrar",
    status: {
      PENDING: "Pendiente",
      CONFIRMED: "Confirmada",
      CANCELLED: "Anulada",
    },
    types: {
      INVOICE: "Factura",
      INVOICE_A: "Factura A",
      INVOICE_B: "Factura B",
      INVOICE_C: "Factura C",
      DEBIT_NOTE: "Nota de Débito",
      CREDIT_NOTE: "Nota de Crédito",
      FISCAL_DELIVERY_NOTE: "Remito Fiscal",
    },
    paymentMethods: {
      cash: "Efectivo",
      transfer: "Transferencia",
      mercadopago: "Mercado Pago",
      check: "Cheque",
      card: "Tarjeta",
    },
    reference: "Referencia",
    amount: "Monto",
    filters: "Filtros",
    dateFrom: "Desde",
    dateTo: "Hasta",
    statusFilter: "Estado",
    all: "Todos",
    notes: "Observaciones",
    notesPlaceholder: "Observaciones (opcional)",
    invoiceDetail: "Detalle de Comprobante",
    associatedPayments: "Pagos Asociados",
    appliedAmount: "Monto aplicado",
    user: "Usuario",
    noPayments: "Sin pagos asociados",
    outstandingBalance: "Saldo pendiente",
    channel1: "Fiscal",
    channel2: "Interno",
    channel2Toggle: "F2: Modo Interno",
    channel2Hint: "Pulsa F2 o el botón para ver modo interno",
    toasts: {
      loadError: "Error al cargar datos",
      orderCreated: "Orden de pago creada",
      orderError: "Error al crear orden de pago",
      confirmOk: "Orden confirmada",
      confirmError: "Error al confirmar",
      cancelOk: "Orden anulada",
      cancelError: "Error al anular",
      validationError: "Revisa los importes",
      supplierRequired: "Selecciona un proveedor",
      noDocuments: "Selecciona al menos un comprobante",
      paymentMismatch: "Los medios de pago no coinciden con el total",
    },
    cols: {
      date: "Fecha",
      supplier: "Proveedor",
      type: "Tipo",
      number: "Número",
      total: "Total",
      outstanding: "Saldo Pend.",
      paymentStatus: "Estado Pago",
      orderNumber: "Nro. OP",
      netPayable: "Total Pagado",
      orderStatus: "Estado",
      actions: "Acciones",
    },
    docStatusLabels: {
      PENDING: "Pendiente",
      DUE_SOON: "Próx. Vencer",
      OVERDUE: "Vencido",
      PARTIALLY_APPLIED: "Parcial",
      APPLIED: "Pagado",
      CANCELLED: "Anulado",
    },
  },
  en: {
    title: "Payment Orders",
    subtitle: "Accounts payable and supplier payments",
    supplierLabel: "Supplier",
    allSuppliers: "All suppliers",
    documentsTitle: "Pending invoices",
    creditNotesTitle: "Available credit notes",
    paymentsTitle: "Payment methods",
    createOrder: "Create Payment Order",
    addPayment: "Add method",
    removePayment: "Remove",
    applyAmount: "Apply",
    balance: "Balance",
    totalDocuments: "Documents total",
    totalCreditNotes: "Credit notes",
    totalPayments: "Payments total",
    netPayable: "Net payable",
    orderList: "Payment Orders",
    confirm: "Confirm",
    cancel: "Cancel",
    detail: "Detail",
    print: "Print",
    printA4: "A4",
    printTicket: "Ticket",
    close: "Close",
    status: {
      PENDING: "Pending",
      CONFIRMED: "Confirmed",
      CANCELLED: "Cancelled",
    },
    types: {
      INVOICE: "Invoice",
      INVOICE_A: "Invoice A",
      INVOICE_B: "Invoice B",
      INVOICE_C: "Invoice C",
      DEBIT_NOTE: "Debit Note",
      CREDIT_NOTE: "Credit Note",
      FISCAL_DELIVERY_NOTE: "Fiscal Delivery Note",
    },
    paymentMethods: {
      cash: "Cash",
      transfer: "Bank Transfer",
      mercadopago: "Mercado Pago",
      check: "Check",
      card: "Card",
    },
    reference: "Reference",
    amount: "Amount",
    filters: "Filters",
    dateFrom: "From",
    dateTo: "To",
    statusFilter: "Status",
    all: "All",
    notes: "Notes",
    notesPlaceholder: "Notes (optional)",
    invoiceDetail: "Invoice Detail",
    associatedPayments: "Associated Payments",
    appliedAmount: "Applied amount",
    user: "User",
    noPayments: "No associated payments",
    outstandingBalance: "Outstanding balance",
    channel1: "Fiscal",
    channel2: "Internal",
    channel2Toggle: "F2: Internal Mode",
    channel2Hint: "Press F2 or button to toggle internal mode",
    toasts: {
      loadError: "Error loading data",
      orderCreated: "Payment order created",
      orderError: "Error creating payment order",
      confirmOk: "Order confirmed",
      confirmError: "Error confirming order",
      cancelOk: "Order cancelled",
      cancelError: "Error cancelling order",
      validationError: "Check amounts",
      supplierRequired: "Select a supplier",
      noDocuments: "Select at least one document",
      paymentMismatch: "Payment methods don't match total",
    },
    cols: {
      date: "Date",
      supplier: "Supplier",
      type: "Type",
      number: "Number",
      total: "Total",
      outstanding: "Outstanding",
      paymentStatus: "Pay Status",
      orderNumber: "PO #",
      netPayable: "Total Paid",
      orderStatus: "Status",
      actions: "Actions",
    },
    docStatusLabels: {
      PENDING: "Pending",
      DUE_SOON: "Due Soon",
      OVERDUE: "Overdue",
      PARTIALLY_APPLIED: "Partial",
      APPLIED: "Paid",
      CANCELLED: "Cancelled",
    },
  },
  pt: {
    title: "Ordens de Pagamento",
    subtitle: "Contas a pagar e pagamentos a fornecedores",
    supplierLabel: "Fornecedor",
    allSuppliers: "Todos os fornecedores",
    documentsTitle: "Documentos pendentes",
    creditNotesTitle: "Notas de crédito disponíveis",
    paymentsTitle: "Meios de pagamento",
    createOrder: "Criar Ordem de Pagamento",
    addPayment: "Adicionar meio",
    removePayment: "Remover",
    applyAmount: "Aplicar",
    balance: "Saldo",
    totalDocuments: "Total documentos",
    totalCreditNotes: "Total NC",
    totalPayments: "Total meios",
    netPayable: "Total a pagar",
    orderList: "Ordens de Pagamento",
    confirm: "Confirmar",
    cancel: "Cancelar",
    detail: "Detalhe",
    print: "Imprimir",
    printA4: "A4",
    printTicket: "Ticket",
    close: "Fechar",
    status: {
      PENDING: "Pendente",
      CONFIRMED: "Confirmada",
      CANCELLED: "Cancelada",
    },
    types: {
      INVOICE: "Fatura",
      INVOICE_A: "Fatura A",
      INVOICE_B: "Fatura B",
      INVOICE_C: "Fatura C",
      DEBIT_NOTE: "Nota de Débito",
      CREDIT_NOTE: "Nota de Crédito",
      FISCAL_DELIVERY_NOTE: "Remessa Fiscal",
    },
    paymentMethods: {
      cash: "Dinheiro",
      transfer: "Transferência",
      mercadopago: "Mercado Pago",
      check: "Cheque",
      card: "Cartão",
    },
    reference: "Referência",
    amount: "Valor",
    filters: "Filtros",
    dateFrom: "De",
    dateTo: "Até",
    statusFilter: "Estado",
    all: "Todos",
    notes: "Observações",
    notesPlaceholder: "Observações (opcional)",
    invoiceDetail: "Detalhe do Documento",
    associatedPayments: "Pagamentos Associados",
    appliedAmount: "Valor aplicado",
    user: "Usuário",
    noPayments: "Sem pagamentos associados",
    outstandingBalance: "Saldo pendente",
    channel1: "Fiscal",
    channel2: "Interno",
    channel2Toggle: "F2: Modo Interno",
    channel2Hint: "Pressione F2 ou o botão para alternar modo interno",
    toasts: {
      loadError: "Erro ao carregar dados",
      orderCreated: "Ordem de pagamento criada",
      orderError: "Erro ao criar ordem",
      confirmOk: "Ordem confirmada",
      confirmError: "Erro ao confirmar",
      cancelOk: "Ordem cancelada",
      cancelError: "Erro ao cancelar",
      validationError: "Verifique os valores",
      supplierRequired: "Selecione um fornecedor",
      noDocuments: "Selecione pelo menos um documento",
      paymentMismatch: "Os meios de pagamento não coincidem com o total",
    },
    cols: {
      date: "Data",
      supplier: "Fornecedor",
      type: "Tipo",
      number: "Número",
      total: "Total",
      outstanding: "Saldo Pend.",
      paymentStatus: "Estado Pgto.",
      orderNumber: "Nro. OP",
      netPayable: "Total Pago",
      orderStatus: "Estado",
      actions: "Ações",
    },
    docStatusLabels: {
      PENDING: "Pendente",
      DUE_SOON: "Próx. Vencer",
      OVERDUE: "Vencido",
      PARTIALLY_APPLIED: "Parcial",
      APPLIED: "Pago",
      CANCELLED: "Cancelado",
    },
  },
} as const;

type CopyType = (typeof COPY)["es"];

/* ─── Helpers ─── */

const formatCurrency = (n: number) =>
  new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    minimumFractionDigits: 2,
  }).format(n);

const fmtDate = (d: string) =>
  new Date(d).toLocaleDateString("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

const statusColor = (status: string) => {
  switch (status) {
    case "PENDING":
      return "bg-yellow-100 text-yellow-800";
    case "DUE_SOON":
      return "bg-orange-100 text-orange-800";
    case "OVERDUE":
      return "bg-red-100 text-red-800";
    case "PARTIALLY_APPLIED":
      return "bg-blue-100 text-blue-800";
    case "APPLIED":
      return "bg-green-100 text-green-800";
    case "CANCELLED":
      return "bg-gray-100 text-gray-500";
    default:
      return "bg-gray-100 text-gray-600";
  }
};

const orderStatusColor = (status: string) => {
  switch (status) {
    case "PENDING":
      return "bg-yellow-100 text-yellow-800";
    case "CONFIRMED":
      return "bg-green-100 text-green-800";
    case "CANCELLED":
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-600";
  }
};

/* ═══════════════════════════════════════════
   Page Component
   ═══════════════════════════════════════════ */

export default function PaymentOrdersPage() {
  const router = useRouter();
  const { currentLanguage } = useGlobalLanguage();
  const copy = (COPY[currentLanguage as keyof typeof COPY] ||
    COPY.es) as CopyType;

  /* ── Auth ── */
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  /* ── Channel 2 state ── */
  const [channel2Active, setChannel2Active] = useState(false);
  const [channel2Expires, setChannel2Expires] = useState("");
  const [showChannel2Modal, setShowChannel2Modal] = useState(false);
  const activeChannel = channel2Active ? 2 : 1;

  /* ── Data ── */
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [supplierId, setSupplierId] = useState("");
  const [documents, setDocuments] = useState<SupplierDocument[]>([]);
  const [creditNotes, setCreditNotes] = useState<SupplierDocument[]>([]);
  const [paymentOrders, setPaymentOrders] = useState<PaymentOrder[]>([]);

  /* ── Filters ── */
  const [filterStatus, setFilterStatus] = useState("");
  const [filterDateFrom, setFilterDateFrom] = useState("");
  const [filterDateTo, setFilterDateTo] = useState("");

  /* ── Create form ── */
  const [applyAmounts, setApplyAmounts] = useState<Record<string, string>>({});
  const [applyCreditAmounts, setApplyCreditAmounts] = useState<
    Record<string, string>
  >({});
  const [payments, setPayments] = useState<PaymentItem[]>([
    { method: "cash", amount: "" },
  ]);
  const [orderNotes, setOrderNotes] = useState("");
  const [creating, setCreating] = useState(false);

  /* ── Detail modal ── */
  const [detailOrder, setDetailOrder] = useState<PaymentOrder | null>(null);
  const [detailChannel, setDetailChannel] = useState<1 | 2>(1);
  const [showCreate, setShowCreate] = useState(false);

  /* ── Supplier map for display ── */
  const supplierMap = useMemo(() => {
    const m: Record<string, string> = {};
    suppliers.forEach((s) => (m[s._id] = s.name));
    return m;
  }, [suppliers]);

  /* ══════════  F2 Key Handler  ══════════ */
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input/textarea/select
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;

      if (e.key === "F2") {
        e.preventDefault();
        if (detailOrder) {
          // In detail view — toggle channel view
          setDetailChannel((prev) => (prev === 1 ? 2 : 1));
        } else if (channel2Active) {
          // Deactivate
          handleChannel2Deactivate();
        } else {
          // Open activation modal
          setShowChannel2Modal(true);
        }
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [channel2Active, detailOrder]);

  /* ══════════  Data Loading  ══════════ */

  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (!userStr) {
      router.push("/auth/login");
      return;
    }
    setUser(JSON.parse(userStr));
    loadSuppliers();
  }, [router]);

  useEffect(() => {
    if (supplierId) {
      loadSupplierDocs(supplierId);
    } else {
      setDocuments([]);
      setCreditNotes([]);
    }
  }, [supplierId, activeChannel]);

  useEffect(() => {
    loadPaymentOrders();
  }, [supplierId, filterStatus, filterDateFrom, filterDateTo, activeChannel]);

  const loadSuppliers = async () => {
    try {
      const res = await apiFetch("/api/suppliers");
      const data = await res.json();
      setSuppliers(data?.data?.suppliers || []);
    } catch {
      toast.error(copy.toasts.loadError);
    } finally {
      setLoading(false);
    }
  };

  const loadSupplierDocs = async (id: string) => {
    try {
      const channel = activeChannel;
      const res = await apiFetch(
        `/api/supplier-documents?supplierId=${id}&channel=${channel}`,
      );
      const data = await res.json();
      const allDocs: SupplierDocument[] = data?.documents || [];
      const available = allDocs.filter(
        (d) => d.balance > 0 && d.status !== "CANCELLED",
      );
      setDocuments(available.filter((d) => d.type !== "CREDIT_NOTE"));
      setCreditNotes(available.filter((d) => d.type === "CREDIT_NOTE"));
    } catch {
      toast.error(copy.toasts.loadError);
    }
  };

  const loadPaymentOrders = async () => {
    try {
      const params = new URLSearchParams();
      if (supplierId) params.set("supplierId", supplierId);
      if (filterStatus) params.set("status", filterStatus);
      if (filterDateFrom) params.set("dateFrom", filterDateFrom);
      if (filterDateTo) params.set("dateTo", filterDateTo);
      params.set("channel", String(activeChannel));
      const res = await apiFetch(`/api/payment-orders?${params.toString()}`);
      const data = await res.json();
      setPaymentOrders(data?.paymentOrders || []);
    } catch {
      toast.error(copy.toasts.loadError);
    }
  };

  /* ══════════  Channel 2  ══════════ */

  const handleChannel2Activated = useCallback((expiresAt: string) => {
    setChannel2Active(true);
    setChannel2Expires(expiresAt);
  }, []);

  const handleChannel2Deactivate = useCallback(async () => {
    try {
      await apiFetch("/api/channel2-auth", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: "manual" }),
      });
    } catch {}
    setChannel2Active(false);
    setChannel2Expires("");
  }, []);

  /* ══════════  Totals  ══════════ */

  const totals = useMemo(() => {
    const documentsTotal = documents.reduce(
      (sum, doc) => sum + Number(applyAmounts[doc._id] || 0),
      0,
    );
    const creditNotesTotal = creditNotes.reduce(
      (sum, doc) => sum + Number(applyCreditAmounts[doc._id] || 0),
      0,
    );
    const paymentsTotal = payments.reduce(
      (sum, p) => sum + Number(p.amount || 0),
      0,
    );
    const netPayable = Math.max(0, documentsTotal - creditNotesTotal);
    return { documentsTotal, creditNotesTotal, paymentsTotal, netPayable };
  }, [documents, creditNotes, applyAmounts, applyCreditAmounts, payments]);

  /* ══════════  Actions  ══════════ */

  const handleCreatePaymentOrder = async () => {
    if (!supplierId) {
      toast.error(copy.toasts.supplierRequired);
      return;
    }
    const docsPayload = documents
      .map((d) => ({
        documentId: d._id,
        applyAmount: Number(applyAmounts[d._id] || 0),
      }))
      .filter((d) => d.applyAmount > 0);

    const cnPayload = creditNotes
      .map((d) => ({
        documentId: d._id,
        applyAmount: Number(applyCreditAmounts[d._id] || 0),
      }))
      .filter((d) => d.applyAmount > 0);

    if (docsPayload.length === 0) {
      toast.error(copy.toasts.noDocuments);
      return;
    }
    if (Math.abs(totals.netPayable - totals.paymentsTotal) > 0.01) {
      toast.error(copy.toasts.paymentMismatch);
      return;
    }

    setCreating(true);
    try {
      const res = await apiFetch("/api/payment-orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          supplierId,
          channel: activeChannel,
          documents: docsPayload,
          creditNotes: cnPayload,
          payments: payments.map((p) => ({
            method: p.method,
            reference: p.reference || undefined,
            amount: Number(p.amount || 0),
          })),
          notes: orderNotes || undefined,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        toast.error(data?.error || copy.toasts.orderError);
        return;
      }
      toast.success(copy.toasts.orderCreated);
      resetForm();
      loadSupplierDocs(supplierId);
      loadPaymentOrders();
    } catch {
      toast.error(copy.toasts.orderError);
    } finally {
      setCreating(false);
    }
  };

  const handleConfirm = async (id: string) => {
    try {
      const res = await apiFetch(`/api/payment-orders/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "confirm" }),
      });
      if (!res.ok) {
        const data = await res.json();
        toast.error(data?.error || copy.toasts.confirmError);
        return;
      }
      toast.success(copy.toasts.confirmOk);
      loadPaymentOrders();
      if (supplierId) loadSupplierDocs(supplierId);
    } catch {
      toast.error(copy.toasts.confirmError);
    }
  };

  const handleCancel = async (id: string) => {
    try {
      const res = await apiFetch(`/api/payment-orders/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "cancel" }),
      });
      if (!res.ok) {
        const data = await res.json();
        toast.error(data?.error || copy.toasts.cancelError);
        return;
      }
      toast.success(copy.toasts.cancelOk);
      loadPaymentOrders();
      if (supplierId) loadSupplierDocs(supplierId);
    } catch {
      toast.error(copy.toasts.cancelError);
    }
  };

  const handlePrint = (id: string, format: "a4" | "ticket") => {
    const token = localStorage.getItem("accessToken");
    const url = `/api/payment-orders/${id}/print?format=${format}&channel=${detailChannel}`;
    const win = window.open("", "_blank");
    if (!win) return;
    apiFetch(url)
      .then((r) => r.text())
      .then((html) => {
        win.document.write(html);
        win.document.close();
        setTimeout(() => win.print(), 500);
      });
  };

  const resetForm = () => {
    setApplyAmounts({});
    setApplyCreditAmounts({});
    setPayments([{ method: "cash", amount: "" }]);
    setOrderNotes("");
    setShowCreate(false);
  };

  /* ── Payment methods helpers ── */
  const addPayment = () =>
    setPayments((p) => [...p, { method: "cash", amount: "" }]);
  const updatePayment = (i: number, patch: Partial<PaymentItem>) =>
    setPayments((p) =>
      p.map((item, idx) => (idx === i ? { ...item, ...patch } : item)),
    );
  const removePayment = (i: number) =>
    setPayments((p) => p.filter((_, idx) => idx !== i));

  /* ══════════  Render  ══════════ */

  if (loading) {
    return (
      <div className="flex items-center justify-center vp-page">
        <div className="vp-card px-6 py-4 text-[hsl(var(--vp-muted))] vp-fade-in">
          Loading...
        </div>
      </div>
    );
  }

  /* ─── Detail Modal ─── */
  const renderDetailModal = () => {
    if (!detailOrder) return null;
    const o = detailOrder;
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
        <div className="vp-card w-full max-w-3xl max-h-[90vh] overflow-y-auto p-6 relative">
          <button
            onClick={() => {
              setDetailOrder(null);
              setDetailChannel(1);
            }}
            className="absolute top-3 right-3 text-[hsl(var(--vp-muted))] hover:text-[hsl(var(--vp-text))] text-lg"
          >
            ✕
          </button>

          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="text-xl font-bold text-[hsl(var(--vp-text))]">
                {copy.orderList} #{String(o.orderNumber).padStart(4, "0")}
              </h2>
              <p className="text-sm text-[hsl(var(--vp-muted))]">
                {fmtDate(o.date)} · {supplierMap[o.supplierId] || "-"}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {/* Channel toggle */}
              <button
                onClick={() => setDetailChannel((p) => (p === 1 ? 2 : 1))}
                className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors ${
                  detailChannel === 2
                    ? "bg-amber-100 text-amber-800 ring-2 ring-amber-400"
                    : "bg-emerald-100 text-emerald-800 ring-2 ring-emerald-400"
                }`}
                title={copy.channel2Hint}
              >
                {detailChannel === 1 ? copy.channel1 : copy.channel2} (F2)
              </button>
              <span
                className={`px-2 py-1 rounded text-xs font-semibold ${orderStatusColor(o.status)}`}
              >
                {copy.status[o.status]}
              </span>
            </div>
          </div>

          {/* Channel 1: Full detail */}
          {detailChannel === 1 ? (
            <>
              {/* Documents table */}
              <div className="mb-4">
                <h3 className="text-sm font-semibold text-[hsl(var(--vp-muted))] mb-2">
                  {copy.documentsTitle}
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs border-collapse">
                    <thead>
                      <tr className="bg-[hsl(var(--vp-bg-secondary))]">
                        <th className="p-2 text-left border">
                          {copy.cols.type}
                        </th>
                        <th className="p-2 text-left border">
                          {copy.cols.number}
                        </th>
                        <th className="p-2 text-left border">
                          {copy.cols.date}
                        </th>
                        <th className="p-2 text-right border">Saldo Ant.</th>
                        <th className="p-2 text-right border">
                          {copy.appliedAmount}
                        </th>
                        <th className="p-2 text-right border">Saldo Post.</th>
                      </tr>
                    </thead>
                    <tbody>
                      {o.documents.map((d, i) => (
                        <tr key={i}>
                          <td className="p-2 border">
                            {(copy.types as any)[d.documentType] ||
                              d.documentType}
                          </td>
                          <td className="p-2 border">{d.documentNumber}</td>
                          <td className="p-2 border">{fmtDate(d.date)}</td>
                          <td className="p-2 text-right border">
                            {formatCurrency(d.balanceBefore)}
                          </td>
                          <td className="p-2 font-semibold text-right border">
                            {formatCurrency(d.amount)}
                          </td>
                          <td className="p-2 text-right border">
                            {formatCurrency(d.balanceAfter)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Credit Notes */}
              {o.creditNotes?.length > 0 && (
                <div className="mb-4">
                  <h3 className="text-sm font-semibold text-[hsl(var(--vp-muted))] mb-2">
                    {copy.creditNotesTitle}
                  </h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs border-collapse">
                      <thead>
                        <tr className="bg-[hsl(var(--vp-bg-secondary))]">
                          <th className="p-2 text-left border">
                            {copy.cols.number}
                          </th>
                          <th className="p-2 text-left border">
                            {copy.cols.date}
                          </th>
                          <th className="p-2 text-right border">
                            {copy.appliedAmount}
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {o.creditNotes.map((d, i) => (
                          <tr key={i}>
                            <td className="p-2 border">{d.documentNumber}</td>
                            <td className="p-2 border">{fmtDate(d.date)}</td>
                            <td className="p-2 font-semibold text-right text-green-700 border">
                              -{formatCurrency(d.amount)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Payments */}
              <div className="mb-4">
                <h3 className="text-sm font-semibold text-[hsl(var(--vp-muted))] mb-2">
                  {copy.paymentsTitle}
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs border-collapse">
                    <thead>
                      <tr className="bg-[hsl(var(--vp-bg-secondary))]">
                        <th className="p-2 text-left border">Medio</th>
                        <th className="p-2 text-left border">
                          {copy.reference}
                        </th>
                        <th className="p-2 text-right border">{copy.amount}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {o.payments.map((p, i) => (
                        <tr key={i}>
                          <td className="p-2 border">
                            {(copy.paymentMethods as any)[p.method] || p.method}
                          </td>
                          <td className="p-2 border">{p.reference || "-"}</td>
                          <td className="p-2 font-semibold text-right border">
                            {formatCurrency(p.amount)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Totals */}
              <div className="flex justify-end mb-4">
                <div className="w-64 space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span>{copy.totalDocuments}:</span>
                    <span>{formatCurrency(o.documentsTotal)}</span>
                  </div>
                  {o.creditNotesTotal > 0 && (
                    <div className="flex justify-between text-green-700">
                      <span>{copy.totalCreditNotes}:</span>
                      <span>-{formatCurrency(o.creditNotesTotal)}</span>
                    </div>
                  )}
                  <div className="flex justify-between pt-1 font-bold border-t">
                    <span>{copy.netPayable}:</span>
                    <span>{formatCurrency(o.netPayable)}</span>
                  </div>
                </div>
              </div>

              {/* Audit info */}
              <div className="text-xs text-[hsl(var(--vp-muted))] space-y-1">
                {o.createdByEmail && <p>Creado por: {o.createdByEmail}</p>}
                {o.approvedByEmail && (
                  <p>Confirmado por: {o.approvedByEmail}</p>
                )}
                {o.notes && (
                  <p className="bg-[hsl(var(--vp-bg-secondary))] p-2 rounded mt-2">
                    {copy.notes}: {o.notes}
                  </p>
                )}
              </div>
            </>
          ) : (
            /* Channel 2: Simplified */
            <>
              <div className="pl-4 mb-4 border-l-4 border-amber-400">
                <div className="space-y-2 text-sm">
                  {o.documents.map((d, i) => (
                    <div key={i} className="flex justify-between">
                      <span>{d.documentNumber}</span>
                      <span className="font-semibold">
                        {formatCurrency(d.amount)}
                      </span>
                    </div>
                  ))}
                  {o.creditNotes?.map((d, i) => (
                    <div
                      key={`cn-${i}`}
                      className="flex justify-between text-green-700"
                    >
                      <span>NC {d.documentNumber}</span>
                      <span className="font-semibold">
                        -{formatCurrency(d.amount)}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="pt-2 mt-3 border-t">
                  {o.payments.map((p, i) => (
                    <div key={i} className="flex justify-between text-sm">
                      <span>
                        {(copy.paymentMethods as any)[p.method] || p.method}
                      </span>
                      <span>{formatCurrency(p.amount)}</span>
                    </div>
                  ))}
                </div>
                <div className="flex justify-between pt-2 mt-3 text-lg font-bold border-t">
                  <span>Total:</span>
                  <span>{formatCurrency(o.netPayable)}</span>
                </div>
              </div>
            </>
          )}

          {/* Print + Close */}
          <div className="flex justify-end gap-2 mt-4">
            <button
              onClick={() => handlePrint(o._id, "a4")}
              className="text-sm vp-button vp-button-ghost"
            >
              🖨 {copy.printA4}
            </button>
            <button
              onClick={() => handlePrint(o._id, "ticket")}
              className="text-sm vp-button vp-button-ghost"
            >
              🎫 {copy.printTicket}
            </button>
            <button
              onClick={() => {
                setDetailOrder(null);
                setDetailChannel(1);
              }}
              className="text-sm vp-button vp-button-primary"
            >
              {copy.close}
            </button>
          </div>
        </div>
      </div>
    );
  };

  /* ─── Create Section ─── */
  const renderCreateSection = () => {
    if (!showCreate || !supplierId) return null;
    return (
      <div className="mb-6 space-y-4">
        {/* Documents to apply */}
        <div className="p-4 vp-card">
          <h3 className="text-sm font-semibold text-[hsl(var(--vp-text))] mb-3">
            {copy.documentsTitle}
          </h3>
          {documents.length === 0 ? (
            <p className="text-xs text-[hsl(var(--vp-muted))]">—</p>
          ) : (
            <div className="space-y-2">
              {documents.map((doc) => (
                <div
                  key={doc._id}
                  className="flex items-center justify-between gap-3 text-sm"
                >
                  <div className="flex-1 min-w-0">
                    <span className="font-mono text-xs">
                      {doc.documentNumber}
                    </span>
                    <span className="text-[hsl(var(--vp-muted))] text-xs ml-2">
                      {(copy.types as any)[doc.type] || doc.type}
                    </span>
                    <span className="text-[hsl(var(--vp-muted))] text-xs ml-2">
                      {copy.balance}: {formatCurrency(doc.balance)}
                    </span>
                  </div>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max={doc.balance}
                    className="px-2 py-1 text-sm text-right border rounded w-28"
                    placeholder={copy.applyAmount}
                    value={applyAmounts[doc._id] || ""}
                    onChange={(e) =>
                      setApplyAmounts((prev) => ({
                        ...prev,
                        [doc._id]: e.target.value,
                      }))
                    }
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Credit Notes */}
        {creditNotes.length > 0 && (
          <div className="p-4 vp-card">
            <h3 className="text-sm font-semibold text-[hsl(var(--vp-text))] mb-3">
              {copy.creditNotesTitle}
            </h3>
            <div className="space-y-2">
              {creditNotes.map((doc) => (
                <div
                  key={doc._id}
                  className="flex items-center justify-between gap-3 text-sm"
                >
                  <div className="flex-1 min-w-0">
                    <span className="font-mono text-xs">
                      {doc.documentNumber}
                    </span>
                    <span className="ml-2 text-xs text-green-600">
                      {copy.balance}: {formatCurrency(doc.balance)}
                    </span>
                  </div>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max={doc.balance}
                    className="px-2 py-1 text-sm text-right border rounded w-28"
                    placeholder={copy.applyAmount}
                    value={applyCreditAmounts[doc._id] || ""}
                    onChange={(e) =>
                      setApplyCreditAmounts((prev) => ({
                        ...prev,
                        [doc._id]: e.target.value,
                      }))
                    }
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Payment Methods */}
        <div className="p-4 vp-card">
          <h3 className="text-sm font-semibold text-[hsl(var(--vp-text))] mb-3">
            {copy.paymentsTitle}
          </h3>
          <div className="space-y-2">
            {payments.map((p, i) => (
              <div key={i} className="grid grid-cols-4 gap-2">
                <select
                  className="border rounded px-2 py-1.5 text-sm"
                  value={p.method}
                  onChange={(e) =>
                    updatePayment(i, {
                      method: e.target.value as PaymentItem["method"],
                    })
                  }
                >
                  {Object.entries(copy.paymentMethods).map(([k, v]) => (
                    <option key={k} value={k}>
                      {v}
                    </option>
                  ))}
                </select>
                <input
                  className="border rounded px-2 py-1.5 text-sm"
                  placeholder={copy.reference}
                  value={p.reference || ""}
                  onChange={(e) =>
                    updatePayment(i, { reference: e.target.value })
                  }
                />
                <input
                  type="number"
                  step="0.01"
                  className="border rounded px-2 py-1.5 text-sm text-right"
                  placeholder={copy.amount}
                  value={p.amount}
                  onChange={(e) => updatePayment(i, { amount: e.target.value })}
                />
                <button
                  className="text-xs text-red-600 hover:text-red-700"
                  onClick={() => removePayment(i)}
                >
                  {copy.removePayment}
                </button>
              </div>
            ))}
          </div>
          <button
            className="mt-2 text-xs text-indigo-600 hover:text-indigo-700"
            onClick={addPayment}
          >
            + {copy.addPayment}
          </button>
        </div>

        {/* Notes */}
        <div className="p-4 vp-card">
          <input
            className="w-full px-3 py-2 text-sm border rounded"
            placeholder={copy.notesPlaceholder}
            value={orderNotes}
            onChange={(e) => setOrderNotes(e.target.value)}
          />
        </div>

        {/* Totals + Submit */}
        <div className="p-4 vp-card">
          <div className="grid grid-cols-2 gap-3 mb-3 text-sm md:grid-cols-4">
            <div>
              <span className="text-[hsl(var(--vp-muted))] text-xs">
                {copy.totalDocuments}
              </span>
              <p className="font-semibold">
                {formatCurrency(totals.documentsTotal)}
              </p>
            </div>
            <div>
              <span className="text-[hsl(var(--vp-muted))] text-xs">
                {copy.totalCreditNotes}
              </span>
              <p className="font-semibold text-green-700">
                -{formatCurrency(totals.creditNotesTotal)}
              </p>
            </div>
            <div>
              <span className="text-[hsl(var(--vp-muted))] text-xs">
                {copy.totalPayments}
              </span>
              <p
                className={`font-semibold ${
                  Math.abs(totals.netPayable - totals.paymentsTotal) > 0.01
                    ? "text-red-600"
                    : "text-[hsl(var(--vp-text))]"
                }`}
              >
                {formatCurrency(totals.paymentsTotal)}
              </p>
            </div>
            <div>
              <span className="text-[hsl(var(--vp-muted))] text-xs">
                {copy.netPayable}
              </span>
              <p className="text-lg font-bold">
                {formatCurrency(totals.netPayable)}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              className="flex-1 px-4 py-2 text-sm font-semibold text-white rounded-lg bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50"
              onClick={handleCreatePaymentOrder}
              disabled={creating}
            >
              {creating ? "..." : copy.createOrder}
            </button>
            <button
              className="text-sm vp-button vp-button-ghost"
              onClick={resetForm}
            >
              {copy.cancel}
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="vp-page">
      <Header user={user} showBackButton={true} />

      {/* Channel 2 top bar */}
      {channel2Active && (
        <Channel2Bar
          expiresAt={channel2Expires}
          onDeactivate={handleChannel2Deactivate}
          language={currentLanguage}
        />
      )}

      <main className="vp-page-inner">
        {/* Title + Channel pills */}
        <div className="flex flex-col gap-3 mb-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="vp-section-title">{copy.title}</h1>
            <p className="vp-section-subtitle">{copy.subtitle}</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                if (channel2Active) handleChannel2Deactivate();
              }}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                !channel2Active
                  ? "bg-emerald-100 text-emerald-800 ring-2 ring-emerald-400"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {copy.channel1}
            </button>
            <button
              onClick={() => {
                if (!channel2Active) setShowChannel2Modal(true);
              }}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                channel2Active
                  ? "bg-amber-100 text-amber-800 ring-2 ring-amber-400"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
              title={copy.channel2Toggle}
            >
              {copy.channel2} (F2)
            </button>
          </div>
        </div>

        {/* Filters row */}
        <div className="p-4 mb-4 vp-card">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-5">
            <div>
              <SupplierSearch
                suppliers={suppliers}
                value={supplierId}
                onChange={setSupplierId}
                label={copy.supplierLabel}
                placeholder={copy.supplierLabel + "..."}
                allowEmpty
                emptyLabel={copy.allSuppliers}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[hsl(var(--vp-muted))] mb-1">
                {copy.statusFilter}
              </label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full text-sm border rounded px-2 py-1.5"
              >
                <option value="">{copy.all}</option>
                <option value="PENDING">{copy.status.PENDING}</option>
                <option value="CONFIRMED">{copy.status.CONFIRMED}</option>
                <option value="CANCELLED">{copy.status.CANCELLED}</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-[hsl(var(--vp-muted))] mb-1">
                {copy.dateFrom}
              </label>
              <input
                type="date"
                className="w-full text-sm border rounded px-2 py-1.5"
                value={filterDateFrom}
                onChange={(e) => setFilterDateFrom(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[hsl(var(--vp-muted))] mb-1">
                {copy.dateTo}
              </label>
              <input
                type="date"
                className="w-full text-sm border rounded px-2 py-1.5"
                value={filterDateTo}
                onChange={(e) => setFilterDateTo(e.target.value)}
              />
            </div>
            <div className="flex items-end">
              {supplierId && (
                <button
                  onClick={() => setShowCreate((v) => !v)}
                  className={`w-full text-sm font-semibold px-4 py-1.5 rounded-lg transition-colors ${
                    showCreate
                      ? "bg-gray-200 text-gray-700"
                      : "bg-emerald-600 hover:bg-emerald-700 text-white"
                  }`}
                >
                  {showCreate ? copy.close : `+ ${copy.createOrder}`}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Create Payment Order form */}
        {renderCreateSection()}

        {/* Payment Orders Table */}
        <div className="overflow-hidden vp-card">
          <div className="p-4 border-b border-[hsl(var(--vp-border))]">
            <h2 className="text-base font-semibold text-[hsl(var(--vp-text))]">
              {copy.orderList}
              <span className="text-[hsl(var(--vp-muted))] text-sm font-normal ml-2">
                ({paymentOrders.length})
              </span>
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[hsl(var(--vp-bg-secondary))] text-[hsl(var(--vp-muted))] text-xs">
                  <th className="p-3 text-left">{copy.cols.date}</th>
                  <th className="p-3 text-left">{copy.cols.orderNumber}</th>
                  <th className="p-3 text-left">{copy.cols.supplier}</th>
                  <th className="p-3 text-right">{copy.cols.netPayable}</th>
                  <th className="p-3 text-center">{copy.cols.orderStatus}</th>
                  <th className="p-3 text-center">{copy.cols.actions}</th>
                </tr>
              </thead>
              <tbody>
                {paymentOrders.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="p-8 text-center text-[hsl(var(--vp-muted))] text-xs"
                    >
                      —
                    </td>
                  </tr>
                ) : (
                  paymentOrders.map((o) => (
                    <tr
                      key={o._id}
                      className={`border-t border-[hsl(var(--vp-border))] hover:bg-[hsl(var(--vp-bg-secondary))] transition-colors ${
                        o.channel === 2 ? "border-l-4 border-l-amber-400" : ""
                      }`}
                    >
                      <td className="p-3 text-xs">{fmtDate(o.date)}</td>
                      <td className="p-3 font-mono text-xs">
                        #{String(o.orderNumber).padStart(4, "0")}
                      </td>
                      <td className="p-3 text-xs">
                        {supplierMap[o.supplierId] || "-"}
                      </td>
                      <td className="p-3 font-semibold text-right">
                        {formatCurrency(o.netPayable)}
                      </td>
                      <td className="p-3 text-center">
                        <span
                          className={`px-2 py-0.5 rounded text-xs font-semibold ${orderStatusColor(o.status)}`}
                        >
                          {copy.status[o.status]}
                        </span>
                      </td>
                      <td className="p-3 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => {
                              setDetailOrder(o);
                              setDetailChannel(activeChannel as 1 | 2);
                            }}
                            className="px-2 py-1 text-xs text-indigo-600 rounded hover:bg-indigo-50"
                          >
                            {copy.detail}
                          </button>
                          {o.status === "PENDING" && (
                            <>
                              <button
                                onClick={() => handleConfirm(o._id)}
                                className="px-2 py-1 text-xs text-white bg-indigo-600 rounded hover:bg-indigo-700"
                              >
                                {copy.confirm}
                              </button>
                              <button
                                onClick={() => handleCancel(o._id)}
                                className="px-2 py-1 text-xs text-white rounded bg-rose-600 hover:bg-rose-700"
                              >
                                {copy.cancel}
                              </button>
                            </>
                          )}
                          {o.status === "CONFIRMED" && (
                            <button
                              onClick={() => handleCancel(o._id)}
                              className="px-2 py-1 text-xs rounded text-rose-600 hover:bg-rose-50"
                            >
                              {copy.cancel}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Modals */}
      {renderDetailModal()}
      <Channel2Modal
        isOpen={showChannel2Modal}
        onClose={() => setShowChannel2Modal(false)}
        onActivated={handleChannel2Activated}
        language={currentLanguage}
      />
    </div>
  );
}

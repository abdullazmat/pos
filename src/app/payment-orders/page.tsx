"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/layout/Header";
import { useGlobalLanguage } from "@/lib/hooks/useGlobalLanguage";
import { toast } from "react-toastify";

interface Supplier {
  _id: string;
  name: string;
}

interface SupplierDocument {
  _id: string;
  supplierId: string;
  type: "INVOICE" | "DEBIT_NOTE" | "CREDIT_NOTE";
  documentNumber: string;
  pointOfSale?: string;
  date: string;
  dueDate?: string;
  totalAmount: number;
  balance: number;
  status:
    | "PENDING"
    | "DUE_SOON"
    | "OVERDUE"
    | "PARTIALLY_APPLIED"
    | "APPLIED"
    | "CANCELLED";
}

interface PaymentOrder {
  _id: string;
  orderNumber: number;
  supplierId: string;
  status: "PENDING" | "CONFIRMED" | "CANCELLED";
  documentsTotal: number;
  creditNotesTotal: number;
  paymentsTotal: number;
  netPayable: number;
  createdAt: string;
}

interface PaymentItem {
  method: "cash" | "transfer" | "mercadopago" | "check" | "card";
  reference?: string;
  amount: string;
}

const COPY = {
  es: {
    title: "Órdenes de Pago",
    subtitle: "Cuentas a pagar y pagos a proveedores",
    supplierLabel: "Proveedor",
    documentsTitle: "Documentos del proveedor",
    creditNotesTitle: "Notas de Crédito",
    paymentsTitle: "Medios de pago",
    newDocumentTitle: "Nuevo documento",
    documentType: "Tipo de documento",
    pointOfSale: "Punto de venta",
    documentNumber: "Número",
    documentDate: "Fecha",
    documentDueDate: "Vencimiento",
    documentAmount: "Importe",
    documentNotes: "Observaciones",
    createDocument: "Crear documento",
    createOrder: "Crear Orden de Pago",
    addPayment: "Agregar medio",
    removePayment: "Quitar",
    applyAmount: "Aplicar",
    balance: "Saldo",
    totalDocuments: "Total documentos",
    totalCreditNotes: "Total NC",
    totalPayments: "Total medios",
    netPayable: "Total a pagar",
    orderList: "Órdenes de Pago",
    confirm: "Confirmar",
    cancel: "Anular",
    status: {
      pending: "Pendiente",
      confirmed: "Confirmada",
      cancelled: "Anulada",
    },
    types: {
      invoice: "Factura",
      debit: "Nota Débito",
      credit: "Nota Crédito",
    },
    payments: {
      cash: "Efectivo",
      transfer: "Transferencia",
      mercadopago: "Mercado Pago",
      check: "Cheque",
      card: "Tarjeta",
      reference: "Referencia",
      amount: "Monto",
    },
    toasts: {
      loadError: "Error al cargar datos",
      docCreated: "Documento creado",
      docError: "Error al crear documento",
      orderCreated: "Orden de pago creada",
      orderError: "Error al crear orden de pago",
      confirmOk: "Orden confirmada",
      confirmError: "Error al confirmar orden",
      cancelOk: "Orden anulada",
      cancelError: "Error al anular orden",
      validationError: "Revisa los importes aplicados",
      supplierRequired: "Selecciona un proveedor",
    },
  },
  en: {
    title: "Payment Orders",
    subtitle: "Accounts payable and supplier payments",
    supplierLabel: "Supplier",
    documentsTitle: "Supplier documents",
    creditNotesTitle: "Credit notes",
    paymentsTitle: "Payment methods",
    newDocumentTitle: "New document",
    documentType: "Document type",
    pointOfSale: "Point of sale",
    documentNumber: "Number",
    documentDate: "Date",
    documentDueDate: "Due date",
    documentAmount: "Amount",
    documentNotes: "Notes",
    createDocument: "Create document",
    createOrder: "Create Payment Order",
    addPayment: "Add method",
    removePayment: "Remove",
    applyAmount: "Apply",
    balance: "Balance",
    totalDocuments: "Documents total",
    totalCreditNotes: "Credit notes total",
    totalPayments: "Payments total",
    netPayable: "Net payable",
    orderList: "Payment Orders",
    confirm: "Confirm",
    cancel: "Cancel",
    status: {
      pending: "Pending",
      confirmed: "Confirmed",
      cancelled: "Cancelled",
    },
    types: {
      invoice: "Invoice",
      debit: "Debit note",
      credit: "Credit note",
    },
    payments: {
      cash: "Cash",
      transfer: "Bank transfer",
      mercadopago: "Mercado Pago",
      check: "Check",
      card: "Card",
      reference: "Reference",
      amount: "Amount",
    },
    toasts: {
      loadError: "Error loading data",
      docCreated: "Document created",
      docError: "Error creating document",
      orderCreated: "Payment order created",
      orderError: "Error creating payment order",
      confirmOk: "Payment order confirmed",
      confirmError: "Error confirming payment order",
      cancelOk: "Payment order cancelled",
      cancelError: "Error cancelling payment order",
      validationError: "Check applied amounts",
      supplierRequired: "Select a supplier",
    },
  },
  pt: {
    title: "Ordens de Pagamento",
    subtitle: "Contas a pagar e pagamentos a fornecedores",
    supplierLabel: "Fornecedor",
    documentsTitle: "Documentos do fornecedor",
    creditNotesTitle: "Notas de crédito",
    paymentsTitle: "Meios de pagamento",
    newDocumentTitle: "Novo documento",
    documentType: "Tipo de documento",
    pointOfSale: "Ponto de venda",
    documentNumber: "Número",
    documentDate: "Data",
    documentDueDate: "Vencimento",
    documentAmount: "Valor",
    documentNotes: "Observações",
    createDocument: "Criar documento",
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
    status: {
      pending: "Pendente",
      confirmed: "Confirmada",
      cancelled: "Cancelada",
    },
    types: {
      invoice: "Fatura",
      debit: "Nota de débito",
      credit: "Nota de crédito",
    },
    payments: {
      cash: "Dinheiro",
      transfer: "Transferência",
      mercadopago: "Mercado Pago",
      check: "Cheque",
      card: "Cartão",
      reference: "Referência",
      amount: "Valor",
    },
    toasts: {
      loadError: "Erro ao carregar dados",
      docCreated: "Documento criado",
      docError: "Erro ao criar documento",
      orderCreated: "Ordem de pagamento criada",
      orderError: "Erro ao criar ordem de pagamento",
      confirmOk: "Ordem confirmada",
      confirmError: "Erro ao confirmar ordem",
      cancelOk: "Ordem cancelada",
      cancelError: "Erro ao cancelar ordem",
      validationError: "Verifique os valores aplicados",
      supplierRequired: "Selecione um fornecedor",
    },
  },
} as const;

const PAYMENT_METHODS: PaymentItem[] = [{ method: "cash", amount: "" }];

export default function PaymentOrdersPage() {
  const router = useRouter();
  const { currentLanguage } = useGlobalLanguage();
  const copy = COPY[currentLanguage as keyof typeof COPY] || COPY.es;

  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [supplierId, setSupplierId] = useState("");
  const [documents, setDocuments] = useState<SupplierDocument[]>([]);
  const [creditNotes, setCreditNotes] = useState<SupplierDocument[]>([]);
  const [paymentOrders, setPaymentOrders] = useState<PaymentOrder[]>([]);

  const [docForm, setDocForm] = useState({
    type: "INVOICE",
    pointOfSale: "",
    documentNumber: "",
    date: "",
    dueDate: "",
    totalAmount: "",
    notes: "",
  });

  const [applyAmounts, setApplyAmounts] = useState<Record<string, string>>({});
  const [applyCreditAmounts, setApplyCreditAmounts] = useState<
    Record<string, string>
  >({});
  const [payments, setPayments] = useState<PaymentItem[]>(PAYMENT_METHODS);

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
      minimumFractionDigits: 2,
    }).format(value);

  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (!userStr) {
      router.push("/auth/login");
      return;
    }
    setUser(JSON.parse(userStr));
    loadInitial();
  }, [router]);

  useEffect(() => {
    if (supplierId) {
      loadSupplierDocs(supplierId);
      loadPaymentOrders(supplierId);
    }
  }, [supplierId]);

  const loadInitial = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      const response = await fetch("/api/suppliers", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      setSuppliers(data?.data?.suppliers || []);
    } catch (error) {
      console.error("Load suppliers error:", error);
      toast.error(copy.toasts.loadError);
    } finally {
      setLoading(false);
    }
  };

  const loadSupplierDocs = async (id: string) => {
    try {
      const token = localStorage.getItem("accessToken");
      const response = await fetch(`/api/supplier-documents?supplierId=${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      const allDocs: SupplierDocument[] = data?.documents || [];
      const availableDocs = allDocs.filter(
        (doc) => doc.balance > 0 && doc.status !== "CANCELLED",
      );
      setDocuments(availableDocs.filter((doc) => doc.type !== "CREDIT_NOTE"));
      setCreditNotes(availableDocs.filter((doc) => doc.type === "CREDIT_NOTE"));
    } catch (error) {
      console.error("Load supplier docs error:", error);
      toast.error(copy.toasts.loadError);
    }
  };

  const loadPaymentOrders = async (id?: string) => {
    try {
      const token = localStorage.getItem("accessToken");
      const url = id
        ? `/api/payment-orders?supplierId=${id}`
        : "/api/payment-orders";
      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      setPaymentOrders(data?.paymentOrders || []);
    } catch (error) {
      console.error("Load payment orders error:", error);
      toast.error(copy.toasts.loadError);
    }
  };

  const handleCreateDocument = async () => {
    if (!supplierId) {
      toast.error(copy.toasts.supplierRequired);
      return;
    }
    if (docForm.type !== "CREDIT_NOTE" && !docForm.dueDate) {
      toast.error(copy.toasts.validationError);
      return;
    }
    if (!docForm.totalAmount || Number(docForm.totalAmount) <= 0) {
      toast.error(copy.toasts.validationError);
      return;
    }
    try {
      const token = localStorage.getItem("accessToken");
      const response = await fetch("/api/supplier-documents", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          supplierId,
          type: docForm.type,
          pointOfSale: docForm.pointOfSale || undefined,
          documentNumber: docForm.documentNumber,
          date: docForm.date || undefined,
          dueDate: docForm.dueDate || undefined,
          totalAmount: Number(docForm.totalAmount || 0),
          notes: docForm.notes || undefined,
        }),
      });
      if (!response.ok) {
        const data = await response.json();
        toast.error(data?.error || copy.toasts.docError);
        return;
      }
      toast.success(copy.toasts.docCreated);
      setDocForm({
        type: "INVOICE",
        pointOfSale: "",
        documentNumber: "",
        date: "",
        dueDate: "",
        totalAmount: "",
        notes: "",
      });
      loadSupplierDocs(supplierId);
    } catch (error) {
      console.error("Create supplier document error:", error);
      toast.error(copy.toasts.docError);
    }
  };

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

  const handleCreatePaymentOrder = async () => {
    if (!supplierId) {
      toast.error(copy.toasts.supplierRequired);
      return;
    }
    const documentsPayload = documents
      .map((doc) => ({
        documentId: doc._id,
        applyAmount: Number(applyAmounts[doc._id] || 0),
      }))
      .filter((d) => d.applyAmount > 0);

    const creditNotesPayload = creditNotes
      .map((doc) => ({
        documentId: doc._id,
        applyAmount: Number(applyCreditAmounts[doc._id] || 0),
      }))
      .filter((d) => d.applyAmount > 0);

    if (documentsPayload.length === 0) {
      toast.error(copy.toasts.validationError);
      return;
    }

    if (Math.abs(totals.netPayable - totals.paymentsTotal) > 0.01) {
      toast.error(copy.toasts.validationError);
      return;
    }

    try {
      const token = localStorage.getItem("accessToken");
      const response = await fetch("/api/payment-orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          supplierId,
          documents: documentsPayload,
          creditNotes: creditNotesPayload,
          payments: payments.map((p) => ({
            method: p.method,
            reference: p.reference || undefined,
            amount: Number(p.amount || 0),
          })),
        }),
      });
      if (!response.ok) {
        const data = await response.json();
        toast.error(data?.error || copy.toasts.orderError);
        return;
      }
      toast.success(copy.toasts.orderCreated);
      setApplyAmounts({});
      setApplyCreditAmounts({});
      setPayments(PAYMENT_METHODS);
      loadSupplierDocs(supplierId);
      loadPaymentOrders(supplierId);
    } catch (error) {
      console.error("Create payment order error:", error);
      toast.error(copy.toasts.orderError);
    }
  };

  const handleConfirm = async (id: string) => {
    try {
      const token = localStorage.getItem("accessToken");
      const response = await fetch(`/api/payment-orders/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ action: "confirm" }),
      });
      if (!response.ok) {
        const data = await response.json();
        toast.error(data?.error || copy.toasts.confirmError);
        return;
      }
      toast.success(copy.toasts.confirmOk);
      loadPaymentOrders(supplierId);
      loadSupplierDocs(supplierId);
    } catch (error) {
      console.error("Confirm payment order error:", error);
      toast.error(copy.toasts.confirmError);
    }
  };

  const handleCancel = async (id: string) => {
    try {
      const token = localStorage.getItem("accessToken");
      const response = await fetch(`/api/payment-orders/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ action: "cancel" }),
      });
      if (!response.ok) {
        const data = await response.json();
        toast.error(data?.error || copy.toasts.cancelError);
        return;
      }
      toast.success(copy.toasts.cancelOk);
      loadPaymentOrders(supplierId);
    } catch (error) {
      console.error("Cancel payment order error:", error);
      toast.error(copy.toasts.cancelError);
    }
  };

  const addPayment = () => {
    setPayments((prev) => [...prev, { method: "cash", amount: "" }]);
  };

  const updatePayment = (index: number, patch: Partial<PaymentItem>) => {
    setPayments((prev) =>
      prev.map((item, i) => (i === index ? { ...item, ...patch } : item)),
    );
  };

  const removePayment = (index: number) => {
    setPayments((prev) => prev.filter((_, i) => i !== index));
  };

  if (loading) {
    return (
      <div className="vp-page flex items-center justify-center">
        <div className="vp-card px-6 py-4 text-[hsl(var(--vp-muted))] vp-fade-in">
          Loading...
        </div>
      </div>
    );
  }

  return (
    <div className="vp-page">
      <Header user={user} showBackButton={true} />

      <main className="vp-page-inner">
        <div className="mb-6">
          <h1 className="vp-section-title">{copy.title}</h1>
          <p className="vp-section-subtitle">{copy.subtitle}</p>
        </div>

        <div className="vp-card p-6 mb-6">
          <label className="block text-xs font-semibold text-[hsl(var(--vp-muted))] mb-2">
            {copy.supplierLabel}
          </label>
          <select
            value={supplierId}
            onChange={(e) => setSupplierId(e.target.value)}
            className="w-full text-sm"
          >
            <option value="">--</option>
            {suppliers.map((supplier) => (
              <option key={supplier._id} value={supplier._id}>
                {supplier.name}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <div className="vp-card p-6">
            <h2 className="text-xl font-semibold mb-4 text-[hsl(var(--vp-text))]">
              {copy.newDocumentTitle}
            </h2>
            <div className="space-y-3">
              <select
                value={docForm.type}
                onChange={(e) =>
                  setDocForm((prev) => ({ ...prev, type: e.target.value }))
                }
                className="w-full text-sm"
              >
                <option value="INVOICE">{copy.types.invoice}</option>
                <option value="DEBIT_NOTE">{copy.types.debit}</option>
                <option value="CREDIT_NOTE">{copy.types.credit}</option>
              </select>
              <input
                className="w-full text-sm"
                placeholder={copy.pointOfSale}
                value={docForm.pointOfSale}
                onChange={(e) =>
                  setDocForm((prev) => ({
                    ...prev,
                    pointOfSale: e.target.value,
                  }))
                }
              />
              <input
                className="w-full text-sm"
                placeholder={copy.documentNumber}
                value={docForm.documentNumber}
                onChange={(e) =>
                  setDocForm((prev) => ({
                    ...prev,
                    documentNumber: e.target.value,
                  }))
                }
              />
              <input
                type="date"
                className="w-full text-sm"
                value={docForm.date}
                onChange={(e) =>
                  setDocForm((prev) => ({ ...prev, date: e.target.value }))
                }
              />
              {docForm.type !== "CREDIT_NOTE" && (
                <input
                  type="date"
                  className="w-full text-sm"
                  placeholder={copy.documentDueDate}
                  value={docForm.dueDate}
                  onChange={(e) =>
                    setDocForm((prev) => ({
                      ...prev,
                      dueDate: e.target.value,
                    }))
                  }
                />
              )}
              <input
                className="w-full text-sm"
                placeholder={copy.documentAmount}
                value={docForm.totalAmount}
                onChange={(e) =>
                  setDocForm((prev) => ({
                    ...prev,
                    totalAmount: e.target.value,
                  }))
                }
              />
              <input
                className="w-full text-sm"
                placeholder={copy.documentNotes}
                value={docForm.notes}
                onChange={(e) =>
                  setDocForm((prev) => ({ ...prev, notes: e.target.value }))
                }
              />
              <button
                className="w-full vp-button vp-button-primary"
                onClick={handleCreateDocument}
              >
                {copy.createDocument}
              </button>
            </div>
          </div>

          <div className="vp-card p-6">
            <h2 className="text-xl font-semibold mb-4 text-[hsl(var(--vp-text))]">
              {copy.paymentsTitle}
            </h2>
            <div className="space-y-3">
              {payments.map((payment, index) => (
                <div
                  key={index}
                  className="grid grid-cols-1 md:grid-cols-4 gap-2"
                >
                  <select
                    className="border rounded-lg px-2 py-2"
                    value={payment.method}
                    onChange={(e) =>
                      updatePayment(index, {
                        method: e.target.value as PaymentItem["method"],
                      })
                    }
                  >
                    <option value="cash">{copy.payments.cash}</option>
                    <option value="transfer">{copy.payments.transfer}</option>
                    <option value="mercadopago">
                      {copy.payments.mercadopago}
                    </option>
                    <option value="check">{copy.payments.check}</option>
                    <option value="card">{copy.payments.card}</option>
                  </select>
                  <input
                    className="border rounded-lg px-2 py-2"
                    placeholder={copy.payments.reference}
                    value={payment.reference || ""}
                    onChange={(e) =>
                      updatePayment(index, { reference: e.target.value })
                    }
                  />
                  <input
                    className="border rounded-lg px-2 py-2"
                    placeholder={copy.payments.amount}
                    value={payment.amount}
                    onChange={(e) =>
                      updatePayment(index, { amount: e.target.value })
                    }
                  />
                  <button
                    className="text-sm text-red-600 hover:text-red-700"
                    onClick={() => removePayment(index)}
                  >
                    {copy.removePayment}
                  </button>
                </div>
              ))}
            </div>
            <button
              className="mt-3 text-indigo-600 hover:text-indigo-700 text-sm"
              onClick={addPayment}
            >
              + {copy.addPayment}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <div className="bg-white dark:bg-slate-900 rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">
              {copy.documentsTitle}
            </h2>
            <div className="space-y-2">
              {documents.map((doc) => (
                <div
                  key={doc._id}
                  className="flex items-center justify-between gap-3 text-sm"
                >
                  <div>
                    {doc.documentNumber} · {formatCurrency(doc.balance)}
                  </div>
                  <input
                    className="border rounded-lg px-2 py-1 w-32"
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
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">
              {copy.creditNotesTitle}
            </h2>
            <div className="space-y-2">
              {creditNotes.map((doc) => (
                <div
                  key={doc._id}
                  className="flex items-center justify-between gap-3 text-sm"
                >
                  <div>
                    {doc.documentNumber} · {formatCurrency(doc.balance)}
                  </div>
                  <input
                    className="border rounded-lg px-2 py-1 w-32"
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
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-lg shadow p-6 mb-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              {copy.totalDocuments}: {formatCurrency(totals.documentsTotal)}
            </div>
            <div>
              {copy.totalCreditNotes}: {formatCurrency(totals.creditNotesTotal)}
            </div>
            <div>
              {copy.totalPayments}: {formatCurrency(totals.paymentsTotal)}
            </div>
            <div>
              {copy.netPayable}: {formatCurrency(totals.netPayable)}
            </div>
          </div>
          <button
            className="mt-4 w-full bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg"
            onClick={handleCreatePaymentOrder}
          >
            {copy.createOrder}
          </button>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">{copy.orderList}</h2>
          <div className="space-y-3">
            {paymentOrders.map((order) => (
              <div
                key={order._id}
                className="flex items-center justify-between border rounded-lg p-3 text-sm"
              >
                <div>
                  #{order.orderNumber} · {formatCurrency(order.netPayable)} ·{" "}
                  {order.status === "PENDING"
                    ? copy.status.pending
                    : order.status === "CONFIRMED"
                      ? copy.status.confirmed
                      : copy.status.cancelled}
                </div>
                <div className="flex gap-2">
                  {order.status === "PENDING" && (
                    <>
                      <button
                        className="px-3 py-1 text-white bg-indigo-600 rounded"
                        onClick={() => handleConfirm(order._id)}
                      >
                        {copy.confirm}
                      </button>
                      <button
                        className="px-3 py-1 text-white bg-rose-600 rounded"
                        onClick={() => handleCancel(order._id)}
                      >
                        {copy.cancel}
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}

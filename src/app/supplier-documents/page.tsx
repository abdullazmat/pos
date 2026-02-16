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
}

interface Attachment {
  fileName: string;
  fileUrl: string;
  mimeType: string;
  fileSize: number;
  uploadedAt?: string;
}

type DocType =
  | "INVOICE"
  | "INVOICE_A"
  | "INVOICE_B"
  | "INVOICE_C"
  | "DEBIT_NOTE"
  | "CREDIT_NOTE"
  | "FISCAL_DELIVERY_NOTE";

type DocStatus =
  | "PENDING"
  | "DUE_SOON"
  | "OVERDUE"
  | "PARTIALLY_APPLIED"
  | "APPLIED"
  | "CANCELLED";

interface SupplierDocument {
  _id: string;
  supplierId: string;
  channel: 1 | 2;
  type: DocType;
  pointOfSale?: string;
  documentNumber: string;
  date: string;
  dueDate?: string;
  totalAmount: number;
  balance: number;
  appliedPaymentsTotal?: number;
  appliedCreditsTotal?: number;
  status: DocStatus;
  impactsStock?: boolean;
  impactsCosts?: boolean;
  notes?: string;
  attachments?: Attachment[];
}

/* ─────────────────  i18n  ───────────────── */

const COPY = {
  es: {
    title: "Documentos de Proveedor",
    subtitle: "Carga y seguimiento de comprobantes fiscales e internos",
    supplierLabel: "Proveedor",
    newDocument: "Nuevo documento",
    editDocument: "Editar documento",
    documentType: "Tipo de documento",
    pointOfSale: "Punto de venta",
    documentNumber: "Número de comprobante",
    issueDate: "Fecha de emisión",
    dueDate: "Vencimiento",
    amount: "Importe",
    notes: "Notas",
    attachFile: "Adjuntar PDF o imagen",
    save: "Guardar",
    edit: "Editar",
    cancel: "Cancelar",
    applyCredit: "Aplicar NC",
    selectTarget: "Documento destino",
    applyAmount: "Importe a aplicar",
    apply: "Aplicar",
    listTitle: "Documentos",
    status: "Estado",
    balance: "Saldo",
    alertsTitle: "Alertas de vencimiento",
    dueSoon: "Por vencer",
    overdue: "Vencidos",
    noDocuments: "No hay documentos cargados",
    channel1Label: "Canal 1 – Legal / Fiscal",
    channel2Label: "Canal 2 – Interno / Gestión",
    channel1Short: "Fiscal",
    channel2Short: "Interno",
    activateChannel2: "Activar Modo Interno",
    impactsStock: "Impacta stock",
    impactsCosts: "Impacta costos",
    channelTag: "Canal",
    exportAccountant: "Exportar para contador",
    totalDocs: "Total documentos",
    totalAmount: "Monto total",
    pendingBalance: "Saldo pendiente",
    toasts: {
      loadError: "Error al cargar datos",
      created: "Documento creado",
      updated: "Documento actualizado",
      cancelled: "Documento cancelado",
      uploadError: "Error al subir archivo",
      applyOk: "Nota de crédito aplicada",
      applyError: "Error al aplicar NC",
      supplierRequired: "Selecciona un proveedor",
      dueDateRequired: "El vencimiento es obligatorio",
      amountRequired: "Ingresa un importe válido",
      docNumberRequired: "El número de comprobante es obligatorio",
      creditSelectionRequired: "Selecciona NC y destino",
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
    statusLabels: {
      PENDING: "Pendiente",
      DUE_SOON: "Por vencer",
      OVERDUE: "Vencido",
      PARTIALLY_APPLIED: "Parcial",
      APPLIED: "Aplicado",
      CANCELLED: "Cancelado",
    },
  },
  en: {
    title: "Supplier Documents",
    subtitle: "Load and track fiscal and internal documents",
    supplierLabel: "Supplier",
    newDocument: "New document",
    editDocument: "Edit document",
    documentType: "Document type",
    pointOfSale: "Point of sale",
    documentNumber: "Document number",
    issueDate: "Issue date",
    dueDate: "Due date",
    amount: "Amount",
    notes: "Notes",
    attachFile: "Attach PDF or image",
    save: "Save",
    edit: "Edit",
    cancel: "Cancel",
    applyCredit: "Apply CN",
    selectTarget: "Target document",
    applyAmount: "Apply amount",
    apply: "Apply",
    listTitle: "Documents",
    status: "Status",
    balance: "Balance",
    alertsTitle: "Due date alerts",
    dueSoon: "Due soon",
    overdue: "Overdue",
    noDocuments: "No documents loaded",
    channel1Label: "Channel 1 – Legal / Fiscal",
    channel2Label: "Channel 2 – Internal / Management",
    channel1Short: "Fiscal",
    channel2Short: "Internal",
    activateChannel2: "Activate Internal Mode",
    impactsStock: "Impacts stock",
    impactsCosts: "Impacts costs",
    channelTag: "Channel",
    exportAccountant: "Export for accountant",
    totalDocs: "Total documents",
    totalAmount: "Total amount",
    pendingBalance: "Pending balance",
    toasts: {
      loadError: "Error loading data",
      created: "Document created",
      updated: "Document updated",
      cancelled: "Document cancelled",
      uploadError: "File upload failed",
      applyOk: "Credit note applied",
      applyError: "Failed to apply credit note",
      supplierRequired: "Select a supplier",
      dueDateRequired: "Due date is required",
      amountRequired: "Enter a valid amount",
      docNumberRequired: "Document number is required",
      creditSelectionRequired: "Select a credit note and target",
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
    statusLabels: {
      PENDING: "Pending",
      DUE_SOON: "Due Soon",
      OVERDUE: "Overdue",
      PARTIALLY_APPLIED: "Partial",
      APPLIED: "Applied",
      CANCELLED: "Cancelled",
    },
  },
  pt: {
    title: "Documentos do Fornecedor",
    subtitle: "Carregue e acompanhe documentos fiscais e internos",
    supplierLabel: "Fornecedor",
    newDocument: "Novo documento",
    editDocument: "Editar documento",
    documentType: "Tipo de documento",
    pointOfSale: "Ponto de venda",
    documentNumber: "Número do documento",
    issueDate: "Data de emissão",
    dueDate: "Vencimento",
    amount: "Valor",
    notes: "Notas",
    attachFile: "Anexar PDF ou imagem",
    save: "Salvar",
    edit: "Editar",
    cancel: "Cancelar",
    applyCredit: "Aplicar NC",
    selectTarget: "Documento destino",
    applyAmount: "Valor a aplicar",
    apply: "Aplicar",
    listTitle: "Documentos",
    status: "Status",
    balance: "Saldo",
    alertsTitle: "Alertas de vencimento",
    dueSoon: "A vencer",
    overdue: "Vencidos",
    noDocuments: "Nenhum documento carregado",
    channel1Label: "Canal 1 – Legal / Fiscal",
    channel2Label: "Canal 2 – Interno / Gestão",
    channel1Short: "Fiscal",
    channel2Short: "Interno",
    activateChannel2: "Ativar Modo Interno",
    impactsStock: "Impacta estoque",
    impactsCosts: "Impacta custos",
    channelTag: "Canal",
    exportAccountant: "Exportar para contador",
    totalDocs: "Total documentos",
    totalAmount: "Valor total",
    pendingBalance: "Saldo pendente",
    toasts: {
      loadError: "Erro ao carregar dados",
      created: "Documento criado",
      updated: "Documento atualizado",
      cancelled: "Documento cancelado",
      uploadError: "Erro ao subir arquivo",
      applyOk: "Nota de crédito aplicada",
      applyError: "Erro ao aplicar NC",
      supplierRequired: "Selecione um fornecedor",
      dueDateRequired: "O vencimento é obrigatório",
      amountRequired: "Informe um valor válido",
      docNumberRequired: "O número do documento é obrigatório",
      creditSelectionRequired: "Selecione uma NC e destino",
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
    statusLabels: {
      PENDING: "Pendente",
      DUE_SOON: "A vencer",
      OVERDUE: "Vencido",
      PARTIALLY_APPLIED: "Parcial",
      APPLIED: "Aplicado",
      CANCELLED: "Cancelado",
    },
  },
} as const;

type Lang = keyof typeof COPY;

/* ─── Doc type options per channel ─── */
const CHANNEL1_DOC_TYPES: DocType[] = [
  "INVOICE_A",
  "INVOICE_B",
  "INVOICE_C",
  "DEBIT_NOTE",
  "CREDIT_NOTE",
  "FISCAL_DELIVERY_NOTE",
];
const CHANNEL2_DOC_TYPES: DocType[] = ["INVOICE", "DEBIT_NOTE", "CREDIT_NOTE"];

/* ─── Status badge colors ─── */
const statusClassMap: Record<DocStatus, string> = {
  PENDING: "bg-slate-100 text-slate-700",
  DUE_SOON: "bg-amber-100 text-amber-700",
  OVERDUE: "bg-rose-100 text-rose-700",
  PARTIALLY_APPLIED: "bg-blue-100 text-blue-700",
  APPLIED: "bg-emerald-100 text-emerald-700",
  CANCELLED: "bg-slate-200 text-slate-500",
};

/* ══════════════════════════════════════════
   PAGE COMPONENT
   ══════════════════════════════════════════ */

export default function SupplierDocumentsPage() {
  const router = useRouter();
  const { currentLanguage } = useGlobalLanguage();
  const copy = COPY[currentLanguage as Lang] || COPY.es;

  /* ── Auth / user ── */
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  /* ── Channel 2 state ── */
  const [channel2Active, setChannel2Active] = useState(false);
  const [channel2Expires, setChannel2Expires] = useState<string>("");
  const [showChannel2Modal, setShowChannel2Modal] = useState(false);

  /* Active channel for viewing / creating */
  const activeChannel: 1 | 2 = channel2Active ? 2 : 1;

  /* ── Data ── */
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [supplierId, setSupplierId] = useState("");
  const [documents, setDocuments] = useState<SupplierDocument[]>([]);
  const [alerts, setAlerts] = useState<{ dueSoon: number; overdue: number }>({
    dueSoon: 0,
    overdue: 0,
  });

  /* ── Form ── */
  const [formState, setFormState] = useState({
    documentId: "",
    type: "INVOICE_A" as string,
    pointOfSale: "",
    documentNumber: "",
    date: "",
    dueDate: "",
    totalAmount: "",
    notes: "",
    impactsStock: false,
    impactsCosts: false,
  });
  const [attachments, setAttachments] = useState<Attachment[]>([]);

  /* ── Apply credit modal ── */
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [selectedCreditNote, setSelectedCreditNote] =
    useState<SupplierDocument | null>(null);
  const [targetDocumentId, setTargetDocumentId] = useState("");
  const [applyAmount, setApplyAmount] = useState("");

  /* ─────────────────  Init  ───────────────── */

  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (!userStr) {
      router.push("/auth/login");
      return;
    }
    setUser(JSON.parse(userStr));
    void loadSuppliers();
    void loadAlerts();
    setLoading(false);
  }, [router]);

  /* When supplier or active channel changes, reload documents */
  useEffect(() => {
    if (supplierId) {
      void loadDocuments(supplierId);
    } else {
      setDocuments([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [supplierId, activeChannel]);

  /* When switching channels, reset form to correct default type */
  useEffect(() => {
    resetForm();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeChannel]);

  /* ══════════  F2 Key Handler  ══════════ */
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input/textarea/select
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;

      if (e.key === "F2") {
        e.preventDefault();
        if (channel2Active) {
          // Deactivate channel 2
          setChannel2Active(false);
          setChannel2Expires("");
          apiFetch("/api/channel2-auth", {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ reason: "manual" }),
          }).catch(() => {});
        } else {
          // Open activation modal
          setShowChannel2Modal(true);
        }
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [channel2Active]);

  /* ─────────────────  Data Loaders  ───────────────── */

  const loadSuppliers = async () => {
    try {
      const res = await apiFetch("/api/suppliers");
      const data = await res.json();
      setSuppliers(data?.suppliers || []);
    } catch {
      toast.error(copy.toasts.loadError);
    }
  };

  const loadDocuments = async (id: string) => {
    try {
      const channelParam = activeChannel === 2 ? "&channel=2" : "";
      const res = await apiFetch(
        `/api/supplier-documents?supplierId=${id}${channelParam}`,
      );
      const data = await res.json();
      setDocuments(data?.documents || []);
    } catch {
      toast.error(copy.toasts.loadError);
    }
  };

  const loadAlerts = async () => {
    try {
      const res = await apiFetch("/api/supplier-documents?alerts=true");
      const data = await res.json();
      setAlerts({
        dueSoon: data?.alerts?.dueSoon || 0,
        overdue: data?.alerts?.overdue || 0,
      });
    } catch {
      // silent
    }
  };

  /* ─────────────────  Form Logic  ───────────────── */

  const resetForm = () => {
    setFormState({
      documentId: "",
      type: activeChannel === 1 ? "INVOICE_A" : "INVOICE",
      pointOfSale: "",
      documentNumber: "",
      date: "",
      dueDate: "",
      totalAmount: "",
      notes: "",
      impactsStock: false,
      impactsCosts: false,
    });
    setAttachments([]);
  };

  const handleUploadAttachment = async (file: File) => {
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await apiFetch("/api/supplier-documents/upload", {
        method: "POST",
        body: formData,
      });
      if (!res.ok) throw new Error(copy.toasts.uploadError);
      const data = await res.json();
      setAttachments((prev) => [...prev, data]);
    } catch {
      toast.error(copy.toasts.uploadError);
    }
  };

  const handleSaveDocument = async () => {
    if (!supplierId) {
      toast.error(copy.toasts.supplierRequired);
      return;
    }
    if (!formState.documentNumber.trim()) {
      toast.error(copy.toasts.docNumberRequired);
      return;
    }
    if (
      formState.type !== "CREDIT_NOTE" &&
      formState.type !== "FISCAL_DELIVERY_NOTE" &&
      !formState.dueDate
    ) {
      toast.error(copy.toasts.dueDateRequired);
      return;
    }
    if (!formState.totalAmount || Number(formState.totalAmount) <= 0) {
      toast.error(copy.toasts.amountRequired);
      return;
    }

    const payload: Record<string, unknown> = {
      supplierId,
      channel: activeChannel,
      type: formState.type,
      pointOfSale: formState.pointOfSale || undefined,
      documentNumber: formState.documentNumber,
      date: formState.date || undefined,
      dueDate: formState.dueDate || undefined,
      totalAmount: Number(formState.totalAmount || 0),
      notes: formState.notes || undefined,
      attachments,
    };

    if (activeChannel === 2) {
      payload.impactsStock = formState.impactsStock;
      payload.impactsCosts = formState.impactsCosts;
    }

    try {
      if (formState.documentId) {
        // For PUT, only send editable fields (exclude immutable supplierId/channel)
        const updatePayload: Record<string, unknown> = {
          type: formState.type,
          pointOfSale: formState.pointOfSale || undefined,
          documentNumber: formState.documentNumber,
          date: formState.date || undefined,
          dueDate: formState.dueDate || undefined,
          totalAmount: Number(formState.totalAmount || 0),
          notes: formState.notes || undefined,
          attachments,
        };
        if (activeChannel === 2) {
          updatePayload.impactsStock = formState.impactsStock;
          updatePayload.impactsCosts = formState.impactsCosts;
        }
        const res = await apiFetch(
          `/api/supplier-documents/${formState.documentId}`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ updates: updatePayload }),
          },
        );
        if (!res.ok) {
          const data = await res.json();
          throw new Error(data?.error || copy.toasts.loadError);
        }
        toast.success(copy.toasts.updated);
      } else {
        const res = await apiFetch("/api/supplier-documents", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) {
          const data = await res.json();
          throw new Error(data?.error || copy.toasts.loadError);
        }
        toast.success(copy.toasts.created);
      }

      resetForm();
      await loadDocuments(supplierId);
      await loadAlerts();
    } catch (err: any) {
      toast.error(err?.message || copy.toasts.loadError);
    }
  };

  const handleEditDocument = (doc: SupplierDocument) => {
    setFormState({
      documentId: doc._id,
      type: doc.type,
      pointOfSale: doc.pointOfSale || "",
      documentNumber: doc.documentNumber,
      date: doc.date ? doc.date.slice(0, 10) : "",
      dueDate: doc.dueDate ? doc.dueDate.slice(0, 10) : "",
      totalAmount: String(doc.totalAmount),
      notes: doc.notes || "",
      impactsStock: doc.impactsStock ?? false,
      impactsCosts: doc.impactsCosts ?? false,
    });
    setAttachments(doc.attachments || []);
  };

  const handleCancelDocument = async (doc: SupplierDocument) => {
    try {
      const res = await apiFetch(`/api/supplier-documents/${doc._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "cancel" }),
      });
      if (!res.ok) throw new Error(copy.toasts.loadError);
      toast.success(copy.toasts.cancelled);
      await loadDocuments(supplierId);
      await loadAlerts();
    } catch {
      toast.error(copy.toasts.loadError);
    }
  };

  /* ── Apply credit ── */
  const availableTargets = useMemo(
    () =>
      documents.filter(
        (doc) =>
          doc.type !== "CREDIT_NOTE" &&
          doc.balance > 0 &&
          doc.status !== "CANCELLED",
      ),
    [documents],
  );

  const handleApplyCredit = async () => {
    if (!selectedCreditNote || !targetDocumentId || !applyAmount) {
      toast.error(copy.toasts.creditSelectionRequired);
      return;
    }
    if (Number(applyAmount) <= 0) {
      toast.error(copy.toasts.amountRequired);
      return;
    }
    try {
      const res = await apiFetch("/api/supplier-documents/apply-credit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          creditNoteId: selectedCreditNote._id,
          targetDocumentId,
          amount: Number(applyAmount),
        }),
      });
      if (!res.ok) throw new Error(copy.toasts.applyError);
      toast.success(copy.toasts.applyOk);
      setShowApplyModal(false);
      setSelectedCreditNote(null);
      setTargetDocumentId("");
      setApplyAmount("");
      await loadDocuments(supplierId);
      await loadAlerts();
    } catch {
      toast.error(copy.toasts.applyError);
    }
  };

  /* ── Channel 2 handling ── */

  // Restore Channel 2 session from sessionStorage on mount
  useEffect(() => {
    try {
      const stored = sessionStorage.getItem("channel2Session");
      if (stored) {
        const { expiresAt } = JSON.parse(stored);
        if (expiresAt && new Date(expiresAt) > new Date()) {
          setChannel2Active(true);
          setChannel2Expires(expiresAt);
        } else {
          sessionStorage.removeItem("channel2Session");
        }
      }
    } catch {}
  }, []);

  const handleChannel2Activated = useCallback((expiresAt: string) => {
    setChannel2Active(true);
    setChannel2Expires(expiresAt);
    try {
      sessionStorage.setItem("channel2Session", JSON.stringify({ expiresAt }));
    } catch {}
  }, []);

  const handleChannel2Deactivate = useCallback(async () => {
    try {
      await apiFetch("/api/channel2-auth", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: "manual" }),
      });
    } catch {
      // silent
    }
    setChannel2Active(false);
    setChannel2Expires("");
    try {
      sessionStorage.removeItem("channel2Session");
    } catch {}
  }, []);

  /* ── Export Channel 1 for accountant ── */
  const handleExportAccountant = useCallback(() => {
    if (documents.length === 0) return;
    const ch1Docs = documents.filter((d) => (d.channel || 1) === 1);
    const headers = [
      "Tipo",
      "PV",
      "Numero",
      "Fecha",
      "Vencimiento",
      "Importe",
      "Saldo",
      "Estado",
    ];
    const rows = ch1Docs.map((d) => [
      d.type,
      d.pointOfSale || "",
      d.documentNumber,
      d.date?.slice(0, 10) || "",
      d.dueDate?.slice(0, 10) || "",
      String(d.totalAmount),
      String(d.balance),
      d.status,
    ]);
    const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `supplier_docs_fiscal_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }, [documents]);

  /* ── Helpers ── */
  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
      minimumFractionDigits: 2,
    }).format(value || 0);

  const docTypeOptions =
    activeChannel === 1 ? CHANNEL1_DOC_TYPES : CHANNEL2_DOC_TYPES;

  /* ── Totals for summary cards ── */
  const summary = useMemo(() => {
    const active = documents.filter((d) => d.status !== "CANCELLED");
    return {
      count: active.length,
      total: active.reduce((s, d) => s + d.totalAmount, 0),
      pending: active.reduce((s, d) => s + d.balance, 0),
    };
  }, [documents]);

  if (loading) return null;

  /* ══════════════════════════════════════════
     RENDER
     ══════════════════════════════════════════ */
  return (
    <div className="vp-page">
      <Header user={user} showBackButton={true} />

      {/* Channel 2 top bar indicator */}
      {channel2Active && (
        <Channel2Bar
          expiresAt={channel2Expires}
          onDeactivate={handleChannel2Deactivate}
          language={currentLanguage}
        />
      )}

      <main className="vp-page-inner">
        {/* ── Title + Channel Toggle ── */}
        <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="vp-section-title">{copy.title}</h1>
            <p className="vp-section-subtitle">{copy.subtitle}</p>
          </div>
          <div className="flex gap-2 items-center flex-wrap">
            {/* Channel indicator pills */}
            <span
              className={`px-3 py-1.5 rounded-full text-xs font-bold transition-colors ${
                activeChannel === 1
                  ? "bg-emerald-600 text-white"
                  : "bg-slate-100 text-slate-500 cursor-pointer hover:bg-slate-200"
              }`}
              onClick={() => {
                if (channel2Active) {
                  handleChannel2Deactivate();
                }
              }}
            >
              {copy.channel1Short}
            </span>
            <span
              className={`px-3 py-1.5 rounded-full text-xs font-bold transition-colors ${
                activeChannel === 2
                  ? "bg-amber-500 text-white"
                  : "bg-slate-100 text-slate-500 cursor-pointer hover:bg-slate-200"
              }`}
              onClick={() => {
                if (!channel2Active) {
                  setShowChannel2Modal(true);
                }
              }}
            >
              {copy.channel2Short} (F2)
            </span>

            {/* Export for accountant (Channel 1 only) */}
            {activeChannel === 1 && documents.length > 0 && (
              <button
                className="vp-button vp-button-ghost text-xs"
                onClick={handleExportAccountant}
              >
                {copy.exportAccountant}
              </button>
            )}
          </div>
        </div>

        {/* ── Supplier + Alerts ── */}
        <div className="vp-card p-6 mb-6">
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <SupplierSearch
                suppliers={suppliers}
                value={supplierId}
                onChange={setSupplierId}
                label={copy.supplierLabel}
                placeholder={copy.supplierLabel + "..."}
              />
            </div>

            {/* Summary cards */}
            {supplierId && (
              <div className="md:col-span-2 grid grid-cols-3 gap-3">
                <div className="px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 text-center">
                  <div className="text-xs text-[hsl(var(--vp-muted))]">
                    {copy.totalDocs}
                  </div>
                  <div className="text-lg font-bold text-[hsl(var(--vp-text))]">
                    {summary.count}
                  </div>
                </div>
                <div className="px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 text-center">
                  <div className="text-xs text-[hsl(var(--vp-muted))]">
                    {copy.totalAmount}
                  </div>
                  <div className="text-lg font-bold text-[hsl(var(--vp-text))]">
                    {formatCurrency(summary.total)}
                  </div>
                </div>
                <div className="px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 text-center">
                  <div className="text-xs text-[hsl(var(--vp-muted))]">
                    {copy.pendingBalance}
                  </div>
                  <div className="text-lg font-bold text-amber-600 dark:text-amber-400">
                    {formatCurrency(summary.pending)}
                  </div>
                </div>
              </div>
            )}

            {/* Alerts (Channel 1 only) */}
            {activeChannel === 1 && !supplierId && (
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-[hsl(var(--vp-muted))] mb-2">
                  {copy.alertsTitle}
                </label>
                <div className="flex flex-wrap gap-3">
                  <div className="px-3 py-2 rounded-lg bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 text-sm">
                    {copy.dueSoon}: {alerts.dueSoon}
                  </div>
                  <div className="px-3 py-2 rounded-lg bg-rose-50 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300 text-sm">
                    {copy.overdue}: {alerts.overdue}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── Form + List Grid ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* ─── Document Form ─── */}
          <div className="lg:col-span-1 vp-card p-6">
            <h2 className="text-lg font-semibold mb-1 text-[hsl(var(--vp-text))]">
              {formState.documentId ? copy.editDocument : copy.newDocument}
            </h2>
            {/* Channel badge on form */}
            <div className="mb-4">
              <span
                className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  activeChannel === 1
                    ? "bg-emerald-100 text-emerald-700"
                    : "bg-amber-100 text-amber-700"
                }`}
              >
                {activeChannel === 1 ? copy.channel1Short : copy.channel2Short}
              </span>
            </div>

            <div className="space-y-3">
              {/* Document type */}
              <div>
                <label className="block text-xs text-[hsl(var(--vp-muted))] mb-1">
                  {copy.documentType}
                </label>
                <select
                  value={formState.type}
                  onChange={(e) =>
                    setFormState((prev) => ({ ...prev, type: e.target.value }))
                  }
                  className="w-full text-sm"
                >
                  {docTypeOptions.map((t) => (
                    <option key={t} value={t}>
                      {(copy.types as Record<string, string>)[t] || t}
                    </option>
                  ))}
                </select>
              </div>

              {/* Point of sale */}
              <input
                className="w-full text-sm"
                placeholder={copy.pointOfSale}
                value={formState.pointOfSale}
                onChange={(e) =>
                  setFormState((prev) => ({
                    ...prev,
                    pointOfSale: e.target.value,
                  }))
                }
              />

              {/* Document number */}
              <input
                className="w-full text-sm"
                placeholder={copy.documentNumber}
                value={formState.documentNumber}
                onChange={(e) =>
                  setFormState((prev) => ({
                    ...prev,
                    documentNumber: e.target.value,
                  }))
                }
              />

              {/* Issue date */}
              <div>
                <label className="block text-xs text-[hsl(var(--vp-muted))] mb-1">
                  {copy.issueDate}
                </label>
                <input
                  type="date"
                  className="w-full text-sm"
                  value={formState.date}
                  onChange={(e) =>
                    setFormState((prev) => ({ ...prev, date: e.target.value }))
                  }
                />
              </div>

              {/* Due date (not for credit notes / fiscal delivery notes) */}
              {formState.type !== "CREDIT_NOTE" &&
                formState.type !== "FISCAL_DELIVERY_NOTE" && (
                  <div>
                    <label className="block text-xs text-[hsl(var(--vp-muted))] mb-1">
                      {copy.dueDate}
                    </label>
                    <input
                      type="date"
                      className="w-full text-sm"
                      value={formState.dueDate}
                      onChange={(e) =>
                        setFormState((prev) => ({
                          ...prev,
                          dueDate: e.target.value,
                        }))
                      }
                    />
                  </div>
                )}

              {/* Amount */}
              <input
                className="w-full text-sm"
                placeholder={copy.amount}
                type="number"
                step="0.01"
                min="0"
                value={formState.totalAmount}
                onChange={(e) =>
                  setFormState((prev) => ({
                    ...prev,
                    totalAmount: e.target.value,
                  }))
                }
              />

              {/* Channel 2: configurable impacts */}
              {activeChannel === 2 && (
                <div className="flex flex-col gap-2 p-3 rounded-lg bg-amber-50 border border-amber-200">
                  <label className="flex items-center gap-2 text-sm cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formState.impactsStock}
                      onChange={(e) =>
                        setFormState((prev) => ({
                          ...prev,
                          impactsStock: e.target.checked,
                        }))
                      }
                      className="rounded"
                    />
                    {copy.impactsStock}
                  </label>
                  <label className="flex items-center gap-2 text-sm cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formState.impactsCosts}
                      onChange={(e) =>
                        setFormState((prev) => ({
                          ...prev,
                          impactsCosts: e.target.checked,
                        }))
                      }
                      className="rounded"
                    />
                    {copy.impactsCosts}
                  </label>
                </div>
              )}

              {/* Notes */}
              <input
                className="w-full text-sm"
                placeholder={copy.notes}
                value={formState.notes}
                onChange={(e) =>
                  setFormState((prev) => ({ ...prev, notes: e.target.value }))
                }
              />

              {/* Attachment */}
              <div>
                <label className="block text-xs text-[hsl(var(--vp-muted))] mb-1">
                  {copy.attachFile}
                </label>
                <input
                  type="file"
                  accept="application/pdf,image/png,image/jpeg"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) void handleUploadAttachment(file);
                  }}
                  className="w-full text-sm"
                />
              </div>
              {attachments.length > 0 && (
                <div className="text-xs text-[hsl(var(--vp-muted))]">
                  {attachments.map((file) => (
                    <div key={file.fileUrl}>{file.fileName}</div>
                  ))}
                </div>
              )}

              {/* Buttons */}
              <div className="flex gap-2">
                <button
                  className={`flex-1 vp-button vp-button-primary ${
                    activeChannel === 2 ? "bg-amber-600 hover:bg-amber-700" : ""
                  }`}
                  onClick={handleSaveDocument}
                >
                  {copy.save}
                </button>
                {formState.documentId && (
                  <button
                    className="flex-1 vp-button vp-button-ghost"
                    onClick={resetForm}
                  >
                    {copy.cancel}
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* ─── Document List ─── */}
          <div className="lg:col-span-2 vp-card p-6">
            <h2 className="text-lg font-semibold mb-4 text-[hsl(var(--vp-text))]">
              {copy.listTitle}
              <span
                className={`ml-2 inline-block text-[10px] font-bold px-2 py-0.5 rounded-full align-middle ${
                  activeChannel === 1
                    ? "bg-emerald-100 text-emerald-700"
                    : "bg-amber-100 text-amber-700"
                }`}
              >
                {activeChannel === 1 ? copy.channel1Label : copy.channel2Label}
              </span>
            </h2>

            {documents.length === 0 ? (
              <div className="text-sm text-[hsl(var(--vp-muted))]">
                {copy.noDocuments}
              </div>
            ) : (
              <div className="space-y-3">
                {documents.map((doc) => (
                  <div
                    key={doc._id}
                    className={`vp-panel-sm flex flex-wrap items-center justify-between gap-3 ${
                      (doc.channel || 1) === 2
                        ? "border-l-4 border-l-amber-400"
                        : ""
                    }`}
                  >
                    <div className="min-w-[140px]">
                      <div className="text-sm font-semibold text-[hsl(var(--vp-text))]">
                        {doc.pointOfSale ? `${doc.pointOfSale}-` : ""}
                        {doc.documentNumber}
                      </div>
                      <div className="text-xs text-[hsl(var(--vp-muted))]">
                        {(copy.types as Record<string, string>)[doc.type] ||
                          doc.type}
                      </div>
                      {/* Channel 2 impact badges */}
                      {(doc.channel || 1) === 2 && (
                        <div className="flex gap-1 mt-1">
                          {doc.impactsStock && (
                            <span className="text-[10px] bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded">
                              {copy.impactsStock}
                            </span>
                          )}
                          {doc.impactsCosts && (
                            <span className="text-[10px] bg-purple-50 text-purple-600 px-1.5 py-0.5 rounded">
                              {copy.impactsCosts}
                            </span>
                          )}
                        </div>
                      )}
                      {doc.attachments?.length ? (
                        <div className="mt-1 text-xs">
                          {doc.attachments.map((file) => (
                            <a
                              key={file.fileUrl}
                              href={file.fileUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="text-[hsl(var(--vp-primary))] mr-1"
                            >
                              {file.fileName}
                            </a>
                          ))}
                        </div>
                      ) : null}
                    </div>

                    <div className="text-right">
                      <div className="text-sm font-semibold text-[hsl(var(--vp-text))]">
                        {formatCurrency(doc.totalAmount)}
                      </div>
                      <div className="text-xs text-[hsl(var(--vp-muted))]">
                        {copy.balance}: {formatCurrency(doc.balance)}
                      </div>
                      {doc.date && (
                        <div className="text-[10px] text-[hsl(var(--vp-muted))]">
                          {doc.date.slice(0, 10)}
                        </div>
                      )}
                    </div>

                    <span
                      className={`text-xs font-semibold px-2 py-1 rounded ${statusClassMap[doc.status]}`}
                    >
                      {(copy.statusLabels as Record<string, string>)[
                        doc.status
                      ] || doc.status}
                    </span>

                    <div className="flex gap-2">
                      {doc.status !== "CANCELLED" &&
                        doc.status !== "APPLIED" && (
                          <button
                            className="text-xs text-[hsl(var(--vp-primary))]"
                            onClick={() => handleEditDocument(doc)}
                          >
                            {copy.edit}
                          </button>
                        )}
                      {doc.status !== "CANCELLED" && doc.balance > 0 && (
                        <button
                          className="text-xs text-rose-600"
                          onClick={() => handleCancelDocument(doc)}
                        >
                          {copy.cancel}
                        </button>
                      )}
                      {doc.type === "CREDIT_NOTE" && doc.balance > 0 && (
                        <button
                          className="text-xs text-emerald-600"
                          onClick={() => {
                            setSelectedCreditNote(doc);
                            setShowApplyModal(true);
                          }}
                        >
                          {copy.applyCredit}
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── Apply Credit Modal ── */}
        {showApplyModal && selectedCreditNote && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
            <div className="vp-card p-6 w-full max-w-md">
              <h3 className="text-lg font-semibold mb-3 text-[hsl(var(--vp-text))]">
                {copy.applyCredit}
              </h3>
              <div className="space-y-3">
                <select
                  value={targetDocumentId}
                  onChange={(e) => setTargetDocumentId(e.target.value)}
                  className="w-full text-sm"
                >
                  <option value="">{copy.selectTarget}</option>
                  {availableTargets.map((doc) => (
                    <option key={doc._id} value={doc._id}>
                      {doc.documentNumber} - {formatCurrency(doc.balance)}
                    </option>
                  ))}
                </select>
                <input
                  className="w-full text-sm"
                  placeholder={copy.applyAmount}
                  type="number"
                  step="0.01"
                  min="0"
                  value={applyAmount}
                  onChange={(e) => setApplyAmount(e.target.value)}
                />
              </div>
              <div className="mt-4 flex gap-2">
                <button
                  className="flex-1 vp-button vp-button-primary"
                  onClick={handleApplyCredit}
                >
                  {copy.apply}
                </button>
                <button
                  className="flex-1 vp-button vp-button-ghost"
                  onClick={() => {
                    setShowApplyModal(false);
                    setSelectedCreditNote(null);
                  }}
                >
                  {copy.cancel}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* ── Channel 2 Activation Modal ── */}
      <Channel2Modal
        isOpen={showChannel2Modal}
        onClose={() => setShowChannel2Modal(false)}
        onActivated={handleChannel2Activated}
        language={currentLanguage}
      />
    </div>
  );
}

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

interface Attachment {
  fileName: string;
  fileUrl: string;
  mimeType: string;
  fileSize: number;
  uploadedAt?: string;
}

interface SupplierDocument {
  _id: string;
  supplierId: string;
  type: "INVOICE" | "DEBIT_NOTE" | "CREDIT_NOTE";
  pointOfSale?: string;
  documentNumber: string;
  date: string;
  dueDate?: string;
  totalAmount: number;
  balance: number;
  appliedPaymentsTotal?: number;
  appliedCreditsTotal?: number;
  status:
    | "PENDING"
    | "DUE_SOON"
    | "OVERDUE"
    | "PARTIALLY_APPLIED"
    | "APPLIED"
    | "CANCELLED";
  notes?: string;
  attachments?: Attachment[];
}

const COPY = {
  es: {
    title: "Documentos de Proveedor",
    subtitle: "Carga y seguimiento de facturas, debitos y creditos",
    supplierLabel: "Proveedor",
    newDocument: "Nuevo documento",
    editDocument: "Editar documento",
    documentType: "Tipo de documento",
    pointOfSale: "Punto de venta",
    documentNumber: "Numero",
    issueDate: "Fecha de emision",
    dueDate: "Vencimiento",
    amount: "Importe",
    notes: "Notas",
    attachFile: "Adjuntar PDF o imagen",
    save: "Guardar",
    edit: "Editar",
    cancel: "Cancelar",
    applyCredit: "Aplicar nota de credito",
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
    toasts: {
      loadError: "Error al cargar datos",
      created: "Documento creado",
      updated: "Documento actualizado",
      cancelled: "Documento cancelado",
      uploadError: "Error al subir archivo",
      applyOk: "Nota de credito aplicada",
      applyError: "Error al aplicar nota de credito",
      supplierRequired: "Selecciona un proveedor",
      dueDateRequired: "El vencimiento es obligatorio",
      amountRequired: "Ingresa un importe valido",
      creditSelectionRequired: "Selecciona una nota de credito y destino",
    },
    types: {
      invoice: "Factura",
      debit: "Nota Debito",
      credit: "Nota Credito",
    },
  },
  en: {
    title: "Supplier Documents",
    subtitle: "Load and track invoices, debit notes, and credit notes",
    supplierLabel: "Supplier",
    newDocument: "New document",
    editDocument: "Edit document",
    documentType: "Document type",
    pointOfSale: "Point of sale",
    documentNumber: "Number",
    issueDate: "Issue date",
    dueDate: "Due date",
    amount: "Amount",
    notes: "Notes",
    attachFile: "Attach PDF or image",
    save: "Save",
    edit: "Edit",
    cancel: "Cancel",
    applyCredit: "Apply credit note",
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
      creditSelectionRequired: "Select a credit note and target",
    },
    types: {
      invoice: "Invoice",
      debit: "Debit note",
      credit: "Credit note",
    },
  },
  pt: {
    title: "Documentos do Fornecedor",
    subtitle: "Carregue e acompanhe faturas, debitos e creditos",
    supplierLabel: "Fornecedor",
    newDocument: "Novo documento",
    editDocument: "Editar documento",
    documentType: "Tipo de documento",
    pointOfSale: "Ponto de venda",
    documentNumber: "Numero",
    issueDate: "Data de emissao",
    dueDate: "Vencimento",
    amount: "Valor",
    notes: "Notas",
    attachFile: "Anexar PDF ou imagem",
    save: "Salvar",
    edit: "Editar",
    cancel: "Cancelar",
    applyCredit: "Aplicar nota de credito",
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
    toasts: {
      loadError: "Erro ao carregar dados",
      created: "Documento criado",
      updated: "Documento atualizado",
      cancelled: "Documento cancelado",
      uploadError: "Erro ao subir arquivo",
      applyOk: "Nota de credito aplicada",
      applyError: "Erro ao aplicar nota de credito",
      supplierRequired: "Selecione um fornecedor",
      dueDateRequired: "O vencimento e obrigatorio",
      amountRequired: "Informe um valor valido",
      creditSelectionRequired: "Selecione uma nota de credito e destino",
    },
    types: {
      invoice: "Fatura",
      debit: "Nota debito",
      credit: "Nota credito",
    },
  },
} as const;

const statusClassMap: Record<SupplierDocument["status"], string> = {
  PENDING: "bg-slate-100 text-slate-700",
  DUE_SOON: "bg-amber-100 text-amber-700",
  OVERDUE: "bg-rose-100 text-rose-700",
  PARTIALLY_APPLIED: "bg-blue-100 text-blue-700",
  APPLIED: "bg-emerald-100 text-emerald-700",
  CANCELLED: "bg-slate-200 text-slate-500",
};

export default function SupplierDocumentsPage() {
  const router = useRouter();
  const { currentLanguage } = useGlobalLanguage();
  const copy = COPY[currentLanguage as keyof typeof COPY] || COPY.es;

  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [supplierId, setSupplierId] = useState("");
  const [documents, setDocuments] = useState<SupplierDocument[]>([]);
  const [alerts, setAlerts] = useState<{ dueSoon: number; overdue: number }>({
    dueSoon: 0,
    overdue: 0,
  });

  const [formState, setFormState] = useState({
    documentId: "",
    type: "INVOICE",
    pointOfSale: "",
    documentNumber: "",
    date: "",
    dueDate: "",
    totalAmount: "",
    notes: "",
  });
  const [attachments, setAttachments] = useState<Attachment[]>([]);

  const [showApplyModal, setShowApplyModal] = useState(false);
  const [selectedCreditNote, setSelectedCreditNote] =
    useState<SupplierDocument | null>(null);
  const [targetDocumentId, setTargetDocumentId] = useState("");
  const [applyAmount, setApplyAmount] = useState("");

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

  useEffect(() => {
    if (supplierId) {
      void loadDocuments(supplierId);
    } else {
      setDocuments([]);
    }
  }, [supplierId]);

  const loadSuppliers = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      const response = await fetch("/api/suppliers", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      setSuppliers(data?.suppliers || []);
    } catch (error) {
      console.error("Load suppliers error:", error);
      toast.error(copy.toasts.loadError);
    }
  };

  const loadDocuments = async (id: string) => {
    try {
      const token = localStorage.getItem("accessToken");
      const response = await fetch(`/api/supplier-documents?supplierId=${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      setDocuments(data?.documents || []);
    } catch (error) {
      console.error("Load documents error:", error);
      toast.error(copy.toasts.loadError);
    }
  };

  const loadAlerts = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      const response = await fetch("/api/supplier-documents?alerts=true", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      setAlerts({
        dueSoon: data?.alerts?.dueSoon || 0,
        overdue: data?.alerts?.overdue || 0,
      });
    } catch (error) {
      console.error("Load alerts error:", error);
    }
  };

  const resetForm = () => {
    setFormState({
      documentId: "",
      type: "INVOICE",
      pointOfSale: "",
      documentNumber: "",
      date: "",
      dueDate: "",
      totalAmount: "",
      notes: "",
    });
    setAttachments([]);
  };

  const handleUploadAttachment = async (file: File) => {
    try {
      const formData = new FormData();
      formData.append("file", file);
      const token = localStorage.getItem("accessToken");
      const response = await fetch("/api/supplier-documents/upload", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data?.error || copy.toasts.uploadError);
      }
      const data = await response.json();
      setAttachments((prev) => [...prev, data]);
    } catch (error) {
      console.error("Attachment upload error:", error);
      toast.error(copy.toasts.uploadError);
    }
  };

  const handleSaveDocument = async () => {
    if (!supplierId) {
      toast.error(copy.toasts.supplierRequired);
      return;
    }

    if (formState.type !== "CREDIT_NOTE" && !formState.dueDate) {
      toast.error(copy.toasts.dueDateRequired);
      return;
    }

    if (!formState.totalAmount || Number(formState.totalAmount) <= 0) {
      toast.error(copy.toasts.amountRequired);
      return;
    }

    const payload = {
      supplierId,
      type: formState.type,
      pointOfSale: formState.pointOfSale || undefined,
      documentNumber: formState.documentNumber,
      date: formState.date || undefined,
      dueDate: formState.dueDate || undefined,
      totalAmount: Number(formState.totalAmount || 0),
      notes: formState.notes || undefined,
      attachments,
    };

    try {
      const token = localStorage.getItem("accessToken");
      if (formState.documentId) {
        const response = await fetch(
          `/api/supplier-documents/${formState.documentId}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ updates: payload }),
          },
        );
        if (!response.ok) {
          const data = await response.json();
          throw new Error(data?.error || copy.toasts.loadError);
        }
        toast.success(copy.toasts.updated);
      } else {
        const response = await fetch("/api/supplier-documents", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        });
        if (!response.ok) {
          const data = await response.json();
          throw new Error(data?.error || copy.toasts.loadError);
        }
        toast.success(copy.toasts.created);
      }

      resetForm();
      await loadDocuments(supplierId);
      await loadAlerts();
    } catch (error) {
      console.error("Save document error:", error);
      toast.error(copy.toasts.loadError);
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
    });
    setAttachments(doc.attachments || []);
  };

  const handleCancelDocument = async (doc: SupplierDocument) => {
    try {
      const token = localStorage.getItem("accessToken");
      const response = await fetch(`/api/supplier-documents/${doc._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ action: "cancel" }),
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data?.error || copy.toasts.loadError);
      }
      toast.success(copy.toasts.cancelled);
      await loadDocuments(supplierId);
      await loadAlerts();
    } catch (error) {
      console.error("Cancel document error:", error);
      toast.error(copy.toasts.loadError);
    }
  };

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
      const token = localStorage.getItem("accessToken");
      const response = await fetch("/api/supplier-documents/apply-credit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          creditNoteId: selectedCreditNote._id,
          targetDocumentId,
          amount: Number(applyAmount),
        }),
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data?.error || copy.toasts.applyError);
      }
      toast.success(copy.toasts.applyOk);
      setShowApplyModal(false);
      setSelectedCreditNote(null);
      setTargetDocumentId("");
      setApplyAmount("");
      await loadDocuments(supplierId);
      await loadAlerts();
    } catch (error) {
      console.error("Apply credit note error:", error);
      toast.error(copy.toasts.applyError);
    }
  };

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
      minimumFractionDigits: 2,
    }).format(value || 0);

  if (loading) {
    return null;
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
          <div className="grid gap-4 md:grid-cols-3">
            <div>
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
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-[hsl(var(--vp-muted))] mb-2">
                {copy.alertsTitle}
              </label>
              <div className="flex flex-wrap gap-3">
                <div className="px-3 py-2 rounded-lg bg-amber-50 text-amber-700 text-sm">
                  {copy.dueSoon}: {alerts.dueSoon}
                </div>
                <div className="px-3 py-2 rounded-lg bg-rose-50 text-rose-700 text-sm">
                  {copy.overdue}: {alerts.overdue}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 vp-card p-6">
            <h2 className="text-lg font-semibold mb-4 text-[hsl(var(--vp-text))]">
              {formState.documentId ? copy.editDocument : copy.newDocument}
            </h2>
            <div className="space-y-3">
              <select
                value={formState.type}
                onChange={(e) =>
                  setFormState((prev) => ({ ...prev, type: e.target.value }))
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
                value={formState.pointOfSale}
                onChange={(e) =>
                  setFormState((prev) => ({
                    ...prev,
                    pointOfSale: e.target.value,
                  }))
                }
              />
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
              <input
                type="date"
                className="w-full text-sm"
                value={formState.date}
                onChange={(e) =>
                  setFormState((prev) => ({ ...prev, date: e.target.value }))
                }
              />
              {formState.type !== "CREDIT_NOTE" && (
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
              )}
              <input
                className="w-full text-sm"
                placeholder={copy.amount}
                value={formState.totalAmount}
                onChange={(e) =>
                  setFormState((prev) => ({
                    ...prev,
                    totalAmount: e.target.value,
                  }))
                }
              />
              <input
                className="w-full text-sm"
                placeholder={copy.notes}
                value={formState.notes}
                onChange={(e) =>
                  setFormState((prev) => ({ ...prev, notes: e.target.value }))
                }
              />
              <label className="block text-xs text-[hsl(var(--vp-muted))]">
                {copy.attachFile}
              </label>
              <input
                type="file"
                accept="application/pdf,image/png,image/jpeg"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    void handleUploadAttachment(file);
                  }
                }}
                className="w-full text-sm"
              />
              {attachments.length > 0 && (
                <div className="text-xs text-[hsl(var(--vp-muted))]">
                  {attachments.map((file) => (
                    <div key={file.fileUrl}>{file.fileName}</div>
                  ))}
                </div>
              )}
              <div className="flex gap-2">
                <button
                  className="flex-1 vp-button vp-button-primary"
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

          <div className="lg:col-span-2 vp-card p-6">
            <h2 className="text-lg font-semibold mb-4 text-[hsl(var(--vp-text))]">
              {copy.listTitle}
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
                    className="vp-panel-sm flex flex-wrap items-center justify-between gap-3"
                  >
                    <div>
                      <div className="text-sm font-semibold text-[hsl(var(--vp-text))]">
                        {doc.pointOfSale ? `${doc.pointOfSale}-` : ""}
                        {doc.documentNumber}
                      </div>
                      <div className="text-xs text-[hsl(var(--vp-muted))]">
                        {doc.type === "INVOICE"
                          ? copy.types.invoice
                          : doc.type === "DEBIT_NOTE"
                            ? copy.types.debit
                            : copy.types.credit}
                      </div>
                      {doc.attachments?.length ? (
                        <div className="mt-1 text-xs text-[hsl(var(--vp-muted))]">
                          {doc.attachments.map((file) => (
                            <a
                              key={file.fileUrl}
                              href={file.fileUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="text-[hsl(var(--vp-primary))]"
                            >
                              {file.fileName}
                            </a>
                          ))}
                        </div>
                      ) : null}
                    </div>
                    <div className="text-sm text-[hsl(var(--vp-muted))]">
                      {copy.balance}: {formatCurrency(doc.balance)}
                    </div>
                    <span
                      className={`text-xs font-semibold px-2 py-1 rounded ${statusClassMap[doc.status]}`}
                    >
                      {doc.status}
                    </span>
                    <div className="flex gap-2">
                      <button
                        className="text-xs text-[hsl(var(--vp-primary))]"
                        onClick={() => handleEditDocument(doc)}
                      >
                        {copy.edit}
                      </button>
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
    </div>
  );
}

"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useGlobalLanguage } from "@/lib/hooks/useGlobalLanguage";
import Header from "@/components/layout/Header";
import { toast } from "react-toastify";
import {
  Package,
  Plus,
  Search,
  Check,
  X,
  FileText,
  Truck,
  ClipboardList,
  Eye,
  Ban,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
} from "lucide-react";

interface Supplier {
  _id: string;
  name: string;
  document?: string;
}

interface Product {
  _id: string;
  name: string;
  code: string;
  barcodes?: string[];
  cost: number;
  price: number;
  stock: number;
}

interface ReceiptItem {
  productId: string;
  productName: string;
  productCode: string;
  quantity: number;
  unitCost: number;
  subtotal: number;
  lot?: string;
  expirationDate?: string;
}

interface GoodsReceipt {
  _id: string;
  supplierId: { _id: string; name: string; document?: string } | string;
  documentType: string;
  documentNumber: string;
  documentDate: string;
  receiptDate: string;
  notes?: string;
  receivingUserEmail: string;
  items: ReceiptItem[];
  totalAmount: number;
  totalItems: number;
  status: string;
  supplierBillId?: string;
  createdAt: string;
}

const COPY = {
  es: {
    title: "Recepción de Mercadería",
    subtitle: "Registra el ingreso de productos desde proveedores",
    newReceipt: "Nueva Recepción",
    searchPlaceholder: "Buscar por proveedor, número de documento...",
    filterAll: "Todos",
    filterDraft: "Borrador",
    filterConfirmed: "Confirmados",
    filterPendingBilling: "Pend. Facturación",
    filterBilled: "Facturados",
    filterCancelled: "Anulados",
    table: {
      date: "Fecha",
      supplier: "Proveedor",
      document: "Documento",
      type: "Tipo",
      items: "Ítems",
      total: "Total",
      status: "Estado",
      actions: "Acciones",
    },
    status: {
      DRAFT: "Borrador",
      CONFIRMED: "Confirmado",
      PENDING_BILLING: "Pend. Facturación",
      BILLED: "Facturado",
      CANCELLED: "Anulado",
    },
    docTypes: {
      INVOICE_A: "Factura A",
      INVOICE_B: "Factura B",
      INVOICE_C: "Factura C",
      DELIVERY_NOTE: "Remito",
      RECEIPT: "Recibo",
      OTHER: "Otro",
    },
    form: {
      title: "Nueva Recepción de Mercadería",
      editTitle: "Detalle de Recepción",
      supplier: "Proveedor *",
      selectSupplier: "Seleccionar proveedor...",
      documentType: "Tipo de Documento *",
      selectDocType: "Seleccionar tipo...",
      documentNumber: "Número de Documento *",
      documentDate: "Fecha Documento",
      receiptDate: "Fecha Recepción",
      notes: "Notas",
      notesPlaceholder: "Observaciones opcionales...",
      receivedBy: "Recibido por",
    },
    items: {
      title: "Productos",
      scanPlaceholder: "Escanear código de barras o buscar producto (F2)...",
      product: "Producto",
      quantity: "Cantidad",
      unitCost: "Costo Unit.",
      subtotal: "Subtotal",
      lot: "Lote",
      expiration: "Vencimiento",
      addItem: "Agregar",
      noItems: "No hay productos agregados. Escanee o busque un producto.",
      total: "Total",
    },
    actions: {
      save: "Guardar Borrador",
      confirm: "Confirmar Recepción (F3)",
      cancel: "Cancelar",
      cancelReceipt: "Anular Recepción",
      back: "Volver",
      view: "Ver",
      linkBill: "Vincular Factura",
    },
    confirm: {
      title: "¿Confirmar recepción?",
      message:
        "Se impactará el stock y, si es factura, se creará la cuenta por pagar. Esta acción no se puede deshacer fácilmente.",
      accept: "Confirmar",
      cancel: "Cancelar",
    },
    cancelConfirm: {
      title: "¿Anular recepción?",
      message:
        "Se revertirá el impacto en stock y se anulará la factura asociada si existe.",
      reasonLabel: "Motivo de anulación",
      accept: "Anular",
      cancel: "Cancelar",
    },
    empty: "No hay recepciones registradas",
    toasts: {
      createSuccess: "Recepción creada como borrador",
      confirmSuccess: "Recepción confirmada — stock actualizado",
      cancelSuccess: "Recepción anulada",
      error: "Error al procesar la recepción",
      duplicateDoc:
        "Ya existe una recepción con ese número para este proveedor",
      missingFields: "Complete todos los campos requeridos",
      noItems: "Agregue al menos un producto",
      productNotFound: "Producto no encontrado",
      costAlert: "Alerta: el costo es significativamente diferente al último",
    },
    shortcuts: {
      f2: "F2: Buscar producto",
      f3: "F3: Confirmar",
      esc: "Esc: Cancelar",
    },
  },
  en: {
    title: "Goods Receipt",
    subtitle: "Register product entries from suppliers",
    newReceipt: "New Receipt",
    searchPlaceholder: "Search by supplier, document number...",
    filterAll: "All",
    filterDraft: "Draft",
    filterConfirmed: "Confirmed",
    filterPendingBilling: "Pending Billing",
    filterBilled: "Billed",
    filterCancelled: "Cancelled",
    table: {
      date: "Date",
      supplier: "Supplier",
      document: "Document",
      type: "Type",
      items: "Items",
      total: "Total",
      status: "Status",
      actions: "Actions",
    },
    status: {
      DRAFT: "Draft",
      CONFIRMED: "Confirmed",
      PENDING_BILLING: "Pending Billing",
      BILLED: "Billed",
      CANCELLED: "Cancelled",
    },
    docTypes: {
      INVOICE_A: "Invoice A",
      INVOICE_B: "Invoice B",
      INVOICE_C: "Invoice C",
      DELIVERY_NOTE: "Delivery Note",
      RECEIPT: "Receipt",
      OTHER: "Other",
    },
    form: {
      title: "New Goods Receipt",
      editTitle: "Receipt Details",
      supplier: "Supplier *",
      selectSupplier: "Select supplier...",
      documentType: "Document Type *",
      selectDocType: "Select type...",
      documentNumber: "Document Number *",
      documentDate: "Document Date",
      receiptDate: "Receipt Date",
      notes: "Notes",
      notesPlaceholder: "Optional notes...",
      receivedBy: "Received by",
    },
    items: {
      title: "Products",
      scanPlaceholder: "Scan barcode or search product (F2)...",
      product: "Product",
      quantity: "Quantity",
      unitCost: "Unit Cost",
      subtotal: "Subtotal",
      lot: "Lot",
      expiration: "Expiration",
      addItem: "Add",
      noItems: "No products added. Scan or search for a product.",
      total: "Total",
    },
    actions: {
      save: "Save Draft",
      confirm: "Confirm Receipt (F3)",
      cancel: "Cancel",
      cancelReceipt: "Cancel Receipt",
      back: "Back",
      view: "View",
      linkBill: "Link Bill",
    },
    confirm: {
      title: "Confirm receipt?",
      message:
        "Stock will be updated and, if invoice, an accounts payable entry will be created. This cannot be easily undone.",
      accept: "Confirm",
      cancel: "Cancel",
    },
    cancelConfirm: {
      title: "Cancel receipt?",
      message:
        "Stock impact will be reversed and the associated bill (if any) will be cancelled.",
      reasonLabel: "Cancellation reason",
      accept: "Cancel Receipt",
      cancel: "Go Back",
    },
    empty: "No receipts registered",
    toasts: {
      createSuccess: "Receipt created as draft",
      confirmSuccess: "Receipt confirmed — stock updated",
      cancelSuccess: "Receipt cancelled",
      error: "Error processing receipt",
      duplicateDoc:
        "A receipt with this document number already exists for this supplier",
      missingFields: "Please fill all required fields",
      noItems: "Add at least one product",
      productNotFound: "Product not found",
      costAlert: "Alert: cost is significantly different from last cost",
    },
    shortcuts: {
      f2: "F2: Search product",
      f3: "F3: Confirm",
      esc: "Esc: Cancel",
    },
  },
  pt: {
    title: "Recebimento de Mercadoria",
    subtitle: "Registre a entrada de produtos de fornecedores",
    newReceipt: "Novo Recebimento",
    searchPlaceholder: "Buscar por fornecedor, número do documento...",
    filterAll: "Todos",
    filterDraft: "Rascunho",
    filterConfirmed: "Confirmados",
    filterPendingBilling: "Pend. Faturamento",
    filterBilled: "Faturados",
    filterCancelled: "Cancelados",
    table: {
      date: "Data",
      supplier: "Fornecedor",
      document: "Documento",
      type: "Tipo",
      items: "Itens",
      total: "Total",
      status: "Status",
      actions: "Ações",
    },
    status: {
      DRAFT: "Rascunho",
      CONFIRMED: "Confirmado",
      PENDING_BILLING: "Pend. Faturamento",
      BILLED: "Faturado",
      CANCELLED: "Cancelado",
    },
    docTypes: {
      INVOICE_A: "Fatura A",
      INVOICE_B: "Fatura B",
      INVOICE_C: "Fatura C",
      DELIVERY_NOTE: "Remessa",
      RECEIPT: "Recibo",
      OTHER: "Outro",
    },
    form: {
      title: "Novo Recebimento de Mercadoria",
      editTitle: "Detalhes do Recebimento",
      supplier: "Fornecedor *",
      selectSupplier: "Selecionar fornecedor...",
      documentType: "Tipo de Documento *",
      selectDocType: "Selecionar tipo...",
      documentNumber: "Número do Documento *",
      documentDate: "Data do Documento",
      receiptDate: "Data de Recebimento",
      notes: "Notas",
      notesPlaceholder: "Observações opcionais...",
      receivedBy: "Recebido por",
    },
    items: {
      title: "Produtos",
      scanPlaceholder: "Escanear código de barras ou buscar produto (F2)...",
      product: "Produto",
      quantity: "Quantidade",
      unitCost: "Custo Unit.",
      subtotal: "Subtotal",
      lot: "Lote",
      expiration: "Vencimento",
      addItem: "Adicionar",
      noItems: "Nenhum produto adicionado. Escaneie ou busque um produto.",
      total: "Total",
    },
    actions: {
      save: "Salvar Rascunho",
      confirm: "Confirmar Recebimento (F3)",
      cancel: "Cancelar",
      cancelReceipt: "Cancelar Recebimento",
      back: "Voltar",
      view: "Ver",
      linkBill: "Vincular Fatura",
    },
    confirm: {
      title: "Confirmar recebimento?",
      message:
        "O estoque será atualizado e, se for fatura, uma conta a pagar será criada. Esta ação não pode ser facilmente desfeita.",
      accept: "Confirmar",
      cancel: "Cancelar",
    },
    cancelConfirm: {
      title: "Cancelar recebimento?",
      message:
        "O impacto no estoque será revertido e a fatura associada (se houver) será cancelada.",
      reasonLabel: "Motivo do cancelamento",
      accept: "Cancelar Recebimento",
      cancel: "Voltar",
    },
    empty: "Nenhum recebimento registrado",
    toasts: {
      createSuccess: "Recebimento criado como rascunho",
      confirmSuccess: "Recebimento confirmado — estoque atualizado",
      cancelSuccess: "Recebimento cancelado",
      error: "Erro ao processar o recebimento",
      duplicateDoc:
        "Já existe um recebimento com esse número para este fornecedor",
      missingFields: "Preencha todos os campos obrigatórios",
      noItems: "Adicione pelo menos um produto",
      productNotFound: "Produto não encontrado",
      costAlert:
        "Alerta: o custo é significativamente diferente do último custo",
    },
    shortcuts: {
      f2: "F2: Buscar produto",
      f3: "F3: Confirmar",
      esc: "Esc: Cancelar",
    },
  },
} as const;

type Lang = keyof typeof COPY;

export default function GoodsReceiptPage() {
  const router = useRouter();
  const { currentLanguage } = useGlobalLanguage();
  const lang = (currentLanguage || "es") as Lang;
  const copy = COPY[lang] || COPY.es;

  const scanInputRef = useRef<HTMLInputElement>(null);
  const [mounted, setMounted] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // List view
  const [receipts, setReceipts] = useState<GoodsReceipt[]>([]);
  const [statusFilter, setStatusFilter] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  // Form view
  const [showForm, setShowForm] = useState(false);
  const [viewingReceipt, setViewingReceipt] = useState<GoodsReceipt | null>(
    null,
  );

  // Header fields
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedSupplierId, setSelectedSupplierId] = useState("");
  const [documentType, setDocumentType] = useState("");
  const [documentNumber, setDocumentNumber] = useState("");
  const [documentDate, setDocumentDate] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [receiptDate, setReceiptDate] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [notes, setNotes] = useState("");

  // Item input
  const [items, setItems] = useState<ReceiptItem[]>([]);
  const [scanQuery, setScanQuery] = useState("");
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [itemQuantity, setItemQuantity] = useState<number>(1);
  const [itemUnitCost, setItemUnitCost] = useState<number>(0);
  const [itemLot, setItemLot] = useState("");
  const [itemExpiration, setItemExpiration] = useState("");
  const [showProductDropdown, setShowProductDropdown] = useState(false);

  // Modals
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [receiptToCancel, setReceiptToCancel] = useState<string | null>(null);
  const [expandedRow, setExpandedRow] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    const userStr = localStorage.getItem("user");
    if (!userStr) {
      router.push("/auth/login");
      return;
    }
    setUser(JSON.parse(userStr));
    fetchReceipts();
    fetchSuppliers();
    fetchProducts();
  }, [router, mounted]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "F2") {
        e.preventDefault();
        scanInputRef.current?.focus();
      }
      if (e.key === "F3" && showForm && items.length > 0) {
        e.preventDefault();
        setShowConfirmModal(true);
      }
      if (e.key === "Escape") {
        if (showConfirmModal) setShowConfirmModal(false);
        else if (showCancelModal) setShowCancelModal(false);
        else if (showForm) resetForm();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [showForm, showConfirmModal, showCancelModal, items]);

  const fetchReceipts = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("accessToken");
      const params = new URLSearchParams();
      if (statusFilter) params.set("status", statusFilter);
      const res = await fetch(`/api/goods-receipts?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setReceipts(data.data?.receipts || []);
      }
    } catch (error) {
      console.error("Error fetching receipts:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSuppliers = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      const res = await fetch("/api/suppliers", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setSuppliers(data.suppliers || []);
      }
    } catch (error) {
      console.error("Error fetching suppliers:", error);
    }
  };

  const fetchProducts = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      const res = await fetch("/api/products", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setProducts(data.data?.products || data.products || []);
      }
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };

  useEffect(() => {
    fetchReceipts();
  }, [statusFilter]);

  // Product search / scan
  useEffect(() => {
    if (!scanQuery.trim()) {
      setFilteredProducts([]);
      setShowProductDropdown(false);
      return;
    }
    const q = scanQuery.toLowerCase();
    const filtered = products
      .filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.code.toLowerCase().includes(q) ||
          (p.barcodes && p.barcodes.some((b) => b.includes(q))),
      )
      .slice(0, 10);
    setFilteredProducts(filtered);
    setShowProductDropdown(filtered.length > 0);
  }, [scanQuery, products]);

  const handleSelectProduct = (product: Product) => {
    setSelectedProduct(product);
    setScanQuery(product.name);
    setItemUnitCost(product.cost);
    setItemQuantity(1);
    setShowProductDropdown(false);
    // Focus on quantity
    setTimeout(() => {
      const qtyInput = document.getElementById("item-quantity-input");
      qtyInput?.focus();
    }, 50);
  };

  const handleScanKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && scanQuery.trim()) {
      e.preventDefault();
      // Try exact barcode match first
      const exactMatch = products.find(
        (p) =>
          p.barcodes?.includes(scanQuery.trim()) || p.code === scanQuery.trim(),
      );
      if (exactMatch) {
        handleSelectProduct(exactMatch);
      } else if (filteredProducts.length === 1) {
        handleSelectProduct(filteredProducts[0]);
      }
    }
  };

  const addItem = () => {
    if (!selectedProduct || itemQuantity <= 0 || itemUnitCost < 0) return;

    // Cost alert check
    if (
      selectedProduct.cost > 0 &&
      Math.abs(itemUnitCost - selectedProduct.cost) / selectedProduct.cost > 0.3
    ) {
      toast.warn(copy.toasts.costAlert);
    }

    const newItem: ReceiptItem = {
      productId: selectedProduct._id,
      productName: selectedProduct.name,
      productCode: selectedProduct.code,
      quantity: itemQuantity,
      unitCost: itemUnitCost,
      subtotal: itemQuantity * itemUnitCost,
      lot: itemLot || undefined,
      expirationDate: itemExpiration || undefined,
    };

    // Check if product already exists, update quantity
    const existingIdx = items.findIndex(
      (i) => i.productId === selectedProduct._id,
    );
    if (existingIdx >= 0) {
      const updated = [...items];
      updated[existingIdx].quantity += itemQuantity;
      updated[existingIdx].unitCost = itemUnitCost;
      updated[existingIdx].subtotal =
        updated[existingIdx].quantity * updated[existingIdx].unitCost;
      setItems(updated);
    } else {
      setItems([...items, newItem]);
    }

    // Reset item fields
    setSelectedProduct(null);
    setScanQuery("");
    setItemQuantity(1);
    setItemUnitCost(0);
    setItemLot("");
    setItemExpiration("");
    scanInputRef.current?.focus();
  };

  const handleItemQuantityKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addItem();
    }
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const totalAmount = items.reduce((sum, item) => sum + item.subtotal, 0);

  const resetForm = () => {
    setShowForm(false);
    setViewingReceipt(null);
    setSelectedSupplierId("");
    setDocumentType("");
    setDocumentNumber("");
    setDocumentDate(new Date().toISOString().split("T")[0]);
    setReceiptDate(new Date().toISOString().split("T")[0]);
    setNotes("");
    setItems([]);
    setSelectedProduct(null);
    setScanQuery("");
  };

  const handleSaveDraft = async () => {
    if (!selectedSupplierId || !documentType || !documentNumber) {
      toast.error(copy.toasts.missingFields);
      return;
    }
    if (items.length === 0) {
      toast.error(copy.toasts.noItems);
      return;
    }

    try {
      const token = localStorage.getItem("accessToken");
      const res = await fetch("/api/goods-receipts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          supplierId: selectedSupplierId,
          documentType,
          documentNumber,
          documentDate,
          receiptDate,
          notes,
          items: items.map((i) => ({
            productId: i.productId,
            quantity: i.quantity,
            unitCost: i.unitCost,
            lot: i.lot,
            expirationDate: i.expirationDate,
          })),
        }),
      });

      if (res.ok) {
        toast.success(copy.toasts.createSuccess);
        resetForm();
        fetchReceipts();
      } else {
        const data = await res.json();
        if (res.status === 409) {
          toast.error(copy.toasts.duplicateDoc);
        } else {
          toast.error(data.error || copy.toasts.error);
        }
      }
    } catch (error) {
      console.error("Error saving receipt:", error);
      toast.error(copy.toasts.error);
    }
  };

  const handleConfirmReceipt = async (receiptId: string) => {
    try {
      const token = localStorage.getItem("accessToken");
      const res = await fetch(`/api/goods-receipts/${receiptId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ action: "confirm" }),
      });

      if (res.ok) {
        toast.success(copy.toasts.confirmSuccess);
        setShowConfirmModal(false);
        resetForm();
        fetchReceipts();
      } else {
        const data = await res.json();
        toast.error(data.error || copy.toasts.error);
      }
    } catch (error) {
      console.error("Error confirming receipt:", error);
      toast.error(copy.toasts.error);
    }
  };

  const handleCancelReceipt = async () => {
    if (!receiptToCancel) return;
    try {
      const token = localStorage.getItem("accessToken");
      const res = await fetch(`/api/goods-receipts/${receiptToCancel}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ action: "cancel", cancelReason }),
      });

      if (res.ok) {
        toast.success(copy.toasts.cancelSuccess);
        setShowCancelModal(false);
        setReceiptToCancel(null);
        setCancelReason("");
        fetchReceipts();
      } else {
        const data = await res.json();
        toast.error(data.error || copy.toasts.error);
      }
    } catch (error) {
      console.error("Error cancelling receipt:", error);
      toast.error(copy.toasts.error);
    }
  };

  const filteredReceipts = receipts.filter((r) => {
    if (!searchTerm) return true;
    const q = searchTerm.toLowerCase();
    const supplierName =
      typeof r.supplierId === "object" ? r.supplierId.name : "";
    return (
      supplierName.toLowerCase().includes(q) ||
      r.documentNumber.toLowerCase().includes(q)
    );
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "DRAFT":
        return "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300";
      case "CONFIRMED":
        return "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400";
      case "PENDING_BILLING":
        return "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400";
      case "BILLED":
        return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400";
      case "CANCELLED":
        return "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400";
      default:
        return "bg-slate-100 text-slate-700";
    }
  };

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat(
      lang === "en" ? "en-US" : lang === "pt" ? "pt-BR" : "es-AR",
      {
        style: "currency",
        currency: lang === "pt" ? "BRL" : "ARS",
      },
    ).format(amount);

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString(
      lang === "en" ? "en-US" : lang === "pt" ? "pt-BR" : "es-AR",
    );

  if (!mounted) return null;

  // ── Form View ──────────────────────────────────
  if (showForm) {
    return (
      <div className="vp-page">
        <Header user={user} showBackButton={true} />
        <main className="vp-page-inner">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                {copy.form.title}
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {copy.shortcuts.f2} · {copy.shortcuts.f3} · {copy.shortcuts.esc}
              </p>
            </div>
            <button
              onClick={resetForm}
              className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition"
            >
              {copy.actions.back}
            </button>
          </div>

          {/* Receipt Header Fields */}
          <div className="vp-card p-6 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Supplier */}
              <div>
                <label className="vp-label">
                  {copy.form.supplier}
                </label>
                <select
                  value={selectedSupplierId}
                  onChange={(e) => setSelectedSupplierId(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">{copy.form.selectSupplier}</option>
                  {suppliers.map((s) => (
                    <option key={s._id} value={s._id}>
                      {s.name} {s.document ? `(${s.document})` : ""}
                    </option>
                  ))}
                </select>
              </div>

              {/* Document Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {copy.form.documentType}
                </label>
                <select
                  value={documentType}
                  onChange={(e) => setDocumentType(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">{copy.form.selectDocType}</option>
                  {Object.entries(copy.docTypes).map(([key, label]) => (
                    <option key={key} value={key}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Document Number */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {copy.form.documentNumber}
                </label>
                <input
                  type="text"
                  value={documentNumber}
                  onChange={(e) => setDocumentNumber(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  placeholder="0001-00000001"
                />
              </div>

              {/* Document Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {copy.form.documentDate}
                </label>
                <input
                  type="date"
                  value={documentDate}
                  onChange={(e) => setDocumentDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Receipt Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {copy.form.receiptDate}
                </label>
                <input
                  type="date"
                  value={receiptDate}
                  onChange={(e) => setReceiptDate(e.target.value)}
                  className="vp-input"
                />
              </div>

              {/* Received By */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {copy.form.receivedBy}
                </label>
                <input
                  type="text"
                  value={user?.email || ""}
                  disabled
                  className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-600 text-gray-500 dark:text-gray-400"
                />
              </div>
            </div>

            {/* Notes */}
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {copy.form.notes}
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
                className="vp-input min-h-[80px]"
                placeholder={copy.form.notesPlaceholder}
              />
            </div>
          </div>

          {/* Product Entry Section */}
          <div className="vp-card p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              {copy.items.title}
            </h2>

            {/* Scan / Search Bar */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-3 mb-4 items-end">
              <div className="md:col-span-4 relative">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {copy.items.product}
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                  <input
                    ref={scanInputRef}
                    type="text"
                    value={scanQuery}
                    onChange={(e) => setScanQuery(e.target.value)}
                    onKeyDown={handleScanKeyDown}
                    className="vp-input pl-10"
                    placeholder={copy.items.scanPlaceholder}
                  />
                </div>
                {/* Product Dropdown */}
                {showProductDropdown && (
                  <div className="absolute z-20 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-xl max-h-60 overflow-y-auto">
                    {filteredProducts.map((p) => (
                      <button
                        key={p._id}
                        onClick={() => handleSelectProduct(p)}
                        className="w-full text-left px-4 py-2 hover:bg-blue-50 dark:hover:bg-gray-700 text-sm text-gray-900 dark:text-white border-b border-gray-100 dark:border-gray-700 last:border-0"
                      >
                        <span className="font-medium">{p.name}</span>
                        <span className="ml-2 text-gray-500">[{p.code}]</span>
                        <span className="ml-2 text-gray-400">
                          Stock: {p.stock}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="md:col-span-2">
                <label className="vp-label">
                  {copy.items.quantity}
                </label>
                <input
                  id="item-quantity-input"
                  type="number"
                  min={0.0001}
                  step="any"
                  value={itemQuantity}
                  onChange={(e) =>
                    setItemQuantity(parseFloat(e.target.value) || 0)
                  }
                  onKeyDown={handleItemQuantityKeyDown}
                  className="vp-input"
                />
              </div>

              <div className="md:col-span-2">
                <label className="vp-label">
                  {copy.items.unitCost}
                </label>
                <input
                  type="number"
                  min={0}
                  step="any"
                  value={itemUnitCost}
                  onChange={(e) =>
                    setItemUnitCost(parseFloat(e.target.value) || 0)
                  }
                  onKeyDown={handleItemQuantityKeyDown}
                  className="vp-input"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {copy.items.lot}
                </label>
                <input
                  type="text"
                  value={itemLot}
                  onChange={(e) => setItemLot(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="md:col-span-2 flex items-end">
                <button
                  onClick={addItem}
                  disabled={!selectedProduct || itemQuantity <= 0}
                  className="vp-button vp-button-primary w-full"
                >
                  <Plus className="w-4 h-4" />
                  {copy.items.addItem}
                </button>
              </div>
            </div>

            {/* Items Table */}
            {items.length === 0 ? (
              <div className="text-center py-8 text-gray-400 dark:text-gray-500">
                <Package className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>{copy.items.noItems}</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-700">
                      <th className="text-left py-2 px-3 text-gray-600 dark:text-gray-400 font-medium">
                        {copy.items.product}
                      </th>
                      <th className="text-right py-2 px-3 text-gray-600 dark:text-gray-400 font-medium">
                        {copy.items.quantity}
                      </th>
                      <th className="text-right py-2 px-3 text-gray-600 dark:text-gray-400 font-medium">
                        {copy.items.unitCost}
                      </th>
                      <th className="text-right py-2 px-3 text-gray-600 dark:text-gray-400 font-medium">
                        {copy.items.subtotal}
                      </th>
                      <th className="text-center py-2 px-3 text-gray-600 dark:text-gray-400 font-medium">
                        {copy.items.lot}
                      </th>
                      <th className="w-10"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item, idx) => (
                      <tr
                        key={idx}
                        className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                      >
                        <td className="py-2 px-3">
                          <div className="font-medium text-gray-900 dark:text-white">
                            {item.productName}
                          </div>
                          <div className="text-xs text-gray-500">
                            {item.productCode}
                          </div>
                        </td>
                        <td className="py-2 px-3 text-right text-gray-900 dark:text-white">
                          {item.quantity}
                        </td>
                        <td className="py-2 px-3 text-right text-gray-900 dark:text-white">
                          {formatCurrency(item.unitCost)}
                        </td>
                        <td className="py-2 px-3 text-right font-medium text-gray-900 dark:text-white">
                          {formatCurrency(item.subtotal)}
                        </td>
                        <td className="py-2 px-3 text-center text-gray-500 dark:text-gray-400">
                          {item.lot || "—"}
                        </td>
                        <td className="py-2 px-3 text-center">
                          <button
                            onClick={() => removeItem(idx)}
                            className="text-red-400 hover:text-red-600 transition"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="border-t-2 border-gray-300 dark:border-gray-600">
                      <td
                        colSpan={3}
                        className="py-3 px-3 text-right font-bold text-gray-900 dark:text-white"
                      >
                        {copy.items.total}
                      </td>
                      <td className="py-3 px-3 text-right font-bold text-lg text-blue-600 dark:text-blue-400">
                        {formatCurrency(totalAmount)}
                      </td>
                      <td colSpan={2}></td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3">
            <button
              onClick={resetForm}
              className="vp-button-ghost px-6 py-2.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition"
            >
              {copy.actions.cancel}
            </button>
            <button
              onClick={handleSaveDraft}
              className="vp-button vp-button-primary px-8"
            >
              {copy.actions.save}
            </button>
          </div>
        </main>

        {/* Confirm Modal */}
        {showConfirmModal && (
          <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full p-6">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                {copy.confirm.title}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                {copy.confirm.message}
              </p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowConfirmModal(false)}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                >
                  {copy.confirm.cancel}
                </button>
                <button
                  onClick={handleSaveDraft}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                >
                  {copy.confirm.accept}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ── Detail View ────────────────────────────────
  if (viewingReceipt) {
    const r = viewingReceipt;
    const supplierName =
      typeof r.supplierId === "object" ? r.supplierId.name : "—";
    return (
      <div className="vp-page">
        <Header user={user} showBackButton={true} />
        <main className="vp-page-inner">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                {copy.form.editTitle}
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {copy.docTypes[r.documentType as keyof typeof copy.docTypes] ||
                  r.documentType}{" "}
                — {r.documentNumber}
              </p>
            </div>
            <div className="flex gap-2">
              {r.status === "DRAFT" && (
                <button
                  onClick={() => handleConfirmReceipt(r._id)}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center gap-2"
                >
                  <Check className="w-4 h-4" />
                  {copy.actions.confirm}
                </button>
              )}
              {r.status !== "CANCELLED" && (
                <button
                  onClick={() => {
                    setReceiptToCancel(r._id);
                    setShowCancelModal(true);
                  }}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition flex items-center gap-2"
                >
                  <Ban className="w-4 h-4" />
                  {copy.actions.cancelReceipt}
                </button>
              )}
              <button
                onClick={() => setViewingReceipt(null)}
                className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition"
              >
                {copy.actions.back}
              </button>
            </div>
          </div>

          {/* Receipt Info */}
          <div className="vp-card p-6 mb-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {copy.form.supplier}
                </p>
                <p className="font-medium text-gray-900 dark:text-white">
                  {supplierName}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {copy.table.status}
                </p>
                <span
                  className={`inline-block px-2 py-0.5 text-xs rounded-full font-medium ${getStatusColor(r.status)}`}
                >
                  {copy.status[r.status as keyof typeof copy.status] ||
                    r.status}
                </span>
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {copy.form.documentDate}
                </p>
                <p className="font-medium text-gray-900 dark:text-white">
                  {formatDate(r.documentDate)}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {copy.form.receiptDate}
                </p>
                <p className="font-medium text-gray-900 dark:text-white">
                  {formatDate(r.receiptDate)}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {copy.form.receivedBy}
                </p>
                <p className="font-medium text-gray-900 dark:text-white">
                  {r.receivingUserEmail}
                </p>
              </div>
              {r.notes && (
                <div className="col-span-2">
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {copy.form.notes}
                  </p>
                  <p className="text-gray-900 dark:text-white">{r.notes}</p>
                </div>
              )}
            </div>
          </div>

          {/* Items */}
          <div className="vp-card p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              {copy.items.title} ({r.totalItems})
            </h2>
            <div className="overflow-x-auto">
              <table className="vp-table">
                <thead>
                  <tr>
                    <th>{copy.items.product}</th>
                    <th className="text-right">{copy.items.quantity}</th>
                    <th className="text-right">{copy.items.unitCost}</th>
                    <th className="text-right">{copy.items.subtotal}</th>
                    <th className="text-center">{copy.items.lot}</th>
                  </tr>
                </thead>
                <tbody>
                  {r.items.map((item, idx) => (
                    <tr key={idx}>
                      <td className="py-2 px-3">
                        <span className="font-medium text-gray-900 dark:text-white">
                          {item.productName}
                        </span>
                        <span className="ml-2 text-xs text-gray-500">
                          [{item.productCode}]
                        </span>
                      </td>
                      <td className="py-2 px-3 text-right text-gray-900 dark:text-white">
                        {item.quantity}
                      </td>
                      <td className="py-2 px-3 text-right text-gray-900 dark:text-white">
                        {formatCurrency(item.unitCost)}
                      </td>
                      <td className="py-2 px-3 text-right font-medium text-gray-900 dark:text-white">
                        {formatCurrency(item.subtotal)}
                      </td>
                      <td className="py-2 px-3 text-center text-gray-500 dark:text-gray-400">
                        {item.lot || "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t-2 border-gray-300 dark:border-gray-600">
                    <td
                      colSpan={3}
                      className="py-3 px-3 text-right font-bold text-gray-900 dark:text-white"
                    >
                      {copy.items.total}
                    </td>
                    <td className="py-3 px-3 text-right font-bold text-lg text-blue-600 dark:text-blue-400">
                      {formatCurrency(r.totalAmount)}
                    </td>
                    <td></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </main>

        {/* Cancel Modal */}
        {showCancelModal && (
          <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full p-6">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                {copy.cancelConfirm.title}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                {copy.cancelConfirm.message}
              </p>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {copy.cancelConfirm.reasonLabel}
              </label>
              <input
                type="text"
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white mb-4"
              />
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => {
                    setShowCancelModal(false);
                    setReceiptToCancel(null);
                  }}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                >
                  {copy.cancelConfirm.cancel}
                </button>
                <button
                  onClick={handleCancelReceipt}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                >
                  {copy.cancelConfirm.accept}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ── List View ──────────────────────────────────
  return (
    <div className="vp-page">
      <Header user={user} showBackButton={true} />
      <main className="vp-page-inner">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <ClipboardList className="w-7 h-7 text-blue-600" />
              {copy.title}
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {copy.subtitle}
            </p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="vp-button vp-button-primary px-5"
          >
            <Plus className="w-5 h-5 mr-1" />
            {copy.newReceipt}
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              placeholder={copy.searchPlaceholder}
            />
          </div>
          <div className="flex gap-1 flex-wrap">
            {[
              { value: "", label: copy.filterAll },
              { value: "DRAFT", label: copy.filterDraft },
              { value: "CONFIRMED", label: copy.filterConfirmed },
              { value: "PENDING_BILLING", label: copy.filterPendingBilling },
              { value: "BILLED", label: copy.filterBilled },
              { value: "CANCELLED", label: copy.filterCancelled },
            ].map((f) => (
              <button
                key={f.value}
                onClick={() => setStatusFilter(f.value)}
                className={`px-3 py-1.5 text-sm rounded-lg transition ${
                  statusFilter === f.value
                    ? "bg-blue-600 text-white"
                    : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        {loading ? (
          <div className="text-center py-12 text-gray-400">
            <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-3" />
          </div>
        ) : filteredReceipts.length === 0 ? (
          <div className="text-center py-16 text-gray-400 dark:text-gray-500">
            <ClipboardList className="w-16 h-16 mx-auto mb-3 opacity-40" />
            <p className="text-lg">{copy.empty}</p>
          </div>
        ) : (
          <div className="vp-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="vp-table">
                <thead>
                  <tr>
                    <th>{copy.table.date}</th>
                    <th>{copy.table.supplier}</th>
                    <th>{copy.table.document}</th>
                    <th>{copy.table.type}</th>
                    <th className="text-center">{copy.table.items}</th>
                    <th className="text-right">{copy.table.total}</th>
                    <th className="text-center">{copy.table.status}</th>
                    <th className="text-center">{copy.table.actions}</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredReceipts.map((r) => {
                    const supplierName =
                      typeof r.supplierId === "object"
                        ? r.supplierId.name
                        : "—";
                    return (
                      <tr key={r._id}>
                        <td className="py-3 px-4 text-gray-900 dark:text-white">
                          {formatDate(r.receiptDate)}
                        </td>
                        <td className="py-3 px-4">
                          <span className="font-medium text-gray-900 dark:text-white">
                            {supplierName}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-gray-900 dark:text-white font-mono text-xs">
                          {r.documentNumber}
                        </td>
                        <td className="py-3 px-4 text-gray-600 dark:text-gray-400">
                          {copy.docTypes[
                            r.documentType as keyof typeof copy.docTypes
                          ] || r.documentType}
                        </td>
                        <td className="py-3 px-4 text-center text-gray-900 dark:text-white">
                          {r.totalItems}
                        </td>
                        <td className="py-3 px-4 text-right font-medium text-gray-900 dark:text-white">
                          {formatCurrency(r.totalAmount)}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span
                            className={`inline-block px-2 py-0.5 text-xs rounded-full font-medium ${getStatusColor(r.status)}`}
                          >
                            {copy.status[
                              r.status as keyof typeof copy.status
                            ] || r.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              onClick={() => setViewingReceipt(r)}
                              className="p-1.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition"
                              title={copy.actions.view}
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            {r.status === "DRAFT" && (
                              <button
                                onClick={() => handleConfirmReceipt(r._id)}
                                className="p-1.5 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/30 rounded-lg transition"
                                title={copy.actions.confirm}
                              >
                                <Check className="w-4 h-4" />
                              </button>
                            )}
                            {r.status !== "CANCELLED" && (
                              <button
                                onClick={() => {
                                  setReceiptToCancel(r._id);
                                  setShowCancelModal(true);
                                }}
                                className="p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition"
                                title={copy.actions.cancelReceipt}
                              >
                                <Ban className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {/* Cancel Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="vp-card max-w-md w-full p-6 shadow-xl relative animate-in fade-in zoom-in duration-200">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
              {copy.cancelConfirm.title}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              {copy.cancelConfirm.message}
            </p>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {copy.cancelConfirm.reasonLabel}
            </label>
            <input
              type="text"
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              className="vp-input mb-4"
            />
            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowCancelModal(false);
                  setReceiptToCancel(null);
                }}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
              >
                {copy.cancelConfirm.cancel}
              </button>
              <button
                onClick={handleCancelReceipt}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
              >
                {copy.cancelConfirm.accept}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

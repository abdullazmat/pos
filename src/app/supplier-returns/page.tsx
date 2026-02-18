"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useGlobalLanguage } from "@/lib/hooks/useGlobalLanguage";
import Header from "@/components/layout/Header";
import { toast } from "react-toastify";
import {
  Truck,
  Plus,
  Search,
  ClipboardList,
  Eye,
  Ban,
  Check,
  X,
  ToggleLeft,
  ToggleRight,
  Link2,
} from "lucide-react";

// ...define interfaces for Supplier, Product, ReturnItem, SupplierReturn...

const COPY = {
  pt: {
    title: "Devoluções ao Fornecedor",
    subtitle: "Registre devoluções e ajustes a fornecedores",
    newReturn: "Nova Devolução",
    searchPlaceholder: "Buscar por fornecedor, número de documento...",
    filterAll: "Todos",
    filterDraft: "Rascunho",
    filterConfirmed: "Confirmados",
    filterCancelled: "Cancelados",
    table: {
      date: "Data",
      supplier: "Fornecedor",
      document: "Documento",
      type: "Tipo",
      reason: "Motivo",
      items: "Itens",
      total: "Total",
      status: "Status",
      actions: "Ações",
    },
    status: {
      DRAFT: "Rascunho",
      CONFIRMED: "Confirmado",
      CANCELLED: "Cancelado",
    },
    form: {
      title: "Nova Devolução ao Fornecedor",
      supplier: "Fornecedor *",
      selectSupplier: "Selecionar fornecedor...",
      date: "Data",
      reason: "Motivo *",
      selectReason: "Selecionar motivo...",
      returnType: "Tipo de Devolução",
      notes: "Notas",
      notesPlaceholder: "Observações opcionais...",
      physicalExit: "Saída física de estoque",
      physicalExitYes: "Sim – produto sai do depósito",
      physicalExitNo: "Não – apenas ajuste econômico",
      referenceReceipt: "Referência de Recebimento",
      selectReceipt: "Nenhum (opcional)",
      referenceBill: "Referência de Fatura",
      creditNoteNumber: "Nº Nota de Crédito",
      creditNoteDate: "Data Nota de Crédito",
    },
    reasons: {
      EXPIRED: "Vencido",
      DAMAGED: "Danificado",
      WRONG_DELIVERY: "Entrega errada",
      QUALITY_ISSUE: "Problema de qualidade",
      EXCESS_STOCK: "Estoque excedente",
      BONUS_DISCOUNT: "Bonificação/Desconto",
      PRICE_ADJUSTMENT: "Ajuste de preço",
      OTHER: "Outro",
    },
    returnTypes: {
      PHYSICAL_RETURN: "Devolução Física",
      ECONOMIC_ADJUSTMENT: "Ajuste Econômico",
    },
    items: {
      title: "Produtos",
      product: "Produto",
      quantity: "Quantidade",
      unitCost: "Custo Unitário",
      subtotal: "Subtotal",
      addItem: "Adicionar",
      noItems: "Nenhum produto adicionado.",
      total: "Total",
    },
    actions: {
      save: "Salvar Rascunho",
      confirm: "Confirmar Devolução",
      cancel: "Cancelar",
      cancelReturn: "Cancelar Devolução",
      back: "Voltar",
      view: "Visualizar",
    },
    confirm: {
      title: "Confirmar devolução?",
      message: "O estoque será atualizado e uma nota de crédito será gerada.",
      accept: "Confirmar",
      cancel: "Cancelar",
    },
    cancelConfirm: {
      title: "Cancelar devolução?",
      message: "O impacto no estoque e a nota de crédito serão revertidos.",
      reasonLabel: "Motivo do cancelamento",
      accept: "Cancelar",
      cancel: "Voltar",
    },
    empty: "Nenhuma devolução registrada",
    toasts: {
      createSuccess: "Devolução criada como rascunho",
      confirmSuccess: "Devolução confirmada",
      cancelSuccess: "Devolução cancelada",
      error: "Erro ao processar a devolução",
      missingFields: "Preencha todos os campos obrigatórios",
      noItems: "Adicione pelo menos um produto",
    },
  },
  es: {
    title: "Devoluciones a Proveedor",
    subtitle: "Registra devoluciones y ajustes a proveedores",
    newReturn: "Nueva Devolución",
    searchPlaceholder: "Buscar por proveedor, número de documento...",
    filterAll: "Todos",
    filterDraft: "Borrador",
    filterConfirmed: "Confirmados",
    filterCancelled: "Anulados",
    table: {
      date: "Fecha",
      supplier: "Proveedor",
      document: "Documento",
      type: "Tipo",
      reason: "Motivo",
      items: "Ítems",
      total: "Total",
      status: "Estado",
      actions: "Acciones",
    },
    status: {
      DRAFT: "Borrador",
      CONFIRMED: "Confirmado",
      CANCELLED: "Anulado",
    },
    form: {
      title: "Nueva Devolución a Proveedor",
      supplier: "Proveedor *",
      selectSupplier: "Seleccionar proveedor...",
      date: "Fecha",
      reason: "Motivo *",
      selectReason: "Seleccionar motivo...",
      returnType: "Tipo de Devolución",
      notes: "Notas",
      notesPlaceholder: "Observaciones opcionales...",
      physicalExit: "Salida física de stock",
      physicalExitYes: "Sí – el producto sale del depósito",
      physicalExitNo: "No – solo ajuste económico",
      referenceReceipt: "Referencia de Recepción",
      selectReceipt: "Ninguno (opcional)",
      referenceBill: "Referencia de Factura",
      creditNoteNumber: "Nº Nota de Crédito",
      creditNoteDate: "Fecha Nota de Crédito",
    },
    reasons: {
      EXPIRED: "Vencido",
      DAMAGED: "Dañado",
      WRONG_DELIVERY: "Entrega equivocada",
      QUALITY_ISSUE: "Problema de calidad",
      EXCESS_STOCK: "Excedente de stock",
      BONUS_DISCOUNT: "Bonificación/Descuento",
      PRICE_ADJUSTMENT: "Ajuste de precio",
      OTHER: "Otro",
    },
    returnTypes: {
      PHYSICAL_RETURN: "Devolución Física",
      ECONOMIC_ADJUSTMENT: "Ajuste Económico",
    },
    items: {
      title: "Productos",
      product: "Producto",
      quantity: "Cantidad",
      unitCost: "Costo Unit.",
      subtotal: "Subtotal",
      addItem: "Agregar",
      noItems: "No hay productos agregados.",
      total: "Total",
    },
    actions: {
      save: "Guardar Borrador",
      confirm: "Confirmar Devolución",
      cancel: "Cancelar",
      cancelReturn: "Anular Devolución",
      back: "Volver",
      view: "Ver",
    },
    confirm: {
      title: "¿Confirmar devolución?",
      message:
        "Se impactará el stock y se generará la nota de crédito correspondiente.",
      accept: "Confirmar",
      cancel: "Cancelar",
    },
    cancelConfirm: {
      title: "¿Anular devolución?",
      message:
        "Se revertirá el impacto en stock y la nota de crédito asociada.",
      reasonLabel: "Motivo de anulación",
      accept: "Anular",
      cancel: "Cancelar",
    },
    empty: "No hay devoluciones registradas",
    toasts: {
      createSuccess: "Devolución creada como borrador",
      confirmSuccess: "Devolución confirmada",
      cancelSuccess: "Devolución anulada",
      error: "Error al procesar la devolución",
      missingFields: "Complete todos los campos requeridos",
      noItems: "Agregue al menos un producto",
    },
  },
  en: {
    title: "Supplier Returns",
    subtitle: "Register returns and adjustments to suppliers",
    newReturn: "New Return",
    searchPlaceholder: "Search by supplier, document number...",
    filterAll: "All",
    filterDraft: "Draft",
    filterConfirmed: "Confirmed",
    filterCancelled: "Cancelled",
    table: {
      date: "Date",
      supplier: "Supplier",
      document: "Document",
      type: "Type",
      reason: "Reason",
      items: "Items",
      total: "Total",
      status: "Status",
      actions: "Actions",
    },
    status: {
      DRAFT: "Draft",
      CONFIRMED: "Confirmed",
      CANCELLED: "Cancelled",
    },
    form: {
      title: "New Supplier Return",
      supplier: "Supplier *",
      selectSupplier: "Select supplier...",
      date: "Date",
      reason: "Reason *",
      selectReason: "Select reason...",
      returnType: "Return Type",
      notes: "Notes",
      notesPlaceholder: "Optional notes...",
      physicalExit: "Physical stock exit",
      physicalExitYes: "Yes – product leaves warehouse",
      physicalExitNo: "No – economic adjustment only",
      referenceReceipt: "Receipt Reference",
      selectReceipt: "None (optional)",
      referenceBill: "Bill Reference",
      creditNoteNumber: "Credit Note #",
      creditNoteDate: "Credit Note Date",
    },
    reasons: {
      EXPIRED: "Expired",
      DAMAGED: "Damaged",
      WRONG_DELIVERY: "Wrong Delivery",
      QUALITY_ISSUE: "Quality Issue",
      EXCESS_STOCK: "Excess Stock",
      BONUS_DISCOUNT: "Bonus / Discount",
      PRICE_ADJUSTMENT: "Price Adjustment",
      OTHER: "Other",
    },
    returnTypes: {
      PHYSICAL_RETURN: "Physical Return",
      ECONOMIC_ADJUSTMENT: "Economic Adjustment",
    },
    items: {
      title: "Products",
      product: "Product",
      quantity: "Quantity",
      unitCost: "Unit Cost",
      subtotal: "Subtotal",
      addItem: "Add",
      noItems: "No products added.",
      total: "Total",
    },
    actions: {
      save: "Save Draft",
      confirm: "Confirm Return",
      cancel: "Cancel",
      cancelReturn: "Cancel Return",
      back: "Back",
      view: "View",
    },
    confirm: {
      title: "Confirm return?",
      message: "Stock will be updated and a credit note will be generated.",
      accept: "Confirm",
      cancel: "Cancel",
    },
    cancelConfirm: {
      title: "Cancel return?",
      message: "Stock impact and credit note will be reversed.",
      reasonLabel: "Cancellation reason",
      accept: "Cancel",
      cancel: "Go Back",
    },
    empty: "No returns registered",
    toasts: {
      createSuccess: "Return created as draft",
      confirmSuccess: "Return confirmed",
      cancelSuccess: "Return cancelled",
      error: "Error processing return",
      missingFields: "Please fill all required fields",
      noItems: "Add at least one product",
    },
  },
} as const;

// ...component implementation would follow the same patterns as goods-receipts/page.tsx...

// --- Types ---
type Lang = keyof typeof COPY;
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
interface ReturnItem {
  productId: string;
  productName: string;
  productCode: string;
  quantity: number;
  unitCost: number;
  subtotal: number;
}
interface SupplierReturn {
  _id: string;
  supplierId: { _id: string; name: string; document?: string } | string;
  documentNumber: string;
  returnDate: string;
  returnType?: string;
  reason?: string;
  physicalStockExit?: boolean;
  receiptId?: { _id: string; documentNumber: string; documentType: string } | string;
  creditNoteNumber?: string;
  creditNoteDate?: string;
  notes?: string;
  items: ReturnItem[];
  totalAmount: number;
  totalItems: number;
  status: string;
  createdAt: string;
}
interface GoodsReceiptRef {
  _id: string;
  documentNumber: string;
  documentType: string;
  status: string;
}

export default function SupplierReturnsPage() {
  const router = useRouter();
  const { currentLanguage } = useGlobalLanguage();
  const lang = (currentLanguage || "es") as Lang;
  const copy = COPY[lang] || COPY.es;

  const scanInputRef = useRef<HTMLInputElement>(null);
  const [mounted, setMounted] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // List view
  const [returns, setReturns] = useState<SupplierReturn[]>([]);
  const [statusFilter, setStatusFilter] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  // Form view
  const [showForm, setShowForm] = useState(false);
  const [viewingReturn, setViewingReturn] = useState<SupplierReturn | null>(
    null,
  );

  // Header fields
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedSupplierId, setSelectedSupplierId] = useState("");
  const [documentNumber, setDocumentNumber] = useState("");
  const [returnDate, setReturnDate] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [notes, setNotes] = useState("");
  const [reason, setReason] = useState("");
  const [physicalStockExit, setPhysicalStockExit] = useState(true);
  const [receiptId, setReceiptId] = useState("");
  const [creditNoteNumber, setCreditNoteNumber] = useState("");
  const [creditNoteDate, setCreditNoteDate] = useState("");
  const [receipts, setReceipts] = useState<GoodsReceiptRef[]>([]);

  // Item input
  const [items, setItems] = useState<ReturnItem[]>([]);
  const [scanQuery, setScanQuery] = useState("");
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [itemQuantity, setItemQuantity] = useState<number>(1);
  const [itemUnitCost, setItemUnitCost] = useState<number>(0);
  const [showProductDropdown, setShowProductDropdown] = useState(false);

  // Modals
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [returnToCancel, setReturnToCancel] = useState<string | null>(null);

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
    fetchReturns();
    fetchSuppliers();
    fetchProducts();
  }, [router, mounted]);

  useEffect(() => {
    fetchReturns();
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

  const fetchReturns = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("accessToken");
      const params = new URLSearchParams();
      if (statusFilter) params.set("status", statusFilter);
      const res = await fetch(`/api/supplier-returns?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setReturns(data.data?.returns || []);
      }
    } catch (error) {
      console.error("Error fetching returns:", error);
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
  const fetchReceipts = async (suppId?: string) => {
    const sid = suppId || selectedSupplierId;
    if (!sid) {
      setReceipts([]);
      return;
    }
    try {
      const token = localStorage.getItem("accessToken");
      const res = await fetch(
        `/api/goods-receipts?supplierId=${sid}&limit=200`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      if (res.ok) {
        const data = await res.json();
        const all = data.data?.receipts || [];
        // Only show confirmed/billed receipts as linkable references
        setReceipts(
          all.filter(
            (r: GoodsReceiptRef) =>
              r.status === "CONFIRMED" ||
              r.status === "PENDING_BILLING" ||
              r.status === "BILLED",
          ),
        );
      }
    } catch (error) {
      console.error("Error fetching receipts:", error);
    }
  };

  // Refetch receipts when supplier changes
  useEffect(() => {
    if (selectedSupplierId) {
      fetchReceipts(selectedSupplierId);
    } else {
      setReceipts([]);
      setReceiptId("");
    }
  }, [selectedSupplierId]);
  const handleSelectProduct = (product: Product) => {
    setSelectedProduct(product);
    setScanQuery(product.name);
    setItemUnitCost(product.cost);
    setItemQuantity(1);
    setShowProductDropdown(false);
    setTimeout(() => {
      const qtyInput = document.getElementById("item-quantity-input");
      qtyInput?.focus();
    }, 50);
  };
  const handleScanKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && scanQuery.trim()) {
      e.preventDefault();
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
    const newItem: ReturnItem = {
      productId: selectedProduct._id,
      productName: selectedProduct.name,
      productCode: selectedProduct.code,
      quantity: itemQuantity,
      unitCost: itemUnitCost,
      subtotal: itemQuantity * itemUnitCost,
    };
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
    setSelectedProduct(null);
    setScanQuery("");
    setItemQuantity(1);
    setItemUnitCost(0);
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
    setViewingReturn(null);
    setSelectedSupplierId("");
    setDocumentNumber("");
    setReturnDate(new Date().toISOString().split("T")[0]);
    setNotes("");
    setReason("");
    setPhysicalStockExit(true);
    setReceiptId("");
    setCreditNoteNumber("");
    setCreditNoteDate("");
    setReceipts([]);
    setItems([]);
    setSelectedProduct(null);
    setScanQuery("");
  };
  const handleSaveDraft = async () => {
    if (!selectedSupplierId || !reason) {
      toast.error(copy.toasts.missingFields);
      return;
    }
    if (items.length === 0) {
      toast.error(copy.toasts.noItems);
      return;
    }
    try {
      const token = localStorage.getItem("accessToken");
      const res = await fetch("/api/supplier-returns", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          supplierId: selectedSupplierId,
          date: returnDate,
          returnType: physicalStockExit
            ? "PHYSICAL_RETURN"
            : "ECONOMIC_ADJUSTMENT",
          reason,
          physicalStockExit,
          notes,
          receiptId: receiptId || undefined,
          creditNoteNumber: creditNoteNumber || undefined,
          creditNoteDate: creditNoteDate || undefined,
          items: items.map((i) => ({
            productId: i.productId,
            productName: i.productName,
            productCode: i.productCode,
            quantity: i.quantity,
            unitCost: i.unitCost,
          })),
        }),
      });
      if (res.ok) {
        toast.success(copy.toasts.createSuccess);
        resetForm();
        fetchReturns();
      } else {
        const data = await res.json();
        toast.error(data.error || copy.toasts.error);
      }
    } catch (error) {
      console.error("Error saving return:", error);
      toast.error(copy.toasts.error);
    }
  };
  const handleConfirmReturn = async (returnId: string) => {
    try {
      const token = localStorage.getItem("accessToken");
      const res = await fetch(`/api/supplier-returns/${returnId}`, {
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
        fetchReturns();
      } else {
        const data = await res.json();
        toast.error(data.error || copy.toasts.error);
      }
    } catch (error) {
      console.error("Error confirming return:", error);
      toast.error(copy.toasts.error);
    }
  };
  const handleCancelReturn = async () => {
    if (!returnToCancel) return;
    try {
      const token = localStorage.getItem("accessToken");
      const res = await fetch(`/api/supplier-returns/${returnToCancel}`, {
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
        setReturnToCancel(null);
        setCancelReason("");
        fetchReturns();
      } else {
        const data = await res.json();
        toast.error(data.error || copy.toasts.error);
      }
    } catch (error) {
      console.error("Error cancelling return:", error);
      toast.error(copy.toasts.error);
    }
  };
  const filteredReturns = returns.filter((r) => {
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
        return "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300";
      case "CONFIRMED":
        return "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300";
      case "CANCELLED":
        return "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };
  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat(
      lang === "en" ? "en-US" : lang === "pt" ? "pt-BR" : "es-AR",
      { style: "currency", currency: lang === "pt" ? "BRL" : "ARS" },
    ).format(amount);
  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString(
      lang === "en" ? "en-US" : lang === "pt" ? "pt-BR" : "es-AR",
    );
  if (!mounted) return null;

  // ── Form View ──────────────────────────────────
  if (showForm) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Header user={user} />
        <main className="max-w-6xl px-4 py-6 mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                {copy.form.title}
              </h1>
            </div>
            <button
              onClick={resetForm}
              className="px-4 py-2 text-gray-600 transition rounded-lg dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              {copy.actions.back}
            </button>
          </div>
          {/* Return Header Fields */}
          <div className="p-6 mb-6 bg-white border border-gray-200 shadow-sm dark:bg-gray-800 rounded-xl dark:border-gray-700">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {/* Supplier */}
              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                  {copy.form.supplier}
                </label>
                <select
                  value={selectedSupplierId}
                  onChange={(e) => setSelectedSupplierId(e.target.value)}
                  className="w-full px-3 py-2 text-gray-900 bg-white border border-gray-300 rounded-lg dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">{copy.form.selectSupplier}</option>
                  {suppliers.map((s) => (
                    <option key={s._id} value={s._id}>
                      {s.name} {s.document ? `(${s.document})` : ""}
                    </option>
                  ))}
                </select>
              </div>
              {/* Reason */}
              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                  {copy.form.reason}
                </label>
                <select
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full px-3 py-2 text-gray-900 bg-white border border-gray-300 rounded-lg dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">{copy.form.selectReason}</option>
                  {Object.entries(copy.reasons).map(([key, label]) => (
                    <option key={key} value={key}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>
              {/* Return Date */}
              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                  {copy.form.date}
                </label>
                <input
                  type="date"
                  value={returnDate}
                  onChange={(e) => setReturnDate(e.target.value)}
                  className="w-full px-3 py-2 text-gray-900 bg-white border border-gray-300 rounded-lg dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Physical Stock Exit Toggle */}
            <div className="mt-4">
              <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                {copy.form.physicalExit}
              </label>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setPhysicalStockExit(true)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium transition ${
                    physicalStockExit
                      ? "bg-blue-50 border-blue-500 text-blue-700 dark:bg-blue-900/30 dark:border-blue-400 dark:text-blue-300"
                      : "bg-white border-gray-300 text-gray-600 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-600"
                  }`}
                >
                  <ToggleRight className="w-4 h-4" />
                  {copy.form.physicalExitYes}
                </button>
                <button
                  type="button"
                  onClick={() => setPhysicalStockExit(false)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium transition ${
                    !physicalStockExit
                      ? "bg-amber-50 border-amber-500 text-amber-700 dark:bg-amber-900/30 dark:border-amber-400 dark:text-amber-300"
                      : "bg-white border-gray-300 text-gray-600 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-600"
                  }`}
                >
                  <ToggleLeft className="w-4 h-4" />
                  {copy.form.physicalExitNo}
                </button>
              </div>
            </div>

            {/* Receipt Reference + Credit Note Row */}
            <div className="grid grid-cols-1 gap-4 mt-4 md:grid-cols-2 lg:grid-cols-3">
              {/* Receipt Reference */}
              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                  <span className="flex items-center gap-1">
                    <Link2 className="w-3.5 h-3.5" />
                    {copy.form.referenceReceipt}
                  </span>
                </label>
                <select
                  value={receiptId}
                  onChange={(e) => setReceiptId(e.target.value)}
                  className="w-full px-3 py-2 text-gray-900 bg-white border border-gray-300 rounded-lg dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500"
                  disabled={!selectedSupplierId}
                >
                  <option value="">{copy.form.selectReceipt}</option>
                  {receipts.map((r) => (
                    <option key={r._id} value={r._id}>
                      {r.documentType} — {r.documentNumber}
                    </option>
                  ))}
                </select>
              </div>
              {/* Credit Note Number */}
              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                  {copy.form.creditNoteNumber}
                </label>
                <input
                  type="text"
                  value={creditNoteNumber}
                  onChange={(e) => setCreditNoteNumber(e.target.value)}
                  className="w-full px-3 py-2 text-gray-900 bg-white border border-gray-300 rounded-lg dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500"
                  placeholder="NC-0001-00000001"
                />
              </div>
              {/* Credit Note Date */}
              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                  {copy.form.creditNoteDate}
                </label>
                <input
                  type="date"
                  value={creditNoteDate}
                  onChange={(e) => setCreditNoteDate(e.target.value)}
                  className="w-full px-3 py-2 text-gray-900 bg-white border border-gray-300 rounded-lg dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Notes */}
            <div className="mt-4">
              <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                {copy.form.notes}
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
                className="w-full px-3 py-2 text-gray-900 bg-white border border-gray-300 rounded-lg dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500"
                placeholder={copy.form.notesPlaceholder}
              />
            </div>
          </div>
          {/* Product Entry Section */}
          <div className="p-6 mb-6 bg-white border border-gray-200 shadow-sm dark:bg-gray-800 rounded-xl dark:border-gray-700">
            <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
              {copy.items.title}
            </h2>
            {/* Scan / Search Bar */}
            <div className="grid items-end grid-cols-1 gap-3 mb-4 md:grid-cols-12">
              <div className="relative md:col-span-4">
                <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
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
                    className="w-full py-2 pl-10 pr-3 text-gray-900 bg-white border border-gray-300 rounded-lg dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500"
                    placeholder={copy.searchPlaceholder}
                  />
                </div>
                {/* Product Dropdown */}
                {showProductDropdown && (
                  <div className="absolute z-20 w-full mt-1 overflow-y-auto bg-white border border-gray-200 rounded-lg shadow-xl dark:bg-gray-800 dark:border-gray-600 max-h-60">
                    {filteredProducts.map((p) => (
                      <button
                        key={p._id}
                        onClick={() => handleSelectProduct(p)}
                        className="w-full px-4 py-2 text-sm text-left text-gray-900 border-b border-gray-100 hover:bg-blue-50 dark:hover:bg-gray-700 dark:text-white dark:border-gray-700 last:border-0"
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
                <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
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
                  className="w-full px-3 py-2 text-gray-900 bg-white border border-gray-300 rounded-lg dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
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
                  className="w-full px-3 py-2 text-gray-900 bg-white border border-gray-300 rounded-lg dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex items-end md:col-span-2">
                <button
                  onClick={addItem}
                  disabled={!selectedProduct || itemQuantity <= 0}
                  className="flex items-center justify-center w-full gap-2 px-4 py-2 text-white transition bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Plus className="w-4 h-4" />
                  {copy.items.addItem}
                </button>
              </div>
            </div>
            {/* Items Table */}
            {items.length === 0 ? (
              <div className="py-8 text-center text-gray-400 dark:text-gray-500">
                <ClipboardList className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>{copy.items.noItems}</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-700">
                      <th className="px-3 py-2 font-medium text-left text-gray-600 dark:text-gray-400">
                        {copy.items.product}
                      </th>
                      <th className="px-3 py-2 font-medium text-right text-gray-600 dark:text-gray-400">
                        {copy.items.quantity}
                      </th>
                      <th className="px-3 py-2 font-medium text-right text-gray-600 dark:text-gray-400">
                        {copy.items.unitCost}
                      </th>
                      <th className="px-3 py-2 font-medium text-right text-gray-600 dark:text-gray-400">
                        {copy.items.subtotal}
                      </th>
                      <th className="w-10"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item, idx) => (
                      <tr
                        key={idx}
                        className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-750"
                      >
                        <td className="px-3 py-2">
                          <div className="font-medium text-gray-900 dark:text-white">
                            {item.productName}
                          </div>
                          <div className="text-xs text-gray-500">
                            {item.productCode}
                          </div>
                        </td>
                        <td className="px-3 py-2 text-right text-gray-900 dark:text-white">
                          {item.quantity}
                        </td>
                        <td className="px-3 py-2 text-right text-gray-900 dark:text-white">
                          {formatCurrency(item.unitCost)}
                        </td>
                        <td className="px-3 py-2 font-medium text-right text-gray-900 dark:text-white">
                          {formatCurrency(item.subtotal)}
                        </td>
                        <td className="px-3 py-2 text-center">
                          <button
                            onClick={() => removeItem(idx)}
                            className="text-red-400 transition hover:text-red-600"
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
                        colSpan={2}
                        className="px-3 py-3 font-bold text-right text-gray-900 dark:text-white"
                      >
                        {copy.items.total}
                      </td>
                      <td className="px-3 py-3 text-lg font-bold text-right text-blue-600 dark:text-blue-400">
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
              className="px-6 py-2.5 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition"
            >
              {copy.actions.cancel}
            </button>
            <button
              onClick={handleSaveDraft}
              className="px-6 py-2.5 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition"
            >
              {copy.actions.save}
            </button>
          </div>
        </main>
      </div>
    );
  }

  // ── Detail View ────────────────────────────────
  if (viewingReturn) {
    const r = viewingReturn;
    const supplierName =
      typeof r.supplierId === "object" ? r.supplierId.name : "—";
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Header user={user} />
        <main className="max-w-5xl px-4 py-6 mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                {copy.form.title}
              </h1>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                {r.documentNumber}
              </p>
            </div>
            <div className="flex gap-2">
              {r.status === "DRAFT" && (
                <button
                  onClick={() => handleConfirmReturn(r._id)}
                  className="flex items-center gap-2 px-4 py-2 text-white transition bg-green-600 rounded-lg hover:bg-green-700"
                >
                  <Check className="w-4 h-4" />
                  {copy.actions.confirm}
                </button>
              )}
              {r.status !== "CANCELLED" && (
                <button
                  onClick={() => {
                    setReturnToCancel(r._id);
                    setShowCancelModal(true);
                  }}
                  className="flex items-center gap-2 px-4 py-2 text-white transition bg-red-600 rounded-lg hover:bg-red-700"
                >
                  <Ban className="w-4 h-4" />
                  {copy.actions.cancelReturn}
                </button>
              )}
              <button
                onClick={() => setViewingReturn(null)}
                className="px-4 py-2 text-gray-600 transition rounded-lg dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                {copy.actions.back}
              </button>
            </div>
          </div>
          {/* Return Info */}
          <div className="p-6 mb-6 bg-white border border-gray-200 shadow-sm dark:bg-gray-800 rounded-xl dark:border-gray-700">
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
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
                  {copy.form.date}
                </p>
                <p className="font-medium text-gray-900 dark:text-white">
                  {formatDate(r.returnDate)}
                </p>
              </div>
              {r.reason && (
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {copy.form.reason}
                  </p>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {copy.reasons[r.reason as keyof typeof copy.reasons] || r.reason}
                  </p>
                </div>
              )}
              {r.returnType && (
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {copy.form.returnType}
                  </p>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {copy.returnTypes[r.returnType as keyof typeof copy.returnTypes] || r.returnType}
                  </p>
                </div>
              )}
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {copy.form.physicalExit}
                </p>
                <p className="font-medium text-gray-900 dark:text-white">
                  {r.physicalStockExit ? copy.form.physicalExitYes : copy.form.physicalExitNo}
                </p>
              </div>
              {r.creditNoteNumber && (
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {copy.form.creditNoteNumber}
                  </p>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {r.creditNoteNumber}
                  </p>
                </div>
              )}
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
          <div className="p-6 bg-white border border-gray-200 shadow-sm dark:bg-gray-800 rounded-xl dark:border-gray-700">
            <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
              {copy.items.title} ({r.totalItems})
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="px-3 py-2 font-medium text-left text-gray-600 dark:text-gray-400">
                      {copy.items.product}
                    </th>
                    <th className="px-3 py-2 font-medium text-right text-gray-600 dark:text-gray-400">
                      {copy.items.quantity}
                    </th>
                    <th className="px-3 py-2 font-medium text-right text-gray-600 dark:text-gray-400">
                      {copy.items.unitCost}
                    </th>
                    <th className="px-3 py-2 font-medium text-right text-gray-600 dark:text-gray-400">
                      {copy.items.subtotal}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {r.items.map((item, idx) => (
                    <tr
                      key={idx}
                      className="border-b border-gray-100 dark:border-gray-700"
                    >
                      <td className="px-3 py-2">
                        <span className="font-medium text-gray-900 dark:text-white">
                          {item.productName}
                        </span>
                        <span className="ml-2 text-xs text-gray-500">
                          [{item.productCode}]
                        </span>
                      </td>
                      <td className="px-3 py-2 text-right text-gray-900 dark:text-white">
                        {item.quantity}
                      </td>
                      <td className="px-3 py-2 text-right text-gray-900 dark:text-white">
                        {formatCurrency(item.unitCost)}
                      </td>
                      <td className="px-3 py-2 font-medium text-right text-gray-900 dark:text-white">
                        {formatCurrency(item.subtotal)}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t-2 border-gray-300 dark:border-gray-600">
                    <td
                      colSpan={2}
                      className="px-3 py-3 font-bold text-right text-gray-900 dark:text-white"
                    >
                      {copy.items.total}
                    </td>
                    <td className="px-3 py-3 text-lg font-bold text-right text-blue-600 dark:text-blue-400">
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
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
            <div className="w-full max-w-md p-6 bg-white shadow-xl dark:bg-gray-800 rounded-xl">
              <h3 className="mb-2 text-lg font-bold text-gray-900 dark:text-white">
                {copy.cancelConfirm.title}
              </h3>
              <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">
                {copy.cancelConfirm.message}
              </p>
              <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                {copy.cancelConfirm.reasonLabel}
              </label>
              <input
                type="text"
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                className="w-full px-3 py-2 mb-4 text-gray-900 bg-white border border-gray-300 rounded-lg dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              />
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => {
                    setShowCancelModal(false);
                    setReturnToCancel(null);
                  }}
                  className="px-4 py-2 text-gray-700 transition border border-gray-300 rounded-lg dark:border-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  {copy.cancelConfirm.cancel}
                </button>
                <button
                  onClick={handleCancelReturn}
                  className="px-4 py-2 text-white transition bg-red-600 rounded-lg hover:bg-red-700"
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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header user={user} />
      <main className="px-4 py-8 mx-auto max-w-7xl">
        {/* Page Header */}
        <div className="flex flex-col items-start justify-between gap-4 mb-6 sm:flex-row sm:items-center">
          <div>
            <h1 className="flex items-center gap-2 text-2xl font-bold text-gray-900 dark:text-white">
              <Truck className="text-blue-600 w-7 h-7" />
              {copy.title}
            </h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {copy.subtitle}
            </p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2 shadow-sm"
          >
            <Plus className="w-4 h-4" />
            {copy.newReturn}
          </button>
        </div>
        {/* Filters */}
        <div className="flex flex-col gap-3 mb-6 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full py-2 pl-10 pr-3 text-gray-900 bg-white border border-gray-300 rounded-lg dark:border-gray-600 dark:bg-gray-800 dark:text-white"
              placeholder={copy.searchPlaceholder}
            />
          </div>
          <div className="flex flex-wrap gap-1">
            {[
              { value: "", label: copy.filterAll },
              { value: "DRAFT", label: copy.filterDraft },
              { value: "CONFIRMED", label: copy.filterConfirmed },
              { value: "CANCELLED", label: copy.filterCancelled },
            ].map((f) => (
              <button
                key={f.value}
                onClick={() => setStatusFilter(f.value)}
                className={`px-3 py-1.5 text-sm rounded-lg transition ${statusFilter === f.value ? "bg-blue-600 text-white" : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-750"}`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
        {/* Table */}
        {loading ? (
          <div className="py-12 text-center text-gray-400">
            <div className="w-8 h-8 mx-auto mb-3 border-4 border-blue-500 rounded-full animate-spin border-t-transparent" />
          </div>
        ) : filteredReturns.length === 0 ? (
          <div className="py-16 text-center text-gray-400 dark:text-gray-500">
            <ClipboardList className="w-16 h-16 mx-auto mb-3 opacity-40" />
            <p className="text-lg">{copy.empty}</p>
          </div>
        ) : (
          <div className="overflow-hidden bg-white border border-gray-200 shadow-sm dark:bg-gray-800 rounded-xl dark:border-gray-700">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50 dark:bg-gray-750 dark:border-gray-700">
                    <th className="px-4 py-3 font-medium text-left text-gray-600 dark:text-gray-400">
                      {copy.table.date}
                    </th>
                    <th className="px-4 py-3 font-medium text-left text-gray-600 dark:text-gray-400">
                      {copy.table.supplier}
                    </th>
                    <th className="px-4 py-3 font-medium text-left text-gray-600 dark:text-gray-400">
                      {copy.table.document}
                    </th>
                    <th className="px-4 py-3 font-medium text-left text-gray-600 dark:text-gray-400">
                      {copy.table.reason}
                    </th>
                    <th className="px-4 py-3 font-medium text-center text-gray-600 dark:text-gray-400">
                      {copy.table.items}
                    </th>
                    <th className="px-4 py-3 font-medium text-right text-gray-600 dark:text-gray-400">
                      {copy.table.total}
                    </th>
                    <th className="px-4 py-3 font-medium text-center text-gray-600 dark:text-gray-400">
                      {copy.table.status}
                    </th>
                    <th className="px-4 py-3 font-medium text-center text-gray-600 dark:text-gray-400">
                      {copy.table.actions}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredReturns.map((r) => {
                    const supplierName =
                      typeof r.supplierId === "object"
                        ? r.supplierId.name
                        : "—";
                    return (
                      <tr
                        key={r._id}
                        className="transition-colors border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-750"
                      >
                        <td className="px-4 py-3 text-gray-900 dark:text-white">
                          {formatDate(r.returnDate)}
                        </td>
                        <td className="px-4 py-3">
                          <span className="font-medium text-gray-900 dark:text-white">
                            {supplierName}
                          </span>
                        </td>
                        <td className="px-4 py-3 font-mono text-xs text-gray-900 dark:text-white">
                          {r.documentNumber}
                        </td>
                        <td className="px-4 py-3 text-gray-500 dark:text-gray-400">
                          {copy.reasons[r.reason as keyof typeof copy.reasons] || r.reason}
                        </td>
                        <td className="px-4 py-3 text-center text-gray-900 dark:text-white">
                          {r.totalItems}
                        </td>
                        <td className="px-4 py-3 font-medium text-right text-gray-900 dark:text-white">
                          {formatCurrency(r.totalAmount)}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span
                            className={`inline-block px-2 py-0.5 text-xs rounded-full font-medium ${getStatusColor(r.status)}`}
                          >
                            {copy.status[
                              r.status as keyof typeof copy.status
                            ] || r.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              onClick={() => setViewingReturn(r)}
                              className="p-1.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition"
                              title={copy.actions.view}
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            {r.status === "DRAFT" && (
                              <button
                                onClick={() => handleConfirmReturn(r._id)}
                                className="p-1.5 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/30 rounded-lg transition"
                                title={copy.actions.confirm}
                              >
                                <Check className="w-4 h-4" />
                              </button>
                            )}
                            {r.status !== "CANCELLED" && (
                              <button
                                onClick={() => {
                                  setReturnToCancel(r._id);
                                  setShowCancelModal(true);
                                }}
                                className="p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition"
                                title={copy.actions.cancelReturn}
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="w-full max-w-md p-6 bg-white shadow-xl dark:bg-gray-800 rounded-xl">
            <h3 className="mb-2 text-lg font-bold text-gray-900 dark:text-white">
              {copy.cancelConfirm.title}
            </h3>
            <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">
              {copy.cancelConfirm.message}
            </p>
            <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
              {copy.cancelConfirm.reasonLabel}
            </label>
            <input
              type="text"
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              className="w-full px-3 py-2 mb-4 text-gray-900 bg-white border border-gray-300 rounded-lg dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            />
            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowCancelModal(false);
                  setReturnToCancel(null);
                }}
                className="px-4 py-2 text-gray-700 transition border border-gray-300 rounded-lg dark:border-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                {copy.cancelConfirm.cancel}
              </button>
              <button
                onClick={handleCancelReturn}
                className="px-4 py-2 text-white transition bg-red-600 rounded-lg hover:bg-red-700"
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

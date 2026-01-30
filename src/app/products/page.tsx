"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import { useGlobalLanguage } from "@/lib/hooks/useGlobalLanguage";
import Header from "@/components/layout/Header";
import {
  Search,
  LayoutGrid,
  Rows,
  Plus,
  RefreshCw,
  Lock,
  Trash2,
  Pencil,
} from "lucide-react";
import { toast } from "react-toastify";
import {
  UpgradePrompt,
  LimitReachedPrompt,
} from "@/components/common/UpgradePrompt";
import {
  PLAN_FEATURES,
  getRemainingCount,
  isLimitReached,
} from "@/lib/utils/planFeatures";
import { parseNumberInput } from "@/lib/utils/decimalFormatter";

const PRODUCT_COPY = {
  es: {
    headerTitle: "Gestión de Productos",
    headerSubtitle: "Administra tu catálogo de productos",
    refreshLabel: "Refrescar",
    importButton: "Importar Excel",
    newButton: "Nuevo Producto",
    planLabel: (count: number) => `${count}/100 productos - Gratuito`,
    searchPlaceholder: "Buscar por nombre, código de barras o descripción...",
    importModal: {
      title: "Importar Productos desde Excel/CSV",
      subtitle: "Sube tu archivo, revisa la vista previa y confirma.",
      instructionsTitle: "Instrucciones",
      steps: [
        "Descarga la plantilla CSV con el botón inferior.",
        "Completa los datos de tus productos en el archivo.",
        "Guarda el archivo como CSV (separado por comas).",
        "Sube el archivo usando 'Seleccionar Archivo'.",
        "Revisa la vista previa y confirma la importación.",
      ],
      downloadTemplate: "Descargar Plantilla CSV",
      selectedFile: "Archivo seleccionado:",
      dropTitle: "Arrastra un archivo CSV aquí o haz clic para seleccionar",
      dropSubtitle: "Formatos soportados: .csv, .xlsx, .xls",
      selectFile: "Seleccionar Archivo",
      csvFormatTitle: "Formato del archivo CSV",
      requiredTitle: "Columnas requeridas:",
      requiredList: [
        "1. nombre (texto)",
        "2. descripcion (texto, opcional)",
        "3. costo (número)",
        "4. precio (número)",
        "5. stock (número)",
      ],
      optionalTitle: "Opcionales:",
      optionalList: [
        "6. codigo (texto, opcional - se autogenera automáticamente)",
        "7. minStock (número)",
        "8. categoria (texto)",
        "9. activo (true/false)",
        "10. seVendePorPeso (true/false)",
      ],
      cancel: "Cancelar",
      confirm: "Importar Archivo",
      confirming: "Importando...",
    },
    form: {
      newTitle: "Nuevo Producto",
      editTitle: "Editar Producto",
      namePlaceholder: "Ingrese el nombre del producto",
      descPlaceholder: "Descripción del producto (opcional)",
      barcodePlaceholder: "Código de barras (opcional)",
      categoryPlaceholder: "Sin categoría",
      costLabel: "Costo de Compra",
      marginLabel: "Margen de Ganancia (%)",
      priceLabel: "Precio de Venta",
      priceHint: "Se calcula automáticamente",
      stockLabel: "Stock Inicial",
      stockUnitHint: "(en unidades)",
      stockPlaceholder: "Ej: 100",
      codeLabel: "Código",
      codePlaceholder: "Código automático (ej: 0009)",
      codeHint: "Se asigna automáticamente (ej: 0009)",
      minStockLabel: "Stock Mínimo",
      minStockHint: "(en unidades)",
      minStockPlaceholder: "5",
      minStockHelper: "Nivel para alertas de stock bajo",
      activeLabel: "Producto activo",
      weightLabel:
        "Se vende por peso (kg) - Ej: verduras, fiambres, alimento de perros",
      weightHelpEnabled:
        "✓ Decimales habilitados (máx. 4 lugares). Ejemplos: 1.254 kg, 0.750 kg. También puedes usar separadores de miles.",
      weightHelpDisabled:
        "Habilitar para productos vendidos por peso/volumen. Admite cantidades decimales (máx. 3 decimales).",
      cancel: "Cancelar",
      saveNew: "Crear Producto",
      saveEdit: "Actualizar Producto",
    },
    table: {
      product: "Producto",
      code: "Código",
      stock: "Stock",
      status: "Estado",
      cost: "Precio Costo",
      price: "Precio Venta",
      margin: "Margen",
      actions: "Acciones",
      normal: "Normal",
      outOfStock: "Sin Stock",
    },
    empty: {
      title: "No se encontraron productos.",
      subtitle: "Intentá cambiar la búsqueda o agregar un producto.",
    },
    deleteModal: {
      title: "Eliminar Producto",
      subtitle: "Esta acción no se puede deshacer",
      question: "¿Estás seguro de que deseas eliminar el producto",
      confirm: "Eliminar",
      cancel: "Cancelar",
    },
    upgrade: {
      feature: "Productos Ilimitados",
      reason:
        "Tu plan Free tiene un límite de 100 productos. Actualiza a Pro para acceso ilimitado.",
    },
    limit: {
      limitName: "Productos",
    },
    toast: {
      duplicateNameOrBarcode:
        "Ya existe un producto con el mismo nombre o código de barras.",
      duplicateCode: "Ya existe un producto con el mismo código.",
      limitReached: "Has alcanzado el límite de productos de tu plan.",
      duplicateCodeOrBarcode:
        "Ya existe un producto con el mismo código o código de barras.",
      missingRequired: "Faltan campos obligatorios.",
      productNotFound: "Producto no encontrado.",
      selectFile: "Selecciona un archivo CSV o Excel",
      sessionExpired: "Sesión expirada. Inicia sesión nuevamente.",
      importing: "Importando archivo...",
      importError: "Error al importar el archivo",
      importSuccess: "Archivo importado correctamente",
      saveError: "Error al guardar el producto",
      saveSuccess: "¡Producto creado exitosamente!",
      updateSuccess: "Producto actualizado",
      deleteSuccess: "Producto eliminado exitosamente",
      deleteError: "Error al eliminar producto",
    },
  },
  en: {
    headerTitle: "Product Management",
    headerSubtitle: "Manage your product catalog",
    refreshLabel: "Refresh",
    importButton: "Import Excel/CSV",
    newButton: "New Product",
    planLabel: (count: number) => `${count}/100 products - Free tier`,
    searchPlaceholder: "Search by name, barcode, or description...",
    importModal: {
      title: "Import Products from Excel/CSV",
      subtitle: "Upload your file, preview, and confirm.",
      instructionsTitle: "Instructions",
      steps: [
        "Download the CSV template using the button below.",
        "Fill your product data in the file.",
        "Save the file as CSV (comma separated).",
        "Upload using 'Select File'.",
        "Review the preview and confirm the import.",
      ],
      downloadTemplate: "Download CSV Template",
      selectedFile: "Selected file:",
      dropTitle: "Drag a CSV here or click to select",
      dropSubtitle: "Supported formats: .csv, .xlsx, .xls",
      selectFile: "Select File",
      csvFormatTitle: "CSV file format",
      requiredTitle: "Required columns:",
      requiredList: [
        "1. nombre (text)",
        "2. descripcion (text, optional)",
        "3. costo (number)",
        "4. precio (number)",
        "5. stock (number)",
      ],
      optionalTitle: "Optional:",
      optionalList: [
        "6. codigo (text, optional - auto-generated automatically)",
        "7. minStock (number)",
        "8. categoria (text)",
        "9. activo (true/false)",
        "10. seVendePorPeso (true/false)",
      ],
      cancel: "Cancel",
      confirm: "Import File",
      confirming: "Importing...",
    },
    form: {
      newTitle: "New Product",
      editTitle: "Edit Product",
      namePlaceholder: "Enter the product name",
      descPlaceholder: "Product description (optional)",
      barcodePlaceholder: "Barcode (optional)",
      categoryPlaceholder: "No category",
      costLabel: "Cost",
      marginLabel: "Margin (%)",
      priceLabel: "Sale Price",
      priceHint: "Calculated automatically",
      stockLabel: "Opening Stock",
      stockUnitHint: "(units)",
      stockPlaceholder: "e.g., 100",
      codeLabel: "Code",
      codePlaceholder: "Automatic code (e.g: 0009)",
      codeHint: "Automatically assigned (e.g: 0009)",
      minStockLabel: "Min Stock",
      minStockHint: "(units)",
      minStockPlaceholder: "5",
      minStockHelper: "Level for low-stock alerts",
      activeLabel: "Active product",
      weightLabel: "Sold by weight (kg) - e.g., produce, deli, pet food",
      weightHelpEnabled:
        "✓ Decimals enabled (max 4 places). Examples: 1.254 kg, 0.750 kg. Thousands separators are also allowed.",
      weightHelpDisabled:
        "Enable for products sold by weight/volume. Supports decimal quantities (max 3 decimal places).",
      cancel: "Cancel",
      saveNew: "Create Product",
      saveEdit: "Update Product",
    },
    table: {
      product: "Product",
      code: "Code",
      stock: "Stock",
      status: "Status",
      cost: "Cost Price",
      price: "Sale Price",
      margin: "Margin",
      actions: "Actions",
      normal: "Normal",
      outOfStock: "Out of Stock",
    },
    empty: {
      title: "No products found.",
      subtitle: "Try changing the search or add a product.",
    },
    deleteModal: {
      title: "Delete Product",
      subtitle: "This action cannot be undone",
      question: "Are you sure you want to delete product",
      confirm: "Delete",
      cancel: "Cancel",
    },
    upgrade: {
      feature: "Unlimited Products",
      reason:
        "Your Free plan is limited to 100 products. Upgrade to Pro for unlimited access.",
    },
    limit: {
      limitName: "Products",
    },
    toast: {
      duplicateNameOrBarcode:
        "A product with the same name or barcode already exists.",
      duplicateCode: "A product with the same code already exists.",
      limitReached: "You have reached the product limit for your plan.",
      duplicateCodeOrBarcode:
        "A product with the same code or barcode already exists.",
      missingRequired: "Missing required fields.",
      productNotFound: "Product not found.",
      selectFile: "Select a CSV or Excel file",
      sessionExpired: "Session expired. Please sign in again.",
      importing: "Importing file...",
      importError: "Error importing the file",
      importSuccess: "File imported successfully",
      saveError: "Error saving the product",
      saveSuccess: "Product created successfully!",
      updateSuccess: "Product updated",
      deleteSuccess: "Product deleted successfully",
      deleteError: "Error deleting product",
    },
  },
  pt: {
    headerTitle: "Gestão de Produtos",
    headerSubtitle: "Administre seu catálogo de produtos",
    refreshLabel: "Atualizar",
    importButton: "Importar Excel/CSV",
    newButton: "Novo Produto",
    planLabel: (count: number) => `${count}/100 produtos - Gratuito`,
    searchPlaceholder: "Busque por nome, código de barras ou descrição...",
    importModal: {
      title: "Importar Produtos de Excel/CSV",
      subtitle: "Envie o arquivo, revise e confirme.",
      instructionsTitle: "Instruções",
      steps: [
        "Baixe o modelo CSV com o botão abaixo.",
        "Preencha os dados dos produtos no arquivo.",
        "Salve como CSV (separado por vírgulas).",
        "Envie usando 'Selecionar Arquivo'.",
        "Revise a prévia e confirme a importação.",
      ],
      downloadTemplate: "Baixar Modelo CSV",
      selectedFile: "Arquivo selecionado:",
      dropTitle: "Arraste um CSV aqui ou clique para selecionar",
      dropSubtitle: "Formatos suportados: .csv, .xlsx, .xls",
      selectFile: "Selecionar Arquivo",
      csvFormatTitle: "Formato do arquivo CSV",
      requiredTitle: "Colunas obrigatórias:",
      requiredList: [
        "1. nombre (texto)",
        "2. descripcion (texto, opcional)",
        "3. costo (número)",
        "4. precio (número)",
        "5. stock (número)",
      ],
      optionalTitle: "Opcionais:",
      optionalList: [
        "6. codigo (texto, opcional - será gerado automaticamente)",
        "7. minStock (número)",
        "8. categoria (texto)",
        "9. activo (true/false)",
        "10. seVendePorPeso (true/false)",
      ],
      cancel: "Cancelar",
      confirm: "Importar Arquivo",
      confirming: "Importando...",
    },
    form: {
      newTitle: "Novo Produto",
      editTitle: "Editar Produto",
      namePlaceholder: "Informe o nome do produto",
      descPlaceholder: "Descrição do produto (opcional)",
      barcodePlaceholder: "Código de barras (opcional)",
      categoryPlaceholder: "Sem categoria",
      costLabel: "Custo de Compra",
      marginLabel: "Margem (%)",
      priceLabel: "Preço de Venda",
      priceHint: "Calculado automaticamente",
      stockLabel: "Estoque Inicial",
      stockUnitHint: "(em unidades)",
      stockPlaceholder: "Ex.: 100",
      codeLabel: "Código",
      codePlaceholder: "Código automático (ex: 0009)",
      codeHint: "Atribuído automaticamente (ex: 0009)",
      minStockLabel: "Estoque Mínimo",
      minStockHint: "(em unidades)",
      minStockPlaceholder: "5",
      minStockHelper: "Nível para alertas de estoque baixo",
      activeLabel: "Produto ativo",
      weightLabel: "Vendido por peso (kg) - Ex.: verduras, frios, ração",
      weightHelpEnabled:
        "✓ Decimais habilitados (máx. 4 casas). Exemplos: 1.254 kg, 0.750 kg. Separadores de milhar também são aceitos.",
      weightHelpDisabled:
        "Habilitar para produtos vendidos por peso/volume. Suporta quantidades decimais (máx. 3 casas decimais).",
      cancel: "Cancelar",
      saveNew: "Criar Produto",
      saveEdit: "Atualizar Produto",
    },
    table: {
      product: "Produto",
      code: "Código",
      stock: "Estoque",
      status: "Status",
      cost: "Preço de Custo",
      price: "Preço de Venda",
      margin: "Margem",
      actions: "Ações",
      normal: "Normal",
      outOfStock: "Sem Estoque",
    },
    empty: {
      title: "Nenhum produto encontrado.",
      subtitle: "Tente mudar a busca ou adicionar um produto.",
    },
    deleteModal: {
      title: "Excluir Produto",
      subtitle: "Esta ação não pode ser desfeita",
      question: "Tem certeza de que deseja excluir o produto",
      confirm: "Excluir",
      cancel: "Cancelar",
    },
    upgrade: {
      feature: "Produtos Ilimitados",
      reason:
        "Seu plano Free tem limite de 100 produtos. Faça upgrade para Pro para uso ilimitado.",
    },
    limit: {
      limitName: "Produtos",
    },
    toast: {
      duplicateNameOrBarcode:
        "Já existe um produto com o mesmo nome ou código de barras.",
      duplicateCode: "Já existe um produto com o mesmo código.",
      limitReached: "Você atingiu o limite de produtos do seu plano.",
      duplicateCodeOrBarcode:
        "Já existe um produto com o mesmo código ou código de barras.",
      missingRequired: "Campos obrigatórios ausentes.",
      productNotFound: "Produto não encontrado.",
      selectFile: "Selecione um arquivo CSV ou Excel",
      sessionExpired: "Sessão expirada. Faça login novamente.",
      importing: "Importando arquivo...",
      importError: "Erro ao importar o arquivo",
      importSuccess: "Arquivo importado com sucesso",
      saveError: "Erro ao salvar o produto",
      saveSuccess: "Produto criado com sucesso!",
      updateSuccess: "Produto atualizado",
      deleteSuccess: "Produto excluído com sucesso",
      deleteError: "Erro ao excluir produto",
    },
  },
};

export default function ProductsPage() {
  const router = useRouter();
  const { t, currentLanguage } = useGlobalLanguage();
  const copy = (PRODUCT_COPY[currentLanguage] ||
    PRODUCT_COPY.en) as typeof PRODUCT_COPY.en;
  const stockLocale =
    currentLanguage === "pt"
      ? "pt-BR"
      : currentLanguage === "en"
        ? "en-US"
        : "es-AR";
  const formatStockValue = (value: number, isWeight: boolean) => {
    if (!isWeight) return value.toString();
    return new Intl.NumberFormat(stockLocale, {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(value);
  };
  const [mounted, setMounted] = useState(false);
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"grid" | "table">("table");
  const [query, setQuery] = useState("");
  const [sortBy, setSortBy] = useState<"name" | "price" | "stock" | "margin">(
    "name",
  );
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [user, setUser] = useState<any>(null);
  const [subscription, setSubscription] = useState<any>(null);
  const [showUpgradePrompt, setShowUpgradePrompt] = useState(false);
  const [showLimitPrompt, setShowLimitPrompt] = useState(false);
  const [limitWarningShown, setLimitWarningShown] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [productToDelete, setProductToDelete] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const isSubmittingRef = useRef(false);
  const importInputRef = useRef<HTMLInputElement | null>(null);
  const [showImportModal, setShowImportModal] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    barcode1: "",
    barcode2: "",
    barcode3: "",
    barcode4: "",
    description: "",
    cost: "",
    margin: "",
    price: "",
    stock: "",
    minStock: "5",
    category: "",
    active: true,
    isSoldByWeight: false,
  });

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
    loadProducts();
    loadCategories();
    loadSubscription();
  }, [router, mounted]);

  useEffect(() => {
    if (!mounted) return;

    const token = localStorage.getItem("accessToken");
    let es: EventSource | null = null;

    if (token) {
      es = new EventSource(
        `/api/stock/stream?token=${encodeURIComponent(token)}`,
      );
      es.addEventListener("product", () => {
        loadProducts(true);
      });
    }

    const onVisibility = () => {
      if (document.visibilityState === "visible") {
        loadProducts(true);
      }
    };
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      if (es) es.close();
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [mounted]);

  const loadSubscription = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      const response = await fetch("/api/subscription", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setSubscription(data.subscription || { planId: "BASIC" });
      }
    } catch (error) {
      console.error("Load subscription error:", error);
      setSubscription({ planId: "BASIC" });
    }
  };

  const loadProducts = async (showRefresh = false) => {
    try {
      if (showRefresh) setIsRefreshing(true);
      const token = localStorage.getItem("accessToken");
      const response = await fetch("/api/products", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      setProducts(data.data?.products || []);
    } catch (error) {
      console.error("Load products error:", error);
    } finally {
      if (isInitialLoading) {
        setLoading(false);
        setIsInitialLoading(false);
      }
      setIsRefreshing(false);
    }
  };

  const loadCategories = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      const response = await fetch("/api/categories", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      setCategories(data.categories || data.data?.categories || []);
    } catch (error) {
      console.error("Load categories error:", error);
    }
  };
  const handleImportExcel = async (fileParam?: File | null) => {
    if (!canCreateProduct) {
      toast.error(copy.toast.limitReached);
      setShowLimitPrompt(true);
      return;
    }
    const fileToUpload = fileParam || importFile;
    if (!fileToUpload) {
      toast.error(copy.toast.selectFile);
      return;
    }
    const token = localStorage.getItem("accessToken");
    if (!token) {
      toast.error(copy.toast.sessionExpired);
      router.push("/auth/login");
      return;
    }
    const formData = new FormData();
    formData.append("file", fileToUpload);
    toast.info(copy.toast.importing);
    setIsImporting(true);
    try {
      const response = await fetch("/api/products/import", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });
      const data = await response.json();
      if (response.status === 401) {
        toast.error(copy.toast.sessionExpired);
        router.push("/auth/login");
        return;
      }
      if (!response.ok) {
        const mappedKey = resolveProductErrorKey(data?.error);
        toast.error(
          copy.toast[mappedKey as keyof typeof copy.toast] ||
            data?.error ||
            copy.toast.importError,
        );
        return;
      }
      toast.success(data.message || copy.toast.importSuccess);
      await loadProducts();
      setShowImportModal(false);
      setImportFile(null);
    } catch (error) {
      console.error("Import excel error:", error);
      toast.error(copy.toast.importError);
    } finally {
      setIsImporting(false);
    }
  };

  const handleDownloadTemplate = () => {
    const header = [
      "nombre",
      "descripcion",
      "codigo",
      "costo",
      "precio",
      "stock",
      "minStock",
      "categoria",
      "activo",
      "seVendePorPeso",
    ];
    const exampleRow = [
      "Manzana Roja",
      "Fruta fresca",
      "",
      "120",
      "180",
      "50",
      "5",
      "Frutas",
      "true",
      "false",
    ];
    const csvContent = [header.join(","), exampleRow.join(",")].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "plantilla_productos.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  const currentPlan: "BASIC" | "PROFESSIONAL" | "ENTERPRISE" =
    subscription?.planId?.toUpperCase() === "PROFESSIONAL"
      ? "PROFESSIONAL"
      : subscription?.planId?.toUpperCase() === "ENTERPRISE"
        ? "ENTERPRISE"
        : "BASIC";
  const planConfig = PLAN_FEATURES[currentPlan];
  const canCreateProduct = !isLimitReached(
    currentPlan,
    "maxProducts",
    products.length,
  );
  const maxProducts = planConfig?.maxProducts ?? 100;
  const isOverLimit =
    maxProducts !== -1 &&
    maxProducts !== 99999 &&
    products.length > maxProducts;

  useEffect(() => {
    if (!mounted) return;
    if (isOverLimit && !limitWarningShown) {
      toast.error(copy.toast.limitReached);
      setShowLimitPrompt(true);
      setLimitWarningShown(true);
    }
  }, [mounted, isOverLimit, limitWarningShown, copy.toast.limitReached]);

  const filteredProducts = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = products.filter((p) =>
      [
        p.name,
        p.code,
        p.category,
        ...(Array.isArray(p.barcodes) ? p.barcodes : []),
      ]
        .filter(Boolean)
        .some((v: string) => v.toLowerCase().includes(q)),
    );

    list.sort((a: any, b: any) => {
      const dir = sortDir === "asc" ? 1 : -1;
      const av = sortBy === "name" ? a.name?.toLowerCase() : a[sortBy];
      const bv = sortBy === "name" ? b.name?.toLowerCase() : b[sortBy];
      if (av < bv) return -1 * dir;
      if (av > bv) return 1 * dir;
      return 0;
    });

    return list;
  }, [products, query, sortBy, sortDir]);

  const resolveProductErrorKey = (error: unknown) => {
    if (typeof error !== "string") return null;

    const normalized = error.toLowerCase();

    if (normalized.includes("missing required")) return "missingRequired";
    if (normalized.includes("product not found")) return "productNotFound";
    if (normalized.includes("product code already exists"))
      return "duplicateCode";
    if (normalized.includes("code or barcode")) return "duplicateCodeOrBarcode";
    if (normalized.includes("límite") || normalized.includes("limit"))
      return "limitReached";

    return null;
  };

  const normalizeCode = (value: string | undefined | null) =>
    (value || "").toString().trim().toLowerCase().replace(/[-\s]/g, "");

  const hasDuplicateCodes = (codes: Array<string | undefined | null>) => {
    const normalized = codes
      .map((code) => normalizeCode(code))
      .filter((code) => code.length > 0);
    return normalized.length !== new Set(normalized).size;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSaving || isSubmittingRef.current) return;
    try {
      isSubmittingRef.current = true;
      setIsSaving(true);

      if (!editingId && !canCreateProduct) {
        toast.error(copy.toast.limitReached);
        setShowLimitPrompt(true);
        return;
      }
      const token = localStorage.getItem("accessToken");
      const payload: any = {
        ...formData,
        cost: parseNumberInput(formData.cost) ?? 0,
        price: parseNumberInput(formData.price) ?? 0,
        stock: parseInt(formData.stock),
        minStock: parseInt(formData.minStock),
        margin: parseNumberInput(formData.margin) ?? 0,
        id: editingId || undefined,
        barcodes: [
          formData.barcode1,
          formData.barcode2,
          formData.barcode3,
          formData.barcode4,
        ].filter((code) => String(code || "").trim().length > 0),
      };

      delete payload.barcode1;
      delete payload.barcode2;
      delete payload.barcode3;
      delete payload.barcode4;

      // Always drop code on POST (creation) - it will be auto-generated
      if (!editingId) {
        delete payload.code;
      }

      const codeInputs = [
        editingId ? (payload.code ?? formData.code) : formData.code,
        formData.barcode1,
        formData.barcode2,
        formData.barcode3,
        formData.barcode4,
      ];

      if (hasDuplicateCodes(codeInputs)) {
        toast.error(copy.toast.duplicateCodeOrBarcode);
        return;
      }

      const response = await fetch("/api/products", {
        method: editingId ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (!response.ok) {
        // If backend returns an error with a key, use the i18n message
        if (data?.error && typeof data.error === "object" && data.error.key) {
          const errorKey =
            typeof data.error.key === "string" ? data.error.key : null;
          const message = errorKey
            ? copy.toast[errorKey as keyof typeof copy.toast] ||
              copy.toast.saveError
            : copy.toast.saveError;
          toast.error(message);
        } else {
          const mappedKey = resolveProductErrorKey(data?.error);
          const fallbackMessage = data?.error || copy.toast.saveError;
          toast.error(
            copy.toast[mappedKey as keyof typeof copy.toast] || fallbackMessage,
          );
        }
        return;
      }

      const savedProduct =
        data.data?.product || data.product || data.data?.products?.[0];

      const successMessage = editingId
        ? copy.toast.updateSuccess
        : copy.toast.saveSuccess;

      const codeSuffix = savedProduct?.code ? ` (${savedProduct.code})` : "";

      toast.success(`${successMessage}${codeSuffix}`);
      setFormData({
        name: "",
        code: "",
        barcode1: "",
        barcode2: "",
        barcode3: "",
        barcode4: "",
        description: "",
        cost: "",
        margin: "",
        price: "",
        stock: "",
        minStock: "5",
        category: "",
        active: true,
        isSoldByWeight: false,
      });
      setEditingId(null);
      setShowForm(false);
      await loadProducts();
    } catch (error) {
      console.error("Create product error:", error);
      toast.error(copy.toast.saveError);
    } finally {
      isSubmittingRef.current = false;
      setIsSaving(false);
    }
  };

  const handleDeleteClick = (id: string, name: string) => {
    setProductToDelete({ id, name });
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!productToDelete) return;

    try {
      setIsDeleting(true);
      const token = localStorage.getItem("accessToken");
      const response = await fetch(`/api/products?id=${productToDelete.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        toast.success(copy.toast.deleteSuccess);
        await loadProducts();
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || copy.toast.deleteError);
      }
    } catch (error) {
      console.error("Error deleting product:", error);
      toast.error(copy.toast.deleteError);
    } finally {
      setIsDeleting(false);
      setShowDeleteModal(false);
      setProductToDelete(null);
    }
  };

  if (!mounted) {
    return null;
  }

  if (!mounted) {
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-slate-950">
        <Header user={user} showBackButton={true} />
        <main className="p-6 mx-auto max-w-7xl">
          <div className="grid grid-cols-1 gap-6 animate-pulse md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-40 p-6 bg-white rounded-lg shadow">
                <div className="w-1/2 h-6 mb-4 bg-gray-200 rounded" />
                <div className="grid grid-cols-2 gap-2">
                  <div className="h-10 bg-gray-200 rounded" />
                  <div className="h-10 bg-gray-200 rounded" />
                  <div className="h-10 bg-gray-200 rounded" />
                  <div className="h-10 bg-gray-200 rounded" />
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">
      <Header user={user} showBackButton={true} />

      <main className="px-4 py-8 mx-auto max-w-7xl">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h1 className="mb-2 text-4xl font-bold text-slate-900 dark:text-white">
                {copy.headerTitle}
              </h1>
              <p className="text-slate-600 dark:text-slate-400">
                {copy.headerSubtitle}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => loadProducts(true)}
                disabled={isRefreshing}
                className="px-4 py-2.5 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-lg font-semibold flex items-center gap-2 transition shadow-sm disabled:opacity-60 disabled:cursor-not-allowed dark:bg-slate-900 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
                title={copy.refreshLabel}
              >
                <RefreshCw
                  className={`w-5 h-5 ${isRefreshing ? "animate-spin" : ""}`}
                />
              </button>
              <button
                onClick={() => setShowImportModal(true)}
                className="px-4 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg font-bold flex items-center gap-2 transition shadow-lg"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                {copy.importButton}
              </button>
              <button
                onClick={() => {
                  if (!canCreateProduct) {
                    setShowLimitPrompt(true);
                    return;
                  }
                  setShowForm(!showForm);
                }}
                disabled={!canCreateProduct}
                className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition shadow-lg"
              >
                <Plus className="w-5 h-5" />
                {copy.newButton}
                {!canCreateProduct && <Lock className="w-4 h-4 ml-auto" />}
              </button>
            </div>
          </div>

          {/* Plan Status Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white border rounded-lg shadow-sm border-slate-200 dark:bg-slate-900 dark:border-slate-800">
            <svg
              className="w-4 h-4 text-green-500 dark:text-green-400"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
              {copy.planLabel(products.length)}
            </span>
          </div>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative w-full">
            <Search className="absolute w-5 h-5 -translate-y-1/2 left-4 top-1/2 text-slate-400 dark:text-slate-500" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={copy.searchPlaceholder}
              className="w-full py-3 pl-12 pr-4 bg-white border rounded-lg border-slate-200 text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-900 dark:border-slate-800 dark:text-slate-100"
            />
          </div>
        </div>

        {showImportModal && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in"
            onClick={() => setShowImportModal(false)}
          >
            <div
              className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-slate-200 animate-in zoom-in-95 slide-in-from-bottom-4 dark:bg-slate-950 dark:border-slate-800"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="p-2 border rounded-lg bg-emerald-500/20 border-emerald-500/30 text-emerald-300">
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 5l-7 7 7 7m0-14l7 7-7 7"
                      />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                      {copy.importModal.title}
                    </h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      {copy.importModal.subtitle}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setShowImportModal(false);
                    setImportFile(null);
                  }}
                  className="p-2 rounded-full text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
                  aria-label={t("close") || "Close"}
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              <div className="p-6 space-y-6">
                <div className="p-5 border bg-slate-50 border-slate-200 rounded-xl dark:bg-slate-900 dark:border-slate-800">
                  <div className="flex items-start gap-3 text-slate-700 dark:text-blue-200">
                    <svg
                      className="w-5 h-5 mt-0.5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 6v6l4 2"
                      />
                    </svg>
                    <div>
                      <h4 className="mb-2 font-semibold text-slate-900 dark:text-white">
                        {copy.importModal.instructionsTitle}
                      </h4>
                      <ol className="space-y-1 text-sm list-decimal list-inside text-slate-700 dark:text-blue-100">
                        {copy.importModal.steps.map((step, idx) => (
                          <li key={idx}>{step}</li>
                        ))}
                      </ol>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-center gap-3 sm:flex-row">
                  <button
                    onClick={handleDownloadTemplate}
                    className="flex items-center justify-center w-full gap-2 px-4 py-3 font-semibold text-white transition bg-green-600 rounded-lg sm:w-auto hover:bg-green-700"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 4v12m0 0l-4-4m4 4l4-4M4 20h16"
                      />
                    </svg>
                    {copy.importModal.downloadTemplate}
                  </button>
                  {importFile && (
                    <div className="w-full px-3 py-2 text-sm bg-white border rounded-lg text-slate-700 border-slate-200 sm:w-auto dark:text-slate-300 dark:bg-slate-900 dark:border-slate-800">
                      {copy.importModal.selectedFile}{" "}
                      <span className="font-semibold text-slate-900 dark:text-white">
                        {importFile.name}
                      </span>
                    </div>
                  )}
                </div>

                <div
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault();
                    const file = e.dataTransfer.files?.[0];
                    if (file) setImportFile(file);
                  }}
                  className="flex flex-col items-center justify-center gap-4 p-8 text-center bg-white border-2 border-dashed border-slate-200 rounded-xl dark:bg-slate-900 dark:border-slate-800"
                >
                  <div className="p-4 rounded-full bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                    <svg
                      className="w-8 h-8"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2m-4-4l-4 4m0 0l-4-4m4 4V4"
                      />
                    </svg>
                  </div>
                  <div className="space-y-2">
                    <p className="font-semibold text-slate-800 dark:text-slate-200">
                      {copy.importModal.dropTitle}
                    </p>
                    <p className="text-sm text-slate-600 dark:text-slate-500">
                      {copy.importModal.dropSubtitle}
                    </p>
                  </div>
                  <button
                    onClick={() => importInputRef.current?.click()}
                    className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold shadow"
                  >
                    {copy.importModal.selectFile}
                  </button>
                  <input
                    ref={importInputRef}
                    type="file"
                    accept=".xlsx,.xls,.csv"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) setImportFile(file);
                      if (e.target) e.target.value = "";
                    }}
                  />
                </div>

                <div className="p-5 bg-white border border-slate-200 rounded-xl dark:bg-slate-900 dark:border-slate-800">
                  <h4 className="mb-3 font-semibold text-slate-900 dark:text-white">
                    {copy.importModal.csvFormatTitle}
                  </h4>
                  <div className="grid gap-4 text-sm md:grid-cols-2 text-slate-700 dark:text-slate-300">
                    <div>
                      <p className="mb-2 font-semibold text-slate-800 dark:text-slate-100">
                        {copy.importModal.requiredTitle}
                      </p>
                      <ul className="space-y-1">
                        {copy.importModal.requiredList.map((item, idx) => (
                          <li key={idx}>{item}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <p className="mb-2 font-semibold text-slate-800 dark:text-slate-100">
                        {copy.importModal.optionalTitle}
                      </p>
                      <ul className="space-y-1">
                        {copy.importModal.optionalList.map((item, idx) => (
                          <li key={idx}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col justify-end gap-3 pt-2 sm:flex-row">
                  <button
                    onClick={() => {
                      setShowImportModal(false);
                      setImportFile(null);
                    }}
                    className="w-full sm:w-auto px-4 py-2.5 bg-white text-slate-700 rounded-lg font-semibold border border-slate-200 hover:bg-slate-50 dark:bg-slate-900 dark:text-slate-200 dark:border-slate-700 dark:hover:bg-slate-800"
                  >
                    {copy.importModal.cancel}
                  </button>
                  <button
                    onClick={() => handleImportExcel(importFile)}
                    disabled={!importFile || isImporting}
                    className="w-full sm:w-auto px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold shadow disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isImporting
                      ? copy.importModal.confirming
                      : copy.importModal.confirm}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {showForm && (
          <div className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-8 animate-in zoom-in-95 slide-in-from-bottom-4 border border-slate-200 dark:bg-slate-900 dark:border-slate-800">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                  {editingId ? copy.form.editTitle : copy.form.newTitle}
                </h2>
                <button
                  onClick={() => {
                    setEditingId(null);
                    setFormData({
                      name: "",
                      code: "",
                      barcode1: "",
                      barcode2: "",
                      barcode3: "",
                      barcode4: "",
                      description: "",
                      cost: "",
                      margin: "",
                      price: "",
                      stock: "",
                      minStock: "5",
                      category: "",
                      active: true,
                      isSoldByWeight: false,
                    });
                    setShowForm(false);
                  }}
                  className="text-2xl text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Product Name */}
                <div>
                  <label className="block mb-2 text-sm font-medium text-slate-700 dark:text-slate-300">
                    {t("pages.products.productName", "pos")}{" "}
                    <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    placeholder={copy.form.namePlaceholder}
                    className="w-full px-4 py-2 bg-white border rounded-lg border-slate-300 text-slate-900 placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:bg-slate-800 dark:border-slate-700 dark:text-white dark:placeholder-slate-500"
                    required
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block mb-2 text-sm font-medium text-slate-700 dark:text-slate-300">
                    {t("pages.products.description", "pos")}
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    placeholder={copy.form.descPlaceholder}
                    rows={3}
                    className="w-full px-4 py-2 bg-white border rounded-lg border-slate-300 text-slate-900 placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:bg-slate-800 dark:border-slate-700 dark:text-white dark:placeholder-slate-500"
                  />
                </div>

                {/* Barcodes and Category */}
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  <div>
                    <label className="block mb-2 text-sm font-medium text-slate-700 dark:text-slate-300">
                      {t("pages.products.barcode", "pos")} 1
                    </label>
                    <input
                      type="text"
                      value={formData.barcode1}
                      onChange={(e) =>
                        setFormData({ ...formData, barcode1: e.target.value })
                      }
                      placeholder={copy.form.barcodePlaceholder}
                      className="w-full px-4 py-2 bg-white border rounded-lg border-slate-300 text-slate-900 placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:bg-slate-800 dark:border-slate-700 dark:text-white dark:placeholder-slate-500"
                    />
                  </div>
                  <div>
                    <label className="block mb-2 text-sm font-medium text-slate-700 dark:text-slate-300">
                      {t("pages.products.barcode", "pos")} 2
                    </label>
                    <input
                      type="text"
                      value={formData.barcode2}
                      onChange={(e) =>
                        setFormData({ ...formData, barcode2: e.target.value })
                      }
                      placeholder={copy.form.barcodePlaceholder}
                      className="w-full px-4 py-2 bg-white border rounded-lg border-slate-300 text-slate-900 placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:bg-slate-800 dark:border-slate-700 dark:text-white dark:placeholder-slate-500"
                    />
                  </div>
                  <div>
                    <label className="block mb-2 text-sm font-medium text-slate-700 dark:text-slate-300">
                      {t("pages.products.barcode", "pos")} 3
                    </label>
                    <input
                      type="text"
                      value={formData.barcode3}
                      onChange={(e) =>
                        setFormData({ ...formData, barcode3: e.target.value })
                      }
                      placeholder={copy.form.barcodePlaceholder}
                      className="w-full px-4 py-2 bg-white border rounded-lg border-slate-300 text-slate-900 placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:bg-slate-800 dark:border-slate-700 dark:text-white dark:placeholder-slate-500"
                    />
                  </div>
                  <div>
                    <label className="block mb-2 text-sm font-medium text-slate-700 dark:text-slate-300">
                      {t("pages.products.barcode", "pos")} 4
                    </label>
                    <input
                      type="text"
                      value={formData.barcode4}
                      onChange={(e) =>
                        setFormData({ ...formData, barcode4: e.target.value })
                      }
                      placeholder={copy.form.barcodePlaceholder}
                      className="w-full px-4 py-2 bg-white border rounded-lg border-slate-300 text-slate-900 placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:bg-slate-800 dark:border-slate-700 dark:text-white dark:placeholder-slate-500"
                    />
                  </div>
                  <div>
                    <label className="block mb-2 text-sm font-medium text-slate-700 dark:text-slate-300">
                      {t("pages.products.category", "pos")}
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) =>
                        setFormData({ ...formData, category: e.target.value })
                      }
                      className="w-full px-4 py-2 bg-white border rounded-lg border-slate-300 text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                    >
                      <option
                        value=""
                        className="bg-white text-slate-900 dark:bg-slate-800 dark:text-white"
                      >
                        {copy.form.categoryPlaceholder}
                      </option>
                      {categories.map((cat: any) => (
                        <option
                          key={cat._id || cat.id}
                          value={cat.name}
                          className="bg-white text-slate-900 dark:bg-slate-800 dark:text-white"
                        >
                          {cat.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Cost and Margin */}
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <label className="block mb-2 text-sm font-medium text-slate-700 dark:text-slate-300">
                      {copy.form.costLabel}{" "}
                      <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      value={formData.cost}
                      onChange={(e) => {
                        const cost = parseNumberInput(e.target.value) ?? 0;
                        const price = parseNumberInput(formData.price) ?? 0;
                        const margin =
                          price > 0
                            ? ((price - cost) / price) * 100
                            : (parseNumberInput(formData.margin) ?? 0);
                        setFormData({
                          ...formData,
                          cost: e.target.value,
                          margin: margin.toFixed(1),
                        });
                      }}
                      placeholder="0.00"
                      step="0.01"
                      className="w-full px-4 py-2 bg-white border rounded-lg border-slate-300 text-slate-900 placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:bg-slate-800 dark:border-slate-700 dark:text-white dark:placeholder-slate-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block mb-2 text-sm font-medium text-slate-700 dark:text-slate-300">
                      {copy.form.marginLabel}{" "}
                      <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      value={formData.margin}
                      onChange={(e) => {
                        const margin = parseNumberInput(e.target.value) ?? 0;
                        const cost = parseNumberInput(formData.cost) ?? 0;
                        const price =
                          margin > 0 ? cost / (1 - margin / 100) : 0;
                        setFormData({
                          ...formData,
                          margin: e.target.value,
                          price: price.toFixed(2),
                        });
                      }}
                      placeholder="0.0"
                      step="0.1"
                      className="w-full px-4 py-2 bg-white border rounded-lg border-slate-300 text-slate-900 placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:bg-slate-800 dark:border-slate-700 dark:text-white dark:placeholder-slate-500"
                      required
                    />
                  </div>
                </div>

                {/* Price and Stock */}
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <label className="block mb-2 text-sm font-medium text-slate-700 dark:text-slate-300">
                      {copy.form.priceLabel}{" "}
                      <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      value={formData.price}
                      onChange={(e) => {
                        const price = parseNumberInput(e.target.value) ?? 0;
                        const cost = parseNumberInput(formData.cost) ?? 0;
                        const margin =
                          price > 0 ? ((price - cost) / price) * 100 : 0;
                        setFormData({
                          ...formData,
                          price: e.target.value,
                          margin: margin.toFixed(1),
                        });
                      }}
                      placeholder="0.00"
                      step="0.01"
                      className="w-full px-4 py-2 bg-white border rounded-lg border-slate-300 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:bg-slate-800 dark:border-slate-700 dark:text-white dark:placeholder-slate-500"
                      required
                    />
                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                      {copy.form.priceHint}
                    </p>
                  </div>
                  <div>
                    <label className="block mb-2 text-sm font-medium text-slate-700 dark:text-slate-300">
                      {copy.form.stockLabel}{" "}
                      <span className="text-red-500">*</span>
                      <span className="text-xs font-normal text-slate-500 dark:text-slate-400">
                        {copy.form.stockUnitHint}
                      </span>
                    </label>
                    <input
                      type="number"
                      value={formData.stock}
                      onChange={(e) =>
                        setFormData({ ...formData, stock: e.target.value })
                      }
                      placeholder={copy.form.stockPlaceholder}
                      className="w-full px-4 py-2 bg-white border rounded-lg border-slate-300 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:bg-slate-800 dark:border-slate-700 dark:text-white dark:placeholder-slate-500"
                      required
                    />
                  </div>
                </div>

                {/* Code and Min Stock */}
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <label className="block mb-2 text-sm font-medium text-slate-700 dark:text-slate-300">
                      {copy.form.codeLabel}
                      <span className="ml-2 text-xs font-normal text-slate-500 dark:text-slate-400">
                        {copy.form.codeHint || "(Generado automáticamente)"}
                      </span>
                    </label>
                    <div className="flex items-center w-full px-4 py-2 border rounded-lg bg-slate-100 border-slate-300 text-slate-600 dark:bg-slate-700 dark:border-slate-600 dark:text-slate-300">
                      <svg
                        className="w-5 h-5 mr-2 text-slate-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                        />
                      </svg>
                      <span className="text-sm">
                        {editingId
                          ? editingId
                            ? formData.code || "..."
                            : "..."
                          : copy.form.codeHint || "(Generado automáticamente)"}
                      </span>
                    </div>
                  </div>
                  <div>
                    <label className="block mb-2 text-sm font-medium text-slate-700 dark:text-slate-300">
                      {copy.form.minStockLabel}{" "}
                      <span className="text-red-500">*</span>
                      <span className="text-xs font-normal text-slate-500 dark:text-slate-400">
                        {copy.form.minStockHint}
                      </span>
                    </label>
                    <input
                      type="number"
                      value={formData.minStock}
                      onChange={(e) =>
                        setFormData({ ...formData, minStock: e.target.value })
                      }
                      placeholder={copy.form.minStockPlaceholder}
                      className="w-full px-4 py-2 bg-white border rounded-lg border-slate-300 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:bg-slate-800 dark:border-slate-700 dark:text-white dark:placeholder-slate-500"
                      required
                    />
                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                      {copy.form.minStockHelper}
                    </p>
                  </div>
                </div>

                {/* Checkboxes */}
                <div className="p-4 space-y-3 border rounded-lg bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.active}
                      onChange={(e) =>
                        setFormData({ ...formData, active: e.target.checked })
                      }
                      className="w-4 h-4 text-blue-600 rounded cursor-pointer border-slate-600"
                    />
                    <span className="text-sm text-slate-700 dark:text-slate-300">
                      {copy.form.activeLabel}
                    </span>
                  </label>
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isSoldByWeight}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          isSoldByWeight: e.target.checked,
                        })
                      }
                      className="w-4 h-4 rounded border-slate-600 text-blue-600 cursor-pointer mt-0.5"
                    />
                    <div className="flex-1">
                      <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                        {copy.form.weightLabel}
                      </span>
                      <p className="mt-1 text-xs leading-relaxed text-slate-600 dark:text-slate-400">
                        {formData.isSoldByWeight
                          ? copy.form.weightHelpEnabled
                          : copy.form.weightHelpDisabled}
                      </p>
                    </div>
                  </label>
                </div>

                {/* Buttons */}
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setEditingId(null);
                      setFormData({
                        name: "",
                        code: "",
                        barcode1: "",
                        barcode2: "",
                        barcode3: "",
                        barcode4: "",
                        description: "",
                        cost: "",
                        margin: "",
                        price: "",
                        stock: "",
                        minStock: "5",
                        category: "",
                        active: true,
                        isSoldByWeight: false,
                      });
                      setShowForm(false);
                    }}
                    disabled={isSaving}
                    className="flex-1 px-6 py-3 font-semibold transition bg-white border rounded-lg border-slate-300 text-slate-700 hover:bg-slate-50 disabled:opacity-60 disabled:cursor-not-allowed dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-300 dark:border-slate-700"
                  >
                    {copy.form.cancel}
                  </button>
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="flex items-center justify-center flex-1 gap-2 px-6 py-3 font-semibold text-white transition bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {isSaving && (
                      <span className="w-4 h-4 border-2 border-white rounded-full border-t-transparent animate-spin" />
                    )}
                    {editingId ? copy.form.saveEdit : copy.form.saveNew}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Table View only (list) */}
        <div className="overflow-x-auto bg-white border shadow-sm rounded-xl border-slate-200 dark:bg-slate-900 dark:border-slate-800">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left border-b bg-slate-100 border-slate-200 dark:bg-slate-800/50 dark:border-slate-700">
                <th className="p-3 font-semibold text-slate-600 dark:text-slate-200">
                  {copy.table.product}
                </th>
                <th className="p-3 font-semibold text-slate-600 dark:text-slate-200">
                  {copy.table.code}
                </th>
                <th className="p-3 font-semibold text-slate-600 dark:text-slate-200">
                  {copy.table.stock}
                </th>
                <th className="p-3 font-semibold text-slate-600 dark:text-slate-200">
                  {copy.table.status}
                </th>
                <th className="p-3 font-semibold text-slate-600 dark:text-slate-200">
                  {copy.table.cost}
                </th>
                <th className="p-3 font-semibold text-slate-600 dark:text-slate-200">
                  {copy.table.price}
                </th>
                <th className="p-3 font-semibold text-slate-600 dark:text-slate-200">
                  {copy.table.margin}
                </th>
                <th className="p-3 font-semibold text-slate-600 dark:text-slate-200">
                  {t("labels.actions", "pos")}
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((product) => (
                <tr
                  key={product._id}
                  className="transition border-t border-slate-200 hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800/50"
                >
                  <td className="p-3 font-medium text-slate-900 dark:text-white">
                    {product.name}
                  </td>
                  <td className="p-3 text-slate-600 dark:text-slate-300">
                    {product.code}
                  </td>
                  <td className="p-3 text-slate-600 dark:text-slate-300">
                    <div className="flex flex-col leading-tight">
                      <span
                        className={
                          product.stock <= product.minStock
                            ? "text-red-600 dark:text-red-400 font-semibold"
                            : "text-slate-900 dark:text-slate-100"
                        }
                      >
                        {formatStockValue(
                          product.stock,
                          !!product.isSoldByWeight,
                        )}
                        {product.isSoldByWeight ? " kg" : ""}
                      </span>
                      <span className="text-xs text-slate-600 dark:text-slate-500">
                        Min:{" "}
                        {formatStockValue(
                          product.minStock ?? 0,
                          !!product.isSoldByWeight,
                        )}
                        {product.isSoldByWeight ? " kg" : ""}
                      </span>
                    </div>
                  </td>
                  <td className="p-3">
                    <span
                      className={`inline-flex items-center px-2 py-1 rounded text-xs font-semibold ${
                        product.active
                          ? "bg-green-500/20 text-green-400"
                          : "bg-red-500/20 text-red-400"
                      }`}
                    >
                      {product.active
                        ? copy.table.normal
                        : copy.table.outOfStock}
                    </span>
                  </td>
                  <td className="p-3 text-slate-600 dark:text-slate-400">
                    ${product.cost.toFixed(2)}
                  </td>
                  <td className="p-3 text-slate-600 dark:text-slate-400">
                    ${product.price.toFixed(2)}
                  </td>
                  <td className="p-3 font-semibold text-green-400">
                    {product.margin?.toFixed(1)}%
                  </td>
                  <td className="p-3 text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => {
                          setEditingId(product._id);
                          setFormData({
                            name: product.name || "",
                            code: product.code || "",
                            barcode1: product.barcodes?.[0] || "",
                            barcode2: product.barcodes?.[1] || "",
                            barcode3: product.barcodes?.[2] || "",
                            barcode4: product.barcodes?.[3] || "",
                            description: product.description || "",
                            cost: product.cost?.toString() || "",
                            margin: product.margin?.toString() || "",
                            price: product.price?.toString() || "",
                            stock: (product.stock ?? "").toString(),
                            minStock: (product.minStock ?? "5").toString(),
                            category: product.category || "",
                            active: product.active ?? true,
                            isSoldByWeight: product.isSoldByWeight ?? false,
                          });
                          setShowForm(true);
                        }}
                        className="p-2 text-blue-600 transition bg-white border rounded-full border-slate-300 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-blue-400"
                        title={t("labels.edit", "pos") as string}
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() =>
                          handleDeleteClick(product._id, product.name)
                        }
                        className="p-2 text-red-600 transition bg-white border rounded-full border-slate-300 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-red-400"
                        title={t("labels.delete", "pos") as string}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredProducts.length === 0 && (
          <div className="p-12 text-center bg-white border rounded-lg shadow-lg border-slate-200 dark:bg-slate-900 dark:border-slate-800">
            <p className="text-lg text-slate-500 dark:text-slate-400">
              {copy.empty.title}
            </p>
            <p className="text-slate-600 dark:text-slate-500">
              {copy.empty.subtitle}
            </p>
          </div>
        )}

        {/* Upgrade Prompts */}
        {showUpgradePrompt && (
          <UpgradePrompt
            featureName={copy.upgrade.feature}
            reason={copy.upgrade.reason}
            onDismiss={() => setShowUpgradePrompt(false)}
          />
        )}

        {showLimitPrompt && (
          <LimitReachedPrompt
            limitName={copy.limit.limitName}
            current={products.length}
            max={planConfig?.maxProducts || 100}
            onDismiss={() => setShowLimitPrompt(false)}
          />
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteModal && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in"
            onClick={() => setShowDeleteModal(false)}
          >
            <div
              className="w-full max-w-md p-6 border shadow-2xl bg-slate-900 rounded-2xl animate-in zoom-in-95 slide-in-from-bottom-4 border-slate-800"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 border rounded-full bg-red-500/20 border-red-500/30">
                  <Trash2 className="w-6 h-6 text-red-500" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">
                    {copy.deleteModal.title}
                  </h3>
                  <p className="text-sm text-slate-400">
                    {copy.deleteModal.subtitle}
                  </p>
                </div>
              </div>

              <div className="p-4 mb-6 border rounded-lg bg-slate-800/50 border-slate-700">
                <p className="text-slate-300">
                  {copy.deleteModal.question}{" "}
                  <span className="font-semibold text-white">
                    {productToDelete?.name}
                  </span>
                  ?
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  disabled={isDeleting}
                  className="flex-1 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg font-medium transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {copy.deleteModal.cancel}
                </button>
                <button
                  onClick={confirmDelete}
                  disabled={isDeleting}
                  className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isDeleting && (
                    <span className="w-4 h-4 border-2 border-white rounded-full border-t-transparent animate-spin" />
                  )}
                  {copy.deleteModal.confirm}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

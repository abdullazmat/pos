"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
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

export default function ProductsPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
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
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [productToDelete, setProductToDelete] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const importInputRef = useRef<HTMLInputElement | null>(null);
  const [showImportModal, setShowImportModal] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    barcode: "",
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

  const loadProducts = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      const response = await fetch("/api/products", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      setProducts(data.data?.products || []);
    } catch (error) {
      console.error("Load products error:", error);
    } finally {
      setLoading(false);
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
    const fileToUpload = fileParam || importFile;
    if (!fileToUpload) {
      toast.error("Selecciona un archivo CSV o Excel");
      return;
    }
    const token = localStorage.getItem("accessToken");
    if (!token) {
      toast.error("Sesión expirada. Inicia sesión nuevamente.");
      router.push("/auth/login");
      return;
    }
    const formData = new FormData();
    formData.append("file", fileToUpload);
    toast.info("Importando archivo...");
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
        toast.error("Sesión expirada. Inicia sesión nuevamente.");
        router.push("/auth/login");
        return;
      }
      if (!response.ok) {
        toast.error(data.error || "Error al importar el archivo");
        return;
      }
      toast.success(data.message || "Archivo importado correctamente");
      await loadProducts();
      setShowImportModal(false);
      setImportFile(null);
    } catch (error) {
      console.error("Import excel error:", error);
      toast.error("Error al importar el archivo");
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
      "SKU-001",
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

  const filteredProducts = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = products.filter((p) =>
      [p.name, p.code, p.category, p.barcode]
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("accessToken");
      const payload = {
        ...formData,
        cost: parseFloat(formData.cost),
        price: parseFloat(formData.price),
        stock: parseInt(formData.stock),
        minStock: parseInt(formData.minStock),
        margin: parseFloat(formData.margin),
        id: editingId || undefined,
      };
      const response = await fetch("/api/products", {
        method: editingId ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const error = await response.json();
        toast.error(`${error.error || "Error al guardar el producto"}`);
        return;
      }

      toast.success(
        editingId ? "Producto actualizado" : "¡Producto creado exitosamente!",
      );
      setFormData({
        name: "",
        code: "",
        barcode: "",
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
      toast.error("Error al guardar el producto");
    }
  };

  const handleDeleteClick = (id: string, name: string) => {
    setProductToDelete({ id, name });
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!productToDelete) return;

    try {
      const token = localStorage.getItem("accessToken");
      const response = await fetch(`/api/products?id=${productToDelete.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        toast.success("Producto eliminado exitosamente");
        await loadProducts();
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || "Error al eliminar producto");
      }
    } catch (error) {
      console.error("Error deleting product:", error);
      toast.error("Error al eliminar producto");
    } finally {
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
      <div className="min-h-screen bg-gray-50">
        <Header user={user} showBackButton={true} />
        <main className="max-w-7xl mx-auto p-6">
          <div className="animate-pulse grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-white rounded-lg shadow p-6 h-40">
                <div className="h-6 w-1/2 bg-gray-200 rounded mb-4" />
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
    <div className="min-h-screen bg-slate-950">
      <Header user={user} showBackButton={true} />

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">
                Gestión de Productos
              </h1>
              <p className="text-slate-400">
                Administra tu catálogo de productos
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={loadProducts}
                className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg border border-slate-700 font-semibold flex items-center gap-2 transition"
                title="Refresh"
              >
                <RefreshCw className="w-5 h-5" />
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
                Importar Excel
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
                Nuevo Producto
                {!canCreateProduct && <Lock className="w-4 h-4 ml-auto" />}
              </button>
            </div>
          </div>

          {/* Plan Status Badge */}
          <div className="inline-flex items-center gap-2 bg-slate-900 px-4 py-2 rounded-lg border border-slate-700 shadow-sm">
            <svg
              className="w-4 h-4 text-green-400"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
            <span className="text-sm font-medium text-slate-300">
              {products.length}/100 productos - Gratuito
            </span>
          </div>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar por nombre, código de barras o descripción..."
              className="w-full pl-12 pr-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {showImportModal && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in"
            onClick={() => setShowImportModal(false)}
          >
            <div
              className="bg-slate-950 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-slate-800 animate-in zoom-in-95 slide-in-from-bottom-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-emerald-500/20 border border-emerald-500/30 text-emerald-300">
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
                    <h3 className="text-xl font-bold text-white">
                      Importar Productos desde Excel/CSV
                    </h3>
                    <p className="text-slate-400 text-sm">
                      Sube tu archivo, revisa la vista previa y confirma.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setShowImportModal(false);
                    setImportFile(null);
                  }}
                  className="p-2 rounded-full hover:bg-slate-800 text-slate-400"
                  aria-label="Cerrar"
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
                <div className="bg-slate-900 border border-blue-900 rounded-xl p-5">
                  <div className="flex items-start gap-3 text-blue-200">
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
                      <h4 className="font-semibold text-white mb-2">
                        Instrucciones
                      </h4>
                      <ol className="list-decimal list-inside space-y-1 text-sm text-blue-100">
                        <li>
                          Descarga la plantilla CSV con el botón inferior.
                        </li>
                        <li>
                          Completa los datos de tus productos en el archivo.
                        </li>
                        <li>
                          Guarda el archivo como CSV (separado por comas).
                        </li>
                        <li>Sube el archivo usando "Seleccionar Archivo".</li>
                        <li>
                          Revisa la vista previa y confirma la importación.
                        </li>
                      </ol>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 items-center">
                  <button
                    onClick={handleDownloadTemplate}
                    className="w-full sm:w-auto px-4 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold flex items-center justify-center gap-2 transition"
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
                    Descargar Plantilla CSV
                  </button>
                  {importFile && (
                    <div className="text-sm text-slate-300 bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 w-full sm:w-auto">
                      Archivo seleccionado:{" "}
                      <span className="font-semibold text-white">
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
                  className="border-2 border-dashed border-slate-700 rounded-xl bg-slate-900 p-8 flex flex-col items-center justify-center text-center gap-4"
                >
                  <div className="p-4 rounded-full bg-slate-800 text-slate-200">
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
                    <p className="text-slate-200 font-semibold">
                      Arrastra un archivo CSV aquí o haz clic para seleccionar
                    </p>
                    <p className="text-slate-500 text-sm">
                      Formatos soportados: .csv, .xlsx, .xls
                    </p>
                  </div>
                  <button
                    onClick={() => importInputRef.current?.click()}
                    className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold shadow"
                  >
                    Seleccionar Archivo
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

                <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
                  <h4 className="text-white font-semibold mb-3">
                    Formato del archivo CSV
                  </h4>
                  <div className="grid md:grid-cols-2 gap-4 text-sm text-slate-300">
                    <div>
                      <p className="font-semibold text-slate-100 mb-2">
                        Columnas requeridas:
                      </p>
                      <ul className="space-y-1">
                        <li>1. nombre (texto)</li>
                        <li>2. descripcion (texto, opcional)</li>
                        <li>3. codigo (texto)</li>
                        <li>4. costo (número)</li>
                        <li>5. precio (número)</li>
                        <li>6. stock (número)</li>
                      </ul>
                    </div>
                    <div>
                      <p className="font-semibold text-slate-100 mb-2">
                        Opcionales:
                      </p>
                      <ul className="space-y-1">
                        <li>7. minStock (número)</li>
                        <li>8. categoria (texto)</li>
                        <li>9. activo (true/false)</li>
                        <li>10. seVendePorPeso (true/false)</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 justify-end pt-2">
                  <button
                    onClick={() => {
                      setShowImportModal(false);
                      setImportFile(null);
                    }}
                    className="w-full sm:w-auto px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg font-semibold border border-slate-700"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={() => handleImportExcel(importFile)}
                    disabled={!importFile || isImporting}
                    className="w-full sm:w-auto px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold shadow disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isImporting ? "Importando..." : "Importar Archivo"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {showForm && (
          <div className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
            <div className="bg-slate-900 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-8 animate-in zoom-in-95 slide-in-from-bottom-4 border border-slate-800">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">
                  {editingId ? "Editar Producto" : "Nuevo Producto"}
                </h2>
                <button
                  onClick={() => {
                    setEditingId(null);
                    setFormData({
                      name: "",
                      code: "",
                      barcode: "",
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
                  className="text-slate-400 hover:text-slate-300 text-2xl"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Product Name */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Nombre del Producto <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    placeholder="Ingrese el nombre del producto"
                    className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                    required
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Descripción
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    placeholder="Descripción del producto (opcional)"
                    rows={3}
                    className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>

                {/* Barcode and Category */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Código de Barras
                    </label>
                    <input
                      type="text"
                      value={formData.barcode}
                      onChange={(e) =>
                        setFormData({ ...formData, barcode: e.target.value })
                      }
                      placeholder="Código de barras (opcional)"
                      className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Categoría
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) =>
                        setFormData({ ...formData, category: e.target.value })
                      }
                      className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                    >
                      <option value="" className="bg-slate-800">
                        Sin categoría
                      </option>
                      {categories.map((cat: any) => (
                        <option
                          key={cat._id || cat.id}
                          value={cat.name}
                          className="bg-slate-800"
                        >
                          {cat.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Cost and Margin */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Costo de Compra <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      value={formData.cost}
                      onChange={(e) => {
                        const cost = parseFloat(e.target.value) || 0;
                        const price = parseFloat(formData.price) || 0;
                        const margin =
                          price > 0
                            ? ((price - cost) / price) * 100
                            : parseFloat(formData.margin) || 0;
                        setFormData({
                          ...formData,
                          cost: e.target.value,
                          margin: margin.toFixed(1),
                        });
                      }}
                      placeholder="0.00"
                      step="0.01"
                      className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Margen de Ganancia (%){" "}
                      <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      value={formData.margin}
                      onChange={(e) => {
                        const margin = parseFloat(e.target.value) || 0;
                        const cost = parseFloat(formData.cost) || 0;
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
                      className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                      required
                    />
                  </div>
                </div>

                {/* Price and Stock */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Precio de Venta <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      value={formData.price}
                      onChange={(e) => {
                        const price = parseFloat(e.target.value) || 0;
                        const cost = parseFloat(formData.cost) || 0;
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
                      className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                      required
                    />
                    <p className="text-xs text-slate-500 mt-1">
                      Se calcula automáticamente
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Stock Inicial <span className="text-red-500">*</span>
                      <span className="text-xs text-slate-400 font-normal">
                        (en unidades)
                      </span>
                    </label>
                    <input
                      type="number"
                      value={formData.stock}
                      onChange={(e) =>
                        setFormData({ ...formData, stock: e.target.value })
                      }
                      placeholder="Ej: 100"
                      className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                      required
                    />
                  </div>
                </div>

                {/* Code and Min Stock */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Código <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.code}
                      onChange={(e) =>
                        setFormData({ ...formData, code: e.target.value })
                      }
                      placeholder="Código único del producto"
                      className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Stock Mínimo <span className="text-red-500">*</span>
                      <span className="text-xs text-slate-400 font-normal">
                        (en unidades)
                      </span>
                    </label>
                    <input
                      type="number"
                      value={formData.minStock}
                      onChange={(e) =>
                        setFormData({ ...formData, minStock: e.target.value })
                      }
                      placeholder="5"
                      className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                      required
                    />
                    <p className="text-xs text-slate-500 mt-1">
                      Nivel para alertas de stock bajo
                    </p>
                  </div>
                </div>

                {/* Checkboxes */}
                <div className="space-y-3 bg-slate-800/50 p-4 rounded-lg border border-slate-700">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.active}
                      onChange={(e) =>
                        setFormData({ ...formData, active: e.target.checked })
                      }
                      className="w-4 h-4 rounded border-slate-600 text-blue-600 cursor-pointer"
                    />
                    <span className="text-sm text-slate-300">
                      Producto activo
                    </span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isSoldByWeight}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          isSoldByWeight: e.target.checked,
                        })
                      }
                      className="w-4 h-4 rounded border-slate-600 text-blue-600 cursor-pointer"
                    />
                    <span className="text-sm text-slate-300">
                      Se vende por peso (kg) - Ej: verduras, fiambres, alimento
                      de perros
                    </span>
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
                        barcode: "",
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
                    className="flex-1 px-6 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg font-semibold transition"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition"
                  >
                    {editingId ? "Actualizar Producto" : "Crear Producto"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Table View only (list) */}
        <div className="overflow-x-auto bg-slate-900 rounded-xl border border-slate-800 shadow-sm">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left bg-slate-800/50 border-b border-slate-700">
                <th className="p-3 font-semibold text-slate-200">Producto</th>
                <th className="p-3 font-semibold text-slate-200">Código</th>
                <th className="p-3 font-semibold text-slate-200">Stock</th>
                <th className="p-3 font-semibold text-slate-200">Estado</th>
                <th className="p-3 font-semibold text-slate-200">
                  Precio Costo
                </th>
                <th className="p-3 font-semibold text-slate-200">
                  Precio Venta
                </th>
                <th className="p-3 font-semibold text-slate-200">Margen</th>
                <th className="p-3 font-semibold text-slate-200">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((product) => (
                <tr
                  key={product._id}
                  className="border-t border-slate-700 hover:bg-slate-800/50 transition"
                >
                  <td className="p-3 text-white font-medium">{product.name}</td>
                  <td className="p-3 text-slate-300">{product.code}</td>
                  <td className="p-3 text-slate-300">
                    <div className="flex flex-col leading-tight">
                      <span
                        className={
                          product.stock <= product.minStock
                            ? "text-red-400 font-semibold"
                            : "text-slate-100"
                        }
                      >
                        {product.stock}
                        {product.isSoldByWeight ? " kg" : ""}
                      </span>
                      <span className="text-xs text-slate-500">
                        Min: {product.minStock ?? 0}
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
                      {product.active ? "Normal" : "Sin Stock"}
                    </span>
                  </td>
                  <td className="p-3 text-slate-400">
                    ${product.cost.toFixed(2)}
                  </td>
                  <td className="p-3 text-slate-400">
                    ${product.price.toFixed(2)}
                  </td>
                  <td className="p-3 text-green-400 font-semibold">
                    {product.margin?.toFixed(1)}%
                  </td>
                  <td className="p-3 text-right">
                    <div className="flex gap-2 justify-end">
                      <button
                        onClick={() => {
                          setEditingId(product._id);
                          setFormData({
                            name: product.name || "",
                            code: product.code || "",
                            barcode: product.barcode || "",
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
                        className="p-2 rounded-full border border-slate-700 bg-slate-800 hover:bg-slate-700 text-blue-400 transition"
                        title="Editar"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() =>
                          handleDeleteClick(product._id, product.name)
                        }
                        className="p-2 rounded-full border border-slate-700 bg-slate-800 hover:bg-slate-700 text-red-400 transition"
                        title="Eliminar"
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
          <div className="bg-slate-900 rounded-lg shadow-lg p-12 text-center border border-slate-800">
            <p className="text-slate-400 text-lg">
              No se encontraron productos.
            </p>
            <p className="text-slate-500">
              Intentá cambiar la búsqueda o agregar un producto.
            </p>
          </div>
        )}

        {/* Upgrade Prompts */}
        {showUpgradePrompt && (
          <UpgradePrompt
            featureName="Productos Ilimitados"
            reason="Tu plan Free tiene un límite de 100 productos. Actualiza a Pro para acceso ilimitado."
            onDismiss={() => setShowUpgradePrompt(false)}
          />
        )}

        {showLimitPrompt && (
          <LimitReachedPrompt
            limitName="Productos"
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
              className="bg-slate-900 rounded-2xl shadow-2xl max-w-md w-full p-6 animate-in zoom-in-95 slide-in-from-bottom-4 border border-slate-800"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="bg-red-500/20 border border-red-500/30 p-3 rounded-full">
                  <Trash2 className="w-6 h-6 text-red-500" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">
                    Eliminar Producto
                  </h3>
                  <p className="text-sm text-slate-400">
                    Esta acción no se puede deshacer
                  </p>
                </div>
              </div>

              <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4 mb-6">
                <p className="text-slate-300">
                  ¿Estás seguro de que deseas eliminar el producto{" "}
                  <span className="font-semibold text-white">
                    {productToDelete?.name}
                  </span>
                  ?
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="flex-1 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg font-medium transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={confirmDelete}
                  className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
                >
                  Eliminar
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

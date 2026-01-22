"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/layout/Header";
import { Search, LayoutGrid, Rows, Plus, RefreshCw, Lock, Trash2 } from "lucide-react";
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
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");
  const [query, setQuery] = useState("");
  const [sortBy, setSortBy] = useState<"name" | "price" | "stock" | "margin">(
    "name"
  );
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [user, setUser] = useState<any>(null);
  const [subscription, setSubscription] = useState<any>(null);
  const [showUpgradePrompt, setShowUpgradePrompt] = useState(false);
  const [showLimitPrompt, setShowLimitPrompt] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [productToDelete, setProductToDelete] = useState<{id: string, name: string} | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    cost: "",
    price: "",
    stock: "",
    category: "",
    barcode: "",
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
    products.length
  );

  const filteredProducts = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = products.filter((p) =>
      [p.name, p.code, p.category, p.barcode]
        .filter(Boolean)
        .some((v: string) => v.toLowerCase().includes(q))
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
        editingId ? "Producto actualizado" : "¡Producto creado exitosamente!"
      );
      setFormData({
        name: "",
        code: "",
        cost: "",
        price: "",
        stock: "",
        category: "",
        barcode: "",
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
    <div className="min-h-screen bg-gray-50">
      <Header user={user} showBackButton={true} />

      <main className="max-w-7xl mx-auto p-6">
        {/* Plan Status Badge */}
        <div className="mb-6 inline-flex items-center gap-2 bg-white px-4 py-2 rounded-lg border border-gray-200 shadow-sm">
          <span className="text-sm font-medium text-gray-700">
            Productos: <span className="font-bold">{products.length}</span> /{" "}
            {planConfig?.maxProducts === -1 ? "∞" : planConfig?.maxProducts}
          </span>
          {currentPlan === "BASIC" && (
            <button
              onClick={() => router.push("/upgrade")}
              className="ml-2 text-xs px-2 py-1 rounded bg-blue-100 text-blue-700 hover:bg-blue-200 transition"
            >
              Upgrade Pro
            </button>
          )}
        </div>

        {/* Toolbar */}
        <div className="mb-6 flex flex-col md:flex-row md:items-center gap-3">
          <div className="flex items-center gap-2 flex-1">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Buscar por nombre, código, categoría, código de barras..."
                className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-2 border border-gray-200 rounded-lg bg-white"
            >
              <option value="name">Nombre</option>
              <option value="price">Precio</option>
              <option value="stock">Stock</option>
              <option value="margin">Margen</option>
            </select>
            <select
              value={sortDir}
              onChange={(e) => setSortDir(e.target.value as any)}
              className="px-3 py-2 border border-gray-200 rounded-lg bg-white"
            >
              <option value="asc">Asc</option>
              <option value="desc">Desc</option>
            </select>
            <button
              onClick={() =>
                setViewMode(viewMode === "grid" ? "table" : "grid")
              }
              className="px-3 py-2 border border-gray-200 rounded-lg bg-white flex items-center gap-2"
              title="Toggle view"
            >
              {viewMode === "grid" ? (
                <>
                  <Rows className="w-5 h-5" />
                  <span>Tabla</span>
                </>
              ) : (
                <>
                  <LayoutGrid className="w-5 h-5" />
                  <span>Cuadrícula</span>
                </>
              )}
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
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              title={
                !canCreateProduct
                  ? `Límite de ${planConfig.maxProducts} productos alcanzado`
                  : ""
              }
            >
              {showForm ? (
                "Cancelar"
              ) : (
                <>
                  <Plus className="w-5 h-5" /> Agregar Producto
                  {!canCreateProduct && <Lock className="w-4 h-4 ml-auto" />}
                </>
              )}
            </button>
            <button
              onClick={loadProducts}
              className="px-3 py-2 bg-white border border-gray-200 rounded-lg flex items-center gap-2"
              title="Refresh"
            >
              <RefreshCw className="w-5 h-5" />
            </button>
          </div>
        </div>

        {showForm && (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">
                {editingId ? "Editar Producto" : "Crear Nuevo Producto"}
              </h2>
              {editingId && (
                <button
                  type="button"
                  onClick={() => {
                    setEditingId(null);
                    setFormData({
                      name: "",
                      code: "",
                      cost: "",
                      price: "",
                      stock: "",
                      category: "",
                      barcode: "",
                    });
                  }}
                  className="text-sm text-gray-600 hover:text-gray-800"
                >
                  Limpiar
                </button>
              )}
            </div>
            <form
              onSubmit={handleSubmit}
              className="grid grid-cols-1 md:grid-cols-2 gap-4"
            >
              <input
                type="text"
                placeholder="Nombre del Producto"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="px-4 py-2 border rounded-lg focus:outline-none focus:border-green-600"
                required
              />
              <input
                type="text"
                placeholder="Código"
                value={formData.code}
                onChange={(e) =>
                  setFormData({ ...formData, code: e.target.value })
                }
                className="px-4 py-2 border rounded-lg focus:outline-none focus:border-green-600"
                required
              />
              <input
                type="number"
                placeholder="Costo"
                value={formData.cost}
                onChange={(e) =>
                  setFormData({ ...formData, cost: e.target.value })
                }
                className="px-4 py-2 border rounded-lg focus:outline-none focus:border-green-600"
                step="0.01"
                required
              />
              <input
                type="number"
                placeholder="Precio"
                value={formData.price}
                onChange={(e) =>
                  setFormData({ ...formData, price: e.target.value })
                }
                className="px-4 py-2 border rounded-lg focus:outline-none focus:border-green-600"
                step="0.01"
                required
              />
              <input
                type="number"
                placeholder="Stock"
                value={formData.stock}
                onChange={(e) =>
                  setFormData({ ...formData, stock: e.target.value })
                }
                className="px-4 py-2 border rounded-lg focus:outline-none focus:border-green-600"
                required
              />
              <select
                value={formData.category}
                onChange={(e) =>
                  setFormData({ ...formData, category: e.target.value })
                }
                className="px-4 py-2 border rounded-lg focus:outline-none focus:border-green-600 bg-white"
              >
                <option value="">Seleccione una categoría</option>
                {categories.map((cat: any) => (
                  <option key={cat._id || cat.id} value={cat.name}>
                    {cat.name}
                  </option>
                ))}
              </select>
              <button
                type="submit"
                className="col-span-full bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-semibold transition"
              >
                {editingId ? "Actualizar Producto" : "Crear Producto"}
              </button>
            </form>
          </div>
        )}

        {viewMode === "grid" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map((product) => (
              <div
                key={product._id}
                className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition"
              >
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-lg font-semibold">{product.name}</h3>
                  <span className="text-xs px-2 py-1 rounded bg-gray-100 text-gray-600">
                    {product.category || "Sin categoría"}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-4">
                  Código: {product.code}
                </p>
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="bg-blue-50 p-2 rounded">
                    <p className="text-xs text-gray-600">Costo</p>
                    <p className="font-bold">${product.cost.toFixed(2)}</p>
                  </div>
                  <div className="bg-green-50 p-2 rounded">
                    <p className="text-xs text-gray-600">Precio</p>
                    <p className="font-bold">${product.price.toFixed(2)}</p>
                  </div>
                  <div className="bg-orange-50 p-2 rounded">
                    <p className="text-xs text-gray-600">Stock</p>
                    <p className="font-bold">{product.stock}</p>
                  </div>
                  <div className="bg-purple-50 p-2 rounded">
                    <p className="text-xs text-gray-600">Margen</p>
                    <p className="font-bold">{product.margin?.toFixed(1)}%</p>
                  </div>
                </div>
                {product.barcode && (
                  <p className="text-xs text-gray-500">
                    Código de barras: {product.barcode}
                  </p>
                )}
                <div className="flex justify-end mt-4 gap-2">
                  <button
                    onClick={() => {
                      setEditingId(product._id);
                      setFormData({
                        name: product.name || "",
                        code: product.code || "",
                        cost: product.cost?.toString() || "",
                        price: product.price?.toString() || "",
                        stock: (product.stock ?? "").toString(),
                        category: product.category || "",
                        barcode: product.barcode || "",
                      });
                      setShowForm(true);
                    }}
                    className="px-3 py-2 bg-blue-50 text-blue-700 rounded-lg text-sm font-semibold hover:bg-blue-100"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => handleDeleteClick(product._id, product.name)}
                    className="px-3 py-2 bg-red-50 text-red-700 rounded-lg text-sm font-semibold hover:bg-red-100"
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="overflow-x-auto bg-white rounded-xl border border-gray-100 shadow-sm">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left bg-gray-50">
                  <th className="p-3 font-semibold">Nombre</th>
                  <th className="p-3 font-semibold">Código</th>
                  <th className="p-3 font-semibold">Categoría</th>
                  <th className="p-3 font-semibold">Costo</th>
                  <th className="p-3 font-semibold">Precio</th>
                  <th className="p-3 font-semibold">Stock</th>
                  <th className="p-3 font-semibold">Margen</th>
                  <th className="p-3 font-semibold">Cód. Barras</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((product) => (
                  <tr key={product._id} className="border-t border-gray-100">
                    <td className="p-3">{product.name}</td>
                    <td className="p-3">{product.code}</td>
                    <td className="p-3">{product.category || "—"}</td>
                    <td className="p-3">${product.cost.toFixed(2)}</td>
                    <td className="p-3">${product.price.toFixed(2)}</td>
                    <td className="p-3">{product.stock}</td>
                    <td className="p-3">{product.margin?.toFixed(1)}%</td>
                    <td className="p-3">{product.barcode || ""}</td>
                    <td className="p-3 text-right">
                      <div className="flex gap-2 justify-end">
                        <button
                          onClick={() => {
                            setEditingId(product._id);
                            setFormData({
                              name: product.name || "",
                              code: product.code || "",
                              cost: product.cost?.toString() || "",
                              price: product.price?.toString() || "",
                              stock: (product.stock ?? "").toString(),
                              category: product.category || "",
                              barcode: product.barcode || "",
                            });
                            setShowForm(true);
                          }}
                          className="px-3 py-2 bg-blue-50 text-blue-700 rounded-lg text-xs font-semibold hover:bg-blue-100"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => handleDeleteClick(product._id, product.name)}
                          className="px-3 py-2 bg-red-50 text-red-700 rounded-lg text-xs font-semibold hover:bg-red-100"
                        >
                          Eliminar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {filteredProducts.length === 0 && (
          <div className="bg-white rounded-lg shadow-lg p-12 text-center">
            <p className="text-gray-500 text-lg">
              No se encontraron productos.
            </p>
            <p className="text-gray-400">
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
              className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-in zoom-in-95 slide-in-from-bottom-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="bg-red-100 p-3 rounded-full">
                  <Trash2 className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">
                    Eliminar Producto
                  </h3>
                  <p className="text-sm text-gray-500">Esta acción no se puede deshacer</p>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <p className="text-gray-700">
                  ¿Estás seguro de que deseas eliminar el producto{" "}
                  <span className="font-semibold text-gray-900">
                    {productToDelete?.name}
                  </span>
                  ?
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={confirmDelete}
                  className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors"
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

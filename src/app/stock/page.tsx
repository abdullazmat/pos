"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/layout/Header";
import { useSubscription } from "@/lib/hooks/useSubscription";
import {
  Package,
  AlertTriangle,
  TrendingDown,
  Download,
  Filter,
} from "lucide-react";

interface Product {
  _id: string;
  name: string;
  code: string;
  stock: number;
  minStock?: number;
  price: number;
  cost: number;
}

export default function StockPage() {
  const router = useRouter();
  const { subscription, loading: subLoading } = useSubscription();
  const [user, setUser] = useState<any>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<"all" | "low" | "out">("all");
  const [polling, setPolling] = useState<ReturnType<typeof setInterval> | null>(
    null,
  );

  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (!userStr) {
      router.push("/auth/login");
      return;
    }
    setUser(JSON.parse(userStr));
    fetchProducts();

    // Start polling to keep stock data fresh
    const interval = setInterval(() => {
      fetchProducts(true);
    }, 5000);
    setPolling(interval);

    // Open SSE stream for near real-time updates
    const token = localStorage.getItem("accessToken");
    let es: EventSource | null = null;
    if (token) {
      es = new EventSource(
        `/api/stock/stream?token=${encodeURIComponent(token)}`,
      );
      es.addEventListener("product", () => {
        fetchProducts(true);
      });
    }

    // Refresh when tab becomes visible
    const onVisibility = () => {
      if (document.visibilityState === "visible") {
        fetchProducts(true);
      }
    };
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      if (interval) clearInterval(interval);
      if (es) es.close();
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [router]);

  const fetchProducts = async (silent = false) => {
    try {
      const token = localStorage.getItem("accessToken");
      const response = await fetch("/api/products", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setProducts(data.data?.products || []);
      }
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      if (!silent) setLoading(false);
    }
  };

  const safeProducts = products || [];
  const outOfStock = safeProducts.filter((p) => p.stock === 0);
  const lowStock = safeProducts.filter(
    (p) => p.stock > 0 && p.minStock != null && p.stock <= p.minStock,
  );

  const filteredProducts =
    filterType === "out"
      ? outOfStock
      : filterType === "low"
        ? lowStock
        : safeProducts;

  const totalProducts = safeProducts.filter((p) => p.stock > 0).length;

  return (
    <div className="min-h-screen bg-slate-950">
      <Header user={user} showBackButton />

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">
              Reporte de Stock
            </h1>
            <p className="text-slate-400">Control de inventario y alertas</p>
          </div>
          <button
            onClick={async () => {
              try {
                const token = localStorage.getItem("accessToken");
                const res = await fetch("/api/stock/export", {
                  headers: { Authorization: `Bearer ${token}` },
                });
                if (!res.ok) return;
                const blob = await res.blob();
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = `stock-${new Date()
                  .toISOString()
                  .slice(0, 19)
                  .replace(/[:T]/g, "-")}.csv`;
                document.body.appendChild(a);
                a.click();
                a.remove();
                URL.revokeObjectURL(url);
              } catch (e) {
                console.error("Export error:", e);
              }
            }}
            className="bg-emerald-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-emerald-700 flex items-center gap-2"
          >
            <Download className="w-5 h-5" />
            Exportar Stock
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-slate-900 border border-slate-800 rounded-lg p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-slate-400">Total Productos</p>
              <Package className="w-8 h-8 text-blue-400" />
            </div>
            <p className="text-3xl font-bold text-white">{totalProducts}</p>
            <p className="text-sm text-slate-500 mt-1">Productos activos</p>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-lg p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-slate-400">Stock Bajo</p>
              <TrendingDown className="w-8 h-8 text-amber-400" />
            </div>
            <p className="text-3xl font-bold text-white">{lowStock.length}</p>
            <p className="text-sm text-slate-500 mt-1">Productos por reponer</p>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-lg p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-slate-400">Sin Stock</p>
              <AlertTriangle className="w-8 h-8 text-red-400" />
            </div>
            <p className="text-3xl font-bold text-white">{outOfStock.length}</p>
            <p className="text-sm text-slate-500 mt-1">Productos agotados</p>
          </div>
        </div>

        {/* Stock Alerts */}
        {lowStock.length > 0 && (
          <div className="bg-amber-900/30 border-l-4 border-amber-500 p-4 mb-6">
            <div className="flex items-center">
              <AlertTriangle className="w-5 h-5 text-amber-500 mr-2" />
              <div>
                <p className="font-medium text-amber-100">Alertas de Stock</p>
                <p className="text-sm text-amber-200">
                  • {lowStock.length} producto(s) sin stock
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Filter Buttons */}
        <div className="mb-6 flex items-center gap-3">
          <span className="text-sm font-medium text-slate-300">Filtrar:</span>
          <button
            onClick={() => setFilterType("all")}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filterType === "all"
                ? "bg-blue-600 text-white"
                : "bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700"
            }`}
          >
            Todos ({safeProducts.length})
          </button>
          <button
            onClick={() => setFilterType("low")}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filterType === "low"
                ? "bg-amber-600 text-white"
                : "bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700"
            }`}
          >
            Stock Bajo ({lowStock.length})
          </button>
          <button
            onClick={() => setFilterType("out")}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filterType === "out"
                ? "bg-red-600 text-white"
                : "bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700"
            }`}
          >
            Sin Stock ({outOfStock.length})
          </button>
        </div>

        {/* Products Table */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="bg-slate-900 border border-slate-800 rounded-lg p-12 text-center">
            <Package className="w-16 h-16 text-slate-700 mx-auto mb-4" />
            <p className="text-slate-400 text-lg">
              No hay productos en esta categoría
            </p>
          </div>
        ) : (
          <div className="bg-slate-900 border border-slate-800 rounded-lg overflow-hidden">
            <table className="min-w-full divide-y divide-slate-800">
              <thead className="bg-slate-800">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                    Producto
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                    Código
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                    Stock Actual
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                    Stock Mínimo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                    Precio Costo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                    Precio Venta
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                    Margen
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {filteredProducts.map((product) => {
                  const isOutOfStock = product.stock === 0;
                  const isLowStock =
                    product.stock > 0 &&
                    product.minStock &&
                    product.stock <= product.minStock;
                  const margin =
                    ((product.price - product.cost) / product.cost) * 100;

                  return (
                    <tr key={product._id} className="hover:bg-slate-800/50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        {isOutOfStock && (
                          <AlertTriangle className="w-4 h-4 text-red-500 inline mr-2" />
                        )}
                        <span className="font-medium text-slate-100">
                          {product.name}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-400">
                        {product.code}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`font-bold ${
                            isOutOfStock
                              ? "text-red-400"
                              : isLowStock
                                ? "text-amber-400"
                                : "text-slate-100"
                          }`}
                        >
                          {product.stock}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-400">
                        {typeof product.minStock === "number"
                          ? product.minStock
                          : "-"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {isOutOfStock ? (
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-900/30 text-red-400 border border-red-800">
                            Sin Stock
                          </span>
                        ) : isLowStock ? (
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-amber-900/30 text-amber-400 border border-amber-800">
                            Stock Bajo
                          </span>
                        ) : (
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-emerald-900/30 text-emerald-400 border border-emerald-800">
                            Normal
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-100">
                        ${product.cost.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-100">
                        ${product.price.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-emerald-400 font-medium">
                          +{margin.toFixed(1)}%
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useGlobalLanguage } from "@/lib/hooks/useGlobalLanguage";
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
  isSoldByWeight?: boolean;
}

const STOCK_COPY = {
  es: {
    title: "Reporte de Stock",
    subtitle: "Control de inventario y alertas",
    export: "Exportar Stock",
    stats: {
      totalTitle: "Total Productos",
      totalDesc: "Productos activos",
      lowTitle: "Stock Bajo",
      lowDesc: "Productos por reponer",
      outTitle: "Sin Stock",
      outDesc: "Productos agotados",
    },
    alert: {
      title: "Alertas de Stock",
      message: (count: number) => `• ${count} producto(s) sin stock`,
    },
    filters: {
      label: "Filtrar:",
      all: "Todos",
      low: "Stock Bajo",
      out: "Sin Stock",
    },
    loading: "Cargando...",
    empty: "No hay productos en esta categoría",
    table: {
      product: "Producto",
      code: "Código",
      stock: "Stock Actual",
      min: "Stock Mínimo",
      status: "Estado",
      cost: "Precio Costo",
      price: "Precio Venta",
      margin: "Margen",
    },
    status: {
      out: "Sin Stock",
      low: "Stock Bajo",
      ok: "Normal",
    },
  },
  en: {
    title: "Stock Report",
    subtitle: "Inventory control and alerts",
    export: "Export Stock",
    stats: {
      totalTitle: "Total Products",
      totalDesc: "Active products",
      lowTitle: "Low Stock",
      lowDesc: "Products to replenish",
      outTitle: "Out of Stock",
      outDesc: "Depleted products",
    },
    alert: {
      title: "Stock Alerts",
      message: (count: number) => `• ${count} item(s) out of stock`,
    },
    filters: {
      label: "Filter:",
      all: "All",
      low: "Low Stock",
      out: "Out of Stock",
    },
    loading: "Loading...",
    empty: "No products in this category",
    table: {
      product: "Product",
      code: "Code",
      stock: "Current Stock",
      min: "Min Stock",
      status: "Status",
      cost: "Cost Price",
      price: "Sale Price",
      margin: "Margin",
    },
    status: {
      out: "Out of Stock",
      low: "Low Stock",
      ok: "Normal",
    },
  },
  pt: {
    title: "Relatório de Estoque",
    subtitle: "Controle de inventário e alertas",
    export: "Exportar Estoque",
    stats: {
      totalTitle: "Total de Produtos",
      totalDesc: "Produtos ativos",
      lowTitle: "Estoque Baixo",
      lowDesc: "Produtos para repor",
      outTitle: "Sem Estoque",
      outDesc: "Produtos esgotados",
    },
    alert: {
      title: "Alertas de Estoque",
      message: (count: number) => `• ${count} item(ns) sem estoque`,
    },
    filters: {
      label: "Filtrar:",
      all: "Todos",
      low: "Estoque Baixo",
      out: "Sem Estoque",
    },
    loading: "Carregando...",
    empty: "Não há produtos nesta categoria",
    table: {
      product: "Produto",
      code: "Código",
      stock: "Estoque Atual",
      min: "Estoque Mínimo",
      status: "Status",
      cost: "Preço de Custo",
      price: "Preço de Venda",
      margin: "Margem",
    },
    status: {
      out: "Sem Estoque",
      low: "Estoque Baixo",
      ok: "Normal",
    },
  },
} as const;

const CURRENCY_LOCALE = {
  es: "es-AR",
  en: "en-US",
  pt: "pt-BR",
} as const;

export default function StockPage() {
  const router = useRouter();
  const { currentLanguage } = useGlobalLanguage();
  const copy = (STOCK_COPY[currentLanguage] ||
    STOCK_COPY.en) as typeof STOCK_COPY.en;
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
  const formatCurrency = (value: number) =>
    new Intl.NumberFormat(CURRENCY_LOCALE[currentLanguage], {
      style: "currency",
      currency: "ARS",
    }).format(value ?? 0);
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
    <div className="min-h-screen bg-white dark:bg-slate-950">
      <Header user={user} showBackButton />

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
              {copy.title}
            </h1>
            <p className="text-slate-600 dark:text-slate-400">
              {copy.subtitle}
            </p>
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
            {copy.export}
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-white border border-slate-200 rounded-lg p-6 dark:bg-slate-900 dark:border-slate-800">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-slate-600 dark:text-slate-400">
                {copy.stats.totalTitle}
              </p>
              <Package className="w-8 h-8 text-blue-400" />
            </div>
            <p className="text-3xl font-bold text-slate-900 dark:text-white">
              {totalProducts}
            </p>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              {copy.stats.totalDesc}
            </p>
          </div>

          <div className="bg-white border border-slate-200 rounded-lg p-6 dark:bg-slate-900 dark:border-slate-800">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-slate-600 dark:text-slate-400">
                {copy.stats.lowTitle}
              </p>
              <TrendingDown className="w-8 h-8 text-amber-400" />
            </div>
            <p className="text-3xl font-bold text-slate-900 dark:text-white">
              {lowStock.length}
            </p>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              {copy.stats.lowDesc}
            </p>
          </div>

          <div className="bg-white border border-slate-200 rounded-lg p-6 dark:bg-slate-900 dark:border-slate-800">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-slate-600 dark:text-slate-400">
                {copy.stats.outTitle}
              </p>
              <AlertTriangle className="w-8 h-8 text-red-400" />
            </div>
            <p className="text-3xl font-bold text-slate-900 dark:text-white">
              {outOfStock.length}
            </p>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              {copy.stats.outDesc}
            </p>
          </div>
        </div>

        {/* Stock Alerts */}
        {lowStock.length > 0 && (
          <div className="bg-amber-50 border-l-4 border-amber-500 p-4 mb-6 dark:bg-amber-900/30">
            <div className="flex items-center">
              <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-500 mr-2" />
              <div>
                <p className="font-medium text-amber-900 dark:text-amber-100">
                  {copy.alert.title}
                </p>
                <p className="text-sm text-amber-800 dark:text-amber-200">
                  {copy.alert.message(lowStock.length)}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Filter Buttons */}
        <div className="mb-6 flex items-center gap-3">
          <span className="text-sm font-medium text-slate-900 dark:text-slate-300">
            {copy.filters.label}
          </span>
          <button
            onClick={() => setFilterType("all")}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filterType === "all"
                ? "bg-blue-600 text-white"
                : "bg-white text-slate-700 hover:bg-slate-50 border border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 dark:border-slate-700"
            }`}
          >
            {copy.filters.all} ({safeProducts.length})
          </button>
          <button
            onClick={() => setFilterType("low")}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filterType === "low"
                ? "bg-amber-600 text-white"
                : "bg-white text-slate-700 hover:bg-slate-50 border border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 dark:border-slate-700"
            }`}
          >
            {copy.filters.low} ({lowStock.length})
          </button>
          <button
            onClick={() => setFilterType("out")}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filterType === "out"
                ? "bg-red-600 text-white"
                : "bg-white text-slate-700 hover:bg-slate-50 border border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 dark:border-slate-700"
            }`}
          >
            {copy.filters.out} ({outOfStock.length})
          </button>
        </div>

        {/* Products Table */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-lg p-12 text-center dark:bg-slate-900 dark:border-slate-800">
            <Package className="w-16 h-16 text-slate-300 dark:text-slate-700 mx-auto mb-4" />
            <p className="text-slate-500 dark:text-slate-400 text-lg">
              {copy.empty}
            </p>
          </div>
        ) : (
          <div className="bg-white border border-slate-200 rounded-lg overflow-hidden dark:bg-slate-900 dark:border-slate-800">
            <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800">
              <thead className="bg-slate-200 dark:bg-slate-800">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    {copy.table.product}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    {copy.table.code}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    {copy.table.stock}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    {copy.table.min}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    {copy.table.status}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    {copy.table.cost}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    {copy.table.price}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    {copy.table.margin}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {filteredProducts.map((product) => {
                  const isOutOfStock = product.stock === 0;
                  const isLowStock =
                    product.stock > 0 &&
                    product.minStock &&
                    product.stock <= product.minStock;
                  const margin =
                    product.cost > 0
                      ? ((product.price - product.cost) / product.cost) * 100
                      : 0;
                  const marginClass =
                    margin < 0 ? "text-red-500" : "text-emerald-400";
                  const marginPrefix = margin > 0 ? "+" : "";

                  return (
                    <tr
                      key={product._id}
                      className="hover:bg-slate-50 dark:hover:bg-slate-800/50"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        {isOutOfStock && (
                          <AlertTriangle className="w-4 h-4 text-red-500 inline mr-2" />
                        )}
                        <span className="font-medium text-slate-900 dark:text-slate-100">
                          {product.name}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 dark:text-slate-400">
                        {product.code}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`font-bold ${
                            isOutOfStock
                              ? "text-red-600 dark:text-red-400"
                              : isLowStock
                                ? "text-amber-600 dark:text-amber-400"
                                : "text-slate-900 dark:text-slate-100"
                          }`}
                        >
                          {formatStockValue(
                            product.stock,
                            !!product.isSoldByWeight,
                          )}
                          {product.isSoldByWeight ? " kg" : ""}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 dark:text-slate-400">
                        {typeof product.minStock === "number"
                          ? formatStockValue(
                              product.minStock,
                              !!product.isSoldByWeight,
                            )
                          : "-"}
                        {product.isSoldByWeight ? " kg" : ""}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {isOutOfStock ? (
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-700 border border-red-300 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800">
                            {copy.status.out}
                          </span>
                        ) : isLowStock ? (
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-amber-100 text-amber-700 border border-amber-300 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800">
                            {copy.status.low}
                          </span>
                        ) : (
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-emerald-100 text-emerald-700 border border-emerald-300 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800">
                            {copy.status.ok}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900 dark:text-slate-100">
                        {formatCurrency(product.cost)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900 dark:text-slate-100">
                        {formatCurrency(product.price)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`${marginClass} font-medium`}>
                          {marginPrefix}
                          {margin.toFixed(1)}%
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

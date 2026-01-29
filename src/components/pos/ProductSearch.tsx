"use client";

import { useState, useCallback } from "react";
import { useGlobalLanguage } from "@/lib/hooks/useGlobalLanguage";
import { toast } from "react-toastify";

interface ProductSearchProps {
  onAddToCart: (
    productId: string,
    name: string,
    price: number,
    quantity?: number,
    isSoldByWeight?: boolean,
  ) => void;
  onSearch?: (query: string) => void;
}

export default function ProductSearch({
  onAddToCart,
  onSearch,
}: ProductSearchProps) {
  const { t } = useGlobalLanguage();
  const [searchQuery, setSearchQuery] = useState("");
  const [barcodeQuery, setBarcodeQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = useCallback(
    async (query: string) => {
      if (query.trim().length < 2) {
        setResults([]);
        return;
      }

      setIsSearching(true);
      try {
        const token = localStorage.getItem("accessToken");
        const response = await fetch(`/api/products?search=${query}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await response.json();
        setResults(data.data?.products || []);
        onSearch?.(query);
      } catch (error) {
        console.error("Search error:", error);
      } finally {
        setIsSearching(false);
      }
    },
    [onSearch],
  );

  const handleBarcodeSearch = useCallback(
    async (barcode: string) => {
      if (barcode.trim().length === 0) {
        return;
      }

      setIsSearching(true);
      try {
        const token = localStorage.getItem("accessToken");
        const encodedBarcode = encodeURIComponent(barcode.trim());
        const response = await fetch(`/api/products?search=${encodedBarcode}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await response.json();
        console.log("Barcode search response:", data);
        const products = data.data?.products || [];

        console.log("Found products:", products.length);

        // Try to find an exact match by barcode or code (ignoring dashes/spaces)
        const normalize = (s: string | undefined) =>
          (s || "").replace(/[-\s]/g, "");
        const normalizedQuery = normalize(barcode);

        const exact = products.find(
          (p: any) =>
            normalize(p.barcode) === normalizedQuery ||
            normalize(p.code) === normalizedQuery,
        );

        const target = exact || (products.length === 1 ? products[0] : null);

        if (target) {
          console.log("Adding product to cart:", target);
          if (typeof target.stock === "number" && target.stock <= 0) {
            toast.error(
              t("ui.outOfStock", "pos") !== "ui.outOfStock"
                ? t("ui.outOfStock", "pos")
                : "Product out of stock",
            );
            setBarcodeQuery("");
            setResults([]);
            return;
          }
          const normalizedPrice = target.price;
          onAddToCart(
            target._id,
            target.name,
            normalizedPrice,
            target.isSoldByWeight,
          );
          setBarcodeQuery("");
          setResults([]);
          return;
        }

        if (products.length > 0) {
          console.log("No exact match; showing candidates");
          setResults(products);
        } else {
          console.log("No products found for barcode:", barcode);
          setResults([]);
          setSearchQuery(barcode);
        }
      } catch (error) {
        console.error("Barcode search error:", error);
      } finally {
        setIsSearching(false);
      }
    },
    [onAddToCart],
  );

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    handleSearch(query);
  };

  const handleBarcodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setBarcodeQuery(value);
    // Clear search query when typing in barcode field
    setSearchQuery("");
  };

  const handleBarcodeKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      console.log("Enter pressed, searching for barcode:", barcodeQuery);
      handleBarcodeSearch(barcodeQuery);
      // Clear barcode query when typing in search field
      setBarcodeQuery("");
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-lg shadow-md dark:shadow-lg dark:shadow-black/50 p-6 space-y-4">
      {/* Barcode Scanner Input */}
      <div>
        <div className="relative">
          <svg
            className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"
            />
          </svg>
          <input
            type="text"
            placeholder={t("ui.scanPlaceholder", "pos")}
            value={barcodeQuery}
            onChange={handleBarcodeChange}
            onKeyDown={handleBarcodeKeyDown}
            autoComplete="off"
            className="w-full pl-12 pr-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent"
          />
        </div>
      </div>

      {/* Product Search Input */}
      <div>
        <div className="relative">
          <svg
            className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <input
            type="text"
            placeholder={t("ui.searchPlaceholder", "pos")}
            value={searchQuery}
            onChange={handleSearchChange}
            className="w-full pl-12 pr-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent"
          />
        </div>
        {isSearching && (
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
            {t("ui.searching", "pos")}
          </p>
        )}
      </div>

      {/* Keyboard Shortcuts Info */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
        <div className="flex items-start gap-2">
          <svg
            className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
              clipRule="evenodd"
            />
          </svg>
          <div className="text-sm text-blue-800 dark:text-blue-300">
            <p className="font-medium mb-1">{t("ui.tipsTitle", "pos")}</p>
            <p>
              {t("ui.tipsBodyStart", "pos")}{" "}
              <kbd className="px-2 py-0.5 text-xs font-semibold bg-white dark:bg-slate-700 border border-blue-300 dark:border-blue-600 rounded">
                ↑
              </kbd>{" "}
              <kbd className="px-2 py-0.5 text-xs font-semibold bg-white dark:bg-slate-700 border border-blue-300 dark:border-blue-600 rounded">
                ↓
              </kbd>{" "}
              {t("ui.tipsBodyEnd", "pos")}{" "}
              <kbd className="px-2 py-0.5 text-xs font-semibold bg-white dark:bg-slate-700 border border-blue-300 dark:border-blue-600 rounded">
                Enter
              </kbd>{" "}
              {t("ui.tipsBodyAdd", "pos")}
            </p>
          </div>
        </div>
      </div>

      {/* Products Grid */}
      <div className="min-h-[300px]">
        {results.length === 0 && !searchQuery ? (
          <div className="text-center py-16 text-gray-400 dark:text-gray-500">
            <p className="text-lg">{t("ui.startTyping", "pos")}</p>
          </div>
        ) : results.length === 0 && searchQuery ? (
          <div className="text-center py-16 text-gray-400 dark:text-gray-500">
            <p className="text-lg">{t("ui.noProductsFound", "pos")}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-96 overflow-y-auto">
            {results.map((product) => (
              <div
                key={product._id}
                className="border border-gray-200 dark:border-slate-700 rounded-lg p-4 bg-white dark:bg-slate-800 hover:shadow-md dark:hover:shadow-lg dark:hover:shadow-black/50 hover:border-blue-300 dark:hover:border-blue-600 transition cursor-pointer"
                onClick={() => {
                  if (typeof product.stock === "number" && product.stock <= 0) {
                    toast.error(
                      t("ui.outOfStock", "pos") !== "ui.outOfStock"
                        ? t("ui.outOfStock", "pos")
                        : "Product out of stock",
                    );
                    return;
                  }
                  const normalizedPrice = product.price;
                  onAddToCart(
                    product._id,
                    product.name,
                    normalizedPrice,
                    product.isSoldByWeight,
                  );
                }}
              >
                <h3 className="font-semibold text-gray-800 dark:text-white mb-2">
                  {product.name}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                  {t("ui.codeLabel", "pos")} {product.code}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                  {t("ui.stockLabel", "pos")} {product.stock}
                </p>
                <div className="flex justify-between items-center">
                  <span className="text-lg font-bold text-green-600 dark:text-green-400">
                    {product.isSoldByWeight
                      ? `${product.price.toFixed(3)} / kg`
                      : `$${product.price.toFixed(2)}`}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (
                        typeof product.stock === "number" &&
                        product.stock <= 0
                      ) {
                        toast.error(
                          t("ui.outOfStock", "pos") !== "ui.outOfStock"
                            ? t("ui.outOfStock", "pos")
                            : "Product out of stock",
                        );
                        return;
                      }
                      const normalizedPrice = product.price;
                      onAddToCart(
                        product._id,
                        product.name,
                        normalizedPrice,
                        product.isSoldByWeight,
                      );
                    }}
                    className="bg-blue-600 dark:bg-blue-600 hover:bg-blue-700 dark:hover:bg-blue-700 text-white px-4 py-2 rounded font-semibold transition"
                  >
                    {t("ui.addButton", "pos")}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

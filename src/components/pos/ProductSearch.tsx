"use client";

import { useState, useCallback } from "react";
import { useGlobalLanguage } from "@/lib/hooks/useGlobalLanguage";
import { toast } from "react-toastify";
import { formatARS } from "@/lib/utils/currency";

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
    [onAddToCart, t],
  );

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    handleSearch(query);
  };

  const handleBarcodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setBarcodeQuery(value);
    setSearchQuery("");
  };

  const handleBarcodeKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      console.log("Enter pressed, searching for barcode:", barcodeQuery);
      handleBarcodeSearch(barcodeQuery);
      setBarcodeQuery("");
    }
  };

  return (
    <div className="vp-card vp-card-hover p-7 space-y-5">
      <div>
        <div className="relative">
          <svg
            className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[hsl(var(--vp-muted))]"
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
            className="vp-input pl-12"
          />
        </div>
      </div>

      <div>
        <div className="relative">
          <svg
            className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[hsl(var(--vp-muted))]"
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
            className="vp-input pl-12"
          />
        </div>
        {isSearching && (
          <p className="text-sm text-[hsl(var(--vp-muted))] mt-2">
            {t("ui.searching", "pos")}
          </p>
        )}
      </div>

      <div className="vp-panel-sm bg-[hsl(var(--vp-bg-card-soft))]">
        <div className="flex items-start gap-2">
          <svg
            className="w-5 h-5 text-[hsl(var(--vp-primary))] mt-0.5 flex-shrink-0"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
              clipRule="evenodd"
            />
          </svg>
          <div className="text-sm text-[hsl(var(--vp-text))]">
            <p className="font-medium mb-1">{t("ui.tipsTitle", "pos")}</p>
            <p>
              {t("ui.tipsBodyStart", "pos")} <kbd className="vp-kbd">↑</kbd>{" "}
              <kbd className="vp-kbd">↓</kbd> {t("ui.tipsBodyEnd", "pos")}{" "}
              <kbd className="vp-kbd">Enter</kbd> {t("ui.tipsBodyAdd", "pos")}
            </p>
          </div>
        </div>
      </div>

      <div className="min-h-[300px]">
        {results.length === 0 && !searchQuery ? (
          <div className="vp-empty-state">
            <p className="text-lg font-semibold">
              {t("ui.startTyping", "pos")}
            </p>
          </div>
        ) : results.length === 0 && searchQuery ? (
          <div className="vp-empty-state">
            <p className="text-lg font-semibold">
              {t("ui.noProductsFound", "pos")}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-96 overflow-y-auto">
            {results.map((product) => (
              <div
                key={product._id}
                className="vp-card vp-card-hover p-4 cursor-pointer"
                onClick={() => {
                  onAddToCart(
                    product._id,
                    product.name,
                    product.price,
                    product.isSoldByWeight,
                  );
                }}
              >
                <h3 className="font-semibold text-[hsl(var(--vp-text))] mb-2">
                  {product.name}
                </h3>
                <p className="text-sm text-[hsl(var(--vp-muted))] mb-1">
                  {t("ui.codeLabel", "pos")} {product.code}
                </p>
                <p className="text-sm text-[hsl(var(--vp-muted))] mb-3">
                  {t("ui.stockLabel", "pos")} {product.stock}
                </p>
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold text-emerald-500">
                    {product.isSoldByWeight
                      ? `${formatARS(product.price)} / kg`
                      : formatARS(product.price)}
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
                    className="vp-button vp-button-primary vp-tap"
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

"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useGlobalLanguage } from "@/lib/hooks/useGlobalLanguage";
import { toast } from "react-toastify";
import { parseNumberInput } from "@/lib/utils/decimalFormatter";

interface KeyboardPOSInputProps {
  onAddToCart: (
    productId: string,
    name: string,
    price: number,
    quantity: number,
    isSoldByWeight?: boolean,
  ) => void;
  onCustomerAction?: (action: "change" | "search" | "new" | "remove") => void;
}

export default function KeyboardPOSInput({
  onAddToCart,
  onCustomerAction,
}: KeyboardPOSInputProps) {
  const { t } = useGlobalLanguage();
  const [quantity, setQuantity] = useState("1");
  const [productCode, setProductCode] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [activeResultIndex, setActiveResultIndex] = useState(-1);

  const containerRef = useRef<HTMLDivElement>(null);
  const quantityInputRef = useRef<HTMLInputElement>(null);
  const productInputRef = useRef<HTMLInputElement>(null);
  const resultsListRef = useRef<HTMLDivElement>(null);
  const pendingMultiplierQtyRef = useRef<number | null>(null);

  // Focus on quantity field on mount and after adding product
  useEffect(() => {
    quantityInputRef.current?.focus();
  }, []);

  useEffect(() => {
    const handleGlobalKeyDown = (event: KeyboardEvent) => {
      if (event.defaultPrevented) return;

      const target = event.target as HTMLElement | null;
      const isEditable =
        !!target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable);
      const isInsideKeyboardPOS = !!(
        target && containerRef.current?.contains(target)
      );

      if (isEditable && !isInsideKeyboardPOS) return;

      if (event.shiftKey) {
        switch (event.key.toLowerCase()) {
          case "c":
            event.preventDefault();
            onCustomerAction?.("change");
            return;
          case "f":
            event.preventDefault();
            onCustomerAction?.("search");
            return;
          case "n":
            event.preventDefault();
            onCustomerAction?.("new");
            return;
          case "x":
            event.preventDefault();
            onCustomerAction?.("remove");
            return;
        }
      }

      if (
        event.key === "*" ||
        event.key === "Multiply" ||
        event.code === "NumpadMultiply"
      ) {
        if (target === productInputRef.current) {
          return;
        }
        event.preventDefault();
        productInputRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
        productInputRef.current?.focus();
      }
    };

    document.addEventListener("keydown", handleGlobalKeyDown);
    return () => {
      document.removeEventListener("keydown", handleGlobalKeyDown);
    };
  }, [onCustomerAction]);

  const fetchSuggestions = useCallback(async (query: string) => {
    const trimmed = query.trim();
    if (trimmed.length < 2) {
      setSearchResults([]);
      setShowResults(false);
      return;
    }

    setIsSearching(true);
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        setSearchResults([]);
        setShowResults(false);
        return;
      }

      const encodedQuery = encodeURIComponent(trimmed);
      const response = await fetch(`/api/products?search=${encodedQuery}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      const products = data.data?.products || [];

      const normalizedQuery = trimmed.toLowerCase();
      const startsWithMatches = products.filter((p: any) =>
        (p.name || "").toLowerCase().startsWith(normalizedQuery),
      );

      const fallbackMatches = products.filter(
        (p: any) =>
          !(p.name || "").toLowerCase().startsWith(normalizedQuery) &&
          (p.name || "").toLowerCase().includes(normalizedQuery),
      );

      const combined = [...startsWithMatches, ...fallbackMatches].slice(0, 8);
      setSearchResults(combined);
      setShowResults(combined.length > 0);
    } catch (error) {
      console.error("Suggestions search error:", error);
      setSearchResults([]);
      setShowResults(false);
    } finally {
      setIsSearching(false);
    }
  }, []);

  useEffect(() => {
    const handle = window.setTimeout(() => {
      fetchSuggestions(productCode);
    }, 300);

    return () => {
      window.clearTimeout(handle);
    };
  }, [productCode, fetchSuggestions]);

  useEffect(() => {
    if (activeResultIndex < 0 || !resultsListRef.current) return;
    const activeEl = resultsListRef.current.querySelector(
      `[data-index="${activeResultIndex}"]`,
    ) as HTMLElement | null;
    activeEl?.scrollIntoView({ block: "nearest" });
  }, [activeResultIndex]);

  useEffect(() => {
    if (searchResults.length === 0) {
      if (activeResultIndex !== -1) {
        setActiveResultIndex(-1);
      }
      return;
    }

    if (activeResultIndex >= searchResults.length) {
      setActiveResultIndex(searchResults.length - 1);
    }
  }, [searchResults, activeResultIndex]);

  // Parse quantity with multiplier support
  const parseQuantityInput = (
    input: string,
  ): { quantity: number; productCode: string } | null => {
    const trimmed = input.trim();

    if (!trimmed) return null;

    // Check for multiplier pattern: "quantity * code" or "quantity*code"
    const multiplierMatch = trimmed.match(/^([0-9.,]+)\s*\*\s*(.+)$/);
    if (multiplierMatch) {
      const qty = parseNumberInput(multiplierMatch[1]);
      const code = multiplierMatch[2].trim();

      // Validate quantity
      if (qty === null || Number.isNaN(qty)) {
        toast.error(`Invalid quantity: ${multiplierMatch[1]}`);
        return null;
      }

      if (qty <= 0) {
        toast.error("Quantity must be greater than zero");
        return null;
      }

      if (qty > 100000) {
        toast.error("Quantity too large. Maximum is 100,000");
        return null;
      }

      // Validate product code
      if (!code || code.length === 0) {
        toast.error("Product code is required after '*'");
        return null;
      }

      if (code.length > 50) {
        toast.error("Product code too long");
        return null;
      }

      return { quantity: qty, productCode: code };
    }

    return null;
  };

  // Search product by code/barcode
  const searchProduct = useCallback(async (code: string) => {
    if (!code.trim()) {
      console.warn("Empty product code provided");
      return null;
    }

    try {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        toast.error("Session expired. Please login again.");
        return null;
      }

      const encodedCode = encodeURIComponent(code.trim());
      const response = await fetch(`/api/products?search=${encodedCode}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage =
          errorData.message ||
          `HTTP ${response.status}: ${response.statusText}`;
        console.error("Product search failed:", errorMessage);
        throw new Error(errorMessage);
      }

      const data = await response.json();

      // Validate API response structure
      if (!data || typeof data !== "object") {
        console.error("Invalid API response format:", data);
        throw new Error("Invalid response from server");
      }

      const products = data.data?.products || [];

      if (!Array.isArray(products)) {
        console.error("Products is not an array:", products);
        throw new Error("Invalid products data");
      }

      if (products.length === 0) {
        return null;
      }

      // Try exact match first (barcode or code)
      const normalize = (s: string | undefined) =>
        (s || "").replace(/[-\s]/g, "").toLowerCase();
      const normalizeName = (s: string | undefined) =>
        (s || "").trim().toLowerCase();
      const normalizedQuery = normalize(code);
      const normalizedNameQuery = normalizeName(code);

      const exactMatch = products.find(
        (p: any) =>
          normalize(p.code) === normalizedQuery ||
          (Array.isArray(p.barcodes) &&
            p.barcodes.some(
              (barcode: string) => normalize(barcode) === normalizedQuery,
            )),
      );

      const exactNameMatch = products.find(
        (p: any) => normalizeName(p.name) === normalizedNameQuery,
      );

      // Return exact match or first result if only one found
      return (
        exactMatch ||
        exactNameMatch ||
        (products.length === 1 ? products[0] : null)
      );
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      console.error("Product search error:", errorMessage, error);

      // Show user-friendly error
      if (!errorMessage.includes("not found")) {
        toast.error(`Search failed: ${errorMessage}`);
      }
      return null;
    }
  }, []);

  // Handle quantity field input
  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Allow numbers, comma, period, and asterisk
    if (value === "") {
      setQuantity(value);
      return;
    }

    const allowed = value.includes("*")
      ? /^[0-9.,*\sA-Za-z-]*$/.test(value)
      : /^[0-9.,\s]*$/.test(value);

    if (allowed) {
      setQuantity(value);
    }
  };

  // Handle quantity field key press
  const handleQuantityKeyDown = async (
    e: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    if (e.defaultPrevented) return;
    // Global shortcuts (work in any field)
    if (e.shiftKey) {
      switch (e.key.toLowerCase()) {
        case "c":
          e.preventDefault();
          if (onCustomerAction) {
            try {
              onCustomerAction("change");
            } catch (error) {
              console.error("Error in customer action:", error);
              toast.error("Failed to change customer type");
            }
          }
          return;
        case "f":
          e.preventDefault();
          if (onCustomerAction) {
            try {
              onCustomerAction("search");
            } catch (error) {
              console.error("Error in customer action:", error);
              toast.error("Failed to search customer");
            }
          }
          return;
        case "n":
          e.preventDefault();
          if (onCustomerAction) {
            try {
              onCustomerAction("new");
            } catch (error) {
              console.error("Error in customer action:", error);
              toast.error("Failed to create new customer");
            }
          }
          return;
        case "x":
          e.preventDefault();
          if (onCustomerAction) {
            try {
              onCustomerAction("remove");
            } catch (error) {
              console.error("Error in customer action:", error);
              toast.error("Failed to remove customer");
            }
          }
          return;
      }
    }

    // Focus product code input when * or NumpadMultiply is pressed
    if (e.key === "*" || e.key === "Multiply" || e.code === "NumpadMultiply") {
      if (quantity.includes("*")) {
        return;
      }

      e.preventDefault();

      const qtyString = quantity.trim().replace(",", ".");
      const parsedQty = parseFloat(qtyString);
      if (!isNaN(parsedQty) && parsedQty > 0) {
        pendingMultiplierQtyRef.current = parsedQty;
      } else {
        pendingMultiplierQtyRef.current = null;
      }

      productInputRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
      productInputRef.current?.focus();
      return;
    }

    if (e.key === "Enter") {
      e.preventDefault();

      const input = quantity.trim();

      // Check if multiplier pattern exists
      const multiplierData = parseQuantityInput(input);
      if (multiplierData) {
        // Process multiplier: quantity * code
        await processProductAddition(
          multiplierData.productCode,
          multiplierData.quantity,
        );
      } else if (input && input !== "1") {
        // If there's a value other than default, move to product field
        productInputRef.current?.focus();
      } else {
        // Just Enter with default quantity, move to product field
        productInputRef.current?.focus();
      }
    } else if (e.key === "Escape") {
      e.preventDefault();
      setQuantity("1");
      quantityInputRef.current?.focus();
    }
  };

  // Handle product code input
  const handleProductCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setProductCode(e.target.value);
    setShowResults(true);
    setActiveResultIndex(-1);
  };

  // Handle product field key press
  const handleProductKeyDown = async (
    e: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    if (e.defaultPrevented) return;
    // Global shortcuts
    if (e.shiftKey) {
      switch (e.key.toLowerCase()) {
        case "c":
          e.preventDefault();
          if (onCustomerAction) {
            try {
              onCustomerAction("change");
            } catch (error) {
              console.error("Error in customer action:", error);
              toast.error("Failed to change customer type");
            }
          }
          return;
        case "f":
          e.preventDefault();
          if (onCustomerAction) {
            try {
              onCustomerAction("search");
            } catch (error) {
              console.error("Error in customer action:", error);
              toast.error("Failed to search customer");
            }
          }
          return;
        case "n":
          e.preventDefault();
          if (onCustomerAction) {
            try {
              onCustomerAction("new");
            } catch (error) {
              console.error("Error in customer action:", error);
              toast.error("Failed to create new customer");
            }
          }
          return;
        case "x":
          e.preventDefault();
          if (onCustomerAction) {
            try {
              onCustomerAction("remove");
            } catch (error) {
              console.error("Error in customer action:", error);
              toast.error("Failed to remove customer");
            }
          }
          return;
      }
    }

    if (e.key === "Enter") {
      e.preventDefault();

      if (showResults && searchResults.length > 0 && activeResultIndex >= 0) {
        const selected = searchResults[activeResultIndex];
        if (selected) {
          const qtyValue = quantity.trim() || "1";
          const parsedQty = parseFloat(qtyValue.replace(",", "."));
          const effectiveQty =
            pendingMultiplierQtyRef.current !== null
              ? pendingMultiplierQtyRef.current
              : parsedQty;
          pendingMultiplierQtyRef.current = null;
          await processProductAddition(selected.code, effectiveQty);
          return;
        }
      }

      const multiplierFromProduct = parseQuantityInput(productCode);
      if (multiplierFromProduct) {
        pendingMultiplierQtyRef.current = null;
        await processProductAddition(
          multiplierFromProduct.productCode,
          multiplierFromProduct.quantity,
        );
        return;
      }

      const code = productCode.trim();
      if (!code) {
        toast.warning(
          t("ui.enterProductCode", "pos") || "Please enter a product code",
        );
        return;
      }

      // Parse quantity (support decimal with comma or period)
      const qtyValue = quantity.trim() || "1";
      const parsedQty = parseFloat(qtyValue.replace(",", "."));
      const effectiveQty =
        pendingMultiplierQtyRef.current !== null
          ? pendingMultiplierQtyRef.current
          : parsedQty;

      if (isNaN(effectiveQty) || effectiveQty <= 0) {
        toast.error(
          t("ui.invalidQuantity", "pos") !== "ui.invalidQuantity"
            ? t("ui.invalidQuantity", "pos")
            : "Invalid quantity",
        );
        return;
      }

      pendingMultiplierQtyRef.current = null;
      await processProductAddition(code, effectiveQty);
    } else if (e.key === "ArrowDown") {
      if (!showResults || searchResults.length === 0) return;
      e.preventDefault();
      setActiveResultIndex((prev) =>
        prev < searchResults.length - 1 ? prev + 1 : 0,
      );
    } else if (e.key === "ArrowUp") {
      if (!showResults || searchResults.length === 0) return;
      e.preventDefault();
      setActiveResultIndex((prev) =>
        prev > 0 ? prev - 1 : searchResults.length - 1,
      );
    } else if (e.key === "Escape") {
      e.preventDefault();
      setProductCode("");
      setQuantity("1");
      pendingMultiplierQtyRef.current = null;
      setActiveResultIndex(-1);
      quantityInputRef.current?.focus();
    }
  };

  // Process adding product to cart
  const processProductAddition = async (code: string, qty: number) => {
    // Validate inputs before processing
    if (!code || code.trim().length === 0) {
      toast.error("Product code cannot be empty");
      return;
    }

    if (isNaN(qty) || qty <= 0) {
      toast.error("Invalid quantity: must be a positive number");
      setQuantity("1");
      quantityInputRef.current?.focus();
      return;
    }

    if (qty > 100000) {
      toast.error("Quantity too large. Maximum is 100,000");
      return;
    }

    setIsProcessing(true);

    try {
      const product = await searchProduct(code);

      if (!product) {
        toast.error(
          t("ui.productNotFound", "pos") !== "ui.productNotFound"
            ? t("ui.productNotFound", "pos")
            : "Product not found",
        );
        setProductCode("");
        productInputRef.current?.focus();
        return;
      }

      // Validate product data
      if (!product._id || !product.name || product.price === undefined) {
        toast.error("Invalid product data received");
        console.error("Invalid product:", product);
        return;
      }

      if (typeof product.stock === "number" && product.stock <= 0) {
        toast.error(
          t("ui.outOfStock", "pos") !== "ui.outOfStock"
            ? t("ui.outOfStock", "pos")
            : "Product out of stock",
        );
        setProductCode("");
        productInputRef.current?.focus();
        return;
      }

      // Check if price is a valid number
      if (
        typeof product.price !== "number" ||
        isNaN(product.price) ||
        product.price < 0
      ) {
        toast.error(`Invalid price for product: ${product.name}`);
        console.error("Invalid product price:", product);
        return;
      }

      // Normalize price for weight-based products
      const normalizedPrice = product.price;

      // Add to cart with specified quantity
      onAddToCart(
        product._id,
        product.name,
        normalizedPrice,
        qty,
        product.isSoldByWeight,
      );

      // Success feedback with formatted quantity
      const formattedQty = qty % 1 === 0 ? qty.toString() : qty.toFixed(3);
      toast.success(
        `${product.name} × ${formattedQty} ${t("ui.addedToCart", "pos") !== "ui.addedToCart" ? t("ui.addedToCart", "pos") : "added to cart"}`,
      );

      // Reset and focus back to quantity field
      setQuantity("1");
      setProductCode("");
      setSearchResults([]);
      setShowResults(false);
      quantityInputRef.current?.focus();
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      console.error("Error adding product:", errorMessage, error);
      toast.error(
        t("ui.errorAddingProduct", "pos") !== "ui.errorAddingProduct"
          ? t("ui.errorAddingProduct", "pos")
          : "Error adding product",
      );

      // Reset product code on error
      setProductCode("");
      setSearchResults([]);
      setShowResults(false);
      productInputRef.current?.focus();
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div
      ref={containerRef}
      className="bg-white dark:bg-slate-900 rounded-lg shadow-md dark:shadow-lg dark:shadow-black/50 p-6 space-y-4"
    >
      {/* Title */}
      <div className="border-b border-gray-200 dark:border-slate-700 pb-3">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          {t("ui.keyboardPOS", "pos") !== "ui.keyboardPOS"
            ? t("ui.keyboardPOS", "pos")
            : "Keyboard POS"}
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          {t("ui.quantityFirst", "pos") !== "ui.quantityFirst"
            ? t("ui.quantityFirst", "pos")
            : "Enter quantity first, then product code"}
        </p>
      </div>

      {/* Quantity Input - PRIMARY FOCUS */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          {t("ui.quantity", "pos") !== "ui.quantity"
            ? t("ui.quantity", "pos")
            : "Quantity"}
          <span className="text-gray-500 dark:text-gray-400 ml-2 text-xs">
            (Default: 1)
          </span>
        </label>
        <div className="relative">
          <input
            ref={quantityInputRef}
            type="text"
            value={quantity}
            onChange={handleQuantityChange}
            onKeyDown={handleQuantityKeyDown}
            placeholder="1"
            autoComplete="off"
            className="w-full px-4 py-3 text-lg border-2 border-blue-500 dark:border-blue-400 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent"
          />
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500">
            <span className="text-sm">⏎</span>
          </div>
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          {t("ui.quantityHint", "pos") !== "ui.quantityHint"
            ? t("ui.quantityHint", "pos")
            : "Enter quantity or use multiplier: 50*code"}
        </p>
      </div>

      {/* Product Code / Barcode Input */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          {t("ui.productCodeBarcode", "pos") !== "ui.productCodeBarcode"
            ? t("ui.productCodeBarcode", "pos")
            : "Product Code / Barcode"}
        </label>
        <div className="relative">
          <svg
            className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500"
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
            ref={productInputRef}
            type="text"
            value={productCode}
            onChange={handleProductCodeChange}
            onKeyDown={handleProductKeyDown}
            placeholder={
              t("ui.scanOrEnterCode", "pos") || "Scan or enter code..."
            }
            autoComplete="off"
            disabled={isProcessing}
            className="w-full pl-10 pr-4 py-3 text-lg border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 dark:focus:ring-green-400 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
          />
          {isProcessing && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
            </div>
          )}
        </div>
        {isSearching && (
          <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
            {t("ui.searching", "pos")}
          </p>
        )}
        {showResults && searchResults.length > 0 && (
          <div
            ref={resultsListRef}
            className="mt-2 max-h-60 overflow-y-auto rounded-lg border border-gray-200 bg-white shadow-lg dark:border-slate-700 dark:bg-slate-900"
          >
            {searchResults.map((product, index) => (
              <button
                key={product._id}
                type="button"
                data-index={index}
                onClick={async () => {
                  const qtyValue = quantity.trim() || "1";
                  const parsedQty = parseFloat(qtyValue.replace(",", "."));
                  const effectiveQty =
                    pendingMultiplierQtyRef.current !== null
                      ? pendingMultiplierQtyRef.current
                      : parsedQty;
                  pendingMultiplierQtyRef.current = null;
                  await processProductAddition(product.code, effectiveQty);
                }}
                onMouseEnter={() => {
                  setActiveResultIndex(index);
                }}
                className={`w-full text-left px-3 py-2 transition ${
                  index === activeResultIndex
                    ? "bg-slate-100 dark:bg-slate-800"
                    : "hover:bg-slate-100 dark:hover:bg-slate-800"
                }`}
              >
                <div className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                  {product.name}
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  {t("ui.codeLabel", "pos")} {product.code}
                </div>
              </button>
            ))}
          </div>
        )}
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          {t("ui.pressEnterToAdd", "pos") !== "ui.pressEnterToAdd"
            ? t("ui.pressEnterToAdd", "pos")
            : "Press Enter to add • Esc to cancel"}
        </p>
      </div>

      {/* Keyboard Shortcuts Reference */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-3 flex items-center gap-2">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path d="M2 5a2 2 0 012-2h12a2 2 0 012 2v10a2 2 0 01-2 2H4a2 2 0 01-2-2V5zm3.293 1.293a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 01-1.414-1.414L7.586 10 5.293 7.707a1 1 0 010-1.414zM11 12a1 1 0 100 2h3a1 1 0 100-2h-3z" />
          </svg>
          {t("ui.keyboardShortcuts", "pos") !== "ui.keyboardShortcuts"
            ? t("ui.keyboardShortcuts", "pos")
            : "Keyboard Shortcuts"}
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
          {/* Workflow */}
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <kbd className="px-2 py-1 bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded font-mono">
                Enter
              </kbd>
              <span className="text-gray-700 dark:text-gray-300">
                {t("ui.confirmAdd", "pos") !== "ui.confirmAdd"
                  ? t("ui.confirmAdd", "pos")
                  : "Confirm / Add"}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <kbd className="px-2 py-1 bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded font-mono">
                Esc
              </kbd>
              <span className="text-gray-700 dark:text-gray-300">
                {t("ui.cancel", "pos") !== "ui.cancel"
                  ? t("ui.cancel", "pos")
                  : "Cancel / Clear"}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <kbd className="px-2 py-1 bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded font-mono">
                *
              </kbd>
              <span className="text-gray-700 dark:text-gray-300">
                {t("ui.multiplier", "pos") !== "ui.multiplier"
                  ? t("ui.multiplier", "pos")
                  : "Multiplier (50*code)"}
              </span>
            </div>
          </div>

          {/* Customer Shortcuts */}
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <kbd className="px-2 py-1 bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded font-mono">
                Shift+C
              </kbd>
              <span className="text-gray-700 dark:text-gray-300">
                {t("ui.changeCustomer", "pos") !== "ui.changeCustomer"
                  ? t("ui.changeCustomer", "pos")
                  : "Change customer"}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <kbd className="px-2 py-1 bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded font-mono">
                Shift+F
              </kbd>
              <span className="text-gray-700 dark:text-gray-300">
                {t("ui.findCustomer", "pos") !== "ui.findCustomer"
                  ? t("ui.findCustomer", "pos")
                  : "Find customer"}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <kbd className="px-2 py-1 bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded font-mono">
                Shift+N
              </kbd>
              <span className="text-gray-700 dark:text-gray-300">
                {t("ui.newCustomer", "pos") !== "ui.newCustomer"
                  ? t("ui.newCustomer", "pos")
                  : "New customer"}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <kbd className="px-2 py-1 bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded font-mono">
                Shift+X
              </kbd>
              <span className="text-gray-700 dark:text-gray-300">
                {t("ui.removeCustomer", "pos") !== "ui.removeCustomer"
                  ? t("ui.removeCustomer", "pos")
                  : "Remove customer"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Examples */}
      <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3">
        <h4 className="text-xs font-semibold text-green-800 dark:text-green-300 mb-2">
          📝{" "}
          {t("ui.examples", "pos") !== "ui.examples"
            ? t("ui.examples", "pos")
            : "Examples"}
          :
        </h4>
        <ul className="text-xs text-green-700 dark:text-green-300 space-y-1">
          <li>
            •{" "}
            {t("ui.example1", "pos") !== "ui.example1"
              ? t("ui.example1", "pos")
              : "Type '5' → Enter → Scan/Enter code → Enter = 5 units"}
          </li>
          <li>
            •{" "}
            {t("ui.example2", "pos") !== "ui.example2"
              ? t("ui.example2", "pos")
              : "Type '0.325' → Enter → Scan = 0.325 kg"}
          </li>
          <li>
            •{" "}
            {t("ui.example3", "pos") !== "ui.example3"
              ? t("ui.example3", "pos")
              : "Type '50*697202601252361' → Enter = 50 units instantly"}
          </li>
        </ul>
      </div>
    </div>
  );
}

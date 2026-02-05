"use client";

import { useState, useCallback, useEffect, useMemo } from "react";
import { useGlobalLanguage } from "@/lib/hooks/useGlobalLanguage";
import {
  parseQuantity,
  formatQuantity,
  validateQuantity,
  getInputStep,
  getInputMin,
  getInputPlaceholder,
} from "@/lib/utils/decimalFormatter";

interface CartItem {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  discount: number;
  total: number;
  isSoldByWeight?: boolean;
}

interface PaymentMethod {
  id: string;
  name: string;
  enabled: boolean;
}

interface CartProps {
  items: CartItem[];
  onRemove: (productId: string) => void;
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onApplyDiscount: (productId: string, discount: number) => void;
  onCheckout: (paymentMethod: string) => Promise<void>;
  additionalPaymentMethods?: PaymentMethod[];
}

export default function Cart({
  items,
  onRemove,
  onUpdateQuantity,
  onApplyDiscount,
  onCheckout,
  additionalPaymentMethods = [],
}: CartProps) {
  const { t } = useGlobalLanguage();
  const [paymentMethod, setPaymentMethod] = useState<string>("cash");
  const [isLoading, setIsLoading] = useState(false);
  const [quantityInputs, setQuantityInputs] = useState<Record<string, string>>(
    {},
  );
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [availablePaymentMethods, setAvailablePaymentMethods] = useState<
    PaymentMethod[]
  >([
    { id: "cash", name: "Efectivo", enabled: true },
    { id: "bankTransfer", name: "Transferencia", enabled: true },
    { id: "qr", name: "QR", enabled: true },
  ]);

  useEffect(() => {
    const fetchPaymentMethods = async () => {
      try {
        const token = localStorage.getItem("accessToken");
        const response = await fetch("/api/business-config", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (response.ok) {
          const data = await response.json();
          if (data.data?.paymentMethods) {
            const enabled = data.data.paymentMethods.filter(
              (m: PaymentMethod) => m.enabled,
            );
            if (enabled.length > 0) {
              setAvailablePaymentMethods(enabled);
              setPaymentMethod(enabled[0].id);
            }
          }
        }
      } catch (error) {
        console.error("Error fetching payment methods:", error);
      }
    };
    fetchPaymentMethods();
  }, []);

  const mergedPaymentMethods = useMemo(() => {
    const byId = new Map<string, PaymentMethod>();
    availablePaymentMethods.forEach((method) => {
      if (method?.id) {
        byId.set(method.id, method);
      }
    });
    additionalPaymentMethods.forEach((method) => {
      if (method?.id && !byId.has(method.id)) {
        byId.set(method.id, method);
      }
    });
    return Array.from(byId.values());
  }, [availablePaymentMethods, additionalPaymentMethods]);

  useEffect(() => {
    if (!mergedPaymentMethods.find((method) => method.id === paymentMethod)) {
      const first = mergedPaymentMethods[0]?.id;
      if (first) {
        setPaymentMethod(first);
      }
    }
  }, [mergedPaymentMethods, paymentMethod]);

  useEffect(() => {
    setQuantityInputs((prev) => {
      const next: Record<string, string> = {};
      items.forEach((item) => {
        if (editingProductId === item.productId && prev[item.productId]) {
          next[item.productId] = prev[item.productId];
          return;
        }
        const formatted = formatQuantity(item.quantity, 4);
        next[item.productId] = formatted;
      });
      return next;
    });
  }, [items, editingProductId]);

  const subtotal = items.reduce(
    (sum, item) => sum + item.quantity * item.unitPrice,
    0,
  );
  const totalDiscount = items.reduce((sum, item) => sum + item.discount, 0);
  const total = Math.max(0, subtotal - totalDiscount);

  const handleCheckout = useCallback(async () => {
    setIsLoading(true);
    try {
      await onCheckout(paymentMethod);
    } finally {
      setIsLoading(false);
    }
  }, [paymentMethod, onCheckout]);

  // Prevent Delete key from clearing the cart
  // Only allow the clear cart button to do this
  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    // Prevent Delete key from clearing the cart
    if (
      e.key === "Delete" &&
      document.activeElement?.tagName !== "INPUT" &&
      document.activeElement?.tagName !== "TEXTAREA"
    ) {
      e.preventDefault();
    }
  };

  return (
    <div
      className="vp-card vp-card-hover p-7 h-full flex flex-col"
      tabIndex={0}
      onKeyDown={handleKeyDown}
    >
      <div className="flex items-center justify-between mb-7">
        <h2 className="text-xl font-semibold text-[hsl(var(--vp-text))] flex items-center gap-2">
          <svg
            className="w-6 h-6 text-blue-600 dark:text-blue-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
            />
          </svg>
          {t("ui.cartTitle", "pos")} ({items.length})
        </h2>
        {items.length > 0 && (
          <button
            onClick={() => {
              localStorage.removeItem("pos.cartItems");
              window.location.reload();
            }}
            className="vp-button vp-button-ghost text-red-500 hover:text-red-600"
            title={t("ui.clearCart", "pos") as string}
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto space-y-5 mb-7">
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full vp-empty-state">
            <svg
              className="w-24 h-24 mb-4 vp-empty-icon vp-float"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
            <p className="text-lg font-semibold mb-1">
              {t("ui.cartEmpty", "pos")}
            </p>
            <p className="text-sm text-[hsl(var(--vp-muted))]">
              {t("ui.cartEmptySubtitle", "pos")}
            </p>
          </div>
        ) : (
          items.map((item) => (
            <div
              key={item.productId}
              className="vp-card vp-card-soft vp-item-enter p-5"
            >
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="font-semibold text-[hsl(var(--vp-text))]">
                    {item.productName}
                  </h3>
                  <p className="text-sm text-[hsl(var(--vp-muted))]">
                    ${item.unitPrice.toFixed(2)} x {item.quantity}
                  </p>
                </div>
                <button
                  onClick={() => onRemove(item.productId)}
                  className="text-red-500 hover:text-red-600 text-sm font-medium"
                >
                  {t("ui.remove", "pos")}
                </button>
              </div>

              <div className="grid grid-cols-3 gap-2 mb-3">
                <div>
                  <label className="vp-label">
                    {t("ui.quantity", "pos")}
                    {item.isSoldByWeight ? " (kg)" : ""}
                  </label>
                  <input
                    type="text"
                    inputMode={item.isSoldByWeight ? "decimal" : "numeric"}
                    placeholder={getInputPlaceholder(
                      item.isSoldByWeight || false,
                      "en",
                    )}
                    value={
                      quantityInputs[item.productId] ??
                      formatQuantity(item.quantity, 4)
                    }
                    onFocus={() => setEditingProductId(item.productId)}
                    onChange={(e) => {
                      const rawValue = e.target.value;
                      const isWeight = item.isSoldByWeight || false;

                      if (!isWeight) {
                        const sanitized = rawValue.replace(/[^\d]/g, "");
                        setQuantityInputs((prev) => ({
                          ...prev,
                          [item.productId]: sanitized,
                        }));

                        if (sanitized === "") {
                          onUpdateQuantity(item.productId, 0);
                          return;
                        }

                        const parsedInt = parseInt(sanitized, 10);
                        if (!Number.isNaN(parsedInt)) {
                          onUpdateQuantity(item.productId, parsedInt);
                        }
                        return;
                      }

                      setQuantityInputs((prev) => ({
                        ...prev,
                        [item.productId]: rawValue,
                      }));

                      const trimmed = rawValue.trim();
                      if (trimmed.endsWith(".") || trimmed.endsWith(",")) {
                        return;
                      }

                      if (trimmed === "") {
                        onUpdateQuantity(item.productId, 0);
                        return;
                      }

                      const parsed = parseQuantity(e.target.value);

                      if (parsed !== null) {
                        const validation = validateQuantity(parsed, true);
                        if (validation.isValid) {
                          onUpdateQuantity(item.productId, parsed);
                        }
                      }
                    }}
                    onBlur={(e) => {
                      // On blur, ensure a valid value or reset to previous
                      const isWeight = item.isSoldByWeight || false;
                      if (!isWeight) {
                        const sanitized = e.target.value.replace(/[^\d]/g, "");
                        if (sanitized === "") {
                          onUpdateQuantity(item.productId, 0);
                          setQuantityInputs((prev) => ({
                            ...prev,
                            [item.productId]: "0",
                          }));
                          setEditingProductId(null);
                          return;
                        }

                        const parsedInt = parseInt(sanitized, 10);
                        if (Number.isNaN(parsedInt)) {
                          setQuantityInputs((prev) => ({
                            ...prev,
                            [item.productId]: formatQuantity(item.quantity, 4),
                          }));
                          setEditingProductId(null);
                          return;
                        }

                        onUpdateQuantity(item.productId, parsedInt);
                        setQuantityInputs((prev) => ({
                          ...prev,
                          [item.productId]: parsedInt.toString(),
                        }));
                        setEditingProductId(null);
                        return;
                      }

                      if (e.target.value.trim() === "") {
                        onUpdateQuantity(item.productId, 0);
                        setQuantityInputs((prev) => ({
                          ...prev,
                          [item.productId]: "0",
                        }));
                        setEditingProductId(null);
                        return;
                      }
                      const parsed = parseQuantity(e.target.value);
                      if (parsed === null) {
                        setQuantityInputs((prev) => ({
                          ...prev,
                          [item.productId]: formatQuantity(item.quantity, 4),
                        }));
                        setEditingProductId(null);
                        return;
                      }

                      const validation = validateQuantity(parsed, true);
                      if (!validation.isValid) {
                        setQuantityInputs((prev) => ({
                          ...prev,
                          [item.productId]: formatQuantity(item.quantity, 4),
                        }));
                        setEditingProductId(null);
                        return;
                      }

                      onUpdateQuantity(item.productId, parsed);
                      setQuantityInputs((prev) => ({
                        ...prev,
                        [item.productId]: formatQuantity(parsed, 4),
                      }));
                      setEditingProductId(null);
                    }}
                    className="vp-input text-sm h-9"
                  />
                  {item.isSoldByWeight && (
                    <p className="text-xs text-[hsl(var(--vp-muted))] mt-1">
                      {t("ui.weightQuantityHint", "pos")}
                    </p>
                  )}
                </div>
                <div>
                  <label className="vp-label">{t("ui.discount", "pos")}</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={item.discount}
                    onChange={(e) =>
                      onApplyDiscount(
                        item.productId,
                        parseFloat(e.target.value) || 0,
                      )
                    }
                    className="vp-input text-sm h-9"
                  />
                </div>
                <div>
                  <label className="vp-label">{t("ui.total", "pos")}</label>
                  <div className="vp-input-like text-sm h-9">
                    {Math.max(
                      0,
                      item.quantity * item.unitPrice - item.discount,
                    ).toFixed(2)}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {items.length > 0 && (
        <>
          <div className="space-y-3 mb-4">
            <div className="flex justify-between text-[hsl(var(--vp-muted))]">
              <span>{t("ui.subtotal", "pos")}:</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            {totalDiscount > 0 && (
              <div className="flex justify-between text-red-500">
                <span>{t("ui.totalDiscount", "pos")}:</span>
                <span>-${totalDiscount.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between text-2xl font-semibold text-[hsl(var(--vp-text))] bg-[hsl(var(--vp-primary))]/10 p-4 rounded-lg border border-[hsl(var(--vp-primary))]/30">
              <span>{t("ui.total", "pos")}:</span>
              <span>${total.toFixed(2)}</span>
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <label className="vp-label">{t("ui.paymentMethod", "pos")}</label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="vp-input"
              >
                {mergedPaymentMethods.map((method) => (
                  <option key={method.id} value={method.id}>
                    {t(`ui.paymentOptions.${method.id}`, "pos") || method.name}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={handleCheckout}
              disabled={isLoading}
              className="vp-button vp-button-primary w-full py-3 text-base disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <svg
                    className="animate-spin h-5 w-5 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  {t("ui.processing", "pos")}
                </>
              ) : (
                <>
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
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  {t("ui.checkout", "pos")}
                </>
              )}
            </button>
          </div>
        </>
      )}
    </div>
  );
}

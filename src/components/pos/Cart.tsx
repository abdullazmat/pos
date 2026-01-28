"use client";

import { useState, useCallback, useEffect } from "react";
import { useGlobalLanguage } from "@/lib/hooks/useGlobalLanguage";
import {
  normalizeDecimalSeparator,
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
}

export default function Cart({
  items,
  onRemove,
  onUpdateQuantity,
  onApplyDiscount,
  onCheckout,
}: CartProps) {
  const { t } = useGlobalLanguage();
  const [paymentMethod, setPaymentMethod] = useState<string>("cash");
  const [isLoading, setIsLoading] = useState(false);
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

  const subtotal = items.reduce(
    (sum, item) => sum + item.quantity * item.unitPrice,
    0,
  );
  const totalDiscount = items.reduce((sum, item) => sum + item.discount, 0);
  const total = subtotal - totalDiscount;

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
      className="bg-white dark:bg-slate-900 rounded-lg shadow-md dark:shadow-lg dark:shadow-black/50 p-6 h-full flex flex-col"
      tabIndex={0}
      onKeyDown={handleKeyDown}
    >
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
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
            onClick={() => window.location.reload()}
            className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 p-2"
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

      <div className="flex-1 overflow-y-auto space-y-4 mb-6">
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full py-16 text-gray-400 dark:text-gray-500">
            <svg
              className="w-24 h-24 mb-4"
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
            <p className="text-lg font-medium mb-1">
              {t("ui.cartEmpty", "pos")}
            </p>
            <p className="text-sm">{t("ui.cartEmptySubtitle", "pos")}</p>
          </div>
        ) : (
          items.map((item) => (
            <div
              key={item.productId}
              className="bg-gray-50 dark:bg-slate-800 p-4 rounded border border-gray-200 dark:border-slate-700"
            >
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="font-semibold text-gray-800 dark:text-white">
                    {item.productName}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    ${item.unitPrice.toFixed(2)} x {item.quantity}
                  </p>
                </div>
                <button
                  onClick={() => onRemove(item.productId)}
                  className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 text-sm font-medium"
                >
                  {t("ui.remove", "pos")}
                </button>
              </div>

              <div className="grid grid-cols-3 gap-2 mb-3">
                <div>
                  <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
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
                    value={formatQuantity(item.quantity, 4)}
                    onChange={(e) => {
                      const normalized = normalizeDecimalSeparator(
                        e.target.value,
                      );
                      const parsed = parseQuantity(e.target.value);

                      if (parsed !== null) {
                        // Validate the quantity
                        const validation = validateQuantity(
                          parsed,
                          item.isSoldByWeight || false,
                        );
                        if (validation.isValid) {
                          onUpdateQuantity(item.productId, parsed);
                        }
                        // If invalid, silently reject (don't update)
                      }
                    }}
                    onBlur={(e) => {
                      // On blur, ensure a valid value or reset to previous
                      if (
                        e.target.value === "" ||
                        parseQuantity(e.target.value) === null
                      ) {
                        onUpdateQuantity(item.productId, item.quantity);
                      }
                    }}
                    className="w-full px-2 py-1 border border-gray-300 dark:border-slate-600 rounded text-sm bg-white dark:bg-slate-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                  />
                  {item.isSoldByWeight && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Use comma or period (e.g., 1,560 or 1.560)
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                    {t("ui.discount", "pos")}
                  </label>
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
                    className="w-full px-2 py-1 border border-gray-300 dark:border-slate-600 rounded text-sm bg-white dark:bg-slate-700 text-gray-900 dark:text-white placeholder-gray-400"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                    {t("ui.total", "pos")}
                  </label>
                  <div className="px-2 py-1 bg-blue-50 dark:bg-blue-900/30 rounded text-sm font-semibold text-gray-900 dark:text-white border border-blue-200 dark:border-blue-800">
                    $
                    {(item.quantity * item.unitPrice - item.discount).toFixed(
                      2,
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {items.length > 0 && (
        <>
          <div className="border-t dark:border-slate-700 pt-4 space-y-2 mb-6">
            <div className="flex justify-between text-gray-700 dark:text-gray-300">
              <span>{t("ui.subtotal", "pos")}:</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            {totalDiscount > 0 && (
              <div className="flex justify-between text-red-600 dark:text-red-400">
                <span>{t("ui.totalDiscount", "pos")}:</span>
                <span>-${totalDiscount.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between text-2xl font-bold text-gray-900 dark:text-white bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border-2 border-blue-200 dark:border-blue-800">
              <span>{t("ui.total", "pos")}:</span>
              <span className="text-blue-600 dark:text-blue-400">
                ${total.toFixed(2)}
              </span>
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t("ui.paymentMethod", "pos")}
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent"
              >
                {availablePaymentMethods.map((method) => (
                  <option key={method.id} value={method.id}>
                    {t(`ui.paymentOptions.${method.id}`, "pos") || method.name}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={handleCheckout}
              disabled={isLoading}
              className="w-full bg-green-600 dark:bg-green-600 hover:bg-green-700 dark:hover:bg-green-700 disabled:bg-gray-400 dark:disabled:bg-gray-600 text-white font-bold py-3 rounded-lg transition shadow-md hover:shadow-lg dark:shadow-green-600/30 flex items-center justify-center gap-2"
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

"use client";

import { useState, useCallback, useEffect } from "react";
import { InvoiceChannel } from "@/lib/models/Invoice";
import { toast } from "react-toastify";
import { useLanguage } from "@/lib/context/LanguageContext";
import { formatARS } from "@/lib/utils/currency";
import {
  formatQuantity,
  parseQuantity,
  validateQuantity,
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

interface CartProps {
  items: CartItem[];
  onRemove: (productId: string) => void;
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onApplyDiscount: (productId: string, discount: number) => void;
  onCheckout: (paymentData: CheckoutData) => Promise<void>;
  canUseMercadoPago?: boolean;
  canUseArcaInvoicing?: boolean;
}

export interface CheckoutData {
  paymentMethod: "cash" | "card" | "check" | "online" | "mercadopago";
  invoiceChannel: InvoiceChannel;
  customerName: string;
  customerEmail?: string;
  customerCuit?: string;
  ivaType?: string;
  discount?: number;
  notes?: string;
}

export default function Cart({
  items,
  onRemove,
  onUpdateQuantity,
  onApplyDiscount,
  onCheckout,
  canUseMercadoPago = true,
  canUseArcaInvoicing = true,
}: CartProps) {
  const { t } = useLanguage();
  const [paymentMethod, setPaymentMethod] =
    useState<CheckoutData["paymentMethod"]>("cash");
  const [invoiceChannel, setInvoiceChannel] = useState<InvoiceChannel>(
    InvoiceChannel.INTERNAL,
  );
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerCuit, setCustomerCuit] = useState("");
  const [ivaType, setIvaType] = useState("RESPONSABLE_INSCRIPTO");
  const [isLoading, setIsLoading] = useState(false);
  const [showCustomerForm, setShowCustomerForm] = useState(false);
  const [quantityInputs, setQuantityInputs] = useState<Record<string, string>>(
    {},
  );
  const [discountInputs, setDiscountInputs] = useState<Record<string, string>>(
    {},
  );
  const [editingProductId, setEditingProductId] = useState<string | null>(null);

  const roundPeso = (value: number) => Math.round(value);
  const getDiscountValue = (item: CartItem) => {
    const rawInput = discountInputs[item.productId];
    if (rawInput !== undefined) {
      const parsed = Number.parseFloat(rawInput.replace(",", "."));
      if (Number.isFinite(parsed)) {
        return Math.max(0, roundPeso(parsed));
      }
    }
    return Math.max(
      0,
      roundPeso(Number.isFinite(item.discount) ? item.discount : 0),
    );
  };
  const getLineSubtotal = (item: CartItem) =>
    roundPeso(item.quantity * item.unitPrice);
  const getLineDiscount = (item: CartItem) => getDiscountValue(item);
  const getLineTotal = (item: CartItem) =>
    Math.max(0, getLineSubtotal(item) - getLineDiscount(item));

  const subtotal = items.reduce((sum, item) => sum + getLineSubtotal(item), 0);
  const total = items.reduce((sum, item) => sum + getLineTotal(item), 0);
  const totalDiscount = Math.max(0, subtotal - total);
  const taxableBase = Math.max(0, total);
  const tax = Math.round(taxableBase * 0.21 * 100) / 100;
  const totalWithTax = taxableBase + tax;

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

  useEffect(() => {
    setDiscountInputs((prev) => {
      const next: Record<string, string> = {};
      items.forEach((item) => {
        if (prev[item.productId] !== undefined) {
          next[item.productId] = prev[item.productId];
          return;
        }
        next[item.productId] = String(
          Number.isFinite(item.discount) ? item.discount : 0,
        );
      });
      return next;
    });
  }, [items]);

  const handleCheckout = useCallback(async () => {
    if (!customerName.trim()) {
      toast.error(t("clientNameRequired", "errors"));
      return;
    }

    if (invoiceChannel === InvoiceChannel.ARCA && !customerCuit.trim()) {
      toast.error(t("cuitRequired", "errors"));
      return;
    }

    if (invoiceChannel === InvoiceChannel.ARCA && !ivaType) {
      toast.error(t("ivaTypeRequired", "errors"));
      return;
    }

    setIsLoading(true);
    try {
      await onCheckout({
        paymentMethod,
        invoiceChannel,
        customerName,
        customerEmail,
        customerCuit,
        ivaType,
        discount: 0,
      });
    } finally {
      setIsLoading(false);
    }
  }, [
    paymentMethod,
    invoiceChannel,
    customerName,
    customerEmail,
    customerCuit,
    ivaType,
    onCheckout,
  ]);

  const formatCurrency = (value: number) => formatARS(value);

  return (
    <div className="vp-card vp-card-hover p-7 h-full flex flex-col">
      <div className="flex items-center justify-between mb-7">
        <h2 className="text-xl font-semibold text-[hsl(var(--vp-text))] flex items-center gap-2">
          <svg
            className="w-6 h-6 text-[hsl(var(--vp-primary))]"
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
          Carrito ({items.length})
        </h2>
        {items.length > 0 && (
          <button
            onClick={() => {
              localStorage.removeItem("pos.cartItems");
              window.location.reload();
            }}
            className="vp-button vp-button-ghost text-red-500 hover:text-red-600"
            title="Limpiar Carrito"
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
            <p className="text-lg font-semibold mb-1">Carrito vacío</p>
            <p className="text-sm text-[hsl(var(--vp-muted))]">
              Escanea o busca productos para comenzar
            </p>
          </div>
        ) : (
          items.map((item) => (
            <div
              key={item.productId}
              className="vp-card vp-card-soft vp-item-enter p-5 text-sm"
            >
              <div className="flex justify-between items-start mb-2">
                <div className="flex-1">
                  <h3 className="font-semibold text-[hsl(var(--vp-text))]">
                    {item.productName}
                  </h3>
                  <p className="text-xs text-[hsl(var(--vp-muted))]">
                    {formatCurrency(item.unitPrice)} x {item.quantity}
                  </p>
                </div>
                <button
                  onClick={() => onRemove(item.productId)}
                  className="text-red-500 hover:text-red-600 text-xs font-medium ml-2"
                >
                  ✕
                </button>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="vp-label text-xs">
                    Cant.{item.isSoldByWeight ? " (kg)" : ""}
                  </label>
                  <input
                    type="text"
                    inputMode={item.isSoldByWeight ? "decimal" : "numeric"}
                    placeholder={
                      item.isSoldByWeight
                        ? "e.g., 1.560 kg or 1,560 kg"
                        : "e.g., 5 units"
                    }
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
                    className="vp-input text-xs py-1.5"
                  />
                  {item.isSoldByWeight && (
                    <p className="text-[11px] text-[hsl(var(--vp-muted))] mt-1 whitespace-normal break-words">
                      {t("ui.weightQuantityHint", "pos")}
                    </p>
                  )}
                </div>
                <div>
                  <label className="vp-label text-xs">Desc.</label>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    inputMode="numeric"
                    value={discountInputs[item.productId] ?? item.discount}
                    onChange={(e) => {
                      const value = e.target.value;
                      setDiscountInputs((prev) => ({
                        ...prev,
                        [item.productId]: value,
                      }));
                      const parsed = Number.parseFloat(value.replace(",", "."));
                      onApplyDiscount(
                        item.productId,
                        Number.isFinite(parsed) ? parsed : 0,
                      );
                    }}
                    className="vp-input text-xs py-1.5"
                  />
                </div>
                <div>
                  <label className="vp-label text-xs">Total</label>
                  <div className="px-2 py-1 rounded text-xs font-semibold text-right bg-[hsl(var(--vp-bg-card-soft))] border border-[hsl(var(--vp-border))]">
                    {formatCurrency(getLineTotal(item))}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {items.length > 0 && (
        <>
          {/* Totals Section */}
          <div className="border-t border-[hsl(var(--vp-border))] pt-4 mb-5 space-y-2 text-sm">
            <div className="flex justify-between text-[hsl(var(--vp-muted))]">
              <span>{t("ui.subtotal", "pos")}:</span>
              <span>{formatCurrency(subtotal)}</span>
            </div>
            {totalDiscount > 0 && (
              <div className="flex justify-between text-rose-500">
                <span>{t("ui.totalDiscount", "pos")}:</span>
                <span>-{formatARS(totalDiscount)}</span>
              </div>
            )}
            <div className="flex justify-between text-[hsl(var(--vp-muted))]">
              <span>{t("ui.tax21", "pos")}:</span>
              <span>{formatCurrency(tax)}</span>
            </div>
            <div className="flex justify-between text-xl font-semibold text-[hsl(var(--vp-text))] bg-[hsl(var(--vp-primary)/0.12)] p-3 rounded-lg border border-[hsl(var(--vp-border))] mt-2">
              <span>{t("ui.total", "pos")}:</span>
              <span className="text-[hsl(var(--vp-primary))]">
                {formatCurrency(totalWithTax)}
              </span>
            </div>
          </div>

          {/* Customer & Invoice Section */}
          <button
            onClick={() => setShowCustomerForm(!showCustomerForm)}
            className="w-full mb-3 vp-panel-sm vp-hover-surface text-sm font-medium text-[hsl(var(--vp-text))] flex items-center justify-between"
          >
            <span>
              {customerName ? `Cliente: ${customerName}` : "Agregar Cliente"}
            </span>
            <svg
              className={`w-4 h-4 transform transition-transform ${
                showCustomerForm ? "rotate-180" : ""
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 14l-7 7m0 0l-7-7m7 7V3"
              />
            </svg>
          </button>

          {showCustomerForm && (
            <div className="vp-panel-sm bg-[hsl(var(--vp-bg-card-soft))] mb-3 space-y-3 text-sm">
              <div>
                <label className="vp-label text-xs">Cliente *</label>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Nombre del cliente"
                  className="vp-input text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="vp-label text-xs">Email</label>
                  <input
                    type="email"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    placeholder="email@ejemplo.com"
                    className="vp-input text-xs"
                  />
                </div>
                <div>
                  <label className="vp-label text-xs">Tipo de Factura</label>
                  <select
                    value={invoiceChannel}
                    onChange={(e) =>
                      setInvoiceChannel(e.target.value as InvoiceChannel)
                    }
                    className="vp-input text-xs"
                  >
                    <option value={InvoiceChannel.INTERNAL}>Interna</option>
                    {canUseArcaInvoicing && (
                      <option value={InvoiceChannel.ARCA}>ARCA</option>
                    )}
                    {!canUseArcaInvoicing && (
                      <option value={InvoiceChannel.ARCA} disabled>
                        ARCA (Plan Pro)
                      </option>
                    )}
                  </select>
                  <p className="text-[11px] text-[hsl(var(--vp-muted))] mt-1">
                    Interna: solo visible en el sistema y no se exporta. ARCA:
                    requiere datos fiscales y es reportable.
                  </p>
                </div>
              </div>

              {invoiceChannel === InvoiceChannel.ARCA && (
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="vp-label text-xs">CUIT *</label>
                    <input
                      type="text"
                      value={customerCuit}
                      onChange={(e) => setCustomerCuit(e.target.value)}
                      placeholder="20-12345678-9"
                      className="vp-input text-xs"
                    />
                  </div>
                  <div>
                    <label className="vp-label text-xs">Tipo IVA</label>
                    <select
                      value={ivaType}
                      onChange={(e) => setIvaType(e.target.value)}
                      className="vp-input text-xs"
                    >
                      <option value="RESPONSABLE_INSCRIPTO">Responsable</option>
                      <option value="MONOTRIBUTISTA">Monotributista</option>
                      <option value="NO_CATEGORIZADO">No Categorizado</option>
                    </select>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Payment Method */}
          <div className="mb-3">
            <label className="vp-label text-xs mb-1.5">Método de Pago</label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value as any)}
              className="vp-input text-sm"
            >
              <option value="cash">💵 Efectivo</option>
              <option value="card">💳 Tarjeta de Débito</option>
              <option value="check">📋 Cheque</option>
              <option value="online">🏦 Transferencia</option>
              {canUseMercadoPago && (
                <option value="mercadopago">🟔 Mercado Pago</option>
              )}
              {!canUseMercadoPago && (
                <option value="mercadopago" disabled>
                  🟔 Mercado Pago (Plan Pro)
                </option>
              )}
            </select>
          </div>

          {/* Checkout Button */}
          <button
            onClick={handleCheckout}
            disabled={isLoading || !customerName.trim()}
            className="vp-button vp-button-primary w-full py-3 font-semibold disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <svg
                  className="animate-spin h-5 w-5"
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
                Procesando...
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
                Completar Venta
              </>
            )}
          </button>
        </>
      )}
    </div>
  );
}

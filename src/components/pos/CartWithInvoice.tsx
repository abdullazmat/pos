"use client";

import { useState, useCallback } from "react";
import { InvoiceChannel } from "@/lib/models/Invoice";
import { toast } from "react-toastify";

interface CartItem {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  discount: number;
  total: number;
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
  const [paymentMethod, setPaymentMethod] =
    useState<CheckoutData["paymentMethod"]>("cash");
  const [invoiceChannel, setInvoiceChannel] = useState<InvoiceChannel>(
    InvoiceChannel.INTERNAL
  );
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerCuit, setCustomerCuit] = useState("");
  const [ivaType, setIvaType] = useState("RESPONSABLE_INSCRIPTO");
  const [isLoading, setIsLoading] = useState(false);
  const [showCustomerForm, setShowCustomerForm] = useState(false);

  const subtotal = items.reduce(
    (sum, item) => sum + item.quantity * item.unitPrice,
    0
  );
  const totalDiscount = items.reduce((sum, item) => sum + item.discount, 0);
  const tax = Math.round((subtotal - totalDiscount) * 0.21 * 100) / 100;
  const total = subtotal - totalDiscount + tax;

  const handleCheckout = useCallback(async () => {
    if (!customerName.trim()) {
      toast.error("Debes ingresar el nombre del cliente");
      return;
    }

    if (invoiceChannel === InvoiceChannel.ARCA && !customerCuit.trim()) {
      toast.error("CUIT es requerido para facturas ARCA");
      return;
    }

    if (invoiceChannel === InvoiceChannel.ARCA && !ivaType) {
      toast.error("Selecciona el tipo de IVA para facturas ARCA");
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
        discount: totalDiscount,
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
    totalDiscount,
    onCheckout,
  ]);

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
    }).format(value);

  return (
    <div className="bg-white rounded-lg shadow-md p-6 h-full flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
          <svg
            className="w-6 h-6 text-blue-600"
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
            onClick={() => window.location.reload()}
            className="text-red-600 hover:text-red-700 p-2"
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

      <div className="flex-1 overflow-y-auto space-y-3 mb-6">
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full py-16 text-gray-400">
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
            <p className="text-lg font-medium mb-1">Carrito vacío</p>
            <p className="text-sm">Escanea o busca productos para comenzar</p>
          </div>
        ) : (
          items.map((item) => (
            <div
              key={item.productId}
              className="bg-gray-50 p-3 rounded border border-gray-200 text-sm"
            >
              <div className="flex justify-between items-start mb-2">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-800">
                    {item.productName}
                  </h3>
                  <p className="text-xs text-gray-600">
                    {formatCurrency(item.unitPrice)} x {item.quantity}
                  </p>
                </div>
                <button
                  onClick={() => onRemove(item.productId)}
                  className="text-red-600 hover:text-red-800 text-xs font-medium ml-2"
                >
                  ✕
                </button>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-xs text-gray-600 mb-1">
                    Cant.
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(e) =>
                      onUpdateQuantity(item.productId, parseInt(e.target.value))
                    }
                    className="w-full px-2 py-1 border border-gray-300 rounded text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">
                    Desc.
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={item.discount}
                    onChange={(e) =>
                      onApplyDiscount(
                        item.productId,
                        parseFloat(e.target.value)
                      )
                    }
                    className="w-full px-2 py-1 border border-gray-300 rounded text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">
                    Total
                  </label>
                  <div className="px-2 py-1 bg-blue-50 rounded text-xs font-semibold text-right">
                    {formatCurrency(item.total)}
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
          <div className="border-t pt-3 mb-4 space-y-1 text-sm">
            <div className="flex justify-between text-gray-700">
              <span>Subtotal:</span>
              <span>{formatCurrency(subtotal)}</span>
            </div>
            {totalDiscount > 0 && (
              <div className="flex justify-between text-red-600">
                <span>Descuento:</span>
                <span>-{formatCurrency(totalDiscount)}</span>
              </div>
            )}
            <div className="flex justify-between text-gray-700">
              <span>IVA 21%:</span>
              <span>{formatCurrency(tax)}</span>
            </div>
            <div className="flex justify-between text-xl font-bold text-gray-900 bg-blue-50 p-3 rounded-lg border-2 border-blue-200 mt-2">
              <span>Total:</span>
              <span className="text-blue-600">{formatCurrency(total)}</span>
            </div>
          </div>

          {/* Customer & Invoice Section */}
          <button
            onClick={() => setShowCustomerForm(!showCustomerForm)}
            className="w-full mb-3 px-3 py-2 border-2 border-blue-400 rounded-lg text-sm font-medium text-blue-600 hover:bg-blue-50 transition flex items-center justify-between"
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
            <div className="bg-blue-50 p-3 rounded-lg mb-3 space-y-2 text-sm">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Cliente *
                </label>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Nombre del cliente"
                  className="w-full px-2 py-1.5 border border-gray-300 rounded text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    placeholder="email@ejemplo.com"
                    className="w-full px-2 py-1.5 border border-gray-300 rounded text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Tipo de Factura
                  </label>
                  <select
                    value={invoiceChannel}
                    onChange={(e) =>
                      setInvoiceChannel(e.target.value as InvoiceChannel)
                    }
                    className="w-full px-2 py-1.5 border border-gray-300 rounded text-xs"
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
                  <p className="text-[11px] text-gray-500 mt-1">
                    Interna: solo visible en el sistema y no se exporta.
                    ARCA: requiere datos fiscales y es reportable.
                  </p>
                </div>
              </div>

              {invoiceChannel === InvoiceChannel.ARCA && (
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      CUIT *
                    </label>
                    <input
                      type="text"
                      value={customerCuit}
                      onChange={(e) => setCustomerCuit(e.target.value)}
                      placeholder="20-12345678-9"
                      className="w-full px-2 py-1.5 border border-gray-300 rounded text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Tipo IVA
                    </label>
                    <select
                      value={ivaType}
                      onChange={(e) => setIvaType(e.target.value)}
                      className="w-full px-2 py-1.5 border border-gray-300 rounded text-xs"
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
            <label className="block text-xs font-medium text-gray-700 mb-1.5">
              Método de Pago
            </label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value as any)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
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
            className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-bold py-3 rounded-lg transition shadow-md hover:shadow-lg flex items-center justify-center gap-2"
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

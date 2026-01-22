"use client";

import { useState, useCallback } from "react";

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
  onCheckout: (paymentMethod: string) => Promise<void>;
}

export default function Cart({
  items,
  onRemove,
  onUpdateQuantity,
  onApplyDiscount,
  onCheckout,
}: CartProps) {
  const [paymentMethod, setPaymentMethod] = useState<string>("cash");
  const [isLoading, setIsLoading] = useState(false);

  const subtotal = items.reduce(
    (sum, item) => sum + item.quantity * item.unitPrice,
    0
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

      <div className="flex-1 overflow-y-auto space-y-4 mb-6">
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
              className="bg-gray-50 p-4 rounded border border-gray-200"
            >
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="font-semibold text-gray-800">
                    {item.productName}
                  </h3>
                  <p className="text-sm text-gray-600">
                    ${item.unitPrice.toFixed(2)} x {item.quantity}
                  </p>
                </div>
                <button
                  onClick={() => onRemove(item.productId)}
                  className="text-red-600 hover:text-red-800 text-sm font-medium"
                >
                  Eliminar
                </button>
              </div>

              <div className="grid grid-cols-3 gap-2 mb-3">
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
                    className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">
                    Descuento
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
                    className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">
                    Total
                  </label>
                  <div className="px-2 py-1 bg-blue-50 rounded text-sm font-semibold">
                    ${item.total.toFixed(2)}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {items.length > 0 && (
        <>
          <div className="border-t pt-4 space-y-2 mb-6">
            <div className="flex justify-between text-gray-700">
              <span>Subtotal:</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            {totalDiscount > 0 && (
              <div className="flex justify-between text-red-600">
                <span>Descuento:</span>
                <span>-${totalDiscount.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between text-2xl font-bold text-gray-900 bg-blue-50 p-4 rounded-lg border-2 border-blue-200">
              <span>Total:</span>
              <span className="text-blue-600">${total.toFixed(2)}</span>
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Método de Pago
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="cash">Efectivo</option>
                <option value="card">Tarjeta</option>
                <option value="check">Cheque</option>
                <option value="online">Online</option>
              </select>
            </div>

            <button
              onClick={handleCheckout}
              disabled={isLoading}
              className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-bold py-3 rounded-lg transition shadow-md hover:shadow-lg flex items-center justify-center gap-2"
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
                  Finalizar Venta
                </>
              )}
            </button>
          </div>
        </>
      )}
    </div>
  );
}

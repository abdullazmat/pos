"use client";

import { useState } from "react";
import { X, Lock } from "lucide-react";
import { toast } from "react-toastify";

interface CloseBoxModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (countedAmount: number) => Promise<void>;
  expectedAmount: number;
  salesTotal: number;
  withdrawalsTotal: number;
  creditNotesTotal: number;
}

export default function CloseBoxModal({
  isOpen,
  onClose,
  onConfirm,
  expectedAmount,
  salesTotal,
  withdrawalsTotal,
  creditNotesTotal,
}: CloseBoxModalProps) {
  const [countedAmount, setCountedAmount] = useState("");
  const [loading, setLoading] = useState(false);

  const difference = countedAmount
    ? parseFloat(countedAmount) - expectedAmount
    : 0;
  const differencePercent =
    expectedAmount > 0 ? Math.abs((difference / expectedAmount) * 100) : 0;
  const hasWarning = differencePercent > 2; // Warn if >2% difference

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!countedAmount || parseFloat(countedAmount) < 0) {
      toast.error("Ingresa un monto válido");
      return;
    }

    setLoading(true);
    try {
      await onConfirm(parseFloat(countedAmount));
      setCountedAmount("");
      onClose();
    } catch (error) {
      console.error("Close box error:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-2">
            <Lock className="w-6 h-6 text-red-600" />
            <h2 className="text-xl font-bold text-gray-900">Cerrar Caja</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Summary Info */}
          <div className="bg-gray-50 p-4 rounded-lg space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Ventas:</span>
              <span className="font-medium">${salesTotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Retiros:</span>
              <span className="font-medium">
                -${withdrawalsTotal.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Devoluciones:</span>
              <span className="font-medium">
                -${creditNotesTotal.toFixed(2)}
              </span>
            </div>
            <div className="border-t pt-3 flex justify-between">
              <span className="font-semibold text-gray-900">
                Monto Esperado:
              </span>
              <span className="font-bold text-lg text-blue-600">
                ${expectedAmount.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Counted Amount Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Monto Contado *
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                $
              </span>
              <input
                type="number"
                step="0.01"
                min="0"
                value={countedAmount}
                onChange={(e) => setCountedAmount(e.target.value)}
                placeholder="0.00"
                autoFocus
                className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-lg font-semibold"
              />
            </div>
          </div>

          {/* Difference Alert */}
          {countedAmount && (
            <div
              className={`p-4 rounded-lg ${
                hasWarning
                  ? "bg-red-50 border border-red-200"
                  : "bg-green-50 border border-green-200"
              }`}
            >
              <div className="flex justify-between mb-2">
                <span
                  className={hasWarning ? "text-red-700" : "text-green-700"}
                >
                  Diferencia:
                </span>
                <span
                  className={`font-bold text-lg ${
                    difference >= 0
                      ? hasWarning
                        ? "text-red-700"
                        : "text-green-700"
                      : "text-red-700"
                  }`}
                >
                  {difference >= 0 ? "+" : ""}${Math.abs(difference).toFixed(2)}{" "}
                  ({differencePercent.toFixed(1)}%)
                </span>
              </div>
              {hasWarning && (
                <p className="text-xs text-red-600">
                  ⚠️ La diferencia es mayor al 2%. Verifica el conteo.
                </p>
              )}
            </div>
          )}

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading || !countedAmount}
              className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Cerrando...
                </>
              ) : (
                "Confirmar Cierre"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

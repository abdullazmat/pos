"use client";

import { useState } from "react";
import { X, Lock } from "lucide-react";
import { toast } from "react-toastify";
import { useGlobalLanguage } from "@/lib/hooks/useGlobalLanguage";

const CLOSE_BOX_COPY = {
  es: {
    title: "Cerrar Caja",
    sales: "Ventas:",
    withdrawals: "Retiros:",
    refunds: "Devoluciones:",
    expectedAmount: "Monto Esperado:",
    countedAmount: "Monto Contado *",
    difference: "Diferencia:",
    differenceWarning: "⚠️ La diferencia es mayor al 2%. Verifica el conteo.",
    invalidAmount: "Ingresa un monto válido",
    cancel: "Cancelar",
    confirmClose: "Confirmar Cierre",
    closing: "Cerrando...",
  },
  en: {
    title: "Close Register",
    sales: "Sales:",
    withdrawals: "Withdrawals:",
    refunds: "Refunds:",
    expectedAmount: "Expected Amount:",
    countedAmount: "Counted Amount *",
    difference: "Difference:",
    differenceWarning: "⚠️ Difference is greater than 2%. Verify the count.",
    invalidAmount: "Enter a valid amount",
    cancel: "Cancel",
    confirmClose: "Confirm Close",
    closing: "Closing...",
  },
  pt: {
    title: "Fechar Caixa",
    sales: "Vendas:",
    withdrawals: "Retiradas:",
    refunds: "Devoluções:",
    expectedAmount: "Valor Esperado:",
    countedAmount: "Valor Contado *",
    difference: "Diferença:",
    differenceWarning: "⚠️ A diferença é maior que 2%. Verifique a contagem.",
    invalidAmount: "Digite um valor válido",
    cancel: "Cancelar",
    confirmClose: "Confirmar Fechamento",
    closing: "Fechando...",
  },
};

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
  const { currentLanguage } = useGlobalLanguage();
  const copy = (CLOSE_BOX_COPY[currentLanguage] ||
    CLOSE_BOX_COPY.en) as typeof CLOSE_BOX_COPY.en;
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
      toast.error(copy.invalidAmount);
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
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl max-w-md w-full mx-4 border border-slate-200 dark:border-slate-700">
        <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800">
          <div className="flex items-center gap-2">
            <Lock className="w-6 h-6 text-red-600" />
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              {copy.title}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-slate-500 dark:text-gray-400 hover:text-slate-700 dark:hover:text-gray-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="p-6 space-y-4 bg-white dark:bg-slate-800"
        >
          {/* Summary Info */}
          <div className="bg-slate-100 dark:bg-slate-900/50 p-4 rounded-lg space-y-3 border border-slate-300 dark:border-slate-700">
            <div className="flex justify-between text-sm">
              <span className="text-slate-600 dark:text-gray-400">
                {copy.sales}
              </span>
              <span className="font-medium text-slate-900 dark:text-gray-100">
                ${salesTotal.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-600 dark:text-gray-400">
                {copy.withdrawals}
              </span>
              <span className="font-medium text-slate-900 dark:text-gray-100">
                -${withdrawalsTotal.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-600 dark:text-gray-400">
                {copy.refunds}
              </span>
              <span className="font-medium text-slate-900 dark:text-gray-100">
                -${creditNotesTotal.toFixed(2)}
              </span>
            </div>
            <div className="border-t border-slate-300 dark:border-slate-700 pt-3 flex justify-between">
              <span className="font-semibold text-slate-700 dark:text-gray-200">
                {copy.expectedAmount}
              </span>
              <span className="font-bold text-lg text-blue-600 dark:text-blue-400">
                ${expectedAmount.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Counted Amount Input */}
          <div>
            <label className="block text-sm font-medium text-slate-900 dark:text-gray-200 mb-1">
              {copy.countedAmount}
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500 dark:text-gray-500">
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
                className="w-full pl-8 pr-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-gray-100 placeholder-slate-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-red-500 focus:border-transparent text-lg font-semibold"
              />
            </div>
          </div>

          {/* Difference Alert */}
          {countedAmount && (
            <div
              className={`p-4 rounded-lg ${
                hasWarning
                  ? "bg-red-100 dark:bg-red-50/10 border border-red-300 dark:border-red-200"
                  : "bg-green-100 dark:bg-green-50/10 border border-green-300 dark:border-green-200"
              }`}
            >
              <div className="flex justify-between mb-2">
                <span
                  className={
                    hasWarning
                      ? "text-red-700 dark:text-red-400"
                      : "text-green-700 dark:text-green-400"
                  }
                >
                  {copy.difference}
                </span>
                <span
                  className={`font-bold text-lg ${
                    difference >= 0
                      ? hasWarning
                        ? "text-red-700 dark:text-red-400"
                        : "text-green-700 dark:text-green-400"
                      : "text-red-700 dark:text-red-400"
                  }`}
                >
                  {difference >= 0 ? "+" : ""}${Math.abs(difference).toFixed(2)}{" "}
                  ({differencePercent.toFixed(1)}%)
                </span>
              </div>
              {hasWarning && (
                <p className="text-xs text-red-700 dark:text-red-400">
                  {copy.differenceWarning}
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
              className="flex-1 px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg font-medium text-slate-700 dark:text-gray-300 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-50"
            >
              {copy.cancel}
            </button>
            <button
              type="submit"
              disabled={loading || !countedAmount}
              className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  {copy.closing}
                </>
              ) : (
                copy.confirmClose
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

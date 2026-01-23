"use client";

import { useState } from "react";
import { X, DollarSign } from "lucide-react";
import { toast } from "react-toastify";

interface WithdrawalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (amount: number, reason: string, notes: string) => Promise<void>;
  currentBalance: number;
}

export default function WithdrawalModal({
  isOpen,
  onClose,
  onConfirm,
  currentBalance,
}: WithdrawalModalProps) {
  const [amount, setAmount] = useState("");
  const [reason, setReason] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);

  const reasons = [
    "Pago a proveedores",
    "Gastos operacionales",
    "Depósito bancario",
    "Otro",
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!amount || parseFloat(amount) <= 0) {
      toast.error("Ingresa un monto válido");
      return;
    }

    if (!reason) {
      toast.error("Selecciona un motivo");
      return;
    }

    const amountNum = parseFloat(amount);
    if (amountNum > currentBalance) {
      toast.error(
        `Saldo insuficiente. Disponible: $${currentBalance.toFixed(2)}`,
      );
      return;
    }

    setLoading(true);
    try {
      await onConfirm(amountNum, reason, notes);
      setAmount("");
      setReason("");
      setNotes("");
      onClose();
    } catch (error) {
      console.error("Withdrawal error:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-slate-800 rounded-lg shadow-xl max-w-md w-full mx-4 border border-slate-700">
        <div className="flex items-center justify-between p-6 border-b border-slate-700">
          <div className="flex items-center gap-2">
            <DollarSign className="w-6 h-6 text-red-600" />
            <h2 className="text-xl font-bold text-white">Registrar Retiro</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Current Balance Info */}
          <div className="bg-blue-900/30 p-4 rounded-lg border border-blue-700/50">
            <p className="text-sm text-blue-300 font-medium">
              Saldo Disponible
            </p>
            <p className="text-2xl font-bold text-blue-100">
              ${currentBalance.toFixed(2)}
            </p>
          </div>

          {/* Amount Input */}
          <div>
            <label className="block text-sm font-medium text-gray-200 mb-1">
              Monto *
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                $
              </span>
              <input
                type="number"
                step="0.01"
                min="0"
                max={currentBalance}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="w-full pl-8 pr-4 py-2 border border-slate-600 rounded-lg bg-slate-700 text-gray-100 focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Reason Select */}
          <div>
            <label className="block text-sm font-medium text-gray-200 mb-1">
              Motivo *
            </label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full px-4 py-2 border border-slate-600 rounded-lg bg-slate-700 text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Selecciona un motivo</option>
              {reasons.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-200 mb-1">
              Notas (Opcional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Detalles adicionales..."
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 px-4 py-2 border border-slate-600 rounded-lg font-medium text-gray-300 hover:bg-slate-700 disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Procesando...
                </>
              ) : (
                "Registrar Retiro"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

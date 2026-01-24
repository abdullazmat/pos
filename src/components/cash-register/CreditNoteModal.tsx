"use client";

import { useState } from "react";
import { X, RotateCcw } from "lucide-react";
import { toast } from "react-toastify";
import { useLanguage } from "@/lib/context/LanguageContext";

const CREDIT_NOTE_COPY = {
  es: {
    title: "Nota de Crédito",
    availableBalance: "Saldo Disponible",
    amount: "Monto de Devolución *",
    reason: "Motivo *",
    selectReason: "Selecciona un motivo",
    notes: "Notas (Opcional)",
    notesPlaceholder: "Referencia de transacción, número de cliente, etc...",
    cancel: "Cancelar",
    register: "Registrar Devolución",
    processing: "Procesando...",
    invalidAmount: "Ingresa un monto válido",
    selectMotivError: "Selecciona un motivo",
    insufficientBalance: "Saldo insuficiente. Disponible:",
    reason1: "Devolución de cliente",
    reason2: "Descuento adicional",
    reason3: "Ajuste de error",
    reason4: "Otro",
  },
  en: {
    title: "Credit Note",
    availableBalance: "Available Balance",
    amount: "Refund Amount *",
    reason: "Reason *",
    selectReason: "Select a reason",
    notes: "Notes (Optional)",
    notesPlaceholder: "Transaction reference, customer number, etc...",
    cancel: "Cancel",
    register: "Register Refund",
    processing: "Processing...",
    invalidAmount: "Enter a valid amount",
    selectMotivError: "Select a reason",
    insufficientBalance: "Insufficient balance. Available:",
    reason1: "Customer refund",
    reason2: "Additional discount",
    reason3: "Error adjustment",
    reason4: "Other",
  },
  pt: {
    title: "Nota de Crédito",
    availableBalance: "Saldo Disponível",
    amount: "Valor da Devolução *",
    reason: "Motivo *",
    selectReason: "Selecione um motivo",
    notes: "Notas (Opcional)",
    notesPlaceholder: "Referência de transação, número do cliente, etc...",
    cancel: "Cancelar",
    register: "Registrar Devolução",
    processing: "Processando...",
    invalidAmount: "Digite um valor válido",
    selectMotivError: "Selecione um motivo",
    insufficientBalance: "Saldo insuficiente. Disponível:",
    reason1: "Devolução do cliente",
    reason2: "Desconto adicional",
    reason3: "Ajuste de erro",
    reason4: "Outro",
  },
};

interface CreditNoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (amount: number, reason: string, notes: string) => Promise<void>;
  currentBalance: number;
}

export default function CreditNoteModal({
  isOpen,
  onClose,
  onConfirm,
  currentBalance,
}: CreditNoteModalProps) {
  const { currentLanguage } = useLanguage();
  const copy =
    CREDIT_NOTE_COPY[currentLanguage as keyof typeof CREDIT_NOTE_COPY] ||
    CREDIT_NOTE_COPY.en;

  const [amount, setAmount] = useState("");
  const [reason, setReason] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);

  const reasons = [copy.reason1, copy.reason2, copy.reason3, copy.reason4];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!amount || parseFloat(amount) <= 0) {
      toast.error(copy.invalidAmount);
      return;
    }

    if (!reason) {
      toast.error(copy.selectMotivError);
      return;
    }

    const amountNum = parseFloat(amount);
    if (amountNum > currentBalance) {
      toast.error(`${copy.insufficientBalance} $${currentBalance.toFixed(2)}`);
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
      console.error("Credit note error:", error);
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
            <RotateCcw className="w-6 h-6 text-orange-600" />
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
          {/* Current Balance Info */}
          <div className="bg-amber-100 dark:bg-amber-900/30 p-4 rounded-lg border border-amber-300 dark:border-amber-700/50">
            <p className="text-sm text-amber-800 dark:text-amber-300 font-medium">
              {copy.availableBalance}
            </p>
            <p className="text-2xl font-bold text-amber-900 dark:text-amber-100">
              ${currentBalance.toFixed(2)}
            </p>
          </div>

          {/* Amount Input */}
          <div>
            <label className="block text-sm font-medium text-slate-900 dark:text-gray-200 mb-1">
              {copy.amount}
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500 dark:text-gray-500">
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
                className="w-full pl-8 pr-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-gray-100 placeholder-slate-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Reason Select */}
          <div>
            <label className="block text-sm font-medium text-slate-900 dark:text-gray-200 mb-1">
              {copy.reason}
            </label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-gray-100 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            >
              <option value="">{copy.selectReason}</option>
              {reasons.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-slate-900 dark:text-gray-200 mb-1">
              {copy.notes}
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={copy.notesPlaceholder}
              rows={3}
              className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-gray-100 placeholder-slate-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
          </div>

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
              disabled={loading}
              className="flex-1 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-medium disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  {copy.processing}
                </>
              ) : (
                copy.register
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

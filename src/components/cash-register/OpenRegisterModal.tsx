"use client";

import React, { useMemo, useState, useEffect } from "react";
import { useLanguage } from "@/lib/context/LanguageContext";

const OPEN_REGISTER_COPY = {
  es: {
    title: "Apertura de Caja",
    description: "Cuenta el efectivo inicial y registra la apertura",
    depositTitle: "Ingreso de Dinero",
    depositDescription: "Registra el dinero ingresado a la caja",
    bills: "Billetes",
    coins: "Monedas",
    total: "TOTAL",
    billsEmoji: "💵",
    coinsEmoji: "🪙",
    counted: "Total Contado",
    manualEntry: "Monto manual",
    manualEntryHint: "Si completas el monto manual, se usará ese total.",
    cancel: "Cancelar",
    continue: "Continuar",
    depositContinue: "Registrar",
  },
  en: {
    title: "Open Register",
    description: "Count the initial cash and register the opening",
    depositTitle: "Cash In",
    depositDescription: "Register money added to the register",
    bills: "Bills",
    coins: "Coins",
    total: "TOTAL",
    billsEmoji: "💵",
    coinsEmoji: "🪙",
    counted: "Total Counted",
    manualEntry: "Manual amount",
    manualEntryHint: "If you enter a manual amount, it will be used.",
    cancel: "Cancel",
    continue: "Continue",
    depositContinue: "Register",
  },
  pt: {
    title: "Abertura de Caixa",
    description: "Conte o dinheiro inicial e registre a abertura",
    depositTitle: "Entrada de Dinheiro",
    depositDescription: "Registre o dinheiro inserido no caixa",
    bills: "Notas",
    coins: "Moedas",
    total: "TOTAL",
    billsEmoji: "💵",
    coinsEmoji: "🪙",
    counted: "Total Contado",
    manualEntry: "Valor manual",
    manualEntryHint: "Se você preencher o valor manual, ele será usado.",
    cancel: "Cancelar",
    continue: "Continuar",
    depositContinue: "Registrar",
  },
};

interface DenomRowProps {
  label: string;
  value: number;
  onChange: (qty: number) => void;
}

function DenomRow({ label, value, onChange }: DenomRowProps) {
  const [qty, setQty] = useState<number>(0);
  const total = qty * value;
  return (
    <div className="flex items-center justify-between gap-3 bg-slate-200 dark:bg-gray-800/40 rounded-lg px-4 py-3">
      <div className="text-slate-900 dark:text-gray-200">{label}</div>
      <div className="flex items-center gap-3">
        <span className="text-slate-600 dark:text-gray-400">×</span>
        <input
          type="number"
          min={0}
          value={qty}
          onChange={(e) => {
            const v = Math.max(0, Number(e.target.value) || 0);
            setQty(v);
            onChange(v);
          }}
          className="w-20 bg-white dark:bg-gray-900 border border-slate-300 dark:border-gray-700 rounded-md text-slate-900 dark:text-gray-100 px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
        <span className="text-slate-600 dark:text-gray-400">=</span>
        <span className="font-semibold text-green-600 dark:text-green-400">
          ${total.toFixed(2)}
        </span>
      </div>
    </div>
  );
}

export default function OpenRegisterModal({
  open,
  onClose,
  onConfirm,
  mode = "open",
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: (amount: number) => void;
  mode?: "open" | "deposit";
}) {
  const { currentLanguage } = useLanguage();
  const copy =
    OPEN_REGISTER_COPY[currentLanguage as keyof typeof OPEN_REGISTER_COPY] ||
    OPEN_REGISTER_COPY.en;
  const isDeposit = mode === "deposit";

  const [billTotals, setBillTotals] = useState<Record<string, number>>({});
  const [coinTotals, setCoinTotals] = useState<Record<string, number>>({});
  const [manualTotal, setManualTotal] = useState<string>("");

  const bills = [10000, 2000, 1000, 500, 200, 100, 50].map((v) => ({
    label: `$${v.toLocaleString()}`,
    value: v,
    key: String(v),
  }));
  const coins = [0.5, 0.25, 0.1, 0.05].map((v) => ({
    label: `$${v.toFixed(2)}`,
    value: v,
    key: String(v),
  }));

  const totalBills = useMemo(
    () => Object.values(billTotals).reduce((a, b) => a + b, 0),
    [billTotals],
  );
  const totalCoins = useMemo(
    () => Object.values(coinTotals).reduce((a, b) => a + b, 0),
    [coinTotals],
  );
  const total = totalBills + totalCoins;
  const manualValue = manualTotal.trim().length
    ? Number(manualTotal.replace(",", "."))
    : null;
  const manualAmount =
    manualValue !== null && !Number.isNaN(manualValue) && manualValue >= 0
      ? manualValue
      : null;
  const effectiveTotal = manualAmount !== null ? manualAmount : total;

  useEffect(() => {
    if (open) {
      setManualTotal("");
    }
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center receipt-overlay">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative w-full max-w-5xl mx-auto bg-white dark:bg-gray-900 rounded-2xl border border-slate-300 dark:border-gray-700 shadow-xl overflow-hidden receipt-modal">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-300 dark:border-gray-800 bg-slate-50 dark:bg-gray-800 no-print">
          <div className="flex items-center gap-2 text-slate-900 dark:text-gray-100 text-xl font-semibold">
            <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-slate-200 dark:bg-gray-700">
              $
            </span>
            {isDeposit ? copy.depositTitle : copy.title}
          </div>
          <button
            onClick={onClose}
            className="text-slate-500 dark:text-gray-400 hover:text-slate-700 dark:hover:text-gray-200"
          >
            ✕
          </button>
        </div>

        <div className="px-6 py-4 text-sm text-slate-600 dark:text-gray-400 border-b border-slate-300 dark:border-gray-800 no-print">
          {isDeposit ? copy.depositDescription : copy.description}
        </div>

        <div className="px-6 py-4 grid grid-cols-1 md:grid-cols-3 gap-4 receipt-container">
          <div className="bg-green-100 dark:bg-green-900/15 border border-green-300 dark:border-green-700 rounded-lg p-4">
            <div className="text-slate-700 dark:text-gray-300 text-sm">
              {copy.bills}
            </div>
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              ${totalBills.toFixed(2)}
            </div>
          </div>
          <div className="bg-blue-100 dark:bg-blue-900/15 border border-blue-300 dark:border-blue-700 rounded-lg p-4">
            <div className="text-slate-700 dark:text-gray-300 text-sm">
              {copy.coins}
            </div>
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              ${totalCoins.toFixed(2)}
            </div>
          </div>
          <div className="bg-purple-100 dark:bg-purple-900/15 border border-purple-300 dark:border-purple-700 rounded-lg p-4">
            <div className="text-slate-700 dark:text-gray-300 text-sm">
              {copy.total}
            </div>
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
              ${total.toFixed(2)}
            </div>
          </div>
        </div>

        <div className="px-6 pb-6 grid grid-cols-1 md:grid-cols-2 gap-6 max-h-[52vh] overflow-y-auto receipt-container">
          <div>
            <div className="flex items-center gap-2 text-slate-700 dark:text-gray-300 mb-3">
              <span className="inline-flex items-center justify-center w-6 h-6 rounded-md bg-green-200 dark:bg-green-900/40 text-green-700 dark:text-green-300">
                {copy.billsEmoji}
              </span>
              {copy.bills}
            </div>
            <div className="space-y-3">
              {bills.map((b) => (
                <DenomRow
                  key={b.key}
                  label={b.label}
                  value={b.value}
                  onChange={(qty) =>
                    setBillTotals((prev) => ({
                      ...prev,
                      [b.key]: qty * b.value,
                    }))
                  }
                />
              ))}
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2 text-slate-700 dark:text-gray-300 mb-3">
              <span className="inline-flex items-center justify-center w-6 h-6 rounded-md bg-blue-200 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300">
                {copy.coinsEmoji}
              </span>
              {copy.coins}
            </div>
            <div className="space-y-3">
              {coins.map((c) => (
                <DenomRow
                  key={c.key}
                  label={c.label}
                  value={c.value}
                  onChange={(qty) =>
                    setCoinTotals((prev) => ({
                      ...prev,
                      [c.key]: qty * c.value,
                    }))
                  }
                />
              ))}
            </div>
          </div>
        </div>

        {isDeposit && (
          <div className="px-6 pb-4">
            <label className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-2">
              {copy.manualEntry}
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 dark:text-gray-500">
                $
              </span>
              <input
                type="number"
                min={0}
                step="0.01"
                value={manualTotal}
                onChange={(e) => setManualTotal(e.target.value)}
                placeholder="0.00"
                className="w-full pl-8 pr-4 py-2 border border-slate-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-slate-900 dark:text-gray-100 placeholder-slate-400 dark:placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <p className="mt-2 text-xs text-slate-500 dark:text-gray-400">
              {copy.manualEntryHint}
            </p>
          </div>
        )}

        <div className="px-6 py-4 border-t border-slate-300 dark:border-gray-800 flex items-center justify-between bg-slate-50 dark:bg-gray-800 no-print">
          <div>
            <div className="text-sm text-slate-600 dark:text-gray-400">
              {copy.counted}
            </div>
            <div className="text-3xl font-bold text-slate-900 dark:text-gray-100">
              ${effectiveTotal.toFixed(2)}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-6 py-2 rounded-lg bg-slate-200 dark:bg-gray-700 text-slate-700 dark:text-gray-200 hover:bg-slate-300 dark:hover:bg-gray-600"
            >
              {copy.cancel}
            </button>
            <button
              onClick={() => onConfirm(effectiveTotal)}
              className="px-6 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
            >
              {isDeposit ? copy.depositContinue : copy.continue} ($
              {effectiveTotal.toFixed(2)})
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

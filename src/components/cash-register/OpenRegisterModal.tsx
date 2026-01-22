"use client";

import React, { useMemo, useState } from "react";

interface DenomRowProps {
  label: string;
  value: number;
  onChange: (qty: number) => void;
}

function DenomRow({ label, value, onChange }: DenomRowProps) {
  const [qty, setQty] = useState<number>(0);
  const total = qty * value;
  return (
    <div className="flex items-center justify-between gap-3 bg-gray-800/40 rounded-lg px-4 py-3">
      <div className="text-gray-200">{label}</div>
      <div className="flex items-center gap-3">
        <span className="text-gray-400">×</span>
        <input
          type="number"
          min={0}
          value={qty}
          onChange={(e) => {
            const v = Math.max(0, Number(e.target.value) || 0);
            setQty(v);
            onChange(v);
          }}
          className="w-20 bg-gray-900 border border-gray-700 rounded-md text-gray-100 px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
        <span className="text-gray-400">=</span>
        <span className="font-semibold text-green-400">
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
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: (amount: number) => void;
}) {
  const [billTotals, setBillTotals] = useState<Record<string, number>>({});
  const [coinTotals, setCoinTotals] = useState<Record<string, number>>({});

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
    [billTotals]
  );
  const totalCoins = useMemo(
    () => Object.values(coinTotals).reduce((a, b) => a + b, 0),
    [coinTotals]
  );
  const total = totalBills + totalCoins;

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative w-full max-w-5xl mx-auto bg-gray-900 rounded-2xl border border-gray-700 shadow-xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800">
          <div className="flex items-center gap-2 text-gray-100 text-xl font-semibold">
            <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-gray-800">
              $
            </span>
            Apertura de Caja
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-200"
          >
            ✕
          </button>
        </div>

        <div className="px-6 py-4 text-sm text-gray-400 border-b border-gray-800">
          Cuenta el efectivo inicial y registra la apertura
        </div>

        <div className="px-6 py-4 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-green-900/15 border border-green-700 rounded-lg p-4">
            <div className="text-gray-300 text-sm">Billetes</div>
            <div className="text-2xl font-bold text-green-400">
              ${totalBills.toFixed(2)}
            </div>
          </div>
          <div className="bg-blue-900/15 border border-blue-700 rounded-lg p-4">
            <div className="text-gray-300 text-sm">Monedas</div>
            <div className="text-2xl font-bold text-blue-400">
              ${totalCoins.toFixed(2)}
            </div>
          </div>
          <div className="bg-purple-900/15 border border-purple-700 rounded-lg p-4">
            <div className="text-gray-300 text-sm">TOTAL</div>
            <div className="text-2xl font-bold text-purple-400">
              ${total.toFixed(2)}
            </div>
          </div>
        </div>

        <div className="px-6 pb-6 grid grid-cols-1 md:grid-cols-2 gap-6 max-h-[52vh] overflow-y-auto">
          <div>
            <div className="flex items-center gap-2 text-gray-300 mb-3">
              <span className="inline-flex items-center justify-center w-6 h-6 rounded-md bg-green-900/40 text-green-300">
                💵
              </span>
              Billetes
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
            <div className="flex items-center gap-2 text-gray-300 mb-3">
              <span className="inline-flex items-center justify-center w-6 h-6 rounded-md bg-blue-900/40 text-blue-300">
                🪙
              </span>
              Monedas
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

        <div className="px-6 py-4 border-t border-gray-800 flex items-center justify-between">
          <div>
            <div className="text-sm text-gray-400">Total Contado</div>
            <div className="text-3xl font-bold text-gray-100">
              ${total.toFixed(2)}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-6 py-2 rounded-lg bg-gray-800 text-gray-200 hover:bg-gray-700"
            >
              Cancelar
            </button>
            <button
              onClick={() => onConfirm(total)}
              className="px-6 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
            >
              Continuar (${total.toFixed(2)})
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

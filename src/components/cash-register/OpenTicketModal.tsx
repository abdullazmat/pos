"use client";

import React from "react";

export default function OpenTicketModal({
  open,
  onClose,
  onConfirm,
  data,
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  data: {
    businessName: string;
    cashierName: string;
    sessionId: string;
    amount: number;
    date: string; // e.g., 14/12/2025
    time: string; // e.g., 12:26:24
  };
}) {
  if (!open) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative w-full max-w-xl mx-auto bg-gray-900 rounded-2xl border border-gray-700 shadow-xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800">
          <div className="text-gray-100 text-xl font-semibold">
            Ticket de Apertura
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-200"
          >
            ✕
          </button>
        </div>

        <div className="px-6 py-6">
          <div className="mx-auto max-w-md bg-gray-800 rounded-lg border border-gray-700 p-4 text-sm">
            <div className="text-center text-gray-100 font-semibold mb-2">
              {data.businessName}
            </div>
            <div className="border border-gray-600 rounded-md px-2 py-1 mb-3 text-center text-gray-200">
              APERTURA DE CAJA
            </div>
            <div className="grid grid-cols-2 gap-y-1 text-gray-300">
              <div>FECHA:</div>
              <div className="text-right">{data.date}</div>
              <div>HORA:</div>
              <div className="text-right">{data.time}</div>
              <div>CAJERO:</div>
              <div className="text-right">{data.cashierName}</div>
              <div>SESIÓN:</div>
              <div className="text-right">{data.sessionId}</div>
            </div>
            <div className="border-t border-gray-700 my-3" />
            <div className="flex items-center justify-between text-gray-100 font-semibold">
              <span>TOTAL APERTURA:</span>
              <span>${data.amount.toFixed(2)}</span>
            </div>
            <div className="border-t border-gray-700 my-3" />
            <div className="text-center text-gray-300">
              <div>Sistema POS</div>
              <div>¡Buenas ventas!</div>
            </div>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-gray-800 flex items-center gap-3 justify-end">
          <button
            onClick={handlePrint}
            className="px-5 py-2 rounded-lg bg-blue-700 text-white hover:bg-blue-800 flex items-center gap-2"
          >
            <span className="inline-block">🖨️</span> Imprimir
          </button>
          <button
            onClick={onConfirm}
            className="px-5 py-2 rounded-lg bg-green-700 text-white hover:bg-green-800"
          >
            Confirmar Apertura
          </button>
        </div>
      </div>
    </div>
  );
}

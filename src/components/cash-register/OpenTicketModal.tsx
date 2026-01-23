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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="relative w-full max-w-md mx-auto bg-slate-900 rounded-xl border border-slate-700 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700 bg-slate-800">
          <h2 className="text-white text-xl font-bold">Ticket de Apertura</h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white text-2xl transition"
          >
            ✕
          </button>
        </div>

        {/* Ticket Content */}
        <div className="px-6 py-8">
          {/* Ticket Style */}
          <div className="bg-slate-100 rounded-sm border-2 border-gray-900 p-4 font-mono text-sm text-gray-900 max-w-sm mx-auto">
            {/* Header */}
            <div className="text-center font-bold mb-1">
              {data.businessName}
            </div>

            {/* Dotted Separator */}
            <div className="text-center text-gray-600 mb-3 tracking-wide">
              ...................................................................
            </div>

            {/* Title Box */}
            <div className="border-2 border-gray-900 text-center py-2 mb-3 font-bold tracking-wide">
              APERTURA DE CAJA
            </div>

            {/* Receipt Details */}
            <div className="space-y-1 mb-4 text-xs">
              <div className="flex justify-between">
                <span>FECHA:</span>
                <span>{data.date}</span>
              </div>
              <div className="flex justify-between">
                <span>HORA:</span>
                <span>{data.time}</span>
              </div>
              <div className="flex justify-between">
                <span>CAJERO:</span>
                <span>{data.cashierName}</span>
              </div>
              <div className="flex justify-between">
                <span>SESIÓN:</span>
                <span>{data.sessionId}</span>
              </div>
            </div>

            {/* Dotted Separator */}
            <div className="text-center text-gray-600 mb-3 tracking-wide">
              ...................................................................
            </div>

            {/* Total */}
            <div className="flex justify-between font-bold text-sm mb-3">
              <span>TOTAL APERTURA:</span>
              <span>${data.amount.toFixed(2)}</span>
            </div>

            {/* Dotted Separator */}
            <div className="text-center text-gray-600 mb-3 tracking-wide">
              ...................................................................
            </div>

            {/* Footer */}
            <div className="text-center text-xs space-y-1">
              <div className="font-semibold">Sistema POS</div>
              <div className="text-orange-600 font-bold">¡Buenas ventas!</div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="px-6 py-4 border-t border-slate-700 bg-slate-800 flex items-center gap-3 justify-center">
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition shadow-lg hover:shadow-xl"
          >
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
                d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
              />
            </svg>
            Imprimir
          </button>
          <button
            onClick={onConfirm}
            className="flex items-center gap-2 px-6 py-2.5 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg transition shadow-lg hover:shadow-xl"
          >
            Confirmar Apertura
          </button>
        </div>
      </div>
    </div>
  );
}

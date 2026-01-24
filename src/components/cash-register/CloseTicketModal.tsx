"use client";

import React from "react";
import { useLanguage } from "@/lib/context/LanguageContext";

const CLOSE_TICKET_COPY = {
  es: {
    title: "Ticket de Cierre",
    summary: "Resumen de caja",
    cashier: "CAJERO:",
    session: "SESIÓN:",
    opening: "APERTURA:",
    closing: "CIERRE:",
    initialBalance: "Inicial:",
    sales: "Ventas:",
    withdrawals: "Retiros:",
    creditNotes: "Notas de crédito:",
    expected: "Esperado:",
    counted: "Contado:",
    noDifference: "Sin diferencias",
    shortage: "Faltante",
    surplus: "Excedente",
    movements: "Movimientos",
    date: "Fecha/Hora",
    type: "Tipo",
    description: "Descripción",
    amount: "Monto",
    noMovements: "Sin movimientos registrados",
    print: "Imprimir",
    close: "Cerrar",
  },
  en: {
    title: "Close Ticket",
    summary: "Cash Summary",
    cashier: "CASHIER:",
    session: "SESSION:",
    opening: "OPENING:",
    closing: "CLOSING:",
    initialBalance: "Opening:",
    sales: "Sales:",
    withdrawals: "Withdrawals:",
    creditNotes: "Credit Notes:",
    expected: "Expected:",
    counted: "Counted:",
    noDifference: "No difference",
    shortage: "Shortage",
    surplus: "Surplus",
    movements: "Movements",
    date: "Date/Time",
    type: "Type",
    description: "Description",
    amount: "Amount",
    noMovements: "No movements recorded",
    print: "Print",
    close: "Close",
  },
  pt: {
    title: "Comprovante de Fechamento",
    summary: "Resumo do Caixa",
    cashier: "CAIXA:",
    session: "SESSÃO:",
    opening: "ABERTURA:",
    closing: "FECHAMENTO:",
    initialBalance: "Inicial:",
    sales: "Vendas:",
    withdrawals: "Saques:",
    creditNotes: "Notas de Crédito:",
    expected: "Esperado:",
    counted: "Contado:",
    noDifference: "Sem diferença",
    shortage: "Falta",
    surplus: "Excedente",
    movements: "Movimentos",
    date: "Data/Hora",
    type: "Tipo",
    description: "Descrição",
    amount: "Valor",
    noMovements: "Sem movimentos registrados",
    print: "Imprimir",
    close: "Fechar",
  },
};

export type CloseTicketData = {
  businessName: string;
  cashierName: string;
  sessionId: string;
  openedAt: string;
  closedAt: string;
  openingBalance: number;
  salesTotal: number;
  withdrawalsTotal: number;
  creditNotesTotal: number;
  expected: number;
  countedAmount: number;
  difference: number;
  movements: Array<{
    _id?: string;
    type: string;
    description: string;
    amount: number;
    createdAt: string;
  }>;
};

export default function CloseTicketModal({
  open,
  onClose,
  data,
}: {
  open: boolean;
  onClose: () => void;
  data: CloseTicketData | null;
}) {
  const { currentLanguage } = useLanguage();
  const copy =
    CLOSE_TICKET_COPY[currentLanguage as keyof typeof CLOSE_TICKET_COPY] ||
    CLOSE_TICKET_COPY.en;

  if (!open || !data) return null;

  const handlePrint = () => {
    window.print();
  };

  const formatAmount = (value: number) =>
    new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
      minimumFractionDigits: 2,
    }).format(value || 0);

  const differenceLabel =
    data.difference === 0
      ? copy.noDifference
      : data.difference > 0
        ? copy.surplus
        : copy.shortage;
  const differenceColor =
    data.difference === 0
      ? "text-slate-100"
      : data.difference > 0
        ? "text-green-400"
        : "text-red-400";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="relative w-full max-w-3xl mx-auto bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800">
          <h2 className="text-slate-900 dark:text-white text-xl font-bold">
            {copy.title}
          </h2>
          <button
            onClick={onClose}
            className="text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-white text-2xl transition"
          >
            ✕
          </button>
        </div>

        {/* Ticket Content */}
        <div className="px-6 py-6 space-y-4">
          <div className="bg-slate-100 rounded-sm border-2 border-gray-900 p-4 font-mono text-sm text-gray-900">
            {/* Business + meta */}
            <div className="text-center font-bold text-base mb-1">
              {data.businessName || "MI NEGOCIO"}
            </div>
            <div className="text-center text-gray-700 text-xs mb-4">
              {copy.summary}
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs mb-3">
              <div className="flex justify-between">
                <span>{copy.cashier}</span>
                <span>{data.cashierName || "-"}</span>
              </div>
              <div className="flex justify-between">
                <span>{copy.session}</span>
                <span>{data.sessionId || "-"}</span>
              </div>
              <div className="flex justify-between">
                <span>{copy.opening}</span>
                <span>{data.openedAt || "-"}</span>
              </div>
              <div className="flex justify-between">
                <span>{copy.closing}</span>
                <span>{data.closedAt || "-"}</span>
              </div>
            </div>

            <div className="border border-gray-900" />

            {/* Totals */}
            <div className="grid grid-cols-2 gap-3 py-3 text-xs">
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span>{copy.initialBalance}</span>
                  <span>{formatAmount(data.openingBalance)}</span>
                </div>
                <div className="flex justify-between">
                  <span>{copy.sales}</span>
                  <span>{formatAmount(data.salesTotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span>{copy.withdrawals}</span>
                  <span>-{formatAmount(data.withdrawalsTotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span>{copy.creditNotes}</span>
                  <span>-{formatAmount(data.creditNotesTotal)}</span>
                </div>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between font-semibold">
                  <span>{copy.expected}</span>
                  <span>{formatAmount(data.expected)}</span>
                </div>
                <div className="flex justify-between font-semibold">
                  <span>{copy.counted}</span>
                  <span>{formatAmount(data.countedAmount)}</span>
                </div>
                <div className="flex justify-between font-bold text-sm">
                  <span>{differenceLabel}:</span>
                  <span className={differenceColor}>
                    {formatAmount(data.difference)}
                  </span>
                </div>
              </div>
            </div>

            <div className="border-t border-gray-900 pt-2">
              <div className="text-center font-semibold mb-2">
                {copy.movements}
              </div>
              <div className="max-h-52 overflow-y-auto border border-gray-900">
                {data.movements && data.movements.length ? (
                  <table className="w-full text-[11px]">
                    <thead>
                      <tr className="bg-gray-200 text-gray-900">
                        <th className="text-left px-2 py-1">{copy.date}</th>
                        <th className="text-left px-2 py-1">{copy.type}</th>
                        <th className="text-left px-2 py-1">
                          {copy.description}
                        </th>
                        <th className="text-right px-2 py-1">{copy.amount}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.movements.map((m) => (
                        <tr
                          key={m._id || `${m.type}-${m.createdAt}-${m.amount}`}
                        >
                          <td className="px-2 py-1 align-top">{m.createdAt}</td>
                          <td className="px-2 py-1 align-top capitalize">
                            {m.type}
                          </td>
                          <td className="px-2 py-1 align-top">
                            {m.description}
                          </td>
                          <td className="px-2 py-1 align-top text-right">
                            {m.type === "retiro" || m.type === "nota_credito"
                              ? `-${formatAmount(m.amount)}`
                              : formatAmount(m.amount)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div className="p-3 text-center text-xs text-gray-700">
                    {copy.noMovements}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 flex items-center gap-3 justify-center">
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
            {copy.print}
          </button>
          <button
            onClick={onClose}
            className="flex items-center gap-2 px-6 py-2.5 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg transition shadow-lg hover:shadow-xl"
          >
            {copy.close}
          </button>
        </div>
      </div>
    </div>
  );
}

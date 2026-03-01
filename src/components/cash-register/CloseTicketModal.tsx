"use client";

import React, { useEffect, useState } from "react";
import { useLanguage } from "@/lib/context/LanguageContext";
import { printReceipt } from "@/lib/utils/printReceipt";
import { apiFetch } from "@/lib/utils/apiFetch";
import type { CashClosingReport as CashClosingReportType } from "@/types/cashClosing";
import { PAYMENT_METHOD_LABELS } from "@/types/cashClosing";

const CLOSE_TICKET_COPY = {
  es: {
    title: "Ticket de Cierre",
    summary: "Resumen de caja",
    businessFallback: "Mi Negocio",
    cashier: "CAJERO:",
    session: "SESIÓN:",
    opening: "APERTURA:",
    closing: "CIERRE:",
    initialBalance: "Inicial:",
    sales: "Ventas:",
    withdrawals: "Retiros:",
    creditNotes: "Notas de crédito:",
    deposits: "Ingresos:",
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
    exportPDF: "Exportar PDF",
    close: "Cerrar",
    // Channel labels
    channelReport: "REPORTE POR CANAL",
    channelFiscal: "CANAL 1 – FISCAL (LEGAL)",
    channelInternal: "CANAL 2 – INTERNO (NO FISCAL)",
    generalTotal: "TOTAL GENERAL",
    fiscalSales: "Ventas fiscales:",
    invoiceCount: "Comprobantes:",
    invoicesByType: "Por tipo:",
    paymentMethods: "Medios de pago:",
    creditNotesLabel: "Notas de Crédito:",
    cnCount: "Cantidad NC:",
    cnTotal: "Total NC:",
    refundsByMethod: "Devoluciones por medio:",
    netFiscalResult: "RESULTADO NETO FISCAL:",
    internalSales: "Ventas internas:",
    ticketCount: "Tickets internos:",
    netInternalResult: "RESULTADO NETO INTERNO:",
    netFiscal: "Neto fiscal:",
    netInternal: "Neto interno:",
    overallResult: "RESULTADO DEL PERÍODO:",
    cashReconciliation: "ARQUEO DE CAJA",
    expectedCash: "Efectivo esperado (sistema):",
    openingBal: "Saldo inicial:",
    fiscalCash: "Efectivo fiscal:",
    internalCash: "Efectivo interno:",
    cashIn: "Ingresos manuales:",
    cashOut: "Retiros/Cambio:",
    totalExpected: "Total esperado:",
    countedCash: "Contado (real):",
    difference: "Diferencia:",
    count: "cant.",
  },
  en: {
    title: "Close Ticket",
    summary: "Cash Summary",
    businessFallback: "My Business",
    cashier: "CASHIER:",
    session: "SESSION:",
    opening: "OPENING:",
    closing: "CLOSING:",
    initialBalance: "Opening:",
    sales: "Sales:",
    withdrawals: "Withdrawals:",
    creditNotes: "Credit Notes:",
    deposits: "Cash In:",
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
    exportPDF: "Export PDF",
    close: "Close",
    channelReport: "REPORT BY CHANNEL",
    channelFiscal: "CHANNEL 1 – FISCAL (LEGAL)",
    channelInternal: "CHANNEL 2 – INTERNAL (NON-FISCAL)",
    generalTotal: "GENERAL TOTAL",
    fiscalSales: "Fiscal sales:",
    invoiceCount: "Invoices:",
    invoicesByType: "By type:",
    paymentMethods: "Payment methods:",
    creditNotesLabel: "Credit Notes:",
    cnCount: "CN count:",
    cnTotal: "CN total:",
    refundsByMethod: "Refunds by method:",
    netFiscalResult: "NET FISCAL RESULT:",
    internalSales: "Internal sales:",
    ticketCount: "Internal tickets:",
    netInternalResult: "NET INTERNAL RESULT:",
    netFiscal: "Net fiscal:",
    netInternal: "Net internal:",
    overallResult: "PERIOD RESULT:",
    cashReconciliation: "CASH RECONCILIATION",
    expectedCash: "Expected cash (system):",
    openingBal: "Opening balance:",
    fiscalCash: "Fiscal cash:",
    internalCash: "Internal cash:",
    cashIn: "Manual cash-in:",
    cashOut: "Withdrawals/Change:",
    totalExpected: "Total expected:",
    countedCash: "Counted (real):",
    difference: "Difference:",
    count: "qty.",
  },
  pt: {
    title: "Comprovante de Fechamento",
    summary: "Resumo do Caixa",
    businessFallback: "Meu Negócio",
    cashier: "CAIXA:",
    session: "SESSÃO:",
    opening: "ABERTURA:",
    closing: "FECHAMENTO:",
    initialBalance: "Inicial:",
    sales: "Vendas:",
    withdrawals: "Saques:",
    creditNotes: "Notas de Crédito:",
    deposits: "Entradas:",
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
    exportPDF: "Exportar PDF",
    close: "Fechar",
    channelReport: "RELATÓRIO POR CANAL",
    channelFiscal: "CANAL 1 – FISCAL (LEGAL)",
    channelInternal: "CANAL 2 – INTERNO (NÃO FISCAL)",
    generalTotal: "TOTAL GERAL",
    fiscalSales: "Vendas fiscais:",
    invoiceCount: "Comprovantes:",
    invoicesByType: "Por tipo:",
    paymentMethods: "Meios de pagamento:",
    creditNotesLabel: "Notas de Crédito:",
    cnCount: "Qtd. NC:",
    cnTotal: "Total NC:",
    refundsByMethod: "Devoluções por meio:",
    netFiscalResult: "RESULTADO LÍQUIDO FISCAL:",
    internalSales: "Vendas internas:",
    ticketCount: "Tickets internos:",
    netInternalResult: "RESULTADO LÍQUIDO INTERNO:",
    netFiscal: "Líquido fiscal:",
    netInternal: "Líquido interno:",
    overallResult: "RESULTADO DO PERÍODO:",
    cashReconciliation: "CONFERÊNCIA DE CAIXA",
    expectedCash: "Dinheiro esperado (sistema):",
    openingBal: "Saldo inicial:",
    fiscalCash: "Dinheiro fiscal:",
    internalCash: "Dinheiro interno:",
    cashIn: "Entradas manuais:",
    cashOut: "Saques/Troco:",
    totalExpected: "Total esperado:",
    countedCash: "Contado (real):",
    difference: "Diferença:",
    count: "qtd.",
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
  depositsTotal: number;
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
  const { currentLanguage, t } = useLanguage();
  const copy =
    CLOSE_TICKET_COPY[currentLanguage as keyof typeof CLOSE_TICKET_COPY] ||
    CLOSE_TICKET_COPY.en;
  const pmLabels =
    PAYMENT_METHOD_LABELS[currentLanguage] || PAYMENT_METHOD_LABELS.es;

  const [channelReport, setChannelReport] =
    useState<CashClosingReportType | null>(null);

  // Fetch channel report data when modal opens
  useEffect(() => {
    if (!open || !data?.sessionId) return;
    const fetchReport = async () => {
      try {
        const res = await apiFetch(
          `/api/cash-closing?sessionId=${data.sessionId}`,
        );
        const json = await res.json();
        if (json.success && json.data) {
          setChannelReport(json.data);
        }
      } catch (err) {
        console.error("Failed to fetch channel report:", err);
      }
    };
    fetchReport();
  }, [open, data?.sessionId]);

  // Early return with safety checks
  if (!open) return null;
  if (!data) {
    console.warn("CloseTicketModal opened without data");
    return null;
  }

  const handlePrint = () => {
    printReceipt();
  };

  const handleExportPDF = () => {
    // Use browser print dialog in PDF mode
    printReceipt();
  };

  const locale = t("__locale__", "common") || "es-AR";
  const formatAmount = (value: number) =>
    new Intl.NumberFormat(String(locale), {
      style: "currency",
      currency: "ARS",
      minimumFractionDigits: 2,
    }).format(value || 0);

  const getPmLabel = (method: string) => pmLabels[method] || method;

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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 receipt-overlay">
      <div className="relative w-full max-w-3xl mx-auto bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 shadow-2xl overflow-hidden flex flex-col max-h-[90vh] receipt-modal">
        {/* Header */}
        <div className="flex-shrink-0 flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 no-print">
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
        <div className="px-6 py-6 space-y-4 overflow-y-auto flex-1 receipt-container">
          <div className="bg-slate-100 rounded-sm border-2 border-gray-900 p-4 font-mono text-sm text-gray-900">
            {/* Business + meta */}
            <div className="text-center font-bold text-base mb-1">
              {data.businessName || copy.businessFallback}
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

            {/* ══════ CHANNEL REPORT ══════ */}
            {channelReport && (
              <>
                <div className="text-center font-bold text-xs mt-3 mb-2 underline">
                  {copy.channelReport}
                </div>

                {/* ── CHANNEL 1: FISCAL ── */}
                <div className="border border-gray-700 p-2 mb-2">
                  <div className="font-bold text-[11px] mb-1 text-center bg-gray-200 -mx-2 -mt-2 px-2 py-1">
                    {copy.channelFiscal}
                  </div>
                  <div className="space-y-0.5 text-[11px]">
                    <div className="flex justify-between">
                      <span>{copy.fiscalSales}</span>
                      <span className="font-medium">
                        {formatAmount(channelReport.fiscal.totalSales)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>{copy.invoiceCount}</span>
                      <span>{channelReport.fiscal.salesCount}</span>
                    </div>
                    {channelReport.fiscal.invoicesByType.length > 0 && (
                      <div className="ml-2 border-l border-gray-400 pl-1">
                        <span className="text-[10px] text-gray-600">
                          {copy.invoicesByType}
                        </span>
                        {channelReport.fiscal.invoicesByType.map((inv) => (
                          <div
                            key={inv.type}
                            className="flex justify-between text-[10px]"
                          >
                            <span>
                              {inv.label} ({inv.count})
                            </span>
                            <span>{formatAmount(inv.total)}</span>
                          </div>
                        ))}
                      </div>
                    )}
                    {channelReport.fiscal.byPaymentMethod.length > 0 && (
                      <div className="ml-2 border-l border-gray-400 pl-1 mt-1">
                        <span className="text-[10px] text-gray-600">
                          {copy.paymentMethods}
                        </span>
                        {channelReport.fiscal.byPaymentMethod.map((pm) => (
                          <div
                            key={pm.method}
                            className="flex justify-between text-[10px]"
                          >
                            <span>
                              {getPmLabel(pm.method)} ({pm.count})
                            </span>
                            <span>{formatAmount(pm.total)}</span>
                          </div>
                        ))}
                      </div>
                    )}
                    {channelReport.fiscal.creditNotes.count > 0 && (
                      <>
                        <div className="border-t border-gray-400 mt-1 pt-1">
                          <span className="font-semibold text-[10px]">
                            {copy.creditNotesLabel}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>{copy.cnCount}</span>
                          <span>{channelReport.fiscal.creditNotes.count}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>{copy.cnTotal}</span>
                          <span className="font-medium text-red-700">
                            -
                            {formatAmount(
                              channelReport.fiscal.creditNotes.totalAmount,
                            )}
                          </span>
                        </div>
                        {channelReport.fiscal.refundsByPaymentMethod.length >
                          0 && (
                          <div className="ml-2 border-l border-gray-400 pl-1">
                            <span className="text-[10px] text-gray-600">
                              {copy.refundsByMethod}
                            </span>
                            {channelReport.fiscal.refundsByPaymentMethod.map(
                              (pm) => (
                                <div
                                  key={pm.method}
                                  className="flex justify-between text-[10px]"
                                >
                                  <span>{getPmLabel(pm.method)}</span>
                                  <span>-{formatAmount(pm.total)}</span>
                                </div>
                              ),
                            )}
                          </div>
                        )}
                      </>
                    )}
                    <div className="border-t border-gray-900 mt-1 pt-1 flex justify-between font-bold">
                      <span>{copy.netFiscalResult}</span>
                      <span>
                        {formatAmount(channelReport.fiscal.netResult)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* ── CHANNEL 2: INTERNAL ── */}
                <div className="border border-gray-700 p-2 mb-2">
                  <div className="font-bold text-[11px] mb-1 text-center bg-gray-200 -mx-2 -mt-2 px-2 py-1">
                    {copy.channelInternal}
                  </div>
                  <div className="space-y-0.5 text-[11px]">
                    <div className="flex justify-between">
                      <span>{copy.internalSales}</span>
                      <span className="font-medium">
                        {formatAmount(channelReport.internal.totalSales)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>{copy.ticketCount}</span>
                      <span>{channelReport.internal.salesCount}</span>
                    </div>
                    {channelReport.internal.byPaymentMethod.length > 0 && (
                      <div className="ml-2 border-l border-gray-400 pl-1">
                        <span className="text-[10px] text-gray-600">
                          {copy.paymentMethods}
                        </span>
                        {channelReport.internal.byPaymentMethod.map((pm) => (
                          <div
                            key={pm.method}
                            className="flex justify-between text-[10px]"
                          >
                            <span>
                              {getPmLabel(pm.method)} ({pm.count})
                            </span>
                            <span>{formatAmount(pm.total)}</span>
                          </div>
                        ))}
                      </div>
                    )}
                    <div className="border-t border-gray-900 mt-1 pt-1 flex justify-between font-bold">
                      <span>{copy.netInternalResult}</span>
                      <span>
                        {formatAmount(channelReport.internal.netResult)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* ── GENERAL TOTAL ── */}
                <div className="border-2 border-gray-900 p-2 mb-2">
                  <div className="font-bold text-[11px] mb-1 text-center">
                    {copy.generalTotal}
                  </div>
                  <div className="space-y-0.5 text-[11px]">
                    <div className="flex justify-between">
                      <span>{copy.netFiscal}</span>
                      <span>
                        {formatAmount(
                          channelReport.generalTotal.netFiscalResult,
                        )}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>{copy.netInternal}</span>
                      <span>
                        {formatAmount(
                          channelReport.generalTotal.netInternalResult,
                        )}
                      </span>
                    </div>
                    <div className="border-t border-gray-900 mt-1 pt-1 flex justify-between font-bold text-sm">
                      <span>{copy.overallResult}</span>
                      <span>
                        {formatAmount(channelReport.generalTotal.overallResult)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* ── CASH RECONCILIATION ── */}
                <div className="border border-gray-700 p-2 mb-2">
                  <div className="font-bold text-[11px] mb-1 text-center bg-gray-200 -mx-2 -mt-2 px-2 py-1">
                    {copy.cashReconciliation}
                  </div>
                  <div className="space-y-0.5 text-[11px]">
                    <div className="flex justify-between">
                      <span>{copy.openingBal}</span>
                      <span>
                        {formatAmount(
                          channelReport.reconciliation.expectedCash
                            .openingBalance,
                        )}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>{copy.fiscalCash}</span>
                      <span>
                        {formatAmount(
                          channelReport.reconciliation.expectedCash.fiscal,
                        )}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>{copy.internalCash}</span>
                      <span>
                        {formatAmount(
                          channelReport.reconciliation.expectedCash.internal,
                        )}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>{copy.cashIn}</span>
                      <span>
                        {formatAmount(
                          channelReport.reconciliation.expectedCash.cashIn,
                        )}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>{copy.cashOut}</span>
                      <span>
                        -
                        {formatAmount(
                          channelReport.reconciliation.expectedCash.cashOut,
                        )}
                      </span>
                    </div>
                    <div className="border-t border-gray-900 mt-1 pt-1 flex justify-between font-bold">
                      <span>{copy.totalExpected}</span>
                      <span>
                        {formatAmount(
                          channelReport.reconciliation.expectedCash.total,
                        )}
                      </span>
                    </div>
                    <div className="flex justify-between font-bold">
                      <span>{copy.countedCash}</span>
                      <span>
                        {channelReport.reconciliation.countedCash !== null
                          ? formatAmount(
                              channelReport.reconciliation.countedCash,
                            )
                          : "-"}
                      </span>
                    </div>
                    {channelReport.reconciliation.difference !== null && (
                      <div
                        className={`flex justify-between font-bold ${
                          channelReport.reconciliation.difference === 0
                            ? ""
                            : channelReport.reconciliation.difference > 0
                              ? "text-green-700"
                              : "text-red-700"
                        }`}
                      >
                        <span>{copy.difference}</span>
                        <span>
                          {formatAmount(
                            channelReport.reconciliation.difference,
                          )}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="border border-gray-900" />
              </>
            )}

            {/* ══════ LEGACY TOTALS (always shown as fallback) ══════ */}
            {!channelReport && (
              <>
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
                    <div className="flex justify-between">
                      <span>{copy.deposits}</span>
                      <span>{formatAmount(data.depositsTotal)}</span>
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
              </>
            )}

            <div className="border-t border-gray-900 pt-2">
              <div className="text-center font-semibold mb-2">
                {copy.movements}
              </div>
              <div className="max-h-52 overflow-y-auto border border-gray-900">
                {Array.isArray(data.movements) && data.movements.length > 0 ? (
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
                      {data.movements.map((m, index) => (
                        <tr
                           key={
                            m._id || `movement-${index}-${m.type}-${m.amount}`
                          }
                        >
                          <td className="px-2 py-1 align-top">
                            {m.createdAt || "-"}
                          </td>
                          <td className="px-2 py-1 align-top capitalize">
                            {m.type || "-"}
                          </td>
                          <td className="px-2 py-1 align-top">
                            {m.description || "-"}
                          </td>
                          <td className="px-2 py-1 align-top text-right">
                            {m.type === "retiro" || m.type === "nota_credito"
                              ? `-${formatAmount(m.amount || 0)}`
                              : formatAmount(m.amount || 0)}
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
        <div className="flex-shrink-0 px-6 py-4 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 flex items-center gap-3 justify-center no-print">
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
            onClick={handleExportPDF}
            className="flex items-center gap-2 px-6 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-lg transition shadow-lg hover:shadow-xl"
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
                d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            {copy.exportPDF}
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

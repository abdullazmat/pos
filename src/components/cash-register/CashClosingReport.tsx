"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  FileText,
  Building2,
  ShoppingBag,
  CreditCard,
  Banknote,
  ArrowDownCircle,
  ArrowUpCircle,
  TrendingUp,
  Printer,
  Download,
  RefreshCw,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { apiFetch } from "@/lib/utils/apiFetch";
import { printReceipt } from "@/lib/utils/printReceipt";
import type {
  CashClosingReport as CashClosingReportType,
  PaymentMethodBreakdown,
  InvoiceTypeBreakdown,
} from "@/types/cashClosing";
import { PAYMENT_METHOD_LABELS } from "@/types/cashClosing";

// ─── i18n Copy ───────────────────────────────────────────────────
const COPY = {
  es: {
    title: "Cierre de Caja",
    subtitle: "Reporte por Canal",
    loading: "Cargando reporte...",
    error: "Error al cargar el reporte",
    retry: "Reintentar",
    noSession: "No hay sesión de caja activa",
    // Session info
    session: "Sesión",
    cashier: "Cajero",
    opening: "Apertura",
    closing: "Cierre",
    activeSession: "Sesión activa",
    // Channel labels
    channelFiscal: "Canal 1 – Fiscal (Legal)",
    channelFiscalDesc: "Comprobantes con CAE – Afectan Libro IVA",
    channelInternal: "Canal 2 – Interno (No Fiscal)",
    channelInternalDesc: "Tickets internos – Sin CAE, sin Libro IVA",
    generalTotal: "Total General",
    generalTotalDesc: "Resultado del período = Fiscal + Interno",
    // Fiscal
    totalFiscalSales: "Total ventas fiscales",
    invoiceCount: "Comprobantes",
    invoicesByType: "Comprobantes por tipo",
    paymentMethods: "Medios de pago",
    creditNotes: "Notas de Crédito",
    creditNotesCount: "Cantidad",
    creditNotesTotal: "Total NC",
    refundsByMethod: "Devoluciones por medio de pago",
    netFiscalResult: "Resultado neto fiscal",
    // Internal
    totalInternalSales: "Total ventas internas",
    ticketCount: "Tickets internos",
    netInternalResult: "Resultado neto interno",
    // General
    netFiscal: "Resultado fiscal neto",
    netInternal: "Resultado interno neto",
    overallResult: "Resultado general del período",
    totalSales: "Total de ventas",
    // Reconciliation
    cashReconciliation: "Arqueo de Caja",
    cashReconciliationDesc: "Conciliación de efectivo real",
    expectedCash: "Efectivo esperado (sistema)",
    openingBalance: "Saldo inicial",
    fiscalCash: "Efectivo fiscal (ventas - NC)",
    internalCash: "Efectivo interno",
    manualCashIn: "Ingresos manuales",
    manualCashOut: "Retiros / Cambio",
    totalExpected: "Total esperado",
    countedCash: "Efectivo contado (real)",
    difference: "Diferencia",
    noDifference: "Sin diferencia",
    shortage: "Faltante",
    surplus: "Sobrante",
    pendingCount: "Pendiente de ingreso",
    // Actions
    print: "Imprimir",
    exportPDF: "Exportar PDF",
    noData: "Sin datos",
    count: "cant.",
  },
  en: {
    title: "Cash Closing",
    subtitle: "Report by Channel",
    loading: "Loading report...",
    error: "Error loading report",
    retry: "Retry",
    noSession: "No active cash register session",
    session: "Session",
    cashier: "Cashier",
    opening: "Opening",
    closing: "Closing",
    activeSession: "Active session",
    channelFiscal: "Channel 1 – Fiscal (Legal)",
    channelFiscalDesc: "Receipts with CAE – Affect VAT Book",
    channelInternal: "Channel 2 – Internal (Non-Fiscal)",
    channelInternalDesc: "Internal tickets – No CAE, no VAT book",
    generalTotal: "General Total",
    generalTotalDesc: "Period result = Fiscal + Internal",
    totalFiscalSales: "Total fiscal sales",
    invoiceCount: "Invoices",
    invoicesByType: "Invoices by type",
    paymentMethods: "Payment methods",
    creditNotes: "Credit Notes",
    creditNotesCount: "Count",
    creditNotesTotal: "CN Total",
    refundsByMethod: "Refunds by payment method",
    netFiscalResult: "Net fiscal result",
    totalInternalSales: "Total internal sales",
    ticketCount: "Internal tickets",
    netInternalResult: "Net internal result",
    netFiscal: "Net fiscal result",
    netInternal: "Net internal result",
    overallResult: "Overall period result",
    totalSales: "Total sales",
    cashReconciliation: "Cash Reconciliation",
    cashReconciliationDesc: "Real cash reconciliation",
    expectedCash: "Expected cash (system)",
    openingBalance: "Opening balance",
    fiscalCash: "Fiscal cash (sales - CN)",
    internalCash: "Internal cash",
    manualCashIn: "Manual cash-in",
    manualCashOut: "Withdrawals / Change",
    totalExpected: "Total expected",
    countedCash: "Counted cash (real)",
    difference: "Difference",
    noDifference: "No difference",
    shortage: "Shortage",
    surplus: "Surplus",
    pendingCount: "Pending entry",
    print: "Print",
    exportPDF: "Export PDF",
    noData: "No data",
    count: "qty.",
  },
  pt: {
    title: "Fechamento de Caixa",
    subtitle: "Relatório por Canal",
    loading: "Carregando relatório...",
    error: "Erro ao carregar relatório",
    retry: "Tentar novamente",
    noSession: "Sem sessão de caixa ativa",
    session: "Sessão",
    cashier: "Caixa",
    opening: "Abertura",
    closing: "Fechamento",
    activeSession: "Sessão ativa",
    channelFiscal: "Canal 1 – Fiscal (Legal)",
    channelFiscalDesc: "Comprovantes com CAE – Afetam Livro IVA",
    channelInternal: "Canal 2 – Interno (Não Fiscal)",
    channelInternalDesc: "Tickets internos – Sem CAE, sem Livro IVA",
    generalTotal: "Total Geral",
    generalTotalDesc: "Resultado do período = Fiscal + Interno",
    totalFiscalSales: "Total vendas fiscais",
    invoiceCount: "Comprovantes",
    invoicesByType: "Comprovantes por tipo",
    paymentMethods: "Meios de pagamento",
    creditNotes: "Notas de Crédito",
    creditNotesCount: "Quantidade",
    creditNotesTotal: "Total NC",
    refundsByMethod: "Devoluções por meio de pagamento",
    netFiscalResult: "Resultado líquido fiscal",
    totalInternalSales: "Total vendas internas",
    ticketCount: "Tickets internos",
    netInternalResult: "Resultado líquido interno",
    netFiscal: "Resultado fiscal líquido",
    netInternal: "Resultado interno líquido",
    overallResult: "Resultado geral do período",
    totalSales: "Total de vendas",
    cashReconciliation: "Conferência de Caixa",
    cashReconciliationDesc: "Conciliação de dinheiro real",
    expectedCash: "Dinheiro esperado (sistema)",
    openingBalance: "Saldo inicial",
    fiscalCash: "Dinheiro fiscal (vendas - NC)",
    internalCash: "Dinheiro interno",
    manualCashIn: "Entradas manuais",
    manualCashOut: "Saques / Troco",
    totalExpected: "Total esperado",
    countedCash: "Dinheiro contado (real)",
    difference: "Diferença",
    noDifference: "Sem diferença",
    shortage: "Falta",
    surplus: "Excedente",
    pendingCount: "Pendente de entrada",
    print: "Imprimir",
    exportPDF: "Exportar PDF",
    noData: "Sem dados",
    count: "qtd.",
  },
};

type LangKey = keyof typeof COPY;

// ─── Props ───────────────────────────────────────────────────────
interface CashClosingReportProps {
  sessionId?: string;
  language?: string;
  /** If provided, the report uses this data instead of fetching */
  reportData?: CashClosingReportType | null;
  /** Called when PDF export is triggered */
  onExportPDF?: () => void;
  /** Compact mode for embedding in modals */
  compact?: boolean;
}

export default function CashClosingReport({
  sessionId,
  language = "es",
  reportData: externalData,
  onExportPDF,
  compact = false,
}: CashClosingReportProps) {
  const lang = (COPY[language as LangKey] ? language : "es") as LangKey;
  const copy = COPY[lang];
  const pmLabels = PAYMENT_METHOD_LABELS[lang] || PAYMENT_METHOD_LABELS.es;

  const [report, setReport] = useState<CashClosingReportType | null>(
    externalData || null,
  );
  const [loading, setLoading] = useState(!externalData);
  const [error, setError] = useState<string | null>(null);
  const [expandedSections, setExpandedSections] = useState<
    Record<string, boolean>
  >({
    fiscal: true,
    internal: true,
    general: true,
    reconciliation: true,
  });

  const reportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (externalData) {
      setReport(externalData);
      setLoading(false);
      return;
    }
    fetchReport();
  }, [sessionId, externalData]);

  const fetchReport = async () => {
    setLoading(true);
    setError(null);
    try {
      const url = sessionId
        ? `/api/cash-closing?sessionId=${sessionId}`
        : "/api/cash-closing";
      const res = await apiFetch(url);
      const json = await res.json();
      if (json.success && json.data) {
        setReport(json.data);
      } else {
        setError(json.error || copy.error);
      }
    } catch (err) {
      console.error("Error fetching cash closing report:", err);
      setError(copy.error);
    } finally {
      setLoading(false);
    }
  };

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const formatAmount = (value: number) =>
    new Intl.NumberFormat(
      lang === "pt" ? "pt-BR" : lang === "en" ? "en-US" : "es-AR",
      {
        style: "currency",
        currency: "ARS",
        minimumFractionDigits: 2,
      },
    ).format(value || 0);

  const formatDate = (iso: string | null) => {
    if (!iso) return "-";
    return new Date(iso).toLocaleString(
      lang === "pt" ? "pt-BR" : lang === "en" ? "en-US" : "es-AR",
      {
        dateStyle: "short",
        timeStyle: "short",
      },
    );
  };

  const getPmLabel = (method: string) => pmLabels[method] || method;

  const handlePrint = () => {
    printReceipt();
  };

  const handleExportPDF = () => {
    if (onExportPDF) {
      onExportPDF();
    } else {
      // Fallback: trigger browser print as PDF
      handlePrint();
    }
  };

  // ─── Loading / Error states ────────────────────────────────────
  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <RefreshCw className="w-6 h-6 animate-spin text-blue-500 mr-2" />
        <span className="text-slate-600 dark:text-slate-400">
          {copy.loading}
        </span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-8 gap-4">
        <p className="text-red-500">{error}</p>
        <button
          onClick={fetchReport}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          {copy.retry}
        </button>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="text-center p-8 text-slate-500 dark:text-slate-400">
        {copy.noSession}
      </div>
    );
  }

  const { fiscal, internal, generalTotal, reconciliation } = report;

  // ─── Section Header Component ──────────────────────────────────
  const SectionHeader = ({
    id,
    icon: Icon,
    title,
    subtitle,
    color,
    value,
  }: {
    id: string;
    icon: any;
    title: string;
    subtitle: string;
    color: string;
    value?: string | number;
  }) => (
    <button
      onClick={() => toggleSection(id)}
      className={`w-full flex items-center justify-between p-4 rounded-t-lg ${color} transition-colors`}
    >
      <div className="flex items-center gap-3">
        <Icon className="w-5 h-5" />
        <div className="text-left">
          <h3 className="font-bold text-sm">{title}</h3>
          <p className="text-xs opacity-80">{subtitle}</p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        {value !== undefined && (
          <span className="font-bold text-lg">
            {typeof value === "number" ? formatAmount(value) : value}
          </span>
        )}
        {expandedSections[id] ? (
          <ChevronUp className="w-4 h-4" />
        ) : (
          <ChevronDown className="w-4 h-4" />
        )}
      </div>
    </button>
  );

  // ─── Row helper ────────────────────────────────────────────────
  const Row = ({
    label,
    value,
    bold,
    negative,
    highlight,
    sub,
  }: {
    label: string;
    value: number;
    bold?: boolean;
    negative?: boolean;
    highlight?: string;
    sub?: string;
  }) => (
    <div
      className={`flex justify-between items-center py-1.5 px-1 ${
        bold ? "font-bold" : ""
      } ${highlight || ""}`}
    >
      <span className="text-sm text-slate-700 dark:text-slate-300">
        {label}
        {sub && (
          <span className="text-xs text-slate-500 dark:text-slate-400 ml-1">
            ({sub})
          </span>
        )}
      </span>
      <span
        className={`text-sm tabular-nums ${
          negative
            ? "text-red-600 dark:text-red-400"
            : bold
              ? "text-slate-900 dark:text-white"
              : "text-slate-700 dark:text-slate-300"
        }`}
      >
        {negative && value > 0 ? "-" : ""}
        {formatAmount(Math.abs(value))}
      </span>
    </div>
  );

  // ─── Payment method table ──────────────────────────────────────
  const PaymentMethodTable = ({
    data,
    showCount,
  }: {
    data: PaymentMethodBreakdown[];
    showCount?: boolean;
  }) => {
    if (!data || data.length === 0)
      return (
        <p className="text-xs text-slate-400 italic py-1">{copy.noData}</p>
      );
    return (
      <div className="space-y-1">
        {data.map((pm) => (
          <div key={pm.method} className="flex justify-between items-center">
            <span className="text-xs text-slate-600 dark:text-slate-400 flex items-center gap-1">
              <CreditCard className="w-3 h-3" />
              {getPmLabel(pm.method)}
              {showCount && (
                <span className="text-slate-400">
                  ({pm.count} {copy.count})
                </span>
              )}
            </span>
            <span className="text-xs font-medium tabular-nums text-slate-700 dark:text-slate-300">
              {formatAmount(pm.total)}
            </span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-4" ref={reportRef}>
      {/* ─── Action Buttons (no-print) ───────────────────────── */}
      {!compact && (
        <div className="flex justify-end gap-2 no-print">
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition text-sm"
          >
            <Printer className="w-4 h-4" />
            {copy.print}
          </button>
          <button
            onClick={handleExportPDF}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm"
          >
            <Download className="w-4 h-4" />
            {copy.exportPDF}
          </button>
        </div>
      )}

      {/* ─── Session Info ─────────────────────────────────────── */}
      <div className="receipt-container">
        <div className="bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Building2 className="w-5 h-5 text-blue-600" />
              {report.businessName}
            </h2>
            <span className="text-xs px-2 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 font-medium">
              {report.closedAt
                ? formatDate(report.closedAt)
                : copy.activeSession}
            </span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs text-slate-600 dark:text-slate-400">
            <div>
              <span className="font-medium">{copy.cashier}:</span>{" "}
              {report.cashierName || "-"}
            </div>
            <div>
              <span className="font-medium">{copy.session}:</span>{" "}
              <span className="font-mono text-[10px]">
                {report.sessionId.slice(-8)}
              </span>
            </div>
            <div>
              <span className="font-medium">{copy.opening}:</span>{" "}
              {formatDate(report.openedAt)}
            </div>
            <div>
              <span className="font-medium">{copy.closing}:</span>{" "}
              {formatDate(report.closedAt)}
            </div>
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════ */}
        {/* CHANNEL 1 – FISCAL (LEGAL)                            */}
        {/* ═══════════════════════════════════════════════════════ */}
        <div className="rounded-lg border border-emerald-200 dark:border-emerald-700 overflow-hidden mt-4">
          <SectionHeader
            id="fiscal"
            icon={FileText}
            title={copy.channelFiscal}
            subtitle={copy.channelFiscalDesc}
            color="bg-emerald-50 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-300"
            value={fiscal.netResult}
          />
          {expandedSections.fiscal && (
            <div className="p-4 bg-white dark:bg-slate-900 space-y-4">
              {/* Total & Count */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-lg p-3">
                  <p className="text-xs text-emerald-600 dark:text-emerald-400 mb-1">
                    {copy.totalFiscalSales}
                  </p>
                  <p className="text-xl font-bold text-emerald-700 dark:text-emerald-300">
                    {formatAmount(fiscal.totalSales)}
                  </p>
                </div>
                <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-lg p-3">
                  <p className="text-xs text-emerald-600 dark:text-emerald-400 mb-1">
                    {copy.invoiceCount}
                  </p>
                  <p className="text-xl font-bold text-emerald-700 dark:text-emerald-300">
                    {fiscal.salesCount}
                  </p>
                </div>
              </div>

              {/* Invoices by Type (A/B/C) */}
              {fiscal.invoicesByType.length > 0 && (
                <div>
                  <h4 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                    {copy.invoicesByType}
                  </h4>
                  <div className="space-y-1">
                    {fiscal.invoicesByType.map((inv: InvoiceTypeBreakdown) => (
                      <div
                        key={inv.type}
                        className="flex justify-between items-center text-xs"
                      >
                        <span className="text-slate-600 dark:text-slate-400">
                          {inv.label}{" "}
                          <span className="text-slate-400">
                            ({inv.count} {copy.count})
                          </span>
                        </span>
                        <span className="font-medium tabular-nums text-slate-700 dark:text-slate-300">
                          {formatAmount(inv.total)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Payment Methods */}
              <div>
                <h4 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                  {copy.paymentMethods}
                </h4>
                <PaymentMethodTable data={fiscal.byPaymentMethod} showCount />
              </div>

              {/* Credit Notes */}
              <div className="border-t border-slate-200 dark:border-slate-700 pt-3">
                <h4 className="text-xs font-semibold text-red-500 dark:text-red-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                  <ArrowDownCircle className="w-3 h-3" />
                  {copy.creditNotes}
                </h4>
                <div className="bg-red-50 dark:bg-red-900/10 rounded-lg p-3 space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-red-600 dark:text-red-400">
                      {copy.creditNotesCount}
                    </span>
                    <span className="font-medium text-red-700 dark:text-red-300">
                      {fiscal.creditNotes.count}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-red-600 dark:text-red-400">
                      {copy.creditNotesTotal}
                    </span>
                    <span className="font-bold text-red-700 dark:text-red-300">
                      -{formatAmount(fiscal.creditNotes.totalAmount)}
                    </span>
                  </div>
                  {fiscal.refundsByPaymentMethod.length > 0 && (
                    <div className="pt-2 border-t border-red-200 dark:border-red-800">
                      <p className="text-[10px] text-red-500 uppercase tracking-wider mb-1">
                        {copy.refundsByMethod}
                      </p>
                      <PaymentMethodTable
                        data={fiscal.refundsByPaymentMethod}
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Net Result */}
              <div className="border-t-2 border-emerald-300 dark:border-emerald-700 pt-3">
                <Row
                  label={copy.netFiscalResult}
                  value={fiscal.netResult}
                  bold
                  highlight="bg-emerald-50 dark:bg-emerald-900/20 rounded px-2"
                />
                <p className="text-[10px] text-slate-400 mt-1 px-2">
                  = {copy.totalFiscalSales} – {copy.creditNotes}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* ═══════════════════════════════════════════════════════ */}
        {/* CHANNEL 2 – INTERNAL (NON-FISCAL)                     */}
        {/* ═══════════════════════════════════════════════════════ */}
        <div className="rounded-lg border border-blue-200 dark:border-blue-700 overflow-hidden mt-4">
          <SectionHeader
            id="internal"
            icon={ShoppingBag}
            title={copy.channelInternal}
            subtitle={copy.channelInternalDesc}
            color="bg-blue-50 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300"
            value={internal.netResult}
          />
          {expandedSections.internal && (
            <div className="p-4 bg-white dark:bg-slate-900 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3">
                  <p className="text-xs text-blue-600 dark:text-blue-400 mb-1">
                    {copy.totalInternalSales}
                  </p>
                  <p className="text-xl font-bold text-blue-700 dark:text-blue-300">
                    {formatAmount(internal.totalSales)}
                  </p>
                </div>
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3">
                  <p className="text-xs text-blue-600 dark:text-blue-400 mb-1">
                    {copy.ticketCount}
                  </p>
                  <p className="text-xl font-bold text-blue-700 dark:text-blue-300">
                    {internal.salesCount}
                  </p>
                </div>
              </div>

              {/* Payment Methods */}
              <div>
                <h4 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                  {copy.paymentMethods}
                </h4>
                <PaymentMethodTable data={internal.byPaymentMethod} showCount />
              </div>

              {/* Net Result */}
              <div className="border-t-2 border-blue-300 dark:border-blue-700 pt-3">
                <Row
                  label={copy.netInternalResult}
                  value={internal.netResult}
                  bold
                  highlight="bg-blue-50 dark:bg-blue-900/20 rounded px-2"
                />
              </div>
            </div>
          )}
        </div>

        {/* ═══════════════════════════════════════════════════════ */}
        {/* GENERAL TOTAL                                         */}
        {/* ═══════════════════════════════════════════════════════ */}
        <div className="rounded-lg border border-purple-200 dark:border-purple-700 overflow-hidden mt-4">
          <SectionHeader
            id="general"
            icon={TrendingUp}
            title={copy.generalTotal}
            subtitle={copy.generalTotalDesc}
            color="bg-purple-50 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300"
            value={generalTotal.overallResult}
          />
          {expandedSections.general && (
            <div className="p-4 bg-white dark:bg-slate-900 space-y-2">
              <Row
                label={copy.netFiscal}
                value={generalTotal.netFiscalResult}
              />
              <Row
                label={copy.netInternal}
                value={generalTotal.netInternalResult}
              />
              <div className="border-t border-slate-200 dark:border-slate-700 pt-2">
                <Row
                  label={copy.overallResult}
                  value={generalTotal.overallResult}
                  bold
                  highlight="bg-purple-50 dark:bg-purple-900/20 rounded px-2"
                />
              </div>
              <div className="flex justify-between items-center text-xs text-slate-500 dark:text-slate-400 px-1">
                <span>{copy.totalSales}</span>
                <span className="font-medium">
                  {generalTotal.totalSalesCount}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* ═══════════════════════════════════════════════════════ */}
        {/* CASH RECONCILIATION                                   */}
        {/* ═══════════════════════════════════════════════════════ */}
        <div className="rounded-lg border border-amber-200 dark:border-amber-700 overflow-hidden mt-4">
          <SectionHeader
            id="reconciliation"
            icon={Banknote}
            title={copy.cashReconciliation}
            subtitle={copy.cashReconciliationDesc}
            color="bg-amber-50 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300"
          />
          {expandedSections.reconciliation && (
            <div className="p-4 bg-white dark:bg-slate-900 space-y-3">
              {/* Expected Cash Breakdown */}
              <div>
                <h4 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                  {copy.expectedCash}
                </h4>
                <div className="space-y-1 bg-slate-50 dark:bg-slate-800 rounded-lg p-3">
                  <Row
                    label={copy.openingBalance}
                    value={reconciliation.expectedCash.openingBalance}
                  />
                  <Row
                    label={copy.fiscalCash}
                    value={reconciliation.expectedCash.fiscal}
                  />
                  <Row
                    label={copy.internalCash}
                    value={reconciliation.expectedCash.internal}
                  />
                  <Row
                    label={copy.manualCashIn}
                    value={reconciliation.expectedCash.cashIn}
                  />
                  <Row
                    label={copy.manualCashOut}
                    value={reconciliation.expectedCash.cashOut}
                    negative
                  />
                  <div className="border-t border-slate-300 dark:border-slate-600 pt-2 mt-2">
                    <Row
                      label={copy.totalExpected}
                      value={reconciliation.expectedCash.total}
                      bold
                    />
                  </div>
                </div>
              </div>

              {/* Counted vs Expected */}
              <div className="bg-amber-50 dark:bg-amber-900/10 rounded-lg p-3 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-amber-700 dark:text-amber-300">
                    {copy.countedCash}
                  </span>
                  <span className="text-lg font-bold text-amber-800 dark:text-amber-200 tabular-nums">
                    {reconciliation.countedCash !== null
                      ? formatAmount(reconciliation.countedCash)
                      : copy.pendingCount}
                  </span>
                </div>
                {reconciliation.difference !== null && (
                  <div
                    className={`flex justify-between items-center pt-2 border-t ${
                      reconciliation.difference === 0
                        ? "border-green-300 dark:border-green-700"
                        : reconciliation.difference > 0
                          ? "border-green-300 dark:border-green-700"
                          : "border-red-300 dark:border-red-700"
                    }`}
                  >
                    <span
                      className={`text-sm font-bold ${
                        reconciliation.difference === 0
                          ? "text-green-600 dark:text-green-400"
                          : reconciliation.difference > 0
                            ? "text-green-600 dark:text-green-400"
                            : "text-red-600 dark:text-red-400"
                      }`}
                    >
                      {copy.difference}:{" "}
                      {reconciliation.difference === 0
                        ? copy.noDifference
                        : reconciliation.difference > 0
                          ? copy.surplus
                          : copy.shortage}
                    </span>
                    <span
                      className={`text-lg font-bold tabular-nums ${
                        reconciliation.difference === 0
                          ? "text-green-600 dark:text-green-400"
                          : reconciliation.difference > 0
                            ? "text-green-600 dark:text-green-400"
                            : "text-red-600 dark:text-red-400"
                      }`}
                    >
                      {formatAmount(reconciliation.difference)}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ─── Print/Export buttons (compact mode) ──────────────── */}
      {compact && (
        <div className="flex justify-end gap-2 no-print mt-4">
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition text-xs"
          >
            <Printer className="w-3 h-3" />
            {copy.print}
          </button>
          <button
            onClick={handleExportPDF}
            className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-xs"
          >
            <Download className="w-3 h-3" />
            {copy.exportPDF}
          </button>
        </div>
      )}
    </div>
  );
}

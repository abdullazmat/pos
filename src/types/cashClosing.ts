/**
 * Cash Closing with Two Channels – Type Definitions
 *
 * Channel 1 – Fiscal (Legal): ARCA/WSFE invoices with CAE
 * Channel 2 – Internal (Non-Fiscal): Internal tickets, no CAE, no IVA book
 */

// ─── Movement types ──────────────────────────────────────────────
export type MovementType = "sale" | "credit_note" | "cash_in" | "cash_out";
export type ChannelType = "legal" | "internal";

// ─── Individual movement record ──────────────────────────────────
export interface CashClosingMovement {
  channel: ChannelType;
  payment_method: string;
  amount: number;
  movement_type: MovementType;
  pos_session_id: string;
  timestamp: string;
  reference_id?: string;
  description?: string;
}

// ─── Payment method breakdown ────────────────────────────────────
export interface PaymentMethodBreakdown {
  method: string;
  label: string;
  total: number;
  count: number;
}

// ─── Invoice type breakdown (A/B/C) ─────────────────────────────
export interface InvoiceTypeBreakdown {
  type: string; // "A", "B", "C", "NC-A", "NC-B", etc.
  label: string;
  count: number;
  total: number;
}

// ─── Credit note summary ─────────────────────────────────────────
export interface CreditNoteSummary {
  totalAmount: number;
  count: number;
  byPaymentMethod: PaymentMethodBreakdown[];
}

// ─── Channel 1 – Fiscal (Legal) ─────────────────────────────────
export interface FiscalChannelData {
  totalSales: number;
  salesCount: number;
  invoicesByType: InvoiceTypeBreakdown[];
  byPaymentMethod: PaymentMethodBreakdown[];
  creditNotes: CreditNoteSummary;
  refundsByPaymentMethod: PaymentMethodBreakdown[];
  netResult: number; // totalSales - creditNotes.totalAmount
}

// ─── Channel 2 – Internal (Non-Fiscal) ──────────────────────────
export interface InternalChannelData {
  totalSales: number;
  salesCount: number;
  byPaymentMethod: PaymentMethodBreakdown[];
  netResult: number; // = totalSales (no credit notes in internal)
}

// ─── General Total ───────────────────────────────────────────────
export interface GeneralTotal {
  netFiscalResult: number;
  netInternalResult: number;
  overallResult: number; // netFiscalResult + netInternalResult
  totalSalesCount: number;
}

// ─── Cash Reconciliation ─────────────────────────────────────────
export interface CashReconciliation {
  expectedCash: {
    fiscal: number; // Cash sales - cash refunds (fiscal)
    internal: number; // Cash sales (internal)
    cashIn: number; // Manual cash-in movements
    cashOut: number; // Manual cash-out/withdrawals
    openingBalance: number;
    total: number; // openingBalance + fiscal + internal + cashIn - cashOut
  };
  countedCash: number | null; // Entered by cashier
  difference: number | null; // counted - expected total
}

// ─── Complete Cash Closing Report ────────────────────────────────
export interface CashClosingReport {
  sessionId: string;
  businessName: string;
  cashierName: string;
  openedAt: string;
  closedAt: string | null;
  fiscal: FiscalChannelData;
  internal: InternalChannelData;
  generalTotal: GeneralTotal;
  reconciliation: CashReconciliation;
  movements: CashClosingMovement[];
  // Raw movement list for the receipt
  rawMovements: Array<{
    _id?: string;
    type: string;
    description: string;
    amount: number;
    createdAt: string;
  }>;
}

// ─── Comprobante tipo mapping ────────────────────────────────────
export const COMPROBANTE_TIPO_LABELS: Record<number, string> = {
  1: "Factura A",
  2: "Nota de Débito A",
  3: "Nota de Crédito A",
  6: "Factura B",
  7: "Nota de Crédito B",
  8: "Nota de Débito B",
  11: "Factura C",
  12: "Nota de Débito C",
  13: "Nota de Crédito C",
};

export const COMPROBANTE_IS_CREDIT_NOTE = [3, 7, 13];
export const COMPROBANTE_IS_INVOICE = [1, 6, 11];

export function getInvoiceTypeLabel(comprobanteTipo?: number): string {
  if (!comprobanteTipo) return "S/T";
  return COMPROBANTE_TIPO_LABELS[comprobanteTipo] || `Tipo ${comprobanteTipo}`;
}

export function getInvoiceTypeLetter(comprobanteTipo?: number): string {
  if (!comprobanteTipo) return "-";
  if ([1, 2, 3].includes(comprobanteTipo)) return "A";
  if ([6, 7, 8].includes(comprobanteTipo)) return "B";
  if ([11, 12, 13].includes(comprobanteTipo)) return "C";
  return "-";
}

// ─── Payment method labels ───────────────────────────────────────
export const PAYMENT_METHOD_LABELS: Record<string, Record<string, string>> = {
  es: {
    cash: "Efectivo",
    card: "Tarjeta",
    check: "Cheque",
    online: "Online",
    bankTransfer: "Transferencia",
    qr: "QR",
    mercadopago: "Mercado Pago",
    multiple: "Múltiple",
    account: "Cuenta Corriente",
  },
  en: {
    cash: "Cash",
    card: "Card",
    check: "Check",
    online: "Online",
    bankTransfer: "Bank Transfer",
    qr: "QR",
    mercadopago: "Mercado Pago",
    multiple: "Multiple",
    account: "Account",
  },
  pt: {
    cash: "Dinheiro",
    card: "Cartão",
    check: "Cheque",
    online: "Online",
    bankTransfer: "Transferência",
    qr: "QR",
    mercadopago: "Mercado Pago",
    multiple: "Múltiplo",
    account: "Conta",
  },
};

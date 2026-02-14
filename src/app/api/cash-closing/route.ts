import { NextRequest } from "next/server";
import dbConnect from "@/lib/db/connect";
import CashRegister from "@/lib/models/CashRegister";
import CashMovement from "@/lib/models/CashMovement";
import Sale from "@/lib/models/Sale";
import Invoice from "@/lib/models/Invoice";
import Business from "@/lib/models/Business";
import User from "@/lib/models/User";
import { authMiddleware } from "@/lib/middleware/auth";
import {
  generateErrorResponse,
  generateSuccessResponse,
} from "@/lib/utils/helpers";
import {
  COMPROBANTE_IS_CREDIT_NOTE,
  COMPROBANTE_IS_INVOICE,
} from "@/types/cashClosing";
import type {
  CashClosingReport,
  FiscalChannelData,
  InternalChannelData,
  PaymentMethodBreakdown,
  InvoiceTypeBreakdown,
  CreditNoteSummary,
  CashClosingMovement,
  GeneralTotal,
  CashReconciliation,
} from "@/types/cashClosing";

/**
 * GET /api/cash-closing?sessionId=xxx
 *
 * Returns a complete cash closing report with two channels:
 *  - Channel 1: Fiscal (Legal) — ARCA/WSFE invoices
 *  - Channel 2: Internal (Non-Fiscal) — Internal tickets
 *  - General Total: Fiscal + Internal
 *  - Cash Reconciliation
 *
 * All calculations are filtered by pos_session_id (cashRegisterId).
 */
export async function GET(req: NextRequest) {
  try {
    const authResult = await authMiddleware(req);
    if (!authResult.authorized) {
      return generateErrorResponse(authResult.error || "Unauthorized", 401);
    }

    const { businessId, userId } = authResult.user!;
    await dbConnect();

    const { searchParams } = new URL(req.url);
    const sessionId = searchParams.get("sessionId");

    // If no sessionId, get the current open session
    let cashRegister;
    if (sessionId) {
      cashRegister = await CashRegister.findOne({
        _id: sessionId,
        businessId,
      });
    } else {
      cashRegister = await CashRegister.findOne({
        businessId,
        status: "open",
      });
    }

    if (!cashRegister) {
      return generateErrorResponse("No cash register session found", 404);
    }

    // ─── Fetch all data in parallel ────────────────────────────
    const [sales, cashMovements, business, cashier] = await Promise.all([
      // All sales for this register session
      Sale.find({
        businessId,
        cashRegisterId: cashRegister._id,
      }).populate("invoice"),

      // All cash movements for this session
      CashMovement.find({
        cashRegisterId: cashRegister._id,
      }).sort({ createdAt: 1 }),

      Business.findById(businessId).select("name"),
      User.findById(cashRegister.openedBy).select("fullName username email"),
    ]);

    // ─── Classify sales by channel ─────────────────────────────
    const fiscalSales: any[] = [];
    const internalSales: any[] = [];
    const fiscalCreditNoteInvoices: any[] = [];

    for (const sale of sales) {
      const invoice = sale.invoice as any;
      if (
        invoice &&
        (invoice.channel === "ARCA" || invoice.channel === "WSFE")
      ) {
        // Check if this is a credit note based on comprobanteTipo
        const comprobanteTipo = invoice.fiscalData?.comprobanteTipo;
        if (
          comprobanteTipo &&
          COMPROBANTE_IS_CREDIT_NOTE.includes(comprobanteTipo)
        ) {
          fiscalCreditNoteInvoices.push({ sale, invoice });
        } else {
          fiscalSales.push({ sale, invoice });
        }
      } else {
        internalSales.push({ sale, invoice });
      }
    }

    // Also find credit note invoices that were created during this session
    // but might not be linked to a sale (standalone credit notes)
    const sessionStart = cashRegister.openedAt;
    const sessionEnd = cashRegister.closedAt || new Date();

    const standaloneCreditNotes = await Invoice.find({
      business: businessId,
      channel: { $in: ["ARCA", "WSFE"] },
      "fiscalData.comprobanteTipo": { $in: COMPROBANTE_IS_CREDIT_NOTE },
      date: { $gte: sessionStart, $lte: sessionEnd },
    });

    // Merge standalone credit notes (deduplicate by _id)
    const existingCNIds = new Set(
      fiscalCreditNoteInvoices.map((cn: any) => cn.invoice._id.toString()),
    );
    for (const cn of standaloneCreditNotes) {
      if (!existingCNIds.has(cn._id.toString())) {
        fiscalCreditNoteInvoices.push({ sale: null, invoice: cn });
      }
    }

    // ─── Build Fiscal Channel Data ─────────────────────────────
    const fiscal = buildFiscalChannelData(
      fiscalSales,
      fiscalCreditNoteInvoices,
    );

    // ─── Build Internal Channel Data ───────────────────────────
    const internal = buildInternalChannelData(internalSales);

    // ─── General Total ─────────────────────────────────────────
    const generalTotal: GeneralTotal = {
      netFiscalResult: fiscal.netResult,
      netInternalResult: internal.netResult,
      overallResult: fiscal.netResult + internal.netResult,
      totalSalesCount: fiscal.salesCount + internal.salesCount,
    };

    // ─── Cash Reconciliation ───────────────────────────────────
    const reconciliation = buildCashReconciliation(
      fiscalSales,
      internalSales,
      fiscalCreditNoteInvoices,
      cashMovements,
      cashRegister,
    );

    // ─── Build movement list ───────────────────────────────────
    const movements = buildMovementList(
      fiscalSales,
      internalSales,
      fiscalCreditNoteInvoices,
      cashMovements,
      cashRegister._id.toString(),
    );

    // ─── Raw movements for receipt ─────────────────────────────
    const rawMovements = cashMovements.map((m: any) => ({
      _id: m._id?.toString(),
      type: m.type,
      description: m.description,
      amount: m.amount,
      createdAt: m.createdAt?.toISOString() || "",
    }));

    const report: CashClosingReport = {
      sessionId: cashRegister._id.toString(),
      businessName: business?.name || "Mi Negocio",
      cashierName:
        cashier?.fullName || cashier?.username || cashier?.email || "",
      openedAt: cashRegister.openedAt?.toISOString() || "",
      closedAt: cashRegister.closedAt?.toISOString() || null,
      fiscal,
      internal,
      generalTotal,
      reconciliation,
      movements,
      rawMovements,
    };

    return generateSuccessResponse(report);
  } catch (error) {
    console.error("Cash closing GET error:", error);
    return generateErrorResponse("Internal server error", 500);
  }
}

// ─── Helper: Build Fiscal Channel Data ───────────────────────────
function buildFiscalChannelData(
  fiscalSales: any[],
  creditNoteEntries: any[],
): FiscalChannelData {
  let totalSales = 0;
  const paymentMethodMap: Record<string, { total: number; count: number }> = {};
  const invoiceTypeMap: Record<
    string,
    { count: number; total: number; label: string }
  > = {};

  for (const { sale, invoice } of fiscalSales) {
    const amount = sale?.total || invoice?.totalAmount || 0;
    totalSales += amount;

    // Payment method
    const pm = sale?.paymentMethod || invoice?.paymentMethod || "cash";
    if (!paymentMethodMap[pm]) paymentMethodMap[pm] = { total: 0, count: 0 };
    paymentMethodMap[pm].total += amount;
    paymentMethodMap[pm].count += 1;

    // Invoice type (A/B/C)
    const ct = invoice?.fiscalData?.comprobanteTipo;
    const typeKey = ct ? String(ct) : "unknown";
    const typeLabel = getComprobanteTipoLabel(ct);
    if (!invoiceTypeMap[typeKey])
      invoiceTypeMap[typeKey] = { count: 0, total: 0, label: typeLabel };
    invoiceTypeMap[typeKey].count += 1;
    invoiceTypeMap[typeKey].total += amount;
  }

  // Credit notes
  let cnTotalAmount = 0;
  let cnCount = 0;
  const cnPaymentMethodMap: Record<string, { total: number; count: number }> =
    {};
  const refundPaymentMethodMap: Record<
    string,
    { total: number; count: number }
  > = {};

  for (const { sale, invoice } of creditNoteEntries) {
    const amount = sale?.total || invoice?.totalAmount || 0;
    cnTotalAmount += amount;
    cnCount += 1;

    const pm = sale?.paymentMethod || invoice?.paymentMethod || "cash";
    if (!cnPaymentMethodMap[pm])
      cnPaymentMethodMap[pm] = { total: 0, count: 0 };
    cnPaymentMethodMap[pm].total += amount;
    cnPaymentMethodMap[pm].count += 1;

    // Credit note type in invoice type map
    const ct = invoice?.fiscalData?.comprobanteTipo;
    const typeKey = ct ? String(ct) : "unknown-cn";
    const typeLabel = getComprobanteTipoLabel(ct);
    if (!invoiceTypeMap[typeKey])
      invoiceTypeMap[typeKey] = { count: 0, total: 0, label: typeLabel };
    invoiceTypeMap[typeKey].count += 1;
    invoiceTypeMap[typeKey].total += amount;

    // Refunds by payment method
    if (!refundPaymentMethodMap[pm])
      refundPaymentMethodMap[pm] = { total: 0, count: 0 };
    refundPaymentMethodMap[pm].total += amount;
    refundPaymentMethodMap[pm].count += 1;
  }

  const byPaymentMethod: PaymentMethodBreakdown[] = Object.entries(
    paymentMethodMap,
  ).map(([method, data]) => ({
    method,
    label: method,
    total: data.total,
    count: data.count,
  }));

  const invoicesByType: InvoiceTypeBreakdown[] = Object.entries(
    invoiceTypeMap,
  ).map(([type, data]) => ({
    type,
    label: data.label,
    count: data.count,
    total: data.total,
  }));

  const creditNotes: CreditNoteSummary = {
    totalAmount: cnTotalAmount,
    count: cnCount,
    byPaymentMethod: Object.entries(cnPaymentMethodMap).map(
      ([method, data]) => ({
        method,
        label: method,
        total: data.total,
        count: data.count,
      }),
    ),
  };

  const refundsByPaymentMethod: PaymentMethodBreakdown[] = Object.entries(
    refundPaymentMethodMap,
  ).map(([method, data]) => ({
    method,
    label: method,
    total: data.total,
    count: data.count,
  }));

  return {
    totalSales,
    salesCount: fiscalSales.length,
    invoicesByType,
    byPaymentMethod,
    creditNotes,
    refundsByPaymentMethod,
    netResult: totalSales - cnTotalAmount,
  };
}

// ─── Helper: Build Internal Channel Data ─────────────────────────
function buildInternalChannelData(internalSales: any[]): InternalChannelData {
  let totalSales = 0;
  const paymentMethodMap: Record<string, { total: number; count: number }> = {};

  for (const { sale } of internalSales) {
    const amount = sale?.total || 0;
    totalSales += amount;

    const pm = sale?.paymentMethod || "cash";
    if (!paymentMethodMap[pm]) paymentMethodMap[pm] = { total: 0, count: 0 };
    paymentMethodMap[pm].total += amount;
    paymentMethodMap[pm].count += 1;
  }

  const byPaymentMethod: PaymentMethodBreakdown[] = Object.entries(
    paymentMethodMap,
  ).map(([method, data]) => ({
    method,
    label: method,
    total: data.total,
    count: data.count,
  }));

  return {
    totalSales,
    salesCount: internalSales.length,
    byPaymentMethod,
    netResult: totalSales,
  };
}

// ─── Helper: Cash Reconciliation ─────────────────────────────────
function buildCashReconciliation(
  fiscalSales: any[],
  internalSales: any[],
  creditNoteEntries: any[],
  cashMovements: any[],
  cashRegister: any,
): CashReconciliation {
  // Fiscal cash collections
  let fiscalCash = 0;
  for (const { sale } of fiscalSales) {
    if (sale?.paymentMethod === "cash") {
      fiscalCash += sale.total || 0;
    }
  }

  // Fiscal cash refunds (credit notes paid in cash)
  let fiscalCashRefunds = 0;
  for (const { sale, invoice } of creditNoteEntries) {
    const pm = sale?.paymentMethod || invoice?.paymentMethod || "cash";
    if (pm === "cash") {
      fiscalCashRefunds += sale?.total || invoice?.totalAmount || 0;
    }
  }

  // Internal cash collections
  let internalCash = 0;
  for (const { sale } of internalSales) {
    if (sale?.paymentMethod === "cash") {
      internalCash += sale.total || 0;
    }
  }

  // Manual cash movements (withdrawals = cash_out, deposits = cash_in)
  let cashIn = 0;
  let cashOut = 0;
  for (const m of cashMovements) {
    if (m.type === "ingreso") {
      cashIn += m.amount || 0;
    } else if (m.type === "retiro") {
      cashOut += m.amount || 0;
    }
  }

  const openingBalance = cashRegister.openingBalance || 0;
  const expectedTotal =
    openingBalance +
    fiscalCash -
    fiscalCashRefunds +
    internalCash +
    cashIn -
    cashOut;

  return {
    expectedCash: {
      fiscal: fiscalCash - fiscalCashRefunds,
      internal: internalCash,
      cashIn,
      cashOut,
      openingBalance,
      total: expectedTotal,
    },
    countedCash: cashRegister.closingBalance ?? null,
    difference:
      cashRegister.closingBalance != null
        ? cashRegister.closingBalance - expectedTotal
        : null,
  };
}

// ─── Helper: Build Movement List ─────────────────────────────────
function buildMovementList(
  fiscalSales: any[],
  internalSales: any[],
  creditNoteEntries: any[],
  cashMovements: any[],
  sessionId: string,
): CashClosingMovement[] {
  const list: CashClosingMovement[] = [];

  for (const { sale, invoice } of fiscalSales) {
    list.push({
      channel: "legal",
      payment_method: sale?.paymentMethod || invoice?.paymentMethod || "cash",
      amount: sale?.total || invoice?.totalAmount || 0,
      movement_type: "sale",
      pos_session_id: sessionId,
      timestamp: sale?.createdAt?.toISOString() || "",
      reference_id: sale?._id?.toString(),
      description: invoice?.invoiceNumber || "",
    });
  }

  for (const { sale, invoice } of internalSales) {
    list.push({
      channel: "internal",
      payment_method: sale?.paymentMethod || "cash",
      amount: sale?.total || 0,
      movement_type: "sale",
      pos_session_id: sessionId,
      timestamp: sale?.createdAt?.toISOString() || "",
      reference_id: sale?._id?.toString(),
    });
  }

  for (const { sale, invoice } of creditNoteEntries) {
    list.push({
      channel: "legal",
      payment_method: sale?.paymentMethod || invoice?.paymentMethod || "cash",
      amount: sale?.total || invoice?.totalAmount || 0,
      movement_type: "credit_note",
      pos_session_id: sessionId,
      timestamp:
        sale?.createdAt?.toISOString() || invoice?.date?.toISOString() || "",
      reference_id: invoice?._id?.toString(),
      description: invoice?.invoiceNumber || "",
    });
  }

  for (const m of cashMovements) {
    if (m.type === "ingreso") {
      list.push({
        channel: "internal",
        payment_method: "cash",
        amount: m.amount || 0,
        movement_type: "cash_in",
        pos_session_id: sessionId,
        timestamp: m.createdAt?.toISOString() || "",
        reference_id: m._id?.toString(),
        description: m.description || "",
      });
    } else if (m.type === "retiro") {
      list.push({
        channel: "internal",
        payment_method: "cash",
        amount: m.amount || 0,
        movement_type: "cash_out",
        pos_session_id: sessionId,
        timestamp: m.createdAt?.toISOString() || "",
        reference_id: m._id?.toString(),
        description: m.description || "",
      });
    }
  }

  // Sort by timestamp
  list.sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
  );

  return list;
}

// ─── Helper: Comprobante tipo label ──────────────────────────────
function getComprobanteTipoLabel(tipo?: number): string {
  const map: Record<number, string> = {
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
  return tipo ? map[tipo] || `Tipo ${tipo}` : "Sin Tipo";
}

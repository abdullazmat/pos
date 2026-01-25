/**
 * Fiscal Reports API Endpoints
 * Handles: Libro de Ventas, Libro de IVA, Resumen, Exports
 */

import { NextRequest } from "next/server";
import dbConnect from "@/lib/db/connect";
import Invoice from "@/lib/models/Invoice";
import Business from "@/lib/models/Business";
import FiscalConfiguration from "@/lib/models/FiscalConfiguration";
import InvoiceAudit from "@/lib/models/InvoiceAudit";
import { authMiddleware } from "@/lib/middleware/auth";
import {
  generateErrorResponse,
  generateSuccessResponse,
} from "@/lib/utils/helpers";

/**
 * GET /api/fiscal-reports/resumen
 * Retrieves summary totals for a date range
 */
export async function GET(req: NextRequest) {
  try {
    const authResult = await authMiddleware(req);
    if (!authResult.authorized) {
      return generateErrorResponse(authResult.error || "Unauthorized", 401);
    }

    const { businessId } = authResult.user!;
    const searchParams = req.nextUrl.searchParams;
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const reportType = searchParams.get("reportType") || "resumen";

    if (!startDate || !endDate) {
      return generateErrorResponse("startDate and endDate are required", 400);
    }

    await dbConnect();

    const dateFilter = {
      date: {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      },
    };

    if (reportType === "resumen") {
      return await handleResumenReport(businessId, dateFilter);
    } else if (reportType === "libro-ventas") {
      return await handleLibroVentasReport(businessId, dateFilter);
    } else if (reportType === "libro-iva") {
      return await handleLibroIVAReport(businessId, dateFilter);
    }

    return generateErrorResponse("Invalid report type", 400);
  } catch (error: any) {
    console.error("[FISCAL REPORTS]", error);
    return generateErrorResponse(
      error.message || "Failed to generate fiscal report",
      500,
    );
  }
}

/**
 * Handle Resumen Report
 */
async function handleResumenReport(
  businessId: string,
  dateFilter: any,
): Promise<Response> {
  const invoices = await Invoice.find({
    business: businessId,
    ...dateFilter,
    status: "AUTHORIZED", // Only authorized invoices
  }).lean<import("@/lib/models/Invoice").IInvoice[]>();

  let totalSales = 0;
  let totalTaxableAmount = 0;
  let totalTaxAmount = 0;
  let totalExemptAmount = 0;
  let totalUntaxedAmount = 0;
  const taxBreakdownMap = new Map<number, { base: number; tax: number }>();

  invoices.forEach((inv) => {
    totalSales += inv.totalAmount;
    totalTaxableAmount += inv.items.reduce(
      (sum: number, item: { quantity: number; unitPrice: number }) =>
        sum + item.quantity * item.unitPrice,
      0,
    );
    totalTaxAmount += inv.taxAmount;

    if (inv.fiscalData?.taxBreakdown) {
      inv.fiscalData.taxBreakdown.forEach((tax) => {
        const existing = taxBreakdownMap.get(tax.aliquot) || {
          base: 0,
          tax: 0,
        };
        existing.base += tax.baseAmount;
        existing.tax += tax.taxAmount;
        taxBreakdownMap.set(tax.aliquot, existing);
      });
    }
  });

  const taxBreakdown = Array.from(taxBreakdownMap.entries()).map(
    ([rate, amounts]) => ({
      rate,
      baseAmount: amounts.base,
      taxAmount: amounts.tax,
    }),
  );

  return generateSuccessResponse({
    reportType: "RESUMEN",
    periodStart: dateFilter.date.$gte,
    periodEnd: dateFilter.date.$lte,
    invoiceCount: invoices.length,
    totalSales,
    totalTaxableAmount,
    totalTaxAmount,
    totalExemptAmount,
    totalUntaxedAmount,
    taxBreakdown,
  });
}

/**
 * Handle Libro de Ventas Report
 */
async function handleLibroVentasReport(
  businessId: string,
  dateFilter: any,
): Promise<Response> {
  const invoices = await Invoice.find({
    business: businessId,
    ...dateFilter,
    status: "AUTHORIZED",
  })
    .sort({ date: 1 })
    .lean();

  const libroVentas = invoices.map((inv) => ({
    date: inv.date,
    invoiceType:
      inv.fiscalData?.comprobanteTipo === 1 ? "Factura A" : "Factura B",
    pointOfSale: inv.fiscalData?.pointOfSale,
    invoiceNumber: inv.fiscalData?.invoiceSequence,
    customerName: inv.customerName,
    customerCuit: inv.customerCuit,
    neto: inv.subtotal,
    iva: inv.taxAmount,
    total: inv.totalAmount,
    cae: inv.fiscalData?.cae,
    caeVto: inv.fiscalData?.caeVto,
    status: "AUTHORIZED",
  }));

  return generateSuccessResponse({
    reportType: "LIBRO_VENTAS",
    periodStart: dateFilter.date.$gte,
    periodEnd: dateFilter.date.$lte,
    invoiceCount: libroVentas.length,
    data: libroVentas,
  });
}

/**
 * Handle Libro de IVA Report
 */
async function handleLibroIVAReport(
  businessId: string,
  dateFilter: any,
): Promise<Response> {
  const invoices = await Invoice.find({
    business: businessId,
    ...dateFilter,
    status: "AUTHORIZED",
  }).lean<import("@/lib/models/Invoice").IInvoice[]>();

  const taxBreakdownMap = new Map<
    number,
    { baseAmount: number; taxAmount: number }
  >();

  invoices.forEach((inv) => {
    if (inv.fiscalData?.taxBreakdown) {
      inv.fiscalData.taxBreakdown.forEach(
        (tax: {
          taxType: string;
          aliquot: number;
          baseAmount: number;
          taxAmount: number;
        }) => {
          const aliquot = tax.aliquot;
          const existing = taxBreakdownMap.get(aliquot) || {
            baseAmount: 0,
            taxAmount: 0,
          };
          existing.baseAmount += tax.baseAmount;
          existing.taxAmount += tax.taxAmount;
          taxBreakdownMap.set(aliquot, existing);
        },
      );
    }
  });

  const libroIVA = Array.from(taxBreakdownMap.entries()).map(
    ([aliquot, amounts]) => ({
      aliquot: `${aliquot}%`,
      baseAmount: amounts.baseAmount,
      taxAmount: amounts.taxAmount,
    }),
  );

  return generateSuccessResponse({
    reportType: "LIBRO_IVA",
    periodStart: dateFilter.date.$gte,
    periodEnd: dateFilter.date.$lte,
    data: libroIVA,
  });
}

/**
 * POST /api/fiscal-reports/export
 * Export report as CSV/XLSX
 */
export async function POST(req: NextRequest) {
  try {
    const authResult = await authMiddleware(req);
    if (!authResult.authorized) {
      return generateErrorResponse(authResult.error || "Unauthorized", 401);
    }

    const { businessId, userId, email } = authResult.user!;
    const body = await req.json();

    const { reportType, startDate, endDate, format, data } = body;

    if (!reportType || !startDate || !endDate || !format) {
      return generateErrorResponse(
        "reportType, startDate, endDate, and format are required",
        400,
      );
    }

    await dbConnect();

    let csvContent = "";

    if (reportType === "LIBRO_VENTAS") {
      csvContent = generateLibroVentasCSV(data);
    } else if (reportType === "LIBRO_IVA") {
      csvContent = generateLibroIVACSV(data);
    }

    // Audit log export
    const fileHash = calculateHash(csvContent);
    await InvoiceAudit.create({
      business: businessId,
      action: "EXPORT",
      actionDescription: `Exported ${reportType}`,
      userId,
      userEmail: email,
      reportType,
      reportDateRange: {
        startDate: new Date(startDate),
        endDate: new Date(endDate),
      },
      exportedFileName: `${reportType}_${startDate}_${endDate}.${format === "csv" ? "csv" : "xlsx"}`,
      exportFormat: format.toUpperCase(),
      exportedRowCount: data?.length || 0,
      fileHash,
    });

    return new Response(csvContent, {
      headers: {
        "Content-Type":
          format === "csv"
            ? "text/csv;charset=utf-8"
            : "application/vnd.ms-excel",
        "Content-Disposition": `attachment; filename="${reportType}_${startDate}_${endDate}.${format}"`,
      },
    });
  } catch (error: any) {
    console.error("[EXPORT REPORT]", error);
    return generateErrorResponse(
      error.message || "Failed to export report",
      500,
    );
  }
}

/**
 * Generate CSV for Libro de Ventas
 */
function generateLibroVentasCSV(data: any[]): string {
  const headers = [
    "Fecha",
    "Tipo de Comprobante",
    "Número",
    "Cliente",
    "CUIT",
    "Neto",
    "IVA",
    "Total",
    "CAE",
    "Estado",
  ];

  let csv = headers.join(",") + "\n";

  data.forEach((row) => {
    csv += [
      row.date,
      row.invoiceType,
      row.invoiceNumber,
      `"${row.customerName}"`,
      row.customerCuit || "",
      row.neto,
      row.iva,
      row.total,
      row.cae || "",
      row.status,
    ].join(",");
    csv += "\n";
  });

  return csv;
}

/**
 * Generate CSV for Libro de IVA
 */
function generateLibroIVACSV(data: any[]): string {
  const headers = ["Alícuota", "Base Imponible", "Monto IVA"];

  let csv = headers.join(",") + "\n";

  data.forEach((row) => {
    csv += [row.aliquot, row.baseAmount, row.taxAmount].join(",");
    csv += "\n";
  });

  return csv;
}

/**
 * Calculate hash for file validation
 */
function calculateHash(content: string): string {
  const crypto = require("crypto");
  return crypto.createHash("sha256").update(content).digest("hex");
}

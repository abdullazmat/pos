/**
 * Fiscal Reports API Endpoints
 * Handles: Libro de Ventas, Libro de IVA, Resumen, Exports
 * Uses Sale model (same as Reports page) for actual transaction data
 */

import { NextRequest } from "next/server";
import dbConnect from "@/lib/db/connect";
import Sale from "@/lib/models/Sale";
import FiscalConfiguration from "@/lib/models/FiscalConfiguration";
import InvoiceAudit from "@/lib/models/InvoiceAudit";
import { authMiddleware } from "@/lib/middleware/auth";
import {
  generateErrorResponse,
  generateSuccessResponse,
} from "@/lib/utils/helpers";

export const dynamic = "force-dynamic";

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

    // Use same date range logic as /api/sales to ensure consistency
    const start = new Date(`${startDate}T00:00:00.000Z`);
    const end = new Date(`${endDate}T23:59:59.999Z`);

    // Expand range for timezone compatibility
    const expandedStart = new Date(start.getTime() - 14 * 60 * 60 * 1000);
    const expandedEnd = new Date(end.getTime() + 14 * 60 * 60 * 1000);

    const dateFilter = {
      createdAt: {
        $gte: expandedStart,
        $lte: expandedEnd,
      },
    };

    // Get fiscal configuration for VAT calculations
    const config = await FiscalConfiguration.findOne({
      business: businessId,
    });
    const taxRate = config?.taxRate || 21;

    if (reportType === "resumen") {
      return await handleResumenReport(businessId, dateFilter, taxRate);
    } else if (reportType === "libro-ventas") {
      return await handleLibroVentasReport(businessId, dateFilter);
    } else if (reportType === "libro-iva") {
      return await handleLibroIVAReport(businessId, dateFilter, taxRate);
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
 * Handle Resumen Report - queries Sale model for actual transaction data
 */
async function handleResumenReport(
  businessId: string,
  dateFilter: any,
  taxRate: number,
): Promise<Response> {
  // Query Sale model (same as Reports page)
  const sales = await Sale.find({
    $or: [{ businessId }, { business: businessId }],
    ...dateFilter,
  }).lean();

  let totalSales = 0;
  let totalTaxableAmount = 0;
  let totalTaxAmount = 0;

  sales.forEach((sale: any) => {
    const saleTotal =
      typeof sale.total === "number"
        ? sale.total
        : typeof sale.totalWithTax === "number"
          ? sale.totalWithTax
          : typeof sale.amount === "number"
            ? sale.amount
            : 0;

    // Assume all sales are taxable for now (can refine based on product flags)
    totalSales += saleTotal;
    totalTaxableAmount += saleTotal * (100 / (100 + taxRate)); // Back-calculate net from total
    totalTaxAmount += saleTotal - saleTotal * (100 / (100 + taxRate)); // Tax = Total - Net
  });

  // Tax breakdown by single rate for now
  const taxBreakdown =
    totalTaxAmount > 0
      ? [
          {
            rate: taxRate,
            baseAmount: totalTaxableAmount,
            taxAmount: totalTaxAmount,
          },
        ]
      : [];

  return generateSuccessResponse({
    reportType: "RESUMEN",
    invoiceCount: sales.length,
    totalSales,
    totalTaxableAmount,
    totalTaxAmount,
    taxBreakdown,
  });
}

/**
 * Handle Libro de Ventas Report - queries Sale model
 */
async function handleLibroVentasReport(
  businessId: string,
  dateFilter: any,
): Promise<Response> {
  const sales = await Sale.find({
    $or: [{ businessId }, { business: businessId }],
    ...dateFilter,
  })
    .sort({ createdAt: 1 })
    .lean();

  const libroVentas = sales.map((sale: any) => {
    const saleDate = sale.createdAt
      ? new Date(sale.createdAt).toISOString().split("T")[0]
      : new Date().toISOString().split("T")[0];

    const saleTotal =
      typeof sale.total === "number"
        ? sale.total
        : typeof sale.totalWithTax === "number"
          ? sale.totalWithTax
          : typeof sale.amount === "number"
            ? sale.amount
            : 0;

    // Calculate net and VAT (assuming 21% VAT included in total)
    const neto = saleTotal / 1.21;
    const iva = saleTotal - neto;

    return {
      date: saleDate,
      invoiceType: "Factura B", // Default to B type (no CAE yet)
      invoiceNumber: sale._id?.toString().slice(-6) || "000000",
      customerName: sale.customerName || "Cliente",
      customerCuit: sale.customerCuit || "",
      neto: parseFloat(neto.toFixed(2)),
      iva: parseFloat(iva.toFixed(2)),
      total: saleTotal,
      cae: sale.cae || null,
      status: "AUTORIZADO",
    };
  });

  return generateSuccessResponse({
    reportType: "LIBRO_VENTAS",
    invoiceCount: libroVentas.length,
    data: libroVentas,
  });
}

/**
 * Handle Libro de IVA Report - queries Sale model
 */
async function handleLibroIVAReport(
  businessId: string,
  dateFilter: any,
  taxRate: number,
): Promise<Response> {
  const sales = await Sale.find({
    $or: [{ businessId }, { business: businessId }],
    ...dateFilter,
  }).lean();

  let totalBaseAmount = 0;
  let totalTaxAmount = 0;

  sales.forEach((sale: any) => {
    const saleTotal =
      typeof sale.total === "number"
        ? sale.total
        : typeof sale.totalWithTax === "number"
          ? sale.totalWithTax
          : typeof sale.amount === "number"
            ? sale.amount
            : 0;

    // Calculate net and VAT
    const baseAmount = saleTotal / (1 + taxRate / 100);
    const taxAmount = saleTotal - baseAmount;

    totalBaseAmount += baseAmount;
    totalTaxAmount += taxAmount;
  });

  const libroIVA =
    totalTaxAmount > 0
      ? [
          {
            aliquot: `${taxRate}%`,
            baseAmount: parseFloat(totalBaseAmount.toFixed(2)),
            taxAmount: parseFloat(totalTaxAmount.toFixed(2)),
          },
        ]
      : [];

  return generateSuccessResponse({
    reportType: "LIBRO_IVA",
    data: libroIVA,
  });
}

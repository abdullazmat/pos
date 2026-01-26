/**
 * Fiscal Reports Export API Endpoint
 * POST /api/fiscal-reports/export
 * Export reports as CSV files
 */

import { NextRequest } from "next/server";
import dbConnect from "@/lib/db/connect";
import InvoiceAudit from "@/lib/models/InvoiceAudit";
import { authMiddleware } from "@/lib/middleware/auth";
import { generateErrorResponse } from "@/lib/utils/helpers";

export async function POST(req: NextRequest) {
  try {
    const authResult = await authMiddleware(req);
    if (!authResult.authorized) {
      return generateErrorResponse(authResult.error || "Unauthorized", 401);
    }

    const { businessId, userId, email } = authResult.user!;
    console.log(`[EXPORT START] User: ${email}, Business: ${businessId}`);

    const body = await req.json();
    const { reportType, startDate, endDate, format, data } = body;

    console.log(
      `[EXPORT] Params: reportType=${reportType}, format=${format}, dataLength=${data?.length || 0}`,
    );

    if (
      !reportType ||
      !startDate ||
      !endDate ||
      !format ||
      !data ||
      !Array.isArray(data) ||
      data.length === 0
    ) {
      const msg =
        "reportType, startDate, endDate, format, and data array are required";
      console.error("[EXPORT VALIDATION]", msg, {
        reportType,
        startDate,
        endDate,
        format,
        dataLength: data?.length,
      });
      return generateErrorResponse(msg, 400);
    }

    await dbConnect();
    console.log("[EXPORT] Connected to DB, generating CSV...");

    let csvContent = "";

    if (reportType === "LIBRO_VENTAS") {
      csvContent = generateLibroVentasCSV(data);
    } else if (reportType === "LIBRO_IVA") {
      csvContent = generateLibroIVACSV(data);
    } else {
      const msg = `Invalid reportType: ${reportType}`;
      console.error("[EXPORT]", msg);
      return generateErrorResponse(msg, 400);
    }

    // Validate CSV was generated
    if (!csvContent || csvContent.trim().length === 0) {
      console.error("[EXPORT] CSV generation produced empty content");
      return generateErrorResponse("Failed to generate CSV content", 500);
    }

    console.log(
      `[EXPORT] CSV generated: ${csvContent.length} bytes, lines: ${csvContent.split("\n").length}`,
    );

    // Audit log export (non-blocking - don't fail if this fails)
    try {
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
      console.log("[EXPORT AUDIT] Logged successfully");
    } catch (auditError: any) {
      // Log but don't fail - export should still work
      console.warn(
        "[EXPORT AUDIT]",
        "Failed to log export audit:",
        auditError.message,
      );
    }

    console.log(
      `[EXPORT SUCCESS] ${reportType}: ${csvContent.length} bytes, ${data.length} rows`,
    );

    return new Response(csvContent, {
      status: 200,
      headers: {
        "Content-Type":
          format === "csv"
            ? "text/csv;charset=utf-8"
            : "application/vnd.ms-excel",
        "Content-Disposition": `attachment; filename="${reportType}_${startDate}_${endDate}.${format}"`,
      },
    });
  } catch (error: any) {
    console.error("[EXPORT ERROR]", error);
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

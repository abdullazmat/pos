import { NextResponse } from "next/server";
import * as XLSX from "xlsx";

// GET - Download the Excel template for expense imports
export async function GET() {
  try {
    const headers = ["Date", "Description", "Category", "Amount", "Notes"];
    const sampleData = [
      ["2026-02-05", "Electricity", "Utilities", 5432.0, "Feb 2026 Bill"],
      ["2026-02-08", "Supply purchase", "Materials", 12500.0, ""],
      ["2026-02-10", "Maintenance", "Infrastructure", 8900.0, "AC Repair"],
    ];

    const ws = XLSX.utils.aoa_to_sheet([headers, ...sampleData]);

    // Set column widths
    ws["!cols"] = [
      { wch: 14 }, // Date
      { wch: 30 }, // Description
      { wch: 20 }, // Category
      { wch: 14 }, // Amount
      { wch: 30 }, // Notes
    ];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Expenses");

    const buf = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });

    return new NextResponse(buf, {
      status: 200,
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition":
          'attachment; filename="expense_import_template.xlsx"',
      },
    });
  } catch (error) {
    console.error("Template generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate template" },
      { status: 500 },
    );
  }
}

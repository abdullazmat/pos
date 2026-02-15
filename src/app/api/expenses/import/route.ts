import { NextResponse } from "next/server";
import dbConnect from "@/lib/db/connect";
import Expense from "@/lib/models/Expense";
import ExpenseImportLog from "@/lib/models/ExpenseImportLog";
import { verifyToken } from "@/lib/utils/jwt";
import { jobQueue, JOB_TYPES } from "@/lib/services/jobQueue";
import "@/lib/services/jobHandlers"; // ensure handlers are registered
import * as XLSX from "xlsx";

const MAX_ROWS = 500;

interface ImportRow {
  Date: string;
  Description: string;
  Category: string;
  Amount: number | string;
  Notes?: string;
  // Also handle Spanish/Portuguese headers
  Fecha?: string;
  Descripción?: string;
  Descripcion?: string;
  Categoría?: string;
  Categoria?: string;
  Monto?: number | string;
  Valor?: number | string;
  Notas?: string;
  Data?: string;
  Descrição?: string;
}

interface ValidationError {
  row: number;
  field: string;
  message: string;
}

function normalizeRow(raw: any): {
  date: string;
  description: string;
  category: string;
  amount: string;
  notes: string;
} {
  return {
    date: String(raw.Date || raw.Fecha || raw.Data || "").trim(),
    description: String(
      raw.Description ||
        raw["Descripción"] ||
        raw.Descripcion ||
        raw["Descrição"] ||
        "",
    ).trim(),
    category: String(
      raw.Category || raw["Categoría"] || raw.Categoria || "",
    ).trim(),
    amount: String(raw.Amount || raw.Monto || raw.Valor || "").trim(),
    notes: String(raw.Notes || raw.Notas || "").trim(),
  };
}

function validateDate(dateStr: string): boolean {
  // Accepts YYYY-MM-DD
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return false;
  const d = new Date(dateStr + "T00:00:00");
  return !isNaN(d.getTime());
}

function validateRow(
  row: ReturnType<typeof normalizeRow>,
  rowIndex: number,
): ValidationError[] {
  const errors: ValidationError[] = [];

  if (!row.date) {
    errors.push({ row: rowIndex, field: "Date", message: "Date is required" });
  } else if (!validateDate(row.date)) {
    errors.push({
      row: rowIndex,
      field: "Date",
      message: "Invalid date format. Use YYYY-MM-DD",
    });
  }

  if (!row.description) {
    errors.push({
      row: rowIndex,
      field: "Description",
      message: "Description cannot be empty",
    });
  }

  const amount = parseFloat(row.amount);
  if (!row.amount || isNaN(amount)) {
    errors.push({
      row: rowIndex,
      field: "Amount",
      message: "Amount must be a valid number",
    });
  } else if (amount <= 0) {
    errors.push({
      row: rowIndex,
      field: "Amount",
      message: "Amount must be positive",
    });
  }

  return errors;
}

// POST - Import expenses from Excel/CSV file (receives JSON array from client-side parse)
export async function POST(request: Request) {
  try {
    const token = request.headers.get("authorization")?.split(" ")[1];
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const body = await request.json();
    const { rows, fileName, action } = body;
    // action: "validate" | "import"

    if (!rows || !Array.isArray(rows)) {
      return NextResponse.json({ error: "No data provided" }, { status: 400 });
    }

    if (rows.length === 0) {
      return NextResponse.json(
        { error: "File contains no data rows" },
        { status: 400 },
      );
    }

    if (rows.length > MAX_ROWS) {
      return NextResponse.json(
        {
          error: `Maximum ${MAX_ROWS} rows allowed per import. File has ${rows.length} rows.`,
        },
        { status: 400 },
      );
    }

    // For large imports (>100 records), process asynchronously via job queue
    const ASYNC_THRESHOLD = 100;
    if (action === "import" && rows.length > ASYNC_THRESHOLD) {
      const normalizedRows = rows.map((r: any) => normalizeRow(r));
      const allErrors: ValidationError[] = [];
      normalizedRows.forEach((row, idx) => {
        allErrors.push(...validateRow(row, idx + 2));
      });

      if (allErrors.length > 0) {
        return NextResponse.json(
          {
            error: "Validation errors found. Fix them before importing.",
            errors: allErrors,
          },
          { status: 400 },
        );
      }

      const jobId = jobQueue.enqueue(JOB_TYPES.LARGE_IMPORT, {
        rows: normalizedRows,
        fileName: fileName || "unknown",
        businessId: decoded.businessId,
        userId: decoded.userId,
      });

      return NextResponse.json(
        {
          message: "Large import queued for async processing",
          jobId,
          totalRows: normalizedRows.length,
          checkStatusUrl: `/api/jobs?id=${jobId}`,
        },
        { status: 202 },
      );
    }

    // Normalize and validate all rows
    const normalizedRows = rows.map((r: any) => normalizeRow(r));
    const allErrors: ValidationError[] = [];

    normalizedRows.forEach((row, idx) => {
      const rowErrors = validateRow(row, idx + 2); // +2 for 1-based + header row
      allErrors.push(...rowErrors);
    });

    // If action is "validate", return validation results + preview
    if (action === "validate") {
      return NextResponse.json({
        totalRows: normalizedRows.length,
        validRows:
          normalizedRows.length - new Set(allErrors.map((e) => e.row)).size,
        errors: allErrors,
        preview: normalizedRows.slice(0, 10),
      });
    }

    // action === "import" — actually create the expenses
    if (allErrors.length > 0) {
      return NextResponse.json(
        {
          error: "Validation errors found. Fix them before importing.",
          errors: allErrors,
        },
        { status: 400 },
      );
    }

    await dbConnect();

    // Transactional: create all expenses
    const session = await Expense.startSession();
    let createdExpenses: any[] = [];

    try {
      await session.withTransaction(async () => {
        const expenseDocs = normalizedRows.map((row) => ({
          description: row.description,
          amount: parseFloat(row.amount),
          category: row.category || undefined,
          date: new Date(row.date + "T00:00:00"),
          notes: row.notes || undefined,
          paymentMethod: "cash",
          source: "import",
          business: decoded.businessId,
          user: decoded.userId,
        }));

        createdExpenses = await Expense.insertMany(expenseDocs, { session });
      });
    } catch (txError) {
      console.error("Transaction error during import:", txError);
      // Log the failed import
      await ExpenseImportLog.create({
        business: decoded.businessId,
        user: decoded.userId,
        fileName: fileName || "unknown",
        totalRows: normalizedRows.length,
        successCount: 0,
        errorCount: normalizedRows.length,
        errors: [{ row: 0, field: "system", message: "Transaction failed" }],
        status: "failed",
      });

      return NextResponse.json(
        { error: "Import failed. No expenses were created." },
        { status: 500 },
      );
    } finally {
      await session.endSession();
    }

    // Log the successful import
    await ExpenseImportLog.create({
      business: decoded.businessId,
      user: decoded.userId,
      fileName: fileName || "unknown",
      totalRows: normalizedRows.length,
      successCount: createdExpenses.length,
      errorCount: 0,
      errors: [],
      status: "success",
    });

    return NextResponse.json({
      message: "Import successful",
      imported: createdExpenses.length,
    });
  } catch (error) {
    console.error("Import expenses error:", error);
    return NextResponse.json(
      { error: "Failed to import expenses" },
      { status: 500 },
    );
  }
}

// GET - Get import history
export async function GET(request: Request) {
  try {
    const token = request.headers.get("authorization")?.split(" ")[1];
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    await dbConnect();

    const logs = await ExpenseImportLog.find({
      business: decoded.businessId,
    })
      .sort({ createdAt: -1 })
      .limit(20)
      .populate("user", "fullName");

    return NextResponse.json({ logs });
  } catch (error) {
    console.error("Get import logs error:", error);
    return NextResponse.json(
      { error: "Failed to fetch import logs" },
      { status: 500 },
    );
  }
}

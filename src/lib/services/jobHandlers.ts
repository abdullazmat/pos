/**
 * Register async job handlers for the job queue.
 *
 * Import this module once at app startup (e.g., in a layout or middleware)
 * to ensure all handlers are available when jobs are enqueued.
 */

import { jobQueue, JOB_TYPES } from "@/lib/services/jobQueue";
import dbConnect from "@/lib/db/connect";

// ─── Batch OCR handler ───────────────────────────────────────────────
jobQueue.registerHandler(JOB_TYPES.BATCH_OCR, async (payload) => {
  const { fileIds, businessId, userId } = payload;
  const { processOcr } = await import("@/lib/utils/ocr");
  const { default: ExpenseAttachment } =
    await import("@/lib/models/ExpenseAttachment");
  const fs = await import("fs/promises");
  const path = await import("path");

  await dbConnect();

  const results: Array<{ fileId: string; success: boolean; error?: string }> =
    [];

  for (const fileId of fileIds) {
    try {
      const attachment = await ExpenseAttachment.findOne({
        _id: fileId,
        business: businessId,
      });
      if (!attachment || attachment.ocrApplied) {
        results.push({
          fileId,
          success: false,
          error: "Not found or already processed",
        });
        continue;
      }

      const filePath = path.join(process.cwd(), "public", attachment.filePath);
      const buffer = await fs.readFile(filePath);
      const mimeType = attachment.mimeType || "image/png";

      const ocrResult = await processOcr(buffer, mimeType);

      await ExpenseAttachment.updateOne(
        { _id: fileId },
        {
          $set: {
            ocrApplied: true,
            ocrConfidence: ocrResult.confidence,
            ocrRawText: ocrResult.rawText,
            ocrExtracted: ocrResult.extracted,
          },
        },
      );

      results.push({ fileId, success: true });
    } catch (error: any) {
      results.push({ fileId, success: false, error: error.message });
    }
  }

  return { processed: results.length, results };
});

// ─── Large import handler ────────────────────────────────────────────
jobQueue.registerHandler(JOB_TYPES.LARGE_IMPORT, async (payload) => {
  const { rows, fileName, businessId, userId } = payload;
  const { default: Expense } = await import("@/lib/models/Expense");
  const { default: ExpenseImportLog } =
    await import("@/lib/models/ExpenseImportLog");

  await dbConnect();

  let successCount = 0;
  let errorCount = 0;
  const errors: Array<{ row: number; field: string; message: string }> = [];
  const BATCH_SIZE = 50;

  // Process in batches
  for (let i = 0; i < rows.length; i += BATCH_SIZE) {
    const batch = rows.slice(i, i + BATCH_SIZE);
    const validExpenses: any[] = [];

    for (let j = 0; j < batch.length; j++) {
      const row = batch[j];
      const rowIndex = i + j + 1;

      try {
        if (!row.description || !row.amount || isNaN(parseFloat(row.amount))) {
          errors.push({
            row: rowIndex,
            field: "description/amount",
            message: "Description and valid amount are required",
          });
          errorCount++;
          continue;
        }

        validExpenses.push({
          description: String(row.description).trim(),
          amount: parseFloat(row.amount),
          category: row.category ? String(row.category).trim() : undefined,
          date: row.date ? new Date(row.date) : new Date(),
          notes: row.notes ? String(row.notes).trim() : undefined,
          paymentMethod: row.paymentMethod || "cash",
          source: "import",
          business: businessId,
          user: userId,
        });
      } catch (err: any) {
        errors.push({ row: rowIndex, field: "parse", message: err.message });
        errorCount++;
      }
    }

    if (validExpenses.length > 0) {
      try {
        await Expense.insertMany(validExpenses, { ordered: false });
        successCount += validExpenses.length;
      } catch (bulkError: any) {
        // Some may have succeeded in unordered insert
        if (bulkError.insertedDocs) {
          successCount += bulkError.insertedDocs.length;
        }
        errorCount +=
          validExpenses.length - (bulkError.insertedDocs?.length || 0);
      }
    }
  }

  // Log the import
  const status =
    errorCount === 0 ? "success" : successCount === 0 ? "failed" : "partial";
  await ExpenseImportLog.create({
    business: businessId,
    user: userId,
    fileName,
    totalRows: rows.length,
    successCount,
    errorCount,
    errors: errors.slice(0, 50), // limit stored errors
    status,
  });

  return { successCount, errorCount, errors: errors.slice(0, 20), status };
});

// ─── Complex report handler ─────────────────────────────────────────
jobQueue.registerHandler(JOB_TYPES.COMPLEX_REPORT, async (payload) => {
  const { businessId, reportType, params } = payload;
  const { default: Expense } = await import("@/lib/models/Expense");

  await dbConnect();

  // Generate complex aggregations based on report type
  if (reportType === "annual_summary") {
    const year = params.year || new Date().getFullYear();
    const yearStart = new Date(year, 0, 1);
    const yearEnd = new Date(year, 11, 31, 23, 59, 59);

    const [monthly, byCategory, byPayment, bySource] = await Promise.all([
      Expense.aggregate([
        {
          $match: {
            business: businessId,
            date: { $gte: yearStart, $lte: yearEnd },
          },
        },
        {
          $group: {
            _id: { month: { $month: "$date" } },
            total: { $sum: "$amount" },
            count: { $sum: 1 },
          },
        },
        { $sort: { "_id.month": 1 } },
      ]),
      Expense.aggregate([
        {
          $match: {
            business: businessId,
            date: { $gte: yearStart, $lte: yearEnd },
          },
        },
        {
          $group: {
            _id: "$category",
            total: { $sum: "$amount" },
            count: { $sum: 1 },
          },
        },
        { $sort: { total: -1 } },
      ]),
      Expense.aggregate([
        {
          $match: {
            business: businessId,
            date: { $gte: yearStart, $lte: yearEnd },
          },
        },
        {
          $group: {
            _id: "$paymentMethod",
            total: { $sum: "$amount" },
            count: { $sum: 1 },
          },
        },
        { $sort: { total: -1 } },
      ]),
      Expense.aggregate([
        {
          $match: {
            business: businessId,
            date: { $gte: yearStart, $lte: yearEnd },
          },
        },
        {
          $group: {
            _id: "$source",
            total: { $sum: "$amount" },
            count: { $sum: 1 },
          },
        },
      ]),
    ]);

    return { year, monthly, byCategory, byPayment, bySource };
  }

  return { error: "Unknown report type" };
});

// ─── Budget alerts handler ───────────────────────────────────────────
jobQueue.registerHandler(JOB_TYPES.BUDGET_ALERTS, async (payload) => {
  const { businessId } = payload;
  const { checkBudgetAlerts } =
    await import("@/lib/services/budgetAlertService");
  return checkBudgetAlerts(businessId);
});

// ─── Recurring expense generation handler ────────────────────────────
jobQueue.registerHandler(JOB_TYPES.RECURRING_EXPENSE_GENERATION, async () => {
  const { generateRecurringExpenses } = await import("@/lib/services/cronJobs");
  return generateRecurringExpenses();
});

export { jobQueue, JOB_TYPES };

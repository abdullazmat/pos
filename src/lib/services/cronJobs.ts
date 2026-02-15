/**
 * Cron job handlers for asynchronous expense management tasks.
 *
 * These are meant to be called from /api/cron/* endpoints
 * triggered by external schedulers (Vercel cron, GitHub Actions, etc.)
 */

import dbConnect from "@/lib/db/connect";
import RecurringExpense from "@/lib/models/RecurringExpense";
import Expense from "@/lib/models/Expense";
import Budget from "@/lib/models/Budget";
import { checkBudgetAlerts } from "@/lib/services/budgetAlertService";

interface GenerationResult {
  generated: number;
  pending: number;
  skipped: number;
  errors: string[];
}

/**
 * Generate expenses from all active recurring expense configs.
 * Should run daily via cron.
 */
export async function generateRecurringExpenses(): Promise<GenerationResult> {
  await dbConnect();

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const dayOfMonth = today.getDate();
  const dayOfWeek = today.getDay(); // 0=Sun, 1=Mon, ...

  const result: GenerationResult = {
    generated: 0,
    pending: 0,
    skipped: 0,
    errors: [],
  };

  // Find all active recurring expenses
  const recurringExpenses = await RecurringExpense.find({
    active: true,
    startDate: { $lte: today },
    $or: [{ endDate: null }, { endDate: { $gte: today } }],
  }).lean();

  for (const re of recurringExpenses as any[]) {
    try {
      const isDue = checkIfDue(re, today, dayOfMonth, dayOfWeek);
      if (!isDue) {
        result.skipped++;
        continue;
      }

      // Check if already generated today
      const alreadyGenerated =
        re.lastGeneratedDate &&
        new Date(re.lastGeneratedDate).toDateString() === today.toDateString();
      if (alreadyGenerated) {
        result.skipped++;
        continue;
      }

      if (re.requiresConfirmation) {
        result.pending++;
        continue;
      }

      // Auto-generate expense
      await Expense.create({
        description: re.description,
        amount: re.baseAmount,
        category: re.category,
        date: today,
        paymentMethod: re.paymentMethod || "cash",
        notes: re.notes
          ? `[Auto] ${re.notes}`
          : `[Auto] Gasto recurrente - ${re.frequency}`,
        source: "recurring",
        recurringExpenseId: re._id,
        business: re.business,
        user: re.user,
      });

      await RecurringExpense.updateOne(
        { _id: re._id },
        { $set: { lastGeneratedDate: today } },
      );

      result.generated++;
    } catch (error: any) {
      result.errors.push(`${re.description}: ${error.message}`);
    }
  }

  return result;
}

/**
 * Check if a recurring expense is due today.
 */
function checkIfDue(
  re: any,
  today: Date,
  dayOfMonth: number,
  dayOfWeek: number,
): boolean {
  switch (re.frequency) {
    case "monthly": {
      // Handle months with fewer days (e.g., executionDay=31 in February)
      const lastDay = new Date(
        today.getFullYear(),
        today.getMonth() + 1,
        0,
      ).getDate();
      const effectiveDay = Math.min(re.executionDay, lastDay);
      return dayOfMonth === effectiveDay;
    }
    case "weekly":
      return dayOfWeek === re.executionDay % 7; // executionDay 1-7 maps to weekday
    case "biweekly": {
      // Every 2 weeks from startDate
      const startMs = new Date(re.startDate).getTime();
      const todayMs = today.getTime();
      const daysDiff = Math.floor((todayMs - startMs) / 86400000);
      return daysDiff >= 0 && daysDiff % 14 === 0;
    }
    case "annual": {
      const startDate = new Date(re.startDate);
      return (
        today.getMonth() === startDate.getMonth() &&
        dayOfMonth ===
          Math.min(
            re.executionDay,
            new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate(),
          )
      );
    }
    default:
      return false;
  }
}

/**
 * Run budget alert checks for all businesses with active budgets.
 * Should run daily or hourly via cron.
 */
export async function runBudgetAlertChecks(): Promise<{
  businessesChecked: number;
  alertsTriggered: number;
  errors: string[];
}> {
  await dbConnect();

  const now = new Date();
  const year = now.getFullYear();

  // Get all unique business IDs with active budgets
  const businesses = await Budget.distinct("business", { year });

  let alertsTriggered = 0;
  const errors: string[] = [];

  for (const businessId of businesses) {
    try {
      const alerts = await checkBudgetAlerts(String(businessId));
      alertsTriggered += alerts.length;
    } catch (error: any) {
      errors.push(`Business ${businessId}: ${error.message}`);
    }
  }

  return {
    businessesChecked: businesses.length,
    alertsTriggered,
    errors,
  };
}

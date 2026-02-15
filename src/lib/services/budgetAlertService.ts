import dbConnect from "@/lib/db/connect";
import Budget from "@/lib/models/Budget";
import BudgetAlert from "@/lib/models/BudgetAlert";
import Expense from "@/lib/models/Expense";
import User from "@/lib/models/User";
import { sendEmail } from "@/lib/utils/sendEmail";

interface AlertInfo {
  budgetId: string;
  category: string;
  level: 80 | 100;
  percentage: number;
  spent: number;
  limitAmount: number;
  period: string;
  year: number;
  month?: number;
  businessId: string;
  userId: string;
}

/**
 * Check all budgets for a business and trigger alerts when thresholds are crossed.
 * Creates BudgetAlert records and optionally sends email notifications.
 */
export async function checkBudgetAlerts(
  businessId: string,
): Promise<AlertInfo[]> {
  await dbConnect();

  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;

  const budgets = await Budget.find({
    business: businessId,
    year,
    $or: [
      { period: "monthly", month },
      { period: "quarterly" },
      { period: "annual" },
    ],
  }).lean();

  if (budgets.length === 0) return [];

  // Aggregate spending per category for the year
  const categories = [...new Set(budgets.map((b: any) => b.category))];
  const yearStart = new Date(year, 0, 1);
  const yearEnd = new Date(year, 11, 31, 23, 59, 59);

  const spending = await Expense.aggregate([
    {
      $match: {
        business: businessId,
        category: { $in: categories },
        date: { $gte: yearStart, $lte: yearEnd },
      },
    },
    {
      $group: {
        _id: { category: "$category", month: { $month: "$date" } },
        total: { $sum: "$amount" },
      },
    },
  ]);

  const spendingMap: Record<string, Record<number, number>> = {};
  for (const s of spending) {
    if (!spendingMap[s._id.category]) spendingMap[s._id.category] = {};
    spendingMap[s._id.category][s._id.month] = s.total;
  }

  const triggeredAlerts: AlertInfo[] = [];

  for (const budget of budgets as any[]) {
    let spent = 0;
    const monthlyData = spendingMap[budget.category] || {};

    if (budget.period === "monthly") {
      spent = monthlyData[month] || 0;
    } else if (budget.period === "quarterly") {
      const quarter = Math.ceil(month / 3);
      const qStart = (quarter - 1) * 3 + 1;
      for (let m = qStart; m < qStart + 3; m++) {
        spent += monthlyData[m] || 0;
      }
    } else {
      for (let m = 1; m <= 12; m++) {
        spent += monthlyData[m] || 0;
      }
    }

    const percentage =
      budget.limitAmount > 0 ? (spent / budget.limitAmount) * 100 : 0;

    // Check 100% threshold
    if (percentage >= 100 && !budget.alert100Sent) {
      const alert: AlertInfo = {
        budgetId: String(budget._id),
        category: budget.category,
        level: 100,
        percentage: Math.round(percentage * 10) / 10,
        spent: Math.round(spent * 100) / 100,
        limitAmount: budget.limitAmount,
        period: budget.period,
        year: budget.year,
        month: budget.month,
        businessId: String(budget.business),
        userId: String(budget.user),
      };

      await Budget.updateOne(
        { _id: budget._id },
        { $set: { alert100Sent: true } },
      );
      await persistAlert(alert);

      if (budget.emailAlerts) {
        await sendAlertEmail(alert);
      }

      triggeredAlerts.push(alert);
    }
    // Check 80% threshold
    else if (percentage >= 80 && percentage < 100 && !budget.alert80Sent) {
      const alert: AlertInfo = {
        budgetId: String(budget._id),
        category: budget.category,
        level: 80,
        percentage: Math.round(percentage * 10) / 10,
        spent: Math.round(spent * 100) / 100,
        limitAmount: budget.limitAmount,
        period: budget.period,
        year: budget.year,
        month: budget.month,
        businessId: String(budget.business),
        userId: String(budget.user),
      };

      await Budget.updateOne(
        { _id: budget._id },
        { $set: { alert80Sent: true } },
      );
      await persistAlert(alert);

      if (budget.emailAlerts) {
        await sendAlertEmail(alert);
      }

      triggeredAlerts.push(alert);
    }
  }

  return triggeredAlerts;
}

/**
 * Persist a budget alert record to the database.
 */
async function persistAlert(alert: AlertInfo): Promise<void> {
  try {
    await BudgetAlert.create({
      budget: alert.budgetId,
      category: alert.category,
      level: alert.level,
      percentage: alert.percentage,
      spent: alert.spent,
      limitAmount: alert.limitAmount,
      period: alert.period,
      year: alert.year,
      month: alert.month,
      business: alert.businessId,
      user: alert.userId,
    });
  } catch (error) {
    console.error("Failed to persist budget alert:", error);
  }
}

/**
 * Send a budget alert email notification.
 */
async function sendAlertEmail(alert: AlertInfo): Promise<void> {
  try {
    const user = (await User.findById(alert.userId)
      .select("email fullName")
      .lean()) as any;
    if (!user?.email) {
      console.warn(
        `No email found for user ${alert.userId}, skipping budget alert email`,
      );
      return;
    }

    const periodLabels: Record<string, string> = {
      monthly: "mensual",
      quarterly: "trimestral",
      annual: "anual",
    };
    const periodLabel = periodLabels[alert.period] || alert.period;
    const isOverBudget = alert.level >= 100;

    const subject = isOverBudget
      ? `⚠️ Presupuesto excedido: ${alert.category}`
      : `⚡ Alerta de presupuesto: ${alert.category} al ${alert.percentage}%`;

    const html = `
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="margin:0;padding:0;font-family:Arial,sans-serif;background:#f4f4f4;">
        <table role="presentation" style="width:100%;border-collapse:collapse;">
          <tr>
            <td align="center" style="padding:40px 0;">
              <table role="presentation" style="width:600px;border-collapse:collapse;background:#fff;border-radius:8px;box-shadow:0 2px 4px rgba(0,0,0,0.1);">
                <tr>
                  <td style="padding:30px;text-align:center;background:${isOverBudget ? "linear-gradient(135deg,#dc2626,#b91c1c)" : "linear-gradient(135deg,#f59e0b,#d97706)"};border-radius:8px 8px 0 0;">
                    <h1 style="margin:0;color:#fff;font-size:24px;">
                      ${isOverBudget ? "🚨 Presupuesto Excedido" : "⚡ Alerta de Presupuesto"}
                    </h1>
                  </td>
                </tr>
                <tr>
                  <td style="padding:30px;">
                    ${user.fullName ? `<p style="margin:0 0 15px;font-size:16px;color:#333;">Hola ${user.fullName},</p>` : ""}
                    <p style="margin:0 0 20px;font-size:16px;color:#333;line-height:1.6;">
                      ${
                        isOverBudget
                          ? `El presupuesto <strong>${periodLabel}</strong> para la categoría <strong>${alert.category}</strong> ha sido excedido.`
                          : `El presupuesto <strong>${periodLabel}</strong> para la categoría <strong>${alert.category}</strong> ha alcanzado el <strong>${alert.percentage}%</strong>.`
                      }
                    </p>
                    <table style="width:100%;border-collapse:collapse;margin:20px 0;">
                      <tr>
                        <td style="padding:10px 15px;background:#f8f9fa;border-radius:4px;">
                          <strong>Categoría:</strong> ${alert.category}
                        </td>
                      </tr>
                      <tr>
                        <td style="padding:10px 15px;">
                          <strong>Presupuesto:</strong> $${alert.limitAmount.toLocaleString("es-AR", { minimumFractionDigits: 2 })}
                        </td>
                      </tr>
                      <tr>
                        <td style="padding:10px 15px;background:#f8f9fa;border-radius:4px;">
                          <strong>Gastado:</strong> $${alert.spent.toLocaleString("es-AR", { minimumFractionDigits: 2 })}
                        </td>
                      </tr>
                      <tr>
                        <td style="padding:10px 15px;">
                          <strong>Porcentaje:</strong> <span style="color:${isOverBudget ? "#dc2626" : "#f59e0b"};font-weight:bold;">${alert.percentage}%</span>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding:10px 15px;background:#f8f9fa;border-radius:4px;">
                          <strong>Período:</strong> ${periodLabel} ${alert.year}${alert.month ? ` (mes ${alert.month})` : ""}
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td style="padding:20px 30px;text-align:center;background:#f8f9fa;border-radius:0 0 8px 8px;border-top:1px solid #e5e7eb;">
                    <p style="margin:0;font-size:12px;color:#999;">
                      POS SaaS — Gestión de Presupuestos
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `;

    await sendEmail({ to: user.email, subject, html });

    // Record that email was sent
    await BudgetAlert.updateOne(
      { budget: alert.budgetId, level: alert.level },
      { $set: { emailSent: true, emailSentAt: new Date() } },
    );
  } catch (error: any) {
    console.error("Failed to send budget alert email:", error);
    // Record the error
    await BudgetAlert.updateOne(
      { budget: alert.budgetId, level: alert.level },
      { $set: { emailError: error.message || "Unknown error" } },
    );
  }
}

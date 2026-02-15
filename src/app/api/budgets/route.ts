import { NextResponse } from "next/server";
import dbConnect from "@/lib/db/connect";
import Budget from "@/lib/models/Budget";
import BudgetAlert from "@/lib/models/BudgetAlert";
import Expense from "@/lib/models/Expense";
import { verifyToken } from "@/lib/utils/jwt";
import { checkBudgetAlerts } from "@/lib/services/budgetAlertService";

// GET — list budgets + spending for current period, or by ?year=&month=
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

    const { searchParams } = new URL(request.url);
    const now = new Date();
    const year = parseInt(
      searchParams.get("year") || String(now.getFullYear()),
    );
    const month = parseInt(
      searchParams.get("month") || String(now.getMonth() + 1),
    );

    await dbConnect();

    // Fetch all budgets for the business + year
    const budgets = await Budget.find({
      business: decoded.businessId,
      year,
      $or: [
        { period: "monthly", month },
        { period: "quarterly" },
        { period: "annual" },
      ],
    }).lean();

    // Calculate actual spending per category for the requested period
    const dateRanges: Record<string, { start: Date; end: Date }> = {};

    for (const b of budgets) {
      const key = `${b.category}_${b.period}`;
      if (b.period === "monthly") {
        dateRanges[key] = {
          start: new Date(year, month - 1, 1),
          end: new Date(year, month, 0, 23, 59, 59),
        };
      } else if (b.period === "quarterly") {
        const quarter = Math.ceil(month / 3);
        const qStart = (quarter - 1) * 3;
        dateRanges[key] = {
          start: new Date(year, qStart, 1),
          end: new Date(year, qStart + 3, 0, 23, 59, 59),
        };
      } else {
        dateRanges[key] = {
          start: new Date(year, 0, 1),
          end: new Date(year, 11, 31, 23, 59, 59),
        };
      }
    }

    // Aggregate spending grouped by category
    const categories = [...new Set(budgets.map((b) => b.category))];
    const yearStart = new Date(year, 0, 1);
    const yearEnd = new Date(year, 11, 31, 23, 59, 59);

    const spending = await Expense.aggregate([
      {
        $match: {
          business: decoded.businessId,
          category: { $in: categories },
          date: { $gte: yearStart, $lte: yearEnd },
        },
      },
      {
        $group: {
          _id: {
            category: "$category",
            month: { $month: "$date" },
          },
          total: { $sum: "$amount" },
        },
      },
    ]);

    // Build spending lookup: category -> { monthly: {1: x, 2: y, ...} }
    const spendingMap: Record<string, Record<number, number>> = {};
    for (const s of spending) {
      if (!spendingMap[s._id.category]) spendingMap[s._id.category] = {};
      spendingMap[s._id.category][s._id.month] = s.total;
    }

    // Build response with percentage consumed
    const budgetCards = budgets.map((b) => {
      let spent = 0;
      const monthlyData = spendingMap[b.category] || {};

      if (b.period === "monthly") {
        spent = monthlyData[month] || 0;
      } else if (b.period === "quarterly") {
        const quarter = Math.ceil(month / 3);
        const qStart = (quarter - 1) * 3 + 1;
        for (let m = qStart; m < qStart + 3; m++) {
          spent += monthlyData[m] || 0;
        }
      } else {
        // annual
        for (let m = 1; m <= 12; m++) {
          spent += monthlyData[m] || 0;
        }
      }

      const percentage = b.limitAmount > 0 ? (spent / b.limitAmount) * 100 : 0;

      return {
        _id: b._id,
        category: b.category,
        period: b.period,
        limitAmount: b.limitAmount,
        month: b.month,
        year: b.year,
        alert80Sent: b.alert80Sent,
        alert100Sent: b.alert100Sent,
        emailAlerts: b.emailAlerts,
        spent: Math.round(spent * 100) / 100,
        percentage: Math.round(percentage * 10) / 10,
        remaining: Math.round((b.limitAmount - spent) * 100) / 100,
      };
    });

    // Check and trigger alerts (persisted + email) via service
    let alertsTriggered: { category: string; level: number }[] = [];
    try {
      const alerts = await checkBudgetAlerts(decoded.businessId);
      alertsTriggered = alerts.map((a) => ({
        category: a.category,
        level: a.level,
      }));
    } catch (alertError) {
      console.error("Budget alert check failed:", alertError);
    }

    // Fetch recent alert history for this business
    const recentAlerts = await BudgetAlert.find({
      business: decoded.businessId,
      year,
    })
      .sort({ createdAt: -1 })
      .limit(20)
      .lean();

    return NextResponse.json({
      budgets: budgetCards,
      alerts: alertsTriggered,
      alertHistory: recentAlerts,
      year,
      month,
    });
  } catch (error) {
    console.error("Get budgets error:", error);
    return NextResponse.json(
      { error: "Failed to fetch budgets" },
      { status: 500 },
    );
  }
}

// POST — create a new budget
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
    const { category, period, limitAmount, month, year, emailAlerts } = body;

    if (!category || !limitAmount || !year) {
      return NextResponse.json(
        { error: "Category, limit amount, and year are required" },
        { status: 400 },
      );
    }
    if (period === "monthly" && !month) {
      return NextResponse.json(
        { error: "Month is required for monthly budgets" },
        { status: 400 },
      );
    }

    await dbConnect();

    // Check for duplicate
    const existingFilter: any = {
      business: decoded.businessId,
      category,
      period: period || "monthly",
      year,
    };
    if (period === "monthly") existingFilter.month = month;

    const existing = await Budget.findOne(existingFilter);
    if (existing) {
      return NextResponse.json(
        { error: "Budget already exists for this category/period" },
        { status: 409 },
      );
    }

    const budget = await Budget.create({
      category,
      period: period || "monthly",
      limitAmount: parseFloat(limitAmount),
      month: period === "monthly" ? month : undefined,
      year,
      emailAlerts: !!emailAlerts,
      business: decoded.businessId,
      user: decoded.userId,
    });

    return NextResponse.json({ budget }, { status: 201 });
  } catch (error) {
    console.error("Create budget error:", error);
    return NextResponse.json(
      { error: "Failed to create budget" },
      { status: 500 },
    );
  }
}

// PUT — update a budget
export async function PUT(request: Request) {
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
    const { id, limitAmount, emailAlerts } = body;

    if (!id) {
      return NextResponse.json(
        { error: "Budget ID is required" },
        { status: 400 },
      );
    }

    await dbConnect();

    const updateData: any = {};
    if (limitAmount !== undefined)
      updateData.limitAmount = parseFloat(limitAmount);
    if (emailAlerts !== undefined) updateData.emailAlerts = emailAlerts;

    // Reset alerts if limit changes
    if (limitAmount !== undefined) {
      updateData.alert80Sent = false;
      updateData.alert100Sent = false;
    }

    const budget = await Budget.findOneAndUpdate(
      { _id: id, business: decoded.businessId },
      { $set: updateData },
      { new: true },
    );

    if (!budget) {
      return NextResponse.json({ error: "Budget not found" }, { status: 404 });
    }

    return NextResponse.json({ budget });
  } catch (error) {
    console.error("Update budget error:", error);
    return NextResponse.json(
      { error: "Failed to update budget" },
      { status: 500 },
    );
  }
}

// DELETE — remove a budget
export async function DELETE(request: Request) {
  try {
    const token = request.headers.get("authorization")?.split(" ")[1];
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Budget ID is required" },
        { status: 400 },
      );
    }

    await dbConnect();

    const budget = await Budget.findOneAndDelete({
      _id: id,
      business: decoded.businessId,
    });

    if (!budget) {
      return NextResponse.json({ error: "Budget not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Budget deleted successfully" });
  } catch (error) {
    console.error("Delete budget error:", error);
    return NextResponse.json(
      { error: "Failed to delete budget" },
      { status: 500 },
    );
  }
}

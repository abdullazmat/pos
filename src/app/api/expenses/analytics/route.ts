import { NextResponse } from "next/server";
import mongoose from "mongoose";
import dbConnect from "@/lib/db/connect";
import Expense from "@/lib/models/Expense";
import { verifyToken } from "@/lib/utils/jwt";

// Helper: get date range from period string
function getDateRange(period: string): { start: Date; end: Date } {
  const now = new Date();
  const end = new Date(
    now.getFullYear(),
    now.getMonth() + 1,
    0,
    23,
    59,
    59,
    999,
  );
  let start: Date;

  switch (period) {
    case "this_month":
      start = new Date(now.getFullYear(), now.getMonth(), 1);
      break;
    case "last_month":
      start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      break;
    case "last_3_months":
      start = new Date(now.getFullYear(), now.getMonth() - 2, 1);
      break;
    case "last_6_months":
      start = new Date(now.getFullYear(), now.getMonth() - 5, 1);
      break;
    case "last_12_months":
      start = new Date(now.getFullYear() - 1, now.getMonth() + 1, 1);
      break;
    default:
      start = new Date(now.getFullYear(), now.getMonth(), 1);
  }

  return { start, end };
}

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

    const { searchParams } = new URL(request.url);
    const report = searchParams.get("report") || "all";
    const period = searchParams.get("period") || "this_month";
    const { start, end } = getDateRange(period);
    const businessId = new mongoose.Types.ObjectId(decoded.businessId);

    const results: Record<string, unknown> = {};

    // ─── Category Distribution ─────────────────────────────────────
    if (report === "all" || report === "category_distribution") {
      const categoryAgg = await Expense.aggregate([
        {
          $match: {
            business: businessId,
            date: { $gte: start, $lte: end },
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
      ]);

      const grandTotal = categoryAgg.reduce(
        (s: number, c: { total: number }) => s + c.total,
        0,
      );

      results.categoryDistribution = categoryAgg.map(
        (c: { _id: string; total: number; count: number }) => ({
          category: c._id || "Sin categoría",
          total: Math.round(c.total * 100) / 100,
          count: c.count,
          percentage:
            grandTotal > 0
              ? Math.round((c.total / grandTotal) * 10000) / 100
              : 0,
        }),
      );
      results.categoryGrandTotal = Math.round(grandTotal * 100) / 100;
    }

    // ─── Monthly Trends (last 12 months) ───────────────────────────
    if (report === "all" || report === "monthly_trends") {
      const twelveMonthsAgo = new Date();
      twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 11);
      twelveMonthsAgo.setDate(1);
      twelveMonthsAgo.setHours(0, 0, 0, 0);

      const monthlyAgg = await Expense.aggregate([
        {
          $match: {
            business: businessId,
            date: { $gte: twelveMonthsAgo },
          },
        },
        {
          $group: {
            _id: {
              year: { $year: "$date" },
              month: { $month: "$date" },
            },
            total: { $sum: "$amount" },
            count: { $sum: 1 },
          },
        },
        { $sort: { "_id.year": 1, "_id.month": 1 } },
      ]);

      // Also get per-category monthly breakdown
      const monthlyCategoryAgg = await Expense.aggregate([
        {
          $match: {
            business: businessId,
            date: { $gte: twelveMonthsAgo },
          },
        },
        {
          $group: {
            _id: {
              year: { $year: "$date" },
              month: { $month: "$date" },
              category: "$category",
            },
            total: { $sum: "$amount" },
          },
        },
        { $sort: { "_id.year": 1, "_id.month": 1 } },
      ]);

      // Build month labels for last 12 months
      const months = [];
      for (let i = 11; i >= 0; i--) {
        const d = new Date();
        d.setMonth(d.getMonth() - i);
        months.push({ year: d.getFullYear(), month: d.getMonth() + 1 });
      }

      const monthlyTrends = months.map((m) => {
        const match = monthlyAgg.find(
          (a: { _id: { year: number; month: number } }) =>
            a._id.year === m.year && a._id.month === m.month,
        );
        return {
          year: m.year,
          month: m.month,
          label: `${m.year}-${String(m.month).padStart(2, "0")}`,
          total: match ? Math.round(match.total * 100) / 100 : 0,
          count: match ? match.count : 0,
        };
      });

      // Calculate mean and stdev for spike detection
      const totals = monthlyTrends.map((m: { total: number }) => m.total);
      const mean =
        totals.reduce((s: number, v: number) => s + v, 0) / totals.length;
      const stdev = Math.sqrt(
        totals.reduce((s: number, v: number) => s + Math.pow(v - mean, 2), 0) /
          totals.length,
      );

      results.monthlyTrends = monthlyTrends.map((m) => ({
        ...m,
        isSpike: m.total > mean + 2 * stdev,
      }));

      // Collect unique categories from the data
      const categorySet = new Set<string>();
      monthlyCategoryAgg.forEach((item: { _id: { category?: string } }) => {
        categorySet.add(item._id.category || "Sin categoría");
      });

      results.monthlyCategoryBreakdown = months.map((m) => {
        const entry: Record<string, number | string> = {
          label: `${m.year}-${String(m.month).padStart(2, "0")}`,
        };
        categorySet.forEach((cat) => {
          const match = monthlyCategoryAgg.find(
            (a: { _id: { year: number; month: number; category?: string } }) =>
              a._id.year === m.year &&
              a._id.month === m.month &&
              (a._id.category || "Sin categoría") === cat,
          );
          entry[cat] = match ? Math.round(match.total * 100) / 100 : 0;
        });
        return entry;
      });
      results.trendCategories = Array.from(categorySet);
    }

    // ─── Year-over-Year Comparison ─────────────────────────────────
    if (report === "all" || report === "year_over_year") {
      const now = new Date();
      const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      const thisMonthEnd = new Date(
        now.getFullYear(),
        now.getMonth() + 1,
        0,
        23,
        59,
        59,
        999,
      );
      const lastYearMonthStart = new Date(
        now.getFullYear() - 1,
        now.getMonth(),
        1,
      );
      const lastYearMonthEnd = new Date(
        now.getFullYear() - 1,
        now.getMonth() + 1,
        0,
        23,
        59,
        59,
        999,
      );

      const [currentYearCats, lastYearCats] = await Promise.all([
        Expense.aggregate([
          {
            $match: {
              business: businessId,
              date: { $gte: thisMonthStart, $lte: thisMonthEnd },
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
              date: { $gte: lastYearMonthStart, $lte: lastYearMonthEnd },
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
      ]);

      // Merge categories
      const allCats = new Set<string>();
      currentYearCats.forEach((c: { _id: string }) =>
        allCats.add(c._id || "Sin categoría"),
      );
      lastYearCats.forEach((c: { _id: string }) =>
        allCats.add(c._id || "Sin categoría"),
      );

      const yearOverYear = Array.from(allCats).map((cat) => {
        const current = currentYearCats.find(
          (c: { _id: string }) => (c._id || "Sin categoría") === cat,
        );
        const last = lastYearCats.find(
          (c: { _id: string }) => (c._id || "Sin categoría") === cat,
        );
        const currentTotal = current
          ? Math.round(current.total * 100) / 100
          : 0;
        const lastTotal = last ? Math.round(last.total * 100) / 100 : 0;
        const variation =
          lastTotal > 0
            ? Math.round(((currentTotal - lastTotal) / lastTotal) * 10000) / 100
            : currentTotal > 0
              ? 100
              : 0;

        return {
          category: cat,
          currentYear: currentTotal,
          lastYear: lastTotal,
          variation,
        };
      });

      const currentTotal = yearOverYear.reduce((s, c) => s + c.currentYear, 0);
      const lastTotal = yearOverYear.reduce((s, c) => s + c.lastYear, 0);
      const totalVariation =
        lastTotal > 0
          ? Math.round(((currentTotal - lastTotal) / lastTotal) * 10000) / 100
          : currentTotal > 0
            ? 100
            : 0;

      results.yearOverYear = {
        categories: yearOverYear,
        currentTotal: Math.round(currentTotal * 100) / 100,
        lastTotal: Math.round(lastTotal * 100) / 100,
        totalVariation,
        currentMonth: now.getMonth() + 1,
        currentYear: now.getFullYear(),
      };
    }

    // ─── Unusual Expenses (2 stdev above category mean) ────────────
    if (report === "all" || report === "unusual_expenses") {
      // Get per-category stats over the last 12 months
      const twelveMonthsAgo = new Date();
      twelveMonthsAgo.setFullYear(twelveMonthsAgo.getFullYear() - 1);

      const categoryStats = await Expense.aggregate([
        {
          $match: {
            business: businessId,
            date: { $gte: twelveMonthsAgo },
          },
        },
        {
          $group: {
            _id: "$category",
            mean: { $avg: "$amount" },
            count: { $sum: 1 },
            amounts: { $push: "$amount" },
          },
        },
      ]);

      // Compute stdev for each category
      const statsMap = new Map<string, { mean: number; stdev: number }>();
      categoryStats.forEach(
        (cat: { _id: string; mean: number; amounts: number[] }) => {
          const catMean = cat.mean;
          const variance =
            cat.amounts.reduce(
              (s: number, a: number) => s + Math.pow(a - catMean, 2),
              0,
            ) / cat.amounts.length;
          const stdev = Math.sqrt(variance);
          statsMap.set(cat._id || "Sin categoría", { mean: catMean, stdev });
        },
      );

      // Find expenses in the selected period that are > mean + 2*stdev
      const expenses = await Expense.find({
        business: businessId,
        date: { $gte: start, $lte: end },
      })
        .sort({ amount: -1 })
        .lean();

      const unusual = expenses
        .filter((exp: Record<string, unknown>) => {
          const stats = statsMap.get(
            (exp.category as string) || "Sin categoría",
          );
          if (!stats || stats.stdev === 0) return false;
          return (exp.amount as number) > stats.mean + 2 * stats.stdev;
        })
        .map((exp: Record<string, unknown>) => {
          const stats = statsMap.get(
            (exp.category as string) || "Sin categoría",
          )!;
          const amount = exp.amount as number;
          return {
            _id: exp._id,
            description: exp.description,
            amount: Math.round(amount * 100) / 100,
            category: (exp.category as string) || "Sin categoría",
            date: exp.date,
            paymentMethod: exp.paymentMethod,
            categoryMean: Math.round(stats.mean * 100) / 100,
            categoryStdev: Math.round(stats.stdev * 100) / 100,
            deviations:
              Math.round(((amount - stats.mean) / stats.stdev) * 100) / 100,
          };
        });

      results.unusualExpenses = unusual;
    }

    // ─── Top Expenses ──────────────────────────────────────────────
    if (report === "all" || report === "top_expenses") {
      const [topIndividual, topCategories] = await Promise.all([
        Expense.find({
          business: businessId,
          date: { $gte: start, $lte: end },
        })
          .sort({ amount: -1 })
          .limit(10)
          .lean(),
        Expense.aggregate([
          {
            $match: {
              business: businessId,
              date: { $gte: start, $lte: end },
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
          { $limit: 5 },
        ]),
      ]);

      results.topExpenses = topIndividual.map((e: Record<string, unknown>) => ({
        _id: e._id,
        description: e.description,
        amount: Math.round((e.amount as number) * 100) / 100,
        category: (e.category as string) || "Sin categoría",
        date: e.date,
        paymentMethod: e.paymentMethod,
      }));

      results.topCategories = topCategories.map(
        (c: { _id: string; total: number; count: number }) => ({
          category: c._id || "Sin categoría",
          total: Math.round(c.total * 100) / 100,
          count: c.count,
        }),
      );
    }

    // ─── Summary KPIs ──────────────────────────────────────────────
    if (report === "all") {
      const [kpiAgg] = await Expense.aggregate([
        {
          $match: {
            business: businessId,
            date: { $gte: start, $lte: end },
          },
        },
        {
          $group: {
            _id: null,
            total: { $sum: "$amount" },
            count: { $sum: 1 },
            avg: { $avg: "$amount" },
            max: { $max: "$amount" },
          },
        },
      ]);

      results.summary = kpiAgg
        ? {
            totalSpent: Math.round(kpiAgg.total * 100) / 100,
            count: kpiAgg.count,
            average: Math.round(kpiAgg.avg * 100) / 100,
            highest: Math.round(kpiAgg.max * 100) / 100,
          }
        : { totalSpent: 0, count: 0, average: 0, highest: 0 };
    }

    results.period = { start, end, label: period };

    return NextResponse.json(results);
  } catch (error) {
    console.error("Expense analytics error:", error);
    return NextResponse.json(
      { error: "Failed to fetch analytics" },
      { status: 500 },
    );
  }
}

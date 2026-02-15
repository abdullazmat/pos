import { NextResponse } from "next/server";
import dbConnect from "@/lib/db/connect";
import Expense from "@/lib/models/Expense";
import { verifyToken } from "@/lib/utils/jwt";

// GET /api/reports/trends — Monthly expense trends
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
    const months = parseInt(searchParams.get("months") || "12");
    const category = searchParams.get("category") || null;

    // Calculate date range for last N months
    const endDate = new Date(
      now.getFullYear(),
      now.getMonth() + 1,
      0,
      23,
      59,
      59,
    );
    const startDate = new Date(
      now.getFullYear(),
      now.getMonth() - months + 1,
      1,
    );

    await dbConnect();

    const matchFilter: Record<string, any> = {
      business: decoded.businessId,
      date: { $gte: startDate, $lte: endDate },
    };
    if (category) {
      matchFilter.category = category;
    }

    // Monthly totals
    const monthlyData = await Expense.aggregate([
      { $match: matchFilter },
      {
        $group: {
          _id: {
            year: { $year: "$date" },
            month: { $month: "$date" },
          },
          total: { $sum: "$amount" },
          count: { $sum: 1 },
          avgAmount: { $avg: "$amount" },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
    ]);

    // Monthly breakdown by category (top categories)
    const categoryBreakdown = await Expense.aggregate([
      { $match: matchFilter },
      {
        $group: {
          _id: {
            year: { $year: "$date" },
            month: { $month: "$date" },
            category: { $ifNull: ["$category", "Sin Categoría"] },
          },
          total: { $sum: "$amount" },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
    ]);

    // Fill all months (even those with zero expenses)
    const trend: Array<{
      year: number;
      month: number;
      label: string;
      total: number;
      count: number;
      avgAmount: number;
    }> = [];

    for (let i = 0; i < months; i++) {
      const d = new Date(now.getFullYear(), now.getMonth() - months + 1 + i, 1);
      const y = d.getFullYear();
      const m = d.getMonth() + 1;
      const existing = monthlyData.find(
        (md) => md._id.year === y && md._id.month === m,
      );
      trend.push({
        year: y,
        month: m,
        label: `${y}-${String(m).padStart(2, "0")}`,
        total: existing ? Math.round(existing.total * 100) / 100 : 0,
        count: existing ? existing.count : 0,
        avgAmount: existing ? Math.round(existing.avgAmount * 100) / 100 : 0,
      });
    }

    // Build category trend map
    const categoryTrends: Record<
      string,
      Array<{ label: string; total: number }>
    > = {};
    for (const item of categoryBreakdown) {
      const cat = item._id.category;
      if (!categoryTrends[cat]) categoryTrends[cat] = [];
      categoryTrends[cat].push({
        label: `${item._id.year}-${String(item._id.month).padStart(2, "0")}`,
        total: Math.round(item.total * 100) / 100,
      });
    }

    // Calculate moving average (3-month)
    const movingAvg: Array<{ label: string; avg: number }> = [];
    for (let i = 0; i < trend.length; i++) {
      if (i < 2) {
        movingAvg.push({ label: trend[i].label, avg: trend[i].total });
      } else {
        const avg =
          (trend[i].total + trend[i - 1].total + trend[i - 2].total) / 3;
        movingAvg.push({
          label: trend[i].label,
          avg: Math.round(avg * 100) / 100,
        });
      }
    }

    // Detect spikes (> 2 standard deviations above mean)
    const totals = trend.map((t) => t.total).filter((t) => t > 0);
    const mean =
      totals.length > 0 ? totals.reduce((a, b) => a + b, 0) / totals.length : 0;
    const stdDev =
      totals.length > 1
        ? Math.sqrt(
            totals.reduce((sum, t) => sum + Math.pow(t - mean, 2), 0) /
              (totals.length - 1),
          )
        : 0;
    const spikeThreshold = mean + 2 * stdDev;

    const spikes = trend
      .filter((t) => t.total > spikeThreshold && spikeThreshold > 0)
      .map((t) => ({
        label: t.label,
        total: t.total,
        deviation: Math.round(((t.total - mean) / (stdDev || 1)) * 10) / 10,
      }));

    // Year-over-year comparison
    const currentYearTotal = trend
      .filter((t) => t.year === now.getFullYear())
      .reduce((sum, t) => sum + t.total, 0);
    const prevYearStart = new Date(now.getFullYear() - 1, 0, 1);
    const prevYearEnd = new Date(now.getFullYear() - 1, 11, 31, 23, 59, 59);

    const prevYearAgg = await Expense.aggregate([
      {
        $match: {
          business: decoded.businessId,
          date: { $gte: prevYearStart, $lte: prevYearEnd },
          ...(category ? { category } : {}),
        },
      },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);
    const previousYearTotal = prevYearAgg.length > 0 ? prevYearAgg[0].total : 0;
    const yoyChange =
      previousYearTotal > 0
        ? Math.round(
            ((currentYearTotal - previousYearTotal) / previousYearTotal) * 1000,
          ) / 10
        : null;

    return NextResponse.json({
      period: {
        months,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        category: category || "all",
      },
      trend,
      movingAverage: movingAvg,
      spikes,
      categoryTrends,
      summary: {
        totalSpent:
          Math.round(trend.reduce((s, t) => s + t.total, 0) * 100) / 100,
        totalCount: trend.reduce((s, t) => s + t.count, 0),
        monthlyAverage: Math.round(mean * 100) / 100,
        currentYearTotal: Math.round(currentYearTotal * 100) / 100,
        previousYearTotal: Math.round(previousYearTotal * 100) / 100,
        yoyChangePercent: yoyChange,
      },
    });
  } catch (error) {
    console.error("Trends report error:", error);
    return NextResponse.json(
      { error: "Failed to generate trends report" },
      { status: 500 },
    );
  }
}

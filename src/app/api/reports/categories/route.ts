import { NextResponse } from "next/server";
import dbConnect from "@/lib/db/connect";
import Expense from "@/lib/models/Expense";
import { verifyToken } from "@/lib/utils/jwt";

// GET /api/reports/categories — Category-based expense report
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
    const month = searchParams.get("month")
      ? parseInt(searchParams.get("month")!)
      : null;
    const quarter = searchParams.get("quarter")
      ? parseInt(searchParams.get("quarter")!)
      : null;

    // Determine date range
    let startDate: Date;
    let endDate: Date;
    let periodLabel: string;

    if (month) {
      startDate = new Date(year, month - 1, 1);
      endDate = new Date(year, month, 0, 23, 59, 59);
      periodLabel = `${year}-${String(month).padStart(2, "0")}`;
    } else if (quarter) {
      const qStart = (quarter - 1) * 3;
      startDate = new Date(year, qStart, 1);
      endDate = new Date(year, qStart + 3, 0, 23, 59, 59);
      periodLabel = `${year}-Q${quarter}`;
    } else {
      startDate = new Date(year, 0, 1);
      endDate = new Date(year, 11, 31, 23, 59, 59);
      periodLabel = `${year}`;
    }

    await dbConnect();

    // Aggregate expenses by category
    const categoryData = await Expense.aggregate([
      {
        $match: {
          business: decoded.businessId,
          date: { $gte: startDate, $lte: endDate },
        },
      },
      {
        $group: {
          _id: { $ifNull: ["$category", "Sin Categoría"] },
          total: { $sum: "$amount" },
          count: { $sum: 1 },
          avgAmount: { $avg: "$amount" },
          minAmount: { $min: "$amount" },
          maxAmount: { $max: "$amount" },
        },
      },
      { $sort: { total: -1 } },
    ]);

    // Calculate totals
    const grandTotal = categoryData.reduce((sum, c) => sum + c.total, 0);
    const totalCount = categoryData.reduce((sum, c) => sum + c.count, 0);

    // Build report with percentages
    const categories = categoryData.map((c) => ({
      category: c._id,
      total: Math.round(c.total * 100) / 100,
      count: c.count,
      avgAmount: Math.round(c.avgAmount * 100) / 100,
      minAmount: Math.round(c.minAmount * 100) / 100,
      maxAmount: Math.round(c.maxAmount * 100) / 100,
      percentage:
        grandTotal > 0 ? Math.round((c.total / grandTotal) * 1000) / 10 : 0,
    }));

    // Top 5 categories by amount
    const topCategories = categories.slice(0, 5);

    // Previous period comparison (same duration, shifted back)
    const duration = endDate.getTime() - startDate.getTime();
    const prevStart = new Date(startDate.getTime() - duration);
    const prevEnd = new Date(startDate.getTime() - 1);

    const prevTotal = await Expense.aggregate([
      {
        $match: {
          business: decoded.businessId,
          date: { $gte: prevStart, $lte: prevEnd },
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$amount" },
        },
      },
    ]);

    const previousPeriodTotal = prevTotal.length > 0 ? prevTotal[0].total : 0;
    const changePercent =
      previousPeriodTotal > 0
        ? Math.round(
            ((grandTotal - previousPeriodTotal) / previousPeriodTotal) * 1000,
          ) / 10
        : null;

    return NextResponse.json({
      period: periodLabel,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      summary: {
        grandTotal: Math.round(grandTotal * 100) / 100,
        totalCount,
        categoryCount: categories.length,
        avgPerExpense:
          totalCount > 0
            ? Math.round((grandTotal / totalCount) * 100) / 100
            : 0,
        previousPeriodTotal: Math.round(previousPeriodTotal * 100) / 100,
        changePercent,
      },
      categories,
      topCategories,
    });
  } catch (error) {
    console.error("Category report error:", error);
    return NextResponse.json(
      { error: "Failed to generate category report" },
      { status: 500 },
    );
  }
}

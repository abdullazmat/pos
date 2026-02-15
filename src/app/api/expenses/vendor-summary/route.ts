import { NextResponse } from "next/server";
import mongoose from "mongoose";
import dbConnect from "@/lib/db/connect";
import Expense from "@/lib/models/Expense";
import { verifyToken } from "@/lib/utils/jwt";

/**
 * GET /api/expenses/vendor-summary
 *
 * Returns aggregated expense data grouped by supplier/vendor.
 * Supports optional date range filtering via query params.
 */
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
    const dateFrom = searchParams.get("dateFrom");
    const dateTo = searchParams.get("dateTo");

    // Build match filter
    const matchFilter: any = {
      business: new mongoose.Types.ObjectId(decoded.businessId),
      supplier: { $ne: null },
    };

    if (dateFrom || dateTo) {
      matchFilter.date = {};
      if (dateFrom) matchFilter.date.$gte = new Date(dateFrom);
      if (dateTo) {
        const toDate = new Date(dateTo);
        toDate.setHours(23, 59, 59, 999);
        matchFilter.date.$lte = toDate;
      }
    }

    // Aggregate expenses by supplier
    const vendorSummary = await Expense.aggregate([
      { $match: matchFilter },
      {
        $group: {
          _id: "$supplier",
          totalAmount: { $sum: "$amount" },
          expenseCount: { $sum: 1 },
          lastExpenseDate: { $max: "$date" },
          categories: { $addToSet: "$category" },
          expenses: {
            $push: {
              date: "$date",
              amount: "$amount",
              description: "$description",
              category: "$category",
            },
          },
        },
      },
      {
        $lookup: {
          from: "suppliers",
          localField: "_id",
          foreignField: "_id",
          as: "supplierInfo",
        },
      },
      { $unwind: "$supplierInfo" },
      {
        $project: {
          supplierId: "$_id",
          supplierName: "$supplierInfo.name",
          supplierDocument: "$supplierInfo.document",
          totalAmount: 1,
          expenseCount: 1,
          lastExpenseDate: 1,
          categories: {
            $filter: {
              input: "$categories",
              cond: { $ne: ["$$this", null] },
            },
          },
          expenses: 1,
        },
      },
      { $sort: { totalAmount: -1 } },
    ]);

    // Calculate monthly trend per vendor (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    sixMonthsAgo.setDate(1);
    sixMonthsAgo.setHours(0, 0, 0, 0);

    const monthlyTrends = await Expense.aggregate([
      {
        $match: {
          business: new mongoose.Types.ObjectId(decoded.businessId),
          supplier: { $ne: null },
          date: { $gte: sixMonthsAgo },
        },
      },
      {
        $group: {
          _id: {
            supplier: "$supplier",
            year: { $year: "$date" },
            month: { $month: "$date" },
          },
          amount: { $sum: "$amount" },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
    ]);

    // Merge monthly trends into vendor summaries
    const trendMap: Record<string, { month: string; amount: number }[]> = {};
    for (const t of monthlyTrends) {
      const supplierId = String(t._id.supplier);
      if (!trendMap[supplierId]) trendMap[supplierId] = [];
      trendMap[supplierId].push({
        month: `${t._id.year}-${String(t._id.month).padStart(2, "0")}`,
        amount: t.amount,
      });
    }

    const enrichedSummary = vendorSummary.map((v: any) => ({
      supplierId: String(v.supplierId),
      supplierName: v.supplierName,
      supplierDocument: v.supplierDocument || null,
      totalAmount: v.totalAmount,
      expenseCount: v.expenseCount,
      lastExpenseDate: v.lastExpenseDate,
      categories: v.categories,
      monthlyTrend: trendMap[String(v.supplierId)] || [],
    }));

    // Calculate global stats
    const totalVendorSpent = enrichedSummary.reduce(
      (sum: number, v: any) => sum + v.totalAmount,
      0,
    );
    const topVendor =
      enrichedSummary.length > 0 ? enrichedSummary[0].supplierName : null;

    return NextResponse.json({
      vendors: enrichedSummary,
      stats: {
        totalSuppliers: enrichedSummary.length,
        totalSpent: totalVendorSpent,
        avgPerVendor:
          enrichedSummary.length > 0
            ? totalVendorSpent / enrichedSummary.length
            : 0,
        topVendor,
      },
    });
  } catch (error) {
    console.error("Vendor summary error:", error);
    return NextResponse.json(
      { error: "Failed to fetch vendor summary" },
      { status: 500 },
    );
  }
}

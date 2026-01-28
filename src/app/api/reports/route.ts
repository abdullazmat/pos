import { NextRequest } from "next/server";
import dbConnect from "@/lib/db/connect";
import Sale from "@/lib/models/Sale";
import Product from "@/lib/models/Product";
import { authMiddleware } from "@/lib/middleware/auth";
import {
  generateErrorResponse,
  generateSuccessResponse,
} from "@/lib/utils/helpers";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const authResult = await authMiddleware(req);
    if (!authResult.authorized) {
      return generateErrorResponse(authResult.error || "Unauthorized", 401);
    }

    const { businessId } = authResult.user!;
    const { searchParams } = new URL(req.url);
    const reportType = searchParams.get("type") || "daily";
    const fromParam = searchParams.get("from");
    const toParam = searchParams.get("to");

    await dbConnect();

    if (reportType === "daily") {
      let fromDate: Date;
      let toDate: Date;

      if (fromParam && toParam) {
        // Use provided date range
        fromDate = new Date(fromParam);
        fromDate.setHours(0, 0, 0, 0);
        toDate = new Date(toParam);
        toDate.setHours(23, 59, 59, 999);
      } else {
        // Default to last 7 days
        const today = new Date();
        today.setHours(23, 59, 59, 999);
        const start = new Date();
        start.setDate(today.getDate() - 6);
        start.setHours(0, 0, 0, 0);
        fromDate = start;
        toDate = today;
      }

      const sales = await Sale.find({
        businessId,
        createdAt: { $gte: fromDate, $lte: toDate },
      }).lean();

      const totalRevenue = sales.reduce((sum, sale) => sum + sale.total, 0);
      const totalSales = sales.length;

      // Aggregate sales by day for chart
      const dailyStats: {
        [key: string]: { date: string; sales: number; revenue: number };
      } = {};
      const current = new Date(fromDate);
      while (current <= toDate) {
        const dateKey = current.toISOString().split("T")[0];
        dailyStats[dateKey] = { date: dateKey, sales: 0, revenue: 0 };
        current.setDate(current.getDate() + 1);
      }

      sales.forEach((sale: any) => {
        const dateKey = new Date(sale.createdAt).toISOString().split("T")[0];
        if (dailyStats[dateKey]) {
          dailyStats[dateKey].sales += 1;
          dailyStats[dateKey].revenue += sale.total;
        }
      });

      const dailyData = Object.values(dailyStats).sort((a, b) =>
        a.date.localeCompare(b.date),
      );

      return generateSuccessResponse({
        type: "daily",
        date: fromDate.toISOString().split("T")[0],
        dateRange: {
          from: fromDate.toISOString().split("T")[0],
          to: toDate.toISOString().split("T")[0],
        },
        totalSales,
        totalRevenue,
        sales,
        dailyData,
      });
    }

    if (reportType === "products") {
      // Get date range (default last 7 days)
      let fromDate: Date;
      let toDate: Date;

      if (fromParam && toParam) {
        fromDate = new Date(fromParam);
        fromDate.setHours(0, 0, 0, 0);
        toDate = new Date(toParam);
        toDate.setHours(23, 59, 59, 999);
      } else {
        const today = new Date();
        today.setHours(23, 59, 59, 999);
        const start = new Date();
        start.setDate(today.getDate() - 6);
        start.setHours(0, 0, 0, 0);
        fromDate = start;
        toDate = today;
      }

      // Get all products
      const products = await Product.find({ businessId })
        .select("name stock price cost margin category")
        .lean();

      // Get sales in date range
      const sales = await Sale.find({
        businessId,
        createdAt: { $gte: fromDate, $lte: toDate },
      }).lean();

      // Calculate product stats from sales
      const productStats: { [key: string]: { sold: number; revenue: number } } =
        {};
      products.forEach((p: any) => {
        productStats[p._id.toString()] = { sold: 0, revenue: 0 };
      });

      sales.forEach((sale: any) => {
        sale.items?.forEach((item: any) => {
          const pid = item.productId?.toString();
          if (pid && productStats[pid]) {
            productStats[pid].sold += item.quantity || 0;
            productStats[pid].revenue += item.total || 0;
          }
        });
      });

      const productsWithStats = products.map((p: any) => {
        const stats = productStats[p._id.toString()] || { sold: 0, revenue: 0 };
        return {
          ...p,
          sold: stats.sold,
          revenue: stats.revenue,
          profitIfSold: (p.price - p.cost) * p.stock,
          category: p.category || "Uncategorized",
        };
      });

      return generateSuccessResponse({
        type: "products",
        dateRange: {
          from: fromDate.toISOString().split("T")[0],
          to: toDate.toISOString().split("T")[0],
        },
        products: productsWithStats,
      });
    }

    return generateErrorResponse("Unknown report type", 400);
  } catch (error) {
    console.error("Reports error:", error);
    return generateErrorResponse("Internal server error", 500);
  }
}

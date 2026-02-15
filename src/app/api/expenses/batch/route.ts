import { NextResponse } from "next/server";
import dbConnect from "@/lib/db/connect";
import Expense from "@/lib/models/Expense";
import { verifyToken } from "@/lib/utils/jwt";

const MAX_BATCH = 100;

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
    const { action, ids, category } = body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        { error: "No expense IDs provided" },
        { status: 400 },
      );
    }

    if (ids.length > MAX_BATCH) {
      return NextResponse.json(
        { error: `Maximum ${MAX_BATCH} expenses per batch operation` },
        { status: 400 },
      );
    }

    await dbConnect();

    const filter = {
      _id: { $in: ids },
      business: decoded.businessId,
    };

    let result: any;

    switch (action) {
      case "delete": {
        result = await Expense.deleteMany(filter);
        return NextResponse.json({
          message: "Batch delete completed",
          affected: result.deletedCount,
          action: "delete",
        });
      }

      case "changeCategory": {
        if (!category) {
          return NextResponse.json(
            { error: "Category is required for changeCategory action" },
            { status: 400 },
          );
        }
        result = await Expense.updateMany(filter, {
          $set: { category },
        });
        return NextResponse.json({
          message: "Batch category change completed",
          affected: result.modifiedCount,
          action: "changeCategory",
          category,
        });
      }

      case "markReviewed": {
        result = await Expense.updateMany(filter, {
          $set: {
            reviewed: true,
            reviewedAt: new Date(),
            reviewedBy: decoded.userId,
          },
        });
        return NextResponse.json({
          message: "Batch mark reviewed completed",
          affected: result.modifiedCount,
          action: "markReviewed",
        });
      }

      case "unmarkReviewed": {
        result = await Expense.updateMany(filter, {
          $set: {
            reviewed: false,
            reviewedAt: null,
            reviewedBy: null,
          },
        });
        return NextResponse.json({
          message: "Batch unmark reviewed completed",
          affected: result.modifiedCount,
          action: "unmarkReviewed",
        });
      }

      case "export": {
        const expenses = await Expense.find(filter)
          .sort({ date: -1 })
          .populate("user", "fullName")
          .lean();
        return NextResponse.json({
          expenses,
          action: "export",
          count: expenses.length,
        });
      }

      default:
        return NextResponse.json(
          {
            error:
              "Invalid action. Supported: delete, changeCategory, markReviewed, unmarkReviewed, export",
          },
          { status: 400 },
        );
    }
  } catch (error) {
    console.error("Batch action error:", error);
    return NextResponse.json(
      { error: "Failed to execute batch action" },
      { status: 500 },
    );
  }
}

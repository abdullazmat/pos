import { NextResponse } from "next/server";
import dbConnect from "@/lib/db/connect";
import Expense from "@/lib/models/Expense";
import { verifyToken } from "@/lib/utils/jwt";

const MAX_BATCH = 100;

// POST /api/expenses/batch-delete — Delete multiple expenses
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
    const { ids } = body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        { error: "No expense IDs provided" },
        { status: 400 },
      );
    }

    if (ids.length > MAX_BATCH) {
      return NextResponse.json(
        { error: `Maximum ${MAX_BATCH} expenses per batch delete` },
        { status: 400 },
      );
    }

    await dbConnect();

    const result = await Expense.deleteMany({
      _id: { $in: ids },
      business: decoded.businessId,
    });

    return NextResponse.json({
      message: "Batch delete completed",
      deletedCount: result.deletedCount,
      requestedCount: ids.length,
    });
  } catch (error) {
    console.error("Batch delete error:", error);
    return NextResponse.json(
      { error: "Failed to batch delete expenses" },
      { status: 500 },
    );
  }
}

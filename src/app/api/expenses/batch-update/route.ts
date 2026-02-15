import { NextResponse } from "next/server";
import dbConnect from "@/lib/db/connect";
import Expense from "@/lib/models/Expense";
import { verifyToken } from "@/lib/utils/jwt";

const MAX_BATCH = 100;

// PUT /api/expenses/batch-update — Update multiple expenses
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
    const { ids, updates } = body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        { error: "No expense IDs provided" },
        { status: 400 },
      );
    }

    if (ids.length > MAX_BATCH) {
      return NextResponse.json(
        { error: `Maximum ${MAX_BATCH} expenses per batch update` },
        { status: 400 },
      );
    }

    if (!updates || typeof updates !== "object") {
      return NextResponse.json(
        { error: "Updates object is required" },
        { status: 400 },
      );
    }

    // Only allow whitelisted fields for batch updates
    const allowedFields = ["category", "paymentMethod", "reviewed", "notes"];
    const updateData: Record<string, any> = {};

    for (const field of allowedFields) {
      if (updates[field] !== undefined) {
        updateData[field] = updates[field];
      }
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        {
          error:
            "No valid fields to update. Allowed: " + allowedFields.join(", "),
        },
        { status: 400 },
      );
    }

    // Handle reviewed field auto-set reviewed metadata
    if (updateData.reviewed === true) {
      updateData.reviewedAt = new Date();
      updateData.reviewedBy = decoded.userId;
    } else if (updateData.reviewed === false) {
      updateData.reviewedAt = null;
      updateData.reviewedBy = null;
    }

    await dbConnect();

    const result = await Expense.updateMany(
      {
        _id: { $in: ids },
        business: decoded.businessId,
      },
      { $set: updateData },
    );

    return NextResponse.json({
      message: "Batch update completed",
      modifiedCount: result.modifiedCount,
      matchedCount: result.matchedCount,
      requestedCount: ids.length,
      fieldsUpdated: Object.keys(updateData).filter(
        (k) => !["reviewedAt", "reviewedBy"].includes(k),
      ),
    });
  } catch (error) {
    console.error("Batch update error:", error);
    return NextResponse.json(
      { error: "Failed to batch update expenses" },
      { status: 500 },
    );
  }
}

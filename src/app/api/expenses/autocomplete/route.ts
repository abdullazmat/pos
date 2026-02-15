import { NextResponse } from "next/server";
import dbConnect from "@/lib/db/connect";
import Expense from "@/lib/models/Expense";
import { verifyToken } from "@/lib/utils/jwt";

// GET - Autocomplete descriptions from history
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
    const q = searchParams.get("q")?.trim();

    if (!q || q.length < 2) {
      return NextResponse.json({ suggestions: [] });
    }

    await dbConnect();

    const pattern = q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

    const results = await Expense.aggregate([
      {
        $match: {
          business: decoded.businessId,
          description: { $regex: pattern, $options: "i" },
        },
      },
      {
        $group: {
          _id: "$description",
          count: { $sum: 1 },
          lastUsed: { $max: "$date" },
        },
      },
      { $sort: { count: -1, lastUsed: -1 } },
      { $limit: 8 },
    ]);

    return NextResponse.json({
      suggestions: results.map((r) => r._id),
    });
  } catch (error) {
    console.error("Autocomplete error:", error);
    return NextResponse.json(
      { error: "Failed to get suggestions" },
      { status: 500 },
    );
  }
}

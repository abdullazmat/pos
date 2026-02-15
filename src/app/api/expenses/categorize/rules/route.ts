import { NextResponse } from "next/server";
import dbConnect from "@/lib/db/connect";
import ExpenseCategoryRule from "@/lib/models/ExpenseCategoryRule";
import { verifyToken } from "@/lib/utils/jwt";

// GET - List all category rules for business
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

    const rules = await ExpenseCategoryRule.find({
      business: decoded.businessId,
    }).sort({ isDefault: 1, priority: -1, category: 1 });

    return NextResponse.json({ rules });
  } catch (error) {
    console.error("List category rules error:", error);
    return NextResponse.json(
      { error: "Failed to list rules" },
      { status: 500 },
    );
  }
}

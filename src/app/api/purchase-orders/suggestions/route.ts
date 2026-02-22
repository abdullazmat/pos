import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db/connect";
import { generateSmartSuggestions } from "@/lib/services/smartSuggestionEngine";
import { verifyToken } from "@/lib/utils/jwt";

export async function GET(request: NextRequest) {
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
    const supplierId = searchParams.get("supplierId") || undefined;
    const coverageDays = parseInt(searchParams.get("coverageDays") || "14");
    const budgetLimit = searchParams.get("budgetLimit")
      ? parseFloat(searchParams.get("budgetLimit")!)
      : undefined;
    const includeNoRotation =
      searchParams.get("includeNoRotation") === "true";

    const result = await generateSmartSuggestions({
      businessId: decoded.businessId,
      supplierId,
      coverageDays,
      budgetLimit,
      includeNoRotation,
    });

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error("Smart suggestions error:", error);
    return NextResponse.json(
      { error: "Failed to generate smart suggestions" },
      { status: 500 },
    );
  }
}

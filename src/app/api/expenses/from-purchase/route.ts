import { NextResponse } from "next/server";
import dbConnect from "@/lib/db/connect";
import Expense from "@/lib/models/Expense";
import Purchase from "@/lib/models/Purchase";
import { verifyToken } from "@/lib/utils/jwt";

// POST - Create an expense linked to a purchase
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
    const { purchaseId, category, paymentMethod, notes } = body;

    if (!purchaseId) {
      return NextResponse.json(
        { error: "Purchase ID is required" },
        { status: 400 },
      );
    }

    await dbConnect();

    // Find the purchase
    const purchase = await Purchase.findOne({
      _id: purchaseId,
      businessId: decoded.businessId,
    });

    if (!purchase) {
      return NextResponse.json(
        { error: "Purchase not found" },
        { status: 404 },
      );
    }

    // Check if an expense already exists for this purchase
    const existingExpense = await Expense.findOne({
      purchaseId: purchase._id,
      business: decoded.businessId,
    });

    if (existingExpense) {
      return NextResponse.json(
        { error: "An expense already exists for this purchase" },
        { status: 409 },
      );
    }

    // Build description from purchase data
    const description = purchase.supplier
      ? `Compra a ${purchase.supplier}${purchase.invoiceNumber ? ` - Fact. ${purchase.invoiceNumber}` : ""}`
      : `Compra de producto${purchase.invoiceNumber ? ` - Fact. ${purchase.invoiceNumber}` : ""}`;

    const expense = await Expense.create({
      description,
      amount: purchase.totalCost,
      category: category || "Compras",
      paymentMethod: paymentMethod || "cash",
      notes: notes || purchase.notes || "",
      date: purchase.createdAt,
      source: "vendor",
      purchaseId: purchase._id,
      business: decoded.businessId,
      user: decoded.userId,
    });

    return NextResponse.json({ expense }, { status: 201 });
  } catch (error) {
    console.error("Create expense from purchase error:", error);
    return NextResponse.json(
      { error: "Failed to create expense from purchase" },
      { status: 500 },
    );
  }
}

// GET - Check if a purchase already has a linked expense
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
    const purchaseId = searchParams.get("purchaseId");

    if (!purchaseId) {
      return NextResponse.json(
        { error: "Purchase ID is required" },
        { status: 400 },
      );
    }

    await dbConnect();

    const expense = await Expense.findOne({
      purchaseId,
      business: decoded.businessId,
    });

    return NextResponse.json({
      hasExpense: !!expense,
      expense: expense || null,
    });
  } catch (error) {
    console.error("Check purchase expense error:", error);
    return NextResponse.json(
      { error: "Failed to check purchase expense" },
      { status: 500 },
    );
  }
}

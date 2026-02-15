import { NextResponse } from "next/server";
import dbConnect from "@/lib/db/connect";
import RecurringExpense from "@/lib/models/RecurringExpense";
import { verifyToken } from "@/lib/utils/jwt";

// GET - List all recurring expenses for the business
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

    const recurringExpenses = await RecurringExpense.find({
      business: decoded.businessId,
    })
      .sort({ createdAt: -1 })
      .populate("user", "fullName")
      .populate("supplier", "name document");

    return NextResponse.json({ recurringExpenses });
  } catch (error) {
    console.error("Get recurring expenses error:", error);
    return NextResponse.json(
      { error: "Failed to fetch recurring expenses" },
      { status: 500 },
    );
  }
}

// POST - Create a new recurring expense
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
    const {
      description,
      category,
      baseAmount,
      frequency,
      executionDay,
      startDate,
      endDate,
      requiresConfirmation,
      paymentMethod,
      notes,
      supplier,
    } = body;

    if (
      !description ||
      !baseAmount ||
      !frequency ||
      !executionDay ||
      !startDate
    ) {
      return NextResponse.json(
        {
          error:
            "Description, amount, frequency, execution day, and start date are required",
        },
        { status: 400 },
      );
    }

    if (!["monthly", "weekly", "biweekly", "annual"].includes(frequency)) {
      return NextResponse.json(
        {
          error:
            "Invalid frequency. Must be monthly, weekly, biweekly, or annual",
        },
        { status: 400 },
      );
    }

    const dayNum = parseInt(executionDay);
    if (isNaN(dayNum) || dayNum < 1 || dayNum > 31) {
      return NextResponse.json(
        { error: "Execution day must be between 1 and 31" },
        { status: 400 },
      );
    }

    await dbConnect();

    const recurringExpense = await RecurringExpense.create({
      description,
      category,
      baseAmount: parseFloat(baseAmount),
      frequency,
      executionDay: dayNum,
      startDate: new Date(startDate),
      endDate: endDate ? new Date(endDate) : null,
      requiresConfirmation: requiresConfirmation !== false,
      paymentMethod: paymentMethod || "cash",
      notes,
      supplier: supplier || null,
      business: decoded.businessId,
      user: decoded.userId,
    });

    return NextResponse.json({ recurringExpense }, { status: 201 });
  } catch (error) {
    console.error("Create recurring expense error:", error);
    return NextResponse.json(
      { error: "Failed to create recurring expense" },
      { status: 500 },
    );
  }
}

// PUT - Update an existing recurring expense
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
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json(
        { error: "Recurring expense ID is required" },
        { status: 400 },
      );
    }

    if (
      updates.frequency &&
      !["monthly", "weekly", "biweekly", "annual"].includes(updates.frequency)
    ) {
      return NextResponse.json({ error: "Invalid frequency" }, { status: 400 });
    }

    if (updates.executionDay) {
      const dayNum = parseInt(updates.executionDay);
      if (isNaN(dayNum) || dayNum < 1 || dayNum > 31) {
        return NextResponse.json(
          { error: "Execution day must be between 1 and 31" },
          { status: 400 },
        );
      }
      updates.executionDay = dayNum;
    }

    if (updates.baseAmount) {
      updates.baseAmount = parseFloat(updates.baseAmount);
    }

    if (updates.startDate) {
      updates.startDate = new Date(updates.startDate);
    }

    if (updates.endDate) {
      updates.endDate = new Date(updates.endDate);
    } else if (updates.endDate === null || updates.endDate === "") {
      updates.endDate = null;
    }

    await dbConnect();

    const recurringExpense = await RecurringExpense.findOneAndUpdate(
      { _id: id, business: decoded.businessId },
      { $set: updates },
      { new: true },
    );

    if (!recurringExpense) {
      return NextResponse.json(
        { error: "Recurring expense not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({ recurringExpense });
  } catch (error) {
    console.error("Update recurring expense error:", error);
    return NextResponse.json(
      { error: "Failed to update recurring expense" },
      { status: 500 },
    );
  }
}

// DELETE - Remove a recurring expense
export async function DELETE(request: Request) {
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
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Recurring expense ID is required" },
        { status: 400 },
      );
    }

    await dbConnect();

    const recurringExpense = await RecurringExpense.findOneAndDelete({
      _id: id,
      business: decoded.businessId,
    });

    if (!recurringExpense) {
      return NextResponse.json(
        { error: "Recurring expense not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      message: "Recurring expense deleted successfully",
    });
  } catch (error) {
    console.error("Delete recurring expense error:", error);
    return NextResponse.json(
      { error: "Failed to delete recurring expense" },
      { status: 500 },
    );
  }
}

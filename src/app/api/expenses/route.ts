import { NextResponse } from "next/server";
import mongoose from "mongoose";
import dbConnect from "@/lib/db/connect";
import Expense from "@/lib/models/Expense";
import { verifyToken } from "@/lib/utils/jwt";

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

    // Build filter query
    const filter: any = { business: decoded.businessId };

    // Text search (description + notes)
    const search = searchParams.get("search");
    if (search) {
      const escapedSearch = search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      filter.$or = [
        { description: { $regex: escapedSearch, $options: "i" } },
        { notes: { $regex: escapedSearch, $options: "i" } },
      ];
    }

    // Date range
    const dateFrom = searchParams.get("dateFrom");
    const dateTo = searchParams.get("dateTo");
    if (dateFrom || dateTo) {
      filter.date = {};
      if (dateFrom) filter.date.$gte = new Date(dateFrom);
      if (dateTo) {
        const toDate = new Date(dateTo);
        toDate.setHours(23, 59, 59, 999);
        filter.date.$lte = toDate;
      }
    }

    // Category
    const category = searchParams.get("category");
    if (category) filter.category = category;

    // Source
    const source = searchParams.get("source");
    if (source) filter.source = source;

    // Payment method
    const paymentMethod = searchParams.get("paymentMethod");
    if (paymentMethod) filter.paymentMethod = paymentMethod;

    // Reviewed status
    const reviewed = searchParams.get("reviewed");
    if (reviewed === "true") filter.reviewed = true;
    else if (reviewed === "false") filter.reviewed = { $ne: true };

    // Supplier
    const supplier = searchParams.get("supplier");
    if (supplier) {
      filter.supplier = new mongoose.Types.ObjectId(supplier);
    }

    // Amount range
    const amountMin = searchParams.get("amountMin");
    const amountMax = searchParams.get("amountMax");
    if (amountMin || amountMax) {
      filter.amount = {};
      if (amountMin) filter.amount.$gte = parseFloat(amountMin);
      if (amountMax) filter.amount.$lte = parseFloat(amountMax);
    }

    // Pagination
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "0"); // 0 = no limit (backward compat)
    const skip = limit > 0 ? (page - 1) * limit : 0;

    // Sort
    const sortBy = searchParams.get("sortBy") || "date";
    const sortOrder = searchParams.get("sortOrder") === "asc" ? 1 : -1;

    let query = Expense.find(filter)
      .sort({ [sortBy]: sortOrder })
      .populate("user", "fullName")
      .populate("supplier", "name document");

    if (limit > 0) {
      const total = await Expense.countDocuments(filter);
      query = query.skip(skip).limit(limit);
      const expenses = await query;
      return NextResponse.json({
        expenses,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      });
    }

    const expenses = await query;
    return NextResponse.json({ expenses });
  } catch (error) {
    console.error("Get expenses error:", error);
    return NextResponse.json(
      { error: "Failed to fetch expenses" },
      { status: 500 },
    );
  }
}

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
      amount,
      category,
      paymentMethod,
      notes,
      date,
      attachment,
      supplier,
    } = body;

    if (!description || !amount) {
      return NextResponse.json(
        { error: "Description and amount are required" },
        { status: 400 },
      );
    }

    await dbConnect();

    const expenseData: any = {
      description,
      amount,
      category,
      paymentMethod,
      notes,
      date: date || new Date(),
      business: decoded.businessId,
      user: decoded.userId,
    };

    if (supplier) {
      expenseData.supplier = supplier;
    }

    if (attachment?.fileName) {
      expenseData.attachment = attachment;
    }

    const expense = await Expense.create(expenseData);

    return NextResponse.json({ expense }, { status: 201 });
  } catch (error) {
    console.error("Create expense error:", error);
    return NextResponse.json(
      { error: "Failed to create expense" },
      { status: 500 },
    );
  }
}

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
        { error: "Expense ID is required" },
        { status: 400 },
      );
    }

    await dbConnect();

    const allowedFields = [
      "description",
      "amount",
      "category",
      "paymentMethod",
      "notes",
      "date",
      "attachment",
      "reviewed",
      "supplier",
    ];
    const updateData: Record<string, any> = {};

    for (const field of allowedFields) {
      if (updates[field] !== undefined) {
        updateData[field] = updates[field];
      }
    }

    if (updates.reviewed === true) {
      updateData.reviewedAt = new Date();
      updateData.reviewedBy = decoded.userId;
    } else if (updates.reviewed === false) {
      updateData.reviewedAt = null;
      updateData.reviewedBy = null;
    }

    if (updateData.amount !== undefined) {
      updateData.amount = parseFloat(updateData.amount);
      if (isNaN(updateData.amount) || updateData.amount < 0) {
        return NextResponse.json(
          { error: "Amount must be a positive number" },
          { status: 400 },
        );
      }
    }

    if (updateData.date) {
      updateData.date = new Date(updateData.date);
    }

    const expense = await Expense.findOneAndUpdate(
      { _id: id, business: decoded.businessId },
      { $set: updateData },
      { new: true },
    ).populate("user", "fullName");

    if (!expense) {
      return NextResponse.json({ error: "Expense not found" }, { status: 404 });
    }

    return NextResponse.json({ expense });
  } catch (error) {
    console.error("Update expense error:", error);
    return NextResponse.json(
      { error: "Failed to update expense" },
      { status: 500 },
    );
  }
}

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
        { error: "Expense ID is required" },
        { status: 400 },
      );
    }

    await dbConnect();

    const expense = await Expense.findOneAndDelete({
      _id: id,
      business: decoded.businessId,
    });

    if (!expense) {
      return NextResponse.json({ error: "Expense not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Expense deleted successfully" });
  } catch (error) {
    console.error("Delete expense error:", error);
    return NextResponse.json(
      { error: "Failed to delete expense" },
      { status: 500 },
    );
  }
}

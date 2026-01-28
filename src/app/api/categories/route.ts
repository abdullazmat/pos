import { NextResponse } from "next/server";
import dbConnect from "@/lib/db/connect";
import Category from "@/lib/models/Category";
import { verifyToken } from "@/lib/utils/jwt";
import { checkPlanLimit } from "@/lib/utils/planValidation";

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

    const categories = await Category.find({
      business: decoded.businessId,
    }).sort({ name: 1 });

    return NextResponse.json({ categories });
  } catch (error) {
    console.error("Get categories error:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch categories",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const token = request.headers.get("authorization")?.split(" ")[1];
    if (!token) {
      return NextResponse.json(
        { error: "Unauthorized - No token provided" },
        { status: 401 },
      );
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    if (!decoded.businessId) {
      return NextResponse.json(
        { error: "Business ID not found in token" },
        { status: 400 },
      );
    }

    const body = await request.json();
    const { name } = body;

    if (!name || !name.trim()) {
      return NextResponse.json(
        { error: "Category name is required" },
        { status: 400 },
      );
    }

    await dbConnect();

    const categoryCount = await Category.countDocuments({
      business: decoded.businessId,
    });
    const planCheck = await checkPlanLimit(
      decoded.businessId,
      "maxCategories",
      categoryCount,
    );
    if (!planCheck.allowed) {
      return NextResponse.json({ error: planCheck.message }, { status: 403 });
    }

    // Check if category already exists
    const existingCategory = await Category.findOne({
      business: decoded.businessId,
      name: { $regex: new RegExp(`^${name.trim()}$`, "i") },
    });

    if (existingCategory) {
      return NextResponse.json(
        { error: { key: "duplicateCategoryName" } },
        { status: 409 },
      );
    }

    const category = await Category.create({
      name: name.trim(),
      business: decoded.businessId,
    });

    return NextResponse.json(
      { category, message: "Category created successfully" },
      { status: 201 },
    );
  } catch (error) {
    console.error("Create category error:", error);
    return NextResponse.json(
      {
        error: "Failed to create category",
        details: error instanceof Error ? error.message : String(error),
      },
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
    const { id, name } = body;

    if (!id || !name || !name.trim()) {
      return NextResponse.json(
        { error: "Category ID and name are required" },
        { status: 400 },
      );
    }

    await dbConnect();

    // Check if another category with same name exists
    const existingCategory = await Category.findOne({
      business: decoded.businessId,
      name: { $regex: new RegExp(`^${name.trim()}$`, "i") },
      _id: { $ne: id },
    });

    if (existingCategory) {
      return NextResponse.json(
        { error: { key: "duplicateCategoryName" } },
        { status: 409 },
      );
    }

    const category = await Category.findOneAndUpdate(
      { _id: id, business: decoded.businessId },
      { name: name.trim() },
      { new: true },
    );

    if (!category) {
      return NextResponse.json(
        { error: "Category not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      category,
      message: "Category updated successfully",
    });
  } catch (error) {
    console.error("Update category error:", error);
    return NextResponse.json(
      {
        error: "Failed to update category",
        details: error instanceof Error ? error.message : String(error),
      },
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
        { error: "Category ID is required" },
        { status: 400 },
      );
    }

    await dbConnect();

    const category = await Category.findOneAndDelete({
      _id: id,
      business: decoded.businessId,
    });

    if (!category) {
      return NextResponse.json(
        { error: "Category not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({ message: "Category deleted successfully" });
  } catch (error) {
    console.error("Delete category error:", error);
    return NextResponse.json(
      {
        error: "Failed to delete category",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
}

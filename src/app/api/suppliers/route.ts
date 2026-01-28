import { NextResponse } from "next/server";
import dbConnect from "@/lib/db/connect";
import Supplier from "@/lib/models/Supplier";
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

    const suppliers = await Supplier.find({
      business: decoded.businessId,
    }).sort({ name: 1 });

    return NextResponse.json({ suppliers });
  } catch (error) {
    console.error("Get suppliers error:", error);
    return NextResponse.json(
      { error: "Failed to fetch suppliers" },
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
    const { name, document, phone, email, address } = body;

    if (!name) {
      return NextResponse.json(
        { error: "Supplier name is required" },
        { status: 400 },
      );
    }

    await dbConnect();

    const existingSupplier = await Supplier.findOne({
      business: decoded.businessId,
      name: { $regex: new RegExp(`^${name.trim()}$`, "i") },
    });

    if (existingSupplier) {
      return NextResponse.json(
        { error: { key: "duplicateSupplierName" } },
        { status: 409 },
      );
    }

    const supplier = await Supplier.create({
      name: name.trim(),
      document,
      phone,
      email,
      address,
      business: decoded.businessId,
    });

    return NextResponse.json({ supplier }, { status: 201 });
  } catch (error) {
    console.error("Create supplier error:", error);
    return NextResponse.json(
      { error: "Failed to create supplier" },
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
    const { id, name, document, phone, email, address } = body;

    if (!id || !name) {
      return NextResponse.json(
        { error: "Supplier ID and name are required" },
        { status: 400 },
      );
    }

    await dbConnect();

    const existingSupplier = await Supplier.findOne({
      business: decoded.businessId,
      name: { $regex: new RegExp(`^${name.trim()}$`, "i") },
      _id: { $ne: id },
    });

    if (existingSupplier) {
      return NextResponse.json(
        { error: { key: "duplicateSupplierName" } },
        { status: 409 },
      );
    }

    const supplier = await Supplier.findOneAndUpdate(
      { _id: id, business: decoded.businessId },
      { name: name.trim(), document, phone, email, address },
      { new: true },
    );

    if (!supplier) {
      return NextResponse.json(
        { error: "Supplier not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({ supplier });
  } catch (error) {
    console.error("Update supplier error:", error);
    return NextResponse.json(
      { error: "Failed to update supplier" },
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
        { error: "Supplier ID is required" },
        { status: 400 },
      );
    }

    await dbConnect();

    const supplier = await Supplier.findOneAndDelete({
      _id: id,
      business: decoded.businessId,
    });

    if (!supplier) {
      return NextResponse.json(
        { error: "Supplier not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({ message: "Supplier deleted successfully" });
  } catch (error) {
    console.error("Delete supplier error:", error);
    return NextResponse.json(
      { error: "Failed to delete supplier" },
      { status: 500 },
    );
  }
}

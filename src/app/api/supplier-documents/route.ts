import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db/connect";
import SupplierDocument from "@/lib/models/SupplierDocument";
import Supplier from "@/lib/models/Supplier";
import { verifyToken } from "@/lib/utils/jwt";

export async function GET(req: NextRequest) {
  try {
    const token = req.headers.get("authorization")?.split(" ")[1];
    if (!token)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const decoded = verifyToken(token);
    if (!decoded)
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const supplierId = searchParams.get("supplierId");
    const status = searchParams.get("status");

    await dbConnect();

    const filter: any = { businessId: decoded.businessId };
    if (supplierId) filter.supplierId = supplierId;
    if (status) filter.status = status;

    const documents = await SupplierDocument.find(filter)
      .sort({ date: -1 })
      .limit(200);

    return NextResponse.json({ documents });
  } catch (error) {
    console.error("Get supplier documents error:", error);
    return NextResponse.json(
      { error: "Failed to fetch supplier documents" },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const token = req.headers.get("authorization")?.split(" ")[1];
    if (!token)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const decoded = verifyToken(token);
    if (!decoded)
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });

    const body = await req.json();
    const { supplierId, type, documentNumber, date, totalAmount, notes } = body;

    if (!supplierId || !type || !documentNumber || !totalAmount) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    await dbConnect();

    const supplier = await Supplier.findOne({
      _id: supplierId,
      business: decoded.businessId,
    });
    if (!supplier) {
      return NextResponse.json(
        { error: "Supplier not found" },
        { status: 404 },
      );
    }

    const document = await SupplierDocument.create({
      businessId: decoded.businessId,
      supplierId,
      type,
      documentNumber,
      date: date ? new Date(date) : new Date(),
      totalAmount,
      balance: totalAmount,
      status: "OPEN",
      notes,
    });

    return NextResponse.json({ document }, { status: 201 });
  } catch (error) {
    console.error("Create supplier document error:", error);
    return NextResponse.json(
      { error: "Failed to create supplier document" },
      { status: 500 },
    );
  }
}

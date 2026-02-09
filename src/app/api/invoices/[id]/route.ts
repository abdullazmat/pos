import { NextResponse } from "next/server";
import dbConnect from "@/lib/db/connect";
import Invoice from "@/lib/models/Invoice";
import { verifyToken } from "@/lib/utils/jwt";

export async function GET(
  request: Request,
  { params }: { params: { id: string } },
) {
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

    const invoice = await Invoice.findOne({
      _id: params.id,
      business: decoded.businessId,
    });

    if (!invoice) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
    }

    return NextResponse.json({ invoice });
  } catch (error) {
    console.error("Get invoice error:", error);
    return NextResponse.json(
      { error: "Failed to fetch invoice" },
      { status: 500 },
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } },
) {
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

    const existingInvoice = await Invoice.findOne({
      _id: params.id,
      business: decoded.businessId,
    });

    if (!existingInvoice) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
    }

    const isApprovedFiscal =
      existingInvoice.status === "AUTHORIZED" ||
      existingInvoice.arcaStatus === "APPROVED" ||
      existingInvoice.fiscalData?.caeStatus === "AUTHORIZED";

    if (isApprovedFiscal) {
      return NextResponse.json(
        {
          error: "Fiscal invoices cannot be modified. Use Credit Note.",
        },
        { status: 403 },
      );
    }

    if (
      existingInvoice.channel === "ARCA" ||
      existingInvoice.channel === "WSFE"
    ) {
      return NextResponse.json(
        {
          error: "Fiscal invoices cannot be edited",
          message: "Corrections must be made via credit note",
        },
        { status: 409 },
      );
    }

    const body = await request.json();

    const invoice = await Invoice.findOneAndUpdate(
      { _id: params.id, business: decoded.businessId },
      body,
      { new: true },
    );

    if (!invoice) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
    }

    return NextResponse.json({
      invoice,
      message: "Invoice updated successfully",
    });
  } catch (error) {
    console.error("Update invoice error:", error);
    return NextResponse.json(
      { error: "Failed to update invoice" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } },
) {
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

    const existingInvoice = await Invoice.findOne({
      _id: params.id,
      business: decoded.businessId,
    });

    if (!existingInvoice) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
    }

    const isApprovedFiscal =
      existingInvoice.status === "AUTHORIZED" ||
      existingInvoice.arcaStatus === "APPROVED" ||
      existingInvoice.fiscalData?.caeStatus === "AUTHORIZED";

    if (isApprovedFiscal) {
      return NextResponse.json(
        {
          error: "Fiscal invoices cannot be modified. Use Credit Note.",
        },
        { status: 403 },
      );
    }

    if (
      existingInvoice.channel === "ARCA" ||
      existingInvoice.channel === "WSFE"
    ) {
      return NextResponse.json(
        {
          error: "Fiscal invoices cannot be deleted",
          message: "Corrections must be made via credit note",
        },
        { status: 409 },
      );
    }

    const invoice = await Invoice.findOneAndDelete({
      _id: params.id,
      business: decoded.businessId,
    });

    if (!invoice) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Invoice deleted successfully" });
  } catch (error) {
    console.error("Delete invoice error:", error);
    return NextResponse.json(
      { error: "Failed to delete invoice" },
      { status: 500 },
    );
  }
}

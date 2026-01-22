import { NextResponse } from "next/server";
import dbConnect from "@/lib/db/connect";
import Invoice, { InvoiceChannel, InvoiceType } from "@/lib/models/Invoice";
import { verifyToken } from "@/lib/utils/jwt";

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
      invoiceNumber,
      invoiceType,
      channel,
      customerName,
      customerCuit,
      customerEmail,
      ivaType,
      items,
      subtotal,
      taxAmount,
      discountAmount,
      totalAmount,
      paymentMethod,
      notes,
    } = body;

    // Validation
    if (
      !invoiceNumber ||
      !customerName ||
      !items ||
      !Array.isArray(items) ||
      items.length === 0
    ) {
      return NextResponse.json(
        {
          error: "Missing required fields: invoiceNumber, customerName, items",
        },
        { status: 400 }
      );
    }

    if (channel === InvoiceChannel.ARCA && !customerCuit) {
      return NextResponse.json(
        { error: "CUIT is required for ARCA invoices" },
        { status: 400 }
      );
    }

    if (channel === InvoiceChannel.ARCA && !ivaType) {
      return NextResponse.json(
        { error: "IVA type is required for ARCA invoices" },
        { status: 400 }
      );
    }

    await dbConnect();

    // Check if invoice already exists
    const existing = await Invoice.findOne({
      business: decoded.businessId,
      invoiceNumber,
    });

    if (existing) {
      return NextResponse.json(
        { error: "Invoice number already exists" },
        { status: 400 }
      );
    }

    const invoice = await Invoice.create({
      business: decoded.businessId,
      invoiceNumber,
      invoiceType: invoiceType || InvoiceType.SALE,
      channel: channel || InvoiceChannel.INTERNAL,
      reportedToArca: false,
      customerName,
      customerCuit,
      customerEmail,
      ivaType,
      items,
      subtotal,
      taxAmount,
      discountAmount,
      totalAmount,
      paymentMethod,
      notes,
      paymentStatus: "PENDING",
    });

    return NextResponse.json(
      { invoice, message: "Invoice created successfully" },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create invoice error:", error);
    return NextResponse.json(
      {
        error: "Failed to create invoice",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

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
    const channel = searchParams.get("channel");
    const invoiceType = searchParams.get("invoiceType");
    const exportMode = searchParams.get("export") === "true";

    await dbConnect();

    const filter: any = { business: decoded.businessId };
    if (channel) filter.channel = channel;
    if (invoiceType) filter.invoiceType = invoiceType;

    // Prevent INTERNAL invoices from being exported
    if (exportMode) {
      filter.channel = InvoiceChannel.ARCA;
      if (channel && channel === InvoiceChannel.INTERNAL) {
        return NextResponse.json(
          { error: "Internal invoices cannot be exported" },
          { status: 400 }
        );
      }
    }

    const invoices = await Invoice.find(filter)
      .sort({ createdAt: -1 })
      .limit(100);

    return NextResponse.json({ invoices });
  } catch (error) {
    console.error("Get invoices error:", error);
    return NextResponse.json(
      { error: "Failed to fetch invoices" },
      { status: 500 }
    );
  }
}

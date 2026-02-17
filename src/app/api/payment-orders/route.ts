import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db/connect";
import PaymentOrder, {
  PAYMENT_ORDER_DOCUMENT_TYPES,
} from "@/lib/models/PaymentOrder";
import SupplierDocument from "@/lib/models/SupplierDocument";
import Supplier from "@/lib/models/Supplier";
import PaymentOrderAudit from "@/lib/models/PaymentOrderAudit";
import { verifyToken } from "@/lib/utils/jwt";
import { computeSupplierDocumentStatus } from "@/lib/utils/supplierDocumentStatus";

interface PaymentOrderItemInput {
  documentId: string;
  applyAmount: number;
}

interface PaymentOrderPaymentInput {
  method: "cash" | "transfer" | "mercadopago" | "check" | "card";
  reference?: string;
  amount: number;
}

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
    const channel = searchParams.get("channel");
    const dateFrom = searchParams.get("dateFrom");
    const dateTo = searchParams.get("dateTo");

    await dbConnect();

    const filter: any = { businessId: decoded.businessId };
    if (supplierId) filter.supplierId = supplierId;
    if (status) filter.status = status;

    // Channel filtering — default to ch1 (includes legacy null)
    if (channel === "2") {
      filter.channel = 2;
    } else {
      filter.channel = { $in: [1, null, undefined] };
    }

    // Date range
    if (dateFrom || dateTo) {
      filter.date = {};
      if (dateFrom) filter.date.$gte = new Date(dateFrom);
      if (dateTo) {
        const end = new Date(dateTo);
        end.setHours(23, 59, 59, 999);
        filter.date.$lte = end;
      }
    }

    const paymentOrders = await PaymentOrder.find(filter)
      .sort({ orderNumber: -1 })
      .limit(200);

    return NextResponse.json({ paymentOrders });
  } catch (error) {
    console.error("Get payment orders error:", error);
    return NextResponse.json(
      { error: "Failed to fetch payment orders" },
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
    const {
      supplierId,
      channel = 1,
      documents = [],
      creditNotes = [],
      payments = [],
      notes,
    } = body;

    if (!supplierId || !Array.isArray(documents) || documents.length === 0) {
      return NextResponse.json(
        { error: "Supplier and documents are required" },
        { status: 400 },
      );
    }

    const channelNum = Number(channel);
    if (channelNum !== 1 && channelNum !== 2) {
      return NextResponse.json({ error: "Invalid channel" }, { status: 400 });
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

    const documentIds = documents.map(
      (d: PaymentOrderItemInput) => d.documentId,
    );
    const creditNoteIds = creditNotes.map(
      (d: PaymentOrderItemInput) => d.documentId,
    );

    const supplierDocs = await SupplierDocument.find({
      _id: { $in: documentIds },
      businessId: decoded.businessId,
      supplierId,
    });

    const supplierCreditNotes = await SupplierDocument.find({
      _id: { $in: creditNoteIds },
      businessId: decoded.businessId,
      supplierId,
    });

    if (supplierDocs.length !== documentIds.length) {
      return NextResponse.json(
        { error: "Some documents were not found" },
        { status: 404 },
      );
    }

    if (supplierCreditNotes.length !== creditNoteIds.length) {
      return NextResponse.json(
        { error: "Some credit notes were not found" },
        { status: 404 },
      );
    }

    // Validate and build document entries
    const documentsEntries = [];
    for (const doc of supplierDocs) {
      const input = documents.find(
        (d: PaymentOrderItemInput) => d.documentId === String(doc._id),
      );
      const applyAmount = Number(input?.applyAmount || 0);
      if (doc.type === "CREDIT_NOTE") {
        return NextResponse.json(
          {
            error: `Document ${doc.documentNumber} is a credit note and must be applied in the credit notes section`,
          },
          { status: 400 },
        );
      }
      if (doc.status === "CANCELLED" || doc.balance <= 0) {
        return NextResponse.json(
          {
            error: `Document ${doc.documentNumber} is not available (cancelled or zero balance)`,
          },
          { status: 400 },
        );
      }
      if (applyAmount <= 0 || applyAmount > doc.balance + 0.01) {
        return NextResponse.json(
          {
            error: `Invalid amount for document ${doc.documentNumber}. Amount must be between 0 and ${doc.balance}`,
          },
          { status: 400 },
        );
      }
      // Normalize document type — ensure it's a valid PaymentOrder document type
      const docType = (PAYMENT_ORDER_DOCUMENT_TYPES as string[]).includes(
        doc.type,
      )
        ? doc.type
        : "INVOICE"; // Fallback for legacy/unrecognized types

      documentsEntries.push({
        documentId: doc._id,
        documentType: docType,
        documentNumber: doc.documentNumber,
        date: doc.date,
        amount: Math.min(applyAmount, doc.balance),
        balanceBefore: doc.balance,
        balanceAfter: Math.max(0, doc.balance - applyAmount),
      });
    }

    // Validate and build credit note entries
    const creditNoteEntries = [];
    for (const doc of supplierCreditNotes) {
      const input = creditNotes.find(
        (d: PaymentOrderItemInput) => d.documentId === String(doc._id),
      );
      const applyAmount = Number(input?.applyAmount || 0);
      if (doc.type !== "CREDIT_NOTE") {
        return NextResponse.json(
          { error: `Document ${doc.documentNumber} is not a credit note` },
          { status: 400 },
        );
      }
      if (doc.status === "CANCELLED" || doc.balance <= 0) {
        return NextResponse.json(
          {
            error: `Credit note ${doc.documentNumber} is not available (cancelled or zero balance)`,
          },
          { status: 400 },
        );
      }
      if (applyAmount <= 0 || applyAmount > doc.balance + 0.01) {
        return NextResponse.json(
          {
            error: `Invalid amount for credit note ${doc.documentNumber}. Amount must be between 0 and ${doc.balance}`,
          },
          { status: 400 },
        );
      }
      creditNoteEntries.push({
        documentId: doc._id,
        documentType: doc.type,
        documentNumber: doc.documentNumber,
        date: doc.date,
        amount: Math.min(applyAmount, doc.balance),
        balanceBefore: doc.balance,
        balanceAfter: Math.max(0, doc.balance - applyAmount),
      });
    }

    const documentsTotal = documentsEntries.reduce(
      (sum, d) => sum + d.amount,
      0,
    );
    const creditNotesTotal = creditNoteEntries.reduce(
      (sum, d) => sum + d.amount,
      0,
    );
    const paymentsTotal = Array.isArray(payments)
      ? payments.reduce(
          (sum: number, p: PaymentOrderPaymentInput) =>
            sum + Number(p.amount || 0),
          0,
        )
      : 0;

    const netPayable = Math.max(0, documentsTotal - creditNotesTotal);

    if (Math.abs(netPayable - paymentsTotal) > 0.01) {
      return NextResponse.json(
        {
          error: `Payments total ($${paymentsTotal.toFixed(2)}) must match net payable ($${netPayable.toFixed(2)})`,
        },
        { status: 400 },
      );
    }

    // Validate payment methods
    const validMethods = ["cash", "transfer", "mercadopago", "check", "card"];
    for (const p of payments) {
      if (!validMethods.includes(p.method)) {
        return NextResponse.json(
          { error: `Invalid payment method: ${p.method}` },
          { status: 400 },
        );
      }
      if (!p.amount || Number(p.amount) <= 0) {
        return NextResponse.json(
          { error: "All payment methods must have an amount greater than 0" },
          { status: 400 },
        );
      }
    }

    const lastOrder = await PaymentOrder.findOne({
      businessId: decoded.businessId,
    })
      .sort({ orderNumber: -1 })
      .select("orderNumber");

    const nextOrderNumber = lastOrder?.orderNumber
      ? lastOrder.orderNumber + 1
      : 1;

    // Sanitize payments (ensure correct types)
    const sanitizedPayments = payments.map((p: PaymentOrderPaymentInput) => ({
      method: p.method,
      reference: p.reference || undefined,
      amount: Math.round(Number(p.amount) * 100) / 100,
    }));

    const paymentOrder = await PaymentOrder.create({
      businessId: decoded.businessId,
      orderNumber: nextOrderNumber,
      supplierId,
      channel: channelNum,
      status: "PENDING",
      documents: documentsEntries,
      creditNotes: creditNoteEntries,
      payments: sanitizedPayments,
      documentsTotal: Math.round(documentsTotal * 100) / 100,
      creditNotesTotal: Math.round(creditNotesTotal * 100) / 100,
      paymentsTotal: Math.round(paymentsTotal * 100) / 100,
      netPayable: Math.round(netPayable * 100) / 100,
      notes,
      createdBy: decoded.userId,
      createdByEmail: decoded.email,
    });

    await PaymentOrderAudit.create({
      businessId: decoded.businessId,
      paymentOrderId: paymentOrder._id,
      action: "CREATE",
      actionDescription: `Payment order ${nextOrderNumber} created`,
      userId: decoded.userId,
      userEmail: decoded.email,
      ipAddress: req.headers.get("x-forwarded-for") || undefined,
      metadata: {
        supplierId,
        documentsTotal,
        creditNotesTotal,
        paymentsTotal,
      },
    });

    return NextResponse.json({ paymentOrder }, { status: 201 });
  } catch (error: any) {
    console.error("Create payment order error:", error);

    // Handle Mongoose validation errors as 400
    if (error?.name === "ValidationError") {
      const messages = Object.values(error.errors || {})
        .map((e: any) => e.message)
        .join(", ");
      return NextResponse.json(
        { error: `Validation error: ${messages}` },
        { status: 400 },
      );
    }

    // Handle duplicate key errors
    if (error?.code === 11000) {
      return NextResponse.json(
        { error: "Duplicate payment order number. Please try again." },
        { status: 409 },
      );
    }

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to create payment order",
      },
      { status: 500 },
    );
  }
}

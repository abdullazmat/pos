import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db/connect";
import PaymentOrder from "@/lib/models/PaymentOrder";
import SupplierDocument from "@/lib/models/SupplierDocument";
import Supplier from "@/lib/models/Supplier";
import PaymentOrderAudit from "@/lib/models/PaymentOrderAudit";
import { verifyToken } from "@/lib/utils/jwt";

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

    await dbConnect();

    const filter: any = { businessId: decoded.businessId };
    if (supplierId) filter.supplierId = supplierId;
    if (status) filter.status = status;

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

    const documentsEntries = supplierDocs.map((doc) => {
      const input = documents.find(
        (d: PaymentOrderItemInput) => d.documentId === String(doc._id),
      );
      const applyAmount = Number(input?.applyAmount || 0);
      if (doc.type === "CREDIT_NOTE") {
        throw new Error("Credit notes must be applied in creditNotes list");
      }
      if (applyAmount <= 0 || applyAmount > doc.balance) {
        throw new Error("Invalid document amount");
      }
      return {
        documentId: doc._id,
        documentType: doc.type,
        documentNumber: doc.documentNumber,
        date: doc.date,
        amount: applyAmount,
        balanceBefore: doc.balance,
        balanceAfter: Math.max(0, doc.balance - applyAmount),
      };
    });

    const creditNoteEntries = supplierCreditNotes.map((doc) => {
      const input = creditNotes.find(
        (d: PaymentOrderItemInput) => d.documentId === String(doc._id),
      );
      const applyAmount = Number(input?.applyAmount || 0);
      if (doc.type !== "CREDIT_NOTE") {
        throw new Error("Only credit notes can be applied as compensation");
      }
      if (applyAmount <= 0 || applyAmount > doc.balance) {
        throw new Error("Invalid credit note amount");
      }
      return {
        documentId: doc._id,
        documentType: doc.type,
        documentNumber: doc.documentNumber,
        date: doc.date,
        amount: applyAmount,
        balanceBefore: doc.balance,
        balanceAfter: Math.max(0, doc.balance - applyAmount),
      };
    });

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
        { error: "Payments total must match documents minus credit notes" },
        { status: 400 },
      );
    }

    const lastOrder = await PaymentOrder.findOne({
      businessId: decoded.businessId,
    })
      .sort({ orderNumber: -1 })
      .select("orderNumber");

    const nextOrderNumber = lastOrder?.orderNumber
      ? lastOrder.orderNumber + 1
      : 1;

    const paymentOrder = await PaymentOrder.create({
      businessId: decoded.businessId,
      orderNumber: nextOrderNumber,
      supplierId,
      status: "PENDING",
      documents: documentsEntries,
      creditNotes: creditNoteEntries,
      payments,
      documentsTotal,
      creditNotesTotal,
      paymentsTotal,
      netPayable,
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
  } catch (error) {
    console.error("Create payment order error:", error);
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

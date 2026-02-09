import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db/connect";
import SupplierDocument from "@/lib/models/SupplierDocument";
import SupplierDocumentAudit from "@/lib/models/SupplierDocumentAudit";
import Supplier from "@/lib/models/Supplier";
import { verifyToken } from "@/lib/utils/jwt";
import {
  computeSupplierDocumentStatus,
  DEFAULT_DUE_SOON_DAYS,
} from "@/lib/utils/supplierDocumentStatus";

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
    const alerts = searchParams.get("alerts") === "true";
    const dueSoonDays =
      Number(searchParams.get("dueSoonDays")) || DEFAULT_DUE_SOON_DAYS;

    await dbConnect();

    const filter: any = { businessId: decoded.businessId };
    if (supplierId) filter.supplierId = supplierId;
    if (status) filter.status = status;

    const documents = await SupplierDocument.find(filter)
      .sort({ date: -1 })
      .limit(200);

    const now = new Date();
    const updates: Array<{ updateOne: { filter: any; update: any } }> = [];
    const hydrated = documents.map((doc) => {
      const computedStatus = computeSupplierDocumentStatus(
        doc,
        now,
        dueSoonDays,
      );
      if (doc.status !== computedStatus) {
        updates.push({
          updateOne: {
            filter: { _id: doc._id },
            update: { status: computedStatus },
          },
        });
        doc.status = computedStatus;
      }
      return doc;
    });

    if (updates.length > 0) {
      await SupplierDocument.bulkWrite(updates);
    }

    if (alerts) {
      const dueSoon = hydrated.filter((doc) => doc.status === "DUE_SOON");
      const overdue = hydrated.filter((doc) => doc.status === "OVERDUE");
      return NextResponse.json({
        alerts: {
          dueSoon: dueSoon.length,
          overdue: overdue.length,
          dueSoonDocs: dueSoon.slice(0, 20),
          overdueDocs: overdue.slice(0, 20),
        },
      });
    }

    return NextResponse.json({ documents: hydrated });
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
    const {
      supplierId,
      type,
      documentNumber,
      pointOfSale,
      date,
      dueDate,
      totalAmount,
      notes,
      attachments = [],
    } = body;

    if (!supplierId || !type || !documentNumber || !totalAmount) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    if (type !== "CREDIT_NOTE" && !dueDate) {
      return NextResponse.json(
        { error: "Due date is required for invoice/debit note" },
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
      pointOfSale,
      documentNumber,
      date: date ? new Date(date) : new Date(),
      dueDate: dueDate ? new Date(dueDate) : undefined,
      totalAmount,
      balance: totalAmount,
      appliedPaymentsTotal: 0,
      appliedCreditsTotal: 0,
      status: "PENDING",
      notes,
      attachments,
    });

    const computedStatus = computeSupplierDocumentStatus(document);
    if (computedStatus !== document.status) {
      document.status = computedStatus;
      await document.save();
    }

    await SupplierDocumentAudit.create({
      businessId: decoded.businessId,
      documentId: document._id,
      supplierId,
      action: "CREATE",
      actionDescription: `Supplier document ${document.documentNumber} created`,
      userId: decoded.userId,
      userEmail: decoded.email,
      ipAddress: req.headers.get("x-forwarded-for") || undefined,
      metadata: {
        type,
        totalAmount,
      },
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

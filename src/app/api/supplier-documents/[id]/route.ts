import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db/connect";
import SupplierDocument from "@/lib/models/SupplierDocument";
import SupplierDocumentAudit from "@/lib/models/SupplierDocumentAudit";
import { verifyToken } from "@/lib/utils/jwt";
import { computeSupplierDocumentStatus } from "@/lib/utils/supplierDocumentStatus";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const token = req.headers.get("authorization")?.split(" ")[1];
    if (!token)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const decoded = verifyToken(token);
    if (!decoded)
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });

    await dbConnect();

    const document = await SupplierDocument.findOne({
      _id: params.id,
      businessId: decoded.businessId,
    });

    if (!document) {
      return NextResponse.json(
        { error: "Supplier document not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({ document });
  } catch (error) {
    console.error("Get supplier document error:", error);
    return NextResponse.json(
      { error: "Failed to fetch supplier document" },
      { status: 500 },
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const token = req.headers.get("authorization")?.split(" ")[1];
    if (!token)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const decoded = verifyToken(token);
    if (!decoded)
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });

    const body = await req.json();
    const { action, updates, cancelReason } = body;

    await dbConnect();

    const document = await SupplierDocument.findOne({
      _id: params.id,
      businessId: decoded.businessId,
    });

    if (!document) {
      return NextResponse.json(
        { error: "Supplier document not found" },
        { status: 404 },
      );
    }

    if (action === "cancel") {
      if (document.status === "CANCELLED") {
        return NextResponse.json(
          { error: "Document already cancelled" },
          { status: 409 },
        );
      }

      document.status = "CANCELLED";
      document.cancelledAt = new Date();
      document.cancelledBy = decoded.userId as any;
      document.cancelReason = cancelReason || undefined;
      await document.save();

      await SupplierDocumentAudit.create({
        businessId: decoded.businessId,
        documentId: document._id,
        supplierId: document.supplierId,
        action: "CANCEL",
        actionDescription: `Supplier document ${document.documentNumber} cancelled`,
        userId: decoded.userId,
        userEmail: decoded.email,
        ipAddress: req.headers.get("x-forwarded-for") || undefined,
        metadata: {
          cancelReason: cancelReason || null,
        },
      });

      return NextResponse.json({ document });
    }

    if (!updates || typeof updates !== "object") {
      return NextResponse.json(
        { error: "No updates provided" },
        { status: 400 },
      );
    }

    if (document.status === "APPLIED" || document.status === "CANCELLED") {
      return NextResponse.json(
        { error: "Document cannot be modified" },
        { status: 409 },
      );
    }

    const hasApplications =
      (document.appliedPaymentsTotal || 0) > 0 ||
      (document.appliedCreditsTotal || 0) > 0;

    const restrictedFields = [
      "supplierId",
      "type",
      "documentNumber",
      "pointOfSale",
      "date",
      "dueDate",
      "totalAmount",
      "balance",
    ];

    if (hasApplications) {
      const violatesRestriction = restrictedFields.some(
        (field) => field in updates,
      );
      if (violatesRestriction) {
        return NextResponse.json(
          { error: "Applied documents can only update notes or attachments" },
          { status: 409 },
        );
      }
    }

    if (
      updates.totalAmount !== undefined &&
      updates.totalAmount < document.balance
    ) {
      return NextResponse.json(
        { error: "Total amount cannot be lower than current balance" },
        { status: 400 },
      );
    }

    if (!hasApplications && updates.totalAmount !== undefined) {
      updates.balance = updates.totalAmount;
    }

    // Sanitize: only allow safe fields to be updated
    const allowedFields = [
      "type",
      "pointOfSale",
      "documentNumber",
      "date",
      "dueDate",
      "totalAmount",
      "balance",
      "notes",
      "attachments",
      "impactsStock",
      "impactsCosts",
    ];
    const sanitizedUpdates: Record<string, unknown> = {};
    for (const key of allowedFields) {
      if (key in updates) {
        sanitizedUpdates[key] = updates[key];
      }
    }

    const updatedDocument = await SupplierDocument.findOneAndUpdate(
      { _id: params.id, businessId: decoded.businessId },
      sanitizedUpdates,
      { new: true },
    );

    if (!updatedDocument) {
      return NextResponse.json(
        { error: "Failed to update document" },
        { status: 500 },
      );
    }

    const computedStatus = computeSupplierDocumentStatus(updatedDocument);
    if (computedStatus !== updatedDocument.status) {
      updatedDocument.status = computedStatus;
      await updatedDocument.save();
    }

    await SupplierDocumentAudit.create({
      businessId: decoded.businessId,
      documentId: updatedDocument._id,
      supplierId: updatedDocument.supplierId,
      action: "UPDATE",
      actionDescription: `Supplier document ${updatedDocument.documentNumber} updated`,
      userId: decoded.userId,
      userEmail: decoded.email,
      ipAddress: req.headers.get("x-forwarded-for") || undefined,
      metadata: {
        updates,
      },
    });

    return NextResponse.json({ document: updatedDocument });
  } catch (error) {
    console.error("Update supplier document error:", error);
    return NextResponse.json(
      { error: "Failed to update supplier document" },
      { status: 500 },
    );
  }
}

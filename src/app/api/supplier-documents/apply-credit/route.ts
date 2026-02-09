import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db/connect";
import SupplierDocument from "@/lib/models/SupplierDocument";
import SupplierDocumentAudit from "@/lib/models/SupplierDocumentAudit";
import { verifyToken } from "@/lib/utils/jwt";
import { computeSupplierDocumentStatus } from "@/lib/utils/supplierDocumentStatus";

export async function POST(req: NextRequest) {
  try {
    const token = req.headers.get("authorization")?.split(" ")[1];
    if (!token)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const decoded = verifyToken(token);
    if (!decoded)
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });

    const body = await req.json();
    const { creditNoteId, targetDocumentId, amount } = body;

    if (!creditNoteId || !targetDocumentId || !amount) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    const applyAmount = Number(amount);
    if (!Number.isFinite(applyAmount) || applyAmount <= 0) {
      return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
    }

    await dbConnect();

    const creditNote = await SupplierDocument.findOne({
      _id: creditNoteId,
      businessId: decoded.businessId,
    });

    if (!creditNote) {
      return NextResponse.json(
        { error: "Credit note not found" },
        { status: 404 },
      );
    }

    if (creditNote.type !== "CREDIT_NOTE") {
      return NextResponse.json(
        { error: "Document is not a credit note" },
        { status: 400 },
      );
    }

    if (creditNote.status === "CANCELLED" || creditNote.balance <= 0) {
      return NextResponse.json(
        { error: "Credit note is not available" },
        { status: 409 },
      );
    }

    const targetDocument = await SupplierDocument.findOne({
      _id: targetDocumentId,
      businessId: decoded.businessId,
    });

    if (!targetDocument) {
      return NextResponse.json(
        { error: "Target document not found" },
        { status: 404 },
      );
    }

    if (targetDocument.type === "CREDIT_NOTE") {
      return NextResponse.json(
        { error: "Credit notes cannot be applied to another credit note" },
        { status: 400 },
      );
    }

    if (targetDocument.status === "CANCELLED" || targetDocument.balance <= 0) {
      return NextResponse.json(
        { error: "Target document is not available" },
        { status: 409 },
      );
    }

    if (String(creditNote.supplierId) !== String(targetDocument.supplierId)) {
      return NextResponse.json(
        { error: "Credit note must belong to the same supplier" },
        { status: 400 },
      );
    }

    if (
      applyAmount > creditNote.balance ||
      applyAmount > targetDocument.balance
    ) {
      return NextResponse.json(
        { error: "Apply amount exceeds available balance" },
        { status: 400 },
      );
    }

    creditNote.balance = Math.max(0, creditNote.balance - applyAmount);
    creditNote.appliedCreditsTotal =
      (creditNote.appliedCreditsTotal || 0) + applyAmount;

    targetDocument.balance = Math.max(0, targetDocument.balance - applyAmount);
    targetDocument.appliedCreditsTotal =
      (targetDocument.appliedCreditsTotal || 0) + applyAmount;

    creditNote.status = computeSupplierDocumentStatus(creditNote);
    targetDocument.status = computeSupplierDocumentStatus(targetDocument);

    await creditNote.save();
    await targetDocument.save();

    await SupplierDocumentAudit.create({
      businessId: decoded.businessId,
      documentId: targetDocument._id,
      supplierId: targetDocument.supplierId,
      action: "APPLY_CREDIT",
      actionDescription: `Applied credit note ${creditNote.documentNumber} to ${targetDocument.documentNumber}`,
      userId: decoded.userId,
      userEmail: decoded.email,
      ipAddress: req.headers.get("x-forwarded-for") || undefined,
      metadata: {
        creditNoteId,
        targetDocumentId,
        amount: applyAmount,
      },
    });

    return NextResponse.json({
      creditNote,
      targetDocument,
    });
  } catch (error) {
    console.error("Apply credit note error:", error);
    return NextResponse.json(
      { error: "Failed to apply credit note" },
      { status: 500 },
    );
  }
}

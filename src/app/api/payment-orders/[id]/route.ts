import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db/connect";
import PaymentOrder from "@/lib/models/PaymentOrder";
import SupplierDocument from "@/lib/models/SupplierDocument";
import TreasuryMovement from "@/lib/models/TreasuryMovement";
import PaymentOrderAudit from "@/lib/models/PaymentOrderAudit";
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

    const paymentOrder = await PaymentOrder.findOne({
      _id: params.id,
      businessId: decoded.businessId,
    });

    if (!paymentOrder) {
      return NextResponse.json(
        { error: "Payment order not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({ paymentOrder });
  } catch (error) {
    console.error("Get payment order error:", error);
    return NextResponse.json(
      { error: "Failed to fetch payment order" },
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
    const { action, updates } = body;

    await dbConnect();

    const paymentOrder = await PaymentOrder.findOne({
      _id: params.id,
      businessId: decoded.businessId,
    });

    if (!paymentOrder) {
      return NextResponse.json(
        { error: "Payment order not found" },
        { status: 404 },
      );
    }

    if (action === "confirm") {
      if (paymentOrder.status !== "PENDING") {
        return NextResponse.json(
          { error: "Payment order cannot be confirmed" },
          { status: 409 },
        );
      }

      if (
        Math.abs(paymentOrder.netPayable - paymentOrder.paymentsTotal) > 0.01
      ) {
        return NextResponse.json(
          { error: "Payments total must match documents minus credit notes" },
          { status: 400 },
        );
      }

      for (const doc of paymentOrder.documents) {
        const supplierDoc = await SupplierDocument.findOne({
          _id: doc.documentId,
          businessId: decoded.businessId,
          supplierId: paymentOrder.supplierId,
        });
        if (!supplierDoc) {
          return NextResponse.json(
            { error: "Supplier document not found" },
            { status: 404 },
          );
        }
        const newBalance = Math.max(0, supplierDoc.balance - doc.amount);
        supplierDoc.balance = newBalance;
        supplierDoc.appliedPaymentsTotal =
          (supplierDoc.appliedPaymentsTotal || 0) + doc.amount;
        supplierDoc.status = computeSupplierDocumentStatus(supplierDoc);
        await supplierDoc.save();

        await SupplierDocumentAudit.create({
          businessId: decoded.businessId,
          documentId: supplierDoc._id,
          supplierId: supplierDoc.supplierId,
          action: "APPLY_PAYMENT",
          actionDescription: `Applied payment order #${paymentOrder.orderNumber} to ${supplierDoc.documentNumber}`,
          userId: decoded.userId,
          userEmail: decoded.email,
          ipAddress: req.headers.get("x-forwarded-for") || undefined,
          metadata: {
            paymentOrderId: paymentOrder._id,
            amount: doc.amount,
          },
        });
      }

      for (const doc of paymentOrder.creditNotes) {
        const supplierDoc = await SupplierDocument.findOne({
          _id: doc.documentId,
          businessId: decoded.businessId,
          supplierId: paymentOrder.supplierId,
        });
        if (!supplierDoc) {
          return NextResponse.json(
            { error: "Credit note not found" },
            { status: 404 },
          );
        }
        const newBalance = Math.max(0, supplierDoc.balance - doc.amount);
        supplierDoc.balance = newBalance;
        supplierDoc.appliedCreditsTotal =
          (supplierDoc.appliedCreditsTotal || 0) + doc.amount;
        supplierDoc.status = computeSupplierDocumentStatus(supplierDoc);
        await supplierDoc.save();

        await SupplierDocumentAudit.create({
          businessId: decoded.businessId,
          documentId: supplierDoc._id,
          supplierId: supplierDoc.supplierId,
          action: "APPLY_CREDIT",
          actionDescription: `Applied credit note ${supplierDoc.documentNumber} in payment order #${paymentOrder.orderNumber}`,
          userId: decoded.userId,
          userEmail: decoded.email,
          ipAddress: req.headers.get("x-forwarded-for") || undefined,
          metadata: {
            paymentOrderId: paymentOrder._id,
            amount: doc.amount,
          },
        });
      }

      for (const payment of paymentOrder.payments) {
        await TreasuryMovement.create({
          businessId: decoded.businessId,
          type: "EGRESO",
          referenceType: "PAYMENT_ORDER",
          referenceId: paymentOrder._id,
          method: payment.method,
          amount: payment.amount,
          description: `Orden de Pago #${paymentOrder.orderNumber}`,
          createdBy: decoded.userId,
        });
      }

      paymentOrder.status = "CONFIRMED";
      paymentOrder.confirmedAt = new Date();
      paymentOrder.approvedBy = decoded.userId as any;
      paymentOrder.approvedByEmail = decoded.email;
      paymentOrder.confirmationIp =
        req.headers.get("x-forwarded-for") || undefined;
      await paymentOrder.save();

      await PaymentOrderAudit.create({
        businessId: decoded.businessId,
        paymentOrderId: paymentOrder._id,
        action: "CONFIRM",
        actionDescription: `Payment order ${paymentOrder.orderNumber} confirmed`,
        userId: decoded.userId,
        userEmail: decoded.email,
        ipAddress: req.headers.get("x-forwarded-for") || undefined,
        metadata: {
          paymentsTotal: paymentOrder.paymentsTotal,
          documentsTotal: paymentOrder.documentsTotal,
          creditNotesTotal: paymentOrder.creditNotesTotal,
        },
      });

      return NextResponse.json({ paymentOrder });
    }

    if (action === "cancel") {
      if (paymentOrder.status === "CANCELLED") {
        return NextResponse.json(
          { error: "Payment order is already cancelled" },
          { status: 409 },
        );
      }

      const wasConfirmed = paymentOrder.status === "CONFIRMED";

      // If confirmed, revert all document balances and treasury movements
      if (wasConfirmed) {
        // Revert documents — add back applied amounts
        for (const doc of paymentOrder.documents) {
          const supplierDoc = await SupplierDocument.findById(doc.documentId);
          if (supplierDoc) {
            supplierDoc.balance = Math.min(
              supplierDoc.totalAmount,
              supplierDoc.balance + doc.amount,
            );
            supplierDoc.appliedPaymentsTotal = Math.max(
              0,
              (supplierDoc.appliedPaymentsTotal || 0) - doc.amount,
            );
            supplierDoc.status = computeSupplierDocumentStatus(supplierDoc);
            await supplierDoc.save();

            await SupplierDocumentAudit.create({
              businessId: decoded.businessId,
              documentId: supplierDoc._id,
              supplierId: supplierDoc.supplierId,
              action: "REVERT_PAYMENT",
              actionDescription: `Reverted payment order #${paymentOrder.orderNumber} from ${supplierDoc.documentNumber}`,
              userId: decoded.userId,
              userEmail: decoded.email,
              ipAddress: req.headers.get("x-forwarded-for") || undefined,
              metadata: {
                paymentOrderId: paymentOrder._id,
                amount: doc.amount,
              },
            });
          }
        }

        // Revert credit notes — add back applied credit amounts
        for (const doc of paymentOrder.creditNotes) {
          const supplierDoc = await SupplierDocument.findById(doc.documentId);
          if (supplierDoc) {
            supplierDoc.balance = Math.min(
              supplierDoc.totalAmount,
              supplierDoc.balance + doc.amount,
            );
            supplierDoc.appliedCreditsTotal = Math.max(
              0,
              (supplierDoc.appliedCreditsTotal || 0) - doc.amount,
            );
            supplierDoc.status = computeSupplierDocumentStatus(supplierDoc);
            await supplierDoc.save();

            await SupplierDocumentAudit.create({
              businessId: decoded.businessId,
              documentId: supplierDoc._id,
              supplierId: supplierDoc.supplierId,
              action: "REVERT_CREDIT",
              actionDescription: `Reverted credit from cancelled payment order #${paymentOrder.orderNumber}`,
              userId: decoded.userId,
              userEmail: decoded.email,
              ipAddress: req.headers.get("x-forwarded-for") || undefined,
              metadata: {
                paymentOrderId: paymentOrder._id,
                amount: doc.amount,
              },
            });
          }
        }

        // Create reversal treasury movements (INGRESO to compensate EGRESO)
        for (const payment of paymentOrder.payments) {
          await TreasuryMovement.create({
            businessId: decoded.businessId,
            type: "INGRESO",
            referenceType: "PAYMENT_ORDER",
            referenceId: paymentOrder._id,
            method: payment.method,
            amount: payment.amount,
            description: `Anulación Orden Pago #${paymentOrder.orderNumber}`,
            createdBy: decoded.userId,
          });
        }
      }

      paymentOrder.status = "CANCELLED";
      paymentOrder.cancelledAt = new Date();
      paymentOrder.cancelledBy = decoded.userId as any;
      paymentOrder.cancelledByEmail = decoded.email;
      paymentOrder.cancelReason = body.reason || undefined;
      await paymentOrder.save();

      await PaymentOrderAudit.create({
        businessId: decoded.businessId,
        paymentOrderId: paymentOrder._id,
        action: "CANCEL",
        actionDescription: `Payment order ${paymentOrder.orderNumber} cancelled${wasConfirmed ? " (balances reverted)" : ""}`,
        userId: decoded.userId,
        userEmail: decoded.email,
        ipAddress: req.headers.get("x-forwarded-for") || undefined,
        metadata: { wasConfirmed, reason: body.reason },
      });

      return NextResponse.json({ paymentOrder });
    }

    if (paymentOrder.status !== "PENDING") {
      return NextResponse.json(
        { error: "Confirmed payment order cannot be edited" },
        { status: 409 },
      );
    }

    if (!updates) {
      return NextResponse.json(
        { error: "No updates provided" },
        { status: 400 },
      );
    }

    const updatedOrder = await PaymentOrder.findOneAndUpdate(
      { _id: params.id, businessId: decoded.businessId },
      updates,
      { new: true },
    );

    return NextResponse.json({ paymentOrder: updatedOrder });
  } catch (error) {
    console.error("Update payment order error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to update payment order",
      },
      { status: 500 },
    );
  }
}

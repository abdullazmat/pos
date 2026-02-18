import { NextRequest } from "next/server";
import dbConnect from "@/lib/db/connect";
import SupplierReturn from "@/lib/models/SupplierReturn";
import Product from "@/lib/models/Product";
import StockHistory from "@/lib/models/StockHistory";
import SupplierDocument from "@/lib/models/SupplierDocument";
import { authMiddleware } from "@/lib/middleware/auth";
import {
  generateErrorResponse,
  generateSuccessResponse,
} from "@/lib/utils/helpers";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const authResult = await authMiddleware(req);
    if (!authResult.authorized) {
      return generateErrorResponse(authResult.error || "Unauthorized", 401);
    }

    const { businessId } = authResult.user!;
    await dbConnect();

    const supplierReturn = await SupplierReturn.findOne({
      _id: params.id,
      businessId,
    })
      .populate("supplierId", "name document phone email")
      .populate("receiptId", "documentNumber documentType documentDate")
      .lean();

    if (!supplierReturn) {
      return generateErrorResponse("Supplier return not found", 404);
    }

    return generateSuccessResponse({ supplierReturn });
  } catch (error) {
    console.error("Get supplier return error:", error);
    return generateErrorResponse("Internal server error", 500);
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const authResult = await authMiddleware(req);
    if (!authResult.authorized) {
      return generateErrorResponse(authResult.error || "Unauthorized", 401);
    }

    const { businessId, userId } = authResult.user!;
    const body = await req.json();
    const { action } = body;

    await dbConnect();

    const supplierReturn = await SupplierReturn.findOne({
      _id: params.id,
      businessId,
    });

    if (!supplierReturn) {
      return generateErrorResponse("Supplier return not found", 404);
    }

    if (action === "confirm") {
      if (supplierReturn.status !== "DRAFT") {
        return generateErrorResponse(
          "Only DRAFT returns can be confirmed",
          400,
        );
      }

      // 1. If physical stock exit, reduce stock
      if (supplierReturn.physicalStockExit) {
        for (const item of supplierReturn.items) {
          const product = await Product.findOne({
            _id: item.productId,
            businessId,
          });
          if (!product) continue;

          product.stock = Math.max(0, product.stock - item.quantity);
          await product.save();

          await StockHistory.create({
            businessId,
            productId: item.productId,
            type: "adjustment",
            quantity: item.quantity,
            reference: supplierReturn._id,
            referenceModel: "SupplierReturn",
            notes: `Supplier return - ${supplierReturn.reason}`,
          });
        }
      }

      // 2. Create credit note (SupplierDocument of type CREDIT_NOTE)
      const creditNote = await SupplierDocument.create({
        businessId,
        supplierId: supplierReturn.supplierId,
        channel: 1,
        type: "CREDIT_NOTE",
        documentNumber:
          supplierReturn.creditNoteNumber ||
          `RET-${supplierReturn._id.toString().slice(-8).toUpperCase()}`,
        date: supplierReturn.creditNoteDate || new Date(),
        totalAmount: supplierReturn.totalAmount,
        balance: supplierReturn.totalAmount,
        status: "PENDING",
        impactsStock: false,
        impactsCosts: false,
        notes: `Credit from supplier return${supplierReturn.receiptId ? ` (receipt ref)` : ""}`,
        createdBy: userId,
      });

      supplierReturn.creditNoteId = creditNote._id;
      supplierReturn.status = "CONFIRMED";
      await supplierReturn.save();

      // 3. If there's a linked bill, try to apply credit
      if (supplierReturn.supplierBillId) {
        const bill = await SupplierDocument.findOne({
          _id: supplierReturn.supplierBillId,
          businessId,
        });

        if (bill && bill.balance > 0) {
          const applyAmount = Math.min(creditNote.totalAmount, bill.balance);

          bill.balance -= applyAmount;
          bill.appliedCreditsTotal += applyAmount;
          if (bill.balance <= 0) {
            bill.status = "APPLIED";
          } else {
            bill.status = "PARTIALLY_APPLIED";
          }
          await bill.save();

          creditNote.balance -= applyAmount;
          if (creditNote.balance <= 0) {
            creditNote.status = "APPLIED";
          } else {
            creditNote.status = "PARTIALLY_APPLIED";
          }
          await creditNote.save();
        }
      }

      return generateSuccessResponse({ supplierReturn, creditNote });
    }

    if (action === "cancel") {
      if (supplierReturn.status === "CANCELLED") {
        return generateErrorResponse("Return is already cancelled", 400);
      }

      // Reverse stock if it was confirmed with physical exit
      if (
        supplierReturn.status === "CONFIRMED" &&
        supplierReturn.physicalStockExit
      ) {
        for (const item of supplierReturn.items) {
          const product = await Product.findOne({
            _id: item.productId,
            businessId,
          });
          if (!product) continue;

          product.stock += item.quantity;
          await product.save();

          await StockHistory.create({
            businessId,
            productId: item.productId,
            type: "adjustment",
            quantity: item.quantity,
            reference: supplierReturn._id,
            referenceModel: "SupplierReturn",
            notes: `Reversal: cancelled supplier return`,
          });
        }
      }

      // Cancel associated credit note
      if (supplierReturn.creditNoteId) {
        await SupplierDocument.findByIdAndUpdate(supplierReturn.creditNoteId, {
          status: "CANCELLED",
          cancelledAt: new Date(),
          cancelledBy: userId,
          cancelReason: "Associated supplier return cancelled",
        });
      }

      supplierReturn.status = "CANCELLED";
      supplierReturn.cancelledAt = new Date();
      supplierReturn.cancelledBy = userId;
      supplierReturn.cancelReason = body.cancelReason || "Cancelled by user";
      await supplierReturn.save();

      return generateSuccessResponse({ supplierReturn });
    }

    return generateErrorResponse("Invalid action. Use: confirm or cancel", 400);
  } catch (error) {
    console.error("Update supplier return error:", error);
    return generateErrorResponse("Internal server error", 500);
  }
}

import { NextRequest } from "next/server";
import dbConnect from "@/lib/db/connect";
import GoodsReceipt from "@/lib/models/GoodsReceipt";
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

    const receipt = await GoodsReceipt.findOne({
      _id: params.id,
      businessId,
    })
      .populate("supplierId", "name document phone email")
      .lean();

    if (!receipt) {
      return generateErrorResponse("Receipt not found", 404);
    }

    return generateSuccessResponse({ receipt });
  } catch (error) {
    console.error("Get goods receipt error:", error);
    return generateErrorResponse("Internal server error", 500);
  }
}

// Confirm receipt - impacts stock and optionally creates bill
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const authResult = await authMiddleware(req);
    if (!authResult.authorized) {
      return generateErrorResponse(authResult.error || "Unauthorized", 401);
    }

    const { businessId, userId, email } = authResult.user!;
    const body = await req.json();
    const { action } = body;

    await dbConnect();

    const receipt = await GoodsReceipt.findOne({
      _id: params.id,
      businessId,
    });

    if (!receipt) {
      return generateErrorResponse("Receipt not found", 404);
    }

    if (action === "confirm") {
      if (receipt.status !== "DRAFT") {
        return generateErrorResponse(
          "Only DRAFT receipts can be confirmed",
          400,
        );
      }

      // 1. Update stock for each item
      for (const item of receipt.items) {
        const product = await Product.findOne({
          _id: item.productId,
          businessId,
        });
        if (!product) continue;

        // Calculate new average cost
        const currentTotalValue = product.stock * product.cost;
        const incomingTotalValue = item.quantity * item.unitCost;
        const newTotalQty = product.stock + item.quantity;
        const newAvgCost =
          newTotalQty > 0
            ? (currentTotalValue + incomingTotalValue) / newTotalQty
            : item.unitCost;

        // Update product stock and cost
        product.stock = newTotalQty;
        product.cost = Math.round(newAvgCost * 100) / 100;
        product.margin =
          product.price > 0
            ? ((product.price - product.cost) / product.price) * 100
            : 0;
        await product.save();

        // Create stock movement
        await StockHistory.create({
          businessId,
          productId: item.productId,
          type: "supplier_receipt",
          quantity: item.quantity,
          reference: receipt._id,
          referenceModel: "GoodsReceipt",
          referenceDocumentNumber: receipt.documentNumber,
          supplierId: receipt.supplierId,
          userId,
          unitCost: item.unitCost,
          notes: `Goods receipt #${receipt.documentNumber} from supplier`,
        });
      }

      // 2. Determine status based on document type
      const invoiceTypes = ["INVOICE_A", "INVOICE_B", "INVOICE_C"];
      const isInvoice = invoiceTypes.includes(receipt.documentType);

      if (isInvoice) {
        // Scenario A: Receipt with Invoice → create pending bill
        const bill = await SupplierDocument.create({
          businessId,
          supplierId: receipt.supplierId,
          channel: 1,
          type:
            receipt.documentType === "INVOICE_A"
              ? "INVOICE_A"
              : receipt.documentType === "INVOICE_B"
                ? "INVOICE_B"
                : receipt.documentType === "INVOICE_C"
                  ? "INVOICE_C"
                  : "INVOICE",
          documentNumber: receipt.documentNumber,
          date: receipt.documentDate,
          totalAmount: receipt.totalAmount,
          balance: receipt.totalAmount,
          status: "PENDING",
          impactsStock: false, // stock already impacted by receipt
          impactsCosts: false,
          notes: `Auto-created from goods receipt`,
          createdBy: userId,
        });

        receipt.supplierBillId = bill._id;
        receipt.status = "BILLED";
      } else {
        // Scenario B: Delivery Note / Other → stock impacted, no bill yet
        receipt.status = "PENDING_BILLING";
      }

      await receipt.save();

      return generateSuccessResponse({ receipt });
    }

    if (action === "cancel") {
      if (receipt.status === "CANCELLED") {
        return generateErrorResponse("Receipt is already cancelled", 400);
      }

      // If receipt was confirmed, reverse stock
      if (
        receipt.status === "CONFIRMED" ||
        receipt.status === "PENDING_BILLING" ||
        receipt.status === "BILLED"
      ) {
        for (const item of receipt.items) {
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
            reference: receipt._id,
            referenceModel: "GoodsReceipt",
            referenceDocumentNumber: receipt.documentNumber,
            supplierId: receipt.supplierId,
            userId,
            notes: `Reversal: cancelled goods receipt #${receipt.documentNumber}`,
          });
        }

        // If there was a bill created, cancel it too
        if (receipt.supplierBillId) {
          await SupplierDocument.findByIdAndUpdate(receipt.supplierBillId, {
            status: "CANCELLED",
            cancelledAt: new Date(),
            cancelledBy: userId,
            cancelReason: "Associated goods receipt cancelled",
          });
        }
      }

      receipt.status = "CANCELLED";
      receipt.cancelledAt = new Date();
      receipt.cancelledBy = userId;
      receipt.cancelReason = body.cancelReason || "Cancelled by user";
      await receipt.save();

      return generateSuccessResponse({ receipt });
    }

    // Link bill to a pending_billing receipt
    if (action === "link_bill") {
      if (receipt.status !== "PENDING_BILLING") {
        return generateErrorResponse(
          "Only PENDING_BILLING receipts can be linked to a bill",
          400,
        );
      }

      const { billId } = body;
      if (!billId) {
        return generateErrorResponse("billId is required", 400);
      }

      const bill = await SupplierDocument.findOne({
        _id: billId,
        businessId,
        supplierId: receipt.supplierId,
      });
      if (!bill) {
        return generateErrorResponse("Bill not found for this supplier", 404);
      }

      receipt.supplierBillId = bill._id;
      receipt.status = "BILLED";
      await receipt.save();

      return generateSuccessResponse({ receipt });
    }

    return generateErrorResponse(
      "Invalid action. Use: confirm, cancel, or link_bill",
      400,
    );
  } catch (error) {
    console.error("Update goods receipt error:", error);
    return generateErrorResponse("Internal server error", 500);
  }
}

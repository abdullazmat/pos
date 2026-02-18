import { NextRequest } from "next/server";
import dbConnect from "@/lib/db/connect";
import SupplierReturn from "@/lib/models/SupplierReturn";
import GoodsReceipt from "@/lib/models/GoodsReceipt";
import { authMiddleware } from "@/lib/middleware/auth";
import {
  generateErrorResponse,
  generateSuccessResponse,
} from "@/lib/utils/helpers";

export async function GET(req: NextRequest) {
  try {
    const authResult = await authMiddleware(req);
    if (!authResult.authorized) {
      return generateErrorResponse(authResult.error || "Unauthorized", 401);
    }

    const { businessId } = authResult.user!;
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const supplierId = searchParams.get("supplierId");
    const limit = parseInt(searchParams.get("limit") || "100");
    const page = parseInt(searchParams.get("page") || "1");

    await dbConnect();

    const filter: Record<string, unknown> = { businessId };
    if (status) filter.status = status;
    if (supplierId) filter.supplierId = supplierId;

    const total = await SupplierReturn.countDocuments(filter);
    const returns = await SupplierReturn.find(filter)
      .populate("supplierId", "name document")
      .populate("receiptId", "documentNumber documentType")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    return generateSuccessResponse({
      returns,
      pagination: { total, page, limit, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error("Get supplier returns error:", error);
    return generateErrorResponse("Internal server error", 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    const authResult = await authMiddleware(req);
    if (!authResult.authorized) {
      return generateErrorResponse(authResult.error || "Unauthorized", 401);
    }

    const { businessId, userId, email } = authResult.user!;
    const body = await req.json();
    const {
      supplierId,
      date,
      returnType,
      reason,
      notes,
      physicalStockExit,
      receiptId,
      supplierBillId,
      creditNoteNumber,
      creditNoteDate,
      items,
    } = body;

    if (!supplierId || !reason || !items?.length) {
      return generateErrorResponse("Missing required fields", 400);
    }

    await dbConnect();

    // If linking to a receipt, validate it
    if (receiptId) {
      const receipt = await GoodsReceipt.findOne({
        _id: receiptId,
        businessId,
        supplierId,
      });
      if (!receipt) {
        return generateErrorResponse(
          "Referenced receipt not found for this supplier",
          404,
        );
      }
    }

    // Build return items
    const returnItems = items.map(
      (item: {
        productId: string;
        productName: string;
        productCode: string;
        quantity: number;
        unitCost: number;
      }) => ({
        productId: item.productId,
        productName: item.productName,
        productCode: item.productCode,
        quantity: item.quantity,
        unitCost: item.unitCost,
        subtotal: item.quantity * item.unitCost,
      }),
    );

    const totalAmount = returnItems.reduce(
      (sum: number, item: { subtotal: number }) => sum + item.subtotal,
      0,
    );

    const supplierReturn = new SupplierReturn({
      businessId,
      supplierId,
      date: date || new Date(),
      returnType:
        returnType ||
        (physicalStockExit ? "PHYSICAL_RETURN" : "ECONOMIC_ADJUSTMENT"),
      reason,
      notes,
      physicalStockExit: physicalStockExit ?? true,
      receiptId,
      supplierBillId,
      creditNoteNumber,
      creditNoteDate,
      items: returnItems,
      totalAmount,
      totalItems: returnItems.length,
      status: "DRAFT",
      createdByUserId: userId,
      createdByEmail: email,
    });

    await supplierReturn.save();

    return generateSuccessResponse({ supplierReturn }, 201);
  } catch (error) {
    console.error("Create supplier return error:", error);
    return generateErrorResponse("Internal server error", 500);
  }
}

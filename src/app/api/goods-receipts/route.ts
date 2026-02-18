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

    const total = await GoodsReceipt.countDocuments(filter);
    const receipts = await GoodsReceipt.find(filter)
      .populate("supplierId", "name document")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    return generateSuccessResponse({
      receipts,
      pagination: { total, page, limit, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error("Get goods receipts error:", error);
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
      documentType,
      documentNumber,
      documentDate,
      receiptDate,
      notes,
      items,
    } = body;

    // Validate required fields
    if (!supplierId || !documentType || !documentNumber || !items?.length) {
      return generateErrorResponse("Missing required fields", 400);
    }

    await dbConnect();

    // Validate duplicate document number per supplier
    const existingReceipt = await GoodsReceipt.findOne({
      businessId,
      supplierId,
      documentNumber: documentNumber.trim(),
    });
    if (existingReceipt) {
      return generateErrorResponse(
        "A receipt with this document number already exists for this supplier",
        409,
      );
    }

    // Validate all products exist and belong to business
    const productIds = items.map(
      (item: { productId: string }) => item.productId,
    );
    const products = await Product.find({
      _id: { $in: productIds },
      businessId,
    });
    if (products.length !== productIds.length) {
      return generateErrorResponse("One or more products not found", 404);
    }

    const productMap = new Map(products.map((p) => [p._id.toString(), p]));

    // Build receipt items with product info
    const receiptItems = items.map(
      (item: {
        productId: string;
        quantity: number;
        unitCost: number;
        lot?: string;
        expirationDate?: string;
      }) => {
        const product = productMap.get(item.productId);
        return {
          productId: item.productId,
          productName: product!.name,
          productCode: product!.code,
          quantity: item.quantity,
          unitCost: item.unitCost,
          subtotal: item.quantity * item.unitCost,
          lot: item.lot,
          expirationDate: item.expirationDate,
        };
      },
    );

    const totalAmount = receiptItems.reduce(
      (sum: number, item: { subtotal: number }) => sum + item.subtotal,
      0,
    );

    const receipt = new GoodsReceipt({
      businessId,
      supplierId,
      documentType,
      documentNumber: documentNumber.trim(),
      documentDate: documentDate || new Date(),
      receiptDate: receiptDate || new Date(),
      notes,
      receivingUserId: userId,
      receivingUserEmail: email,
      items: receiptItems,
      totalAmount,
      totalItems: receiptItems.length,
      status: "DRAFT",
    });

    await receipt.save();

    return generateSuccessResponse({ receipt }, 201);
  } catch (error: unknown) {
    console.error("Create goods receipt error:", error);
    if (
      error &&
      typeof error === "object" &&
      "code" in error &&
      (error as { code: number }).code === 11000
    ) {
      return generateErrorResponse(
        "Duplicate document number for this supplier",
        409,
      );
    }
    return generateErrorResponse("Internal server error", 500);
  }
}

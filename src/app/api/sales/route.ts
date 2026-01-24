import { NextRequest } from "next/server";
import dbConnect from "@/lib/db/connect";
import Sale from "@/lib/models/Sale";
import Product from "@/lib/models/Product";
import StockHistory from "@/lib/models/StockHistory";
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
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    await dbConnect();

    const query: Record<string, unknown> = { businessId };
    if (startDate && endDate) {
      query.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }

    const sales = await Sale.find(query)
      .sort({ createdAt: -1 })
      .limit(100)
      .lean();

    return generateSuccessResponse({ sales });
  } catch (error) {
    console.error("Get sales error:", error);
    return generateErrorResponse("Internal server error", 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    const authResult = await authMiddleware(req);
    if (!authResult.authorized) {
      return generateErrorResponse(authResult.error || "Unauthorized", 401);
    }

    const { businessId, userId } = authResult.user!;
    const body = await req.json();
    const {
      items,
      discount = 0,
      paymentMethod = "cash",
      cashRegisterId,
    } = body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return generateErrorResponse("No items in sale", 400);
    }

    await dbConnect();

    let subtotal = 0;
    const saleItems = [];

    for (const item of items) {
      const product = await Product.findOne({
        _id: item.productId,
        businessId,
      });
      if (!product) {
        return generateErrorResponse(
          `Product not found: ${item.productId}`,
          404,
        );
      }

      if (product.stock < item.quantity) {
        return generateErrorResponse(
          `Insufficient stock for ${product.name}`,
          400,
        );
      }

      const itemTotal = item.unitPrice * item.quantity - (item.discount || 0);
      subtotal += itemTotal;

      saleItems.push({
        productId: item.productId,
        productName: product.name,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        discount: item.discount || 0,
        total: itemTotal,
      });

      // Reduce stock
      product.stock -= item.quantity;
      await product.save();

      // Record stock history
      await StockHistory.create({
        businessId,
        productId: item.productId,
        type: "sale",
        quantity: -item.quantity,
        reference: null,
        referenceModel: "Sale",
      });
    }

    const total = subtotal - discount;

    const sale = new Sale({
      businessId,
      userId,
      items: saleItems,
      subtotal,
      discount,
      total,
      paymentMethod,
      paymentStatus: "completed",
      cashRegisterId,
    });

    await sale.save();

    return generateSuccessResponse({ sale }, 201);
  } catch (error) {
    console.error("Create sale error:", error);
    return generateErrorResponse("Internal server error", 500);
  }
}

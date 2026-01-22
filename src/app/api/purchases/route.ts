import { NextRequest } from "next/server";
import dbConnect from "@/lib/db/connect";
import Purchase from "@/lib/models/Purchase";
import Product from "@/lib/models/Product";
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

    await dbConnect();

    const purchases = await Purchase.find({ businessId })
      .sort({ createdAt: -1 })
      .limit(100)
      .lean();

    return generateSuccessResponse({ purchases });
  } catch (error) {
    console.error("Get purchases error:", error);
    return generateErrorResponse("Internal server error", 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    const authResult = await authMiddleware(req);
    if (!authResult.authorized) {
      return generateErrorResponse(authResult.error || "Unauthorized", 401);
    }

    const { businessId } = authResult.user!;
    const body = await req.json();
    const { productId, quantity, costPrice, supplier, invoiceNumber, notes } =
      body;

    if (!productId || !quantity || !costPrice) {
      return generateErrorResponse("Missing required fields", 400);
    }

    await dbConnect();

    const product = await Product.findOne({ _id: productId, businessId });
    if (!product) {
      return generateErrorResponse("Product not found", 404);
    }

    const totalCost = quantity * costPrice;

    const purchase = new Purchase({
      businessId,
      productId,
      quantity,
      costPrice,
      totalCost,
      supplier,
      invoiceNumber,
      notes,
    });

    // Update product stock and cost
    product.stock += quantity;
    product.cost = costPrice;
    product.margin = ((product.price - costPrice) / product.price) * 100;
    await product.save();

    await purchase.save();

    return generateSuccessResponse({ purchase }, 201);
  } catch (error) {
    console.error("Create purchase error:", error);
    return generateErrorResponse("Internal server error", 500);
  }
}

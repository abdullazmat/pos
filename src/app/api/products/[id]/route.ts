import { NextRequest } from "next/server";
import dbConnect from "@/lib/db/connect";
import Product from "@/lib/models/Product";
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
    const { id } = params;

    await dbConnect();

    // Find product by ID and verify it belongs to the business
    const product = await Product.findOne({
      _id: id,
      businessId,
    }).lean();

    if (!product) {
      return generateErrorResponse("Product not found", 404);
    }

    return generateSuccessResponse({
      data: product,
    });
  } catch (error) {
    console.error("Get product error:", error);
    return generateErrorResponse("Failed to get product", 500);
  }
}

import { NextRequest } from "next/server";
import dbConnect from "@/lib/db/connect";
import Product from "@/lib/models/Product";
import Subscription from "@/lib/models/Subscription";
import { authMiddleware } from "@/lib/middleware/auth";
import {
  generateErrorResponse,
  generateSuccessResponse,
} from "@/lib/utils/helpers";
import { checkPlanLimit } from "@/lib/utils/planValidation";
import { generateSimple4DigitCode } from "@/lib/utils/productCodeGenerator";

export async function GET(req: NextRequest) {
  try {
    const authResult = await authMiddleware(req);
    if (!authResult.authorized) {
      return generateErrorResponse(authResult.error || "Unauthorized", 401);
    }

    const { businessId } = authResult.user!;
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";
    const category = searchParams.get("category");

    await dbConnect();

    const query: Record<string, unknown> = { businessId };
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { code: { $regex: search, $options: "i" } },
        { barcode: { $regex: search, $options: "i" } },
      ];
    }
    if (category) {
      query.category = category;
    }

    const products = await Product.find(query).lean();

    return generateSuccessResponse({ products });
  } catch (error) {
    console.error("Get products error:", error);
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
    const {
      name,
      code,
      cost,
      price,
      stock,
      barcode,
      category,
      description,
      minStock,
      active,
      isSoldByWeight,
      margin,
    } = body;

    if (!name || !cost || !price) {
      return generateErrorResponse("Missing required fields", 400);
    }

    await dbConnect();

    const productCount = await Product.countDocuments({ businessId });
    const planCheck = await checkPlanLimit(
      businessId,
      "maxProducts",
      productCount,
    );
    if (!planCheck.allowed) {
      return generateErrorResponse(planCheck.message, 403);
    }

    // Auto-generate 4-digit code
    let finalCode = code;
    if (!finalCode) {
      finalCode = await generateSimple4DigitCode(businessId);
      // Ensure the generated code is unique
      let attempts = 0;
      while (
        (await Product.findOne({ businessId, code: finalCode })) &&
        attempts < 10
      ) {
        finalCode = await generateSimple4DigitCode(businessId);
        attempts++;
      }
    }

    const calculatedMargin = margin || ((price - cost) / price) * 100;

    const existingProduct = await Product.findOne({
      businessId,
      code: finalCode,
    });
    if (existingProduct) {
      return generateErrorResponse("Product code already exists", 409);
    }

    const product = new Product({
      businessId,
      name,
      code: finalCode,
      cost,
      price,
      margin: calculatedMargin,
      stock: stock || 0,
      barcode,
      category,
      description,
      minStock: minStock || 0,
      active: active !== false,
      isSoldByWeight: isSoldByWeight === true,
    });

    await product.save();

    return generateSuccessResponse({ product }, 201);
  } catch (error) {
    console.error("Create product error:", error);
    return generateErrorResponse("Internal server error", 500);
  }
}

export async function PUT(req: NextRequest) {
  try {
    const authResult = await authMiddleware(req);
    if (!authResult.authorized) {
      return generateErrorResponse(authResult.error || "Unauthorized", 401);
    }

    const { businessId } = authResult.user!;
    const body = await req.json();
    const {
      id,
      name,
      code,
      cost,
      price,
      stock,
      barcode,
      category,
      description,
      minStock,
      active,
      isSoldByWeight,
      margin,
    } = body;

    if (!id) {
      return generateErrorResponse("Missing product id", 400);
    }

    await dbConnect();

    const product = await Product.findOne({ _id: id, businessId });
    if (!product) {
      return generateErrorResponse("Product not found", 404);
    }

    // Ensure code uniqueness within business
    if (code && code !== product.code) {
      const conflict = await Product.findOne({ businessId, code });
      if (conflict) {
        return generateErrorResponse("Product code already exists", 409);
      }
    }

    product.name = name ?? product.name;
    product.code = code ?? product.code;
    if (typeof cost === "number") product.cost = cost;
    if (typeof price === "number") product.price = price;
    if (typeof stock === "number") product.stock = stock;
    if (category !== undefined) product.category = category;
    if (barcode !== undefined) product.barcode = barcode;
    if (description !== undefined) product.description = description;
    if (typeof minStock === "number") product.minStock = minStock;
    if (typeof active === "boolean") product.active = active;
    if (typeof isSoldByWeight === "boolean")
      product.isSoldByWeight = isSoldByWeight;

    if (product.price && product.cost) {
      product.margin =
        margin || ((product.price - product.cost) / product.price) * 100;
    }

    await product.save();

    return generateSuccessResponse({ product });
  } catch (error) {
    console.error("Update product error:", error);
    return generateErrorResponse("Internal server error", 500);
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const authResult = await authMiddleware(req);
    if (!authResult.authorized) {
      return generateErrorResponse(authResult.error || "Unauthorized", 401);
    }

    const { businessId } = authResult.user!;
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return generateErrorResponse("Missing product id", 400);
    }

    await dbConnect();

    const product = await Product.findOne({ _id: id, businessId });
    if (!product) {
      return generateErrorResponse("Product not found", 404);
    }

    await Product.deleteOne({ _id: id, businessId });

    return generateSuccessResponse({
      message: "Product deleted successfully",
    });
  } catch (error) {
    console.error("Delete product error:", error);
    return generateErrorResponse("Internal server error", 500);
  }
}

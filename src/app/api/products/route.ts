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
import {
  generateDateBasedProductCode,
  generateNextProductInternalId,
} from "@/lib/utils/productCodeGenerator";

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
        { barcodes: { $regex: search, $options: "i" } },
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
      barcodes,
      category,
      description,
      minStock,
      active,
      isSoldByWeight,
      margin,
    } = body;

    if (!name || typeof cost !== "number" || typeof price !== "number") {
      return generateErrorResponse("Missing required fields", 400);
    }

    if (cost < 0 || price < 0) {
      return generateErrorResponse("Price and cost must be 0 or greater", 400);
    }

    // Check for duplicate name or barcode
    const duplicate = await Product.findOne({
      businessId,
      $or: [
        { name: { $regex: `^${name}$`, $options: "i" } },
        ...(Array.isArray(barcodes) && barcodes.length > 0
          ? [{ barcodes: { $in: barcodes.filter(Boolean) } }]
          : []),
      ],
    });
    if (duplicate) {
      return generateErrorResponse({ key: "duplicateNameOrBarcode" }, 409);
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

    // Auto-generate date-based code (SKU)
    let finalCode = code;
    if (!finalCode) {
      finalCode = await generateDateBasedProductCode(businessId);
      // Ensure the generated code is unique
      let attempts = 0;
      while (
        (await Product.findOne({ businessId, code: finalCode })) &&
        attempts < 10
      ) {
        finalCode = await generateDateBasedProductCode(businessId);
        attempts++;
      }
    }

    const calculatedMargin =
      typeof margin === "number"
        ? margin
        : price > 0
          ? ((price - cost) / price) * 100
          : 0;

    const existingProduct = await Product.findOne({
      businessId,
      code: finalCode,
    });
    if (existingProduct) {
      return generateErrorResponse({ key: "duplicateCode" }, 409);
    }

    const internalId = await generateNextProductInternalId(businessId);

    const product = new Product({
      businessId,
      internalId,
      name,
      code: finalCode,
      cost,
      price,
      margin: calculatedMargin,
      stock: stock || 0,
      barcodes: Array.isArray(barcodes) ? barcodes.filter(Boolean) : [],
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
      barcodes,
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
    if (typeof cost === "number") {
      if (cost < 0) {
        return generateErrorResponse("Cost must be 0 or greater", 400);
      }
      product.cost = cost;
    }
    if (typeof price === "number") {
      if (price < 0) {
        return generateErrorResponse("Price must be 0 or greater", 400);
      }
      product.price = price;
    }
    if (typeof stock === "number") product.stock = stock;
    if (category !== undefined) product.category = category;
    if (Array.isArray(barcodes)) {
      product.barcodes = barcodes.filter(Boolean);
    }
    if (description !== undefined) product.description = description;
    if (typeof minStock === "number") product.minStock = minStock;
    if (typeof active === "boolean") product.active = active;
    if (typeof isSoldByWeight === "boolean")
      product.isSoldByWeight = isSoldByWeight;

    if (typeof product.price === "number" && typeof product.cost === "number") {
      product.margin =
        typeof margin === "number"
          ? margin
          : product.price > 0
            ? ((product.price - product.cost) / product.price) * 100
            : 0;
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

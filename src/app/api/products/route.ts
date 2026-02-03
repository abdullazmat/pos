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
import { generateNextProductInternalId } from "@/lib/utils/productCodeGenerator";

const normalizeCode = (value: string | undefined | null) =>
  (value || "").toString().trim().toLowerCase().replace(/[-\s]/g, "");

const escapeRegex = (value: string) =>
  value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const buildLooseRegex = (normalized: string) =>
  new RegExp(
    `^${normalized
      .split("")
      .map((char) => escapeRegex(char))
      .join("[-\\s]*")}$`,
    "i",
  );

const buildBarcodeConflictQuery = (
  businessId: string,
  rawValues: string[],
  normalizedValues: string[],
  excludeId?: string,
) => {
  const orConditions: Array<Record<string, unknown>> = [];

  if (rawValues.length > 0) {
    orConditions.push({ code: { $in: rawValues } });
    orConditions.push({ barcodes: { $in: rawValues } });
  }

  normalizedValues.forEach((normalized) => {
    const regex = buildLooseRegex(normalized);
    orConditions.push({ code: { $regex: regex } });
    orConditions.push({ barcodes: { $regex: regex } });
  });

  const query: Record<string, unknown> = { businessId, $or: orConditions };
  if (excludeId) {
    query._id = { $ne: excludeId };
  }

  return query;
};

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
    if (!category || typeof category !== "string" || !category.trim()) {
      return generateErrorResponse({ key: "categoryRequired" }, 400);
    }

    if (cost < 0 || price < 0) {
      return generateErrorResponse("Price and cost must be 0 or greater", 400);
    }

    await dbConnect();

    // Check for duplicate name
    const duplicateName = await Product.findOne({
      businessId,
      name: { $regex: `^${name}$`, $options: "i" },
    });
    if (duplicateName) {
      return generateErrorResponse({ key: "duplicateNameOrBarcode" }, 409);
    }

    const productCount = await Product.countDocuments({ businessId });
    const planCheck = await checkPlanLimit(
      businessId,
      "maxProducts",
      productCount,
    );
    if (!planCheck.allowed) {
      return generateErrorResponse(planCheck.message, 403);
    }

    const internalId = await generateNextProductInternalId(businessId);

    // Auto-generate 4-digit sequential code (e.g., 0009)
    let finalCode = code;
    if (!finalCode) {
      finalCode = String(internalId).padStart(4, "0");
    }

    const calculatedMargin =
      typeof margin === "number"
        ? margin
        : price > 0
          ? ((price - cost) / price) * 100
          : 0;

    const cleanedBarcodes = Array.isArray(barcodes)
      ? barcodes
          .map((value) => String(value || "").trim())
          .filter((value) => value.length > 0)
      : [];

    const rawCodes = [finalCode, ...cleanedBarcodes].filter(Boolean);
    const normalizedCodes = rawCodes
      .map((value) => normalizeCode(value))
      .filter(Boolean);

    if (normalizedCodes.length !== new Set(normalizedCodes).size) {
      return generateErrorResponse({ key: "duplicateCodeOrBarcode" }, 409);
    }

    const conflictQuery = buildBarcodeConflictQuery(
      businessId,
      rawCodes,
      normalizedCodes,
    );
    const existingConflict = await Product.findOne(conflictQuery);
    if (existingConflict) {
      return generateErrorResponse({ key: "duplicateCodeOrBarcode" }, 409);
    }

    const product = new Product({
      businessId,
      internalId,
      name,
      code: finalCode,
      cost,
      price,
      margin: calculatedMargin,
      stock: stock || 0,
      barcodes: cleanedBarcodes,
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

    const nextCode = code ?? product.code;
    const nextBarcodes = Array.isArray(barcodes)
      ? barcodes
          .map((value) => String(value || "").trim())
          .filter((value) => value.length > 0)
      : Array.isArray(product.barcodes)
        ? product.barcodes
        : [];

    const rawCodes = [nextCode, ...nextBarcodes].filter(Boolean);
    const normalizedCodes = rawCodes
      .map((value) => normalizeCode(value))
      .filter(Boolean);

    if (normalizedCodes.length !== new Set(normalizedCodes).size) {
      return generateErrorResponse({ key: "duplicateCodeOrBarcode" }, 409);
    }

    const conflictQuery = buildBarcodeConflictQuery(
      businessId,
      rawCodes,
      normalizedCodes,
      id,
    );
    const existingConflict = await Product.findOne(conflictQuery);
    if (existingConflict) {
      return generateErrorResponse({ key: "duplicateCodeOrBarcode" }, 409);
    }

    product.name = name ?? product.name;
    product.code = nextCode ?? product.code;
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
    if (category !== undefined) {
      if (!category || !String(category).trim()) {
        return generateErrorResponse({ key: "categoryRequired" }, 400);
      }
      product.category = category;
    }
    if (Array.isArray(barcodes)) {
      product.barcodes = nextBarcodes;
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

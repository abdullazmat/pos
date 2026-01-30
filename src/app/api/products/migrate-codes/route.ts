import { NextRequest } from "next/server";
import dbConnect from "@/lib/db/connect";
import Product from "@/lib/models/Product";
import { authMiddleware } from "@/lib/middleware/auth";
import {
  generateErrorResponse,
  generateSuccessResponse,
} from "@/lib/utils/helpers";

const normalizeCode = (value: string) =>
  value.toString().trim().toLowerCase().replace(/[-\s]/g, "");

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

export async function POST(req: NextRequest) {
  try {
    const auth = await authMiddleware(req);
    if (!auth.authorized) {
      return generateErrorResponse(auth.error || "Unauthorized", 401);
    }

    const user = auth.user!;
    if (user.role !== "admin") {
      return generateErrorResponse("Forbidden", 403);
    }

    await dbConnect();

    const products = await Product.find({ businessId: user.businessId }).select(
      "_id internalId code",
    );

    if (products.length === 0) {
      return generateSuccessResponse({ updated: 0, skipped: 0 });
    }

    const updates = [] as Parameters<typeof Product.bulkWrite>[0];
    let skipped = 0;

    for (const product of products) {
      if (typeof product.internalId !== "number") {
        skipped += 1;
        continue;
      }

      const targetCode = String(product.internalId).padStart(4, "0");
      if (product.code === targetCode) {
        skipped += 1;
        continue;
      }

      const normalized = normalizeCode(targetCode);
      const regex = buildLooseRegex(normalized);
      const conflict = await Product.findOne({
        businessId: user.businessId,
        _id: { $ne: product._id },
        $or: [{ code: { $regex: regex } }, { barcodes: { $regex: regex } }],
      });

      if (conflict) {
        skipped += 1;
        continue;
      }

      updates.push({
        updateOne: {
          filter: { _id: product._id, businessId: user.businessId },
          update: { $set: { code: targetCode } },
        },
      });
    }

    let updated = 0;
    if (updates.length > 0) {
      const result = await Product.bulkWrite(updates);
      updated = result.modifiedCount || 0;
    }

    return generateSuccessResponse({ updated, skipped });
  } catch (error) {
    console.error("Migrate product codes error:", error);
    return generateErrorResponse("Internal server error", 500);
  }
}

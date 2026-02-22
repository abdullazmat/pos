import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db/connect";
import ProductSupplier from "@/lib/models/ProductSupplier";
import Product from "@/lib/models/Product";
import Supplier from "@/lib/models/Supplier";
import { verifyToken } from "@/lib/utils/jwt";

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get("authorization")?.split(" ")[1];
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    await dbConnect();

    const { searchParams } = new URL(request.url);
    const supplierId = searchParams.get("supplierId");
    const productId = searchParams.get("productId");

    const filter: Record<string, unknown> = {
      businessId: decoded.businessId,
      active: true,
    };

    if (supplierId) filter.supplierId = supplierId;
    if (productId) filter.productId = productId;

    const links = await ProductSupplier.find(filter)
      .populate("supplierId", "name document phone email")
      .populate("productId", "name code stock cost price")
      .sort({ preferredSupplier: -1, lastCost: 1 })
      .lean();

    return NextResponse.json({ success: true, data: { links } });
  } catch (error) {
    console.error("Get product-supplier links error:", error);
    return NextResponse.json(
      { error: "Failed to fetch product-supplier links" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get("authorization")?.split(" ")[1];
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const body = await request.json();
    const {
      supplierId,
      productId,
      supplierCode,
      lastCost,
      averageCost,
      purchasePresentation,
      purchaseMultiple,
      leadTimeDays,
      minimumPurchase,
      preferredSupplier,
    } = body;

    if (!supplierId || !productId) {
      return NextResponse.json(
        { error: "Supplier and Product are required" },
        { status: 400 },
      );
    }

    await dbConnect();

    // Verify supplier and product exist
    const [supplier, product] = await Promise.all([
      Supplier.findOne({ _id: supplierId, business: decoded.businessId }),
      Product.findOne({ _id: productId, businessId: decoded.businessId }),
    ]);

    if (!supplier) {
      return NextResponse.json(
        { error: "Supplier not found" },
        { status: 404 },
      );
    }
    if (!product) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 },
      );
    }

    // If marking as preferred, unset other preferred for this product
    if (preferredSupplier) {
      await ProductSupplier.updateMany(
        {
          businessId: decoded.businessId,
          productId,
          preferredSupplier: true,
        },
        { preferredSupplier: false },
      );
    }

    const link = await ProductSupplier.findOneAndUpdate(
      {
        businessId: decoded.businessId,
        supplierId,
        productId,
      },
      {
        businessId: decoded.businessId,
        supplierId,
        productId,
        supplierCode,
        lastCost: lastCost || product.cost || 0,
        averageCost: averageCost || lastCost || product.cost || 0,
        purchasePresentation: purchasePresentation || "unit",
        purchaseMultiple: purchaseMultiple || 1,
        leadTimeDays: leadTimeDays || 1,
        minimumPurchase: minimumPurchase || 1,
        preferredSupplier: preferredSupplier || false,
        active: true,
      },
      { new: true, upsert: true },
    );

    return NextResponse.json(
      { success: true, data: { link } },
      { status: 201 },
    );
  } catch (error) {
    console.error("Create product-supplier link error:", error);
    return NextResponse.json(
      { error: "Failed to create product-supplier link" },
      { status: 500 },
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const token = request.headers.get("authorization")?.split(" ")[1];
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json(
        { error: "Link ID is required" },
        { status: 400 },
      );
    }

    await dbConnect();

    // If marking as preferred, unset others
    if (updates.preferredSupplier) {
      const existing = await ProductSupplier.findById(id);
      if (existing) {
        await ProductSupplier.updateMany(
          {
            businessId: decoded.businessId,
            productId: existing.productId,
            _id: { $ne: id },
            preferredSupplier: true,
          },
          { preferredSupplier: false },
        );
      }
    }

    const link = await ProductSupplier.findOneAndUpdate(
      { _id: id, businessId: decoded.businessId },
      updates,
      { new: true },
    );

    if (!link) {
      return NextResponse.json({ error: "Link not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: { link } });
  } catch (error) {
    console.error("Update product-supplier link error:", error);
    return NextResponse.json(
      { error: "Failed to update link" },
      { status: 500 },
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const token = request.headers.get("authorization")?.split(" ")[1];
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Link ID is required" },
        { status: 400 },
      );
    }

    await dbConnect();

    const link = await ProductSupplier.findOneAndUpdate(
      { _id: id, businessId: decoded.businessId },
      { active: false },
      { new: true },
    );

    if (!link) {
      return NextResponse.json({ error: "Link not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: "Link deactivated successfully",
    });
  } catch (error) {
    console.error("Delete product-supplier link error:", error);
    return NextResponse.json(
      { error: "Failed to delete link" },
      { status: 500 },
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db/connect";
import mongoose from "mongoose";
import PurchaseOrder from "@/lib/models/PurchaseOrder";
import Product from "@/lib/models/Product";
import ProductSupplier from "@/lib/models/ProductSupplier";
import { verifyToken } from "@/lib/utils/jwt";

/**
 * Generate a unique order number for purchase orders
 */
async function generateOrderNumber(businessId: string): Promise<string> {
  const count = await PurchaseOrder.countDocuments({ businessId });
  const date = new Date();
  const prefix = `PO-${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, "0")}`;
  return `${prefix}-${String(count + 1).padStart(4, "0")}`;
}

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
    const status = searchParams.get("status");
    const supplierId = searchParams.get("supplierId");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");

    const filter: Record<string, unknown> = {
      businessId: decoded.businessId,
    };

    if (status) filter.status = status;
    if (supplierId) filter.supplierId = supplierId;

    const [orders, total] = await Promise.all([
      PurchaseOrder.find(filter)
        .populate("supplierId", "name document phone email")
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      PurchaseOrder.countDocuments(filter),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        orders,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    console.error("Get purchase orders error:", error);
    return NextResponse.json(
      { error: "Failed to fetch purchase orders" },
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
      estimatedDeliveryDate,
      items,
      notes,
      warehouse,
      budgetLimit,
    } = body;

    if (!supplierId || !items || items.length === 0) {
      return NextResponse.json(
        { error: "Supplier and at least one item are required" },
        { status: 400 },
      );
    }

    await dbConnect();

    const businessId = new mongoose.Types.ObjectId(decoded.businessId);

    // Validate items and populate product info
    const orderItems = [];
    let estimatedTotal = 0;

    for (const item of items) {
      if (!mongoose.Types.ObjectId.isValid(item.productId)) {
        return NextResponse.json(
          { error: `Invalid product ID: ${item.productId}` },
          { status: 400 },
        );
      }

      const product = await Product.findOne({
        _id: item.productId,
        businessId,
      });

      if (!product) {
        return NextResponse.json(
          { error: `Product not found: ${item.productId}` },
          { status: 404 },
        );
      }

      const cost = parseFloat(item.estimatedCost || item.cost || product.cost || 0);
      const quantity = parseFloat(item.requestedQuantity || item.quantity || 0);
      const subtotal = quantity * cost;

      orderItems.push({
        productId: product._id,
        productName: product.name,
        productCode: product.code,
        requestedQuantity: quantity,
        receivedQuantity: 0,
        estimatedCost: cost,
        finalCost: 0,
        subtotal: Math.round(subtotal * 100) / 100,
        suggestionReason: item.suggestionReason || item.reason || undefined,
      });

      estimatedTotal += subtotal;
    }

    const orderNumber = await generateOrderNumber(decoded.businessId);

    const order = await PurchaseOrder.create({
      businessId,
      supplierId: new mongoose.Types.ObjectId(supplierId),
      orderNumber,
      date: new Date(),
      estimatedDeliveryDate: estimatedDeliveryDate
        ? new Date(estimatedDeliveryDate)
        : undefined,
      status: "DRAFT",
      items: orderItems,
      estimatedTotal: Math.round(estimatedTotal * 100) / 100,
      finalTotal: 0,
      notes,
      warehouse,
      budgetLimit: budgetLimit ? parseFloat(budgetLimit) : undefined,
      createdBy: new mongoose.Types.ObjectId(decoded.userId),
    });

    return NextResponse.json(
      { success: true, data: { order } },
      { status: 201 },
    );
  } catch (error) {
    console.error("Create purchase order error:", error);
    return NextResponse.json(
      { error: "Failed to create purchase order" },
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
    const { id, action, ...updates } = body;

    if (!id) {
      return NextResponse.json(
        { error: "Order ID is required" },
        { status: 400 },
      );
    }

    await dbConnect();

    const order = await PurchaseOrder.findOne({
      _id: id,
      businessId: decoded.businessId,
    });

    if (!order) {
      return NextResponse.json(
        { error: "errors.orderNotFound" },
        { status: 404 },
      );
    }

    // Handle different actions
    switch (action) {
      case "send": {
        if (order.status !== "DRAFT") {
          return NextResponse.json(
            { error: "errors.onlyDraftSent" },
            { status: 400 },
          );
        }
        order.status = "SENT";
        break;
      }

      case "receive": {
        // Partial or full reception
        if (!["SENT", "PARTIAL"].includes(order.status)) {
          return NextResponse.json(
            { error: "errors.orderStatusInvalid" },
            { status: 400 },
          );
        }

        const { receivedItems } = updates;
        if (!receivedItems || receivedItems.length === 0) {
          return NextResponse.json(
            { error: "errors.itemsRequired" },
            { status: 400 },
          );
        }

        let allReceived = true;
        let finalTotal = 0;

        for (const received of receivedItems) {
          const itemIndex = order.items.findIndex(
            (item: { productId: { toString: () => string } }) =>
              item.productId.toString() === received.productId,
          );

          if (itemIndex === -1) continue;

          const orderItem = order.items[itemIndex];
          const qty = parseFloat(received.quantity || 0);
          const fCostInput = received.finalCost !== undefined ? parseFloat(received.finalCost) : undefined;
          const fCost = fCostInput !== undefined ? fCostInput : (orderItem.finalCost || orderItem.estimatedCost);
          
          orderItem.receivedQuantity = (orderItem.receivedQuantity || 0) + qty;
          orderItem.finalCost = fCost;

          // Update product stock and cost
          if (qty > 0) {
            const product = await Product.findById(received.productId);
            if (product) {
              product.stock = (product.stock || 0) + qty;
              product.cost = fCost;
              if (product.price > 0) {
                product.margin = ((product.price - fCost) / product.price) * 100;
              }
              await product.save();
            }

            // Update supplier cost in ProductSupplier
            await ProductSupplier.findOneAndUpdate(
              {
                businessId: decoded.businessId,
                supplierId: order.supplierId,
                productId: received.productId,
              },
              {
                lastCost: fCost,
                // Optional: we could update averageCost here if we had the full logic
              },
            );
          }

          if (orderItem.receivedQuantity < orderItem.requestedQuantity) {
            allReceived = false;
          }

          finalTotal += orderItem.receivedQuantity * orderItem.finalCost;
        }

        // Check items not in this reception batch to include them in finalTotal
        for (const item of order.items) {
          const wasInBatch = receivedItems.some(
            (r: { productId: string }) =>
              r.productId === item.productId.toString(),
          );
          if (!wasInBatch) {
            if (item.receivedQuantity < item.requestedQuantity) {
              allReceived = false;
            }
            finalTotal += item.receivedQuantity * (item.finalCost || item.estimatedCost);
          }
        }

        order.status = allReceived ? "RECEIVED" : "PARTIAL";
        order.finalTotal = Math.round(finalTotal * 100) / 100;
        if (allReceived) {
          order.receivedBy = decoded.userId;
          order.receivedAt = new Date();
        }
        
        order.markModified("items");
        break;
      }

      case "cancel": {
        if (order.status === "RECEIVED" || order.status === "CANCELLED") {
          return NextResponse.json(
            { error: "errors.orderAlreadyCancelled" },
            { status: 400 },
          );
        }
        order.status = "CANCELLED";
        order.cancelledAt = new Date();
        order.cancelledBy = decoded.userId;
        order.cancelReason = updates.cancelReason || "";
        break;
      }

      default: {
        // General update (for draft orders)
        if (order.status !== "DRAFT") {
          return NextResponse.json(
            { error: "errors.onlyDraftEdited" },
            { status: 400 },
          );
        }
        if (updates.items) order.items = updates.items;
        if (updates.notes !== undefined) order.notes = updates.notes;
        if (updates.estimatedDeliveryDate)
          order.estimatedDeliveryDate = new Date(updates.estimatedDeliveryDate);
        if (updates.estimatedTotal)
          order.estimatedTotal = updates.estimatedTotal;
        break;
      }
    }

    await order.save();

    return NextResponse.json({ success: true, data: { order } });
  } catch (error) {
    console.error("Update purchase order error:", error);
    return NextResponse.json(
      { error: "Failed to update purchase order" },
      { status: 500 },
    );
  }
}

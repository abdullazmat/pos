import { NextRequest } from "next/server";
import dbConnect from "@/lib/db/connect";
import Sale from "@/lib/models/Sale";
import Product from "@/lib/models/Product";
import StockHistory from "@/lib/models/StockHistory";
import CashRegister from "@/lib/models/CashRegister";
import CashMovement from "@/lib/models/CashMovement";
import User from "@/lib/models/User";
import { authMiddleware } from "@/lib/middleware/auth";
import {
  generateErrorResponse,
  generateSuccessResponse,
} from "@/lib/utils/helpers";
import { broadcastStockUpdate } from "@/lib/server/stockStream";
import { generateNextProductInternalId } from "@/lib/utils/productCodeGenerator";
import { parseNumberInput } from "@/lib/utils/decimalFormatter";

export async function GET(req: NextRequest) {
  try {
    const authResult = await authMiddleware(req);
    if (!authResult.authorized) {
      return generateErrorResponse(authResult.error || "Unauthorized", 401);
    }

    const { businessId } = authResult.user!;
    const { searchParams } = new URL(req.url);
    const startDate = searchParams.get("startDate") || searchParams.get("from");
    const endDate = searchParams.get("endDate") || searchParams.get("to");

    console.log(
      `[SALES API GET] Received request - BusinessID: ${businessId}, StartDate: ${startDate}, EndDate: ${endDate}`,
    );

    await dbConnect();

    // Support legacy documents that might have been stored with `business` instead of `businessId`
    const query: Record<string, unknown> = {
      $or: [{ businessId }, { business: businessId }],
    };
    if (startDate && endDate) {
      // Parse dates as local midnight, then expand range to cover all timezones
      // This accounts for timezone offsets by going back 12 hours on start and forward 12 hours on end
      const start = new Date(`${startDate}T00:00:00.000Z`);
      const end = new Date(`${endDate}T23:59:59.999Z`);

      // Expand the range by ±14 hours to cover all possible timezone offsets (-12 to +14)
      const expandedStart = new Date(start.getTime() - 14 * 60 * 60 * 1000); // 14 hours before
      const expandedEnd = new Date(end.getTime() + 14 * 60 * 60 * 1000); // 14 hours after

      query.createdAt = {
        $gte: expandedStart,
        $lte: expandedEnd,
      };

      console.log(`[SALES API GET] Date range: ${startDate} to ${endDate}`);
      console.log(
        `[SALES API GET] Expanded query: ${expandedStart.toISOString()} to ${expandedEnd.toISOString()}`,
      );
    } else {
      console.log(`[SALES API GET] No date range provided`);
    }

    // First, check total sales in database for this business (debugging)
    const totalCount = await Sale.countDocuments({
      $or: [{ businessId }, { business: businessId }],
    });
    console.log(
      `[SALES API GET] Total sales in database for business: ${totalCount}`,
    );

    const sales = await Sale.find(query)
      .sort({ createdAt: -1 })
      .limit(500)
      .lean();

    // Enrich sales with product cost data for profit calculations
    const enrichedSales = await Promise.all(
      sales.map(async (sale: any) => {
        const enrichedItems = await Promise.all(
          (sale.items || []).map(async (item: any) => {
            try {
              const product = (await Product.findById(
                item.productId,
              ).lean()) as any;
              return {
                ...item,
                productCost: product?.cost || 0,
              };
            } catch {
              return {
                ...item,
                productCost: 0,
              };
            }
          }),
        );
        return {
          ...sale,
          items: enrichedItems,
        };
      }),
    );

    console.log(
      `[SALES API GET] Found ${enrichedSales.length} sales matching query`,
    );
    if (enrichedSales.length > 0) {
      console.log(
        `[SALES API GET] First sale createdAt: ${enrichedSales[0].createdAt}`,
      );
      console.log(
        `[SALES API GET] Last sale createdAt: ${enrichedSales[enrichedSales.length - 1].createdAt}`,
      );
    }

    return generateSuccessResponse({ sales: enrichedSales });
  } catch (error) {
    console.error("[SALES API GET] Error:", error);
    return generateErrorResponse("Internal server error", 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    console.log("[SALES API POST] Request received");
    const authResult = await authMiddleware(req);
    if (!authResult.authorized) {
      console.log("[SALES API POST] Authorization failed:", authResult.error);
      return generateErrorResponse(authResult.error || "Unauthorized", 401);
    }

    const { businessId, userId } = authResult.user!;
    console.log("[SALES API POST] Auth successful - BusinessID:", businessId);

    const body = await req.json();
    console.log("[SALES API POST] Request body:", {
      itemsCount: body.items?.length,
      discount: body.discount,
      paymentMethod: body.paymentMethod,
    });

    const {
      items,
      discount = 0,
      paymentMethod = "cash",
      cashRegisterId,
    } = body;

    const allowedMethods = [
      "cash",
      "card",
      "check",
      "online",
      "bankTransfer",
      "qr",
      "mercadopago",
    ];

    if (!allowedMethods.includes(paymentMethod)) {
      return generateErrorResponse("Invalid payment method", 400);
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return generateErrorResponse("No items in sale", 400);
    }

    await dbConnect();

    const saleUser = await User.findOne({
      _id: userId,
      businessId,
      isActive: true,
    }).select("discountLimit");

    if (!saleUser) {
      return generateErrorResponse("User not found", 404);
    }

    const userDiscountLimit =
      typeof saleUser.discountLimit === "number"
        ? saleUser.discountLimit
        : null;

    const rawSaleDiscount = discount as unknown;
    const normalizedSaleDiscount =
      typeof rawSaleDiscount === "number"
        ? rawSaleDiscount
        : typeof rawSaleDiscount === "string"
          ? parseNumberInput(rawSaleDiscount)
          : 0;

    if (
      normalizedSaleDiscount === null ||
      Number.isNaN(normalizedSaleDiscount)
    ) {
      return generateErrorResponse("Invalid discount", 400);
    }

    if (normalizedSaleDiscount < 0) {
      return generateErrorResponse("Discount must be 0 or higher", 400);
    }

    let grossSubtotal = 0;
    let lineDiscountTotal = 0;
    const saleItems = [];
    const updatedProductIds = new Set<string>();

    for (const item of items) {
      const rawQuantity = (item as any).quantity;
      const normalizedQuantity =
        typeof rawQuantity === "number"
          ? rawQuantity
          : typeof rawQuantity === "string"
            ? parseNumberInput(rawQuantity)
            : null;

      if (normalizedQuantity === null || Number.isNaN(normalizedQuantity)) {
        return generateErrorResponse("Invalid quantity", 400);
      }
      if (normalizedQuantity <= 0) {
        return generateErrorResponse("Quantity must be greater than 0", 400);
      }

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

      if (product.stock < normalizedQuantity) {
        return generateErrorResponse(
          `Insufficient stock for ${product.name}`,
          400,
        );
      }

      const rawDiscount = (item as any).discount;
      const normalizedDiscount =
        typeof rawDiscount === "number"
          ? rawDiscount
          : typeof rawDiscount === "string"
            ? parseNumberInput(rawDiscount)
            : 0;

      if (normalizedDiscount === null || Number.isNaN(normalizedDiscount)) {
        return generateErrorResponse("Invalid discount", 400);
      }

      if (normalizedDiscount < 0) {
        return generateErrorResponse("Discount must be 0 or higher", 400);
      }

      const lineSubtotal = item.unitPrice * normalizedQuantity;
      if (normalizedDiscount > lineSubtotal) {
        return generateErrorResponse(
          "Discount cannot exceed line subtotal",
          400,
        );
      }

      if (userDiscountLimit !== null) {
        const maxAllowed = (userDiscountLimit / 100) * lineSubtotal;
        if (normalizedDiscount > maxAllowed) {
          return generateErrorResponse("Discount exceeds user limit", 400);
        }
      }

      const itemTotal = lineSubtotal - normalizedDiscount;
      grossSubtotal += lineSubtotal;
      lineDiscountTotal += normalizedDiscount;

      saleItems.push({
        productId: item.productId,
        productName: product.name,
        quantity: normalizedQuantity,
        unitPrice: item.unitPrice,
        discount: normalizedDiscount,
        total: itemTotal,
      });

      // Reduce stock
      if (!product.internalId) {
        product.internalId = await generateNextProductInternalId(businessId);
      }
      product.stock -= normalizedQuantity;
      await product.save();
      updatedProductIds.add(String(product._id));

      // Record stock history
      await StockHistory.create({
        businessId,
        productId: item.productId,
        type: "sale",
        quantity: -normalizedQuantity,
        reference: null,
        referenceModel: "Sale",
      });
    }

    const maxAdditionalDiscount = Math.max(
      0,
      grossSubtotal - lineDiscountTotal,
    );
    if (normalizedSaleDiscount > maxAdditionalDiscount) {
      return generateErrorResponse("Discount cannot exceed subtotal", 400);
    }

    const totalDiscount = lineDiscountTotal + normalizedSaleDiscount;

    if (userDiscountLimit !== null) {
      const maxAllowedTotal = (userDiscountLimit / 100) * grossSubtotal;
      if (totalDiscount > maxAllowedTotal) {
        return generateErrorResponse("Discount exceeds user limit", 400);
      }
    }

    const subtotal = grossSubtotal;
    const total = subtotal - totalDiscount;

    // Attach to open cash register (session) if available or provided
    let resolvedCashRegisterId = cashRegisterId;
    let openRegister = null;

    if (!resolvedCashRegisterId) {
      openRegister = await CashRegister.findOne({
        businessId,
        status: "open",
      });
      if (openRegister) {
        resolvedCashRegisterId = openRegister._id;
      }
    } else {
      openRegister = await CashRegister.findOne({
        _id: resolvedCashRegisterId,
        businessId,
        status: "open",
      });
    }

    const sale = new Sale({
      businessId,
      userId,
      items: saleItems,
      subtotal,
      discount: totalDiscount,
      total,
      paymentMethod,
      paymentStatus: paymentMethod === "mercadopago" ? "pending" : "completed",
      cashRegisterId: resolvedCashRegisterId,
    });

    await sale.save();

    if (updatedProductIds.size > 0) {
      broadcastStockUpdate(businessId, Array.from(updatedProductIds));
    }

    // Record cash movement when a register is open
    if (openRegister) {
      // Update register balances and totals
      openRegister.currentBalance = (openRegister.currentBalance || 0) + total;
      openRegister.salesTotal = (openRegister.salesTotal || 0) + total;
      await openRegister.save();

      await CashMovement.create({
        businessId,
        cashRegisterId: openRegister._id,
        type: "venta",
        description: "Venta POS",
        amount: total,
        createdBy: userId,
      });
    }

    // Return formatted sale with all necessary fields for receipt
    const saleResponse = {
      _id: sale._id,
      businessId: sale.businessId,
      userId: sale.userId,
      items: sale.items,
      subtotal: sale.subtotal,
      discount: sale.discount,
      total: sale.total,
      paymentMethod: sale.paymentMethod,
      paymentStatus: sale.paymentStatus,
      createdAt: sale.createdAt,
      cashRegisterId: sale.cashRegisterId,
    };

    console.log("[SALES API POST] Sale created successfully:", {
      saleId: sale._id,
      total: sale.total,
      items: sale.items.length,
    });

    return generateSuccessResponse({ sale: saleResponse }, 201);
  } catch (error: any) {
    console.error("[SALES API POST] Create sale error:", error);
    console.error("[SALES API POST] Error stack:", error?.stack);
    const message = error?.message || "Internal server error";
    return generateErrorResponse(message, 500);
  }
}

import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db/connect";
import Sale from "@/lib/models/Sale";
import Invoice, {
  IInvoice,
  InvoiceChannel,
  InvoiceType,
} from "@/lib/models/Invoice";
import Product from "@/lib/models/Product";
import StockHistory from "@/lib/models/StockHistory";
import CashRegister from "@/lib/models/CashRegister";
import CashMovement from "@/lib/models/CashMovement";
import Payment from "@/lib/models/Payment";
import MercadoPagoService from "@/lib/services/payment/MercadoPagoService";
import { verifyToken } from "@/lib/utils/jwt";
import User from "@/lib/models/User";
import Client from "@/lib/models/Client";
import { broadcastStockUpdate } from "@/lib/server/stockStream";
import { generateNextProductInternalId } from "@/lib/utils/productCodeGenerator";
import { parseNumberInput } from "@/lib/utils/decimalFormatter";
import { clampDiscountLimit } from "@/lib/utils/discounts";
import ClientAccountTransaction from "@/lib/models/ClientAccountTransaction";
import "@/lib/server/arcaRetryScheduler";

const getMockArcaStatus = () => {
  const status = process.env.ARCA_MOCK_STATUS?.toUpperCase();
  if (
    status === "APPROVED" ||
    status === "PENDING_CAE" ||
    status === "REJECTED"
  ) {
    return status;
  }
  return null;
};

const isMockArcaEnabled = () => {
  return (
    process.env.ARCA_MOCK_ENABLED === "true" || Boolean(getMockArcaStatus())
  );
};

const generateMockCae = () => {
  return `${Date.now()}`.slice(-13).padStart(13, "0");
};

interface SaleItemRequest {
  productId: string;
  quantity: number;
  unitPrice: number;
  discount?: number;
}

interface CompleteSaleRequest {
  items: SaleItemRequest[];
  paymentMethod:
    | "cash"
    | "card"
    | "transfer"
    | "mercadopago"
    | "multiple"
    | "account";
  invoiceChannel: InvoiceChannel;
  customerName: string;
  customerEmail?: string;
  customerCuit?: string; // Required for ARCA
  ivaType?: "RESPONSABLE_INSCRIPTO" | "MONOTRIBUTISTA" | "NO_CATEGORIZADO";
  discount?: number;
  cashRegisterId?: string;
  notes?: string;
  generateInvoice?: boolean;
  clientId?: string;
}

/**
 * Complete Sale Endpoint - Creates sale with integrated invoicing
 * Handles:
 * - Stock deduction
 * - Invoice generation (ARCA/INTERNAL)
 * - Payment processing (cash/card/MP)
 * - Sale record creation
 */
export async function POST(req: NextRequest) {
  try {
    const token = req.headers.get("authorization")?.split(" ")[1];
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const body: CompleteSaleRequest = await req.json();
    const {
      items,
      paymentMethod,
      invoiceChannel: rawInvoiceChannel,
      customerName,
      customerEmail,
      customerCuit,
      ivaType,
      discount = 0,
      cashRegisterId,
      notes,
      generateInvoice = true,
      clientId,
    } = body;

    const invoiceChannel =
      rawInvoiceChannel ??
      (isMockArcaEnabled() && customerCuit
        ? InvoiceChannel.ARCA
        : InvoiceChannel.INTERNAL);

    const resolvedIvaType =
      ivaType ||
      (isMockArcaEnabled() && invoiceChannel === InvoiceChannel.ARCA
        ? "RESPONSABLE_INSCRIPTO"
        : undefined);

    // Validation
    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "No items in sale" }, { status: 400 });
    }

    if (!customerName) {
      return NextResponse.json(
        { error: "Customer name is required" },
        { status: 400 },
      );
    }

    if (invoiceChannel === InvoiceChannel.ARCA && !customerCuit) {
      return NextResponse.json(
        { error: "CUIT is required for ARCA invoices" },
        { status: 400 },
      );
    }

    if (invoiceChannel === InvoiceChannel.ARCA && !resolvedIvaType) {
      return NextResponse.json(
        { error: "IVA type is required for ARCA invoices" },
        { status: 400 },
      );
    }

    await dbConnect();

    const saleUser = await User.findOne({
      _id: decoded.userId,
      businessId: decoded.businessId,
      isActive: true,
    }).select("discountLimit");

    if (!saleUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const userDiscountLimit = clampDiscountLimit(saleUser.discountLimit);
    let clientDiscountLimit: number | null = null;
    if (clientId) {
      const saleClient = await Client.findOne({
        _id: clientId,
        business: decoded.businessId,
      }).select("discountLimit");
      clientDiscountLimit = clampDiscountLimit(saleClient?.discountLimit);
    }
    const effectiveDiscountLimit =
      typeof userDiscountLimit === "number" &&
      typeof clientDiscountLimit === "number"
        ? Math.min(userDiscountLimit, clientDiscountLimit)
        : typeof userDiscountLimit === "number"
          ? userDiscountLimit
          : typeof clientDiscountLimit === "number"
            ? clientDiscountLimit
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
      return NextResponse.json({ error: "Invalid discount" }, { status: 400 });
    }

    if (normalizedSaleDiscount < 0) {
      return NextResponse.json(
        { error: "Discount must be 0 or higher" },
        { status: 400 },
      );
    }

    // Verify cash register is open (if provided)
    if (cashRegisterId) {
      const register = await CashRegister.findOne({
        _id: cashRegisterId,
        businessId: decoded.businessId,
        status: "open",
      });

      if (!register) {
        return NextResponse.json(
          { error: "Cash register is not open" },
          { status: 400 },
        );
      }
    }

    // Process items and verify stock
    let grossSubtotal = 0;
    let lineDiscountTotal = 0;
    const saleItems = [];
    const invoiceItems = [];
    const stockUpdates: Array<{ product: any; quantity: number }> = [];

    // First pass: validate all items and calculate totals
    for (const item of items) {
      const rawQuantity = (item as any).quantity;
      const normalizedQuantity =
        typeof rawQuantity === "number"
          ? rawQuantity
          : typeof rawQuantity === "string"
            ? parseNumberInput(rawQuantity)
            : null;

      if (normalizedQuantity === null || Number.isNaN(normalizedQuantity)) {
        return NextResponse.json(
          { error: "Invalid quantity" },
          { status: 400 },
        );
      }
      if (normalizedQuantity <= 0) {
        return NextResponse.json(
          { error: "Quantity must be greater than 0" },
          { status: 400 },
        );
      }

      const product = await Product.findOne({
        _id: item.productId,
        businessId: decoded.businessId,
      });

      if (!product) {
        return NextResponse.json(
          { error: `Product not found: ${item.productId}` },
          { status: 404 },
        );
      }

      if (product.stock < normalizedQuantity) {
        return NextResponse.json(
          {
            error: `Insufficient stock for ${product.name}. Available: ${product.stock}, Requested: ${normalizedQuantity}`,
          },
          { status: 400 },
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
        return NextResponse.json(
          { error: "Invalid discount" },
          { status: 400 },
        );
      }

      if (normalizedDiscount < 0) {
        return NextResponse.json(
          { error: "Discount must be 0 or higher" },
          { status: 400 },
        );
      }

      const lineSubtotal = normalizedQuantity * item.unitPrice;
      if (normalizedDiscount > lineSubtotal) {
        return NextResponse.json(
          { error: "Discount cannot exceed line subtotal" },
          { status: 400 },
        );
      }

      if (effectiveDiscountLimit !== null) {
        const maxAllowed = (effectiveDiscountLimit / 100) * lineSubtotal;
        if (normalizedDiscount > maxAllowed) {
          return NextResponse.json(
            { error: "Discount exceeds user limit" },
            { status: 400 },
          );
        }
      }

      const itemDiscount = normalizedDiscount;
      const itemTotal = normalizedQuantity * item.unitPrice - itemDiscount;
      grossSubtotal += lineSubtotal;
      lineDiscountTotal += itemDiscount;

      saleItems.push({
        productId: item.productId,
        productName: product.name,
        quantity: normalizedQuantity,
        unitPrice: item.unitPrice,
        discount: itemDiscount,
        total: itemTotal,
      });

      invoiceItems.push({
        productId: item.productId,
        description: product.name,
        quantity: normalizedQuantity,
        unitPrice: item.unitPrice,
        discount: itemDiscount,
      });

      // Store for later stock updates
      stockUpdates.push({
        product,
        quantity: normalizedQuantity,
      });
    }

    const maxAdditionalDiscount = Math.max(
      0,
      grossSubtotal - lineDiscountTotal,
    );
    if (normalizedSaleDiscount > maxAdditionalDiscount) {
      return NextResponse.json(
        { error: "Discount cannot exceed subtotal" },
        { status: 400 },
      );
    }

    const totalDiscount = lineDiscountTotal + normalizedSaleDiscount;

    if (effectiveDiscountLimit !== null) {
      const maxAllowedTotal = (effectiveDiscountLimit / 100) * grossSubtotal;
      if (totalDiscount > maxAllowedTotal) {
        return NextResponse.json(
          { error: "Discount exceeds user limit" },
          { status: 400 },
        );
      }
    }

    const subtotal = grossSubtotal;
    const totalAmount = subtotal - totalDiscount;

    // Calculate tax (21% IVA for Argentina - can be made configurable)
    const taxAmount = Math.round(totalAmount * 0.21 * 100) / 100;
    const totalWithTax = totalAmount + taxAmount;

    // Generate invoice number (format: YYYY-MM-001)
    const today = new Date();
    const datePrefix = `${today.getFullYear()}-${String(
      today.getMonth() + 1,
    ).padStart(2, "0")}`;
    const lastInvoice = await Invoice.findOne({
      business: decoded.businessId,
      invoiceNumber: { $regex: `^${datePrefix}` },
    }).sort({ invoiceNumber: -1 });

    const nextNumber = lastInvoice
      ? parseInt(lastInvoice.invoiceNumber.split("-")[1]) + 1
      : 1;
    const invoiceNumber = `${datePrefix}-${String(nextNumber).padStart(
      3,
      "0",
    )}`;

    // Create invoice
    let invoice = null;
    if (generateInvoice) {
      invoice = await Invoice.create({
        business: decoded.businessId,
        invoiceNumber,
        invoiceType: InvoiceType.SALE,
        channel: invoiceChannel,
        reportedToArca: false,
        customerName,
        customerEmail,
        customerCuit,
        ivaType: resolvedIvaType,
        items: invoiceItems,
        subtotal,
        taxAmount,
        discountAmount: totalDiscount,
        totalAmount: totalWithTax,
        paymentMethod,
        paymentStatus: "PENDING",
        notes,
        date: new Date(),
      });

      if (
        invoice &&
        (invoiceChannel === InvoiceChannel.ARCA ||
          invoiceChannel === InvoiceChannel.WSFE) &&
        isMockArcaEnabled()
      ) {
        const mockStatus = getMockArcaStatus() || "PENDING_CAE";
        const mockCae = generateMockCae();
        const mockCaeVto = new Date(Date.now() + 15 * 24 * 60 * 60 * 1000)
          .toISOString()
          .slice(0, 10)
          .replace(/-/g, "");
        const fiscalDefaults = {
          "fiscalData.comprobanteTipo": customerCuit ? 1 : 6,
          "fiscalData.pointOfSale": 1,
          "fiscalData.invoiceSequence": nextNumber,
        };

        if (mockStatus === "APPROVED") {
          await Invoice.updateOne(
            { _id: invoice._id },
            {
              status: "AUTHORIZED",
              arcaStatus: "APPROVED",
              "fiscalData.cae": mockCae,
              "fiscalData.caeNro": mockCae,
              "fiscalData.caeVto": mockCaeVto,
              "fiscalData.caeStatus": "AUTHORIZED",
              ...fiscalDefaults,
            },
          );
        } else if (mockStatus === "REJECTED") {
          await Invoice.updateOne(
            { _id: invoice._id },
            {
              status: "PENDING_CAE",
              arcaStatus: "REJECTED",
              "fiscalData.caeStatus": "REJECTED",
              ...fiscalDefaults,
            },
          );
        } else {
          await Invoice.updateOne(
            { _id: invoice._id },
            {
              status: "PENDING_CAE",
              arcaStatus: "PENDING",
              "fiscalData.caeStatus": "PENDING",
              ...fiscalDefaults,
            },
          );
        }
      }
    }

    // Create sale record
    const sale = new Sale({
      businessId: decoded.businessId,
      userId: decoded.userId,
      clientId: clientId || undefined,
      items: saleItems,
      subtotal,
      discount: totalDiscount,
      total: totalAmount,
      tax: taxAmount,
      totalWithTax,
      paymentMethod,
      paymentStatus:
        paymentMethod === "cash" ||
        paymentMethod === "card" ||
        paymentMethod === "transfer"
          ? "completed"
          : "pending", // Mercado Pago will be pending
      invoice: invoice?._id,
      cashRegisterId: cashRegisterId,
      notes,
      createdAt: new Date(),
    });

    await sale.save();

    if (paymentMethod === "account" && clientId) {
      await ClientAccountTransaction.create({
        businessId: decoded.businessId,
        clientId,
        type: "charge",
        amount: totalWithTax,
        description: "Venta a cuenta",
        referenceSaleId: sale._id,
        referenceInvoiceId: invoice?._id,
        createdBy: decoded.userId,
      });
    }

    // Record cash movement when a register is open
    // Attach to open cash register (session) if available or provided
    let resolvedCashRegisterId = cashRegisterId;
    let openRegister = null;

    if (!resolvedCashRegisterId) {
      openRegister = await CashRegister.findOne({
        businessId: decoded.businessId,
        status: "open",
      });
      if (openRegister) {
        resolvedCashRegisterId = openRegister._id;
      }
    } else {
      openRegister = await CashRegister.findOne({
        _id: resolvedCashRegisterId,
        businessId: decoded.businessId,
        status: "open",
      });
    }

    if (openRegister && ["cash", "card", "transfer"].includes(paymentMethod)) {
      try {
        const operatorUser = await User.findById(decoded.userId).select(
          "fullName role",
        );
        const operatorName =
          operatorUser?.fullName || decoded.email || "Usuario";
        const operatorRole = operatorUser?.role || decoded.role || "cashier";

        // Update sale with resolved cash register ID if it wasn't provided
        if (!cashRegisterId && resolvedCashRegisterId) {
          sale.cashRegisterId = openRegister._id;
          await sale.save();
        }

        // Update register balances and totals
        openRegister.currentBalance =
          (openRegister.currentBalance || 0) + totalWithTax;
        openRegister.salesTotal = (openRegister.salesTotal || 0) + totalWithTax;
        await openRegister.save();

        await CashMovement.create({
          businessId: decoded.businessId,
          cashRegisterId: openRegister._id,
          type: "venta",
          description: "Venta POS",
          amount: totalWithTax,
          createdBy: decoded.userId,
          operator: {
            user_id: decoded.userId,
            visible_name: operatorName,
            role: operatorRole,
            session_id: openRegister._id.toString(),
          },
        });
      } catch (movementError) {
        console.error("Cash movement error:", movementError);
        // Log error but don't fail the sale
      }
    }

    // Now deduct stock and record history (after sale is persisted)
    try {
      const updatedProductIds = new Set<string>();
      for (const { product, quantity } of stockUpdates) {
        if (!product.internalId) {
          product.internalId = await generateNextProductInternalId(
            decoded.businessId,
          );
        }
        product.stock -= quantity;
        await product.save();
        updatedProductIds.add(String(product._id));

        // Record stock history
        await StockHistory.create({
          businessId: decoded.businessId,
          productId: product._id,
          type: "sale",
          quantity: -quantity,
          reference: sale._id,
        });
      }

      if (updatedProductIds.size > 0) {
        broadcastStockUpdate(decoded.businessId, Array.from(updatedProductIds));
      }
    } catch (stockError) {
      console.error("Stock update error:", stockError);
      // Log this error but don't fail the sale - stock was already deducted conceptually
      // This is a non-critical operation that should be retried asynchronously
    }

    // For Mercado Pago, create payment preference
    let paymentData = null;
    if (paymentMethod === "mercadopago") {
      try {
        const mercadoPagoService = MercadoPagoService;
        const preference = await mercadoPagoService.createPaymentPreference({
          businessName: (decoded as any)?.businessName || "Mi Negocio",
          planName: `Venta #${invoiceNumber}`,
          amount: Math.round(totalWithTax * 100),
          currency: "ARS",
          email: customerEmail || "info@empresa.com",
          metadata: {
            businessId: decoded.businessId,
            saleId: sale._id.toString(),
            invoiceId: invoice?._id.toString(),
            customerCuit,
          },
        });

        // Create payment record
        const payment = await Payment.create({
          business: decoded.businessId,
          sale: sale._id,
          invoice: invoice?._id,
          planId: "SALE", // Indicates this is a POS sale
          provider: "mercado_pago",
          status: "PENDING",
          preferenceId: preference.id,
          paymentLink: preference.preferenceLink,
          amount: totalWithTax,
          metadata: {
            customerCuit,
            customerEmail,
          },
        });

        paymentData = {
          preferenceId: preference.id,
          paymentLink: preference.preferenceLink,
          qrCode: preference.qrCode,
          paymentId: payment._id.toString(),
        };

        // Update sale with payment link
        sale.paymentLink = preference.preferenceLink;
        await sale.save();
      } catch (error) {
        console.error("Mercado Pago error:", error);
        // Don't fail the sale, just log the error
        return NextResponse.json(
          {
            error: "Failed to create Mercado Pago payment",
            details: (error as any).message,
          },
          { status: 500 },
        );
      }
    }

    // Update invoice payment status if payment was successful
    if (paymentMethod !== "mercadopago" && invoice) {
      invoice.paymentStatus = "PAID";
      await invoice.save();
    }

    let receiptStatus = "INTERNAL" as
      | "INTERNAL"
      | "APPROVED"
      | "PENDING_CAE"
      | "REJECTED"
      | "CANCELED_BY_NC"
      | "CAE_REQUIRED";
    let receiptType = "NONE" as "NONE" | "FISCAL" | "PROVISIONAL";
    let receiptIsProvisional = false;

    if (invoice) {
      const refreshedInvoice = await Invoice.findById(invoice._id)
        .lean<Pick<IInvoice, "channel" | "fiscalData" | "status" | "arcaStatus">>()
        .exec();
      const isFiscalInvoice =
        refreshedInvoice?.channel === InvoiceChannel.ARCA ||
        refreshedInvoice?.channel === InvoiceChannel.WSFE;
      const cae =
        refreshedInvoice?.fiscalData?.cae ||
        refreshedInvoice?.fiscalData?.caeNro;
      const caeAuthorized =
        refreshedInvoice?.status === "AUTHORIZED" ||
        refreshedInvoice?.fiscalData?.caeStatus === "AUTHORIZED" ||
        refreshedInvoice?.arcaStatus === "APPROVED";
      const caePending =
        refreshedInvoice?.status === "PENDING_CAE" ||
        refreshedInvoice?.fiscalData?.caeStatus === "PENDING" ||
        refreshedInvoice?.arcaStatus === "PENDING" ||
        refreshedInvoice?.arcaStatus === "SENT";
      const caeRejected =
        refreshedInvoice?.arcaStatus === "REJECTED" ||
        refreshedInvoice?.fiscalData?.caeStatus === "REJECTED";
      const cancelledByNc =
        refreshedInvoice?.status === "CANCELLED" ||
        refreshedInvoice?.status === "VOIDED";

      if (!isFiscalInvoice) {
        receiptStatus = "INTERNAL";
        receiptType = "NONE";
      } else if (cancelledByNc) {
        receiptStatus = "CANCELED_BY_NC";
        receiptType = "NONE";
      } else if (caeRejected) {
        receiptStatus = "REJECTED";
        receiptType = "NONE";
      } else if (caeAuthorized && cae) {
        receiptStatus = "APPROVED";
        receiptType = "FISCAL";
      } else if (caePending) {
        receiptStatus = "PENDING_CAE";
        receiptType = "PROVISIONAL";
        receiptIsProvisional = true;
      } else {
        receiptStatus = "CAE_REQUIRED";
        receiptType = "NONE";
      }
    }

    return NextResponse.json(
      {
        sale: {
          id: sale._id.toString(),
          invoiceNumber: invoice?.invoiceNumber,
          invoiceId: invoice?._id.toString(),
          createdAt: sale.createdAt,
          total: totalAmount,
          totalWithTax,
          tax: taxAmount,
          subtotal,
          discount: totalDiscount,
          paymentMethod,
          paymentStatus: sale.paymentStatus,
          cashRegisterId: resolvedCashRegisterId,
          customerName,
          items: saleItems,
          fiscalStatus: receiptStatus,
          receiptType,
          isProvisional: receiptIsProvisional,
          ...paymentData,
        },
        message: "Sale completed successfully",
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Complete sale error:", error);
    return NextResponse.json(
      { error: "Internal server error", details: (error as any).message },
      { status: 500 },
    );
  }
}

/**
 * GET - Retrieve sale details or list sales for business
 */
export async function GET(req: NextRequest) {
  try {
    const token = req.headers.get("authorization")?.split(" ")[1];
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const saleId = searchParams.get("id");
    const limit = parseInt(searchParams.get("limit") || "50");
    const skip = parseInt(searchParams.get("skip") || "0");

    await dbConnect();

    if (saleId) {
      // Get specific sale
      const sale = await Sale.findOne({
        _id: saleId,
        businessId: decoded.businessId,
      })
        .populate("invoice")
        .lean();

      if (!sale) {
        return NextResponse.json({ error: "Sale not found" }, { status: 404 });
      }

      return NextResponse.json({ sale });
    } else {
      // List all sales
      const sales = await Sale.find({
        businessId: decoded.businessId,
      })
        .sort({ createdAt: -1 })
        .limit(limit)
        .skip(skip)
        .populate("invoice")
        .lean();

      const total = await Sale.countDocuments({
        businessId: decoded.businessId,
      });

      return NextResponse.json({
        sales,
        total,
        limit,
        skip,
      });
    }
  } catch (error) {
    console.error("Get sales error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

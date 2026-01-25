import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db/connect";
import Sale from "@/lib/models/Sale";
import Invoice, { InvoiceChannel, InvoiceType } from "@/lib/models/Invoice";
import Product from "@/lib/models/Product";
import StockHistory from "@/lib/models/StockHistory";
import CashRegister from "@/lib/models/CashRegister";
import CashMovement from "@/lib/models/CashMovement";
import Payment from "@/lib/models/Payment";
import MercadoPagoService from "@/lib/services/payment/MercadoPagoService";
import { verifyToken } from "@/lib/utils/jwt";

interface SaleItemRequest {
  productId: string;
  quantity: number;
  unitPrice: number;
  discount?: number;
}

interface CompleteSaleRequest {
  items: SaleItemRequest[];
  paymentMethod: "cash" | "card" | "transfer" | "mercadopago" | "multiple";
  invoiceChannel: InvoiceChannel;
  customerName: string;
  customerEmail?: string;
  customerCuit?: string; // Required for ARCA
  ivaType?: "RESPONSABLE_INSCRIPTO" | "MONOTRIBUTISTA" | "NO_CATEGORIZADO";
  discount?: number;
  cashRegisterId?: string;
  notes?: string;
  generateInvoice?: boolean;
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
      invoiceChannel = InvoiceChannel.INTERNAL,
      customerName,
      customerEmail,
      customerCuit,
      ivaType,
      discount = 0,
      cashRegisterId,
      notes,
      generateInvoice = true,
    } = body;

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

    if (invoiceChannel === InvoiceChannel.ARCA && !ivaType) {
      return NextResponse.json(
        { error: "IVA type is required for ARCA invoices" },
        { status: 400 },
      );
    }

    await dbConnect();

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
    let subtotal = 0;
    const saleItems = [];
    const invoiceItems = [];
    const stockUpdates: Array<{ product: any; quantity: number }> = [];

    // First pass: validate all items and calculate totals
    for (const item of items) {
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

      if (product.stock < item.quantity) {
        return NextResponse.json(
          {
            error: `Insufficient stock for ${product.name}. Available: ${product.stock}, Requested: ${item.quantity}`,
          },
          { status: 400 },
        );
      }

      const itemDiscount = item.discount || 0;
      const itemTotal = item.quantity * item.unitPrice - itemDiscount;
      subtotal += itemTotal;

      saleItems.push({
        productId: item.productId,
        productName: product.name,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        discount: itemDiscount,
        total: itemTotal,
      });

      invoiceItems.push({
        productId: item.productId,
        description: product.name,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        discount: itemDiscount,
      });

      // Store for later stock updates
      stockUpdates.push({
        product,
        quantity: item.quantity,
      });
    }

    const totalAmount = subtotal - discount;

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
        ivaType,
        items: invoiceItems,
        subtotal,
        taxAmount,
        discountAmount: discount,
        totalAmount: totalWithTax,
        paymentMethod,
        paymentStatus: "PENDING",
        notes,
        date: new Date(),
      });
    }

    // Create sale record
    const sale = new Sale({
      businessId: decoded.businessId,
      userId: decoded.userId,
      items: saleItems,
      subtotal,
      discount,
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

    if (openRegister) {
      try {
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
        });
      } catch (movementError) {
        console.error("Cash movement error:", movementError);
        // Log error but don't fail the sale
      }
    }

    // Now deduct stock and record history (after sale is persisted)
    try {
      for (const { product, quantity } of stockUpdates) {
        product.stock -= quantity;
        await product.save();

        // Record stock history
        await StockHistory.create({
          businessId: decoded.businessId,
          productId: product._id,
          type: "sale",
          quantity: -quantity,
          reference: sale._id,
        });
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

      // Update sale
      sale.paymentStatus = "completed";
      await sale.save();
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
          discount,
          paymentMethod,
          paymentStatus: sale.paymentStatus,
          cashRegisterId: resolvedCashRegisterId,
          customerName,
          items: saleItems,
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

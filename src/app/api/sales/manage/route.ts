import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db/connect";
import Sale from "@/lib/models/Sale";
import Invoice from "@/lib/models/Invoice";
import Payment from "@/lib/models/Payment";
import { verifyToken } from "@/lib/utils/jwt";

/**
 * GET - Get sales list, analytics, or specific sale details
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
    const type = searchParams.get("type") || "list"; // list, analytics, detail
    const saleId = searchParams.get("id");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const paymentStatus = searchParams.get("paymentStatus");
    const limit = parseInt(searchParams.get("limit") || "50");
    const skip = parseInt(searchParams.get("skip") || "0");

    await dbConnect();

    if (type === "detail" && saleId) {
      // Get specific sale with all details
      const sale = await Sale.findOne({
        _id: saleId,
        business: decoded.businessId,
      })
        .populate("invoice")
        .populate("cashRegister")
        .populate("user", "fullName email")
        .lean();

      if (!sale) {
        return NextResponse.json({ error: "Sale not found" }, { status: 404 });
      }

      // Get associated payment if exists
      const payment = await Payment.findOne({
        sale: saleId,
      }).lean();

      return NextResponse.json({
        sale: {
          ...sale,
          payment,
        },
      });
    }

    if (type === "analytics") {
      // Get sales analytics for date range
      const query: any = { business: decoded.businessId };

      if (startDate && endDate) {
        query.createdAt = {
          $gte: new Date(startDate),
          $lte: new Date(endDate),
        };
      }

      const sales = await Sale.find(query).lean();

      const analytics = {
        totalSales: sales.length,
        totalRevenue: sales.reduce((sum, s) => sum + (s.totalWithTax || s.total), 0),
        totalTax: sales.reduce((sum, s) => sum + (s.tax || 0), 0),
        totalDiscount: sales.reduce((sum, s) => sum + s.discount, 0),
        averageTicket:
          sales.length > 0
            ? sales.reduce((sum, s) => sum + (s.totalWithTax || s.total), 0) / sales.length
            : 0,
        byPaymentMethod: {
          cash: sales.filter((s) => s.paymentMethod === "cash").length,
          card: sales.filter((s) => s.paymentMethod === "card").length,
          check: sales.filter((s) => s.paymentMethod === "check").length,
          online: sales.filter((s) => s.paymentMethod === "online").length,
          mercadopago: sales.filter((s) => s.paymentMethod === "mercadopago")
            .length,
        },
        byPaymentStatus: {
          completed: sales.filter((s) => s.paymentStatus === "completed")
            .length,
          pending: sales.filter((s) => s.paymentStatus === "pending").length,
          failed: sales.filter((s) => s.paymentStatus === "failed").length,
          partial: sales.filter((s) => s.paymentStatus === "partial").length,
        },
      };

      return NextResponse.json({ analytics });
    }

    // Default: list sales
    const query: any = { business: decoded.businessId };

    if (startDate && endDate) {
      query.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }

    if (paymentStatus) {
      query.paymentStatus = paymentStatus;
    }

    const sales = await Sale.find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip)
      .populate("invoice", "invoiceNumber totalAmount paymentStatus")
      .populate("user", "fullName")
      .lean();

    const total = await Sale.countDocuments(query);

    return NextResponse.json({
      sales,
      pagination: {
        total,
        limit,
        skip,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Get sales error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * PUT - Update sale (mark as paid, update status, etc)
 */
export async function PUT(req: NextRequest) {
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

    if (!saleId) {
      return NextResponse.json({ error: "Sale ID required" }, { status: 400 });
    }

    const body = await req.json();
    const { paymentStatus, notes } = body;

    await dbConnect();

    const sale = await Sale.findOne({
      _id: saleId,
      business: decoded.businessId,
    });

    if (!sale) {
      return NextResponse.json({ error: "Sale not found" }, { status: 404 });
    }

    if (paymentStatus) {
      sale.paymentStatus = paymentStatus;

      // Update associated invoice status
      if (sale.invoice) {
        const invoice = await Invoice.findOne({
          _id: sale.invoice,
          business: decoded.businessId,
        });

        if (invoice) {
          invoice.paymentStatus =
            paymentStatus === "completed"
              ? "PAID"
              : paymentStatus === "partial"
              ? "PARTIAL"
              : "PENDING";
          await invoice.save();
        }
      }
    }

    if (notes !== undefined) {
      sale.notes = notes;
    }

    await sale.save();

    return NextResponse.json({
      sale,
      message: "Sale updated successfully",
    });
  } catch (error) {
    console.error("Update sale error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * DELETE - Delete sale (only if pending/failed)
 */
export async function DELETE(req: NextRequest) {
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

    if (!saleId) {
      return NextResponse.json({ error: "Sale ID required" }, { status: 400 });
    }

    await dbConnect();

    const sale = await Sale.findOne({
      _id: saleId,
      business: decoded.businessId,
    });

    if (!sale) {
      return NextResponse.json({ error: "Sale not found" }, { status: 404 });
    }

    // Only allow deletion of pending or failed sales
    if (!["pending", "failed"].includes(sale.paymentStatus)) {
      return NextResponse.json(
        { error: "Can only delete pending or failed sales" },
        { status: 400 }
      );
    }

    // Delete associated invoice if exists
    if (sale.invoice) {
      await Invoice.deleteOne({
        _id: sale.invoice,
        business: decoded.businessId,
      });
    }

    // Delete sale
    await Sale.deleteOne({ _id: saleId, business: decoded.businessId });

    return NextResponse.json({ message: "Sale deleted successfully" });
  } catch (error) {
    console.error("Delete sale error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

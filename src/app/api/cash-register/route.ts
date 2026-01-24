import { NextRequest } from "next/server";
import dbConnect from "@/lib/db/connect";
import CashRegister from "@/lib/models/CashRegister";
import CashMovement from "@/lib/models/CashMovement";
import Business from "@/lib/models/Business";
import User from "@/lib/models/User";
import { authMiddleware } from "@/lib/middleware/auth";
import {
  generateErrorResponse,
  generateSuccessResponse,
} from "@/lib/utils/helpers";

export async function GET(req: NextRequest) {
  try {
    const authResult = await authMiddleware(req);
    if (!authResult.authorized) {
      return generateErrorResponse(authResult.error || "Unauthorized", 401);
    }

    const { businessId } = authResult.user!;
    await dbConnect();

    // Get current open session
    const openSession = await CashRegister.findOne({
      businessId,
      status: "open",
    });

    // Get movements for current session
    let movements = [];
    if (openSession) {
      movements = await CashMovement.find({
        cashRegisterId: openSession._id,
      }).sort({ createdAt: 1 });
    }

    // Get session history (last 10 closed sessions)
    const closedSessions = await CashRegister.find({
      businessId,
      status: "closed",
    })
      .sort({ closedAt: -1 })
      .limit(10);

    // Format session history with proper data
    const sessions = closedSessions.map((session) => ({
      openedAt: session.openedAt?.toLocaleString("es-AR") || "-",
      initial: session.openingBalance || 0,
      sales: session.salesTotal || 0,
      withdrawals: session.withdrawalsTotal || 0,
      expected:
        (session.openingBalance || 0) +
        (session.salesTotal || 0) -
        (session.withdrawalsTotal || 0),
      real: session.closingBalance != null ? session.closingBalance : null,
      diff:
        session.closingBalance != null
          ? session.closingBalance -
            ((session.openingBalance || 0) +
              (session.salesTotal || 0) -
              (session.withdrawalsTotal || 0))
          : null,
      status: "Cerrada",
    }));

    // Add current open session to history if exists
    if (openSession) {
      const currentSessionData = {
        openedAt: openSession.openedAt?.toLocaleString("es-AR") || "-",
        initial: openSession.openingBalance || 0,
        sales: movements
          .filter((m) => m.type === "venta")
          .reduce((sum, m) => sum + m.amount, 0),
        withdrawals: movements
          .filter((m) => m.type === "retiro")
          .reduce((sum, m) => sum + m.amount, 0),
        expected:
          (openSession.openingBalance || 0) +
          movements
            .filter((m) => m.type === "venta")
            .reduce((sum, m) => sum + m.amount, 0) -
          movements
            .filter((m) => m.type === "retiro")
            .reduce((sum, m) => sum + m.amount, 0),
        real: null,
        diff: null,
        status: "Abierta",
      };
      sessions.unshift(currentSessionData);
    }

    // Calculate totals from current session
    const initialAmount = openSession?.openingBalance || 0;
    const salesTotal = movements
      .filter((m) => m.type === "venta")
      .reduce((sum, m) => sum + m.amount, 0);
    const withdrawalsTotal = movements
      .filter((m) => m.type === "retiro")
      .reduce((sum, m) => sum + m.amount, 0);
    const creditNotesTotal = movements
      .filter((m) => m.type === "nota_credito")
      .reduce((sum, m) => sum + m.amount, 0);
    const expected =
      initialAmount + salesTotal - withdrawalsTotal - creditNotesTotal;

    // Format movements with proper timestamps
    const formattedMovements = movements.map((m) => ({
      _id: m._id,
      type: m.type,
      description: m.description,
      amount: m.amount,
      createdAt: m.createdAt?.toLocaleString("es-AR") || "-",
    }));

    return generateSuccessResponse({
      isOpen: !!openSession,
      sessionId: openSession?._id,
      initialAmount,
      salesTotal,
      withdrawalsTotal,
      creditNotesTotal,
      expected,
      currentBalance: openSession?.currentBalance || 0,
      movements: formattedMovements,
      sessions,
    });
  } catch (error) {
    console.error("Cash register GET error:", error);
    return generateErrorResponse("Internal server error", 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    const authResult = await authMiddleware(req);
    if (!authResult.authorized) {
      return generateErrorResponse(authResult.error || "Unauthorized", 401);
    }

    const { businessId, userId } = authResult.user!;
    const body = await req.json();
    const { action, amount, reason, countedAmount } = body;

    if (!action || !["open", "close"].includes(action)) {
      return generateErrorResponse("Invalid action", 400);
    }

    await dbConnect();

    if (action === "open") {
      const existingOpen = await CashRegister.findOne({
        businessId,
        status: "open",
      });
      if (existingOpen) {
        const existingMovements = await CashMovement.find({
          cashRegisterId: existingOpen._id,
        }).sort({ createdAt: 1 });
        // Idempotent open: return current open session details
        return generateSuccessResponse({
          cashRegister: existingOpen,
          isOpen: true,
          movements: existingMovements,
          message: "Cash register already open",
        });
      }

      const cashRegister = new CashRegister({
        businessId,
        openedBy: userId,
        openingBalance: amount || 0,
        currentBalance: amount || 0,
        status: "open",
        openedAt: new Date(),
      });

      await cashRegister.save();

      // Create opening movement
      const movement = new CashMovement({
        cashRegisterId: cashRegister._id,
        businessId,
        type: "apertura",
        description: "Apertura de caja",
        amount: amount || 0,
        createdBy: userId,
      });

      await movement.save();

      return generateSuccessResponse(
        {
          cashRegister,
          isOpen: true,
          movements: [movement],
        },
        201,
      );
    } else {
      // Close
      const cashRegister = await CashRegister.findOne({
        businessId,
        status: "open",
      });
      if (!cashRegister) {
        return generateErrorResponse("No open cash register found", 404);
      }

      // Get all movements for this session to calculate totals
      const movements = await CashMovement.find({
        cashRegisterId: cashRegister._id,
      });

      const salesTotal = movements
        .filter((m) => m.type === "venta")
        .reduce((sum, m) => sum + m.amount, 0);
      const withdrawalsTotal = movements
        .filter((m) => m.type === "retiro")
        .reduce((sum, m) => sum + m.amount, 0);
      const creditNotesTotal = movements
        .filter((m) => m.type === "nota_credito")
        .reduce((sum, m) => sum + m.amount, 0);
      const expected =
        cashRegister.openingBalance +
        salesTotal -
        withdrawalsTotal -
        creditNotesTotal;

      cashRegister.status = "closed";
      cashRegister.closedAt = new Date();
      cashRegister.closedBy = userId;
      const closingBalance =
        typeof countedAmount === "number"
          ? countedAmount
          : cashRegister.currentBalance;
      cashRegister.closingBalance = closingBalance;
      cashRegister.salesTotal = salesTotal;
      cashRegister.withdrawalsTotal = withdrawalsTotal;
      // Persist current balance to match closing balance
      cashRegister.currentBalance = closingBalance;

      // Fetch business and cashier info for receipt summary
      const [business, cashier] = await Promise.all([
        Business.findById(businessId).select("name"),
        User.findById(userId).select("fullName username email"),
      ]);

      await cashRegister.save();

      // Create closing movement
      const movement = new CashMovement({
        cashRegisterId: cashRegister._id,
        businessId,
        type: "cierre",
        description: "Cierre de caja",
        amount: closingBalance || expected,
        createdBy: userId,
      });

      await movement.save();

      const formattedMovements = movements.map((m) => ({
        _id: m._id,
        type: m.type,
        description: m.description,
        amount: m.amount,
        createdAt: m.createdAt?.toLocaleString("es-AR") || "-",
      }));
      formattedMovements.push({
        _id: movement._id,
        type: movement.type,
        description: movement.description,
        amount: movement.amount,
        createdAt: movement.createdAt?.toLocaleString("es-AR") || "-",
      });

      return generateSuccessResponse({
        cashRegister,
        isOpen: false,
        message: "Cash register closed successfully",
        summary: {
          businessName: business?.name || "Mi Negocio",
          cashierName:
            cashier?.fullName || cashier?.username || cashier?.email || "",
          sessionId: cashRegister._id.toString(),
          openedAt: cashRegister.openedAt?.toLocaleString("es-AR") || "",
          closedAt: cashRegister.closedAt?.toLocaleString("es-AR") || "",
          openingBalance: cashRegister.openingBalance || 0,
          salesTotal,
          withdrawalsTotal,
          creditNotesTotal,
          expected,
          countedAmount: closingBalance,
          difference: closingBalance - expected,
          movements: formattedMovements,
        },
      });
    }
  } catch (error) {
    console.error("Cash register error:", error);
    return generateErrorResponse("Internal server error", 500);
  }
}

import { NextRequest } from "next/server";
import dbConnect from "@/lib/db/connect";
import CashRegister from "@/lib/models/CashRegister";
import CashMovement from "@/lib/models/CashMovement";
import { authMiddleware } from "@/lib/middleware/auth";
import {
  generateErrorResponse,
  generateSuccessResponse,
} from "@/lib/utils/helpers";

export async function POST(req: NextRequest) {
  try {
    const authResult = await authMiddleware(req);
    if (!authResult.authorized) {
      return generateErrorResponse(authResult.error || "Unauthorized", 401);
    }

    const { businessId, userId } = authResult.user!;
    const body = await req.json();
    const { action, amount, reason, notes } = body;

    if (!action || !["withdrawal", "credit_note"].includes(action)) {
      return generateErrorResponse("Invalid action", 400);
    }

    if (!amount || amount <= 0) {
      return generateErrorResponse("Invalid amount", 400);
    }

    await dbConnect();

    // Get current open session
    const openSession = await CashRegister.findOne({
      businessId,
      status: "open",
    });

    if (!openSession) {
      return generateErrorResponse("No open cash register session", 404);
    }

    // Create movement
    const movementType = action === "withdrawal" ? "retiro" : "nota_credito";
    const movementDescription =
      action === "withdrawal" ? "withdrawal" : "creditNote";
    const movementReason = reason || "noReason";

    const movement = new CashMovement({
      cashRegisterId: openSession._id,
      businessId,
      type: movementType,
      description: `${movementDescription}:${movementReason}`,
      amount,
      createdBy: userId,
      notes,
    });

    await movement.save();

    // Update current balance based on movement type
    if (action === "withdrawal") {
      // Withdrawals reduce the balance
      openSession.currentBalance -= amount;
    } else {
      // Credit notes also reduce the balance (returning money)
      openSession.currentBalance -= amount;
    }

    await openSession.save();

    // Fetch updated movements
    const movements = await CashMovement.find({
      cashRegisterId: openSession._id,
    }).sort({ createdAt: 1 });

    const salesTotal = movements
      .filter((m) => m.type === "venta")
      .reduce((sum, m) => sum + m.amount, 0);
    const withdrawalsTotal = movements
      .filter((m) => m.type === "retiro")
      .reduce((sum, m) => sum + m.amount, 0);
    const creditNotesTotal = movements
      .filter((m) => m.type === "nota_credito")
      .reduce((sum, m) => sum + m.amount, 0);

    const formattedMovements = movements.map((m) => ({
      _id: m._id,
      type: m.type,
      description: m.description,
      amount: m.amount,
      createdAt: m.createdAt?.toLocaleString("es-AR") || "-",
    }));

    return generateSuccessResponse(
      {
        movement,
        currentBalance: openSession.currentBalance,
        movements: formattedMovements,
        initialAmount: openSession.openingBalance,
        salesTotal,
        withdrawalsTotal,
        creditNotesTotal,
        expected:
          openSession.openingBalance +
          salesTotal -
          withdrawalsTotal -
          creditNotesTotal,
      },
      201,
    );
  } catch (error) {
    console.error("Cash movement error:", error);
    return generateErrorResponse("Internal server error", 500);
  }
}

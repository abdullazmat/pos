import { NextRequest } from "next/server";
import dbConnect from "@/lib/db/connect";
import CashRegister from "@/lib/models/CashRegister";
import CashMovement from "@/lib/models/CashMovement";
import User from "@/lib/models/User";
import { authMiddleware } from "@/lib/middleware/auth";
import { comparePassword } from "@/lib/utils/password";
import {
  generateErrorResponse,
  generateSuccessResponse,
} from "@/lib/utils/helpers";

type ApproverInfo = {
  user_id: string;
  visible_name: string;
  role: "supervisor" | "admin";
};

export async function POST(req: NextRequest) {
  try {
    const authResult = await authMiddleware(req);
    if (!authResult.authorized) {
      return generateErrorResponse(authResult.error || "Unauthorized", 401);
    }

    const { businessId, userId, role } = authResult.user!;
    // Always fetch user fullName from DB (not present in JWT)
    const userDoc = await (await import("@/lib/models/User")).default
      .findById(userId)
      .select("fullName");
    const fullName = userDoc?.fullName || "";
    const body = await req.json();
    const { action, amount, reason, notes, approvalPassword } = body;

    const verifyApprover = async (
      allowedRoles: Array<"supervisor" | "admin">,
    ): Promise<ApproverInfo | null> => {
      if (!approvalPassword || typeof approvalPassword !== "string") {
        return null;
      }

      const approverCandidates = await User.find({
        businessId,
        role: { $in: allowedRoles },
        isActive: true,
      }).select("fullName password role");

      for (const candidate of approverCandidates) {
        const isValid = await comparePassword(
          approvalPassword,
          candidate.password,
        );
        if (isValid) {
          return {
            user_id: candidate._id.toString(),
            visible_name: candidate.fullName || "",
            role: candidate.role,
          };
        }
      }

      return null;
    };

    const hasApprovalPassword =
      typeof approvalPassword === "string" &&
      approvalPassword.trim().length > 0;

    // Permissions enforcement with approvals
    let approvedBy: ApproverInfo | null = null;
    if (action === "withdrawal") {
      if (role === "cashier") {
        if (!hasApprovalPassword) {
          return generateErrorResponse("approvalPasswordRequired", 403);
        }
        approvedBy = await verifyApprover(["supervisor", "admin"]);
        if (!approvedBy) {
          return generateErrorResponse("invalidApprovalPassword", 403);
        }
      }
    }

    if (action === "credit_note") {
      if (role !== "admin") {
        if (!hasApprovalPassword) {
          return generateErrorResponse("approvalPasswordRequired", 403);
        }
        approvedBy = await verifyApprover(["admin"]);
        if (!approvedBy) {
          return generateErrorResponse("invalidApprovalPassword", 403);
        }
      }
    }

    if (!action || !["withdrawal", "credit_note"].includes(action)) {
      return generateErrorResponse("invalidAction", 400);
    }

    if (!amount || amount <= 0) {
      return generateErrorResponse("invalidAmount", 400);
    }

    await dbConnect();

    // Get current open session
    const openSession = await CashRegister.findOne({
      businessId,
      status: "open",
    });

    if (!openSession) {
      return generateErrorResponse("noOpenSession", 404);
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
      operator: {
        user_id: userId,
        visible_name: fullName,
        role: role || "cashier",
        session_id: openSession._id.toString(),
      },
      approvedBy: approvedBy
        ? {
            user_id: approvedBy.user_id,
            visible_name: approvedBy.visible_name,
            role: approvedBy.role,
          }
        : undefined,
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
      createdAt: m.createdAt?.toISOString() || null,
      createdAtISO: m.createdAt?.toISOString() || null,
      operator: m.operator || null,
      approvedBy: m.approvedBy || null,
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

import { NextRequest } from "next/server";
import dbConnect from "@/lib/db/connect";
import Client from "@/lib/models/Client";
import ClientAccountTransaction from "@/lib/models/ClientAccountTransaction";
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
    const { searchParams } = new URL(req.url);
    const clientId = searchParams.get("clientId");

    if (!clientId) {
      return generateErrorResponse("Client ID is required", 400);
    }

    await dbConnect();

    const client = await Client.findOne({
      _id: clientId,
      business: businessId,
    });
    if (!client) {
      return generateErrorResponse("Client not found", 404);
    }

    const transactions = await ClientAccountTransaction.find({
      businessId,
      clientId,
    })
      .sort({ createdAt: -1 })
      .lean();

    const balance = transactions.reduce((acc: number, txn: any) => {
      if (txn.type === "payment") return acc - (txn.amount || 0);
      return acc + (txn.amount || 0);
    }, 0);

    return generateSuccessResponse({
      client,
      balance,
      transactions,
    });
  } catch (error) {
    console.error("Client account GET error:", error);
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
    const { clientId, amount, description } = body;

    if (!clientId) {
      return generateErrorResponse("Client ID is required", 400);
    }

    const normalizedAmount = Number(amount);
    if (!Number.isFinite(normalizedAmount) || normalizedAmount <= 0) {
      return generateErrorResponse("Amount must be greater than 0", 400);
    }

    await dbConnect();

    const client = await Client.findOne({
      _id: clientId,
      business: businessId,
    });
    if (!client) {
      return generateErrorResponse("Client not found", 404);
    }

    const transaction = await ClientAccountTransaction.create({
      businessId,
      clientId,
      type: "payment",
      amount: normalizedAmount,
      description: description || "",
      createdBy: userId,
    });

    return generateSuccessResponse({ transaction });
  } catch (error) {
    console.error("Client account POST error:", error);
    return generateErrorResponse("Internal server error", 500);
  }
}

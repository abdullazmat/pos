import { NextRequest } from "next/server";
import dbConnect from "@/lib/db/connect";
import { authMiddleware } from "@/lib/middleware/auth";
import {
  generateErrorResponse,
  generateSuccessResponse,
} from "@/lib/utils/helpers";
import Business from "@/lib/models/Business";
import User from "@/lib/models/User";
import Client from "@/lib/models/Client";
import {
  MAX_DISCOUNT_PERCENT,
  normalizeDiscountLimit,
} from "@/lib/utils/discounts";

export async function POST(req: NextRequest) {
  try {
    const auth = await authMiddleware(req);
    if (!auth.authorized) {
      return generateErrorResponse(auth.error || "Unauthorized", 401);
    }

    const user = auth.user!;
    if (user.role !== "admin") {
      return generateErrorResponse("Forbidden", 403);
    }

    await dbConnect();

    const business = await Business.findById(user.businessId).select(
      "migrations",
    );
    if (business?.migrations?.discountLimitMax5) {
      return generateSuccessResponse({
        alreadyRun: true,
        updatedUsers: 0,
        updatedClients: 0,
      });
    }

    const users = await User.find({
      businessId: user.businessId,
      discountLimit: { $ne: null },
    }).select("_id discountLimit");

    const userUpdates: Parameters<typeof User.bulkWrite>[0] = [];
    for (const entry of users) {
      const normalized = normalizeDiscountLimit(entry.discountLimit);
      if (typeof normalized !== "number") continue;
      if (normalized > MAX_DISCOUNT_PERCENT) {
        userUpdates.push({
          updateOne: {
            filter: { _id: entry._id, businessId: user.businessId },
            update: { $set: { discountLimit: MAX_DISCOUNT_PERCENT } },
          },
        });
      }
    }

    const clients = await Client.find({
      business: user.businessId,
      discountLimit: { $ne: null },
    }).select("_id discountLimit");

    const clientUpdates: Parameters<typeof Client.bulkWrite>[0] = [];
    for (const entry of clients) {
      const normalized = normalizeDiscountLimit(entry.discountLimit);
      if (typeof normalized !== "number") continue;
      if (normalized > MAX_DISCOUNT_PERCENT) {
        clientUpdates.push({
          updateOne: {
            filter: { _id: entry._id, business: user.businessId },
            update: { $set: { discountLimit: MAX_DISCOUNT_PERCENT } },
          },
        });
      }
    }

    let updatedUsers = 0;
    if (userUpdates.length > 0) {
      const result = await User.bulkWrite(userUpdates);
      updatedUsers = result.modifiedCount || 0;
    }

    let updatedClients = 0;
    if (clientUpdates.length > 0) {
      const result = await Client.bulkWrite(clientUpdates);
      updatedClients = result.modifiedCount || 0;
    }

    await Business.updateOne(
      { _id: user.businessId },
      { $set: { "migrations.discountLimitMax5": new Date() } },
    );

    return generateSuccessResponse({
      alreadyRun: false,
      updatedUsers,
      updatedClients,
    });
  } catch (error) {
    console.error("Discount limit migration error:", error);
    return generateErrorResponse("Internal server error", 500);
  }
}

import { NextRequest } from "next/server";
import dbConnect from "@/lib/db/connect";
import User from "@/lib/models/User";
import { authMiddleware } from "@/lib/middleware/auth";
import {
  generateErrorResponse,
  generateSuccessResponse,
} from "@/lib/utils/helpers";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const authResult = await authMiddleware(req);
    if (!authResult.authorized) {
      return generateErrorResponse(authResult.error || "Unauthorized", 401);
    }

    await dbConnect();

    const user = await User.findOne({
      _id: authResult.user!.userId,
      businessId: authResult.user!.businessId,
      isActive: true,
    }).select("email fullName username role phone discountLimit");

    if (!user) {
      return generateErrorResponse("User not found", 404);
    }

    return generateSuccessResponse({
      user: {
        id: user._id,
        email: user.email,
        fullName: user.fullName,
        username: user.username,
        role: user.role,
        phone: user.phone,
        discountLimit: user.discountLimit ?? null,
      },
    });
  } catch (error) {
    console.error("Get current user error:", error);
    return generateErrorResponse("Internal server error", 500);
  }
}

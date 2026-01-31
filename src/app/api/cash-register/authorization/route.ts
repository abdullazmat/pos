import { NextRequest } from "next/server";
import dbConnect from "@/lib/db/connect";
import User from "@/lib/models/User";
import { authMiddleware } from "@/lib/middleware/auth";
import { comparePassword } from "@/lib/utils/password";
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
    const { approvalPassword } = body;

    const hasApprovalPassword =
      typeof approvalPassword === "string" &&
      approvalPassword.trim().length > 0;

    if (!hasApprovalPassword) {
      return generateErrorResponse("approvalPasswordRequired", 403);
    }

    await dbConnect();

    const requester = await User.findOne({
      _id: userId,
      businessId,
      isActive: true,
    }).select("fullName password role");

    const candidates = [] as Array<{
      _id: any;
      fullName?: string;
      password: string;
      role: "cashier" | "supervisor" | "admin";
    }>;

    if (requester && requester.role === "admin") {
      candidates.push(requester as any);
    } else {
      const admins = await User.find({
        businessId,
        role: "admin",
        isActive: true,
      }).select("fullName password role");
      candidates.push(...(admins as any));
    }

    for (const candidate of candidates) {
      const isValid = await comparePassword(
        approvalPassword,
        candidate.password,
      );
      if (isValid) {
        return generateSuccessResponse({
          approvedBy: {
            user_id: candidate._id.toString(),
            visible_name: candidate.fullName || "",
            role: candidate.role,
          },
        });
      }
    }

    return generateErrorResponse("invalidApprovalPassword", 403);
  } catch (error) {
    console.error("Cash register authorization error:", error);
    return generateErrorResponse("Internal server error", 500);
  }
}

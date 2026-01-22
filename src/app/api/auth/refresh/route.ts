import { NextRequest } from "next/server";
import {
  verifyRefreshToken,
  createAccessToken,
  createRefreshToken,
} from "@/lib/utils/jwt";
import {
  generateErrorResponse,
  generateSuccessResponse,
} from "@/lib/utils/helpers";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { refreshToken } = body;

    if (!refreshToken) {
      return generateErrorResponse("Refresh token required", 400);
    }

    const payload = verifyRefreshToken(refreshToken);
    if (!payload) {
      return generateErrorResponse("Invalid refresh token", 401);
    }

    const newAccessToken = createAccessToken({
      userId: payload.userId,
      businessId: payload.businessId,
      email: payload.email,
      role: payload.role,
    });

    const newRefreshToken = createRefreshToken({
      userId: payload.userId,
      businessId: payload.businessId,
      email: payload.email,
      role: payload.role,
    });

    return generateSuccessResponse({
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    });
  } catch (error) {
    console.error("Refresh token error:", error);
    return generateErrorResponse("Internal server error", 500);
  }
}

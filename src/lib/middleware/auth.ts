import { NextRequest } from "next/server";
import { verifyAccessToken, JWTPayload } from "../utils/jwt";

export async function authMiddleware(req: NextRequest) {
  const authHeader = req.headers.get("authorization");

  if (!authHeader?.startsWith("Bearer ")) {
    return {
      authorized: false,
      user: null,
      error: "missingAuthHeader",
    };
  }

  const token = authHeader.substring(7);
  const user = verifyAccessToken(token);

  if (!user) {
    return {
      authorized: false,
      user: null,
      error: "invalidOrExpiredToken",
    };
  }

  return {
    authorized: true,
    user,
    error: null,
  };
}

export function roleMiddleware(allowedRoles: string[]) {
  return (user: JWTPayload | null) => {
    if (!user) return false;
    return allowedRoles.includes(user.role);
  };
}

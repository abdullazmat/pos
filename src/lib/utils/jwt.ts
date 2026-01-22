import jwt from "jsonwebtoken";

const JWT_SECRET =
  process.env.JWT_SECRET || "dev-secret-key-change-in-production-min-32-char";
const JWT_REFRESH_SECRET =
  process.env.JWT_REFRESH_SECRET ||
  "dev-refresh-key-change-in-production-32-char";

export interface JWTPayload {
  userId: string;
  businessId: string;
  email: string;
  role: "admin" | "supervisor" | "cashier";
  iat?: number;
  exp?: number;
}

export function createAccessToken(
  payload: Omit<JWTPayload, "iat" | "exp">
): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "15m" });
}

export function createRefreshToken(
  payload: Omit<JWTPayload, "iat" | "exp">
): string {
  return jwt.sign(payload, JWT_REFRESH_SECRET, { expiresIn: "7d" });
}

export function verifyAccessToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload;
  } catch {
    return null;
  }
}

// Alias for backward compatibility
export const verifyToken = verifyAccessToken;

export function verifyRefreshToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, JWT_REFRESH_SECRET) as JWTPayload;
  } catch {
    return null;
  }
}

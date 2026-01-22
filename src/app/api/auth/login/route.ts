import { NextRequest } from "next/server";
import dbConnect from "@/lib/db/connect";
import User from "@/lib/models/User";
import Business from "@/lib/models/Business";
import { comparePassword } from "@/lib/utils/password";
import { createAccessToken, createRefreshToken } from "@/lib/utils/jwt";
import {
  generateErrorResponse,
  generateSuccessResponse,
  validateEmail,
} from "@/lib/utils/helpers";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { username, email, password } = body;

    // Accept either username or email
    const loginIdentifier = username || email;

    if (!loginIdentifier || !password) {
      return generateErrorResponse("Username/Email and password required", 400);
    }

    await dbConnect();

    // Try to find user by username first, then by email
    let user = await User.findOne({ username: loginIdentifier?.toLowerCase() });
    if (!user && validateEmail(loginIdentifier)) {
      user = await User.findOne({ email: loginIdentifier });
    }

    if (!user) {
      return generateErrorResponse("Invalid credentials", 401);
    }

    const isPasswordValid = await comparePassword(password, user.password);
    if (!isPasswordValid) {
      return generateErrorResponse("Invalid credentials", 401);
    }

    if (!user.isActive) {
      return generateErrorResponse("User is inactive", 403);
    }

    const business = await Business.findById(user.businessId);
    if (!business) {
      return generateErrorResponse("Business not found", 404);
    }

    const accessToken = createAccessToken({
      userId: user._id.toString(),
      businessId: business._id.toString(),
      email: user.email,
      role: user.role,
    });

    const refreshToken = createRefreshToken({
      userId: user._id.toString(),
      businessId: business._id.toString(),
      email: user.email,
      role: user.role,
    });

    return generateSuccessResponse({
      user: {
        id: user._id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
      },
      business: {
        id: business._id,
        name: business.name,
      },
      accessToken,
      refreshToken,
    });
  } catch (error) {
    console.error("Login error:", error);
    return generateErrorResponse("Internal server error", 500);
  }
}

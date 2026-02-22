import { NextRequest } from "next/server";
import dbConnect from "@/lib/db/connect";
import User from "@/lib/models/User";
import Business from "@/lib/models/Business";
import Plan from "@/lib/models/Plan";
import Subscription from "@/lib/models/Subscription";
import { getPlanConfig } from "@/lib/services/subscriptions/PlanConfig";
import { hashPassword } from "@/lib/utils/password";
import { createAccessToken, createRefreshToken } from "@/lib/utils/jwt";
import {
  generateErrorResponse,
  generateSuccessResponse,
  validateEmail,
  validatePassword,
} from "@/lib/utils/helpers";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      businessName,
      email,
      password,
      fullName,
      username,
      phone,
      plan = "free",
    } = body;

    if (!username || !password || !fullName || !businessName) {
      return generateErrorResponse("Missing required fields", 400);
    }

    if (email && !validateEmail(email)) {
      return generateErrorResponse("Invalid email format", 400);
    }

    if (!validatePassword(password)) {
      return generateErrorResponse(
        "Password must be at least 6 characters",
        400,
      );
    }

    await dbConnect();

    // Check if username already exists
    const existingUsername = await User.findOne({
      username: username.toLowerCase(),
    });
    if (existingUsername) {
      return generateErrorResponse("Username already exists", 409);
    }

    // Check if email already exists (if provided)
    if (email) {
      const existingEmail = await User.findOne({ email });
      if (existingEmail) {
        return generateErrorResponse("Email already exists", 409);
      }
    }

    const hashedPassword = await hashPassword(password);

    const selectedPlan = await Plan.findOne({ name: "free" });
    if (!selectedPlan) {
      return generateErrorResponse("Free plan not found", 500);
    }

    const newUser = new User({
      email: email || `${username}@poscloud.local`,
      password: hashedPassword,
      fullName,
      username: username.toLowerCase(),
      phone,
      role: "admin",
      isActive: true,
      businessId: null,
    });

    const business = new Business({
      name: businessName,
      owner: newUser._id,
      email: email || `${username}@poscloud.local`,
      phone,
    });

    newUser.businessId = business._id;

    // Verify plan exists or fallback to BASIC
    const requestedPlanId = (plan || "BASIC").toUpperCase();
    const planExists = !!getPlanConfig(requestedPlanId);
    const finalPlanId = planExists ? requestedPlanId : "BASIC";

    const subscription = new Subscription({
      businessId: business._id,
      planId: finalPlanId,
      status: "active",
      currentPeriodStart: new Date(),
      currentPeriodEnd: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
    });

    await newUser.save();
    await business.save();
    await subscription.save();

    business.subscriptionId = subscription._id;
    await business.save();

    const accessToken = createAccessToken({
      userId: newUser._id.toString(),
      businessId: business._id.toString(),
      email: newUser.email,
      role: newUser.role,
    });

    const refreshToken = createRefreshToken({
      userId: newUser._id.toString(),
      businessId: business._id.toString(),
      email: newUser.email,
      role: newUser.role,
    });

    return generateSuccessResponse(
      {
        user: {
          id: newUser._id,
          email: newUser.email,
          fullName: newUser.fullName,
          role: newUser.role,
        },
        business: {
          id: business._id,
          name: business.name,
        },
        accessToken,
        refreshToken,
      },
      201,
    );
  } catch (error) {
    console.error("Registration error:", error);
    return generateErrorResponse("Internal server error", 500);
  }
}

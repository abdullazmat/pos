import { NextRequest } from "next/server";
import dbConnect from "@/lib/db/connect";
import KeyboardConfig from "@/lib/models/KeyboardConfig";
import { authMiddleware } from "@/lib/middleware/auth";
import {
  generateErrorResponse,
  generateSuccessResponse,
} from "@/lib/utils/helpers";

// Default keyboard profiles
const PROFILES = {
  classic: {
    searchProduct: "F2",
    quantity: "F3",
    applyDiscount: "F4",
    paymentMethod: "F5",
    finalizeSale: "F9",
    cancelSale: "F10",
    removeLastItem: "F8",
    openDrawer: "F11",
    addProduct: "Enter",
    quickPayment: "F12",
  },
  numeric: {
    searchProduct: "F2",
    quantity: "F3",
    applyDiscount: "F4",
    paymentMethod: "F5",
    finalizeSale: "F9",
    cancelSale: "F10",
    removeLastItem: "F8",
    openDrawer: "F11",
    addProduct: "Enter",
    quickPayment: "F12",
  },
  speedster: {
    searchProduct: "Q",
    quantity: "W",
    applyDiscount: "E",
    paymentMethod: "R",
    finalizeSale: "Space",
    cancelSale: "Escape",
    removeLastItem: "Backspace",
    openDrawer: "F11",
    addProduct: "Enter",
    quickPayment: "F12",
  },
};

// GET - Fetch keyboard configuration
export async function GET(req: NextRequest) {
  try {
    const authResult = await authMiddleware(req);
    if (!authResult.authorized) {
      return generateErrorResponse(authResult.error || "Unauthorized", 401);
    }

    const { businessId } = authResult.user!;

    await dbConnect();

    let config = await KeyboardConfig.findOne({ businessId }).lean();

    // If no config exists, create default
    if (!config) {
      config = await KeyboardConfig.create({
        businessId,
        profile: "classic",
        shortcuts: PROFILES.classic,
      });
    }

    return generateSuccessResponse({ config });
  } catch (error) {
    console.error("Get keyboard config error:", error);
    return generateErrorResponse("Internal server error", 500);
  }
}

// PUT - Update keyboard configuration
export async function PUT(req: NextRequest) {
  try {
    const authResult = await authMiddleware(req);
    if (!authResult.authorized) {
      return generateErrorResponse(authResult.error || "Unauthorized", 401);
    }

    const { businessId } = authResult.user!;
    const body = await req.json();
    const { profile, shortcuts } = body;

    await dbConnect();

    // Validate profile if provided
    if (
      profile &&
      !["classic", "numeric", "speedster", "custom"].includes(profile)
    ) {
      return generateErrorResponse("Invalid profile", 400);
    }

    let config = await KeyboardConfig.findOne({ businessId });

    if (!config) {
      // Create new config
      config = await KeyboardConfig.create({
        businessId,
        profile: profile || "classic",
        shortcuts: shortcuts || PROFILES.classic,
      });
    } else {
      // Update existing config
      if (profile) {
        config.profile = profile;
        // If setting a predefined profile, use its shortcuts
        if (
          profile !== "custom" &&
          PROFILES[profile as keyof typeof PROFILES]
        ) {
          config.shortcuts = PROFILES[profile as keyof typeof PROFILES];
        }
      }
      if (shortcuts) {
        config.shortcuts = { ...config.shortcuts, ...shortcuts };
        // If custom shortcuts provided, set profile to custom
        if (
          profile !== "classic" &&
          profile !== "numeric" &&
          profile !== "speedster"
        ) {
          config.profile = "custom";
        }
      }
      await config.save();
    }

    return generateSuccessResponse({ config });
  } catch (error) {
    console.error("Update keyboard config error:", error);
    return generateErrorResponse("Internal server error", 500);
  }
}

// POST - Reset to default
export async function POST(req: NextRequest) {
  try {
    const authResult = await authMiddleware(req);
    if (!authResult.authorized) {
      return generateErrorResponse(authResult.error || "Unauthorized", 401);
    }

    const { businessId } = authResult.user!;

    await dbConnect();

    const config = await KeyboardConfig.findOneAndUpdate(
      { businessId },
      {
        profile: "classic",
        shortcuts: PROFILES.classic,
      },
      { new: true, upsert: true },
    );

    return generateSuccessResponse({ config });
  } catch (error) {
    console.error("Reset keyboard config error:", error);
    return generateErrorResponse("Internal server error", 500);
  }
}

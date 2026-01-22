import { NextResponse } from "next/server";
import dbConnect from "@/lib/db/connect";
import { verifyToken } from "@/lib/utils/jwt";

export async function GET(request: Request) {
  try {
    const token = request.headers.get("authorization")?.split(" ")[1];

    if (!token) {
      return NextResponse.json(
        {
          success: false,
          error: "No token provided",
        },
        { status: 401 }
      );
    }

    const decoded = verifyToken(token);

    if (!decoded) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid token",
        },
        { status: 401 }
      );
    }

    await dbConnect();

    return NextResponse.json({
      success: true,
      message: "Database connected successfully",
      tokenInfo: {
        userId: decoded.userId,
        businessId: decoded.businessId,
        email: decoded.email,
        role: decoded.role,
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: "Database connection failed",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

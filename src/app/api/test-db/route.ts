import { NextResponse } from "next/server";

/**
 * TEST DATABASE ENDPOINT - DISABLED FOR PRODUCTION
 * This endpoint was used for development testing only.
 *
 * To enable for development:
 * 1. Uncomment the code below
 * 2. Only expose in development environment
 * 3. Require admin role
 *
 * Security Note: This endpoint exposes sensitive token information
 * and should NEVER be enabled in production environments.
 */

export async function GET(request: Request) {
  return NextResponse.json(
    {
      success: false,
      error: "Test endpoint is disabled in this environment",
      message:
        "For local development testing only. This endpoint has been disabled.",
    },
    { status: 403 },
  );
}

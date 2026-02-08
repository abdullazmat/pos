import { NextRequest } from "next/server";
import dbConnect from "@/lib/db/connect";
import { authMiddleware } from "@/lib/middleware/auth";
import {
  generateErrorResponse,
  generateSuccessResponse,
} from "@/lib/utils/helpers";
import AFIPService from "@/lib/services/afipService";

export const dynamic = "force-dynamic";

/**
 * POST /api/afip/validate-cuit
 * Validate CUIT format and AFIP registration
 */
export async function POST(req: NextRequest) {
  try {
    const authResult = await authMiddleware(req);
    if (!authResult.authorized) {
      return generateErrorResponse(authResult.error || "Unauthorized", 401);
    }

    const body = await req.json();
    const { cuit } = body;

    if (!cuit) {
      return generateErrorResponse("CUIT is required", 400);
    }

    await dbConnect();

    // Validate CUIT format
    const isValid = AFIPService.validateCUIT(cuit);
    if (!isValid) {
      return generateErrorResponse("Invalid CUIT format", 400);
    }

    // In production, verify CUIT with AFIP
    // For now, just return success
    const formattedCUIT = AFIPService.formatCUIT(cuit);

    return generateSuccessResponse({
      valid: true,
      cuit: formattedCUIT,
      message: "CUIT is valid",
    });
  } catch (error) {
    console.error("CUIT validation error:", error);
    return generateErrorResponse("Internal server error", 500);
  }
}

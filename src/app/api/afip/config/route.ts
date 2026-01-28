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
 * GET /api/afip/config
 * Get AFIP configuration and available options
 */
export async function GET(req: NextRequest) {
  try {
    const authResult = await authMiddleware(req);
    if (!authResult.authorized) {
      return generateErrorResponse(authResult.error || "Unauthorized", 401);
    }

    await dbConnect();

    return generateSuccessResponse({
      invoiceTypes: {
        A: "Factura A (Con CUIT)",
        B: "Factura B (Sin CUIT)",
        C: "Ticket",
      },
      vatRates: {
        "0": "Exento",
        "10.5": "IVA 10.5%",
        "21": "IVA 21%",
        "27": "IVA 27%",
      },
      currencies: {
        ARS: "Peso Argentino",
        USD: "Dólar Estadounidense",
      },
    });
  } catch (error) {
    console.error("AFIP config error:", error);
    return generateErrorResponse("Internal server error", 500);
  }
}

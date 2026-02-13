import { NextRequest } from "next/server";
import dbConnect from "@/lib/db/connect";
import FiscalConfiguration from "@/lib/models/FiscalConfiguration";
import { authMiddleware } from "@/lib/middleware/auth";
import {
  generateErrorResponse,
  generateSuccessResponse,
} from "@/lib/utils/helpers";
import { AFIPService } from "@/lib/services/afipService";

export async function POST(req: NextRequest) {
  try {
    const auth = await authMiddleware(req);
    if (!auth.authorized)
      return generateErrorResponse(auth.error || "Unauthorized", 401);

    const body = await req.json();
    const { businessId, cuit } = body;
    if (!businessId || !cuit)
      return generateErrorResponse("businessId and cuit are required", 400);

    // Validate CUIT format with existing helper
    if (!AFIPService.validateCUIT(cuit)) {
      return generateErrorResponse("Invalid CUIT format", 400);
    }

    await dbConnect();

    let fiscal = await FiscalConfiguration.findOne({ business: businessId });
    if (!fiscal) {
      fiscal = new FiscalConfiguration({
        business: businessId,
        country: "Argentina",
        fiscalRegime: "RESPONSABLE_INSCRIPTO",
        defaultIvaRate: 21,
        pointOfSale: 1,
      });
    }

    fiscal.cuit = String(cuit).replace(/\D/g, "");
    await fiscal.save();

    return generateSuccessResponse({
      message: "Business CUIT set",
      cuit: fiscal.cuit,
    });
  } catch (e: any) {
    return generateErrorResponse(e && e.message ? e.message : String(e), 500);
  }
}

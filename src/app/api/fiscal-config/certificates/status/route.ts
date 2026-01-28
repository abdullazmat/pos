/**
 * Certificate Status API
 * GET /api/fiscal-config/certificates/status
 * Returns the current status of uploaded certificates
 */

import { NextRequest } from "next/server";
import dbConnect from "@/lib/db/connect";
import FiscalConfiguration from "@/lib/models/FiscalConfiguration";
import { authMiddleware } from "@/lib/middleware/auth";
import {
  generateErrorResponse,
  generateSuccessResponse,
} from "@/lib/utils/helpers";

export const dynamic = "force-dynamic";

/**
 * GET /api/fiscal-config/certificates/status
 * Check certificate status and expiry
 */
export async function GET(req: NextRequest) {
  try {
    const authResult = await authMiddleware(req);
    if (!authResult.authorized) {
      return generateErrorResponse(authResult.error || "Unauthorized", 401);
    }

    const { businessId } = authResult.user!;
    await dbConnect();

    let fiscal = await FiscalConfiguration.findOne({
      business: businessId,
    }).lean<import("@/lib/models/FiscalConfiguration").IFiscalConfiguration>();

    if (!fiscal) {
      const newFiscal = new FiscalConfiguration({
        business: businessId,
        country: "Argentina",
        fiscalRegime: "RESPONSABLE_INSCRIPTO",
        defaultIvaRate: 21,
        pointOfSale: 1,
      });
      await newFiscal.save();
      fiscal =
        newFiscal.toObject() as import("@/lib/models/FiscalConfiguration").IFiscalConfiguration;
    }

    const f = fiscal!; // assured non-null after bootstrap above
    const certStatus = {
      digital: {
        status: f.certificateDigital?.status || "PENDING",
        expiryDate: f.certificateDigital?.expiryDate,
        fileName: f.certificateDigital?.fileName,
        uploadedAt: f.certificateDigital?.uploadedAt,
        isExpired: checkIfExpired(f.certificateDigital?.expiryDate),
      },
      privateKey: {
        status: f.privateKey?.status || "PENDING",
        fileName: f.privateKey?.fileName,
        uploadedAt: f.privateKey?.uploadedAt,
      },
    };

    return generateSuccessResponse(certStatus);
  } catch (error: any) {
    console.error("[CERTIFICATE STATUS]", error);
    return generateErrorResponse(
      error.message || "Failed to check certificate status",
      500,
    );
  }
}

/**
 * Check if certificate is expired
 */
function checkIfExpired(expiryDate: Date | undefined): boolean {
  if (!expiryDate) return false;
  return new Date() > expiryDate;
}

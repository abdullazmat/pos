/**
 * Fiscal Configuration API Endpoints
 * Handles: fiscal settings, certificates, CAE authorization
 */

import { NextRequest } from "next/server";
import dbConnect from "@/lib/db/connect";
import Business from "@/lib/models/Business";
import FiscalConfiguration from "@/lib/models/FiscalConfiguration";
import InvoiceAudit from "@/lib/models/InvoiceAudit";
import { authMiddleware } from "@/lib/middleware/auth";
import {
  generateErrorResponse,
  generateSuccessResponse,
} from "@/lib/utils/helpers";

/**
 * GET /api/fiscal-config
 * Retrieve fiscal configuration for business
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

    // If no fiscal config exists, create a default one
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

    // Don't return private key path
    const f = fiscal!; // assured non-null after bootstrap above
    if (f.privateKey) {
      f.privateKey.storagePath = undefined;
      f.privateKey.hash = undefined;
    }

    return generateSuccessResponse(f);
  } catch (error: any) {
    console.error("[FISCAL CONFIG GET]", error);
    return generateErrorResponse(
      error.message || "Failed to get fiscal configuration",
      500,
    );
  }
}

/**
 * POST /api/fiscal-config
 * Update fiscal configuration
 */
export async function POST(req: NextRequest) {
  try {
    const authResult = await authMiddleware(req);
    if (!authResult.authorized) {
      return generateErrorResponse(authResult.error || "Unauthorized", 401);
    }

    const { businessId, userId, email } = authResult.user!;
    const body = await req.json();

    await dbConnect();

    // Validate required fields
    if (!body.cuit) {
      return generateErrorResponse("CUIT is required", 400);
    }

    let fiscal = await FiscalConfiguration.findOne({
      business: businessId,
    });

    if (!fiscal) {
      fiscal = new FiscalConfiguration({ business: businessId });
    }

    // Update allowed fields
    const allowedFields = [
      "country",
      "fiscalRegime",
      "cuit",
      "cuil",
      "cdi",
      "defaultIvaRate",
      "pointOfSale",
    ];

    allowedFields.forEach((field) => {
      if (field in body) {
        (fiscal as any)[field] = body[field];
      }
    });

    await fiscal.save();

    // Audit log
    await InvoiceAudit.create({
      business: businessId,
      action: "UPDATE",
      actionDescription: "Updated fiscal configuration",
      userId,
      userEmail: email,
      metadata: {
        changes: {
          country: body.country,
          fiscalRegime: body.fiscalRegime,
          cuit: body.cuit,
          ivaRate: body.defaultIvaRate,
        },
      },
    });

    // Update Business model with basic fiscal info
    await Business.updateOne(
      { _id: businessId },
      {
        "fiscalConfig.country": body.country || "Argentina",
        "fiscalConfig.fiscalRegime":
          body.fiscalRegime || "RESPONSABLE_INSCRIPTO",
        "fiscalConfig.cuit": body.cuit,
        "fiscalConfig.ivaRate": body.defaultIvaRate || 21,
      },
    );

    return generateSuccessResponse({
      message: "Fiscal configuration updated",
      fiscal: fiscal.toObject(),
    });
  } catch (error: any) {
    console.error("[FISCAL CONFIG POST]", error);
    return generateErrorResponse(
      error.message || "Failed to update fiscal configuration",
      500,
    );
  }
}

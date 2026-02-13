/**
 * Fiscal Configuration API Endpoint
 * Handles: Save, Get, Update fiscal configuration
 */

import { NextRequest } from "next/server";
import dbConnect from "@/lib/db/connect";
import FiscalConfiguration from "@/lib/models/FiscalConfiguration";
import { authMiddleware } from "@/lib/middleware/auth";
import {
  generateErrorResponse,
  generateSuccessResponse,
} from "@/lib/utils/helpers";

export async function GET(req: NextRequest) {
  try {
    const authResult = await authMiddleware(req);
    if (!authResult.authorized) {
      return generateErrorResponse(authResult.error || "Unauthorized", 401);
    }

    const { businessId } = authResult.user!;

    await dbConnect();

    const config = await FiscalConfiguration.findOne({ business: businessId });

    return generateSuccessResponse({
      country: config?.country || "Argentina",
      taxRate: config?.taxRate || 21,
      fiscalRegime: config?.fiscalRegime || "RESPONSABLE_INSCRIPTO",
      fiscalId: config?.fiscalId || "",
    });
  } catch (error: any) {
    console.error("[FISCAL CONFIG]", error);
    return generateErrorResponse(
      error.message || "Failed to get fiscal configuration",
      500,
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const authResult = await authMiddleware(req);
    if (!authResult.authorized) {
      return generateErrorResponse(authResult.error || "Unauthorized", 401);
    }

    const { businessId } = authResult.user!;
    const body = await req.json();

    const { country, taxRate, fiscalRegime, fiscalId } = body;

    if (!country || taxRate === undefined || !fiscalRegime || !fiscalId) {
      return generateErrorResponse(
        "country, taxRate, fiscalRegime, and fiscalId are required",
        400,
      );
    }

    // Normalize fiscalRegime to valid enum values
    const regimeMap: Record<string, string> = {
      general: "RESPONSABLE_INSCRIPTO",
      simplificado: "EXENTO",
      monotributo: "MONOTRIBUTO",
      RESPONSABLE_INSCRIPTO: "RESPONSABLE_INSCRIPTO",
      MONOTRIBUTO: "MONOTRIBUTO",
      EXENTO: "EXENTO",
      NO_CATEGORIZADO: "NO_CATEGORIZADO",
    };
    const normalizedRegime = regimeMap[fiscalRegime] || "RESPONSABLE_INSCRIPTO";

    await dbConnect();

    // Update or create configuration
    const config = await FiscalConfiguration.findOneAndUpdate(
      { business: businessId },
      {
        business: businessId,
        country,
        taxRate: parseFloat(taxRate),
        fiscalRegime: normalizedRegime,
        fiscalId,
        updatedAt: new Date(),
      },
      { upsert: true, new: true, runValidators: true },
    );

    return generateSuccessResponse({
      message: "Configuration saved successfully",
      country: config.country,
      taxRate: config.taxRate,
      fiscalRegime: config.fiscalRegime,
      fiscalId: config.fiscalId,
    });
  } catch (error: any) {
    console.error("[FISCAL CONFIG]", error);
    return generateErrorResponse(
      error.message || "Failed to save fiscal configuration",
      500,
    );
  }
}

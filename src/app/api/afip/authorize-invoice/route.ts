import { NextRequest } from "next/server";
import dbConnect from "@/lib/db/connect";
import Invoice from "@/lib/models/Invoice";
import FiscalConfiguration from "@/lib/models/FiscalConfiguration";
import { authMiddleware } from "@/lib/middleware/auth";
import {
  generateErrorResponse,
  generateSuccessResponse,
} from "@/lib/utils/helpers";
import { AFIPService } from "@/lib/services/afipService";
import { AFIP_CONFIG, DOCUMENT_TYPES, VAT_RATES } from "@/lib/afip";
import WSFEv1Service, {
  CAEErrorResponse,
  CAERequestPayload,
  CAEResponse,
} from "@/lib/services/wsfev1";

export const dynamic = "force-dynamic";

/**
 * Map IVA type string to AFIP CondicionIvaReceptor code (RG 5616).
 */
function mapIvaCondicion(
  ivaType?: string,
  invoiceTypeCode?: number,
  cleanCuit?: string,
): number {
  // Factura B: always Consumidor Final (5) — safest for AFIP
  if (invoiceTypeCode === 6) {
    return 5;
  }
  // Factura A: must be Responsable Inscripto (1)
  if (invoiceTypeCode === 1) {
    return 1;
  }
  // Fallback based on ivaType
  switch (ivaType?.toUpperCase()) {
    case "RESPONSABLE_INSCRIPTO":
      return 1;
    case "EXENTO":
      return 4;
    case "CONSUMIDOR_FINAL":
      return 5;
    case "MONOTRIBUTISTA":
      return 6;
    case "NO_CATEGORIZADO":
    default:
      return 5;
  }
}

/**
 * Resolve WSFEv1 service config from FiscalConfiguration (DB-stored cert paths)
 * or fall back to env vars.
 */
async function resolveServiceConfig(businessId: string) {
  const fiscal = await FiscalConfiguration.findOne({ business: businessId });

  const environment: "production" | "testing" =
    AFIP_CONFIG.environment === "production" ? "production" : "testing";

  const certPath = fiscal?.certificateDigital?.storagePath || null;
  const keyPath = fiscal?.privateKey?.storagePath || null;
  const cuit = fiscal?.cuit || null;
  const cuitSource = fiscal?.cuit
    ? "fiscal"
    : AFIP_CONFIG.cuit
      ? "env"
      : "none";
  const pointOfSale = fiscal?.pointOfSale || 1;

  return {
    wsaaUrl: AFIP_CONFIG.wsaaUrl[environment],
    wsfev1Url: AFIP_CONFIG.invoicingServiceUrl[environment],
    cuit,
    cuitSource,
    certificatePath: certPath,
    keyPath,
    environment,
    pointOfSale,
    fiscal,
  };
}

/**
 * Get a valid WSAA token — reuse cached if not expired, otherwise request new.
 */
async function getOrRefreshToken(
  service: WSFEv1Service,
  fiscal: any,
): Promise<{ token: string; sign: string }> {
  // Check cached token
  if (fiscal?.wsaaToken?.token && fiscal?.wsaaToken?.expiryTime) {
    const expiry = new Date(fiscal.wsaaToken.expiryTime);
    // Refresh 10 min before actual expiry as safety margin
    if (expiry.getTime() - Date.now() > 10 * 60 * 1000) {
      return { token: fiscal.wsaaToken.token, sign: fiscal.wsaaToken.sign };
    }
  }

  // Request fresh token
  const wsaaResult = await service.getWsaaToken();

  // Persist to DB
  if (fiscal) {
    fiscal.wsaaToken = {
      token: wsaaResult.token,
      sign: wsaaResult.sign,
      expiryTime: wsaaResult.expiryTime,
    };
    await fiscal.save();
  }

  return { token: wsaaResult.token, sign: wsaaResult.sign };
}

/**
 * POST /api/afip/authorize-invoice
 * Authorize an invoice with AFIP (get CAE) via real WSFEv1 service
 */
export async function POST(req: NextRequest) {
  try {
    const authResult = await authMiddleware(req);
    if (!authResult.authorized) {
      return generateErrorResponse(authResult.error || "Unauthorized", 401);
    }

    const { businessId } = authResult.user!;
    const body = await req.json();
    const {
      invoiceNumber,
      invoiceType,
      clientCUIT,
      clientName,
      items,
      total,
      subtotal,
      taxAmount,
      pointOfSale: reqPtv,
      invoiceSequence,
      conceptType,
      clientIvaType,
    } = body;

    if (!invoiceNumber || !invoiceType || !total || !items) {
      return generateErrorResponse("Missing required fields", 400);
    }

    await dbConnect();

    // Validate CUIT if provided
    if (clientCUIT && !AFIPService.validateCUIT(clientCUIT)) {
      return generateErrorResponse("Invalid client CUIT", 400);
    }

    // Resolve config from DB + env
    const config = await resolveServiceConfig(businessId);

    // Require per-business CUIT and uploaded cert/key. Do not silently use env CUIT.
    if (config.cuitSource === "env") {
      return generateErrorResponse(
        "AFIP CUIT is set globally in server env. Please set the business CUIT in fiscal configuration to proceed.",
        400,
      );
    }

    if (!config.cuit || !config.certificatePath || !config.keyPath) {
      return generateErrorResponse(
        "AFIP configuration incomplete. Upload certificate and key, and configure CUIT.",
        400,
      );
    }

    const service = new WSFEv1Service({
      wsaaUrl: config.wsaaUrl,
      wsfev1Url: config.wsfev1Url,
      cuit: config.cuit,
      certificatePath: config.certificatePath,
      keyPath: config.keyPath,
      environment: config.environment,
    });

    // Get or refresh WSAA token
    const { token, sign } = await getOrRefreshToken(service, config.fiscal);

    // Map invoiceType letter to AFIP code
    const invoiceTypeCode =
      typeof invoiceType === "number"
        ? invoiceType
        : invoiceType === "A"
          ? 1
          : invoiceType === "B"
            ? 6
            : invoiceType === "C"
              ? 11
              : 6;

    // Build CAE payload
    const cleanCuit = (clientCUIT || "").replace(/\D/g, "");
    const taxableAmt = Number(subtotal || total);
    const taxAmt = Number(taxAmount || 0);

    const payload: CAERequestPayload = {
      pointOfSale: reqPtv || config.pointOfSale,
      invoiceType: invoiceTypeCode,
      invoiceSequence: invoiceSequence || parseInt(invoiceNumber, 10),
      customerDocumentType: cleanCuit
        ? DOCUMENT_TYPES.cuit.id
        : DOCUMENT_TYPES.dni.id,
      customerDocumentNumber: cleanCuit || "0",
      customerName: clientName || "Consumidor Final",
      invoiceDate: new Date().toISOString().slice(0, 10).replace(/-/g, ""),
      taxableAmount: taxableAmt,
      taxAmount: taxAmt,
      totalAmount: Number(total),
      taxAliquots: [
        {
          id: VAT_RATES.standard.id,
          baseAmount: taxableAmt,
          taxAmount: taxAmt,
        },
      ],
      conceptType: conceptType || 1,
      condicionIvaReceptor: mapIvaCondicion(
        clientIvaType,
        invoiceTypeCode,
        cleanCuit,
      ),
    };

    // Request CAE
    const caeResult = await service.requestCAE(token, sign, payload);

    // Check for error
    const isError = (
      r: CAEResponse | CAEErrorResponse,
    ): r is CAEErrorResponse => (r as CAEErrorResponse).errorCode !== undefined;

    if (isError(caeResult)) {
      return generateErrorResponse(
        `AFIP rejected: ${caeResult.errorMessage}`,
        422,
      );
    }

    // Save invoice record
    const invoice = new Invoice({
      businessId,
      invoiceNumber,
      invoiceType,
      clientCUIT,
      clientName,
      items,
      total,
      cae: caeResult.cae,
      caeExpiryDate: caeResult.caeVto,
      status: "authorized",
      afipAuthorized: true,
    });

    await invoice.save();

    return generateSuccessResponse({
      invoiceNumber,
      cae: caeResult.cae,
      caeExpiryDate: caeResult.caeVto,
      authorized: true,
      message: "Invoice authorized successfully with AFIP",
    });
  } catch (error) {
    console.error("AFIP authorization error:", error);
    return generateErrorResponse("Failed to authorize invoice with AFIP", 500);
  }
}

import dbConnect from "@/lib/db/connect";
import Invoice, { InvoiceChannel, InvoiceStatus } from "@/lib/models/Invoice";
import InvoiceAudit from "@/lib/models/InvoiceAudit";
import FiscalConfiguration from "@/lib/models/FiscalConfiguration";
import { AFIP_CONFIG, DOCUMENT_TYPES, VAT_RATES } from "@/lib/afip";
import WSFEv1Service, {
  CAEErrorResponse,
  CAEResponse,
  CAERequestPayload,
} from "@/lib/services/wsfev1";

const DEFAULT_BATCH_SIZE = 25;
const MAX_BATCH_SIZE = 200;

const normalizeNumber = (value?: string) =>
  value ? value.replace(/\D/g, "") : "";

const toAfipDate = (value: Date) => {
  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, "0");
  const day = String(value.getDate()).padStart(2, "0");
  return `${year}${month}${day}`;
};

const isCaeError = (
  response: CAEResponse | CAEErrorResponse,
): response is CAEErrorResponse => {
  return (response as CAEErrorResponse).errorCode !== undefined;
};

const getMockArcaStatus = () => {
  const status = process.env.ARCA_MOCK_STATUS?.toUpperCase();
  if (
    status === "APPROVED" ||
    status === "PENDING_CAE" ||
    status === "REJECTED"
  ) {
    return status;
  }
  return null;
};

const isMockArcaEnabled = () => {
  return process.env.ARCA_MOCK_ENABLED === "true";
};

const generateMockCae = () => {
  return `${Date.now()}`.slice(-13).padStart(13, "0");
};

/**
 * Map IVA type string (from POS UI) to AFIP CondicionIvaReceptor code (RG 5616).
 * See FEParamGetCondicionIvaReceptor for full list.
 * For Factura B (tipo 6), only certain conditions are valid per Cmp_Clase.
 */
const mapIvaTypeToCondicion = (
  ivaType?: string,
  invoiceType?: number,
): number => {
  // Factura B (tipo 6): always use Consumidor Final (5) — safest for AFIP
  // AFIP validates condicionIvaReceptor against comprobanteTipo strictly
  if (invoiceType === 6) {
    return 5; // Consumidor Final — always valid for Factura B
  }

  // Factura A (tipo 1): must be Responsable Inscripto (1)
  // If the invoice reached Factura A, the customer MUST be RI
  if (invoiceType === 1) {
    return 1; // IVA Responsable Inscripto — only valid for Factura A
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
    default:
      return 5;
  }
};

const buildCaePayload = (
  invoice: any,
  issuerCuit?: string,
): CAERequestPayload | null => {
  const fiscalData = invoice.fiscalData || {};
  const pointOfSale = fiscalData.pointOfSale;
  const invoiceSequence = fiscalData.invoiceSequence;

  // Determine correct comprobanteTipo from ivaType
  // Fix legacy invoices that were wrongly assigned Factura A (1) for non-RI customers
  let invoiceType =
    fiscalData.comprobanteTipo || (invoice.customerCuit ? 1 : 6);
  if (
    invoice.ivaType &&
    invoice.ivaType !== "RESPONSABLE_INSCRIPTO" &&
    invoiceType === 1
  ) {
    invoiceType = 6;
  }

  if (!pointOfSale || !invoiceSequence || !invoiceType) {
    return null;
  }

  const customerCuit = normalizeNumber(invoice.customerCuit);
  const normalizedIssuerCuit = issuerCuit ? normalizeNumber(issuerCuit) : "";

  // Self-invoice (customer CUIT = issuer CUIT) must always be Factura B
  // AFIP rejects Factura A when DocTipo=99 (self-invoice can't use own CUIT as receptor)
  if (
    customerCuit &&
    normalizedIssuerCuit &&
    customerCuit === normalizedIssuerCuit &&
    invoiceType === 1
  ) {
    invoiceType = 6;
  }
  // For Factura B (tipo 6), use DocTipo 99 (Sin identificar) / DocNro 0 for Consumidor Final
  // For Factura A (tipo 1), always require CUIT (DocTipo 80)
  // AFIP error 10069: DocNro cannot be the same as the issuer
  let customerDocumentType: number;
  let customerDocumentNumber: string;

  const isSelfInvoice =
    customerCuit &&
    normalizedIssuerCuit &&
    customerCuit === normalizedIssuerCuit;

  if (
    customerCuit &&
    customerCuit.length >= 10 &&
    !isSelfInvoice &&
    invoiceType !== 6
  ) {
    customerDocumentType = DOCUMENT_TYPES.cuit.id; // 80
    customerDocumentNumber = customerCuit;
  } else if (invoiceType === 6 || isSelfInvoice) {
    // Factura B or self-invoice: use Consumidor Final sin identificar
    customerDocumentType = 99; // Sin identificar
    customerDocumentNumber = "0";
  } else {
    customerDocumentType = DOCUMENT_TYPES.dni.id; // 96
    customerDocumentNumber = customerCuit || "0";
  }

  const discountAmount = Number(invoice.discountAmount || 0);
  const taxableAmount = Math.max(
    0,
    Number(invoice.subtotal || 0) - discountAmount,
  );
  const taxAmount = Number(invoice.taxAmount || 0);
  const totalAmount = Number(invoice.totalAmount || 0);

  return {
    pointOfSale,
    invoiceType,
    invoiceSequence,
    customerDocumentType,
    customerDocumentNumber,
    customerName: invoice.customerName || "Consumidor Final",
    invoiceDate: toAfipDate(new Date(invoice.date || Date.now())),
    taxableAmount,
    taxAmount,
    totalAmount,
    taxAliquots: [
      {
        id: VAT_RATES.standard.id,
        baseAmount: taxableAmount,
        taxAmount,
      },
    ],
    condicionIvaReceptor: mapIvaTypeToCondicion(invoice.ivaType, invoiceType),
  };
};

const getServiceConfig = async () => {
  const environment: "production" | "testing" =
    AFIP_CONFIG.environment === "production" ? "production" : "testing";

  // Try to load cert paths from FiscalConfiguration
  // Prefer configs that have a cached WSAA token, then sort by most recently updated
  const fiscal = await FiscalConfiguration.findOne({
    "certificateDigital.storagePath": { $exists: true },
    "privateKey.storagePath": { $exists: true },
  })
    .sort({ "wsaaToken.expiryTime": -1, updatedAt: -1 })
    .lean();

  return {
    wsaaUrl: AFIP_CONFIG.wsaaUrl[environment],
    wsfev1Url: AFIP_CONFIG.invoicingServiceUrl[environment],
    // Only use per-business CUIT and uploaded certificate/key. Do not fall back to env CUIT.
    cuit: (fiscal as any)?.cuit || (fiscal as any)?.fiscalId || null,
    certificatePath: (fiscal as any)?.certificateDigital?.storagePath || null,
    keyPath: (fiscal as any)?.privateKey?.storagePath || null,
    environment,
    fiscal,
  };
};

const validateServiceConfig = (
  config: Awaited<ReturnType<typeof getServiceConfig>>,
) => {
  return (
    config.wsaaUrl &&
    config.wsfev1Url &&
    config.cuit &&
    config.certificatePath &&
    config.keyPath
  );
};

/**
 * Get cached WSAA token or request fresh one.
 */
const getOrRefreshWsaaToken = async (
  service: WSFEv1Service,
  fiscal: any,
): Promise<{ token: string; sign: string }> => {
  // Check cached token in DB
  if (fiscal?.wsaaToken?.token && fiscal?.wsaaToken?.expiryTime) {
    const expiry = new Date(fiscal.wsaaToken.expiryTime);
    if (expiry.getTime() - Date.now() > 10 * 60 * 1000) {
      return { token: fiscal.wsaaToken.token, sign: fiscal.wsaaToken.sign };
    }
  }

  try {
    const wsaaResult = await service.getWsaaToken();

    // Persist to DB
    if (fiscal?._id) {
      await FiscalConfiguration.updateOne(
        { _id: fiscal._id },
        {
          wsaaToken: {
            token: wsaaResult.token,
            sign: wsaaResult.sign,
            expiryTime: wsaaResult.expiryTime,
          },
        },
      );
    }

    return { token: wsaaResult.token, sign: wsaaResult.sign };
  } catch (error: any) {
    const msg = String(error?.message || error);
    // WSAA "already authenticated" means a valid TA exists but we don't have it cached.
    // This happens when a token was obtained externally (e.g. test scripts) and wasn't cached.
    if (
      msg.includes("alreadyAuthenticated") ||
      msg.includes("ya posee un TA")
    ) {
      console.warn(
        "[ARCA RETRY] WSAA says 'already authenticated' but no cached token. Will retry next cycle.",
      );
      throw new Error("WSAA_ALREADY_AUTHENTICATED");
    }
    throw error;
  }
};

export interface ArcaRetrySummary {
  processed: number;
  authorized: number;
  rejected: number;
  skipped: number;
  errors: number;
  mock: boolean;
}

export const runArcaRetry = async (options?: {
  limit?: number;
  source?: string;
}): Promise<ArcaRetrySummary> => {
  const limitRaw = options?.limit ?? DEFAULT_BATCH_SIZE;
  const limit = Math.min(Math.max(limitRaw, 1), MAX_BATCH_SIZE);
  const source = options?.source || "scheduler";

  const mockEnabled = isMockArcaEnabled();

  await dbConnect();

  const config = await getServiceConfig();
  if (!mockEnabled && !validateServiceConfig(config)) {
    throw new Error("AFIP configuration missing");
  }

  const pendingInvoices = await Invoice.find({
    channel: { $in: [InvoiceChannel.ARCA, InvoiceChannel.WSFE] },
    arcaStatus: { $nin: ["REJECTED", "CANCELLED", "APPROVED"] },
    $or: [
      { status: InvoiceStatus.PENDING_CAE },
      { "fiscalData.caeStatus": "PENDING" },
      { arcaStatus: { $in: ["PENDING", "SENT"] } },
    ],
  })
    .sort({ updatedAt: 1 })
    .limit(limit)
    .lean();

  if (pendingInvoices.length === 0) {
    return {
      processed: 0,
      authorized: 0,
      rejected: 0,
      skipped: 0,
      errors: 0,
      mock: mockEnabled,
    };
  }

  const wsfev1 = mockEnabled ? null : new WSFEv1Service(config);
  let wsaaToken: { token: string; sign: string } | null = null;

  if (!mockEnabled) {
    try {
      wsaaToken = await getOrRefreshWsaaToken(wsfev1!, config.fiscal);
    } catch (error: any) {
      if (error?.message === "WSAA_ALREADY_AUTHENTICATED") {
        console.warn(
          "[ARCA RETRY] Skipping batch — WSAA token not available (already authenticated, will retry when token expires)",
        );
        return {
          processed: 0,
          authorized: 0,
          rejected: 0,
          skipped: pendingInvoices.length,
          errors: 0,
          mock: false,
        };
      }
      throw error;
    }
  }
  const mockStatus = getMockArcaStatus() || "PENDING_CAE";

  let authorized = 0;
  let rejected = 0;
  let skipped = 0;
  let errors = 0;

  for (const invoice of pendingInvoices) {
    try {
      const fiscalData = invoice.fiscalData || {};
      const pointOfSale = fiscalData.pointOfSale;
      let invoiceType =
        fiscalData.comprobanteTipo || (invoice.customerCuit ? 1 : 6);
      // Correct legacy misassigned Factura A for non-RI customers
      if (
        invoice.ivaType &&
        invoice.ivaType !== "RESPONSABLE_INSCRIPTO" &&
        invoiceType === 1
      ) {
        invoiceType = 6;
      }
      // Self-invoice must be Factura B
      const loopCustCuit = normalizeNumber(invoice.customerCuit);
      const loopIssuerCuit = normalizeNumber(config.cuit);
      if (
        loopCustCuit &&
        loopIssuerCuit &&
        loopCustCuit === loopIssuerCuit &&
        invoiceType === 1
      ) {
        invoiceType = 6;
      }
      const invoiceSequence = fiscalData.invoiceSequence;

      if (!pointOfSale || !invoiceType || !invoiceSequence) {
        skipped += 1;
        continue;
      }

      // Persist corrected comprobanteTipo if it was changed
      if (invoiceType !== fiscalData.comprobanteTipo) {
        await Invoice.updateOne(
          { _id: invoice._id },
          { "fiscalData.comprobanteTipo": invoiceType },
        );
      }

      if (mockEnabled) {
        if (mockStatus === "APPROVED") {
          const mockCae = generateMockCae();
          const mockCaeVto = new Date(Date.now() + 15 * 24 * 60 * 60 * 1000)
            .toISOString()
            .slice(0, 10)
            .replace(/-/g, "");

          await Invoice.updateOne(
            { _id: invoice._id },
            {
              status: InvoiceStatus.AUTHORIZED,
              arcaStatus: "APPROVED",
              arcaLastError: null,
              "fiscalData.cae": mockCae,
              "fiscalData.caeNro": mockCae,
              "fiscalData.caeVto": mockCaeVto,
              "fiscalData.caeStatus": "AUTHORIZED",
              "fiscalData.afipResponseTimestamp": new Date(),
            },
          );

          await InvoiceAudit.create({
            business: invoice.business,
            invoice: invoice._id,
            action: "CAE_RECEIVED",
            actionDescription: "Mock CAE approved during retry job",
            afipResponse: {
              success: true,
              cae: mockCae,
              caeVto: mockCaeVto,
            },
            metadata: { source, mock: true },
          });

          authorized += 1;
        } else if (mockStatus === "REJECTED") {
          await Invoice.updateOne(
            { _id: invoice._id },
            {
              arcaStatus: "REJECTED",
              "fiscalData.caeStatus": "REJECTED",
              "fiscalData.afipResponseTimestamp": new Date(),
            },
          );

          await InvoiceAudit.create({
            business: invoice.business,
            invoice: invoice._id,
            action: "CAE_RECEIVED",
            actionDescription: "Mock CAE rejected during retry job",
            afipResponse: {
              success: false,
              errorCode: "MOCK_REJECTED",
              errorMessage: "Mock rejection",
            },
            metadata: { source, mock: true },
          });

          rejected += 1;
        } else {
          await Invoice.updateOne(
            { _id: invoice._id },
            {
              status: InvoiceStatus.PENDING_CAE,
              arcaStatus: "PENDING",
              "fiscalData.caeStatus": "PENDING",
              "fiscalData.afipResponseTimestamp": new Date(),
            },
          );

          skipped += 1;
        }

        continue;
      }

      const existingCae = await wsfev1!.queryCaeStatus(
        wsaaToken!.token,
        wsaaToken!.sign,
        pointOfSale,
        invoiceType,
        invoiceSequence,
      );

      if (existingCae?.cae) {
        await Invoice.updateOne(
          { _id: invoice._id },
          {
            status: InvoiceStatus.AUTHORIZED,
            arcaStatus: "APPROVED",
            arcaLastError: null,
            "fiscalData.cae": existingCae.cae,
            "fiscalData.caeNro": existingCae.cae,
            "fiscalData.caeVto": existingCae.caeVto,
            "fiscalData.caeStatus": "AUTHORIZED",
            "fiscalData.afipResponseTimestamp": new Date(),
          },
        );

        await InvoiceAudit.create({
          business: invoice.business,
          invoice: invoice._id,
          action: "CAE_RECEIVED",
          actionDescription: "CAE received during retry job",
          afipResponse: {
            success: true,
            cae: existingCae.cae,
            caeVto: existingCae.caeVto,
          },
          metadata: { source, mock: false },
        });

        authorized += 1;
        continue;
      }

      const payload = buildCaePayload(invoice, config.cuit);
      if (!payload) {
        skipped += 1;
        continue;
      }

      // Query AFIP for the last authorized invoice number to determine correct sequence
      try {
        const lastAuthorized = await wsfev1!.getLastAuthorizedNumber(
          wsaaToken!.token,
          wsaaToken!.sign,
          payload.pointOfSale,
          payload.invoiceType,
        );
        const correctSequence = lastAuthorized + 1;
        if (correctSequence !== payload.invoiceSequence) {
          payload.invoiceSequence = correctSequence;
          // Also update in DB so it's tracked
          await Invoice.updateOne(
            { _id: invoice._id },
            { "fiscalData.invoiceSequence": correctSequence },
          );
        }
      } catch (seqError) {
        console.warn(
          "[ARCA RETRY] Could not query last authorized number, using stored sequence:",
          seqError,
        );
      }

      await InvoiceAudit.create({
        business: invoice.business,
        invoice: invoice._id,
        action: "CAE_REQUEST",
        actionDescription: "CAE retry request issued",
        requestId: fiscalData.requestId,
        metadata: {
          source,
          mock: false,
          pointOfSale: payload.pointOfSale,
          invoiceType: payload.invoiceType,
          invoiceSequence: payload.invoiceSequence,
        },
      });

      const response = await wsfev1!.requestCAE(
        wsaaToken!.token,
        wsaaToken!.sign,
        payload,
      );

      if (isCaeError(response)) {
        await Invoice.updateOne(
          { _id: invoice._id },
          {
            arcaStatus: "REJECTED",
            "fiscalData.caeStatus": "REJECTED",
            "fiscalData.afipResponseTimestamp": new Date(),
            arcaLastError: `[${response.errorCode}] ${response.errorMessage}`,
            $inc: { arcaRetryCount: 1 },
          },
        );

        await InvoiceAudit.create({
          business: invoice.business,
          invoice: invoice._id,
          action: "CAE_RECEIVED",
          actionDescription: "CAE rejected during retry job",
          afipResponse: {
            success: false,
            errorCode: response.errorCode,
            errorMessage: response.errorMessage,
          },
          metadata: { source, mock: false },
        });

        rejected += 1;
        continue;
      }

      if (response.cae) {
        await Invoice.updateOne(
          { _id: invoice._id },
          {
            status: InvoiceStatus.AUTHORIZED,
            arcaStatus: "APPROVED",
            arcaLastError: null,
            "fiscalData.cae": response.cae,
            "fiscalData.caeNro": response.cae,
            "fiscalData.caeVto": response.caeVto,
            "fiscalData.caeStatus": "AUTHORIZED",
            "fiscalData.afipResponseTimestamp": new Date(),
          },
        );

        await InvoiceAudit.create({
          business: invoice.business,
          invoice: invoice._id,
          action: "CAE_RECEIVED",
          actionDescription: "CAE received during retry job",
          afipResponse: {
            success: true,
            cae: response.cae,
            caeVto: response.caeVto,
          },
          metadata: { source, mock: false },
        });

        authorized += 1;
      } else {
        skipped += 1;
      }
    } catch (error) {
      errors += 1;
      console.error("[ARCA RETRY] Failed invoice retry:", error);
    }
  }

  return {
    processed: pendingInvoices.length,
    authorized,
    rejected,
    skipped,
    errors,
    mock: mockEnabled,
  };
};

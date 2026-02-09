import dbConnect from "@/lib/db/connect";
import Invoice, { InvoiceChannel, InvoiceStatus } from "@/lib/models/Invoice";
import InvoiceAudit from "@/lib/models/InvoiceAudit";
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
  return (
    process.env.ARCA_MOCK_ENABLED === "true" || Boolean(getMockArcaStatus())
  );
};

const generateMockCae = () => {
  return `${Date.now()}`.slice(-13).padStart(13, "0");
};

const buildCaePayload = (invoice: any): CAERequestPayload | null => {
  const fiscalData = invoice.fiscalData || {};
  const pointOfSale = fiscalData.pointOfSale;
  const invoiceSequence = fiscalData.invoiceSequence;
  const invoiceType =
    fiscalData.comprobanteTipo || (invoice.customerCuit ? 1 : 6);

  if (!pointOfSale || !invoiceSequence || !invoiceType) {
    return null;
  }

  const customerCuit = normalizeNumber(invoice.customerCuit);
  const customerDocumentType = customerCuit
    ? DOCUMENT_TYPES.cuit.id
    : DOCUMENT_TYPES.dni.id;
  const customerDocumentNumber = customerCuit || "0";

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
  };
};

const getServiceConfig = () => {
  const environment: "production" | "testing" =
    AFIP_CONFIG.environment === "production" ? "production" : "testing";
  return {
    wsaaUrl: AFIP_CONFIG.wsaaUrl[environment],
    wsfev1Url: AFIP_CONFIG.invoicingServiceUrl[environment],
    cuit: AFIP_CONFIG.cuit,
    certificatePath: AFIP_CONFIG.certificatePath,
    keyPath: AFIP_CONFIG.keyPath,
    environment,
  };
};

const validateServiceConfig = (config: ReturnType<typeof getServiceConfig>) => {
  return (
    config.wsaaUrl &&
    config.wsfev1Url &&
    config.cuit &&
    config.certificatePath &&
    config.keyPath
  );
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

  const config = getServiceConfig();
  const mockEnabled = isMockArcaEnabled();
  if (!mockEnabled && !validateServiceConfig(config)) {
    throw new Error("AFIP configuration missing");
  }

  await dbConnect();

  const pendingInvoices = await Invoice.find({
    channel: { $in: [InvoiceChannel.ARCA, InvoiceChannel.WSFE] },
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
  const wsaaToken = mockEnabled ? null : await wsfev1!.getWsaaToken();
  const mockStatus = getMockArcaStatus() || "PENDING_CAE";

  let authorized = 0;
  let rejected = 0;
  let skipped = 0;
  let errors = 0;

  for (const invoice of pendingInvoices) {
    try {
      const fiscalData = invoice.fiscalData || {};
      const pointOfSale = fiscalData.pointOfSale;
      const invoiceType =
        fiscalData.comprobanteTipo || (invoice.customerCuit ? 1 : 6);
      const invoiceSequence = fiscalData.invoiceSequence;

      if (!pointOfSale || !invoiceType || !invoiceSequence) {
        skipped += 1;
        continue;
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

      const payload = buildCaePayload(invoice);
      if (!payload) {
        skipped += 1;
        continue;
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

import { NextResponse } from "next/server";
import mongoose from "mongoose";
import dbConnect from "@/lib/db/connect";
import Invoice, { InvoiceStatus } from "@/lib/models/Invoice";
import InvoiceAudit from "@/lib/models/InvoiceAudit";
import FiscalConfiguration from "@/lib/models/FiscalConfiguration";
import { verifyToken } from "@/lib/utils/jwt";
import { AFIP_CONFIG, DOCUMENT_TYPES, VAT_RATES } from "@/lib/afip";
import WSFEv1Service, {
  CAEErrorResponse,
  CAERequestPayload,
  CAEResponse,
} from "@/lib/services/wsfev1";

export const dynamic = "force-dynamic";

const normalizeNumber = (value?: string) =>
  value ? value.replace(/\D/g, "") : "";

const toAfipDate = (d: Date) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}${m}${day}`;
};

const mapIvaCondicion = (ivaType?: string, invoiceType?: number): number => {
  // Factura B (tipo 6): always Consumidor Final — safest for AFIP
  if (invoiceType === 6) {
    return 5;
  }
  // Factura A (tipo 1): must be Responsable Inscripto
  if (invoiceType === 1) {
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
    default:
      return 5;
  }
};

const isCaeError = (r: CAEResponse | CAEErrorResponse): r is CAEErrorResponse =>
  (r as CAEErrorResponse).errorCode !== undefined;

/**
 * POST /api/invoices/[id]/retry
 * Manually retry CAE request for a single PENDING_CAE invoice.
 */
export async function POST(
  request: Request,
  { params }: { params: { id: string } },
) {
  try {
    const token = request.headers.get("authorization")?.split(" ")[1];
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    await dbConnect();

    if (!mongoose.Types.ObjectId.isValid(params.id)) {
      return NextResponse.json(
        { errorCode: "INVALID_ID", error: "Invalid invoice ID format" },
        { status: 400 },
      );
    }

    const invoice = await Invoice.findOne({
      _id: params.id,
      business: decoded.businessId,
    });

    if (!invoice) {
      return NextResponse.json(
        { errorCode: "INVOICE_NOT_FOUND", error: "Invoice not found" },
        { status: 404 },
      );
    }

    if (invoice.channel !== "ARCA" && invoice.channel !== "WSFE") {
      return NextResponse.json(
        { errorCode: "NOT_ARCA", error: "Not an ARCA invoice" },
        { status: 400 },
      );
    }

    if (invoice.status === "AUTHORIZED" && invoice.fiscalData?.cae) {
      return NextResponse.json({
        messageCode: "ALREADY_AUTHORIZED",
        message: "Already authorized",
        cae: invoice.fiscalData.cae,
        caeVto: invoice.fiscalData.caeVto,
      });
    }

    if (invoice.status === InvoiceStatus.CANCELLED) {
      return NextResponse.json(
        {
          errorCode: "CANCELLED_CANNOT_RETRY",
          error: "Cannot retry a cancelled invoice. Create a new sale instead.",
        },
        { status: 400 },
      );
    }

    // Load fiscal config
    const fiscal = (await FiscalConfiguration.findOne({
      business: decoded.businessId,
    }).lean()) as any;

    if (!fiscal) {
      return NextResponse.json(
        {
          errorCode: "NO_FISCAL_CONFIG",
          error: "Fiscal configuration not found",
        },
        { status: 400 },
      );
    }

    // Require per-business uploaded certificate/key and business CUIT
    const certPath = fiscal.certificateDigital?.storagePath || null;
    const keyPath = fiscal.privateKey?.storagePath || null;
    const cuit = fiscal.cuit || null;

    if (!certPath || !keyPath || !cuit) {
      return NextResponse.json(
        {
          errorCode: "INCOMPLETE_FISCAL_CONFIG",
          error:
            "Incomplete fiscal configuration (cert/key/cuit). Please upload certificate and key and set the business CUIT.",
        },
        { status: 400 },
      );
    }

    const environment: "production" | "testing" =
      AFIP_CONFIG.environment === "production" ? "production" : "testing";

    const service = new WSFEv1Service({
      wsaaUrl: AFIP_CONFIG.wsaaUrl[environment],
      wsfev1Url: AFIP_CONFIG.invoicingServiceUrl[environment],
      cuit,
      certificatePath: certPath,
      keyPath,
      environment,
    });

    // Get or refresh WSAA token
    let wsaaToken: string;
    let wsaaSign: string;

    if (
      fiscal.wsaaToken?.token &&
      fiscal.wsaaToken?.expiryTime &&
      new Date(fiscal.wsaaToken.expiryTime).getTime() - Date.now() >
        10 * 60 * 1000
    ) {
      wsaaToken = fiscal.wsaaToken.token;
      wsaaSign = fiscal.wsaaToken.sign;
    } else {
      const wsaa = await service.getWsaaToken();
      wsaaToken = wsaa.token;
      wsaaSign = wsaa.sign;

      await FiscalConfiguration.updateOne(
        { _id: fiscal._id },
        {
          "wsaaToken.token": wsaa.token,
          "wsaaToken.sign": wsaa.sign,
          "wsaaToken.expiryTime": wsaa.expiryTime,
        },
      );
    }

    // Build payload
    const fiscalData = invoice.fiscalData || {};
    const pointOfSale = fiscalData.pointOfSale || fiscal.pointOfSale || 1;

    // Determine correct comprobanteTipo from ivaType
    // Fix legacy invoices wrongly assigned Factura A for non-RI customers
    let invoiceType =
      fiscalData.comprobanteTipo || (invoice.customerCuit ? 1 : 6);
    if (
      invoice.ivaType &&
      invoice.ivaType !== "RESPONSABLE_INSCRIPTO" &&
      invoiceType === 1
    ) {
      invoiceType = 6;
    }

    const customerCuit = normalizeNumber(invoice.customerCuit);
    const issuerCuit = normalizeNumber(cuit);
    const isSelfInvoice =
      customerCuit && issuerCuit && customerCuit === issuerCuit;

    // Self-invoice (customer CUIT = issuer CUIT) must always be Factura B
    // AFIP rejects Factura A when DocTipo=99 (self-invoice can't use own CUIT as receptor)
    if (isSelfInvoice && invoiceType === 1) {
      invoiceType = 6;
    }

    // Persist corrected comprobanteTipo if it was changed
    if (invoiceType !== fiscalData.comprobanteTipo) {
      await Invoice.updateOne(
        { _id: invoice._id },
        { "fiscalData.comprobanteTipo": invoiceType },
      );
    }

    // Get next sequence from AFIP
    const lastAuthorized = await service.getLastAuthorizedNumber(
      wsaaToken,
      wsaaSign,
      pointOfSale,
      invoiceType,
    );
    const invoiceSequence = lastAuthorized + 1;

    let customerDocumentType: number;
    let customerDocumentNumber: string;

    if (
      customerCuit &&
      customerCuit.length >= 10 &&
      !isSelfInvoice &&
      invoiceType !== 6
    ) {
      customerDocumentType = DOCUMENT_TYPES.cuit.id;
      customerDocumentNumber = customerCuit;
    } else if (invoiceType === 6 || isSelfInvoice) {
      customerDocumentType = 99;
      customerDocumentNumber = "0";
    } else {
      customerDocumentType = DOCUMENT_TYPES.dni.id;
      customerDocumentNumber = customerCuit || "0";
    }

    const discountAmount = Number(invoice.discountAmount || 0);
    const taxableAmount = Math.max(
      0,
      Number(invoice.subtotal || 0) - discountAmount,
    );
    const taxAmount = Number(invoice.taxAmount || 0);
    const totalAmount = Number(invoice.totalAmount || 0);

    const payload: CAERequestPayload = {
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
      condicionIvaReceptor: mapIvaCondicion(invoice.ivaType, invoiceType),
    };

    // Request CAE
    const result = await service.requestCAE(wsaaToken, wsaaSign, payload);

    if (isCaeError(result)) {
      await Invoice.updateOne(
        { _id: invoice._id },
        {
          arcaStatus: "REJECTED",
          arcaLastError: `[${result.errorCode}] ${result.errorMessage}`,
          "fiscalData.caeStatus": "REJECTED",
          "fiscalData.invoiceSequence": invoiceSequence,
          "fiscalData.afipResponseTimestamp": new Date(),
          $inc: { arcaRetryCount: 1 },
        },
      );

      await InvoiceAudit.create({
        business: decoded.businessId,
        invoice: invoice._id,
        action: "CAE_RECEIVED",
        actionDescription: "Manual retry — CAE rejected",
        afipResponse: {
          success: false,
          errorCode: result.errorCode,
          errorMessage: result.errorMessage,
        },
        metadata: { source: "manual" },
      });

      return NextResponse.json(
        {
          errorCode: "AFIP_REJECTED",
          error: result.errorMessage,
          afipErrorCode: result.errorCode,
        },
        { status: 422 },
      );
    }

    // Success — update invoice
    await Invoice.updateOne(
      { _id: invoice._id },
      {
        status: InvoiceStatus.AUTHORIZED,
        arcaStatus: "APPROVED",
        arcaLastError: null,
        "fiscalData.cae": result.cae,
        "fiscalData.caeNro": result.cae,
        "fiscalData.caeVto": result.caeVto,
        "fiscalData.caeStatus": "AUTHORIZED",
        "fiscalData.invoiceSequence": invoiceSequence,
        "fiscalData.afipResponseTimestamp": new Date(),
      },
    );

    await InvoiceAudit.create({
      business: decoded.businessId,
      invoice: invoice._id,
      action: "CAE_RECEIVED",
      actionDescription: "Manual retry — CAE approved",
      afipResponse: {
        success: true,
        cae: result.cae,
        caeVto: result.caeVto,
      },
      metadata: { source: "manual" },
    });

    return NextResponse.json({
      messageCode: "CAE_SUCCESS",
      message: "CAE obtained successfully",
      cae: result.cae,
      caeVto: result.caeVto,
      invoiceSequence,
    });
  } catch (error) {
    console.error("Invoice retry error:", error);
    return NextResponse.json(
      { errorCode: "RETRY_FAILED", error: "Failed to retry invoice" },
      { status: 500 },
    );
  }
}

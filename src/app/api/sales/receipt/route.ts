import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db/connect";
import Sale from "@/lib/models/Sale";
import Invoice, { InvoiceStatus } from "@/lib/models/Invoice";
import Business from "@/lib/models/Business";
import InvoiceAudit from "@/lib/models/InvoiceAudit";
import { verifyToken } from "@/lib/utils/jwt";
import "@/lib/server/arcaRetryScheduler";

export const dynamic = "force-dynamic";

// Default ticket messages by language
const DEFAULT_TICKET_MESSAGES: Record<string, string> = {
  es: "¡GRACIAS POR SU COMPRA!\nVuelva pronto",
  en: "THANK YOU FOR YOUR PURCHASE!\nCome back soon",
  pt: "OBRIGADO PELA SUA COMPRA!\nVolte em breve",
};

// Receipt label translations
const RECEIPT_LABELS: Record<string, Record<string, string>> = {
  es: {
    invoicePrefix: "FACTURA",
    budget: "PRESUPUESTO",
    saleReceipt: "COMPROBANTE DE VENTA",
    docType: "Tipo de documento:",
    numbering: "Numeración:",
    caeLabel: "CAE:",
    caeExpiry: "Vencimiento CAE:",
    fiscalQr: "QR Fiscal:",
    fiscalValidity: "Validez fiscal:",
    usage: "Uso:",
    edition: "Edición:",
    client: "Cliente:",
    cuit: "CUIT:",
    subtotal: "Subtotal:",
    discount: "Descuento:",
    tax21: "Impuesto (21%):",
    total: "TOTAL:",
    payment: "Pago:",
    paymentPending: "PAGO PENDIENTE",
    provisional: "COMPROBANTE PROVISIONAL - SIN VALOR FISCAL",
    vtoCae: "Vto CAE:",
    yes: "Sí",
    no: "No",
    validBeforeArca: "Válido ante ARCA",
    notValid: "No válido",
    finalLegalDoc: "Documento legal definitivo",
    contingencyBackup: "Contingencia / Respaldo",
    editableOnlyForCN: "Editable solo para notas de crédito",
    notEditable: "No editable",
    desc: "Desc:",
    cash: "Efectivo",
    card: "Tarjeta",
    transfer: "Transferencia",
    check: "Cheque",
    bankTransfer: "Transferencia bancaria",
    online: "Online",
    qr: "QR",
    mercadopago: "Mercado Pago",
    multiple: "Múltiple",
    account: "Cuenta corriente",
    creditNote: "Nota de Crédito",
    none: "Ninguno",
    numberPrefix: "Nº",
  },
  en: {
    invoicePrefix: "INVOICE",
    budget: "BUDGET",
    saleReceipt: "SALE RECEIPT",
    docType: "Document type:",
    numbering: "Number:",
    caeLabel: "CAE:",
    caeExpiry: "CAE Expiry:",
    fiscalQr: "Fiscal QR:",
    fiscalValidity: "Fiscal validity:",
    usage: "Usage:",
    edition: "Edition:",
    client: "Client:",
    cuit: "CUIT:",
    subtotal: "Subtotal:",
    discount: "Discount:",
    tax21: "Tax (21%):",
    total: "TOTAL:",
    payment: "Payment:",
    paymentPending: "PAYMENT PENDING",
    provisional: "PROVISIONAL RECEIPT - NO FISCAL VALUE",
    vtoCae: "CAE Exp:",
    yes: "Yes",
    no: "No",
    validBeforeArca: "Valid before ARCA",
    notValid: "Not valid",
    finalLegalDoc: "Final legal document",
    contingencyBackup: "Contingency / Backup",
    editableOnlyForCN: "Editable only for credit notes",
    notEditable: "Not editable",
    desc: "Disc:",
    cash: "Cash",
    card: "Card",
    transfer: "Transfer",
    check: "Check",
    bankTransfer: "Bank Transfer",
    online: "Online",
    qr: "QR",
    mercadopago: "Mercado Pago",
    multiple: "Multiple",
    account: "Account",
    creditNote: "Credit Note",
    none: "None",
    numberPrefix: "No.",
  },
  pt: {
    invoicePrefix: "FATURA",
    budget: "ORÇAMENTO",
    saleReceipt: "COMPROVANTE DE VENDA",
    docType: "Tipo de documento:",
    numbering: "Numeração:",
    caeLabel: "CAE:",
    caeExpiry: "Vencimento CAE:",
    fiscalQr: "QR Fiscal:",
    fiscalValidity: "Validade fiscal:",
    usage: "Uso:",
    edition: "Edição:",
    client: "Cliente:",
    cuit: "CUIT:",
    subtotal: "Subtotal:",
    discount: "Desconto:",
    tax21: "Imposto (21%):",
    total: "TOTAL:",
    payment: "Pagamento:",
    paymentPending: "PAGAMENTO PENDENTE",
    provisional: "COMPROVANTE PROVISÓRIO - SEM VALOR FISCAL",
    vtoCae: "Vto CAE:",
    yes: "Sim",
    no: "Não",
    validBeforeArca: "Válido perante ARCA",
    notValid: "Não válido",
    finalLegalDoc: "Documento legal definitivo",
    contingencyBackup: "Contingência / Backup",
    editableOnlyForCN: "Editável apenas para notas de crédito",
    notEditable: "Não editável",
    desc: "Desc:",
    cash: "Dinheiro",
    card: "Cartão",
    transfer: "Transferência",
    check: "Cheque",
    bankTransfer: "Transferência bancária",
    online: "Online",
    qr: "QR",
    mercadopago: "Mercado Pago",
    multiple: "Múltiplo",
    account: "Conta corrente",
    creditNote: "Nota de Crédito",
    none: "Nenhum",
    numberPrefix: "Nº",
  },
};

const getLabel = (lang: string, key: string): string =>
  RECEIPT_LABELS[lang]?.[key] || RECEIPT_LABELS.en[key] || key;

/**
 * GET - Generate receipt/invoice for sale
 * Returns printable receipt data or PDF
 */
export async function GET(req: NextRequest) {
  try {
    const token = req.headers.get("authorization")?.split(" ")[1];
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const saleId = searchParams.get("saleId");
    const format = searchParams.get("format") || "json"; // json or pdf
    const lang = searchParams.get("lang") || "en"; // Get language preference

    if (!saleId) {
      return NextResponse.json(
        { error: "Sale ID is required" },
        { status: 400 },
      );
    }

    await dbConnect();

    const sale = await Sale.findOne({
      _id: saleId,
      businessId: decoded.businessId,
    })
      .populate("invoice")
      .lean();

    if (!sale) {
      return NextResponse.json({ error: "Sale not found" }, { status: 404 });
    }

    // Fetch business config to get custom ticket message
    const businessConfig = await Business.findOne({
      _id: decoded.businessId,
    }).lean<import("@/lib/models/Business").IBusiness>();

    const invoice = (sale as any).invoice;

    const isFiscalInvoice =
      invoice?.channel === "ARCA" || invoice?.channel === "WSFE";
    const cae = invoice?.fiscalData?.cae || invoice?.fiscalData?.caeNro;
    const caeVto = invoice?.fiscalData?.caeVto;
    const caeAuthorized =
      invoice?.status === InvoiceStatus.AUTHORIZED ||
      invoice?.fiscalData?.caeStatus === "AUTHORIZED" ||
      invoice?.arcaStatus === "APPROVED";
    const caePending =
      invoice?.status === InvoiceStatus.PENDING_CAE ||
      invoice?.fiscalData?.caeStatus === "PENDING" ||
      invoice?.arcaStatus === "PENDING" ||
      invoice?.arcaStatus === "SENT";
    const caeRejected =
      invoice?.arcaStatus === "REJECTED" ||
      invoice?.fiscalData?.caeStatus === "REJECTED";
    const cancelledByNc =
      invoice?.status === InvoiceStatus.CANCELLED ||
      invoice?.status === InvoiceStatus.VOIDED;

    const fiscalLetter = (() => {
      const comprobanteTipo = invoice?.fiscalData?.comprobanteTipo;
      if (comprobanteTipo === 1) return "A";
      if (comprobanteTipo === 6) return "B";
      if (comprobanteTipo === 11) return "C";
      return invoice?.customerCuit ? "A" : "B";
    })();

    const fiscalDocumentLabel = `${getLabel(lang, "invoicePrefix")} ${fiscalLetter}`;
    const provisionalDocumentLabel = getLabel(lang, "budget");
    const documentTypeLabel = isFiscalInvoice
      ? fiscalDocumentLabel
      : provisionalDocumentLabel;

    const fiscalDecision = (() => {
      if (!isFiscalInvoice) {
        return {
          action: "PRINT_INTERNAL",
          documentLabel: provisionalDocumentLabel,
          fiscalStatus: "INTERNAL",
        };
      }

      if (cancelledByNc) {
        return {
          action: "BLOCK",
          documentLabel: getLabel(lang, "creditNote"),
          fiscalStatus: "CANCELED_BY_NC",
          reason: "Sale cancelled by credit note",
        };
      }

      if (caeRejected) {
        return {
          action: "BLOCK",
          documentLabel: getLabel(lang, "none"),
          fiscalStatus: "REJECTED",
          reason: "Fiscal data rejected",
        };
      }

      if (caeAuthorized && cae) {
        return {
          action: "PRINT_FISCAL",
          documentLabel: fiscalDocumentLabel,
          fiscalStatus: "APPROVED",
        };
      }

      if (caePending) {
        return {
          action: "PRINT_PROVISIONAL",
          documentLabel: provisionalDocumentLabel,
          fiscalStatus: "PENDING_CAE",
        };
      }

      return {
        action: "BLOCK",
        documentLabel: getLabel(lang, "none"),
        fiscalStatus: "CAE_REQUIRED",
        reason: "CAE required for fiscal invoice",
      };
    })();

    const fiscalPos =
      invoice?.fiscalData?.pointOfSale ||
      businessConfig?.fiscalConfig?.pointOfSale;
    const fiscalSequence = invoice?.fiscalData?.invoiceSequence;
    const fiscalNumber =
      fiscalPos && fiscalSequence
        ? `${String(fiscalPos).padStart(4, "0")}-${String(fiscalSequence).padStart(8, "0")}`
        : null;

    const isFiscalPrint = fiscalDecision.action === "PRINT_FISCAL";
    const fiscalQrAvailable = Boolean(isFiscalPrint && cae);
    const fiscalValidityLabel = isFiscalPrint
      ? getLabel(lang, "validBeforeArca")
      : getLabel(lang, "notValid");
    const fiscalUsageLabel = isFiscalPrint
      ? getLabel(lang, "finalLegalDoc")
      : getLabel(lang, "contingencyBackup");
    const fiscalEditLabel = isFiscalPrint
      ? getLabel(lang, "editableOnlyForCN")
      : getLabel(lang, "notEditable");

    if (fiscalDecision.action === "BLOCK") {
      return NextResponse.json(
        {
          error: "Printing not allowed for this fiscal status",
          fiscalStatus: fiscalDecision.fiscalStatus,
          reason: fiscalDecision.reason,
          document: fiscalDecision.documentLabel,
        },
        { status: 409 },
      );
    }

    // Determine ticket message to use
    let ticketMessage =
      DEFAULT_TICKET_MESSAGES[lang] || DEFAULT_TICKET_MESSAGES.en;

    if (businessConfig?.ticketMessage) {
      // Check if the saved message is a default in any language
      const isDefault = Object.values(DEFAULT_TICKET_MESSAGES).includes(
        businessConfig.ticketMessage,
      );

      if (isDefault) {
        // Use current language's default
        ticketMessage =
          DEFAULT_TICKET_MESSAGES[lang] || DEFAULT_TICKET_MESSAGES.en;
      } else {
        // Use custom message
        ticketMessage = businessConfig.ticketMessage;
      }
    }

    // Safe numeric conversion for MongoDB Decimal128 values
    const toNum = (v: any): number => {
      if (v == null) return 0;
      if (typeof v === "number") return v;
      if (typeof v === "object" && v.$numberDecimal != null)
        return parseFloat(v.$numberDecimal);
      if (typeof v === "string") return parseFloat(v) || 0;
      return Number(v) || 0;
    };

    // Format receipt data
    const receiptData = {
      receiptNumber:
        invoice?.invoiceNumber ||
        `VENTA-${(sale as any)._id.toString().slice(-6)}`,
      documentNumber: isFiscalPrint ? fiscalNumber : null,
      date: new Date((sale as any).createdAt).toLocaleString(
        lang === "es" ? "es-AR" : lang === "pt" ? "pt-BR" : "en-US",
      ),
      logoUrl: businessConfig?.ticketLogo || "",
      documentType: fiscalDecision.documentLabel,
      fiscalStatus: fiscalDecision.fiscalStatus,
      cae,
      caeVto,
      fiscalQrAvailable,
      fiscalValidityLabel,
      fiscalUsageLabel,
      fiscalEditLabel,
      isProvisional: fiscalDecision.action === "PRINT_PROVISIONAL",
      items: (sale as any).items.map((item: any) => ({
        description: item.productName,
        quantity: toNum(item.quantity),
        unitPrice: toNum(item.unitPrice),
        discount: toNum(item.discount),
        total: toNum(item.total),
      })),
      subtotal: toNum((sale as any).subtotal),
      discount: toNum((sale as any).discount),
      tax: toNum((sale as any).tax),
      total: toNum((sale as any).totalWithTax) || toNum((sale as any).total),
      paymentMethod: (sale as any).paymentMethod,
      paymentStatus: (sale as any).paymentStatus,
      customerName:
        invoice?.customerName ||
        (lang === "en" ? "Customer" : lang === "pt" ? "Cliente" : "Cliente"),
      customerCuit: invoice?.customerCuit,
      notes: invoice?.notes,
      ticketMessage, // Add the ticket message
    };

    if (format === "json") {
      return NextResponse.json({ receipt: receiptData });
    } else if (format === "html") {
      try {
        const existingPrint = invoice?._id
          ? await InvoiceAudit.exists({
              invoice: invoice._id,
              action: "PRINT",
            })
          : null;

        const receiptType =
          fiscalDecision.action === "PRINT_FISCAL" ? "FISCAL" : "PROVISIONAL";

        await InvoiceAudit.create({
          business: decoded.businessId,
          invoice: invoice?._id,
          action: "PRINT",
          actionDescription: `Receipt ${existingPrint ? "reprinted" : "printed"}: ${receiptData.documentType}`,
          userId: decoded.userId,
          userEmail: decoded.email,
          metadata: {
            saleId,
            format,
            documentType: receiptData.documentType,
            fiscalStatus: receiptData.fiscalStatus,
            provisional: receiptData.isProvisional,
            printType: existingPrint ? "reprint" : "print",
            receiptType,
          },
        });
      } catch (auditError) {
        console.error("Receipt audit log error:", auditError);
      }

      // Generate HTML receipt for printing
      const html = generateHTMLReceipt(receiptData, lang);
      return new NextResponse(html, {
        headers: {
          "Content-Type": "text/html; charset=utf-8",
          "Content-Disposition": `inline; filename="comprobante-${receiptData.receiptNumber}.html"`,
        },
      });
    }

    return NextResponse.json({ receipt: receiptData });
  } catch (error) {
    console.error("Get receipt error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

/**
 * Generate HTML receipt for thermal printer or screen printing
 */
function generateHTMLReceipt(data: any, lang: string = "en"): string {
  const L = (key: string) => getLabel(lang, key);
  const currencyLocale =
    lang === "es" ? "es-AR" : lang === "pt" ? "pt-BR" : "en-US";

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat(currencyLocale, {
      style: "currency",
      currency: "ARS",
    }).format(value);

  const formatNumber = (value: number) =>
    new Intl.NumberFormat(currencyLocale, { minimumFractionDigits: 2 }).format(
      value,
    );

  return `
<!DOCTYPE html>
<html lang="${lang}">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${L("saleReceipt")} ${data.receiptNumber}</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Courier New', monospace;
            font-size: 12px;
            line-height: 1.4;
            background: #f5f5f5;
        }
        
        .receipt {
            width: 80mm;
            margin: 20px auto;
            background: white;
            padding: 15px;
            border: 1px solid #ddd;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
        
        .header {
            text-align: center;
            border-bottom: 2px dashed #333;
            padding-bottom: 10px;
            margin-bottom: 10px;
        }

        .logo {
          width: 64px;
          height: 64px;
          margin: 0 auto 8px;
          display: block;
          object-fit: contain;
          border-radius: 50%;
        }
        
        .receipt-title {
            font-weight: bold;
            font-size: 14px;
            margin-bottom: 5px;
        }
        
        .receipt-number {
            font-size: 11px;
            color: #666;
        }
        
        .receipt-date {
            font-size: 10px;
            color: #888;
            margin-top: 5px;
        }
        
        .customer-info {
            margin: 10px 0;
            border-bottom: 1px dashed #ddd;
            padding-bottom: 8px;
            font-size: 11px;
            display: grid;
            grid-template-columns: auto 1fr;
            gap: 3px 8px;
            align-items: baseline;
        }
        
        .customer-label {
            color: #666;
            white-space: nowrap;
        }
        
        .customer-value {
            text-align: right;
            font-weight: 600;
            word-break: break-word;
        }
        
        .items {
            margin: 10px 0;
            border-bottom: 1px dashed #ddd;
            padding-bottom: 10px;
        }
        
        .item-row {
            margin-bottom: 10px;
            padding-bottom: 8px;
            border-bottom: 1px dotted #eee;
            font-size: 11px;
        }
        
        .item-name {
            font-weight: bold;
            margin-bottom: 2px;
        }
        
        .item-details {
            display: flex;
            justify-content: space-between;
            color: #555;
            font-size: 10px;
            margin-top: 2px;
        }
        
        .item-total {
            font-weight: bold;
            color: #000;
        }
        
        .item-discount {
            font-size: 10px;
            color: #888;
            margin-top: 1px;
        }
        
        .totals {
            margin: 10px 0;
            font-size: 11px;
        }
        
        .total-row {
            display: flex;
            justify-content: space-between;
            margin: 5px 0;
            gap: 10px;
        }
        
        .total-row.final {
            font-weight: bold;
            font-size: 13px;
            border-top: 2px dashed #333;
            border-bottom: 2px dashed #333;
            padding: 5px 0;
            margin: 8px 0;
        }
        
        .payment-method {
            text-align: center;
            font-size: 11px;
            margin: 10px 0;
            color: #666;
        }
        
        .footer {
            text-align: center;
            font-size: 10px;
            color: #999;
            margin-top: 10px;
            border-top: 1px dashed #ddd;
            padding-top: 10px;
        }
        
        .status-pending {
            background: #fff3cd;
            color: #856404;
            padding: 5px;
            text-align: center;
            font-size: 10px;
            margin: 5px 0;
        }

        .provisional-notice {
          border: 2px solid #b00020;
          color: #b00020;
          font-weight: bold;
          text-align: center;
          padding: 6px;
          font-size: 12px;
          margin: 8px 0;
          text-transform: uppercase;
        }
        
        @media print {
            body {
                background: white;
            }
            .receipt {
                width: 80mm;
                margin: 0;
                box-shadow: none;
                border: none;
            }
        }
    </style>
</head>
<body>
    <div class="receipt">
        <div class="header">
          ${data.logoUrl ? `<img class="logo" src="${data.logoUrl}" alt="Logo" />` : ""}
            <div class="receipt-title">${
              data.documentType
                ? data.documentType.toUpperCase()
                : L("saleReceipt")
            }</div>
            <div class="receipt-number">${L("numberPrefix")} ${data.documentNumber || data.receiptNumber}</div>
            <div class="receipt-date">${data.date}</div>
        </div>

          <div class="customer-info">
            <span class="customer-label">${L("docType")}</span>
            <span class="customer-value">${data.documentType || L("saleReceipt")}</span>
            <span class="customer-label">${L("numbering")}</span>
            <span class="customer-value">${data.documentNumber || data.receiptNumber}</span>
            <span class="customer-label">${L("caeLabel")}</span>
            <span class="customer-value">${data.cae ? L("yes") : L("no")}</span>
            <span class="customer-label">${L("caeExpiry")}</span>
            <span class="customer-value">${data.caeVto || L("no")}</span>
            <span class="customer-label">${L("fiscalQr")}</span>
            <span class="customer-value">${data.fiscalQrAvailable ? L("yes") : L("no")}</span>
            <span class="customer-label">${L("fiscalValidity")}</span>
            <span class="customer-value">${data.fiscalValidityLabel}</span>
            <span class="customer-label">${L("usage")}</span>
            <span class="customer-value">${data.fiscalUsageLabel}</span>
            <span class="customer-label">${L("edition")}</span>
            <span class="customer-value">${data.fiscalEditLabel}</span>
          </div>
        
        ${
          data.customerName
            ? `<div class="customer-info">
            <span class="customer-label">${L("client")}</span>
            <span class="customer-value">${data.customerName}</span>
            ${
              data.customerCuit
                ? `<span class="customer-label">${L("cuit")}</span><span class="customer-value">${data.customerCuit}</span>`
                : ""
            }
        </div>`
            : ""
        }
        
        ${
          data.isProvisional
            ? `<div class="provisional-notice">${L("provisional")}</div>`
            : ""
        }

        ${
          data.cae
            ? `<div class="customer-info">
                <span class="customer-label">CAE:</span>
                <span class="customer-value" style="font-family: 'Courier New', monospace; font-weight: bold;">${data.cae}</span>
                ${data.caeVto ? `<span class="customer-label">${L("vtoCae")}</span><span class="customer-value">${data.caeVto}</span>` : ""}
              </div>`
            : ""
        }

        <div class="items">
            ${data.items
              .map(
                (item: any) => `
                <div class="item-row">
                    <div class="item-name">${item.description}</div>
                    <div class="item-details">
                        <span>${item.quantity} x ${formatCurrency(item.unitPrice)}</span>
                        <span class="item-total">${formatCurrency(item.total)}</span>
                    </div>
                    ${
                      item.discount > 0
                        ? `<div class="item-discount">${L("desc")} -${formatCurrency(item.discount)}</div>`
                        : ""
                    }
                </div>
            `,
              )
              .join("")}
        </div>
        
        <div class="totals">
            <div class="total-row">
                <span>${L("subtotal")}</span>
                <span>${formatCurrency(data.subtotal)}</span>
            </div>
            <div class="total-row">
              <span>${L("discount")}</span>
              <span>-${formatCurrency(data.discount)}</span>
            </div>
            ${
              data.tax > 0
                ? `<div class="total-row">
                <span>${L("tax21")}</span>
                <span>${formatCurrency(data.tax)}</span>
            </div>`
                : ""
            }
            <div class="total-row final">
                <span>${L("total")}</span>
                <span>${formatCurrency(data.total)}</span>
            </div>
        </div>
        
        <div class="payment-method">
            ${L("payment")} ${
              data.paymentMethod === "mercadopago"
                ? L("mercadopago")
                : data.paymentMethod === "cash"
                  ? L("cash")
                  : data.paymentMethod === "card"
                    ? L("card")
                    : data.paymentMethod === "transfer"
                      ? L("transfer")
                      : data.paymentMethod === "check"
                        ? L("check")
                        : data.paymentMethod === "bankTransfer"
                          ? L("bankTransfer")
                          : data.paymentMethod === "qr"
                            ? L("qr")
                            : data.paymentMethod === "online"
                              ? L("online")
                              : data.paymentMethod === "multiple"
                                ? L("multiple")
                                : data.paymentMethod === "account"
                                  ? L("account")
                                  : data.paymentMethod
            }
        </div>
        
        ${
          data.paymentStatus === "pending"
            ? `<div class="status-pending">${L("paymentPending")}</div>`
            : ""
        }
        
        ${
          data.notes
            ? `<div style="font-size: 10px; margin-top: 8px; color: #666; text-align: center; border-top: 1px dashed #ddd; padding-top: 8px;">
            ${data.notes}
        </div>`
            : ""
        }
        
        <div class="footer">
            <div style="white-space: pre-wrap;">${data.ticketMessage || (RECEIPT_LABELS[lang]?.saleReceipt ? DEFAULT_TICKET_MESSAGES[lang] : DEFAULT_TICKET_MESSAGES.en) || ""}</div>
            <div style="margin-top: 5px;">${new Date().toLocaleString(
              lang === "es" ? "es-AR" : lang === "pt" ? "pt-BR" : "en-US",
            )}</div>
        </div>
    </div>
    
    <script>
        window.onload = function() {
            window.print();
        };
    </script>
</body>
</html>
  `;
}

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
      business: decoded.businessId,
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

    const fiscalDocumentLabel = `INVOICE ${fiscalLetter}`;
    const provisionalDocumentLabel = "BUDGET";
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
          documentLabel: "Nota de Crédito",
          fiscalStatus: "CANCELED_BY_NC",
          reason: "Sale cancelled by credit note",
        };
      }

      if (caeRejected) {
        return {
          action: "BLOCK",
          documentLabel: "Ninguno",
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
        documentLabel: "Ninguno",
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
      ? "Valid before ARCA"
      : "Not valid";
    const fiscalUsageLabel = isFiscalPrint
      ? "Final legal document"
      : "Contingency / Backup";
    const fiscalEditLabel = isFiscalPrint
      ? "Editable only for credit notes"
      : "Not editable";

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

    // Format receipt data
    const receiptData = {
      receiptNumber:
        invoice?.invoiceNumber ||
        `VENTA-${(sale as any)._id.toString().slice(-6)}`,
      documentNumber: isFiscalPrint ? fiscalNumber : null,
      date: new Date((sale as any).createdAt).toLocaleString("es-AR"),
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
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        discount: item.discount || 0,
        total: item.total,
      })),
      subtotal: (sale as any).subtotal,
      discount: (sale as any).discount || 0,
      tax: (sale as any).tax || 0,
      total: (sale as any).totalWithTax || (sale as any).total,
      paymentMethod: (sale as any).paymentMethod,
      paymentStatus: (sale as any).paymentStatus,
      customerName: invoice?.customerName || "Cliente",
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
      const html = generateHTMLReceipt(receiptData);
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
function generateHTMLReceipt(data: any): string {
  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
    }).format(value);

  const formatNumber = (value: number) =>
    new Intl.NumberFormat("es-AR", { minimumFractionDigits: 2 }).format(value);

  return `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Comprobante ${data.receiptNumber}</title>
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
        }
        
        .customer-label {
            color: #666;
        }
        
        .items {
            margin: 10px 0;
            border-bottom: 1px dashed #ddd;
            padding-bottom: 10px;
        }
        
        .item-row {
            display: grid;
            grid-template-columns: 1fr auto auto;
            gap: 5px;
            margin-bottom: 8px;
            font-size: 11px;
            align-items: center;
        }
        
        .item-desc {
            grid-column: 1;
        }
        
        .item-qty {
            text-align: right;
        }
        
        .item-price {
            text-align: right;
        }
        
        .totals {
            margin: 10px 0;
            font-size: 11px;
        }
        
        .total-row {
            display: flex;
            justify-content: space-between;
            margin: 4px 0;
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
                : "COMPROBANTE DE VENTA"
            }</div>
            <div class="receipt-number">Nº ${data.documentNumber || data.receiptNumber}</div>
            <div class="receipt-date">${data.date}</div>
        </div>

          <div class="customer-info">
            <div><span class="customer-label">Tipo de documento:</span> ${data.documentType || "Comprobante"}</div>
            <div><span class="customer-label">Numeración:</span> ${data.documentNumber || data.receiptNumber}</div>
            <div><span class="customer-label">CAE:</span> ${data.cae ? "Sí" : "No"}</div>
            <div><span class="customer-label">Vencimiento CAE:</span> ${data.caeVto || "No"}</div>
            <div><span class="customer-label">QR Fiscal:</span> ${data.fiscalQrAvailable ? "Sí" : "No"}</div>
            <div><span class="customer-label">Validez fiscal:</span> ${data.fiscalValidityLabel}</div>
            <div><span class="customer-label">Uso:</span> ${data.fiscalUsageLabel}</div>
            <div><span class="customer-label">Edición:</span> ${data.fiscalEditLabel}</div>
          </div>
        
        ${
          data.customerName
            ? `<div class="customer-info">
            <div><span class="customer-label">Cliente:</span> ${
              data.customerName
            }</div>
            ${
              data.customerCuit
                ? `<div><span class="customer-label">CUIT:</span> ${data.customerCuit}</div>`
                : ""
            }
        </div>`
            : ""
        }
        
        ${
          data.isProvisional
            ? `<div class="provisional-notice">PROVISIONAL RECEIPT - NO FISCAL VALUE</div>`
            : ""
        }

        ${
          data.cae
            ? `<div class="customer-info">
                <div><span class="customer-label">CAE:</span> ${data.cae}</div>
                ${data.caeVto ? `<div><span class="customer-label">Vto CAE:</span> ${data.caeVto}</div>` : ""}
              </div>`
            : ""
        }

        <div class="items">
            ${data.items
              .map(
                (item: any) => `
                <div class="item-row">
                    <div class="item-desc">
                        ${item.description}
                        ${item.quantity > 1 ? ` x${item.quantity}` : ""}
                        ${
                          item.discount > 0
                            ? `<div style="font-size: 10px; color: #888;">Desc: -${formatCurrency(item.discount)}</div>`
                            : ""
                        }
                    </div>
                    <div class="item-qty">${item.quantity}</div>
                    <div class="item-price">${formatCurrency(item.total)}</div>
                </div>
            `,
              )
              .join("")}
        </div>
        
        <div class="totals">
            <div class="total-row">
                <span>Subtotal:</span>
                <span>${formatCurrency(data.subtotal)}</span>
            </div>
            <div class="total-row">
              <span>Descuento:</span>
              <span>-${formatCurrency(data.discount)}</span>
            </div>
            ${
              data.tax > 0
                ? `<div class="total-row">
                <span>Impuesto (21%):</span>
                <span>${formatCurrency(data.tax)}</span>
            </div>`
                : ""
            }
            <div class="total-row final">
                <span>TOTAL:</span>
                <span>${formatCurrency(data.total)}</span>
            </div>
        </div>
        
        <div class="payment-method">
            Pago: ${
              data.paymentMethod === "mercadopago"
                ? "Mercado Pago"
                : data.paymentMethod === "cash"
                  ? "Efectivo"
                  : data.paymentMethod === "card"
                    ? "Tarjeta"
                    : data.paymentMethod === "transfer"
                      ? "Transferencia"
                      : data.paymentMethod
            }
        </div>
        
        ${
          data.paymentStatus === "pending"
            ? `<div class="status-pending">PAGO PENDIENTE</div>`
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
            <div style="white-space: pre-wrap;">${data.ticketMessage || "¡Gracias por su compra!"}</div>
            <div style="margin-top: 5px;">${new Date().toLocaleString(
              "es-AR",
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

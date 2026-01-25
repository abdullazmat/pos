import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db/connect";
import Sale from "@/lib/models/Sale";
import Invoice from "@/lib/models/Invoice";
import Business from "@/lib/models/Business";
import { verifyToken } from "@/lib/utils/jwt";

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
      date: new Date((sale as any).createdAt).toLocaleString("es-AR"),
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
            <div class="receipt-title">COMPROBANTE DE VENTA</div>
            <div class="receipt-number">Nº ${data.receiptNumber}</div>
            <div class="receipt-date">${data.date}</div>
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
        
        <div class="items">
            ${data.items
              .map(
                (item: any) => `
                <div class="item-row">
                    <div class="item-desc">
                        ${item.description}
                        ${item.quantity > 1 ? ` x${item.quantity}` : ""}
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
            ${
              data.discount > 0
                ? `<div class="total-row">
                <span>Descuento:</span>
                <span>-${formatCurrency(data.discount)}</span>
            </div>`
                : ""
            }
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

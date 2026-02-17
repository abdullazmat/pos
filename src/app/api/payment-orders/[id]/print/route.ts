import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db/connect";
import PaymentOrder from "@/lib/models/PaymentOrder";
import Supplier from "@/lib/models/Supplier";
import { verifyToken } from "@/lib/utils/jwt";

const fmt = (n: number) =>
  new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    minimumFractionDigits: 2,
  }).format(n);

const fmtDate = (d: string | Date) =>
  new Date(d).toLocaleDateString("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

/* ─── i18n labels ─── */
type Lang = "es" | "en" | "pt";

const I18N = {
  es: {
    type: {
      INVOICE: "Factura",
      INVOICE_A: "Factura A",
      INVOICE_B: "Factura B",
      INVOICE_C: "Factura C",
      DEBIT_NOTE: "Nota de Débito",
      CREDIT_NOTE: "Nota de Crédito",
      FISCAL_DELIVERY_NOTE: "Remito Fiscal",
    },
    method: {
      cash: "Efectivo",
      transfer: "Transferencia",
      mercadopago: "Mercado Pago",
      check: "Cheque",
      card: "Tarjeta",
    },
    status: {
      PENDING: "Pendiente",
      CONFIRMED: "Confirmada",
      CANCELLED: "Anulada",
    },
    paymentOrder: "ORDEN DE PAGO",
    internalOP: "OP INTERNA",
    date: "Fecha",
    channel: "Canal: Fiscal",
    supplier: "Proveedor",
    address: "Dirección",
    phone: "Tel",
    appliedDocs: "Comprobantes Aplicados",
    colType: "Tipo",
    colNumber: "Número",
    colDate: "Fecha",
    colBalBefore: "Saldo Ant.",
    colApplied: "Aplicado",
    colBalAfter: "Saldo Post.",
    creditNotesApplied: "Notas de Crédito Aplicadas",
    paymentMethods: "Medios de Pago",
    colMethod: "Medio",
    colRef: "Referencia",
    colAmount: "Monto",
    totalDocs: "Total Comprobantes",
    totalCN: "Total NC",
    totalPaid: "Total Pagado",
    notes: "Observaciones",
    issuedBy: "Emitió",
    signatureConfirm: "Firma Conforme",
    createdBy: "Creado por",
    confirmedBy: "Confirmado por",
    printed: "Impreso",
    vouchers: "COMPROBANTES",
    creditNotes: "NOTAS CRÉDITO",
    paymentMethodsTicket: "MEDIOS DE PAGO",
    obs: "Obs",
    created: "Creado",
    confirmed: "Confirmado",
    total: "Total",
    receipt: "Comprobante",
  },
  en: {
    type: {
      INVOICE: "Invoice",
      INVOICE_A: "Invoice A",
      INVOICE_B: "Invoice B",
      INVOICE_C: "Invoice C",
      DEBIT_NOTE: "Debit Note",
      CREDIT_NOTE: "Credit Note",
      FISCAL_DELIVERY_NOTE: "Fiscal Delivery Note",
    },
    method: {
      cash: "Cash",
      transfer: "Transfer",
      mercadopago: "Mercado Pago",
      check: "Check",
      card: "Card",
    },
    status: {
      PENDING: "Pending",
      CONFIRMED: "Confirmed",
      CANCELLED: "Cancelled",
    },
    paymentOrder: "PAYMENT ORDER",
    internalOP: "INTERNAL PO",
    date: "Date",
    channel: "Channel: Fiscal",
    supplier: "Supplier",
    address: "Address",
    phone: "Phone",
    appliedDocs: "Applied Documents",
    colType: "Type",
    colNumber: "Number",
    colDate: "Date",
    colBalBefore: "Prev. Balance",
    colApplied: "Applied",
    colBalAfter: "Post Balance",
    creditNotesApplied: "Applied Credit Notes",
    paymentMethods: "Payment Methods",
    colMethod: "Method",
    colRef: "Reference",
    colAmount: "Amount",
    totalDocs: "Total Documents",
    totalCN: "Total CN",
    totalPaid: "Total Paid",
    notes: "Notes",
    issuedBy: "Issued by",
    signatureConfirm: "Authorized Signature",
    createdBy: "Created by",
    confirmedBy: "Confirmed by",
    printed: "Printed",
    vouchers: "DOCUMENTS",
    creditNotes: "CREDIT NOTES",
    paymentMethodsTicket: "PAYMENT METHODS",
    obs: "Notes",
    created: "Created",
    confirmed: "Confirmed",
    total: "Total",
    receipt: "Document",
  },
  pt: {
    type: {
      INVOICE: "Fatura",
      INVOICE_A: "Fatura A",
      INVOICE_B: "Fatura B",
      INVOICE_C: "Fatura C",
      DEBIT_NOTE: "Nota de Débito",
      CREDIT_NOTE: "Nota de Crédito",
      FISCAL_DELIVERY_NOTE: "Remessa Fiscal",
    },
    method: {
      cash: "Dinheiro",
      transfer: "Transferência",
      mercadopago: "Mercado Pago",
      check: "Cheque",
      card: "Cartão",
    },
    status: {
      PENDING: "Pendente",
      CONFIRMED: "Confirmada",
      CANCELLED: "Cancelada",
    },
    paymentOrder: "ORDEM DE PAGAMENTO",
    internalOP: "OP INTERNA",
    date: "Data",
    channel: "Canal: Fiscal",
    supplier: "Fornecedor",
    address: "Endereço",
    phone: "Tel",
    appliedDocs: "Documentos Aplicados",
    colType: "Tipo",
    colNumber: "Número",
    colDate: "Data",
    colBalBefore: "Saldo Ant.",
    colApplied: "Aplicado",
    colBalAfter: "Saldo Post.",
    creditNotesApplied: "Notas de Crédito Aplicadas",
    paymentMethods: "Meios de Pagamento",
    colMethod: "Meio",
    colRef: "Referência",
    colAmount: "Valor",
    totalDocs: "Total Documentos",
    totalCN: "Total NC",
    totalPaid: "Total Pago",
    notes: "Observações",
    issuedBy: "Emitido por",
    signatureConfirm: "Assinatura Conforme",
    createdBy: "Criado por",
    confirmedBy: "Confirmado por",
    printed: "Impresso",
    vouchers: "DOCUMENTOS",
    creditNotes: "NOTAS CRÉDITO",
    paymentMethodsTicket: "MEIOS DE PAGAMENTO",
    obs: "Obs",
    created: "Criado",
    confirmed: "Confirmado",
    total: "Total",
    receipt: "Documento",
  },
} as const;

function getL(lang?: string) {
  return I18N[lang as Lang] || I18N.es;
}

/* ─── Channel 1: Full A4 Template ─── */
function renderA4Channel1(order: any, supplier: any, lang?: string): string {
  const L = getL(lang);
  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"/>
<title>${L.paymentOrder} #${order.orderNumber}</title>
<style>
  *{margin:0;padding:0;box-sizing:border-box}
  body{font-family:'Segoe UI',system-ui,sans-serif;font-size:12px;color:#1e293b;padding:24px;max-width:800px;margin:0 auto}
  h1{font-size:20px;margin-bottom:4px}
  .header{display:flex;justify-content:space-between;align-items:flex-start;border-bottom:2px solid #334155;padding-bottom:12px;margin-bottom:16px}
  .header-right{text-align:right}
  .badge{display:inline-block;padding:2px 10px;border-radius:4px;font-size:11px;font-weight:600}
  .badge-confirmed{background:#dcfce7;color:#166534}
  .badge-pending{background:#fef3c7;color:#92400e}
  .badge-cancelled{background:#fecaca;color:#991b1b}
  .section{margin-bottom:16px}
  .section-title{font-size:13px;font-weight:700;text-transform:uppercase;color:#64748b;margin-bottom:8px;border-bottom:1px solid #e2e8f0;padding-bottom:4px}
  table{width:100%;border-collapse:collapse;font-size:11px}
  th{background:#f8fafc;text-align:left;padding:6px 8px;border:1px solid #e2e8f0;font-weight:600}
  td{padding:6px 8px;border:1px solid #e2e8f0}
  .text-right{text-align:right}
  .totals{margin-top:12px;display:flex;justify-content:flex-end}
  .totals-table{width:280px}
  .totals-table td{border:none;padding:4px 8px}
  .totals-table .total-row{font-weight:700;font-size:14px;border-top:2px solid #334155}
  .footer{margin-top:32px;display:flex;justify-content:space-between;font-size:10px;color:#94a3b8}
  .notes{background:#f8fafc;border:1px solid #e2e8f0;padding:8px;border-radius:4px;margin-top:8px;font-size:11px}
  .signatures{margin-top:40px;padding-top:20px;display:flex;justify-content:space-between;gap:48px}
  .signature-box{flex:1;max-width:300px;text-align:center}
  .signature-line{height:48px;border-bottom:1px solid #1e293b}
  .signature-label{margin-top:6px;font-size:11px;color:#475569;font-weight:600}
  @media print{body{padding:0}@page{margin:15mm 10mm}}
</style></head><body>
<div class="header">
  <div>
    <h1>${L.paymentOrder} #${String(order.orderNumber).padStart(4, "0")}</h1>
    <p style="color:#64748b">${L.date}: ${fmtDate(order.date)}</p>
  </div>
  <div class="header-right">
    <span class="badge badge-${order.status.toLowerCase()}">${L.status[order.status as keyof typeof L.status] || order.status}</span>
    <p style="margin-top:4px;font-size:11px;color:#64748b">${L.channel}</p>
  </div>
</div>

<div class="section">
  <div class="section-title">${L.supplier}</div>
  <p><strong>${supplier.name}</strong></p>
  ${supplier.document ? `<p>CUIT: ${supplier.document}</p>` : ""}
  ${supplier.address ? `<p>${L.address}: ${supplier.address}</p>` : ""}
  ${supplier.phone ? `<p>${L.phone}: ${supplier.phone}</p>` : ""}
</div>

<div class="section">
  <div class="section-title">${L.appliedDocs}</div>
  <table>
    <thead><tr>
      <th>${L.colType}</th><th>${L.colNumber}</th><th>${L.colDate}</th>
      <th class="text-right">${L.colBalBefore}</th>
      <th class="text-right">${L.colApplied}</th>
      <th class="text-right">${L.colBalAfter}</th>
    </tr></thead>
    <tbody>
      ${order.documents
        .map(
          (d: any) => `<tr>
        <td>${L.type[d.documentType as keyof typeof L.type] || d.documentType}</td>
        <td>${d.documentNumber}</td>
        <td>${fmtDate(d.date)}</td>
        <td class="text-right">${fmt(d.balanceBefore)}</td>
        <td class="text-right">${fmt(d.amount)}</td>
        <td class="text-right">${fmt(d.balanceAfter)}</td>
      </tr>`,
        )
        .join("")}
    </tbody>
  </table>
</div>

${
  order.creditNotes?.length > 0
    ? `<div class="section">
  <div class="section-title">${L.creditNotesApplied}</div>
  <table>
    <thead><tr>
      <th>${L.colNumber}</th><th>${L.colDate}</th>
      <th class="text-right">${L.colBalBefore}</th>
      <th class="text-right">${L.colApplied}</th>
      <th class="text-right">${L.colBalAfter}</th>
    </tr></thead>
    <tbody>
      ${order.creditNotes
        .map(
          (d: any) => `<tr>
        <td>${d.documentNumber}</td>
        <td>${fmtDate(d.date)}</td>
        <td class="text-right">${fmt(d.balanceBefore)}</td>
        <td class="text-right">${fmt(d.amount)}</td>
        <td class="text-right">${fmt(d.balanceAfter)}</td>
      </tr>`,
        )
        .join("")}
    </tbody>
  </table>
</div>`
    : ""
}

<div class="section">
  <div class="section-title">${L.paymentMethods}</div>
  <table>
    <thead><tr><th>${L.colMethod}</th><th>${L.colRef}</th><th class="text-right">${L.colAmount}</th></tr></thead>
    <tbody>
      ${order.payments
        .map(
          (p: any) => `<tr>
        <td>${L.method[p.method as keyof typeof L.method] || p.method}</td>
        <td>${p.reference || "-"}</td>
        <td class="text-right">${fmt(p.amount)}</td>
      </tr>`,
        )
        .join("")}
    </tbody>
  </table>
</div>

<div class="totals">
  <table class="totals-table">
    <tr><td>${L.totalDocs}:</td><td class="text-right">${fmt(order.documentsTotal)}</td></tr>
    ${order.creditNotesTotal > 0 ? `<tr><td>${L.totalCN}:</td><td class="text-right">-${fmt(order.creditNotesTotal)}</td></tr>` : ""}
    <tr class="total-row"><td>${L.totalPaid}:</td><td class="text-right">${fmt(order.netPayable)}</td></tr>
  </table>
</div>

${order.notes ? `<div class="notes"><strong>${L.notes}:</strong> ${order.notes}</div>` : ""}

<div class="signatures">
  <div class="signature-box">
    <div class="signature-line"></div>
    <div class="signature-label">${L.issuedBy} ${order.createdByEmail || "-"}</div>
  </div>
  <div class="signature-box">
    <div class="signature-line"></div>
    <div class="signature-label">${L.signatureConfirm}</div>
  </div>
</div>

<div class="footer">
  <span>${L.createdBy}: ${order.createdByEmail || "-"}</span>
  ${order.approvedByEmail ? `<span>${L.confirmedBy}: ${order.approvedByEmail}</span>` : ""}
  <span>${L.printed}: ${new Date().toLocaleString("es-AR")}</span>
</div>
</body></html>`;
}

/* ─── Channel 2: Simplified A4 Template ─── */
function renderA4Channel2(order: any, supplier: any, lang?: string): string {
  const L = getL(lang);
  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"/>
<title>${L.internalOP} #${order.orderNumber}</title>
<style>
  *{margin:0;padding:0;box-sizing:border-box}
  body{font-family:'Segoe UI',system-ui,sans-serif;font-size:12px;color:#1e293b;padding:24px;max-width:800px;margin:0 auto}
  .page{min-height:240mm;display:flex;flex-direction:column}
  h1{font-size:18px;margin-bottom:4px}
  .header{border-bottom:2px solid #d97706;padding-bottom:12px;margin-bottom:16px}
  .badge{display:inline-block;padding:2px 10px;border-radius:4px;font-size:11px;font-weight:600;background:#fef3c7;color:#92400e}
  table{width:100%;border-collapse:collapse;font-size:11px;margin-top:8px}
  th{background:#fffbeb;text-align:left;padding:6px 8px;border:1px solid #fde68a;font-weight:600}
  td{padding:6px 8px;border:1px solid #fde68a}
  .text-right{text-align:right}
  .total{margin-top:16px;text-align:right;font-size:16px;font-weight:700}
  .signatures{margin-top:40px;padding-top:30px;display:flex;justify-content:space-between;gap:48px}
  .signature-box{flex:1;max-width:300px;text-align:center}
  .signature-line{height:48px;border-bottom:1px solid #1e293b}
  .signature-label{margin-top:6px;font-size:11px;color:#475569;font-weight:600}
  @media print{body{padding:0}@page{margin:15mm 10mm}}
</style></head><body>
<div class="page">
<div class="header">
  <h1>${L.internalOP} #${String(order.orderNumber).padStart(4, "0")}</h1>
  <p>${L.date}: ${fmtDate(order.date)} · ${L.supplier}: <strong>${supplier.name}</strong></p>
  <span class="badge">${L.status[order.status as keyof typeof L.status] || order.status}</span>
</div>

<table>
  <thead><tr><th>${L.receipt}</th><th class="text-right">${L.colApplied}</th></tr></thead>
  <tbody>
    ${order.documents
      .map(
        (d: any) =>
          `<tr><td>${d.documentNumber}</td><td class="text-right">${fmt(d.amount)}</td></tr>`,
      )
      .join("")}
    ${
      order.creditNotes
        ?.map(
          (d: any) =>
            `<tr><td>NC ${d.documentNumber}</td><td class="text-right">-${fmt(d.amount)}</td></tr>`,
        )
        .join("") || ""
    }
  </tbody>
</table>

<table style="margin-top:12px">
  <thead><tr><th>${L.colMethod}</th><th class="text-right">${L.colAmount}</th></tr></thead>
  <tbody>
    ${order.payments
      .map(
        (p: any) =>
          `<tr><td>${L.method[p.method as keyof typeof L.method] || p.method}</td><td class="text-right">${fmt(p.amount)}</td></tr>`,
      )
      .join("")}
  </tbody>
</table>

<div class="total">${L.total}: ${fmt(order.netPayable)}</div>

<div class="signatures">
  <div class="signature-box">
    <div class="signature-line"></div>
    <div class="signature-label">${L.issuedBy} ${order.createdByEmail || "-"}</div>
  </div>
  <div class="signature-box">
    <div class="signature-line"></div>
    <div class="signature-label">${L.signatureConfirm}</div>
  </div>
</div>
</div>
</body></html>`;
}

/* ─── Channel 1: Ticket Template (58/80mm) ─── */
function renderTicketChannel1(
  order: any,
  supplier: any,
  lang?: string,
): string {
  const L = getL(lang);
  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"/>
<title>${L.paymentOrder} #${order.orderNumber}</title>
<style>
  *{margin:0;padding:0;box-sizing:border-box}
  body{font-family:'Courier New',monospace;font-size:10px;width:58mm;padding:3mm;color:#000}
  .center{text-align:center}
  .bold{font-weight:bold}
  .line{border-top:1px dashed #000;margin:4px 0}
  .right{text-align:right}
  .row{display:flex;justify-content:space-between}
  @media print{@page{size:58mm auto;margin:0}}
</style></head><body>
<div class="center bold" style="font-size:12px">${L.paymentOrder}</div>
<div class="center">#${String(order.orderNumber).padStart(4, "0")}</div>
<div class="center">${fmtDate(order.date)}</div>
<div class="center">${L.status[order.status as keyof typeof L.status] || order.status}</div>
<div class="line"></div>
<div class="bold">${supplier.name}</div>
${supplier.document ? `<div>CUIT: ${supplier.document}</div>` : ""}
<div class="line"></div>
<div class="bold">${L.vouchers}:</div>
${order.documents
  .map(
    (d: any) =>
      `<div class="row"><span>${d.documentNumber}</span><span>${fmt(d.amount)}</span></div>`,
  )
  .join("")}
${
  order.creditNotes?.length > 0
    ? `<div class="line"></div><div class="bold">${L.creditNotes}:</div>
${order.creditNotes.map((d: any) => `<div class="row"><span>${d.documentNumber}</span><span>-${fmt(d.amount)}</span></div>`).join("")}`
    : ""
}
<div class="line"></div>
<div class="bold">${L.paymentMethodsTicket}:</div>
${order.payments
  .map(
    (p: any) =>
      `<div class="row"><span>${L.method[p.method as keyof typeof L.method] || p.method}</span><span>${fmt(p.amount)}</span></div>`,
  )
  .join("")}
<div class="line"></div>
<div class="row"><span>${L.totalDocs}:</span><span>${fmt(order.documentsTotal)}</span></div>
${order.creditNotesTotal > 0 ? `<div class="row"><span>${L.totalCN}:</span><span>-${fmt(order.creditNotesTotal)}</span></div>` : ""}
<div class="row bold" style="font-size:12px"><span>TOTAL:</span><span>${fmt(order.netPayable)}</span></div>
${order.notes ? `<div class="line"></div><div>${L.obs}: ${order.notes}</div>` : ""}
<div class="line"></div>
<div style="margin-top:8px;display:flex;justify-content:space-between;gap:4mm">
  <div style="flex:1;text-align:center">
    <div style="height:30px;border-bottom:1px solid #000"></div>
    <div style="font-size:7px;margin-top:2px">${L.issuedBy} ${order.createdByEmail || "-"}</div>
  </div>
  <div style="flex:1;text-align:center">
    <div style="height:30px;border-bottom:1px solid #000"></div>
    <div style="font-size:7px;margin-top:2px">${L.signatureConfirm}</div>
  </div>
</div>
<div class="line"></div>
<div style="font-size:8px;color:#666">
  <div>${L.created}: ${order.createdByEmail || "-"}</div>
  ${order.approvedByEmail ? `<div>${L.confirmed}: ${order.approvedByEmail}</div>` : ""}
</div>
</body></html>`;
}

/* ─── Channel 2: Ticket Simplified ─── */
function renderTicketChannel2(
  order: any,
  supplier: any,
  lang?: string,
): string {
  const L = getL(lang);
  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"/>
<title>${L.internalOP} #${order.orderNumber}</title>
<style>
  *{margin:0;padding:0;box-sizing:border-box}
  body{font-family:'Courier New',monospace;font-size:10px;width:58mm;padding:3mm;color:#000}
  .center{text-align:center}
  .bold{font-weight:bold}
  .line{border-top:1px dashed #000;margin:4px 0}
  .row{display:flex;justify-content:space-between}
  @media print{@page{size:58mm auto;margin:0}}
</style></head><body>
<div class="center bold">${L.internalOP} #${String(order.orderNumber).padStart(4, "0")}</div>
<div class="center">${fmtDate(order.date)}</div>
<div class="line"></div>
<div class="bold">${supplier.name}</div>
<div class="line"></div>
${order.documents.map((d: any) => `<div class="row"><span>${d.documentNumber}</span><span>${fmt(d.amount)}</span></div>`).join("")}
${order.creditNotes?.map((d: any) => `<div class="row"><span>NC ${d.documentNumber}</span><span>-${fmt(d.amount)}</span></div>`).join("") || ""}
<div class="line"></div>
${order.payments.map((p: any) => `<div class="row"><span>${L.method[p.method as keyof typeof L.method] || p.method}</span><span>${fmt(p.amount)}</span></div>`).join("")}
<div class="line"></div>
<div class="row bold" style="font-size:12px"><span>TOTAL:</span><span>${fmt(order.netPayable)}</span></div>
<div class="line"></div>
<div style="margin-top:8px;display:flex;justify-content:space-between;gap:4mm">
  <div style="flex:1;text-align:center">
    <div style="height:30px;border-bottom:1px solid #000"></div>
    <div style="font-size:7px;margin-top:2px">${L.issuedBy} ${order.createdByEmail || "-"}</div>
  </div>
  <div style="flex:1;text-align:center">
    <div style="height:30px;border-bottom:1px solid #000"></div>
    <div style="font-size:7px;margin-top:2px">${L.signatureConfirm}</div>
  </div>
</div>
</body></html>`;
}

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const token = req.headers.get("authorization")?.split(" ")[1];
    if (!token)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const decoded = verifyToken(token);
    if (!decoded)
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const format = searchParams.get("format") || "a4"; // a4 | ticket
    const channel = Number(searchParams.get("channel") || "1");
    const lang = searchParams.get("lang") || "es";

    await dbConnect();

    const paymentOrder = await PaymentOrder.findOne({
      _id: params.id,
      businessId: decoded.businessId,
    });

    if (!paymentOrder) {
      return NextResponse.json(
        { error: "Payment order not found" },
        { status: 404 },
      );
    }

    const supplier = await Supplier.findById(paymentOrder.supplierId);
    if (!supplier) {
      return NextResponse.json(
        { error: "Supplier not found" },
        { status: 404 },
      );
    }

    const effectiveChannel = channel === 2 ? 2 : paymentOrder.channel || 1;

    let html: string;
    if (format === "ticket") {
      html =
        effectiveChannel === 2
          ? renderTicketChannel2(paymentOrder, supplier, lang)
          : renderTicketChannel1(paymentOrder, supplier, lang);
    } else {
      html =
        effectiveChannel === 2
          ? renderA4Channel2(paymentOrder, supplier, lang)
          : renderA4Channel1(paymentOrder, supplier, lang);
    }

    return new NextResponse(html, {
      headers: {
        "Content-Type": "text/html; charset=utf-8",
      },
    });
  } catch (error) {
    console.error("Print payment order error:", error);
    return NextResponse.json(
      { error: "Failed to generate print" },
      { status: 500 },
    );
  }
}

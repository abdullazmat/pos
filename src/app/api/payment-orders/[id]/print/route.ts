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

const TYPE_LABELS: Record<string, string> = {
  INVOICE: "Factura",
  INVOICE_A: "Factura A",
  INVOICE_B: "Factura B",
  INVOICE_C: "Factura C",
  DEBIT_NOTE: "Nota de Débito",
  CREDIT_NOTE: "Nota de Crédito",
  FISCAL_DELIVERY_NOTE: "Remito Fiscal",
};

const METHOD_LABELS: Record<string, string> = {
  cash: "Efectivo",
  transfer: "Transferencia",
  mercadopago: "Mercado Pago",
  check: "Cheque",
  card: "Tarjeta",
};

const STATUS_LABELS: Record<string, string> = {
  PENDING: "Pendiente",
  CONFIRMED: "Confirmada",
  CANCELLED: "Anulada",
};

/* ─── Channel 1: Full A4 Template ─── */
function renderA4Channel1(order: any, supplier: any): string {
  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"/>
<title>Orden de Pago #${order.orderNumber}</title>
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
  @media print{body{padding:0}@page{margin:15mm 10mm}}
</style></head><body>
<div class="header">
  <div>
    <h1>ORDEN DE PAGO #${String(order.orderNumber).padStart(4, "0")}</h1>
    <p style="color:#64748b">Fecha: ${fmtDate(order.date)}</p>
  </div>
  <div class="header-right">
    <span class="badge badge-${order.status.toLowerCase()}">${STATUS_LABELS[order.status]}</span>
    <p style="margin-top:4px;font-size:11px;color:#64748b">Canal: Fiscal</p>
  </div>
</div>

<div class="section">
  <div class="section-title">Proveedor</div>
  <p><strong>${supplier.name}</strong></p>
  ${supplier.document ? `<p>CUIT: ${supplier.document}</p>` : ""}
  ${supplier.address ? `<p>Dirección: ${supplier.address}</p>` : ""}
  ${supplier.phone ? `<p>Tel: ${supplier.phone}</p>` : ""}
</div>

<div class="section">
  <div class="section-title">Comprobantes Aplicados</div>
  <table>
    <thead><tr>
      <th>Tipo</th><th>Número</th><th>Fecha</th>
      <th class="text-right">Saldo Ant.</th>
      <th class="text-right">Aplicado</th>
      <th class="text-right">Saldo Post.</th>
    </tr></thead>
    <tbody>
      ${order.documents
        .map(
          (d: any) => `<tr>
        <td>${TYPE_LABELS[d.documentType] || d.documentType}</td>
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
  <div class="section-title">Notas de Crédito Aplicadas</div>
  <table>
    <thead><tr>
      <th>Número</th><th>Fecha</th>
      <th class="text-right">Saldo Ant.</th>
      <th class="text-right">Aplicado</th>
      <th class="text-right">Saldo Post.</th>
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
  <div class="section-title">Medios de Pago</div>
  <table>
    <thead><tr><th>Medio</th><th>Referencia</th><th class="text-right">Monto</th></tr></thead>
    <tbody>
      ${order.payments
        .map(
          (p: any) => `<tr>
        <td>${METHOD_LABELS[p.method] || p.method}</td>
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
    <tr><td>Total Comprobantes:</td><td class="text-right">${fmt(order.documentsTotal)}</td></tr>
    ${order.creditNotesTotal > 0 ? `<tr><td>Total NC:</td><td class="text-right">-${fmt(order.creditNotesTotal)}</td></tr>` : ""}
    <tr class="total-row"><td>Total Pagado:</td><td class="text-right">${fmt(order.netPayable)}</td></tr>
  </table>
</div>

${order.notes ? `<div class="notes"><strong>Observaciones:</strong> ${order.notes}</div>` : ""}

<div class="footer">
  <span>Creado por: ${order.createdByEmail || "-"}</span>
  ${order.approvedByEmail ? `<span>Confirmado por: ${order.approvedByEmail}</span>` : ""}
  <span>Impreso: ${new Date().toLocaleString("es-AR")}</span>
</div>
</body></html>`;
}

/* ─── Channel 2: Simplified A4 Template ─── */
function renderA4Channel2(order: any, supplier: any): string {
  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"/>
<title>OP Interna #${order.orderNumber}</title>
<style>
  *{margin:0;padding:0;box-sizing:border-box}
  body{font-family:'Segoe UI',system-ui,sans-serif;font-size:12px;color:#1e293b;padding:24px;max-width:800px;margin:0 auto}
  h1{font-size:18px;margin-bottom:4px}
  .header{border-bottom:2px solid #d97706;padding-bottom:12px;margin-bottom:16px}
  .badge{display:inline-block;padding:2px 10px;border-radius:4px;font-size:11px;font-weight:600;background:#fef3c7;color:#92400e}
  table{width:100%;border-collapse:collapse;font-size:11px;margin-top:8px}
  th{background:#fffbeb;text-align:left;padding:6px 8px;border:1px solid #fde68a;font-weight:600}
  td{padding:6px 8px;border:1px solid #fde68a}
  .text-right{text-align:right}
  .total{margin-top:16px;text-align:right;font-size:16px;font-weight:700}
  @media print{body{padding:0}@page{margin:15mm 10mm}}
</style></head><body>
<div class="header">
  <h1>OP INTERNA #${String(order.orderNumber).padStart(4, "0")}</h1>
  <p>Fecha: ${fmtDate(order.date)} · Proveedor: <strong>${supplier.name}</strong></p>
  <span class="badge">${STATUS_LABELS[order.status]}</span>
</div>

<table>
  <thead><tr><th>Comprobante</th><th class="text-right">Aplicado</th></tr></thead>
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
  <thead><tr><th>Medio</th><th class="text-right">Monto</th></tr></thead>
  <tbody>
    ${order.payments
      .map(
        (p: any) =>
          `<tr><td>${METHOD_LABELS[p.method] || p.method}</td><td class="text-right">${fmt(p.amount)}</td></tr>`,
      )
      .join("")}
  </tbody>
</table>

<div class="total">Total: ${fmt(order.netPayable)}</div>
</body></html>`;
}

/* ─── Channel 1: Ticket Template (58/80mm) ─── */
function renderTicketChannel1(order: any, supplier: any): string {
  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"/>
<title>Ticket OP #${order.orderNumber}</title>
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
<div class="center bold" style="font-size:12px">ORDEN DE PAGO</div>
<div class="center">#${String(order.orderNumber).padStart(4, "0")}</div>
<div class="center">${fmtDate(order.date)}</div>
<div class="center">${STATUS_LABELS[order.status]}</div>
<div class="line"></div>
<div class="bold">${supplier.name}</div>
${supplier.document ? `<div>CUIT: ${supplier.document}</div>` : ""}
<div class="line"></div>
<div class="bold">COMPROBANTES:</div>
${order.documents
  .map(
    (d: any) =>
      `<div class="row"><span>${d.documentNumber}</span><span>${fmt(d.amount)}</span></div>`,
  )
  .join("")}
${
  order.creditNotes?.length > 0
    ? `<div class="line"></div><div class="bold">NOTAS CRÉDITO:</div>
${order.creditNotes.map((d: any) => `<div class="row"><span>${d.documentNumber}</span><span>-${fmt(d.amount)}</span></div>`).join("")}`
    : ""
}
<div class="line"></div>
<div class="bold">MEDIOS DE PAGO:</div>
${order.payments
  .map(
    (p: any) =>
      `<div class="row"><span>${METHOD_LABELS[p.method] || p.method}</span><span>${fmt(p.amount)}</span></div>`,
  )
  .join("")}
<div class="line"></div>
<div class="row"><span>Comprobantes:</span><span>${fmt(order.documentsTotal)}</span></div>
${order.creditNotesTotal > 0 ? `<div class="row"><span>NC:</span><span>-${fmt(order.creditNotesTotal)}</span></div>` : ""}
<div class="row bold" style="font-size:12px"><span>TOTAL:</span><span>${fmt(order.netPayable)}</span></div>
${order.notes ? `<div class="line"></div><div>Obs: ${order.notes}</div>` : ""}
<div class="line"></div>
<div style="font-size:8px;color:#666">
  <div>Creado: ${order.createdByEmail || "-"}</div>
  ${order.approvedByEmail ? `<div>Confirmado: ${order.approvedByEmail}</div>` : ""}
</div>
</body></html>`;
}

/* ─── Channel 2: Ticket Simplified ─── */
function renderTicketChannel2(order: any, supplier: any): string {
  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"/>
<title>Ticket OP Interna #${order.orderNumber}</title>
<style>
  *{margin:0;padding:0;box-sizing:border-box}
  body{font-family:'Courier New',monospace;font-size:10px;width:58mm;padding:3mm;color:#000}
  .center{text-align:center}
  .bold{font-weight:bold}
  .line{border-top:1px dashed #000;margin:4px 0}
  .row{display:flex;justify-content:space-between}
  @media print{@page{size:58mm auto;margin:0}}
</style></head><body>
<div class="center bold">OP INTERNA #${String(order.orderNumber).padStart(4, "0")}</div>
<div class="center">${fmtDate(order.date)}</div>
<div class="line"></div>
<div class="bold">${supplier.name}</div>
<div class="line"></div>
${order.documents.map((d: any) => `<div class="row"><span>${d.documentNumber}</span><span>${fmt(d.amount)}</span></div>`).join("")}
${order.creditNotes?.map((d: any) => `<div class="row"><span>NC ${d.documentNumber}</span><span>-${fmt(d.amount)}</span></div>`).join("") || ""}
<div class="line"></div>
${order.payments.map((p: any) => `<div class="row"><span>${METHOD_LABELS[p.method] || p.method}</span><span>${fmt(p.amount)}</span></div>`).join("")}
<div class="line"></div>
<div class="row bold" style="font-size:12px"><span>TOTAL:</span><span>${fmt(order.netPayable)}</span></div>
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
          ? renderTicketChannel2(paymentOrder, supplier)
          : renderTicketChannel1(paymentOrder, supplier);
    } else {
      html =
        effectiveChannel === 2
          ? renderA4Channel2(paymentOrder, supplier)
          : renderA4Channel1(paymentOrder, supplier);
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

/**
 * Opens a new window with the receipt content and triggers the browser print dialog.
 * This is more reliable than window.print() on the main page because:
 * - No CSS :has() selector needed to hide/show elements
 * - No @page size conflicts with PDF drivers
 * - Clean document with only receipt content
 */
export function printReceipt() {
  const container = document.querySelector(".receipt-container");
  if (!container) {
    console.warn("printReceipt: .receipt-container not found");
    return;
  }

  // Clone receipt HTML
  const receiptHTML = container.innerHTML;

  // Collect all stylesheets from the current page (for font/color definitions)
  // But we'll primarily use inline styles for the print window
  const printWindow = window.open("", "_blank", "width=400,height=700");
  if (!printWindow) {
    // Popup blocked — fall back to window.print()
    console.warn("printReceipt: popup blocked, falling back to window.print()");
    window.print();
    return;
  }

  // Get computed background for receipt logo (if any)
  const logoImg = container.querySelector("img");
  const logoSrc = logoImg?.getAttribute("src") || "";

  printWindow.document.open();
  printWindow.document.write(`<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>Receipt</title>
  <style>
    @page {
      size: auto;
      margin: 5mm;
    }
    * {
      box-sizing: border-box;
    }
    html, body {
      margin: 0;
      padding: 0;
      background: #fff;
      color: #000;
      font-family: 'Courier New', Courier, monospace;
      font-size: 12px;
      line-height: 1.5;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    .receipt-container {
      max-width: 80mm;
      margin: 0 auto;
      padding: 10px;
    }
    /* Force black text for all elements */
    .receipt-container * {
      color: #000 !important;
      background: transparent !important;
      border-color: #333 !important;
    }
    /* Hide no-print elements like buttons */
    .no-print {
      display: none !important;
    }
    /* Common Tailwind-like utilities used in receipts */
    .text-center { text-align: center; }
    .text-right { text-align: right; }
    .text-left { text-align: left; }
    .font-bold { font-weight: bold; }
    .font-semibold { font-weight: 600; }
    .text-xl { font-size: 18px; }
    .text-lg { font-size: 16px; }
    .text-sm { font-size: 11px; }
    .text-xs { font-size: 10px; }
    .mb-1 { margin-bottom: 4px; }
    .mb-2 { margin-bottom: 8px; }
    .mb-3 { margin-bottom: 12px; }
    .mb-4 { margin-bottom: 16px; }
    .mt-1 { margin-top: 4px; }
    .mt-2 { margin-top: 8px; }
    .mt-4 { margin-top: 16px; }
    .mx-auto { margin-left: auto; margin-right: auto; }
    .py-2 { padding-top: 8px; padding-bottom: 8px; }
    .py-3 { padding-top: 12px; padding-bottom: 12px; }
    .px-2 { padding-left: 8px; padding-right: 8px; }
    .px-4 { padding-left: 16px; padding-right: 16px; }
    .p-3 { padding: 12px; }
    .p-4 { padding: 16px; }
    .p-5 { padding: 20px; }
    .pb-4 { padding-bottom: 16px; }
    .pt-4 { padding-top: 16px; }
    .pb-2 { padding-bottom: 8px; }
    .flex { display: flex; }
    .justify-between { justify-content: space-between; }
    .justify-center { justify-content: center; }
    .items-center { align-items: center; }
    .gap-2 { gap: 8px; }
    .gap-3 { gap: 12px; }
    .w-full { width: 100%; }
    .rounded-full { border-radius: 9999px; }
    .rounded-lg { border-radius: 8px; }
    .rounded-sm { border-radius: 2px; }
    .border { border-width: 1px; border-style: solid; }
    .border-2 { border-width: 2px; border-style: solid; }
    .border-b { border-bottom-width: 1px; border-bottom-style: solid; }
    .border-t { border-top-width: 1px; border-top-style: solid; }
    .border-dashed { border-style: dashed; }
    .overflow-hidden { overflow: hidden; }
    .object-contain { object-fit: contain; }
    .h-12 { height: 48px; }
    .w-12 { width: 48px; }
    .space-y-1 > * + * { margin-top: 4px; }
    .space-y-2 > * + * { margin-top: 8px; }
    .italic { font-style: italic; }
    table { width: 100%; border-collapse: collapse; }
    td, th { padding: 2px 4px; }
    img { max-width: 100%; height: auto; }
    /* Fiscal info box styling */
    .border-yellow-500, .border-amber-500, .border-orange-400 {
      border-color: #f59e0b !important;
    }
    .border-green-500, .border-emerald-500 {
      border-color: #10b981 !important;
    }
    @media print {
      @page {
        size: auto;
        margin: 5mm;
      }
      body {
        margin: 0;
        padding: 0;
      }
    }
  </style>
</head>
<body>
  <div class="receipt-container">
    ${receiptHTML}
  </div>
  <div id="print-actions" style="text-align:center;margin:20px auto;max-width:80mm;">
    <button onclick="document.getElementById('print-actions').style.display='none';window.print();document.getElementById('print-actions').style.display='';"
      style="padding:10px 32px;font-size:16px;font-weight:bold;background:#2563eb;color:#fff;border:none;border-radius:8px;cursor:pointer;margin-right:8px;">
      Print / Save PDF
    </button>
    <button onclick="window.close()"
      style="padding:10px 24px;font-size:16px;background:#e5e7eb;color:#333;border:none;border-radius:8px;cursor:pointer;">
      Close
    </button>
  </div>
  <style>
    #print-actions { page-break-before: avoid; }
    @media print { #print-actions { display: none !important; } }
  </style>
</body>
</html>`);
  printWindow.document.close();
}

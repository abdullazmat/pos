/**
 * OCR utility for extracting data from receipts and invoices.
 * Uses Tesseract.js for images and pdf-parse for PDFs.
 * Extracts: date, amount, tax ID (CUIT) via regex patterns.
 */

import Tesseract from "tesseract.js";

// ─── Regex patterns for Argentine receipts ──────────────────────────
const AMOUNT_PATTERNS = [
  // "Total: $1,234.56" or "TOTAL $1.234,56" (AR format)
  /(?:total|importe|monto|amount|neto|pagar)\s*[:$]?\s*\$?\s*([\d.,]+)/gi,
  // "$1,234.56" standalone large amounts
  /\$\s*([\d]{1,3}(?:[.,]\d{3})*(?:[.,]\d{2}))/g,
  // Fallback: any number after $ sign
  /\$\s*([\d.,]+)/g,
];

const DATE_PATTERNS = [
  // DD/MM/YYYY or DD-MM-YYYY
  /(\d{1,2})[/\-.](\d{1,2})[/\-.](\d{4})/g,
  // YYYY-MM-DD (ISO)
  /(\d{4})[/\-.](\d{1,2})[/\-.](\d{1,2})/g,
  // "Fecha: DD/MM/YYYY" or "Date: ..."
  /(?:fecha|date|emisi[oó]n)\s*[:.]?\s*(\d{1,2}[/\-.\s]\d{1,2}[/\-.\s]\d{4})/gi,
];

// Argentine CUIT: XX-XXXXXXXX-X
const CUIT_PATTERNS = [
  /(?:C\.?U\.?I\.?T\.?|CUIT)\s*[:.]?\s*(\d{2}[-.]?\d{8}[-.]?\d{1})/gi,
  /\b(\d{2}-\d{8}-\d{1})\b/g,
  /\b(20|23|24|27|30|33|34)\d{9}\b/g,
];

// Issuer / business name patterns
const ISSUER_PATTERNS = [
  /(?:raz[oó]n\s*social|razon\s*social)\s*[:.]?\s*(.+)/gi,
  /(?:emisor|seller|proveedor)\s*[:.]?\s*(.+)/gi,
];

// ─── Parse amount from text ──────────────────────────────────────────
function parseAmount(text: string): number | null {
  const amounts: number[] = [];

  for (const pattern of AMOUNT_PATTERNS) {
    pattern.lastIndex = 0;
    let match;
    while ((match = pattern.exec(text)) !== null) {
      let numStr = match[1];
      if (!numStr) continue;

      // Determine format: Argentine (1.234,56) vs US (1,234.56)
      const lastComma = numStr.lastIndexOf(",");
      const lastDot = numStr.lastIndexOf(".");

      if (lastComma > lastDot) {
        // Argentine format: 1.234,56 → remove dots, replace comma with dot
        numStr = numStr.replace(/\./g, "").replace(",", ".");
      } else {
        // US format: 1,234.56 → remove commas
        numStr = numStr.replace(/,/g, "");
      }

      const val = parseFloat(numStr);
      if (!isNaN(val) && val > 0 && val < 100_000_000) {
        amounts.push(val);
      }
    }
  }

  if (amounts.length === 0) return null;

  // Return the largest amount (usually the total)
  return Math.max(...amounts);
}

// ─── Parse date from text ────────────────────────────────────────────
function parseDate(text: string): string | null {
  for (const pattern of DATE_PATTERNS) {
    pattern.lastIndex = 0;
    const match = pattern.exec(text);
    if (!match) continue;

    // Check if it's the named group pattern (Fecha: ...)
    if (match.length === 2) {
      // Full date string captured, parse it
      const dateStr = match[1];
      const parts = dateStr.split(/[/\-.\s]+/);
      if (parts.length === 3) {
        const [d, m, y] = parts.map(Number);
        if (y > 1990 && y < 2100 && m >= 1 && m <= 12 && d >= 1 && d <= 31) {
          return `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
        }
      }
      continue;
    }

    const [, a, b, c] = match;

    // ISO format: YYYY-MM-DD
    if (parseInt(a) > 1990) {
      const y = parseInt(a);
      const m = parseInt(b);
      const d = parseInt(c);
      if (m >= 1 && m <= 12 && d >= 1 && d <= 31) {
        return `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
      }
    }

    // DD/MM/YYYY format (common in Argentina)
    const d = parseInt(a);
    const m = parseInt(b);
    const y = parseInt(c);
    if (y > 1990 && y < 2100 && m >= 1 && m <= 12 && d >= 1 && d <= 31) {
      return `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    }
  }

  return null;
}

// ─── Parse CUIT from text ────────────────────────────────────────────
function parseTaxId(text: string): string | null {
  for (const pattern of CUIT_PATTERNS) {
    pattern.lastIndex = 0;
    const match = pattern.exec(text);
    if (match) {
      let cuit = match[1] || match[0];
      // Normalize to XX-XXXXXXXX-X format
      cuit = cuit.replace(/[^0-9]/g, "");
      if (cuit.length === 11) {
        return `${cuit.slice(0, 2)}-${cuit.slice(2, 10)}-${cuit.slice(10)}`;
      }
    }
  }
  return null;
}

// ─── Parse issuer from text ──────────────────────────────────────────
function parseIssuer(text: string): string | null {
  for (const pattern of ISSUER_PATTERNS) {
    pattern.lastIndex = 0;
    const match = pattern.exec(text);
    if (match && match[1]) {
      const issuer = match[1].trim().substring(0, 100);
      if (issuer.length > 2) return issuer;
    }
  }
  return null;
}

// ─── OCR for images using Tesseract.js ───────────────────────────────
async function ocrImage(
  buffer: Buffer,
): Promise<{ text: string; confidence: number }> {
  const {
    data: { text, confidence },
  } = await Tesseract.recognize(buffer, "spa+eng", {
    logger: () => {},
  });
  return { text, confidence: (confidence || 0) / 100 };
}

// ─── OCR for PDFs ────────────────────────────────────────────────────
async function ocrPdf(
  buffer: Buffer,
): Promise<{ text: string; confidence: number }> {
  try {
    // Dynamic import to avoid issues if pdf-parse not installed
    const pdfParse = (await import("pdf-parse")) as any;
    const data = await pdfParse.default(buffer);
    const text = data.text || "";
    // PDF text extraction is typically high confidence if text layer exists
    const confidence = text.trim().length > 20 ? 0.9 : 0.3;
    return { text, confidence };
  } catch (error) {
    console.error("PDF parse error:", error);
    return { text: "", confidence: 0 };
  }
}

// ─── Main OCR processing function ────────────────────────────────────
export interface OcrResult {
  rawText: string;
  confidence: number;
  extracted: {
    date: string | null;
    amount: number | null;
    taxId: string | null;
    issuer: string | null;
  };
}

export async function processOcr(
  buffer: Buffer,
  mimeType: string,
): Promise<OcrResult> {
  let ocrOutput: { text: string; confidence: number };

  if (mimeType === "application/pdf") {
    ocrOutput = await ocrPdf(buffer);

    // If PDF text layer is weak, and we extracted very little text,
    // the OCR confidence is low — return what we have
    if (ocrOutput.text.trim().length < 10) {
      return {
        rawText: ocrOutput.text,
        confidence: 0,
        extracted: { date: null, amount: null, taxId: null, issuer: null },
      };
    }
  } else {
    ocrOutput = await ocrImage(buffer);
  }

  const { text, confidence } = ocrOutput;

  // Extract structured data
  const extracted = {
    date: parseDate(text),
    amount: parseAmount(text),
    taxId: parseTaxId(text),
    issuer: parseIssuer(text),
  };

  return {
    rawText: text.substring(0, 5000), // Limit stored text
    confidence: Math.round(confidence * 100) / 100,
    extracted,
  };
}

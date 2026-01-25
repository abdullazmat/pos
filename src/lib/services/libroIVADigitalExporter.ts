/**
 * Libro IVA Digital Export Utility
 *
 * Generates the official "Libro de IVA Digital" format for AFIP submission
 * Reference: https://www.afip.gob.ar/iva/documentos/libro-iva-digital-diseno-registros.pdf
 *
 * Format: TXT with specific field widths and structure
 */

export interface InvoiceForLibroIVA {
  date: Date;
  comprobanteTipo: number;
  pointOfSale: number;
  invoiceNumber: number;
  customerDocumentType: number;
  customerDocument: string;
  customerName: string;
  totalAmount: number;
  taxableAmount: number;
  exemptAmount: number;
  untaxedAmount: number;
  taxAmount: number;
  cae?: string;
  caeVto?: string;
  status: "AUTHORIZED" | "VOIDED";
  // Tax breakdown
  taxBreakdown: Array<{
    aliquot: number; // 0, 10.5, 21, 27
    baseAmount: number;
    taxAmount: number;
  }>;
}

export interface LibroIVADigitalOptions {
  cuit: string;
  fiscalYear: number; // e.g., 2026
  fiscalMonth: number; // 1-12
  fileName?: string;
  includeEmpty?: boolean; // Include months with no transactions
  version?: string; // "v1", "v2", etc.
}

export class LibroIVADigitalExporter {
  private cuit: string;
  private fiscalYear: number;
  private fiscalMonth: number;
  private fileName: string;
  private version: string;

  constructor(options: LibroIVADigitalOptions) {
    this.cuit = options.cuit;
    this.fiscalYear = options.fiscalYear;
    this.fiscalMonth = options.fiscalMonth;
    this.version = options.version || "v1";
    this.fileName = options.fileName || this.generateFileName();
  }

  /**
   * Generate the complete Libro IVA Digital export
   */
  generateTxtFile(invoices: InvoiceForLibroIVA[]): string {
    const lines: string[] = [];

    // Header Record
    lines.push(this.generateHeaderRecord());

    // Sales Records (Comprobante de Venta)
    const salesRecords = invoices.filter((inv) =>
      [1, 6].includes(inv.comprobanteTipo),
    );
    salesRecords.forEach((inv) => {
      lines.push(this.generateSalesRecord(inv));
    });

    // Voided/Invalidated Records (Comprobante Inutilizado)
    const voidedRecords = invoices.filter((inv) => inv.status === "VOIDED");
    voidedRecords.forEach((inv) => {
      lines.push(this.generateVoidedRecord(inv));
    });

    // Tax Rate Summary (Resumen por Alícuota)
    const taxSummaries = this.generateTaxRateSummary(invoices);
    taxSummaries.forEach((summary) => {
      lines.push(this.generateTaxRateRecord(summary));
    });

    // Footer/Control Record
    lines.push(this.generateFooterRecord(invoices));

    return lines.join("\n");
  }

  /**
   * Header Record Format (RCOMP - 01)
   * Position 1-2: Record Type = "01"
   */
  private generateHeaderRecord(): string {
    const recordType = "01";
    const cuit = this.padRight(this.cuit, 11, " ");
    const period = `${this.fiscalYear}${String(this.fiscalMonth).padStart(2, "0")}`;
    const movementType = "1"; // 1 = Con movimientos (with transactions)
    const reserved = this.padRight("", 1, " ");

    return `${recordType}${cuit}${period}${movementType}${reserved}`;
  }

  /**
   * Sales Record Format (RCOMP - 02)
   * Contains detail of each issued invoice
   */
  private generateSalesRecord(invoice: InvoiceForLibroIVA): string {
    const recordType = "02";
    const cuit = this.padRight(this.cuit, 11, " ");
    const period = `${this.fiscalYear}${String(this.fiscalMonth).padStart(2, "0")}`;

    // Document Type
    const docType = String(invoice.comprobanteTipo).padStart(2, "0");
    const posNumber = String(invoice.pointOfSale).padStart(5, "0");
    const invoiceNum = String(invoice.invoiceNumber).padStart(8, "0");

    // Customer info
    const custDocType = String(invoice.customerDocumentType).padStart(2, "0");
    const custDocNumber = this.padRight(invoice.customerDocument, 20, " ");
    const custName = this.padRight(invoice.customerName, 30, " ");

    // Amounts (in cents, no decimals)
    const totalAmount = String(Math.round(invoice.totalAmount * 100)).padStart(
      15,
      "0",
    );
    const taxableAmount = String(
      Math.round(invoice.taxableAmount * 100),
    ).padStart(15, "0");
    const exemptAmount = String(
      Math.round((invoice.exemptAmount || 0) * 100),
    ).padStart(15, "0");
    const untaxedAmount = String(
      Math.round((invoice.untaxedAmount || 0) * 100),
    ).padStart(15, "0");
    const taxAmount = String(Math.round(invoice.taxAmount * 100)).padStart(
      15,
      "0",
    );

    // CAE (if authorized)
    const cae = this.padRight(invoice.cae || "", 14, " ");
    const caeVto = this.padRight(invoice.caeVto || "", 8, " ");

    // Date (YYYYMMDD)
    const invoiceDate = this.formatDate(invoice.date);

    // Operation type (1 = normal)
    const operationType = "1";

    return `${recordType}${cuit}${period}${docType}${posNumber}${invoiceNum}${custDocType}${custDocNumber}${custName}${totalAmount}${taxableAmount}${exemptAmount}${untaxedAmount}${taxAmount}${cae}${caeVto}${invoiceDate}${operationType}`;
  }

  /**
   * Voided/Invalidated Record Format (RCOMP - 03)
   * Records invoices that were voided
   */
  private generateVoidedRecord(invoice: InvoiceForLibroIVA): string {
    const recordType = "03";
    const cuit = this.padRight(this.cuit, 11, " ");
    const period = `${this.fiscalYear}${String(this.fiscalMonth).padStart(2, "0")}`;

    const docType = String(invoice.comprobanteTipo).padStart(2, "0");
    const posNumber = String(invoice.pointOfSale).padStart(5, "0");
    const invoiceNum = String(invoice.invoiceNumber).padStart(8, "0");

    const custDocType = String(invoice.customerDocumentType).padStart(2, "0");
    const custDocNumber = this.padRight(invoice.customerDocument, 20, " ");
    const custName = this.padRight(invoice.customerName, 30, " ");

    const totalAmount = String(Math.round(invoice.totalAmount * 100)).padStart(
      15,
      "0",
    );
    const invoiceDate = this.formatDate(invoice.date);

    return `${recordType}${cuit}${period}${docType}${posNumber}${invoiceNum}${custDocType}${custDocNumber}${custName}${totalAmount}${invoiceDate}`;
  }

  /**
   * Tax Rate Summary Record (RCOMP - 04)
   * Breakdown by tax aliquot
   */
  private generateTaxRateRecord(summary: TaxRateSummary): string {
    const recordType = "04";
    const cuit = this.padRight(this.cuit, 11, " ");
    const period = `${this.fiscalYear}${String(this.fiscalMonth).padStart(2, "0")}`;

    // Tax aliquot ID
    const aliquotId = String(this.getAliquotId(summary.aliquot)).padStart(
      2,
      "0",
    );

    // Amounts
    const baseAmount = String(Math.round(summary.baseAmount * 100)).padStart(
      15,
      "0",
    );
    const taxAmount = String(Math.round(summary.taxAmount * 100)).padStart(
      15,
      "0",
    );

    return `${recordType}${cuit}${period}${aliquotId}${baseAmount}${taxAmount}`;
  }

  /**
   * Footer/Control Record (RCOMP - 05)
   * Final record with totals and validation
   */
  private generateFooterRecord(invoices: InvoiceForLibroIVA[]): string {
    const recordType = "05";
    const cuit = this.padRight(this.cuit, 11, " ");
    const period = `${this.fiscalYear}${String(this.fiscalMonth).padStart(2, "0")}`;

    // Calculate totals
    let totalAmount = 0;
    let totalTaxableAmount = 0;
    let totalTaxAmount = 0;
    let invoiceCount = 0;

    invoices.forEach((inv) => {
      if (inv.status !== "VOIDED") {
        totalAmount += inv.totalAmount;
        totalTaxableAmount += inv.taxableAmount;
        totalTaxAmount += inv.taxAmount;
        invoiceCount++;
      }
    });

    const invCount = String(invoiceCount).padStart(8, "0");
    const totalAmtStr = String(Math.round(totalAmount * 100)).padStart(15, "0");
    const totalTaxableStr = String(
      Math.round(totalTaxableAmount * 100),
    ).padStart(15, "0");
    const totalTaxStr = String(Math.round(totalTaxAmount * 100)).padStart(
      15,
      "0",
    );

    return `${recordType}${cuit}${period}${invCount}${totalAmtStr}${totalTaxableStr}${totalTaxStr}`;
  }

  /**
   * Calculate tax rate breakdown
   */
  private generateTaxRateSummary(
    invoices: InvoiceForLibroIVA[],
  ): TaxRateSummary[] {
    const summaryMap = new Map<number, TaxRateSummary>();

    invoices.forEach((inv) => {
      if (inv.status === "VOIDED") return; // Skip voided

      inv.taxBreakdown.forEach((tax) => {
        const aliquot = tax.aliquot;
        if (!summaryMap.has(aliquot)) {
          summaryMap.set(aliquot, {
            aliquot,
            baseAmount: 0,
            taxAmount: 0,
          });
        }

        const summary = summaryMap.get(aliquot)!;
        summary.baseAmount += tax.baseAmount;
        summary.taxAmount += tax.taxAmount;
      });
    });

    return Array.from(summaryMap.values()).sort(
      (a, b) => a.aliquot - b.aliquot,
    );
  }

  /**
   * Get AFIP tax aliquot ID
   */
  private getAliquotId(rate: number): number {
    const aliquotMap: Record<number, number> = {
      0: 1, // Exento
      10.5: 4, // 10.5%
      21: 3, // 21%
      27: 5, // 27%
    };
    return aliquotMap[rate] || 99; // 99 = undefined
  }

  /**
   * Format date as YYYYMMDD
   */
  private formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}${month}${day}`;
  }

  /**
   * Pad string on the right with spaces
   */
  private padRight(str: string, length: number, char: string): string {
    return (str + char.repeat(length)).substring(0, length);
  }

  /**
   * Generate filename for export
   */
  private generateFileName(): string {
    return `${this.cuit}_${this.fiscalYear}${String(this.fiscalMonth).padStart(2, "0")}_VENTAS_${this.version}.txt`;
  }

  /**
   * Get the generated filename
   */
  getFileName(): string {
    return this.fileName;
  }

  /**
   * Calculate file checksum (SHA256)
   */
  static calculateChecksum(content: string): string {
    const crypto = require("crypto");
    return crypto.createHash("sha256").update(content).digest("hex");
  }
}

interface TaxRateSummary {
  aliquot: number;
  baseAmount: number;
  taxAmount: number;
}

export default LibroIVADigitalExporter;

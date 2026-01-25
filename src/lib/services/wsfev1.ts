/**
 * AFIP WSFEv1 Electronic Invoicing Service
 *
 * Handles:
 * - WSAA authentication (token/signature generation)
 * - CAE request and retrieval
 * - Invoice authorization
 * - Idempotency and error handling
 */

import crypto from "crypto";
import fs from "fs";
import path from "path";

export interface WSAATokenResponse {
  token: string;
  sign: string;
  expiryTime: Date;
}

export interface CAERequestPayload {
  pointOfSale: number;
  invoiceType: number; // 1=A, 6=B, 3=NC A, 7=NC B, etc.
  invoiceSequence: number;
  customerDocumentType: number; // 80=CUIT, 96=DNI, 94=PASSPORT
  customerDocumentNumber: string;
  customerName: string;
  invoiceDate: string; // YYYYMMDD
  taxableAmount: number;
  taxAmount: number;
  totalAmount: number;
  taxAliquots: Array<{
    id: number; // 3=21%, 4=10.5%, etc.
    baseAmount: number;
    taxAmount: number;
  }>;
  exemptAmount?: number;
  untaxedAmount?: number;
  conceptType?: number; // 1=products, 2=services, 3=both
  relatedDocuments?: Array<{
    type: number;
    number: string;
    date: string;
  }>;
}

export interface CAEResponse {
  cae: string;
  caeVto: string; // CAE expiry (YYYYMMDD)
  processingMode: string;
}

export interface CAEErrorResponse {
  errorCode: string;
  errorMessage: string;
  errorDetails?: Record<string, any>;
}

/**
 * WSFEv1 Service - Electronic Invoicing Integration
 */
export class WSFEv1Service {
  private wsaaUrl: string;
  private wsfev1Url: string;
  private cuit: string;
  private certificatePath: string;
  private keyPath: string;
  private environment: "production" | "testing";

  constructor(config: {
    wsaaUrl: string;
    wsfev1Url: string;
    cuit: string;
    certificatePath: string;
    keyPath: string;
    environment?: "production" | "testing";
  }) {
    this.wsaaUrl = config.wsaaUrl;
    this.wsfev1Url = config.wsfev1Url;
    this.cuit = config.cuit;
    this.certificatePath = config.certificatePath;
    this.keyPath = config.keyPath;
    this.environment = config.environment || "testing";
  }

  /**
   * Get WSAA Token (LoginCMS)
   * Authenticates with AFIP and retrieves a token for subsequent requests
   */
  async getWsaaToken(): Promise<WSAATokenResponse> {
    try {
      // Read certificate and key
      const certificate = fs.readFileSync(this.certificatePath, "utf8");
      const privateKey = fs.readFileSync(this.keyPath, "utf8");

      // Create the ticket XML to sign
      const now = new Date();
      const expiryTime = new Date(now.getTime() + 12 * 60 * 60 * 1000); // 12 hours

      const ticketXml = this.createLoginTicket(now, expiryTime);

      // Sign the ticket
      const signature = this.signXml(ticketXml, privateKey);

      // Create the SOAP request
      const soapRequest = this.createLoginCMSSoapRequest(
        certificate,
        signature,
        ticketXml,
      );

      // Make the SOAP call (simplified - in production use proper SOAP client)
      const response = await this.soapCall(this.wsaaUrl, soapRequest);

      // Parse response and extract token/signature
      const token = this.extractFromXml(response, "token");
      const sign = this.extractFromXml(response, "sign");

      return {
        token,
        sign,
        expiryTime,
      };
    } catch (error) {
      throw new Error(`WSAA Authentication failed: ${error}`);
    }
  }

  /**
   * Request CAE (FECAESolicitar)
   * Requests CAE authorization for an invoice
   */
  async requestCAE(
    token: string,
    sign: string,
    payload: CAERequestPayload,
  ): Promise<CAEResponse | CAEErrorResponse> {
    try {
      const soapRequest = this.createFECAESolicitarRequest(
        token,
        sign,
        payload,
      );

      const response = await this.soapCall(this.wsfev1Url, soapRequest);

      // Parse response
      if (this.isErrorResponse(response)) {
        return {
          errorCode: this.extractFromXml(response, "AppErrorCode"),
          errorMessage: this.extractFromXml(response, "AppErrorMessage"),
          errorDetails: this.parseErrorDetails(response),
        };
      }

      return {
        cae: this.extractFromXml(response, "CAE"),
        caeVto: this.extractFromXml(response, "CAEVto"),
        processingMode: this.extractFromXml(response, "Procesamiento"),
      };
    } catch (error) {
      throw new Error(`CAE request failed: ${error}`);
    }
  }

  /**
   * Get Last Authorized Invoice Number (FECompUltimoAutorizado)
   * Retrieves the last authorized invoice number for a given type and POS
   */
  async getLastAuthorizedNumber(
    token: string,
    sign: string,
    pointOfSale: number,
    invoiceType: number,
  ): Promise<number> {
    try {
      const soapRequest = this.createFECompUltimoAutorizadoRequest(
        token,
        sign,
        pointOfSale,
        invoiceType,
      );

      const response = await this.soapCall(this.wsfev1Url, soapRequest);

      if (this.isErrorResponse(response)) {
        throw new Error(
          `Failed to get last number: ${this.extractFromXml(response, "AppErrorMessage")}`,
        );
      }

      return parseInt(this.extractFromXml(response, "LastCBNumber"), 10);
    } catch (error) {
      throw new Error(`Get last invoice number failed: ${error}`);
    }
  }

  /**
   * Query CAE Status (FECompConsultar)
   * Used for idempotency - check if a CAE was already issued
   */
  async queryCaeStatus(
    token: string,
    sign: string,
    pointOfSale: number,
    invoiceType: number,
    invoiceNumber: number,
  ): Promise<{ cae: string; caeVto: string } | null> {
    try {
      const soapRequest = this.createFECompConsultarRequest(
        token,
        sign,
        pointOfSale,
        invoiceType,
        invoiceNumber,
      );

      const response = await this.soapCall(this.wsfev1Url, soapRequest);

      if (this.isErrorResponse(response)) {
        // Invoice not found or other error
        return null;
      }

      const cae = this.extractFromXml(response, "CAE");
      if (!cae) return null;

      return {
        cae,
        caeVto: this.extractFromXml(response, "CAEVto"),
      };
    } catch (error) {
      console.error(`Query CAE status failed: ${error}`);
      return null;
    }
  }

  /**
   * Create a SOAP request for LoginCMS
   */
  private createLoginCMSSoapRequest(
    certificate: string,
    signature: string,
    ticketXml: string,
  ): string {
    return `<?xml version="1.0" encoding="UTF-8"?>
<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
  <soap:Body>
    <LoginCMS xmlns="http://ar.gov.afip.wsaa">
      <in0>${ticketXml}</in0>
    </LoginCMS>
  </soap:Body>
</soap:Envelope>`;
  }

  /**
   * Create SOAP request for FECAESolicitar
   */
  private createFECAESolicitarRequest(
    token: string,
    sign: string,
    payload: CAERequestPayload,
  ): string {
    const taxAliquots = payload.taxAliquots
      .map(
        (tax) => `
      <AlicIva>
        <Id>${tax.id}</Id>
        <BaseImp>${Math.round(tax.baseAmount * 100) / 100}</BaseImp>
        <PercepIVA>${Math.round(tax.taxAmount * 100) / 100}</PercepIVA>
      </AlicIva>`,
      )
      .join("");

    return `<?xml version="1.0" encoding="UTF-8"?>
<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
  <soap:Body>
    <FECAESolicitar xmlns="http://ar.gov.afip.dif.wsfev1">
      <Auth>
        <Token>${token}</Token>
        <Sign>${sign}</Sign>
        <Cuit>${this.cuit}</Cuit>
      </Auth>
      <FeCompConsReq>
        <FECompConsReqArray>
          <FECompConsReq>
            <CbteNbr>${payload.invoiceSequence}</CbteNbr>
            <CbteTipo>${payload.invoiceType}</CbteTipo>
            <CbtePtoVta>${payload.pointOfSale}</CbtePtoVta>
            <DocTipo>${payload.customerDocumentType}</DocTipo>
            <DocNro>${payload.customerDocumentNumber}</DocNro>
            <CbteDate>${payload.invoiceDate}</CbteDate>
            <ImpTotal>${Math.round(payload.totalAmount * 100) / 100}</ImpTotal>
            <ImpTotConc>0</ImpTotConc>
            <ImpNeto>${Math.round(payload.taxableAmount * 100) / 100}</ImpNeto>
            <ImpOpEx>${Math.round((payload.exemptAmount || 0) * 100) / 100}</ImpOpEx>
            <ImpTrib>0</ImpTrib>
            <ImpIVA>${Math.round(payload.taxAmount * 100) / 100}</ImpIVA>
            <ImpNoGrav>${Math.round((payload.untaxedAmount || 0) * 100) / 100}</ImpNoGrav>
            <Concepto>${payload.conceptType || 1}</Concepto>
            <MonId>PES</MonId>
            <MonCotiz>1</MonCotiz>
            ${this.buildAliquotsXml(taxAliquots)}
          </FECompConsReq>
        </FECompConsReqArray>
      </FeCompConsReq>
    </FECAESolicitar>
  </soap:Body>
</soap:Envelope>`;
  }

  /**
   * Create SOAP request for FECompUltimoAutorizado
   */
  private createFECompUltimoAutorizadoRequest(
    token: string,
    sign: string,
    pointOfSale: number,
    invoiceType: number,
  ): string {
    return `<?xml version="1.0" encoding="UTF-8"?>
<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
  <soap:Body>
    <FECompUltimoAutorizado xmlns="http://ar.gov.afip.dif.wsfev1">
      <Auth>
        <Token>${token}</Token>
        <Sign>${sign}</Sign>
        <Cuit>${this.cuit}</Cuit>
      </Auth>
      <PtoVta>${pointOfSale}</PtoVta>
      <CbteTipo>${invoiceType}</CbteTipo>
    </FECompUltimoAutorizado>
  </soap:Body>
</soap:Envelope>`;
  }

  /**
   * Create SOAP request for FECompConsultar (query status)
   */
  private createFECompConsultarRequest(
    token: string,
    sign: string,
    pointOfSale: number,
    invoiceType: number,
    invoiceNumber: number,
  ): string {
    return `<?xml version="1.0" encoding="UTF-8"?>
<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
  <soap:Body>
    <FECompConsultar xmlns="http://ar.gov.afip.dif.wsfev1">
      <Auth>
        <Token>${token}</Token>
        <Sign>${sign}</Sign>
        <Cuit>${this.cuit}</Cuit>
      </Auth>
      <FeCompConsReq>
        <CbteNbr>${invoiceNumber}</CbteNbr>
        <CbteTipo>${invoiceType}</CbteTipo>
        <CbtePtoVta>${pointOfSale}</CbtePtoVta>
      </FeCompConsReq>
    </FECompConsultar>
  </soap:Body>
</soap:Envelope>`;
  }

  /**
   * Create the XML ticket for WSAA authentication
   */
  private createLoginTicket(now: Date, expiryTime: Date): string {
    const formatDate = (date: Date) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      const hours = String(date.getHours()).padStart(2, "0");
      const minutes = String(date.getMinutes()).padStart(2, "0");
      const seconds = String(date.getSeconds()).padStart(2, "0");
      return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
    };

    return `<?xml version="1.0" encoding="UTF-8"?>
<loginTicketRequest version="1.0">
  <header>
    <uniqueId>${Date.now()}</uniqueId>
    <generationTime>${formatDate(now)}</generationTime>
    <expirationTime>${formatDate(expiryTime)}</expirationTime>
  </header>
  <service>wsfe</service>
</loginTicketRequest>`;
  }

  /**
   * Sign XML with private key
   */
  private signXml(xml: string, privateKey: string): string {
    const sign = crypto.createSign("RSA-SHA256");
    sign.update(xml);
    return sign.sign(privateKey, "base64");
  }

  /**
   * Build XML for tax aliquots
   */
  private buildAliquotsXml(aliquots: string): string {
    if (!aliquots.trim()) {
      return "<IvaArray><AlicIva><Id>3</Id><BaseImp>0</BaseImp><PercepIVA>0</PercepIVA></AlicIva></IvaArray>";
    }
    return `<IvaArray>${aliquots}</IvaArray>`;
  }

  /**
   * Extract value from XML response
   */
  private extractFromXml(xml: string, tag: string): string {
    const regex = new RegExp(`<${tag}[^>]*>([^<]+)</${tag}>`);
    const match = xml.match(regex);
    return match ? match[1] : "";
  }

  /**
   * Check if response is an error
   */
  private isErrorResponse(xml: string): boolean {
    return (
      xml.includes("Errors") ||
      xml.includes("AppError") ||
      xml.includes("faultstring")
    );
  }

  /**
   * Parse error details from XML response
   */
  private parseErrorDetails(xml: string): Record<string, any> {
    const details: Record<string, any> = {};
    const errorCodeMatch = xml.match(/<AppErrorCode>(\d+)<\/AppErrorCode>/);
    const errorMsgMatch = xml.match(
      /<AppErrorMessage>([^<]+)<\/AppErrorMessage>/,
    );

    if (errorCodeMatch) details.code = errorCodeMatch[1];
    if (errorMsgMatch) details.message = errorMsgMatch[1];

    return details;
  }

  /**
   * Make SOAP call (simplified - would use proper SOAP client library in production)
   */
  private async soapCall(url: string, soapRequest: string): Promise<string> {
    // In production, use a proper SOAP client library
    // This is a placeholder that would be implemented with proper HTTP/SOAP handling
    // For now, returning empty response - would integrate with actual AFIP endpoints
    console.log(`[WSFEV1] SOAP Call to ${url}`);
    console.log(`[WSFEV1] Request: ${soapRequest.substring(0, 100)}...`);

    // TODO: Implement actual HTTP POST with proper SOAP library
    // Would look something like:
    // const response = await fetch(url, {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'text/xml; charset=utf-8', 'SOAPAction': '' },
    //   body: soapRequest,
    // });
    // return response.text();

    return "";
  }
}

export default WSFEv1Service;

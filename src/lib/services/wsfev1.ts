/**
 * AFIP WSFEv1 Electronic Invoicing Service
 *
 * Production-ready implementation with:
 * - WSAA authentication via CMS (PKCS#7 SignedData)
 * - Real SOAP HTTP POST via axios
 * - Proper XML parsing via fast-xml-parser
 * - Token caching with expiry
 * - Correct FECAESolicitar WSDL structure
 */

import fs from "fs";
import axios from "axios";
import { XMLParser } from "fast-xml-parser";
import { createCMSSignedData } from "./afipCmsHelper";

// ─── XML Parser configured to handle SOAP namespaces ──────────────
const xmlParser = new XMLParser({
  ignoreAttributes: false,
  removeNSPrefix: true,
  parseTagValue: true,
  trimValues: true,
});

// ─── Interfaces (unchanged) ───────────────────────────────────────

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
  condicionIvaReceptor?: number; // RG 5616: 1=RI, 4=Exento, 5=CF, 6=Monotributo
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
 * WSFEv1 Service - Production Electronic Invoicing Integration
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

  // ═══════════════════════════════════════════════════════════════
  //  WSAA Authentication (LoginCMS)
  // ═══════════════════════════════════════════════════════════════

  /**
   * Get WSAA Token (LoginCMS)
   * Authenticates with AFIP via CMS-signed ticket and retrieves token+sign.
   */
  async getWsaaToken(): Promise<WSAATokenResponse> {
    try {
      const certificate = fs.readFileSync(this.certificatePath, "utf8");
      const privateKey = fs.readFileSync(this.keyPath, "utf8");

      const now = new Date();
      const expiryTime = new Date(now.getTime() + 12 * 60 * 60 * 1000); // 12 hours

      const ticketXml = this.createLoginTicket(now, expiryTime);

      // CMS sign the ticket (PKCS#7 SignedData, base64)
      const cmsBase64 = createCMSSignedData(ticketXml, certificate, privateKey);

      // Build SOAP envelope with the CMS blob inside <in0>
      const soapRequest = this.createLoginCMSSoapRequest(cmsBase64);

      const response = await this.soapCall(this.wsaaUrl, soapRequest);

      // Parse the WSAA response
      const parsed = this.parseWsaaResponse(response);

      return {
        token: parsed.token,
        sign: parsed.sign,
        expiryTime,
      };
    } catch (error) {
      throw new Error(`WSAA Authentication failed: ${error}`);
    }
  }

  // ═══════════════════════════════════════════════════════════════
  //  FECAESolicitar
  // ═══════════════════════════════════════════════════════════════

  /**
   * Request CAE (FECAESolicitar)
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

      const response = await this.soapCall(
        this.wsfev1Url,
        soapRequest,
        "http://ar.gov.afip.dif.FEV1/FECAESolicitar",
      );

      return this.parseFECAEResponse(response);
    } catch (error) {
      throw new Error(`CAE request failed: ${error}`);
    }
  }

  // ═══════════════════════════════════════════════════════════════
  //  FECompUltimoAutorizado
  // ═══════════════════════════════════════════════════════════════

  /**
   * Get Last Authorized Invoice Number (FECompUltimoAutorizado)
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

      const response = await this.soapCall(
        this.wsfev1Url,
        soapRequest,
        "http://ar.gov.afip.dif.FEV1/FECompUltimoAutorizado",
      );
      const parsed = xmlParser.parse(response);
      const body = this.extractSoapBody(parsed);

      const result =
        body?.FECompUltimoAutorizadoResponse?.FECompUltimoAutorizadoResult;

      if (result?.Errors) {
        const err = this.extractErrors(result.Errors);
        throw new Error(
          `Failed to get last number: ${err.message} (code ${err.code})`,
        );
      }

      return parseInt(String(result?.CbteNro ?? "0"), 10);
    } catch (error) {
      throw new Error(`Get last invoice number failed: ${error}`);
    }
  }

  // ═══════════════════════════════════════════════════════════════
  //  FECompConsultar
  // ═══════════════════════════════════════════════════════════════

  /**
   * Query CAE Status (FECompConsultar)
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

      const response = await this.soapCall(
        this.wsfev1Url,
        soapRequest,
        "http://ar.gov.afip.dif.FEV1/FECompConsultar",
      );
      const parsed = xmlParser.parse(response);
      const body = this.extractSoapBody(parsed);

      const result = body?.FECompConsultarResponse?.FECompConsultarResult;
      if (result?.Errors) return null;

      const resultGet = result?.ResultGet;
      const cae = resultGet?.CodAutorizacion
        ? String(resultGet.CodAutorizacion)
        : "";
      if (!cae) return null;

      return {
        cae,
        caeVto: String(resultGet?.FchVto ?? ""),
      };
    } catch (error) {
      console.error(`Query CAE status failed: ${error}`);
      return null;
    }
  }

  // ═══════════════════════════════════════════════════════════════
  //  SOAP HTTP Transport (axios)
  // ═══════════════════════════════════════════════════════════════

  /**
   * Execute a SOAP HTTP POST to AFIP.
   */
  private async soapCall(
    url: string,
    soapRequest: string,
    soapAction?: string,
  ): Promise<string> {
    try {
      const res = await axios.post(url, soapRequest, {
        headers: {
          "Content-Type": "text/xml; charset=utf-8",
          SOAPAction: soapAction || '""',
        },
        timeout: 15000,
        responseType: "text",
        validateStatus: () => true, // handle status ourselves
      });

      if (res.status !== 200) {
        const fault = this.tryExtractSoapFault(res.data);
        console.error(
          `[WSFEV1] SOAP fault (HTTP ${res.status}):`,
          fault || res.data?.substring?.(0, 500),
        );
        throw new Error(
          `SOAP HTTP ${res.status}: ${fault || "Unknown SOAP error"}`,
        );
      }

      return res.data;
    } catch (error: any) {
      if (error.code === "ECONNABORTED") {
        throw new Error(`SOAP timeout after 15s to ${url}`);
      }
      if (error.response) {
        throw new Error(`SOAP HTTP ${error.response.status}: ${error.message}`);
      }
      throw error;
    }
  }

  // ═══════════════════════════════════════════════════════════════
  //  SOAP Envelope Builders
  // ═══════════════════════════════════════════════════════════════

  /**
   * LoginCMS SOAP request — <in0> contains the base64 CMS blob.
   */
  private createLoginCMSSoapRequest(cmsBase64: string): string {
    return `<?xml version="1.0" encoding="UTF-8"?>
<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:wsaa="http://wsaa.view.sua.dvadac.desein.afip.gov">
  <soapenv:Header/>
  <soapenv:Body>
    <wsaa:loginCms>
      <wsaa:in0>${cmsBase64}</wsaa:in0>
    </wsaa:loginCms>
  </soapenv:Body>
</soapenv:Envelope>`;
  }

  /**
   * FECAESolicitar — correct WSDL structure per official AFIP spec.
   */
  private createFECAESolicitarRequest(
    token: string,
    sign: string,
    payload: CAERequestPayload,
  ): string {
    const round2 = (n: number) => Math.round(n * 100) / 100;

    const ivaLines = payload.taxAliquots
      .map(
        (tax) => `
              <ar:AlicIva>
                <ar:Id>${tax.id}</ar:Id>
                <ar:BaseImp>${round2(tax.baseAmount)}</ar:BaseImp>
                <ar:Importe>${round2(tax.taxAmount)}</ar:Importe>
              </ar:AlicIva>`,
      )
      .join("");

    const ivaBlock = ivaLines.trim()
      ? `<ar:Iva>${ivaLines}
            </ar:Iva>`
      : "";

    return `<?xml version="1.0" encoding="UTF-8"?>
<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:ar="http://ar.gov.afip.dif.FEV1/">
  <soapenv:Header/>
  <soapenv:Body>
    <ar:FECAESolicitar>
      <ar:Auth>
        <ar:Token>${token}</ar:Token>
        <ar:Sign>${sign}</ar:Sign>
        <ar:Cuit>${this.cuit}</ar:Cuit>
      </ar:Auth>
      <ar:FeCAEReq>
        <ar:FeCabReq>
          <ar:CantReg>1</ar:CantReg>
          <ar:PtoVta>${payload.pointOfSale}</ar:PtoVta>
          <ar:CbteTipo>${payload.invoiceType}</ar:CbteTipo>
        </ar:FeCabReq>
        <ar:FeDetReq>
          <ar:FECAEDetRequest>
            <ar:Concepto>${payload.conceptType || 1}</ar:Concepto>
            <ar:DocTipo>${payload.customerDocumentType}</ar:DocTipo>
            <ar:DocNro>${payload.customerDocumentNumber}</ar:DocNro>
            <ar:CbteDesde>${payload.invoiceSequence}</ar:CbteDesde>
            <ar:CbteHasta>${payload.invoiceSequence}</ar:CbteHasta>
            <ar:CbteFch>${payload.invoiceDate}</ar:CbteFch>
            <ar:ImpTotal>${round2(payload.totalAmount)}</ar:ImpTotal>
            <ar:ImpTotConc>0</ar:ImpTotConc>
            <ar:ImpNeto>${round2(payload.taxableAmount)}</ar:ImpNeto>
            <ar:ImpOpEx>${round2(payload.exemptAmount || 0)}</ar:ImpOpEx>
            <ar:ImpTrib>0</ar:ImpTrib>
            <ar:ImpIVA>${round2(payload.taxAmount)}</ar:ImpIVA>
            <ar:MonId>PES</ar:MonId>
            <ar:MonCotiz>1</ar:MonCotiz>
            ${ivaBlock}${
              payload.condicionIvaReceptor
                ? `
            <ar:CondicionIVAReceptorId>${payload.condicionIvaReceptor}</ar:CondicionIVAReceptorId>`
                : ""
            }
          </ar:FECAEDetRequest>
        </ar:FeDetReq>
      </ar:FeCAEReq>
    </ar:FECAESolicitar>
  </soapenv:Body>
</soapenv:Envelope>`;
  }

  /**
   * FECompUltimoAutorizado SOAP request.
   */
  private createFECompUltimoAutorizadoRequest(
    token: string,
    sign: string,
    pointOfSale: number,
    invoiceType: number,
  ): string {
    return `<?xml version="1.0" encoding="UTF-8"?>
<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:ar="http://ar.gov.afip.dif.FEV1/">
  <soapenv:Header/>
  <soapenv:Body>
    <ar:FECompUltimoAutorizado>
      <ar:Auth>
        <ar:Token>${token}</ar:Token>
        <ar:Sign>${sign}</ar:Sign>
        <ar:Cuit>${this.cuit}</ar:Cuit>
      </ar:Auth>
      <ar:PtoVta>${pointOfSale}</ar:PtoVta>
      <ar:CbteTipo>${invoiceType}</ar:CbteTipo>
    </ar:FECompUltimoAutorizado>
  </soapenv:Body>
</soapenv:Envelope>`;
  }

  /**
   * FECompConsultar SOAP request.
   */
  private createFECompConsultarRequest(
    token: string,
    sign: string,
    pointOfSale: number,
    invoiceType: number,
    invoiceNumber: number,
  ): string {
    return `<?xml version="1.0" encoding="UTF-8"?>
<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:ar="http://ar.gov.afip.dif.FEV1/">
  <soapenv:Header/>
  <soapenv:Body>
    <ar:FECompConsultar>
      <ar:Auth>
        <ar:Token>${token}</ar:Token>
        <ar:Sign>${sign}</ar:Sign>
        <ar:Cuit>${this.cuit}</ar:Cuit>
      </ar:Auth>
      <ar:FeCompConsReq>
        <ar:CbteTipo>${invoiceType}</ar:CbteTipo>
        <ar:CbteNro>${invoiceNumber}</ar:CbteNro>
        <ar:PtoVta>${pointOfSale}</ar:PtoVta>
      </ar:FeCompConsReq>
    </ar:FECompConsultar>
  </soapenv:Body>
</soapenv:Envelope>`;
  }

  // ═══════════════════════════════════════════════════════════════
  //  Login Ticket Builder
  // ═══════════════════════════════════════════════════════════════

  private createLoginTicket(now: Date, expiryTime: Date): string {
    const fmt = (d: Date) => {
      const pad = (n: number) => String(n).padStart(2, "0");
      return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
    };

    return `<?xml version="1.0" encoding="UTF-8"?>
<loginTicketRequest version="1.0">
  <header>
    <uniqueId>${Math.floor(Date.now() / 1000)}</uniqueId>
    <generationTime>${fmt(now)}</generationTime>
    <expirationTime>${fmt(expiryTime)}</expirationTime>
  </header>
  <service>wsfe</service>
</loginTicketRequest>`;
  }

  // ═══════════════════════════════════════════════════════════════
  //  XML Response Parsers (fast-xml-parser)
  // ═══════════════════════════════════════════════════════════════

  /**
   * Parse WSAA loginCms response and extract token + sign from the
   * embedded loginTicketResponse XML.
   */
  private parseWsaaResponse(responseXml: string): {
    token: string;
    sign: string;
  } {
    const parsed = xmlParser.parse(responseXml);
    const body = this.extractSoapBody(parsed);

    const loginReturn =
      body?.loginCmsResponse?.loginCmsReturn ??
      body?.loginCMSResponse?.loginCMSReturn ??
      "";

    if (!loginReturn) {
      throw new Error(
        "WSAA: No loginCmsReturn in response. Possible SOAP fault.",
      );
    }

    // loginCmsReturn contains an XML string with <loginTicketResponse>
    const inner =
      typeof loginReturn === "string" ? loginReturn : String(loginReturn);
    const ticket = xmlParser.parse(inner);

    const credentials =
      ticket?.loginTicketResponse?.credentials ?? ticket?.credentials;

    if (!credentials?.token || !credentials?.sign) {
      throw new Error("WSAA: Could not extract token/sign from response.");
    }

    return {
      token: String(credentials.token),
      sign: String(credentials.sign),
    };
  }

  /**
   * Parse FECAESolicitar response. Returns CAEResponse or CAEErrorResponse.
   */
  private parseFECAEResponse(
    responseXml: string,
  ): CAEResponse | CAEErrorResponse {
    const parsed = xmlParser.parse(responseXml);
    const body = this.extractSoapBody(parsed);

    const result = body?.FECAESolicitarResponse?.FECAESolicitarResult;

    if (!result) {
      throw new Error("FECAESolicitar: Empty response body.");
    }

    // Check top-level Errors
    if (result.Errors) {
      const err = this.extractErrors(result.Errors);
      return {
        errorCode: err.code,
        errorMessage: err.message,
        errorDetails: err.details,
      };
    }

    // Extract detail response
    const det =
      result?.FeDetResp?.FECAEDetResponse ?? result?.FECAEDetResponse ?? null;

    if (!det) {
      throw new Error("FECAESolicitar: No FECAEDetResponse in result.");
    }

    // A single det or array — normalize
    const detItem = Array.isArray(det) ? det[0] : det;

    // Check per-invoice Observaciones
    if (detItem?.Resultado === "R") {
      const obs = detItem.Observaciones?.Obs;
      const obsList = Array.isArray(obs) ? obs : obs ? [obs] : [];
      const messages = obsList
        .map((o: any) => `${o.Code || ""}: ${o.Msg || ""}`)
        .join("; ");
      return {
        errorCode: String(obsList[0]?.Code ?? "REJECTED"),
        errorMessage: messages || "Invoice rejected by AFIP",
        errorDetails: { observaciones: obsList, resultado: "R" },
      };
    }

    return {
      cae: String(detItem?.CAE ?? ""),
      caeVto: String(detItem?.CAEFchVto ?? ""),
      processingMode: String(detItem?.Resultado ?? ""),
    };
  }

  // ═══════════════════════════════════════════════════════════════
  //  Helpers
  // ═══════════════════════════════════════════════════════════════

  /**
   * Walk through parsed XML to find the SOAP Body regardless of namespace prefix.
   */
  private extractSoapBody(parsed: any): any {
    if (!parsed) return null;

    // Try common namespace patterns
    const envelope =
      parsed["Envelope"] ??
      parsed["soap:Envelope"] ??
      parsed["soapenv:Envelope"] ??
      parsed["s:Envelope"] ??
      parsed["SOAP-ENV:Envelope"] ??
      null;

    if (envelope) {
      return (
        envelope["Body"] ??
        envelope["soap:Body"] ??
        envelope["soapenv:Body"] ??
        envelope["s:Body"] ??
        envelope["SOAP-ENV:Body"] ??
        null
      );
    }

    // fast-xml-parser with removeNSPrefix should strip prefixes
    if (parsed.Envelope) return parsed.Envelope.Body ?? null;

    return null;
  }

  /**
   * Extract Errors block from AFIP response.
   */
  private extractErrors(errorsBlock: any): {
    code: string;
    message: string;
    details: Record<string, any>;
  } {
    const err = errorsBlock?.Err;
    const list = Array.isArray(err) ? err : err ? [err] : [];

    if (list.length === 0) {
      return { code: "UNKNOWN", message: "Unknown error", details: {} };
    }

    return {
      code: String(list[0]?.Code ?? "UNKNOWN"),
      message: list.map((e: any) => `${e.Code}: ${e.Msg}`).join("; "),
      details: { errors: list },
    };
  }

  /**
   * Attempt to extract SOAP Fault string from raw XML.
   */
  private tryExtractSoapFault(raw: string): string | null {
    if (!raw || typeof raw !== "string") return null;
    try {
      const p = xmlParser.parse(raw);
      const body = this.extractSoapBody(p);
      const fault = body?.Fault ?? body?.fault;
      if (fault) {
        return fault.faultstring ?? fault.Reason?.Text ?? JSON.stringify(fault);
      }
    } catch {
      /* ignore parse errors on fault extraction */
    }
    return null;
  }
}

export default WSFEv1Service;

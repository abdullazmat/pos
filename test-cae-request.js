// Simulate what runArcaRetry does, step by step
const mongoose = require("mongoose");
const fs = require("fs");
const axios = require("axios");
const { XMLParser } = require("fast-xml-parser");

const xmlParser = new XMLParser({
  ignoreAttributes: false,
  removeNSPrefix: true,
  parseTagValue: true,
  trimValues: true,
});

async function main() {
  await mongoose.connect(
    "mongodb+srv://abdullahazmat945_db_user:4HyOSIHz8uTaa1Ku@cluster0.icehkit.mongodb.net/?appName=Cluster0",
  );

  // 1. Load config (same as getServiceConfig)
  const FiscalConfig = mongoose.connection.collection("fiscalconfigurations");
  const fiscal = await FiscalConfig.findOne({
    "certificateDigital.storagePath": { $exists: true },
    "privateKey.storagePath": { $exists: true },
  });

  if (!fiscal) {
    console.log("No fiscal config with cert paths found");
    await mongoose.disconnect();
    return;
  }

  const cuit = fiscal.cuit || fiscal.fiscalId || "20463101028";
  const certPath = fiscal.certificateDigital?.storagePath;
  const keyPath = fiscal.privateKey?.storagePath;

  console.log("Config:");
  console.log("  CUIT:", cuit);
  console.log("  CertPath:", certPath);
  console.log("  KeyPath:", keyPath);
  console.log("  WsaaToken cached:", !!fiscal.wsaaToken?.token);

  // 2. Check cached token
  let token, sign;
  if (fiscal.wsaaToken?.token && fiscal.wsaaToken?.expiryTime) {
    const expiry = new Date(fiscal.wsaaToken.expiryTime);
    const remaining = (expiry.getTime() - Date.now()) / 1000 / 60;
    console.log("  Token expires in:", Math.round(remaining), "minutes");
    if (remaining > 10) {
      token = fiscal.wsaaToken.token;
      sign = fiscal.wsaaToken.sign;
      console.log("  Using cached token");
    }
  }

  if (!token) {
    console.log("  No valid cached token, need fresh auth");
    await mongoose.disconnect();
    return;
  }

  // 3. Test FECompUltimoAutorizado
  console.log("\n--- FECompUltimoAutorizado (PtoVta=1, CbteTipo=6) ---");
  const lastAuthSoap = `<?xml version="1.0" encoding="UTF-8"?>
<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/"
                  xmlns:ar="http://ar.gov.afip.dif.FEV1/">
  <soapenv:Body>
    <ar:FECompUltimoAutorizado>
      <ar:Auth>
        <ar:Token>${token}</ar:Token>
        <ar:Sign>${sign}</ar:Sign>
        <ar:Cuit>${cuit}</ar:Cuit>
      </ar:Auth>
      <ar:PtoVta>1</ar:PtoVta>
      <ar:CbteTipo>6</ar:CbteTipo>
    </ar:FECompUltimoAutorizado>
  </soapenv:Body>
</soapenv:Envelope>`;

  const resp1 = await axios.post(
    "https://wswhomo.afip.gov.ar/wsfev1/service.asmx",
    lastAuthSoap,
    {
      headers: {
        "Content-Type": "text/xml; charset=utf-8",
        SOAPAction: "http://ar.gov.afip.dif.FEV1/FECompUltimoAutorizado",
      },
      timeout: 30000,
    },
  );
  const parsed1 = xmlParser.parse(resp1.data);
  const result1 =
    parsed1?.Envelope?.Body?.FECompUltimoAutorizadoResponse
      ?.FECompUltimoAutorizadoResult;
  console.log("Last authorized:", result1?.CbteNro);

  // 4. Load a pending invoice
  const Invoice = mongoose.connection.collection("invoices");
  const invoice = await Invoice.findOne(
    { channel: "ARCA", status: "PENDING_CAE" },
    { sort: { createdAt: -1 } },
  );
  if (!invoice) {
    console.log("No pending invoices");
    await mongoose.disconnect();
    return;
  }

  console.log("\n--- Pending Invoice ---");
  console.log("  Number:", invoice.invoiceNumber);
  console.log("  CustomerCuit:", invoice.customerCuit);
  console.log("  Subtotal:", invoice.subtotal);
  console.log("  TaxAmount:", invoice.taxAmount);
  console.log("  TotalAmount:", invoice.totalAmount);

  // 5. Try FECAESolicitar
  const correctSequence = (result1?.CbteNro || 0) + 1;
  const customerCuit = (invoice.customerCuit || "").replace(/\D/g, "");
  // For Factura B (tipo 6), always use DocTipo 99 (Sin identificar) / DocNro 0
  // This avoids AFIP error 10069 (DocNro same as issuer)
  const docTipo = 99;
  const docNro = "0";

  const now = new Date();
  const invoiceDate = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}`;

  const taxableAmount = Math.max(
    0,
    Number(invoice.subtotal || 0) - Number(invoice.discountAmount || 0),
  );
  const taxAmount = Number(invoice.taxAmount || 0);
  const totalAmount = Number(invoice.totalAmount || 0);

  const round2 = (n) => Math.round(n * 100) / 100;

  console.log("\n--- FECAESolicitar ---");
  console.log("  Sequence:", correctSequence);
  console.log("  DocTipo:", docTipo, "DocNro:", docNro);
  console.log("  Date:", invoiceDate);
  console.log("  TaxableAmount:", round2(taxableAmount));
  console.log("  TaxAmount:", round2(taxAmount));
  console.log("  TotalAmount:", round2(totalAmount));

  const caeSoap = `<?xml version="1.0" encoding="UTF-8"?>
<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:ar="http://ar.gov.afip.dif.FEV1/">
  <soapenv:Header/>
  <soapenv:Body>
    <ar:FECAESolicitar>
      <ar:Auth>
        <ar:Token>${token}</ar:Token>
        <ar:Sign>${sign}</ar:Sign>
        <ar:Cuit>${cuit}</ar:Cuit>
      </ar:Auth>
      <ar:FeCAEReq>
        <ar:FeCabReq>
          <ar:CantReg>1</ar:CantReg>
          <ar:PtoVta>1</ar:PtoVta>
          <ar:CbteTipo>6</ar:CbteTipo>
        </ar:FeCabReq>
        <ar:FeDetReq>
          <ar:FECAEDetRequest>
            <ar:Concepto>1</ar:Concepto>
            <ar:DocTipo>${docTipo}</ar:DocTipo>
            <ar:DocNro>${docNro}</ar:DocNro>
            <ar:CbteDesde>${correctSequence}</ar:CbteDesde>
            <ar:CbteHasta>${correctSequence}</ar:CbteHasta>
            <ar:CbteFch>${invoiceDate}</ar:CbteFch>
            <ar:ImpTotal>${round2(totalAmount)}</ar:ImpTotal>
            <ar:ImpTotConc>0</ar:ImpTotConc>
            <ar:ImpNeto>${round2(taxableAmount)}</ar:ImpNeto>
            <ar:ImpOpEx>0</ar:ImpOpEx>
            <ar:ImpTrib>0</ar:ImpTrib>
            <ar:ImpIVA>${round2(taxAmount)}</ar:ImpIVA>
            <ar:MonId>PES</ar:MonId>
            <ar:MonCotiz>1</ar:MonCotiz>
            <Iva>
              <AlicIva>
                <Id>5</Id>
                <BaseImp>${round2(taxableAmount)}</BaseImp>
                <Importe>${round2(taxAmount)}</Importe>
              </AlicIva>
            </Iva>
          </ar:FECAEDetRequest>
        </ar:FeDetReq>
      </ar:FeCAEReq>
    </ar:FECAESolicitar>
  </soapenv:Body>
</soapenv:Envelope>`;

  try {
    const resp2 = await axios.post(
      "https://wswhomo.afip.gov.ar/wsfev1/service.asmx",
      caeSoap,
      {
        headers: {
          "Content-Type": "text/xml; charset=utf-8",
          SOAPAction: "http://ar.gov.afip.dif.FEV1/FECAESolicitar",
        },
        timeout: 30000,
        validateStatus: () => true,
      },
    );

    console.log("Status:", resp2.status);
    const parsed2 = xmlParser.parse(resp2.data);
    const result2 =
      parsed2?.Envelope?.Body?.FECAESolicitarResponse?.FECAESolicitarResult;
    console.log("Result:", JSON.stringify(result2, null, 2));

    // Check for CAE
    const det = result2?.FeDetResp?.FECAEDetResponse;
    if (det?.CAE) {
      console.log("\n*** CAE OBTAINED! ***");
      console.log("  CAE:", det.CAE);
      console.log("  CAEFchVto:", det.CAEFchVto);
      console.log("  Resultado:", det.Resultado);

      // Update invoice in DB
      await Invoice.updateOne(
        { _id: invoice._id },
        {
          $set: {
            status: "AUTHORIZED",
            arcaStatus: "APPROVED",
            "fiscalData.cae": String(det.CAE),
            "fiscalData.caeNro": String(det.CAE),
            "fiscalData.caeVto": String(det.CAEFchVto),
            "fiscalData.caeStatus": "AUTHORIZED",
            "fiscalData.invoiceSequence": correctSequence,
            "fiscalData.afipResponseTimestamp": new Date(),
          },
        },
      );
      console.log("  Invoice updated in DB!");
    }
  } catch (error) {
    console.error("FECAESolicitar error:", error.message);
    if (error.response) {
      console.error("Response:", error.response.data?.substring?.(0, 1000));
    }
  }

  await mongoose.disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

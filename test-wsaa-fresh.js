const fs = require("fs");
const axios = require("axios");
const forge = require("node-forge");
const { XMLParser } = require("fast-xml-parser");

const xmlParser = new XMLParser({
  ignoreAttributes: false,
  removeNSPrefix: true,
  parseTagValue: true,
  trimValues: true,
});

async function main() {
  console.log("Current time:", new Date().toISOString());

  const certPem = fs.readFileSync("C:\\pos-saas\\afip\\cert.pem", "utf8");
  const keyPem = fs.readFileSync("C:\\pos-saas\\afip\\key.pem", "utf8");

  const now = new Date();
  const expiry = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  const uniqueId = Math.floor(Math.random() * 1e9);

  const loginTicketRequest = `<?xml version="1.0" encoding="UTF-8"?>
<loginTicketRequest version="1.0">
  <header>
    <uniqueId>${uniqueId}</uniqueId>
    <generationTime>${now.toISOString()}</generationTime>
    <expirationTime>${expiry.toISOString()}</expirationTime>
  </header>
  <service>wsfe</service>
</loginTicketRequest>`;

  const cert = forge.pki.certificateFromPem(certPem);
  const privateKey = forge.pki.privateKeyFromPem(keyPem);
  const p7 = forge.pkcs7.createSignedData();
  p7.content = forge.util.createBuffer(loginTicketRequest, "utf8");
  p7.addCertificate(cert);
  p7.addSigner({
    key: privateKey,
    certificate: cert,
    digestAlgorithm: forge.pki.oids.sha256,
  });
  p7.sign({ detached: false });
  const cmsBase64 = forge.util.encode64(
    forge.asn1.toDer(p7.toAsn1()).getBytes(),
  );

  const soapRequest = `<?xml version="1.0" encoding="UTF-8"?>
<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/"
                  xmlns:wsaa="http://wsaa.view.sua.dvadac.desein.afip.gov">
  <soapenv:Body>
    <wsaa:loginCms>
      <wsaa:in0>${cmsBase64}</wsaa:in0>
    </wsaa:loginCms>
  </soapenv:Body>
</soapenv:Envelope>`;

  try {
    const response = await axios.post(
      "https://wsaahomo.afip.gov.ar/ws/services/LoginCms",
      soapRequest,
      {
        headers: { "Content-Type": "text/xml; charset=utf-8", SOAPAction: "" },
        timeout: 30000,
        validateStatus: () => true,
      },
    );

    if (response.status === 200) {
      const parsed = xmlParser.parse(response.data);
      const loginReturn =
        parsed?.Envelope?.Body?.loginCmsResponse?.loginCmsReturn;
      const inner = xmlParser.parse(loginReturn);
      const token = inner?.loginTicketResponse?.credentials?.token;
      const sign = inner?.loginTicketResponse?.credentials?.sign;
      console.log("SUCCESS! Got new WSAA token");
      console.log("Token length:", token?.length);
      console.log("Sign length:", sign?.length);

      // Save token to DB
      const mongoose = require("mongoose");
      await mongoose.connect(
        "mongodb+srv://abdullahazmat945_db_user:4HyOSIHz8uTaa1Ku@cluster0.icehkit.mongodb.net/?appName=Cluster0",
      );
      const FiscalConfig = mongoose.connection.collection(
        "fiscalconfigurations",
      );
      const result = await FiscalConfig.updateOne(
        { business: new mongoose.Types.ObjectId("6972142e0f764dd480ff7c28") },
        { $set: { wsaaToken: { token, sign, expiryTime: expiry } } },
      );
      console.log("Cached token in DB:", result.modifiedCount, "docs updated");
      await mongoose.disconnect();

      // Now test WSFEv1
      console.log("\nTesting WSFEv1 FECompUltimoAutorizado...");
      const wsfeSoap = `<?xml version="1.0" encoding="UTF-8"?>
<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/"
                  xmlns:ar="http://ar.gov.afip.dif.FEV1/">
  <soapenv:Body>
    <ar:FECompUltimoAutorizado>
      <ar:Auth>
        <ar:Token>${token}</ar:Token>
        <ar:Sign>${sign}</ar:Sign>
        <ar:Cuit>20463101028</ar:Cuit>
      </ar:Auth>
      <ar:PtoVta>1</ar:PtoVta>
      <ar:CbteTipo>6</ar:CbteTipo>
    </ar:FECompUltimoAutorizado>
  </soapenv:Body>
</soapenv:Envelope>`;

      const wsfeResp = await axios.post(
        "https://wswhomo.afip.gov.ar/wsfev1/service.asmx",
        wsfeSoap,
        {
          headers: {
            "Content-Type": "text/xml; charset=utf-8",
            SOAPAction: "http://ar.gov.afip.dif.FEV1/FECompUltimoAutorizado",
          },
          timeout: 30000,
          validateStatus: () => true,
        },
      );

      console.log("WSFEv1 Status:", wsfeResp.status);
      const wsfeParsed = xmlParser.parse(wsfeResp.data);
      const wsfeResult =
        wsfeParsed?.Envelope?.Body?.FECompUltimoAutorizadoResponse
          ?.FECompUltimoAutorizadoResult;
      console.log("Result:", JSON.stringify(wsfeResult, null, 2));
    } else {
      console.log("WSAA returned:", response.status);
      if (response.data.includes("alreadyAuthenticated")) {
        console.log(
          "Token still valid from previous session. Wait for it to expire (~12h).",
        );
      } else {
        console.log("Response:", response.data.substring(0, 500));
      }
    }
  } catch (error) {
    console.error("Error:", error.message);
  }
}

main();

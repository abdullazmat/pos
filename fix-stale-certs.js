const mongoose = require("mongoose");
const fs = require("fs");

async function main() {
  await mongoose.connect(
    "mongodb+srv://abdullahazmat945_db_user:4HyOSIHz8uTaa1Ku@cluster0.icehkit.mongodb.net/?appName=Cluster0",
  );

  const FiscalConfig = mongoose.connection.collection("fiscalconfigurations");

  // Check which configs have valid cert files
  const configs = await FiscalConfig.find({
    "certificateDigital.storagePath": { $exists: true },
    "privateKey.storagePath": { $exists: true },
  }).toArray();

  for (const c of configs) {
    const certPath = c.certificateDigital?.storagePath;
    const keyPath = c.privateKey?.storagePath;
    const certExists = certPath ? fs.existsSync(certPath) : false;
    const keyExists = keyPath ? fs.existsSync(keyPath) : false;

    console.log("Business:", c.business?.toString());
    console.log("  CUIT:", c.cuit || c.fiscalId);
    console.log("  CertPath:", certPath, certExists ? "EXISTS" : "MISSING");
    console.log("  KeyPath:", keyPath, keyExists ? "EXISTS" : "MISSING");
    console.log("  WsaaToken:", c.wsaaToken ? "cached" : "none");

    // Remove cert/key paths from configs where files don't exist
    if (!certExists || !keyExists) {
      console.log("  -> Removing stale cert paths");
      await FiscalConfig.updateOne(
        { _id: c._id },
        { $unset: { certificateDigital: "", privateKey: "" } },
      );
    }
  }

  await mongoose.disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

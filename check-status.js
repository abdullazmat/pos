const mongoose = require("mongoose");

async function main() {
  await mongoose.connect(
    "mongodb+srv://abdullahazmat945_db_user:4HyOSIHz8uTaa1Ku@cluster0.icehkit.mongodb.net/?appName=Cluster0",
  );

  const Invoice = mongoose.connection.collection("invoices");
  const pending = await Invoice.find({ channel: "ARCA", status: "PENDING_CAE" })
    .sort({ createdAt: -1 })
    .toArray();
  const authorized = await Invoice.find({
    channel: "ARCA",
    status: "AUTHORIZED",
  })
    .sort({ createdAt: -1 })
    .toArray();

  console.log("PENDING_CAE:", pending.length);
  for (const inv of pending) {
    console.log(
      "  ",
      inv.invoiceNumber,
      "| cuit:",
      inv.customerCuit,
      "| fiscal:",
      JSON.stringify(inv.fiscalData),
    );
  }

  console.log("AUTHORIZED:", authorized.length);
  for (const inv of authorized) {
    console.log("  ", inv.invoiceNumber, "| CAE:", inv.fiscalData?.cae);
  }

  // Check audit logs for retry attempts
  const Audit = mongoose.connection.collection("invoiceaudits");
  const audits = await Audit.find({})
    .sort({ createdAt: -1 })
    .limit(5)
    .toArray();
  console.log("\nRecent audits:");
  for (const a of audits) {
    console.log(
      "  ",
      a.action,
      "|",
      a.actionDescription,
      "| resp:",
      JSON.stringify(a.afipResponse || {}),
    );
  }

  await mongoose.disconnect();
}
main().catch((e) => {
  console.error(e);
  process.exit(1);
});

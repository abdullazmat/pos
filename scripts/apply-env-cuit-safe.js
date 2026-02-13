#!/usr/bin/env node
/*
  Safe apply of AFIP_CUIT to FiscalConfiguration documents missing `cuit`.
  Only applies when a certificate file exists for the business and the certificate
  subject or altNames contains the env CUIT. Dry-run by default.

  Usage:
    node scripts/apply-env-cuit-safe.js        # dry-run
    node scripts/apply-env-cuit-safe.js --apply  # apply changes
*/
require("dotenv").config({
  path: require("path").resolve(process.cwd(), ".env.local"),
});
const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");

const validator = require("../lib/afip/validateAfip");

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
  console.error("MONGODB_URI not set");
  process.exit(2);
}

const envCuit = (process.env.AFIP_CUIT || "").replace(/\D/g, "");
if (!envCuit) {
  console.error("AFIP_CUIT not set in environment");
  process.exit(2);
}

const apply = process.argv.includes("--apply");

(async function main() {
  try {
    await mongoose.connect(MONGODB_URI);
    const coll = mongoose.connection.db.collection("fiscalconfigurations");

    const candidates = await coll
      .find({
        $or: [{ cuit: { $exists: false } }, { cuit: null }, { cuit: "" }],
      })
      .project({ _id: 1, business: 1, "certificateDigital.storagePath": 1 })
      .toArray();

    console.log("Candidates missing CUIT:", candidates.length);

    const toApply = [];

    for (const c of candidates) {
      const certPath = c.certificateDigital && c.certificateDigital.storagePath;
      if (!certPath) {
        console.log(`- Skipping ${c._id}: no stored certificate`);
        continue;
      }

      const absPath = path.isAbsolute(certPath)
        ? certPath
        : path.resolve(process.cwd(), certPath);
      if (!fs.existsSync(absPath)) {
        console.log(
          `- Skipping ${c._id}: certificate file not found at ${absPath}`,
        );
        continue;
      }

      try {
        const res = validator.validateAfip({
          certPath: absPath,
          keyPath: null,
          cuit: envCuit,
        });
        // If validator reports CUIT_MISMATCH, skip. Otherwise consider for apply.
        const hasCuitMismatch = (res.issues || []).some(
          (it) => it.code === "CUIT_MISMATCH",
        );
        if (hasCuitMismatch) {
          console.log(
            `- Skipping ${c._id}: certificate does not contain env CUIT`,
          );
          continue;
        }

        // Accept if cert/key match ok or CUIT present
        console.log(`- Candidate ${c._id} OK for applying CUIT`);
        toApply.push(c._id);
      } catch (e) {
        console.log(
          `- Skipping ${c._id}: validator error: ${e && e.message ? e.message : e}`,
        );
      }
    }

    console.log(
      `Found ${toApply.length} configs eligible to receive AFIP_CUIT=${envCuit}`,
    );

    if (toApply.length === 0) {
      console.log("Nothing to apply. Exiting.");
      await mongoose.disconnect();
      process.exit(0);
    }

    if (!apply) {
      console.log("Dry-run: re-run with --apply to perform updates.");
      console.log("Eligible IDs:", toApply);
      await mongoose.disconnect();
      process.exit(0);
    }

    // Apply changes
    const res = await coll.updateMany(
      { _id: { $in: toApply } },
      { $set: { cuit: envCuit } },
    );

    console.log(
      "Update result:",
      res.modifiedCount || res.nModified || res.modified || res,
    );
    await mongoose.disconnect();
    process.exit(0);
  } catch (e) {
    console.error("Error:", e && e.message ? e.message : e);
    try {
      await mongoose.disconnect();
    } catch (e2) {}
    process.exit(1);
  }
})();

#!/usr/bin/env node
/*
  Safe migration: show which `FiscalConfiguration` docs lack `cuit` and optionally set them to process.env.AFIP_CUIT.
  Usage:
    node scripts/apply-env-cuit-to-businesses.js         # dry-run
    node scripts/apply-env-cuit-to-businesses.js --apply # apply changes
*/
const mongoose = require("mongoose");
const FiscalConfiguration =
  require("../src/lib/models/FiscalConfiguration").default;
require("dotenv").config({
  path: require("path").resolve(process.cwd(), ".env.local"),
});

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
  console.error("MONGODB_URI not set");
  process.exit(2);
}

const envCuit = (process.env.AFIP_CUIT || "").replace(/\D/g, "");
const apply = process.argv.includes("--apply");

(async function main() {
  await mongoose.connect(MONGODB_URI, { dbName: undefined });
  try {
    const missing = await FiscalConfiguration.find({
      $or: [{ cuit: { $exists: false } }, { cuit: null }, { cuit: "" }],
    }).lean();
    console.log(`Found ${missing.length} fiscal configs with no CUIT.`);
    if (missing.length > 0) {
      console.log(
        "Sample:",
        missing.slice(0, 5).map((m) => ({ _id: m._id, business: m.business })),
      );
    }

    if (!envCuit) {
      console.log("No AFIP_CUIT in env to apply. Exiting.");
      process.exit(0);
    }

    if (!apply) {
      console.log(
        "Dry-run: to apply the env CUIT to missing configs run with --apply",
      );
      process.exit(0);
    }

    console.log(
      `Applying AFIP_CUIT=${envCuit} to ${missing.length} configs...`,
    );
    const res = await FiscalConfiguration.updateMany(
      { $or: [{ cuit: { $exists: false } }, { cuit: null }, { cuit: "" }] },
      { $set: { cuit: envCuit } },
    );
    console.log(
      "Updated:",
      res.modifiedCount || res.nModified || res.modified || res,
    );
    process.exit(0);
  } catch (e) {
    console.error("Error:", e);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
  }
})();

#!/usr/bin/env node
/* AFIP validation CLI
   Usage: set AFIP_CERT_PATH, AFIP_KEY_PATH, AFIP_CUIT in env or in .env.local then run:
     npm run validate-afip
*/
const path = require("path");
const dotenv = require("dotenv");
const { validateAfip } = require("../lib/afip/validateAfip");

// Load .env.local if present
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

const certPath = process.env.AFIP_CERT_PATH;
const keyPath = process.env.AFIP_KEY_PATH;
const cuit = process.env.AFIP_CUIT;

console.log("AFIP validation starting...");
console.log("Cert:", certPath || "(none)");
console.log("Key :", keyPath || "(none)");
console.log("CUIT:", cuit || "(none)");

try {
  const result = validateAfip({ certPath, keyPath, cuit });
  if (result.ok) {
    console.log("Validation successful — certificate and key appear valid.");
    process.exit(0);
  }

  console.error("Validation failed. Issues:");
  result.issues.forEach((it, idx) => {
    console.error(`${idx + 1}. [${it.code}] ${it.message}`);
  });
  process.exit(1);
} catch (e) {
  console.error("Validation error:", e && e.message ? e.message : e);
  process.exit(2);
}

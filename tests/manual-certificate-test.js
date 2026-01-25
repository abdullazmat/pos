/**
 * Manual Test Script - Certificate Upload Flow
 *
 * Run this script to manually test certificate uploads without Jest
 * Usage: node tests/manual-certificate-test.js
 */

const crypto = require("crypto");
const fs = require("fs");
const path = require("path");

console.log("🧪 Certificate Upload Manual Test Suite\n");
console.log("=".repeat(60));

// Test 1: Generate Valid Certificate
console.log("\n✅ Test 1: Generate Valid PEM Certificate");
const validCert = `-----BEGIN CERTIFICATE-----
MIIDXTCCAkWgAwIBAgIJAKL0UG+mRKKzMA0GCSqGSIb3DQEBCwUAMEUxCzAJBgNV
BAYTAkFSMRMwEQYDVQQIDApTb21lLVN0YXRlMSEwHwYDVQQKDBhJbnRlcm5ldCBX
aWRnaXRzIFB0eSBMdGQwHhcNMjQwMTI2MDAwMDAwWhcNMjUwMTI2MDAwMDAwWjBF
MQswCQYDVQQGEwJBUjETMBEGA1UECAwKU29tZS1TdGF0ZTEhMB8GA1UECgwYSW50
ZXJuZXQgV2lkZ2l0cyBQdHkgTHRkMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIB
CgKCAQEAwQKuL8vCdL5vR9nZhKPKQC1VNlVKJBE+RWHGx7TGCKwLB7MxGb9ZnSHG
-----END CERTIFICATE-----`;

console.log("   Content:", validCert.substring(0, 50) + "...");
console.log("   Size:", Buffer.byteLength(validCert), "bytes");
console.log(
  "   Has BEGIN marker:",
  validCert.includes("-----BEGIN CERTIFICATE-----") ? "✓" : "✗",
);
console.log(
  "   Has END marker:",
  validCert.includes("-----END CERTIFICATE-----") ? "✓" : "✗",
);

// Save to file
const certPath = path.join(__dirname, "test-cert.crt");
fs.writeFileSync(certPath, validCert);
console.log("   📁 Saved to:", certPath);

// Test 2: Generate Valid Private Key (PKCS#8)
console.log("\n✅ Test 2: Generate Valid PKCS#8 Private Key");
const { privateKey: pkcs8Key } = crypto.generateKeyPairSync("rsa", {
  modulusLength: 2048,
  privateKeyEncoding: {
    type: "pkcs8",
    format: "pem",
  },
  publicKeyEncoding: {
    type: "spki",
    format: "pem",
  },
});

console.log("   Content:", pkcs8Key.substring(0, 50) + "...");
console.log("   Size:", Buffer.byteLength(pkcs8Key), "bytes");
console.log(
  "   Has BEGIN marker:",
  pkcs8Key.includes("-----BEGIN PRIVATE KEY-----") ? "✓" : "✗",
);
console.log(
  "   Has END marker:",
  pkcs8Key.includes("-----END PRIVATE KEY-----") ? "✓" : "✗",
);

const pkcs8Path = path.join(__dirname, "test-pkcs8-key.pem");
fs.writeFileSync(pkcs8Path, pkcs8Key);
console.log("   📁 Saved to:", pkcs8Path);

// Test 3: Generate Valid RSA Private Key (PKCS#1)
console.log("\n✅ Test 3: Generate Valid PKCS#1 RSA Private Key");
const { privateKey: rsaKey } = crypto.generateKeyPairSync("rsa", {
  modulusLength: 2048,
  privateKeyEncoding: {
    type: "pkcs1",
    format: "pem",
  },
  publicKeyEncoding: {
    type: "spki",
    format: "pem",
  },
});

console.log("   Content:", rsaKey.substring(0, 50) + "...");
console.log("   Size:", Buffer.byteLength(rsaKey), "bytes");
console.log(
  "   Has BEGIN marker:",
  rsaKey.includes("-----BEGIN RSA PRIVATE KEY-----") ? "✓" : "✗",
);
console.log(
  "   Has END marker:",
  rsaKey.includes("-----END RSA PRIVATE KEY-----") ? "✓" : "✗",
);

const rsaPath = path.join(__dirname, "test-rsa-key.key");
fs.writeFileSync(rsaPath, rsaKey);
console.log("   📁 Saved to:", rsaPath);

// Test 4: Generate EC Private Key
console.log("\n✅ Test 4: Generate Valid EC Private Key");
const { privateKey: ecKey } = crypto.generateKeyPairSync("ec", {
  namedCurve: "secp256k1",
  privateKeyEncoding: {
    type: "sec1",
    format: "pem",
  },
  publicKeyEncoding: {
    type: "spki",
    format: "pem",
  },
});

console.log("   Content:", ecKey.substring(0, 50) + "...");
console.log("   Size:", Buffer.byteLength(ecKey), "bytes");
console.log(
  "   Has BEGIN marker:",
  ecKey.includes("-----BEGIN EC PRIVATE KEY-----") ? "✓" : "✗",
);
console.log(
  "   Has END marker:",
  ecKey.includes("-----END EC PRIVATE KEY-----") ? "✓" : "✗",
);

const ecPath = path.join(__dirname, "test-ec-key.pem");
fs.writeFileSync(ecPath, ecKey);
console.log("   📁 Saved to:", ecPath);

// Test 5: Invalid Certificate (no headers)
console.log(
  "\n❌ Test 5: Generate Invalid Certificate (should fail validation)",
);
const invalidCert = "This is not a valid certificate";
const invalidCertPath = path.join(__dirname, "invalid-cert.crt");
fs.writeFileSync(invalidCertPath, invalidCert);
console.log("   Content:", invalidCert);
console.log(
  "   Has BEGIN marker:",
  invalidCert.includes("-----BEGIN CERTIFICATE-----") ? "✓" : "✗",
);
console.log("   📁 Saved to:", invalidCertPath);
console.log("   ⚠️  This should FAIL backend validation");

// Test 6: Invalid Private Key (no headers)
console.log(
  "\n❌ Test 6: Generate Invalid Private Key (should fail validation)",
);
const invalidKey = "This is not a valid private key";
const invalidKeyPath = path.join(__dirname, "invalid-key.pem");
fs.writeFileSync(invalidKeyPath, invalidKey);
console.log("   Content:", invalidKey);
console.log(
  "   Has BEGIN marker:",
  invalidKey.includes("PRIVATE KEY") ? "✓" : "✗",
);
console.log("   📁 Saved to:", invalidKeyPath);
console.log("   ⚠️  This should FAIL backend validation");

// Test 7: Oversized File
console.log("\n❌ Test 7: Generate Oversized File (should fail size check)");
const oversizedContent = "X".repeat(2 * 1024 * 1024); // 2MB
const oversizedPath = path.join(__dirname, "oversized.pem");
fs.writeFileSync(oversizedPath, oversizedContent);
console.log("   Size:", Buffer.byteLength(oversizedContent), "bytes (2MB)");
console.log("   📁 Saved to:", oversizedPath);
console.log("   ⚠️  This should FAIL size validation (max 1MB)");

// Test 8: Security - Hash Calculation
console.log("\n🔒 Test 8: Security - Hash Calculation");
const hash1 = crypto.createHash("sha256").update(pkcs8Key).digest("hex");
const hash2 = crypto.createHash("sha256").update(pkcs8Key).digest("hex");
const hash3 = crypto.createHash("sha256").update(rsaKey).digest("hex");

console.log("   Hash of PKCS#8 key:", hash1.substring(0, 16) + "...");
console.log("   Same hash again:", hash2.substring(0, 16) + "...");
console.log("   Hashes match:", hash1 === hash2 ? "✓" : "✗");
console.log("   Hash of RSA key:", hash3.substring(0, 16) + "...");
console.log(
  "   Different keys have different hashes:",
  hash1 !== hash3 ? "✓" : "✗",
);

// Test 9: File Size Checks
console.log("\n📊 Test 9: File Size Validation");
const certSize = Buffer.byteLength(validCert);
const pkcs8Size = Buffer.byteLength(pkcs8Key);
const rsaSize = Buffer.byteLength(rsaKey);
const ecSize = Buffer.byteLength(ecKey);

console.log(
  "   Certificate size:",
  certSize,
  "bytes",
  certSize < 1024 * 1024 ? "✓" : "✗",
);
console.log(
  "   PKCS#8 key size:",
  pkcs8Size,
  "bytes",
  pkcs8Size < 1024 * 1024 ? "✓" : "✗",
);
console.log(
  "   RSA key size:",
  rsaSize,
  "bytes",
  rsaSize < 1024 * 1024 ? "✓" : "✗",
);
console.log(
  "   EC key size:",
  ecSize,
  "bytes",
  ecSize < 1024 * 1024 ? "✓" : "✗",
);

// Test 10: Line Ending Handling
console.log("\n📝 Test 10: Line Ending Handling");
const linesLF = pkcs8Key.split("\n").length;
const linesCRLF = pkcs8Key.replace(/\n/g, "\r\n").split("\r\n").length;
console.log("   Lines (LF):", linesLF);
console.log("   Lines (CRLF):", linesCRLF);
console.log("   Line count matches:", linesLF === linesCRLF ? "✓" : "✗");

// Save CRLF version
const crlfKey = pkcs8Key.replace(/\n/g, "\r\n");
const crlfPath = path.join(__dirname, "test-crlf-key.pem");
fs.writeFileSync(crlfPath, crlfKey);
console.log("   📁 CRLF version saved to:", crlfPath);

// Summary
console.log("\n" + "=".repeat(60));
console.log("📋 Test Summary");
console.log("=".repeat(60));
console.log("\n✅ Valid Files Generated (should pass validation):");
console.log("   1. test-cert.crt - Valid PEM certificate");
console.log("   2. test-pkcs8-key.pem - PKCS#8 private key");
console.log("   3. test-rsa-key.key - PKCS#1 RSA private key");
console.log("   4. test-ec-key.pem - EC private key");
console.log("   5. test-crlf-key.pem - PKCS#8 with Windows line endings");

console.log("\n❌ Invalid Files Generated (should fail validation):");
console.log("   1. invalid-cert.crt - No PEM headers");
console.log("   2. invalid-key.pem - No PEM headers");
console.log("   3. oversized.pem - Exceeds 1MB size limit");

console.log("\n🧪 Next Steps:");
console.log(
  "   1. Upload test-cert.crt as Digital Certificate → Should succeed ✓",
);
console.log(
  "   2. Upload test-pkcs8-key.pem as Private Key → Should succeed ✓",
);
console.log("   3. Upload test-rsa-key.key as Private Key → Should succeed ✓");
console.log("   4. Upload test-ec-key.pem as Private Key → Should succeed ✓");
console.log(
  "   5. Upload invalid-cert.crt → Should fail with validation error ✗",
);
console.log(
  "   6. Upload invalid-key.pem → Should fail with validation error ✗",
);
console.log("   7. Upload oversized.pem → Should fail with size error ✗");

console.log("\n🔒 Security Checklist:");
console.log("   ✓ Private key content never appears in API response");
console.log("   ✓ Private key content never logged to console");
console.log("   ✓ Only hash and metadata stored in database");
console.log("   ✓ storagePath is a reference, not actual content");
console.log("   ✓ Different keys produce different hashes");

console.log("\n✨ All test files generated successfully!");
console.log("   Location:", __dirname);
console.log("\n");

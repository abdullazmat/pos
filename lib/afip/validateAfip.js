const fs = require("fs");
const path = require("path");
const forge = require("node-forge");

function _readPem(p) {
  if (!p) throw new Error("path is empty");
  const resolved = path.resolve(p);
  if (!fs.existsSync(resolved)) throw new Error(`File not found: ${resolved}`);
  return fs.readFileSync(resolved, "utf8");
}

function _parseCert(pem) {
  try {
    return forge.pki.certificateFromPem(pem);
  } catch (e) {
    throw new Error("Invalid certificate PEM: " + e.message);
  }
}

function _parsePrivateKey(pem) {
  try {
    return forge.pki.privateKeyFromPem(pem);
  } catch (e) {
    throw new Error("Invalid private key PEM: " + e.message);
  }
}

function _formatDate(d) {
  return d instanceof Date ? d.toISOString() : String(d);
}

function validateAfip({ certPath, keyPath, cuit } = {}) {
  const issues = [];
  let certPem, keyPem, cert, privateKey;

  try {
    certPem = _readPem(certPath);
  } catch (e) {
    issues.push({ code: "CERT_NOT_FOUND", message: e.message });
    return { ok: false, issues };
  }

  try {
    keyPem = _readPem(keyPath);
  } catch (e) {
    issues.push({ code: "KEY_NOT_FOUND", message: e.message });
    return { ok: false, issues };
  }

  try {
    cert = _parseCert(certPem);
  } catch (e) {
    issues.push({ code: "CERT_PARSE_ERROR", message: e.message });
    return { ok: false, issues };
  }

  try {
    privateKey = _parsePrivateKey(keyPem);
  } catch (e) {
    issues.push({ code: "KEY_PARSE_ERROR", message: e.message });
    return { ok: false, issues };
  }

  // Check expiry
  const now = new Date();
  try {
    const notBefore = cert.validity.notBefore;
    const notAfter = cert.validity.notAfter;
    if (now < notBefore) {
      issues.push({
        code: "CERT_NOT_YET_VALID",
        message: `Certificate valid from ${_formatDate(notBefore)}`,
      });
    }
    if (now > notAfter) {
      issues.push({
        code: "CERT_EXPIRED",
        message: `Certificate expired at ${_formatDate(notAfter)}`,
      });
    }
  } catch (e) {
    issues.push({ code: "CERT_VALIDITY_CHECK_FAILED", message: e.message });
  }

  // Check key matches certificate (best-effort for RSA keys)
  try {
    const certPub = cert.publicKey;
    const priv = privateKey;
    let keyMatch = false;

    // RSA objects expose 'n' (modulus)
    if (certPub && certPub.n && priv && priv.n) {
      const certN = certPub.n.toString(16);
      const privN = priv.n.toString(16);
      keyMatch = certN === privN;
    } else {
      // Fallback: try a sign/verify roundtrip for best-effort validation
      try {
        const md = forge.md.sha256.create();
        md.update("afip-validate-" + Date.now());
        const signature = priv.sign(md);
        keyMatch = certPub.verify(md.digest().bytes(), signature);
      } catch (e) {
        // cannot verify, mark as unknown
        issues.push({
          code: "KEY_MATCH_UNKNOWN",
          message: "Unable to perform key/cert match check: " + e.message,
        });
      }
    }

    if (!keyMatch) {
      issues.push({
        code: "KEY_MISMATCH",
        message: "Private key does not match certificate public key",
      });
    }
  } catch (e) {
    issues.push({ code: "KEY_MATCH_ERROR", message: e.message });
  }

  // Check CUIT in certificate subject (heuristic: search attributes)
  try {
    if (cuit) {
      const attrs =
        cert.subject && cert.subject.attributes
          ? cert.subject.attributes.map((a) => a.value).join(" ")
          : "";
      const altNames = (cert.extensions || [])
        .filter((ext) => ext.name === "subjectAltName")
        .map((ext) => ext.altNames || [])
        .flat()
        .map((a) => a.value || "")
        .join(" ");
      const hay = (attrs + " " + altNames).replace(/\s+/g, " ");
      if (!hay.includes(String(cuit))) {
        issues.push({
          code: "CUIT_MISMATCH",
          message: `AFIP_CUIT ${cuit} not found in certificate subject/altNames`,
        });
      }
    }
  } catch (e) {
    issues.push({ code: "CUIT_CHECK_ERROR", message: e.message });
  }

  const ok = issues.length === 0;
  const details = {
    cert: {
      subject: cert.subject ? cert.subject.attributes : null,
      validFrom:
        cert.validity && cert.validity.notBefore
          ? cert.validity.notBefore.toISOString()
          : null,
      validTo:
        cert.validity && cert.validity.notAfter
          ? cert.validity.notAfter.toISOString()
          : null,
    },
  };

  return { ok, issues, details };
}

module.exports = { validateAfip };

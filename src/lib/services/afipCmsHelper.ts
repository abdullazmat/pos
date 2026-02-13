/**
 * AFIP CMS (PKCS#7 SignedData) Helper
 *
 * Creates CMS signed data blobs required by AFIP WSAA LoginCMS.
 * Uses node-forge for PKCS#7 signing with embedded certificate.
 */

import * as forge from "node-forge";

/**
 * Create a CMS (PKCS#7 SignedData) signed blob from XML content.
 *
 * AFIP requires:
 * - PKCS#7 SignedData format
 * - Certificate embedded in the SignedData
 * - SHA-256 digest
 * - Base64 encoded output
 *
 * @param xmlContent - The LoginTicketRequest XML to sign
 * @param certPem - PEM-encoded X.509 certificate
 * @param keyPem - PEM-encoded private key
 * @returns Base64-encoded CMS blob
 */
export function createCMSSignedData(
  xmlContent: string,
  certPem: string,
  keyPem: string,
): string {
  // Parse the certificate
  const cert = forge.pki.certificateFromPem(certPem);

  // Parse the private key
  const privateKey = forge.pki.privateKeyFromPem(keyPem);

  // Create PKCS#7 signed data
  const p7 = forge.pkcs7.createSignedData();

  // Set the content (the XML to sign)
  p7.content = forge.util.createBuffer(xmlContent, "utf8");

  // Add the certificate to the SignedData
  p7.addCertificate(cert);

  // Add signer
  p7.addSigner({
    key: privateKey,
    certificate: cert,
    digestAlgorithm: forge.pki.oids.sha256,
    authenticatedAttributes: [
      {
        type: forge.pki.oids.contentType,
        value: forge.pki.oids.data,
      },
      {
        type: forge.pki.oids.messageDigest,
        // value will be auto-calculated
      },
      {
        type: forge.pki.oids.signingTime,
        value: new Date().toISOString(),
      },
    ],
  });

  // Sign
  p7.sign();

  // Convert to DER then Base64
  const asn1 = p7.toAsn1();
  const der = forge.asn1.toDer(asn1);
  const base64 = forge.util.encode64(der.getBytes());

  return base64;
}

/**
 * Extract certificate expiry date using node-forge.
 */
export function extractCertExpiry(certPem: string): Date | undefined {
  try {
    const cert = forge.pki.certificateFromPem(certPem);
    return cert.validity.notAfter;
  } catch {
    return undefined;
  }
}

/**
 * Extract certificate subject CN.
 */
export function extractCertSubject(certPem: string): string {
  try {
    const cert = forge.pki.certificateFromPem(certPem);
    const cn = cert.subject.getField("CN");
    return cn ? String(cn.value) : "";
  } catch {
    return "";
  }
}

/**
 * Calculate SHA-256 thumbprint of a PEM certificate (DER digest).
 */
export function calculateCertThumbprint(certPem: string): string {
  try {
    const cert = forge.pki.certificateFromPem(certPem);
    const asn1 = forge.pki.certificateToAsn1(cert);
    const der = forge.asn1.toDer(asn1).getBytes();
    const md = forge.md.sha256.create();
    md.update(der);
    return md.digest().toHex();
  } catch {
    return "";
  }
}

/**
 * Validate that cert and key are a matching pair.
 */
export function validateCertKeyPair(certPem: string, keyPem: string): boolean {
  try {
    const cert = forge.pki.certificateFromPem(certPem);
    const privateKey = forge.pki.privateKeyFromPem(keyPem);
    const publicKey = cert.publicKey as forge.pki.rsa.PublicKey;

    // Compare modulus
    const pubMod = (publicKey as any).n.toString(16);
    const privMod = (privateKey as any).n.toString(16);
    return pubMod === privMod;
  } catch {
    return false;
  }
}

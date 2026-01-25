/**
 * Digital Certificates Management API
 * Endpoints for uploading and managing AFIP digital certificates
 */

import { NextRequest } from "next/server";
import dbConnect from "@/lib/db/connect";
import FiscalConfiguration from "@/lib/models/FiscalConfiguration";
import InvoiceAudit from "@/lib/models/InvoiceAudit";
import { authMiddleware } from "@/lib/middleware/auth";
import {
  generateErrorResponse,
  generateSuccessResponse,
} from "@/lib/utils/helpers";
import crypto from "crypto";

/**
 * POST /api/fiscal-config/certificates
 * Upload digital certificate or private key
 */
export async function POST(req: NextRequest) {
  try {
    const authResult = await authMiddleware(req);
    if (!authResult.authorized) {
      return generateErrorResponse(authResult.error || "Unauthorized", 401);
    }

    const { businessId, userId, email } = authResult.user!;
    const formData = await req.formData();

    const certificateFile = formData.get("certificateDigital") as File;
    const privateKeyFile = formData.get("privateKey") as File;
    const certificateType = formData.get("certificateType") as
      | "certificateDigital"
      | "privateKey"
      | null;

    if (!certificateType) {
      return generateErrorResponse(
        "certificateType (certificateDigital or privateKey) is required",
        400,
      );
    }

    if (certificateType === "certificateDigital" && !certificateFile) {
      return generateErrorResponse(
        "Certificate file (.crt/.cer) is required",
        400,
      );
    }

    if (certificateType === "privateKey" && !privateKeyFile) {
      return generateErrorResponse(
        "Private key file (.key/.pem) is required",
        400,
      );
    }

    await dbConnect();

    let fiscal = await FiscalConfiguration.findOne({
      business: businessId,
    });

    // If fiscal config does not exist yet, bootstrap a default one so uploads don't fail
    if (!fiscal) {
      fiscal = new FiscalConfiguration({
        business: businessId,
        country: "Argentina",
        fiscalRegime: "RESPONSABLE_INSCRIPTO",
        defaultIvaRate: 21,
        pointOfSale: 1,
      });
    }

    if (certificateType === "certificateDigital") {
      // Validate certificate file
      const certContent = await certificateFile!.text();

      // Check for valid PEM certificate format
      if (
        !certContent.includes("-----BEGIN CERTIFICATE-----") &&
        !certContent.includes("-----BEGIN X509 CERTIFICATE-----")
      ) {
        return generateErrorResponse(
          "Invalid certificate format. Must be a valid PEM-encoded certificate (.crt or .cer file)",
          400,
        );
      }

      // Extract certificate info
      const expiryDate = extractCertificateExpiryDate(certContent);
      const thumbprint = calculateCertificateThumbprint(certContent);

      // Store certificate (encrypted in production)
      fiscal.certificateDigital = {
        fileName: certificateFile!.name,
        mimeType: certificateFile!.type,
        fileSize: certificateFile!.size,
        thumbprint,
        expiryDate,
        status: "VALID",
        uploadedAt: new Date(),
        storagePath: `certs/business_${businessId}_cert_${Date.now()}.crt`,
      };

      // TODO: In production, encrypt and store the actual file
      // const encryptedContent = encryptCertificate(certContent);
      // await storeCertificateFile(storagePath, encryptedContent);
    }

    if (certificateType === "privateKey") {
      // Validate private key file
      const keyContent = await privateKeyFile!.text();

      // Check for valid PEM private key formats
      const validKeyFormats = [
        "-----BEGIN PRIVATE KEY-----", // PKCS#8 unencrypted
        "-----BEGIN RSA PRIVATE KEY-----", // PKCS#1 RSA
        "-----BEGIN EC PRIVATE KEY-----", // EC
        "-----BEGIN ENCRYPTED PRIVATE KEY-----", // PKCS#8 encrypted
        "-----BEGIN DSA PRIVATE KEY-----", // DSA
      ];

      const hasValidFormat = validKeyFormats.some((format) =>
        keyContent.includes(format),
      );

      if (!hasValidFormat) {
        return generateErrorResponse(
          "Invalid private key format. Must be a valid PEM-encoded private key (.key or .pem file)",
          400,
        );
      }

      const keyHash = crypto
        .createHash("sha256")
        .update(keyContent)
        .digest("hex");

      // Store private key (HIGHLY ENCRYPTED in production)
      fiscal.privateKey = {
        fileName: privateKeyFile!.name,
        mimeType: privateKeyFile!.type,
        fileSize: privateKeyFile!.size,
        status: "VALID",
        uploadedAt: new Date(),
        storagePath: `certs/business_${businessId}_key_${Date.now()}.pem`,
        hash: keyHash,
      };

      // TODO: In production, use HSM or similar for private key storage
      // NEVER store unencrypted private keys
      // const encryptedKey = encryptPrivateKey(keyContent, masterSecret);
      // await storePrivateKeySecurely(storagePath, encryptedKey);
    }

    fiscal.certificateLastValidated = new Date();
    await fiscal.save();

    // Audit log
    await InvoiceAudit.create({
      business: businessId,
      action: "UPDATE",
      actionDescription: `Uploaded ${certificateType === "certificateDigital" ? "digital certificate" : "private key"}`,
      userId,
      userEmail: email,
      metadata: {
        certificateType,
        fileName: certificateFile?.name || privateKeyFile?.name,
        fileSize: certificateFile?.size || privateKeyFile?.size,
      },
    });

    return generateSuccessResponse({
      message: `${certificateType === "certificateDigital" ? "Certificate" : "Private key"} uploaded successfully`,
      status:
        certificateType === "certificateDigital"
          ? fiscal.certificateDigital?.status
          : fiscal.privateKey?.status,
      expiryDate:
        certificateType === "certificateDigital"
          ? fiscal.certificateDigital?.expiryDate
          : null,
    });
  } catch (error: any) {
    console.error("[CERTIFICATE UPLOAD]", error);
    return generateErrorResponse(
      error.message || "Failed to upload certificate",
      500,
    );
  }
}

/**
 * Extract certificate expiry date from certificate content
 */
function extractCertificateExpiryDate(certContent: string): Date | undefined {
  try {
    // This is a simplified extraction
    // In production, use a proper X.509 certificate parser
    // const cert = new X509Certificate(certContent);
    // return cert.notAfter;

    // Placeholder implementation
    return undefined;
  } catch (error) {
    console.error("Error extracting certificate expiry:", error);
    return undefined;
  }
}

/**
 * Calculate certificate thumbprint (SHA256 of DER-encoded certificate)
 */
function calculateCertificateThumbprint(certContent: string): string {
  try {
    // Simplified - in production use proper X.509 parser
    return crypto.createHash("sha256").update(certContent).digest("hex");
  } catch (error) {
    console.error("Error calculating thumbprint:", error);
    return "";
  }
}

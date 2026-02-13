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
import fs from "fs";
import path from "path";
import {
  extractCertExpiry,
  calculateCertThumbprint,
  validateCertKeyPair,
} from "@/lib/services/afipCmsHelper";
import { validateAfipFiles } from "@/lib/services/afipValidator";

// Directory where PEM files are persisted at runtime
const AFIP_CERT_DIR = path.resolve(process.cwd(), "afip");

/**
 * Ensure afip/ directory exists.
 */
function ensureCertDir(): void {
  if (!fs.existsSync(AFIP_CERT_DIR)) {
    fs.mkdirSync(AFIP_CERT_DIR, { recursive: true });
  }
}

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

    ensureCertDir();

    if (certificateType === "certificateDigital") {
      // Validate certificate file
      const certContent = await certificateFile!.text();

      // Check for valid PEM certificate format
      if (
        !certContent.includes("-----BEGIN CERTIFICATE-----") &&
        !certContent.includes("-----BEGIN X509 CERTIFICATE-----")
      ) {
        return generateErrorResponse(
          "Invalid certificate format. Must be a valid PEM-encoded certificate (.crt, .cer or .pem file)",
          400,
        );
      }

      // Extract certificate info using node-forge
      const expiryDate = extractCertExpiry(certContent);
      const thumbprint = calculateCertThumbprint(certContent);

      // Persist PEM to disk
      const certPath = path.join(AFIP_CERT_DIR, "cert.pem");
      fs.writeFileSync(certPath, certContent, "utf8");

      // Store metadata + disk path in DB
      fiscal.certificateDigital = {
        fileName: certificateFile!.name,
        mimeType: certificateFile!.type,
        fileSize: certificateFile!.size,
        thumbprint,
        expiryDate,
        status: expiryDate && expiryDate < new Date() ? "EXPIRED" : "VALID",
        uploadedAt: new Date(),
        storagePath: certPath,
      };
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

      // Persist PEM to disk
      const keyPath = path.join(AFIP_CERT_DIR, "key.pem");
      fs.writeFileSync(keyPath, keyContent, { mode: 0o600 });

      // Store metadata + disk path in DB
      fiscal.privateKey = {
        fileName: privateKeyFile!.name,
        mimeType: privateKeyFile!.type,
        fileSize: privateKeyFile!.size,
        status: "VALID",
        uploadedAt: new Date(),
        storagePath: keyPath,
        hash: keyHash,
      };
    }

    // If both cert and key are now present, validate the pair matches
    if (
      fiscal.certificateDigital?.storagePath &&
      fiscal.privateKey?.storagePath
    ) {
      try {
        const certPem = fs.readFileSync(
          fiscal.certificateDigital.storagePath,
          "utf8",
        );
        const keyPem = fs.readFileSync(fiscal.privateKey.storagePath, "utf8");

        // First, quick local check using existing helper
        const pairOk = validateCertKeyPair(certPem, keyPem);

        // Run comprehensive validation (expiry, key match, CUIT heuristic)
        const cuitToCheck = fiscal.cuit || process.env.AFIP_CUIT;
        const validation = validateAfipFiles({
          certPath: fiscal.certificateDigital.storagePath,
          keyPath: fiscal.privateKey.storagePath,
          cuit: cuitToCheck,
        });

        if (!pairOk || !validation.ok) {
          console.warn(
            "[CERTIFICATE UPLOAD] Certificate validation issues:",
            validation.issues,
          );
          fiscal.certificateValidationStatus = "MISMATCH";
          fiscal.certificateValidationError = validation.issues
            .map((i) => `[${i.code}] ${i.message}`)
            .join("; ");
        } else {
          fiscal.certificateValidationStatus = "VALID";
          fiscal.certificateValidationError = undefined;
        }

        // If critical issues found, return a 400 with details
        const critical =
          validation.issues &&
          validation.issues.some((it) =>
            [
              "KEY_MISMATCH",
              "CERT_EXPIRED",
              "CERT_NOT_YET_VALID",
              "CERT_PARSE_ERROR",
              "KEY_PARSE_ERROR",
              "CUIT_MISMATCH",
            ].includes(it.code),
          );

        await fiscal.save();

        if (critical) {
          return generateErrorResponse(
            {
              message: "Certificate validation failed",
              issues: validation.issues,
            },
            400,
          );
        }
      } catch (validationErr: any) {
        fiscal.certificateValidationStatus = "VALIDATION_ERROR";
        fiscal.certificateValidationError = validationErr.message;
        await fiscal.save();
        return generateErrorResponse(
          validationErr.message || "Validation error",
          500,
        );
      }
    }

    // Update last validated timestamp (if not already saved above)
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

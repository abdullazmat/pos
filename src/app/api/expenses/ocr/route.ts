import { NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import { verifyToken } from "@/lib/utils/jwt";
import { processOcr } from "@/lib/utils/ocr";
import dbConnect from "@/lib/db/connect";
import ExpenseAttachment from "@/lib/models/ExpenseAttachment";

/**
 * POST /api/expenses/ocr
 * Process an uploaded file with OCR to extract receipt data.
 * Body: { fileUrl, fileName, mimeType, fileSize }
 * Returns: { ocrApplied, confidence, extracted, rawText, attachmentId }
 */
export async function POST(req: NextRequest) {
  try {
    const token = req.headers.get("authorization")?.split(" ")[1];
    if (!token)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const decoded = verifyToken(token);
    if (!decoded)
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });

    const { fileUrl, fileName, mimeType, fileSize } = await req.json();

    if (!fileUrl || !mimeType) {
      return NextResponse.json(
        { error: "Missing fileUrl or mimeType" },
        { status: 400 },
      );
    }

    // Only process images and PDFs
    const supportedTypes = [
      "application/pdf",
      "image/png",
      "image/jpeg",
      "image/webp",
    ];
    if (!supportedTypes.includes(mimeType)) {
      return NextResponse.json({
        ocrApplied: false,
        confidence: 0,
        extracted: { date: null, amount: null, taxId: null, issuer: null },
        rawText: "",
        attachmentId: null,
      });
    }

    // Read the file from disk
    const filePath = path.join(process.cwd(), "public", fileUrl);
    let buffer: Buffer;
    try {
      buffer = await fs.readFile(filePath);
    } catch {
      return NextResponse.json(
        { error: "File not found on disk" },
        { status: 404 },
      );
    }

    // Run OCR processing
    const ocrResult = await processOcr(buffer, mimeType);

    // Determine file type
    const fileType = mimeType === "application/pdf" ? "pdf" : "image";

    // Save the OCR result as an ExpenseAttachment record
    await dbConnect();
    const attachment = await ExpenseAttachment.create({
      business: decoded.businessId,
      user: decoded.userId,
      fileName: fileName || path.basename(fileUrl),
      filePath: fileUrl,
      fileType,
      mimeType,
      fileSize: fileSize || buffer.length,
      ocrApplied: true,
      ocrConfidence: ocrResult.confidence,
      ocrRawText: ocrResult.rawText,
      ocrExtracted: ocrResult.extracted,
    });

    return NextResponse.json({
      ocrApplied: true,
      confidence: ocrResult.confidence,
      extracted: ocrResult.extracted,
      rawText: ocrResult.rawText.substring(0, 500), // Truncate for response
      attachmentId: attachment._id.toString(),
    });
  } catch (error) {
    console.error("OCR processing error:", error);
    return NextResponse.json(
      { error: "OCR processing failed" },
      { status: 500 },
    );
  }
}

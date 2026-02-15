import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/utils/jwt";
import { storeFile } from "@/lib/utils/fileStorage";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_MIME = [
  "application/pdf",
  "image/png",
  "image/jpeg",
  "image/webp",
];

export async function POST(req: NextRequest) {
  try {
    const token = req.headers.get("authorization")?.split(" ")[1];
    if (!token)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const decoded = verifyToken(token);
    if (!decoded)
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });

    const formData = await req.formData();
    const file = formData.get("file");

    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    if (!ALLOWED_MIME.includes(file.type)) {
      return NextResponse.json({ error: "Invalid file type" }, { status: 400 });
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: "File too large" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    // Use the file storage utility with UUID naming and optional compression
    const result = await storeFile(
      buffer,
      file.name,
      file.type,
      decoded.businessId,
    );

    return NextResponse.json({
      fileName: file.name,
      storedName: result.fileName,
      fileUrl: result.fileUrl,
      mimeType: result.mimeType,
      fileSize: result.fileSize,
      storageProvider: result.storageProvider,
    });
  } catch (error) {
    console.error("Expense attachment upload error:", error);
    return NextResponse.json(
      { error: "Failed to upload file" },
      { status: 500 },
    );
  }
}

import { Buffer } from "buffer";
import { NextRequest } from "next/server";
import dbConnect from "@/lib/db/connect";
import Product from "@/lib/models/Product";
import { authMiddleware } from "@/lib/middleware/auth";
import {
  generateErrorResponse,
  generateSuccessResponse,
} from "@/lib/utils/helpers";
import { checkPlanLimit } from "@/lib/utils/planValidation";
import { generateDateBasedProductCode } from "@/lib/utils/productCodeGenerator";

type ParsedRow = {
  [key: string]: string | undefined;
  nombre?: string;
  descripcion?: string;
  codigo?: string;
  costo?: string;
  precio?: string;
  stock?: string;
  minstock?: string;
  minStock?: string;
  categoria?: string;
  activo?: string;
  sevendePorPeso?: string;
  sevendeporPeso?: string;
  code?: string;
};

function parseCsv(content: string): ParsedRow[] {
  const lines = content
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);

  if (lines.length < 2) return [];

  const headers = lines[0].split(",").map((h) => h.trim().toLowerCase());

  return lines.slice(1).map((line) => {
    const cells = line.split(",").map((c) => c.trim());
    const row: ParsedRow = {};
    headers.forEach((h, idx) => {
      row[h as keyof ParsedRow] = cells[idx];
    });
    return row;
  });
}

export async function POST(req: NextRequest) {
  try {
    const authResult = await authMiddleware(req);
    if (!authResult.authorized) {
      return generateErrorResponse(authResult.error || "Unauthorized", 401);
    }

    const formData = await req.formData();
    const file = formData.get("file");

    if (!file || !(file instanceof File)) {
      return generateErrorResponse("No se recibió ningún archivo", 400);
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const content = buffer.toString("utf-8");
    const rows = parseCsv(content);

    if (!rows.length) {
      return generateErrorResponse(
        "El archivo debe incluir encabezados y al menos una fila",
        400,
      );
    }

    await dbConnect();

    const businessId = authResult.user!.businessId;
    const existingCount = await Product.countDocuments({ businessId });
    const planCheck = await checkPlanLimit(
      businessId,
      "maxProducts",
      existingCount + rows.length,
    );

    if (!planCheck.allowed) {
      return generateErrorResponse(planCheck.message, 403);
    }

    const results: {
      created: number;
      skipped: number;
      errors: Array<{ row: number; reason: string }>;
    } = { created: 0, skipped: 0, errors: [] };

    const seenCodes = new Set<string>();

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const name = row.nombre || "";
      const cost = parseFloat(row.costo || "");
      const price = parseFloat(row.precio || "");
      const stock = parseInt(row.stock || "0", 10) || 0;
      const minStock = parseInt(row.minstock || row.minStock || "0", 10) || 0;
      const category = row.categoria || "";
      const active = (row.activo || "true").toLowerCase() !== "false";
      const isSoldByWeight =
        (
          row.sevendePorPeso ||
          row["sevendeporPeso"] ||
          "false"
        ).toLowerCase() === "true";
      const description = row.descripcion || "";

      if (!name || !Number.isFinite(cost) || !Number.isFinite(price)) {
        results.skipped += 1;
        results.errors.push({
          row: i + 2,
          reason: "Campos requeridos faltantes",
        });
        continue;
      }

      let finalCode = (row.codigo || row.code || "").trim();

      if (finalCode && seenCodes.has(finalCode)) {
        results.skipped += 1;
        results.errors.push({
          row: i + 2,
          reason: "Código duplicado en el archivo",
        });
        continue;
      }

      if (finalCode) {
        const conflict = await Product.findOne({ businessId, code: finalCode });
        if (conflict) {
          results.skipped += 1;
          results.errors.push({ row: i + 2, reason: "El código ya existe" });
          continue;
        }
      }

      if (!finalCode) {
        // Auto-generate date-based code and ensure uniqueness
        let attempts = 0;
        do {
          finalCode = await generateDateBasedProductCode(businessId);
          attempts++;
        } while (
          attempts < 10 &&
          (seenCodes.has(finalCode) ||
            (await Product.findOne({ businessId, code: finalCode })))
        );
      }

      if (!finalCode) {
        results.skipped += 1;
        results.errors.push({
          row: i + 2,
          reason: "No se pudo generar código",
        });
        continue;
      }

      const margin = price > 0 ? ((price - cost) / price) * 100 : 0;

      const product = new Product({
        businessId,
        name,
        code: finalCode,
        cost,
        price,
        margin,
        stock,
        barcode: "",
        category,
        description,
        minStock,
        active,
        isSoldByWeight,
      });

      await product.save();
      seenCodes.add(finalCode);
      results.created += 1;
    }

    return generateSuccessResponse({
      message: "Archivo importado",
      summary: results,
    });
  } catch (error) {
    console.error("Import products error:", error);
    return generateErrorResponse("Error al importar productos", 500);
  }
}

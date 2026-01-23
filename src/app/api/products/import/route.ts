import { NextRequest } from "next/server";
import { authMiddleware } from "@/lib/middleware/auth";
import {
  generateErrorResponse,
  generateSuccessResponse,
} from "@/lib/utils/helpers";

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

    // NOTE: Aquí solo confirmamos la recepción del archivo.
    // La lógica de parseo y persistencia puede añadirse posteriormente
    // (por ejemplo, usando librerías como xlsx o csv-parse).

    return generateSuccessResponse(
      {
        message: "Archivo recibido. Procesamiento próximo a habilitar.",
        fileName: file.name,
      },
      200,
    );
  } catch (error) {
    console.error("Import products error:", error);
    return generateErrorResponse("Error al importar productos", 500);
  }
}

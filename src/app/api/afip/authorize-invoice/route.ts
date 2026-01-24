import { NextRequest } from "next/server";
import dbConnect from "@/lib/db/connect";
import Invoice from "@/lib/models/Invoice";
import { authMiddleware } from "@/lib/middleware/auth";
import {
  generateErrorResponse,
  generateSuccessResponse,
} from "@/lib/utils/helpers";
import AFIPService from "@/lib/services/afipService";

/**
 * POST /api/afip/authorize-invoice
 * Authorize an invoice with AFIP (get CAE)
 */
export async function POST(req: NextRequest) {
  try {
    const authResult = await authMiddleware(req);
    if (!authResult.authorized) {
      return generateErrorResponse(authResult.error || "Unauthorized", 401);
    }

    const { businessId } = authResult.user!;
    const body = await req.json();
    const { invoiceNumber, invoiceType, clientCUIT, clientName, items, total } =
      body;

    if (!invoiceNumber || !invoiceType || !total || !items) {
      return generateErrorResponse("Missing required fields", 400);
    }

    await dbConnect();

    // Validate CUIT if provided
    if (clientCUIT && !AFIPService.validateCUIT(clientCUIT)) {
      return generateErrorResponse("Invalid client CUIT", 400);
    }

    // Authenticate with AFIP
    const token = await AFIPService.authenticate();

    // Authorize invoice with AFIP
    const authorization = await AFIPService.authorizeInvoice(
      {
        id: invoiceNumber,
        invoiceNumber,
        invoiceType: invoiceType as any,
        date: new Date(),
        clientCUIT: clientCUIT || "",
        clientName: clientName || "Consumidor Final",
        items: items.map((item: any) => ({
          description: item.description,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          vatRate: item.vatRate || 21,
          totalAmount: item.quantity * item.unitPrice,
        })),
        subtotal: total,
        vat: 0,
        total,
        status: "draft",
      },
      token,
    );

    // Save invoice record
    const invoice = new Invoice({
      businessId,
      invoiceNumber,
      invoiceType,
      clientCUIT,
      clientName,
      items,
      total,
      cae: authorization.cae,
      caeExpiryDate: authorization.expiryDate,
      status: "authorized",
      afipAuthorized: true,
    });

    await invoice.save();

    return generateSuccessResponse({
      invoiceNumber,
      cae: authorization.cae,
      caeExpiryDate: authorization.expiryDate,
      authorized: true,
      message: "Invoice authorized successfully with AFIP",
    });
  } catch (error) {
    console.error("AFIP authorization error:", error);
    return generateErrorResponse("Failed to authorize invoice with AFIP", 500);
  }
}

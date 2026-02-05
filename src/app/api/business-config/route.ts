import { NextRequest } from "next/server";
import dbConnect from "@/lib/db/connect";
import Business from "@/lib/models/Business";
import { authMiddleware } from "@/lib/middleware/auth";
import {
  generateErrorResponse,
  generateSuccessResponse,
} from "@/lib/utils/helpers";

export async function GET(req: NextRequest) {
  try {
    const authResult = await authMiddleware(req);
    if (!authResult.authorized) {
      return generateErrorResponse(authResult.error || "Unauthorized", 401);
    }

    const { businessId, userId } = authResult.user!;
    await dbConnect();

    // Find business by businessId or owner
    let business: any = await Business.findOne({
      $or: [{ _id: businessId }, { owner: userId }],
    }).lean();

    // If no business exists, create a default one
    if (!business) {
      const newBusiness = new Business({
        name: "MI NEGOCIO",
        owner: userId,
        email: "info@minegocio.com",
        phone: "(sin teléfono)",
        address: "Dirección del negocio",
        website: "www.minegocio.com",
        cuitRucDni: "00-00000000-0",
        ticketMessage: "¡GRACIAS POR SU COMPRA!\nVuelva pronto",
        ticketLogo: "",
        country: "argentina",
      });
      await newBusiness.save();
      business = newBusiness.toObject();
    }

    if (!business || !business.name) {
      return generateErrorResponse("Failed to create business", 500);
    }

    return generateSuccessResponse({
      businessName: business.name,
      address: business.address || "",
      phone: business.phone || "",
      email: business.email || "",
      website: business.website || "",
      cuitRucDni: business.cuitRucDni || "",
      ticketMessage: business.ticketMessage || "",
      ticketLogo: business.ticketLogo || "",
      country: business.country || "argentina",
      paymentMethods: business.paymentMethods || [
        { id: "cash", name: "Efectivo", enabled: true },
        { id: "bankTransfer", name: "Transferencia Bancaria", enabled: true },
        { id: "qr", name: "Código QR", enabled: true },
        { id: "card", name: "Tarjeta", enabled: false },
        { id: "check", name: "Cheque", enabled: false },
      ],
    });
  } catch (error) {
    console.error("Get business config error:", error);
    return generateErrorResponse("Internal server error", 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    const authResult = await authMiddleware(req);
    if (!authResult.authorized) {
      return generateErrorResponse(authResult.error || "Unauthorized", 401);
    }

    const { businessId, userId } = authResult.user!;
    const body = await req.json();
    const {
      businessName,
      address,
      phone,
      email,
      website,
      cuitRucDni,
      ticketMessage,
      ticketLogo,
      country,
      paymentMethods,
    } = body;

    // Validate required fields
    if (!businessName || !email) {
      return generateErrorResponse("Business name and email are required", 400);
    }

    await dbConnect();

    // Find and update business, or create if doesn't exist
    let business = await Business.findOneAndUpdate(
      {
        $or: [{ _id: businessId }, { owner: userId }],
      },
      {
        name: businessName,
        email,
        phone: phone || "",
        address: address || "",
        website: website || "",
        cuitRucDni: cuitRucDni || "",
        ticketMessage:
          ticketMessage || "¡GRACIAS POR SU COMPRA!\nVuelva pronto",
        ticketLogo: ticketLogo || "",
        country: country || "argentina",
        paymentMethods: paymentMethods || [
          { id: "cash", name: "Efectivo", enabled: true },
          { id: "bankTransfer", name: "Transferencia Bancaria", enabled: true },
          { id: "qr", name: "Código QR", enabled: true },
          { id: "card", name: "Tarjeta", enabled: false },
          { id: "check", name: "Cheque", enabled: false },
        ],
        owner: userId,
      },
      { new: true, upsert: true },
    );

    if (!business) {
      return generateErrorResponse("Failed to update business config", 500);
    }

    return generateSuccessResponse({
      businessName: business.name,
      address: business.address || "",
      phone: business.phone || "",
      email: business.email || "",
      website: business.website || "",
      cuitRucDni: business.cuitRucDni || "",
      ticketMessage: business.ticketMessage || "",
      ticketLogo: business.ticketLogo || "",
      country: business.country || "argentina",
      paymentMethods: business.paymentMethods || [],
    });
  } catch (error) {
    console.error("Update business config error:", error);
    return generateErrorResponse("Internal server error", 500);
  }
}

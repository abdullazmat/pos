import { NextResponse } from "next/server";
import dbConnect from "@/lib/db/connect";
import Client from "@/lib/models/Client";
import { verifyToken } from "@/lib/utils/jwt";
import { MAX_DISCOUNT_PERCENT } from "@/lib/utils/discounts";

const parseDiscountLimit = (value: unknown) => {
  if (value === null || value === undefined || value === "") return null;
  const numeric = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(numeric)) return "invalid";
  if (numeric > 0 && numeric < 1) return numeric * 100;
  return numeric;
};

export async function GET(request: Request) {
  try {
    const token = request.headers.get("authorization")?.split(" ")[1];
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    await dbConnect();

    const clients = await Client.find({
      business: decoded.businessId,
    }).sort({ name: 1 });

    return NextResponse.json({ clients });
  } catch (error) {
    console.error("Get clients error:", error);
    return NextResponse.json(
      { error: "Failed to fetch clients" },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const token = request.headers.get("authorization")?.split(" ")[1];
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const body = await request.json();
    const { name, document, phone, email, address, discountLimit } = body;

    if (!name) {
      return NextResponse.json(
        { error: "Client name is required" },
        { status: 400 },
      );
    }

    const parsedDiscountLimit = parseDiscountLimit(discountLimit);
    if (
      parsedDiscountLimit === "invalid" ||
      (parsedDiscountLimit !== null &&
        (parsedDiscountLimit < 0 || parsedDiscountLimit > MAX_DISCOUNT_PERCENT))
    ) {
      return NextResponse.json(
        {
          error: `Discount limit must be a number between 0 and ${MAX_DISCOUNT_PERCENT}`,
        },
        { status: 400 },
      );
    }

    await dbConnect();

    const client = await Client.create({
      name,
      document,
      phone,
      email,
      address,
      discountLimit: parsedDiscountLimit,
      business: decoded.businessId,
    });

    return NextResponse.json({ client }, { status: 201 });
  } catch (error) {
    console.error("Create client error:", error);
    return NextResponse.json(
      { error: "Failed to create client" },
      { status: 500 },
    );
  }
}

export async function PUT(request: Request) {
  try {
    const token = request.headers.get("authorization")?.split(" ")[1];
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const body = await request.json();
    const { id, name, document, phone, email, address, discountLimit } = body;
    const discountLimitProvided = Object.prototype.hasOwnProperty.call(
      body,
      "discountLimit",
    );

    if (!id || !name) {
      return NextResponse.json(
        { error: "Client ID and name are required" },
        { status: 400 },
      );
    }

    const parsedDiscountLimit = discountLimitProvided
      ? parseDiscountLimit(discountLimit)
      : null;
    if (
      discountLimitProvided &&
      (parsedDiscountLimit === "invalid" ||
        (parsedDiscountLimit !== null &&
          (parsedDiscountLimit < 0 ||
            parsedDiscountLimit > MAX_DISCOUNT_PERCENT)))
    ) {
      return NextResponse.json(
        {
          error: `Discount limit must be a number between 0 and ${MAX_DISCOUNT_PERCENT}`,
        },
        { status: 400 },
      );
    }

    await dbConnect();

    const updatePayload: Record<string, unknown> = {
      name,
      document,
      phone,
      email,
      address,
    };
    if (discountLimitProvided) {
      updatePayload.discountLimit = parsedDiscountLimit;
    }

    const client = await Client.findOneAndUpdate(
      { _id: id, business: decoded.businessId },
      updatePayload,
      { new: true },
    );

    if (!client) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 });
    }

    return NextResponse.json({ client });
  } catch (error) {
    console.error("Update client error:", error);
    return NextResponse.json(
      { error: "Failed to update client" },
      { status: 500 },
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const token = request.headers.get("authorization")?.split(" ")[1];
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Client ID is required" },
        { status: 400 },
      );
    }

    await dbConnect();

    const client = await Client.findOneAndDelete({
      _id: id,
      business: decoded.businessId,
    });

    if (!client) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Client deleted successfully" });
  } catch (error) {
    console.error("Delete client error:", error);
    return NextResponse.json(
      { error: "Failed to delete client" },
      { status: 500 },
    );
  }
}

import { NextResponse } from "next/server";
import dbConnect from "@/lib/db/connect";
import SavedFilterPreset from "@/lib/models/SavedFilterPreset";
import { verifyToken } from "@/lib/utils/jwt";

// GET - List all saved filter presets for the user
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

    const presets = await SavedFilterPreset.find({
      business: decoded.businessId,
      user: decoded.userId,
    }).sort({ createdAt: -1 });

    return NextResponse.json({ presets });
  } catch (error) {
    console.error("Get filter presets error:", error);
    return NextResponse.json(
      { error: "Failed to fetch filter presets" },
      { status: 500 },
    );
  }
}

// POST - Create a new saved filter preset
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
    const { name, filters, isDefault } = body;

    if (!name || !filters) {
      return NextResponse.json(
        { error: "Name and filters are required" },
        { status: 400 },
      );
    }

    await dbConnect();

    // Limit to 20 presets per user
    const count = await SavedFilterPreset.countDocuments({
      business: decoded.businessId,
      user: decoded.userId,
    });
    if (count >= 20) {
      return NextResponse.json(
        { error: "Maximum 20 saved filters allowed" },
        { status: 400 },
      );
    }

    // If setting as default, unset other defaults
    if (isDefault) {
      await SavedFilterPreset.updateMany(
        { business: decoded.businessId, user: decoded.userId },
        { $set: { isDefault: false } },
      );
    }

    const preset = await SavedFilterPreset.create({
      name,
      filters,
      isDefault: isDefault || false,
      business: decoded.businessId,
      user: decoded.userId,
    });

    return NextResponse.json({ preset }, { status: 201 });
  } catch (error) {
    console.error("Create filter preset error:", error);
    return NextResponse.json(
      { error: "Failed to create filter preset" },
      { status: 500 },
    );
  }
}

// DELETE - Remove a saved filter preset
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
        { error: "Preset ID is required" },
        { status: 400 },
      );
    }

    await dbConnect();

    const preset = await SavedFilterPreset.findOneAndDelete({
      _id: id,
      business: decoded.businessId,
      user: decoded.userId,
    });

    if (!preset) {
      return NextResponse.json(
        { error: "Filter preset not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({ message: "Filter preset deleted" });
  } catch (error) {
    console.error("Delete filter preset error:", error);
    return NextResponse.json(
      { error: "Failed to delete filter preset" },
      { status: 500 },
    );
  }
}

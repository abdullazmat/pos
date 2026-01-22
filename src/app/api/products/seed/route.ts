import { NextRequest } from "next/server";
import dbConnect from "@/lib/db/connect";
import Product from "@/lib/models/Product";
import { authMiddleware } from "@/lib/middleware/auth";
import {
  generateErrorResponse,
  generateSuccessResponse,
} from "@/lib/utils/helpers";

export async function POST(req: NextRequest) {
  try {
    const auth = await authMiddleware(req);
    if (!auth.authorized) {
      return generateErrorResponse(auth.error || "Unauthorized", 401);
    }

    const user = auth.user!;
    if (user.role !== "admin") {
      return generateErrorResponse("Forbidden", 403);
    }

    await dbConnect();

    const existingCount = await Product.countDocuments({
      businessId: user.businessId,
    });

    const samples = [
      {
        name: "Manzanas Fuji",
        code: "SKU-001",
        barcode: "770000000001",
        cost: 300,
        price: 500,
        stock: 50,
        minStock: 10,
        category: "Frutas",
      },
      {
        name: "Bananas",
        code: "SKU-002",
        barcode: "770000000002",
        cost: 200,
        price: 380,
        stock: 12,
        minStock: 20,
        category: "Frutas",
      },
      {
        name: "Leche Entera 1L",
        code: "SKU-003",
        barcode: "770000000003",
        cost: 600,
        price: 850,
        stock: 0,
        minStock: 5,
        category: "Lácteos",
      },
      {
        name: "Harina 000 1Kg",
        code: "SKU-004",
        barcode: "770000000004",
        cost: 450,
        price: 700,
        stock: 8,
        minStock: 12,
        category: "Almacén",
      },
      {
        name: "Azúcar 1Kg",
        code: "SKU-005",
        barcode: "770000000005",
        cost: 500,
        price: 780,
        stock: 30,
        minStock: 10,
        category: "Almacén",
      },
      {
        name: "Aceite Girasol 900ml",
        code: "SKU-006",
        barcode: "770000000006",
        cost: 1200,
        price: 1600,
        stock: 4,
        minStock: 6,
        category: "Almacén",
      },
      {
        name: "Arroz Largo 1Kg",
        code: "SKU-007",
        barcode: "770000000007",
        cost: 700,
        price: 980,
        stock: 20,
        minStock: 10,
        category: "Almacén",
      },
      {
        name: "Fideos Spaghetti 500g",
        code: "SKU-008",
        barcode: "770000000008",
        cost: 350,
        price: 600,
        stock: 40,
        minStock: 15,
        category: "Almacén",
      },
      {
        name: "Gaseosa Cola 2.25L",
        code: "SKU-009",
        barcode: "770000000009",
        cost: 1500,
        price: 2100,
        stock: 6,
        minStock: 10,
        category: "Bebidas",
      },
      {
        name: "Cerveza Rubia 473ml",
        code: "SKU-010",
        barcode: "770000000010",
        cost: 900,
        price: 1300,
        stock: 24,
        minStock: 12,
        category: "Bebidas",
      },
    ];

    const upserts = [] as Promise<any>[];

    for (const s of samples) {
      const margin = ((s.price - s.cost) / s.price) * 100;
      upserts.push(
        Product.updateOne(
          { businessId: user.businessId, code: s.code },
          {
            $setOnInsert: {
              businessId: user.businessId,
            },
            $set: {
              name: s.name,
              code: s.code,
              barcode: s.barcode,
              cost: s.cost,
              price: s.price,
              margin,
              stock: s.stock,
              minStock: s.minStock,
              category: s.category,
            },
          },
          { upsert: true }
        )
      );
    }

    await Promise.all(upserts);

    const total = await Product.countDocuments({ businessId: user.businessId });

    return generateSuccessResponse({
      insertedOrUpdated: samples.length,
      total,
    });
  } catch (err) {
    console.error("Seed products error:", err);
    return generateErrorResponse("Internal server error", 500);
  }
}

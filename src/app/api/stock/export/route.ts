import { NextRequest } from "next/server";
import dbConnect from "@/lib/db/connect";
import Product from "@/lib/models/Product";
import { authMiddleware } from "@/lib/middleware/auth";

function toCsvValue(value: unknown): string {
  if (value === null || value === undefined) return "";
  const str = String(value);
  if (str.includes(",") || str.includes("\n") || str.includes('"')) {
    return '"' + str.replace(/"/g, '""') + '"';
  }
  return str;
}

export async function GET(req: NextRequest) {
  const auth = await authMiddleware(req);
  if (!auth.authorized) {
    return new Response(
      JSON.stringify({ error: auth.error || "Unauthorized" }),
      {
        status: 401,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  const { businessId } = auth.user!;

  try {
    await dbConnect();

    const products = await Product.find({ businessId })
      .select(
        "name code barcode stock minStock cost price margin category updatedAt"
      )
      .sort({ name: 1 })
      .lean();

    const headers = [
      "name",
      "code",
      "barcode",
      "stock",
      "minStock",
      "cost",
      "price",
      "margin",
      "category",
      "updatedAt",
    ];

    const lines: string[] = [];
    lines.push(headers.join(","));

    for (const p of products) {
      const row = [
        toCsvValue(p.name),
        toCsvValue(p.code),
        toCsvValue(p.barcode ?? ""),
        toCsvValue(p.stock ?? 0),
        toCsvValue(p.minStock ?? 0),
        toCsvValue(p.cost ?? 0),
        toCsvValue(p.price ?? 0),
        toCsvValue(typeof p.margin === "number" ? p.margin.toFixed(2) : ""),
        toCsvValue(p.category ?? ""),
        toCsvValue(p.updatedAt ? new Date(p.updatedAt).toISOString() : ""),
      ];
      lines.push(row.join(","));
    }

    const csv = lines.join("\n");
    const now = new Date();
    const pad = (n: number) => String(n).padStart(2, "0");
    const fileName = `stock-${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(
      now.getDate()
    )}-${pad(now.getHours())}${pad(now.getMinutes())}${pad(
      now.getSeconds()
    )}.csv`;

    return new Response(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename=${fileName}`,
        "Cache-Control": "no-store",
      },
    });
  } catch (err) {
    console.error("Export stock CSV error:", err);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

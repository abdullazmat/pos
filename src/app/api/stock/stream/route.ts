import { NextRequest } from "next/server";
import dbConnect from "@/lib/db/connect";
import Product from "@/lib/models/Product";
import mongoose from "mongoose";
import { verifyAccessToken } from "@/lib/utils/jwt";
import { addStockClient, removeStockClient } from "@/lib/server/stockStream";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const token = searchParams.get("token");

  if (!token) {
    return new Response("Missing token", { status: 401 });
  }

  const user = verifyAccessToken(token);
  if (!user) {
    return new Response("Invalid token", { status: 401 });
  }

  try {
    await dbConnect();
  } catch (e) {
    return new Response("DB connection failed", { status: 500 });
  }

  const stream = new ReadableStream<string>({
    async start(controller) {
      const client = { businessId: user.businessId, controller };
      addStockClient(client);

      controller.enqueue(`event: connected\n`);
      controller.enqueue(`data: ok\n\n`);

      // Heartbeat to keep the connection alive
      const heartbeat = setInterval(() => {
        controller.enqueue(`:\n\n`);
      }, 15000);

      const businessObjectId = new mongoose.Types.ObjectId(user.businessId);

      let changeStream: ReturnType<typeof Product.watch> | null = null;

      try {
        changeStream = Product.watch(
          [{ $match: { "fullDocument.businessId": businessObjectId } }],
          { fullDocument: "updateLookup" },
        );
      } catch (err) {
        controller.enqueue(
          `event: error\ndata: {"message":"Change streams unsupported"}\n\n`,
        );
        // Keep stream open for in-memory broadcasts
      }

      const onChange = (change: any) => {
        try {
          const payload = {
            operationType: change.operationType,
            product: change.fullDocument
              ? {
                  _id: change.fullDocument._id,
                  name: change.fullDocument.name,
                  code: change.fullDocument.code,
                  stock: change.fullDocument.stock,
                  minStock: change.fullDocument.minStock,
                  price: change.fullDocument.price,
                  cost: change.fullDocument.cost,
                }
              : undefined,
            documentKey: change.documentKey,
          };
          controller.enqueue(
            `event: product\ndata: ${JSON.stringify(payload)}\n\n`,
          );
        } catch {
          // ignore malformed payloads
        }
      };

      changeStream?.on("change", onChange);

      const abortHandler = () => {
        try {
          changeStream?.removeListener("change", onChange);
          changeStream?.close();
        } catch {}
        clearInterval(heartbeat);
        removeStockClient(client);
        controller.close();
      };

      // @ts-ignore - NextRequest has signal in Node runtime
      req.signal?.addEventListener("abort", abortHandler);
    },
    cancel() {
      // no-op, cleanup handled by abort
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}

import { NextRequest } from "next/server";
import dbConnect from "@/lib/db/connect";
import Product from "@/lib/models/Product";
import mongoose from "mongoose";
import { verifyAccessToken } from "@/lib/utils/jwt";

export const runtime = "nodejs";

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

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const encoder = new TextEncoder();

      // Heartbeat to keep the connection alive
      const heartbeat = setInterval(() => {
        controller.enqueue(encoder.encode(`:\n\n`));
      }, 15000);

      const businessObjectId = new mongoose.Types.ObjectId(user.businessId);

      let changeStream: ReturnType<typeof Product.watch> | null = null;

      try {
        changeStream = Product.watch(
          [{ $match: { "fullDocument.businessId": businessObjectId } }],
          { fullDocument: "updateLookup" }
        );
      } catch (err) {
        // Change streams may not be supported by the deployment
        controller.enqueue(
          encoder.encode(
            `event: error\ndata: {"message":"Change streams unsupported"}\n\n`
          )
        );
        clearInterval(heartbeat);
        controller.close();
        return;
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
            encoder.encode(
              `event: product\ndata: ${JSON.stringify(payload)}\n\n`
            )
          );
        } catch (e) {
          // ignore malformed payloads
        }
      };

      changeStream.on("change", onChange);

      // If the client disconnects, stop the stream
      const abortHandler = () => {
        try {
          changeStream?.removeListener("change", onChange);
          changeStream?.close();
        } catch {}
        clearInterval(heartbeat);
        controller.close();
      };

      // @ts-ignore - NextRequest has signal in Node runtime
      req.signal?.addEventListener("abort", abortHandler);
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

import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json(
    { error: "Stripe payments are disabled" },
    { status: 410 },
  );
}

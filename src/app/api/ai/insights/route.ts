import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db/connect";
import mongoose from "mongoose";
import { verifyToken } from "@/lib/utils/jwt";
import { AIEngine } from "@/lib/services/aiEngine";
import "@/lib/models/Subscription"; // Ensure model is registered
import Business from "@/lib/models/Business";

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get("authorization")?.split(" ")[1];
    if (!token) return NextResponse.json({ error: "No token" }, { status: 401 });

    const decoded = verifyToken(token);
    if (!decoded) return NextResponse.json({ error: "Invalid token" }, { status: 401 });

    await dbConnect();

    // Verify plan access
    const subscription = await mongoose.model("Subscription").findOne({ businessId: decoded.businessId });
    const planId = subscription?.planId?.toUpperCase() || "BASIC";
    console.log(`[AI ROUTE] Plan ID for business ${decoded.businessId}: ${planId}`);
    
    // BASIC Plan has no AI features according to strategy
    if (planId === "BASIC") {
      return NextResponse.json({ 
        success: true, 
        data: { 
          insights: [], 
          locked: true,
          message: "Actualiza al plan PRO para desbloquear insights con IA" 
        } 
      });
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type") || "insights";

    if (type === "rankings") {
      const rankings = await AIEngine.getProductRanking(decoded.businessId);
      return NextResponse.json({ success: true, data: rankings });
    }

    if (type === "forecast") {
      const forecast = await AIEngine.getSalesForecast(decoded.businessId);
      return NextResponse.json({ success: true, data: forecast });
    }

    if (type === "cross-sell") {
      const ids = searchParams.get("productIds")?.split(",") || [];
      const suggestions = await AIEngine.getCrossSellSuggestions(ids, decoded.businessId);
      return NextResponse.json({ success: true, data: suggestions });
    }

    // Default to insights
    const insights = await AIEngine.getAutomaticInsights(decoded.businessId);
    return NextResponse.json({ 
      success: true, 
      data: { 
        insights,
        locked: false
      } 
    });

  } catch (error: any) {
    console.error("AI Insights Error:", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}

import { NextResponse } from "next/server";
import dbConnect from "@/lib/db/connect";
import Expense from "@/lib/models/Expense";
import ExpenseCategoryRule, {
  DEFAULT_CATEGORY_RULES,
} from "@/lib/models/ExpenseCategoryRule";
import { verifyToken } from "@/lib/utils/jwt";

interface SuggestionResult {
  category: string;
  confidence: "high" | "medium" | "low";
  source: "rule" | "history";
}

// GET - Get suggested category for an expense description
// Endpoint: /api/expenses/suggest-category?description=...
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

    const { searchParams } = new URL(request.url);
    const description = searchParams.get("description")?.trim();

    if (!description || description.length < 2) {
      return NextResponse.json({ suggestion: null });
    }

    await dbConnect();

    const descLower = description.toLowerCase();

    // ── Phase 1: Rule-based matching ─────────────────────────────────
    const customRules = await ExpenseCategoryRule.find({
      business: decoded.businessId,
      isDefault: false,
    }).sort({ priority: -1 });

    let suggestion: SuggestionResult | null = null;

    // Check custom rules first (higher priority)
    for (const rule of customRules) {
      const matchCount = rule.keywords.filter((kw: string) =>
        descLower.includes(kw.toLowerCase()),
      ).length;
      if (matchCount > 0) {
        suggestion = {
          category: rule.category,
          confidence: matchCount >= 2 ? "high" : "medium",
          source: "rule",
        };
        break;
      }
    }

    // Check default rules if no custom rule matched
    if (!suggestion) {
      let defaultRules = await ExpenseCategoryRule.find({
        business: decoded.businessId,
        isDefault: true,
      });

      const ruleSet =
        defaultRules.length > 0
          ? defaultRules.map((r) => ({
              category: r.category,
              keywords: r.keywords as string[],
            }))
          : DEFAULT_CATEGORY_RULES;

      for (const rule of ruleSet) {
        const matchCount = rule.keywords.filter((kw: string) =>
          descLower.includes(kw.toLowerCase()),
        ).length;
        if (matchCount > 0) {
          suggestion = {
            category: rule.category,
            confidence: matchCount >= 2 ? "medium" : "low",
            source: "rule",
          };
          break;
        }
      }
    }

    // ── Phase 2: Historical pattern matching ─────────────────────────
    if (!suggestion) {
      const words = descLower.split(/\s+/).filter((w) => w.length >= 3);
      if (words.length > 0) {
        const regexPatterns = words.map((w) => new RegExp(w, "i"));
        const historicalMatch = await Expense.aggregate([
          {
            $match: {
              business: decoded.businessId,
              category: { $exists: true, $ne: "" },
              description: { $in: regexPatterns },
            },
          },
          {
            $group: {
              _id: "$category",
              count: { $sum: 1 },
              lastUsed: { $max: "$date" },
            },
          },
          { $sort: { count: -1 } },
          { $limit: 1 },
        ]);

        if (historicalMatch.length > 0) {
          suggestion = {
            category: historicalMatch[0]._id,
            confidence: historicalMatch[0].count >= 5 ? "medium" : "low",
            source: "history",
          };
        }
      }
    }

    // Count total expenses for ML readiness indicator
    const totalExpenses = await Expense.countDocuments({
      business: decoded.businessId,
    });

    return NextResponse.json({
      suggestion,
      mlReady: totalExpenses >= 200,
    });
  } catch (error) {
    console.error("Suggest category error:", error);
    return NextResponse.json(
      { error: "Failed to suggest category" },
      { status: 500 },
    );
  }
}

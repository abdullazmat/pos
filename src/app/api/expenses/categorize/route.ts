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

// GET - Get category suggestion for a description
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
    // First check custom business rules
    const customRules = await ExpenseCategoryRule.find({
      business: decoded.businessId,
      isDefault: false,
    }).sort({ priority: -1 });

    let ruleSuggestion: SuggestionResult | null = null;

    // Check custom rules first (higher priority)
    for (const rule of customRules) {
      const matchCount = rule.keywords.filter((kw: string) =>
        descLower.includes(kw.toLowerCase()),
      ).length;
      if (matchCount > 0) {
        ruleSuggestion = {
          category: rule.category,
          confidence: matchCount >= 2 ? "high" : "medium",
          source: "rule",
        };
        break;
      }
    }

    // Check default rules if no custom rule matched
    if (!ruleSuggestion) {
      // Also check business-level defaults (seeded on first use)
      let defaultRules = await ExpenseCategoryRule.find({
        business: decoded.businessId,
        isDefault: true,
      });

      // If no default rules seeded yet for this business, use hardcoded defaults
      const ruleSet =
        defaultRules.length > 0
          ? defaultRules.map((r) => ({
              category: r.category,
              keywords: r.keywords as string[],
            }))
          : DEFAULT_CATEGORY_RULES;

      for (const rule of ruleSet) {
        const matchCount = rule.keywords.filter((kw) =>
          descLower.includes(kw.toLowerCase()),
        ).length;
        if (matchCount > 0) {
          ruleSuggestion = {
            category: rule.category,
            confidence: matchCount >= 2 ? "high" : "medium",
            source: "rule",
          };
          break;
        }
      }
    }

    // ── Phase 2: Historical pattern matching ─────────────────────────
    // Search for similar past expenses with categories
    let historySuggestion: SuggestionResult | null = null;

    // Only run if we have enough data for meaningful patterns
    const totalExpenses = await Expense.countDocuments({
      business: decoded.businessId,
      category: { $exists: true, $ne: "" },
    });

    if (totalExpenses >= 5) {
      // Build a text search using words from the description
      const words = descLower
        .split(/\s+/)
        .filter((w) => w.length >= 3)
        .slice(0, 5);

      if (words.length > 0) {
        // Build regex pattern to match any of the words
        const pattern = words
          .map((w) => w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
          .join("|");

        const pipeline = [
          {
            $match: {
              business: decoded.businessId,
              category: { $exists: true, $ne: "" },
              description: { $regex: pattern, $options: "i" },
            },
          },
          {
            $group: {
              _id: "$category",
              count: { $sum: 1 },
            },
          },
          { $sort: { count: -1 as const } },
          { $limit: 3 },
        ];

        const results = await Expense.aggregate(pipeline);

        if (results.length > 0) {
          const topCategory = results[0];
          const totalMatches = results.reduce(
            (sum: number, r: any) => sum + r.count,
            0,
          );
          const ratio = topCategory.count / totalMatches;

          // Determine confidence based on ratio and total matches
          let confidence: "high" | "medium" | "low";
          if (ratio >= 0.7 && topCategory.count >= 3) {
            confidence = "high";
          } else if (ratio >= 0.5 || topCategory.count >= 2) {
            confidence = "medium";
          } else {
            confidence = "low";
          }

          // Phase 2 ML-readiness: if 200+ expenses, boost confidence
          if (totalExpenses >= 200 && confidence === "medium") {
            confidence = "high";
          }

          historySuggestion = {
            category: topCategory._id,
            confidence,
            source: "history",
          };
        }
      }
    }

    // ── Combine results ──────────────────────────────────────────────
    // Rule-based has priority for "high" confidence, otherwise pick best
    let suggestion: SuggestionResult | null = null;

    if (ruleSuggestion && historySuggestion) {
      // If both match same category, boost to high
      if (
        ruleSuggestion.category.toLowerCase() ===
        historySuggestion.category.toLowerCase()
      ) {
        suggestion = {
          category: ruleSuggestion.category,
          confidence: "high",
          source: "rule",
        };
      } else if (ruleSuggestion.confidence === "high") {
        suggestion = ruleSuggestion;
      } else if (historySuggestion.confidence === "high") {
        suggestion = historySuggestion;
      } else {
        // Default to rule-based
        suggestion = ruleSuggestion;
      }
    } else {
      suggestion = ruleSuggestion || historySuggestion;
    }

    return NextResponse.json({
      suggestion,
      totalHistoricalExpenses: totalExpenses,
      mlReady: totalExpenses >= 200,
    });
  } catch (error) {
    console.error("Category suggestion error:", error);
    return NextResponse.json(
      { error: "Failed to get suggestion" },
      { status: 500 },
    );
  }
}

// POST - Save/Update custom category rules
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
    const { category, keywords, priority } = body;

    if (!category || !keywords || !Array.isArray(keywords)) {
      return NextResponse.json(
        { error: "Category and keywords array are required" },
        { status: 400 },
      );
    }

    await dbConnect();

    // Upsert: update if exists for this business+category, create otherwise
    const rule = await ExpenseCategoryRule.findOneAndUpdate(
      {
        business: decoded.businessId,
        category: category.trim(),
        isDefault: false,
      },
      {
        $set: {
          keywords: keywords.map((k: string) => k.trim().toLowerCase()),
          priority: priority || 0,
        },
        $setOnInsert: {
          business: decoded.businessId,
          category: category.trim(),
          isDefault: false,
        },
      },
      { upsert: true, new: true },
    );

    return NextResponse.json({ rule }, { status: 200 });
  } catch (error) {
    console.error("Save category rule error:", error);
    return NextResponse.json(
      { error: "Failed to save category rule" },
      { status: 500 },
    );
  }
}

// PUT - Seed default rules for a business (called once)
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

    await dbConnect();

    // Check if defaults already seeded
    const existing = await ExpenseCategoryRule.countDocuments({
      business: decoded.businessId,
      isDefault: true,
    });

    if (existing > 0) {
      return NextResponse.json({
        message: "Defaults already seeded",
        seeded: false,
      });
    }

    // Seed default rules
    const docs = DEFAULT_CATEGORY_RULES.map((rule) => ({
      business: decoded.businessId,
      category: rule.category,
      keywords: rule.keywords,
      priority: 0,
      isDefault: true,
    }));

    await ExpenseCategoryRule.insertMany(docs);

    return NextResponse.json({
      message: "Default rules seeded",
      seeded: true,
      count: docs.length,
    });
  } catch (error) {
    console.error("Seed category rules error:", error);
    return NextResponse.json(
      { error: "Failed to seed rules" },
      { status: 500 },
    );
  }
}

// DELETE - Remove a custom category rule
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
    const ruleId = searchParams.get("id");

    if (!ruleId) {
      return NextResponse.json(
        { error: "Rule ID is required" },
        { status: 400 },
      );
    }

    await dbConnect();

    const rule = await ExpenseCategoryRule.findOneAndDelete({
      _id: ruleId,
      business: decoded.businessId,
      isDefault: false, // cannot delete default rules
    });

    if (!rule) {
      return NextResponse.json(
        { error: "Rule not found or is a default rule" },
        { status: 404 },
      );
    }

    return NextResponse.json({ message: "Rule deleted" });
  } catch (error) {
    console.error("Delete category rule error:", error);
    return NextResponse.json(
      { error: "Failed to delete rule" },
      { status: 500 },
    );
  }
}

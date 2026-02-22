/**
 * Smart Suggestion Engine (AI Phase 1)
 * 
 * Calculates suggested purchase quantities using:
 * - Average daily sales (7/14/30 days)
 * - Target coverage days
 * - Supplier lead time
 * - Current stock
 * - Purchase multiple
 * 
 * Base formula:
 *   (average_daily_sales × total_coverage_days) − current_stock
 *   Then round up according to purchase_multiple.
 * 
 * Smart Rules:
 * - Do not suggest products with no rotation in 30 days (unless essential/minStock > 0)
 * - Prioritize critical products (stock-out risk)
 * - Adjust for recent sales trends
 * - Allow budget limit
 * - Choose recommended supplier (preferred or lowest cost)
 */

import mongoose from "mongoose";
import Sale from "@/lib/models/Sale";
import Product from "@/lib/models/Product";
import ProductSupplier from "@/lib/models/ProductSupplier";

export interface SuggestionItem {
  productId: string;
  productName: string;
  productCode: string;
  currentStock: number;
  minStock: number;
  avgDailySales7: number;
  avgDailySales14: number;
  avgDailySales30: number;
  trendMultiplier: number;
  suggestedQuantity: number;
  estimatedCost: number;
  subtotal: number;
  coverageDays: number;
  leadTimeDays: number;
  purchaseMultiple: number;
  purchasePresentation: string;
  daysUntilStockout: number;
  priority: "critical" | "high" | "medium" | "low";
  reason: string;
  reasonParts?: Array<{ key: string; params?: Record<string, any> }>;
  supplierId?: string;
  supplierName?: string;
}

export interface SuggestionResult {
  suggestions: SuggestionItem[];
  estimatedTotal: number;
  criticalCount: number;
  highCount: number;
  mediumCount: number;
  lowCount: number;
}

interface SuggestionOptions {
  businessId: string;
  supplierId?: string;
  coverageDays?: number; // default 14
  budgetLimit?: number;
  includeNoRotation?: boolean;
}

/**
 * Calculate average daily sales for a product over N days
 */
async function getAverageDailySales(
  businessId: string,
  productId: string,
  days: number,
): Promise<number> {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const result = await Sale.aggregate([
    {
      $match: {
        businessId: new mongoose.Types.ObjectId(businessId),
        createdAt: { $gte: startDate },
      },
    },
    { $unwind: "$items" },
    {
      $match: {
        "items.productId": new mongoose.Types.ObjectId(productId),
      },
    },
    {
      $group: {
        _id: null,
        totalQuantity: {
          $sum: {
            $cond: [
              { $eq: [{ $type: "$items.quantity" }, "decimal"] },
              { $toDouble: "$items.quantity" },
              "$items.quantity",
            ],
          },
        },
      },
    },
  ]);

  const totalSold = result.length > 0 ? result[0].totalQuantity : 0;
  return totalSold / days;
}

/**
 * Calculate trend multiplier comparing 7-day vs 30-day average
 * > 1 means growing sales, < 1 means declining
 */
function calculateTrendMultiplier(
  avg7: number,
  avg30: number,
): number {
  if (avg30 === 0) return avg7 > 0 ? 1.2 : 1;
  const ratio = avg7 / avg30;
  // Clamp between 0.5 and 2.0 to avoid extreme adjustments
  return Math.max(0.5, Math.min(2.0, ratio));
}

/**
 * Round up to the nearest purchase multiple
 */
function roundToMultiple(quantity: number, multiple: number): number {
  if (multiple <= 1) return Math.ceil(quantity);
  return Math.ceil(quantity / multiple) * multiple;
}

/**
 * Determine suggestion priority based on days until stockout
 */
function determinePriority(
  daysUntilStockout: number,
  leadTimeDays: number,
): "critical" | "high" | "medium" | "low" {
  if (daysUntilStockout <= 0) return "critical";
  if (daysUntilStockout <= leadTimeDays) return "high";
  if (daysUntilStockout <= leadTimeDays * 2) return "medium";
  return "low";
}

/**
 * Generate a human-readable reason for the suggestion
 */
function generateReasonParts(
  priority: string,
  daysUntilStockout: number,
  currentStock: number,
  avgDaily: number,
  trendMultiplier: number,
): Array<{ key: string; params?: Record<string, any> }> {
  const parts: Array<{ key: string; params?: Record<string, any> }> = [];
  
  if (priority === "critical") {
    if (currentStock <= 0) {
      parts.push({ key: "reasons.noStock" });
    } else {
      parts.push({ key: "reasons.criticalStock", params: { days: daysUntilStockout.toFixed(0) } });
    }
  } else if (priority === "high") {
    parts.push({ key: "reasons.lowStock", params: { days: daysUntilStockout.toFixed(0) } });
  } else if (priority === "medium") {
    parts.push({ key: "reasons.recommended" });
  } else {
    parts.push({ key: "reasons.preventive" });
  }

  if (trendMultiplier > 1.15) {
    parts.push({ key: "reasons.growingTrend", params: { percent: ((trendMultiplier - 1) * 100).toFixed(0) } });
  } else if (trendMultiplier < 0.85) {
    parts.push({ key: "reasons.decliningTrend", params: { percent: ((trendMultiplier - 1) * 100).toFixed(0) } });
  }

  if (avgDaily > 0) {
    parts.push({ key: "reasons.dailySales", params: { amount: avgDaily.toFixed(1) } });
  } else if (currentStock === 0) {
    parts.push({ key: "reasons.noRotation" });
  }

  return parts;
}

/**
 * Main function: Generate smart purchase suggestions
 */
export async function generateSmartSuggestions(
  options: SuggestionOptions,
): Promise<SuggestionResult> {
  const {
    businessId,
    supplierId,
    coverageDays = 14,
    budgetLimit,
    includeNoRotation = false,
  } = options;

  // 1. Get products associated with this supplier (or all products)
  let productFilter: Record<string, any> = {
    businessId: new mongoose.Types.ObjectId(businessId),
    active: true,
  };

  const productSupplierMap = new Map<string, any>();

  try {
    if (supplierId && mongoose.Types.ObjectId.isValid(supplierId)) {
      // Get products linked to this specific supplier
      const links = await ProductSupplier.find({
        businessId: new mongoose.Types.ObjectId(businessId),
        supplierId: new mongoose.Types.ObjectId(supplierId),
        active: true,
      }).lean();

      if (links.length > 0) {
        const productIds = links.map((l: any) => l.productId);
        productFilter._id = { $in: productIds };

        for (const link of links as any[]) {
          productSupplierMap.set(String(link.productId), {
            lastCost: link.lastCost || 0,
            averageCost: link.averageCost || 0,
            purchaseMultiple: link.purchaseMultiple || 1,
            purchasePresentation: link.purchasePresentation || "unit",
            leadTimeDays: link.leadTimeDays || 1,
            supplierId: String(link.supplierId),
            preferredSupplier: link.preferredSupplier || false,
          });
        }
      } else {
        // No links found for this supplier, return empty suggestions
        return {
          suggestions: [],
          estimatedTotal: 0,
          criticalCount: 0,
          highCount: 0,
          mediumCount: 0,
          lowCount: 0,
        };
      }
    } else {
      // Get all product-supplier links and use preferred suppliers
      const allLinks = await ProductSupplier.find({
        businessId: new mongoose.Types.ObjectId(businessId),
        active: true,
      }).lean();

      for (const link of allLinks as any[]) {
        const pid = String(link.productId);
        const existing = productSupplierMap.get(pid);
        if (!existing || (link.preferredSupplier && !existing.preferredSupplier)) {
          productSupplierMap.set(pid, {
            lastCost: link.lastCost || 0,
            averageCost: link.averageCost || 0,
            purchaseMultiple: link.purchaseMultiple || 1,
            purchasePresentation: link.purchasePresentation || "unit",
            leadTimeDays: link.leadTimeDays || 1,
            supplierId: String(link.supplierId),
            preferredSupplier: link.preferredSupplier || false,
          });
        }
      }
    }

    // 2. Fetch products
    const products = await Product.find(productFilter).lean();

  // 3. Calculate suggestions for each product
  const suggestions: SuggestionItem[] = [];

  for (const product of products as Array<Record<string, unknown>>) {
    const pid = String(product._id);
    const currentStock = (product.stock as number) || 0;
    const minStock = (product.minStock as number) || 0;
    const productCost = (product.cost as number) || 0;

    // Get sales averages
    const [avg7, avg14, avg30] = await Promise.all([
      getAverageDailySales(businessId, pid, 7),
      getAverageDailySales(businessId, pid, 14),
      getAverageDailySales(businessId, pid, 30),
    ]);

    // Skip products with no rotation unless they have minStock, flag is set, or they are out of stock
    if (avg30 === 0 && minStock === 0 && currentStock > 0 && !includeNoRotation) {
      continue;
    }

    // Get supplier data for this product
    const supplierData = productSupplierMap.get(pid);
    const leadTimeDays = supplierData?.leadTimeDays || 1;
    const purchaseMultiple = supplierData?.purchaseMultiple || 1;
    const purchasePresentation = supplierData?.purchasePresentation || "unit";
    const estimatedCostPerUnit =
      supplierData?.lastCost ||
      supplierData?.averageCost ||
      productCost;

    // Calculate trend
    const trendMultiplier = calculateTrendMultiplier(avg7, avg30);

    // Use 14-day average as base, adjusted by trend
    const effectiveAvgDaily = avg14 * trendMultiplier;

    // Formula: (avg_daily × total_coverage) - current_stock
    const totalCoverageDays = coverageDays + leadTimeDays;
    const rawSuggested = effectiveAvgDaily * totalCoverageDays - currentStock;

    let suggestedQuantity: number;
    if (rawSuggested <= 0 && currentStock < minStock) {
      suggestedQuantity = roundToMultiple(minStock - currentStock, purchaseMultiple);
    } else if (rawSuggested <= 0) {
      // For products with no sales but 0 stock, suggest a baseline if they belong to this supplier
      if (currentStock === 0 && supplierData) {
        suggestedQuantity = purchaseMultiple || 5;
      } else {
        continue; // Skip - sufficient stock
      }
    } else {
      suggestedQuantity = roundToMultiple(rawSuggested, purchaseMultiple);
    }

    // Ensure minimum purchase
    if (supplierData?.purchaseMultiple && suggestedQuantity < supplierData.purchaseMultiple) {
      suggestedQuantity = supplierData.purchaseMultiple;
    }

    // Calculate days until stockout
    const daysUntilStockout =
      effectiveAvgDaily > 0
        ? currentStock / effectiveAvgDaily
        : currentStock > 0
          ? 999
          : 0;

    // Determine priority
    const priority = determinePriority(daysUntilStockout, leadTimeDays);

    // Cost estimation
    const subtotal = suggestedQuantity * estimatedCostPerUnit;

    const reasonParts = generateReasonParts(
      priority,
      daysUntilStockout,
      currentStock,
      effectiveAvgDaily,
      trendMultiplier,
    );

    suggestions.push({
      productId: pid,
      productName: product.name as string,
      productCode: product.code as string,
      currentStock,
      minStock,
      avgDailySales7: Math.round(avg7 * 100) / 100,
      avgDailySales14: Math.round(avg14 * 100) / 100,
      avgDailySales30: Math.round(avg30 * 100) / 100,
      trendMultiplier: Math.round(trendMultiplier * 100) / 100,
      suggestedQuantity,
      estimatedCost: estimatedCostPerUnit,
      subtotal: Math.round(subtotal * 100) / 100,
      coverageDays,
      leadTimeDays,
      purchaseMultiple,
      purchasePresentation,
      daysUntilStockout: Math.round(daysUntilStockout * 10) / 10,
      priority,
      reason: "", // Legacy
      reasonParts,
      supplierId: supplierData?.supplierId,
    });
  }

  // Sort by priority: critical > high > medium > low
  const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
  suggestions.sort(
    (a, b) => priorityOrder[a.priority] - priorityOrder[b.priority],
  );

  // Apply budget limit if specified
  let finalSuggestions = suggestions;
  if (budgetLimit && budgetLimit > 0) {
    let runningTotal = 0;
    finalSuggestions = [];
    for (const s of suggestions) {
      if (runningTotal + s.subtotal <= budgetLimit) {
        finalSuggestions.push(s);
        runningTotal += s.subtotal;
      } else if (s.priority === "critical") {
        // Always include critical items even over budget
        finalSuggestions.push(s);
        runningTotal += s.subtotal;
      }
    }
  }

  const estimatedTotal = finalSuggestions.reduce(
    (sum, s) => sum + s.subtotal,
    0,
  );

  return {
    suggestions: finalSuggestions,
    estimatedTotal: Math.round(estimatedTotal * 100) / 100,
    criticalCount: finalSuggestions.filter((s) => s.priority === "critical")
      .length,
    highCount: finalSuggestions.filter((s) => s.priority === "high").length,
    mediumCount: finalSuggestions.filter((s) => s.priority === "medium").length,
    lowCount: finalSuggestions.filter((s) => s.priority === "low").length,
  };
  } catch (error) {
    console.error("Generate smart suggestions error:", error);
    throw error;
  }
}

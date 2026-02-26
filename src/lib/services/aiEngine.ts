import mongoose from "mongoose";
import Sale from "@/lib/models/Sale";
import Product from "@/lib/models/Product";
import PurchaseOrder from "@/lib/models/PurchaseOrder";

export interface Insight {
  type: "opportunity" | "warning" | "info";
  title: string;
  description: string;
  titleKey?: string;
  descriptionKey?: string;
  templateData?: Record<string, any>;
  action?: {
    label: string;
    labelKey?: string;
    href: string;
  };
}

export interface ProductRanking {
  bestSellers: any[];
  mostProfitable: any[];
  stagnant: any[];
}

export interface SalesForecast {
  next7Days: number;
  next30Days: number;
  trend: "up" | "down" | "stable";
  history: Array<{ date: string; revenue: number }>;
  forecast: Array<{ date: string; revenue: number; isForecast: boolean }>;
}

export interface BusinessHealthScore {
  score: number;
  factors: {
    salesGrowth: number;
    marginBalance: number;
    stockEfficiency: number;
    rotationHealth: number;
  };
  recommendation: string;
}

/**
 * AI Engine Service - Strategic Implementation
 */
export class AIEngine {
  /**
   * Generates actionable business insights based on sales and inventory data
   */
  static async getAutomaticInsights(businessId: string): Promise<Insight[]> {
    const insights: Insight[] = [];
    const bId = new mongoose.Types.ObjectId(businessId);

    // 1. Check for stockouts based on sales velocity
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const topSellersByVelocity = await Sale.aggregate([
      { $match: { businessId: bId, createdAt: { $gte: thirtyDaysAgo } } },
      { $unwind: "$items" },
      { $group: { 
          _id: "$items.productId", 
          totalSold: { $sum: "$items.quantity" },
          name: { $first: "$items.productName" }
      } },
      { $addFields: { dailyVelocity: { $divide: [{ $toDouble: "$totalSold" }, 30] } } },
      { $sort: { totalSold: -1 } },
      { $limit: 20 }
    ]);

    for (const item of topSellersByVelocity) {
      const product = await Product.findById(item._id);
      if (product && product.active) {
        const daysToStockout = item.dailyVelocity > 0 ? product.stock / item.dailyVelocity : Infinity;
        
        if (daysToStockout <= 3 && product.stock > 0) {
          insights.push({
            type: "warning",
            title: `Agotamiento Inminente: ${product.name}`,
            titleKey: "stockOutVelocityTitle",
            description: `${product.name} se agotará en aprox. ${Math.ceil(daysToStockout)} días basado en tus ventas.`,
            descriptionKey: "stockOutVelocityDesc",
            templateData: { name: product.name, days: Math.ceil(daysToStockout) },
            action: { label: "Reponer Ahora", labelKey: "replenishNow", href: `/purchase-orders?productId=${product._id}` }
          });
        } else if (product.stock === 0) {
          insights.push({
            type: "warning",
            title: `Sin Stock: ${product.name}`,
            titleKey: "noStockTitle",
            description: `Has perdido ventas potenciales de ${product.name} por falta de inventario.`,
            descriptionKey: "noStockDesc",
            templateData: { name: product.name },
            action: { label: "Crear Orden", labelKey: "createOrder", href: "/purchase-orders" }
          });
        }
      }
    }

    // 2. High Margin Opportunity
    const highMarginStagnant = await Product.find({
      businessId: bId,
      active: true,
      margin: { $gte: 40 },
      stock: { $gt: 10 }
    }).limit(2);

    highMarginStagnant.forEach(p => {
      insights.push({
        type: "opportunity",
        title: `Oportunidad de Margen: ${p.name}`,
        titleKey: "marginTitle",
        description: `Este producto tiene un margen del ${p.margin}%. Considera promocionarlo para aumentar ganancias.`,
        descriptionKey: "marginDesc",
        templateData: { name: p.name, margin: p.margin },
        action: { label: "Ver Producto", labelKey: "viewProduct", href: "/products" }
      });
    });

    // 3. Weekly Sales Insights & Weakest Days
    const last7Days = await this.getPeriodRevenue(bId, 7);
    const prev7Days = await this.getPeriodRevenue(bId, 14, 7);

    if (last7Days > 0) {
      if (last7Days < prev7Days) {
        const drop = ((prev7Days - last7Days) / prev7Days) * 100;
        insights.push({
          type: "warning",
          title: "Caída de Ventas Semanal",
          titleKey: "salesDropTitle",
          description: `Tus ventas bajaron un ${drop.toFixed(1)}% comparado con la semana pasada.`,
          descriptionKey: "salesDropDesc",
          templateData: { drop: drop.toFixed(1) }
        });

        // Find weakest day of the week
        const weeklyStats = await Sale.aggregate([
          { $match: { businessId: bId, createdAt: { $gte: thirtyDaysAgo } } },
          { $group: {
              _id: { $dayOfWeek: "$createdAt" },
              total: { $sum: "$total" }
          }},
          { $sort: { total: 1 } }
        ]);

        if (weeklyStats.length > 0) {
          const days = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
          const weakestDay = days[weeklyStats[0]._id - 1];
          insights.push({
            type: "opportunity",
            title: `Impulsa tu ${weakestDay}`,
            titleKey: "weakestDayTitle",
            description: `El ${weakestDay} es tu día más bajo. Considera lanzar una promoción "Flash" ese día.`,
            descriptionKey: "weakestDayDesc",
            templateData: { day: weakestDay }
          });
        }
      } else if (last7Days > prev7Days && prev7Days > 0) {
        const growth = ((last7Days - prev7Days) / prev7Days) * 100;
        insights.push({
          type: "opportunity",
          title: "Crecimiento en Ventas",
          titleKey: "growthTitle",
          description: `¡Excelente! Tus ingresos subieron un ${growth.toFixed(1)}% esta semana.`,
          descriptionKey: "growthDesc",
          templateData: { growth: growth.toFixed(1) }
        });
      }
    }

    // 4. Slow Moving Products
    const soldIn30Days = await Sale.distinct("items.productId", { businessId: bId, createdAt: { $gte: thirtyDaysAgo } });
    const slowMoving = await Product.find({
      businessId: bId,
      active: true,
      stock: { $gt: 20 },
      _id: { $nin: soldIn30Days }
    }).limit(1);

    if (slowMoving.length > 0) {
      insights.push({
        type: "info",
        title: "Producto Estancado",
        titleKey: "slowMovingTitle",
        description: `${slowMoving[0].name} no ha tenido ventas en 30 días. Considera un descuento del 15%.`,
        descriptionKey: "slowMovingDesc",
        templateData: { name: slowMoving[0].name },
        action: { label: "Editar Precio", labelKey: "editPrice", href: `/products?search=${slowMoving[0].name}` }
      });
    }

    return insights;
  }

  /**
   * Generates a Business Health Score (0-100)
   */
  static async getBusinessHealthScore(businessId: string): Promise<BusinessHealthScore> {
    const bId = new mongoose.Types.ObjectId(businessId);
    
    // 1. Sales Growth (25 pts)
    const revenue30d = await this.getPeriodRevenue(bId, 30);
    const revenuePrev30d = await this.getPeriodRevenue(bId, 60, 30);
    let growthPts = 15; // default neutral
    if (revenuePrev30d > 0) {
      const growth = ((revenue30d - revenuePrev30d) / revenuePrev30d) * 100;
      if (growth > 10) growthPts = 25;
      else if (growth > 0) growthPts = 20;
      else if (growth > -10) growthPts = 10;
      else growthPts = 5;
    } else if (revenue30d > 0) {
      growthPts = 25; // New business growing
    }

    // 2. Margin Balance (25 pts)
    const products = await Product.find({ businessId: bId, active: true });
    let marginPts = 0;
    if (products.length > 0) {
      const avgMargin = products.reduce((acc, p) => acc + (p.margin || 0), 0) / products.length;
      if (avgMargin >= 35) marginPts = 25;
      else if (avgMargin >= 25) marginPts = 20;
      else if (avgMargin >= 15) marginPts = 15;
      else marginPts = 10;
    }

    // 3. Stock Efficiency (25 pts)
    const totalProducts = products.length;
    const outOfStock = products.filter(p => p.stock === 0).length;
    let stockPts = 25;
    if (totalProducts > 0) {
      const oosRate = (outOfStock / totalProducts) * 100;
      if (oosRate < 5) stockPts = 25;
      else if (oosRate < 15) stockPts = 20;
      else if (oosRate < 30) stockPts = 10;
      else stockPts = 5;
    }

    // 4. Rotation Health (25 pts)
    const soldProductIds = await Sale.distinct("items.productId", { 
      businessId: bId, 
      createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } 
    });
    let rotationPts = 0;
    if (totalProducts > 0) {
      const rotationRate = (soldProductIds.length / totalProducts) * 100;
      if (rotationRate > 50) rotationPts = 25;
      else if (rotationRate > 30) rotationPts = 20;
      else if (rotationRate > 15) rotationPts = 15;
      else rotationPts = 5;
    }

    const totalScore = growthPts + marginPts + stockPts + rotationPts;
    
    let recommendation = "Tu negocio está en buen camino. Enfócate en mantener el flujo de caja.";
    if (totalScore > 85) recommendation = "¡Excelente rendimiento! Considera expandir tu inventario o abrir nuevas sucursales.";
    else if (totalScore < 50) recommendation = "Atención requerida. Revisa tus márgenes y productos estancados para mejorar la rentabilidad.";

    return {
      score: totalScore,
      factors: {
        salesGrowth: growthPts,
        marginBalance: marginPts,
        stockEfficiency: stockPts,
        rotationHealth: rotationPts
      },
      recommendation
    };
  }

  /**
   * Calculates product rankings
   */
  static async getProductRanking(businessId: string): Promise<ProductRanking> {
    const bId = new mongoose.Types.ObjectId(businessId);
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    // Best Sellers by volume
    const bestSellers = await Sale.aggregate([
      { $match: { businessId: bId, createdAt: { $gte: thirtyDaysAgo } } },
      { $unwind: "$items" },
      { $group: { 
          _id: "$items.productId", 
          name: { $first: "$items.productName" },
          volume: { $sum: "$items.quantity" },
          revenue: { $sum: "$items.total" }
      }},
      { $addFields: { 
          volume: { $toDouble: "$volume" },
          revenue: { $toDouble: "$revenue" }
      }},
      { $sort: { volume: -1 } },
      { $limit: 10 }
    ]);

    // Most Profitable (estimated)
    const mostProfitable = await Sale.aggregate([
      { $match: { businessId: bId, createdAt: { $gte: thirtyDaysAgo } } },
      { $unwind: "$items" },
      { $group: { 
          _id: "$items.productId", 
          name: { $first: "$items.productName" },
          revenue: { $sum: "$items.total" },
      }},
      { $addFields: { revenue: { $toDouble: "$revenue" } }},
      { $sort: { revenue: -1 } }, 
      { $limit: 10 }
    ]);

    // Stagnant (High stock, No sales in 30 days)
    const soldProductIds = await Sale.distinct("items.productId", { 
      businessId: bId, 
      createdAt: { $gte: thirtyDaysAgo } 
    });

    const stagnant = await Product.find({
      businessId: bId,
      _id: { $nin: soldProductIds },
      stock: { $gt: 0 },
      active: true
    })
    .sort({ stock: -1 })
    .limit(10)
    .select("name stock price");

    return { bestSellers, mostProfitable, stagnant };
  }

  /**
   * Sales forecasting based on historical trends
   */
  static async getSalesForecast(businessId: string): Promise<SalesForecast> {
    const bId = new mongoose.Types.ObjectId(businessId);
    
    // Get last 14 days of daily sales
    const rawDaily = await Sale.aggregate([
      { $match: { businessId: bId, createdAt: { $gte: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000) } } },
      { $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          revenue: { $sum: "$total" }
      }},
      { $addFields: { revenue: { $toDouble: "$revenue" } }},
      { $sort: { _id: 1 } }
    ]);

    const history = rawDaily.map(d => ({ date: d._id, revenue: d.revenue }));
    const dailyValues = rawDaily.map(d => d.revenue);
    
    if (dailyValues.length < 3) { // Require at least 3 days for some basic logic
      return { next7Days: 0, next30Days: 0, trend: "stable", history, forecast: [] };
    }

    // Weighted average logic
    const avgRecent = dailyValues.slice(-7).reduce((a, b) => a + b, 0) / Math.min(dailyValues.length, 7);
    const avgPrev = dailyValues.length > 7 
      ? dailyValues.slice(0, -7).reduce((a, b) => a + b, 0) / (dailyValues.length - 7)
      : avgRecent;

    const weightedDaily = (avgRecent * 0.7) + (avgPrev * 0.3);
    
    let trend: "up" | "down" | "stable" = "stable";
    if (avgRecent > avgPrev * 1.05) trend = "up";
    else if (avgRecent < avgPrev * 0.95) trend = "down";

    // Generate 7-day forecast points
    const forecast: Array<{ date: string; revenue: number; isForecast: boolean }> = [];
    const lastDate = history.length > 0 ? new Date(history[history.length - 1].date) : new Date();
    
    for (let i = 1; i <= 7; i++) {
      const fDate = new Date(lastDate);
      fDate.setDate(fDate.getDate() + i);
      forecast.push({
        date: fDate.toISOString().split('T')[0],
        revenue: Math.max(0, weightedDaily),
        isForecast: true
      });
    }

    return {
      next7Days: weightedDaily * 7,
      next30Days: weightedDaily * 30,
      trend,
      history,
      forecast
    };
  }

  /**
   * Recommends products frequently bought together with items currently in cart
   */
  static async getCrossSellSuggestions(productIds: string[], businessId: string): Promise<any[]> {
    if (productIds.length === 0) return [];
    
    const bId = new mongoose.Types.ObjectId(businessId);
    
    // Validate and convert IDs, filtering out any invalid ones
    const pIds: mongoose.Types.ObjectId[] = [];
    for (const id of productIds) {
      if (id && mongoose.Types.ObjectId.isValid(id)) {
        pIds.push(new mongoose.Types.ObjectId(id));
      }
    }

    if (pIds.length === 0) return [];

    // Find sales that contain at least one of these products
    const relatedSales = await Sale.aggregate([
      { $match: { businessId: bId, "items.productId": { $in: pIds } } },
      { $unwind: "$items" },
      { $match: { "items.productId": { $nin: pIds } } }, // Only items NOT already in cart
      { $group: { 
          _id: "$items.productId", 
          count: { $sum: 1 },
          name: { $first: "$items.productName" }
      }},
      { $sort: { count: -1 } },
      { $limit: 6 }
    ]);

    // Get details for these related products
    let suggestions = await Product.find({
      _id: { $in: relatedSales.map(s => s._id) },
      active: true,
      stock: { $gt: 0 }
    }).select("name price isSoldByWeight stock");

    // FALLBACK: If no historical data found, suggest top active products (excluding those in cart)
    if (suggestions.length < 2) {
      const extraSuggestions = await Product.find({
        businessId: bId,
        _id: { $nin: pIds },
        active: true,
        stock: { $gt: 0 }
      })
      .sort({ salesCount: -1 })
      .limit(6 - suggestions.length)
      .select("name price isSoldByWeight stock");
      
      suggestions = [...suggestions, ...extraSuggestions];
    }

    console.log(`[AI ENGINE] Cross-sell suggestions found: ${suggestions.length} for ${productIds.length} input products`);
    return suggestions;
  }

  private static async getPeriodRevenue(businessId: mongoose.Types.ObjectId, days: number, offsetDays = 0): Promise<number> {
    const start = new Date(Date.now() - (days + offsetDays) * 24 * 60 * 60 * 1000);
    const end = new Date(Date.now() - offsetDays * 24 * 60 * 60 * 1000);

    const result = await Sale.aggregate([
      { $match: { businessId, createdAt: { $gte: start, $lt: end } } },
      { $group: { _id: null, total: { $sum: "$total" } } }
    ]);

    return result.length > 0 ? result[0].total : 0;
  }
}

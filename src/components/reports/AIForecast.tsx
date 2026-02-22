"use client";

import { useEffect, useState } from "react";
import { Sparkles, TrendingUp, TrendingDown, Minus, Calendar, Lock } from "lucide-react";
import { apiFetch } from "@/lib/utils/apiFetch";
import Link from "next/link";
import { useLanguage } from "@/lib/context/LanguageContext";

import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from "recharts";

interface ForecastData {
  next7Days: number;
  next30Days: number;
  trend: "up" | "down" | "stable";
  history: Array<{ date: string; revenue: number }>;
  forecast: Array<{ date: string; revenue: number; isForecast: boolean }>;
}

export default function AIForecast() {
  const [data, setData] = useState<ForecastData | null>(null);
  const [loading, setLoading] = useState(true);
  const [locked, setLocked] = useState(false);
  const { t } = useLanguage();

  useEffect(() => {
    const fetchForecast = async () => {
      try {
        const res = await apiFetch("/api/ai/insights?type=forecast");
        if (res.ok) {
          const payload = await res.json();
          if (payload.data.locked) {
            setLocked(true);
          } else {
            setData(payload.data);
          }
        }
      } catch (error) {
        console.error("Forecast error:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchForecast();
  }, []);

  if (loading) return <div className="h-64 vp-card animate-pulse"></div>;

  if (locked) {
    return (
      <div className="vp-card p-12 text-center flex flex-col items-center justify-center space-y-4">
        <Lock className="w-12 h-12 text-[hsl(var(--vp-muted))]" />
        <h3 className="text-xl font-bold">{String(t("lockedTitle", "ai.common"))}</h3>
        <p className="text-[hsl(var(--vp-muted))] max-w-md mx-auto">
          {String(t("lockedDesc", "ai.forecast"))}
        </p>
        <Link href="/upgrade" className="vp-button vp-button-primary">{String(t("upgradeNow", "ai.common"))}</Link>
      </div>
    );
  }

  const TrendIcon = data?.trend === "up" ? TrendingUp : data?.trend === "down" ? TrendingDown : Minus;
  const trendColor = data?.trend === "up" ? "text-emerald-500" : data?.trend === "down" ? "text-rose-500" : "text-blue-500";
  const trendLabel = data?.trend === "up" ? String(t("trendUp", "ai.forecast")) : data?.trend === "down" ? String(t("trendDown", "ai.forecast")) : String(t("trendStable", "ai.forecast"));

  // Prepare chart data: combine history + forecast
  const chartData = [
    ...(data?.history || []).map(d => ({ ...d, isForecast: false })),
    ...(data?.forecast || [])
  ];

  return (
    <div className="space-y-6 vp-fade-in text-left">
      <div className="grid md:grid-cols-2 gap-6">
        <div className="vp-card p-6 border-t-4 border-[hsl(var(--vp-primary))] bg-gradient-to-b from-[hsl(var(--vp-primary)/0.02)] to-transparent">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-bold text-[hsl(var(--vp-muted))] uppercase text-xs tracking-wider">{String(t("sevenDays", "ai.forecast"))}</h4>
            <Calendar className="w-5 h-5 text-[hsl(var(--vp-primary))]" />
          </div>
          <p className="text-3xl font-bold text-[hsl(var(--vp-text))] tabular-nums">
            ${data?.next7Days.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
          <div className="mt-4 flex items-center gap-2">
            <div className={`p-1 rounded-full ${trendColor} bg-current/10`}>
              <TrendIcon className="w-4 h-4" />
            </div>
            <span className={`text-sm font-bold ${trendColor}`}>
              {String(t("trend", "ai.forecast"))} {trendLabel}
            </span>
          </div>
        </div>

        <div className="vp-card p-6 border-t-4 border-[hsl(var(--vp-primary))] bg-gradient-to-b from-[hsl(var(--vp-primary)/0.02)] to-transparent">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-bold text-[hsl(var(--vp-muted))] uppercase text-xs tracking-wider">{String(t("thirtyDays", "ai.forecast"))}</h4>
            <Sparkles className="w-5 h-5 text-[hsl(var(--vp-primary))]" />
          </div>
          <p className="text-3xl font-bold text-[hsl(var(--vp-text))] tabular-nums">
            ${data?.next30Days.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
          <p className="text-xs text-[hsl(var(--vp-muted))] mt-4 italic">
            {String(t("disclaimer", "ai.forecast"))}
          </p>
        </div>
      </div>

      {/* Forecast Chart */}
      <div className="vp-card p-6">
        <h4 className="font-bold mb-6 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-[hsl(var(--vp-primary))]" />
          {String(t("chartTitle", "ai.forecast")) || "Proyección de Ventas"}
        </h4>
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--vp-primary))" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="hsl(var(--vp-primary))" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorForecast" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.2}/>
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--vp-border)/0.5)" />
              <XAxis 
                dataKey="date" 
                tick={{ fontSize: 10 }} 
                tickFormatter={(str) => {
                  const d = new Date(str);
                  return d.toLocaleDateString(undefined, { day: 'numeric', month: 'short' });
                }}
                minTickGap={20}
              />
              <YAxis tick={{ fontSize: 10 }} tickFormatter={(val) => `$${val}`} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--vp-bg-card))', 
                  borderColor: 'hsl(var(--vp-border))',
                  borderRadius: '12px',
                  fontSize: '12px'
                }}
                itemStyle={{ color: 'hsl(var(--vp-primary))', fontWeight: 'bold' }}
                labelFormatter={(label) => new Date(label).toLocaleDateString(undefined, { dateStyle: 'long' })}
                formatter={(value: any, name?: string, props?: any) => [
                  `$${Number(value).toLocaleString()}`, 
                  props?.payload?.isForecast ? "Proyección" : "Venta Real"
                ]}
              />
              <Area 
                type="monotone" 
                dataKey="revenue" 
                stroke="hsl(var(--vp-primary))" 
                strokeWidth={3}
                fillOpacity={1} 
                fill="url(#colorRevenue)" 
                activeDot={{ r: 6, strokeWidth: 0 }}
                connectNulls
              />
              {/* Shaded confidence interval simulation using a second dotted line or area if needed */}
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="vp-card p-6">
        <h4 className="font-bold mb-4">{String(t("howItWorksTitle", "ai.forecast"))}</h4>
        <p className="text-sm text-[hsl(var(--vp-muted))] leading-relaxed">
          {String(t("howItWorksDesc", "ai.forecast"))}
        </p>
      </div>
    </div>
  );
}

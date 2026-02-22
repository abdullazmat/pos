"use client";

import { useEffect, useState } from "react";
import { Sparkles, Trophy, PackageX, DollarSign, Lock } from "lucide-react";
import { apiFetch } from "@/lib/utils/apiFetch";
import Link from "next/link";
import { useLanguage } from "@/lib/context/LanguageContext";

interface RankingData {
  bestSellers: any[];
  mostProfitable: any[];
  stagnant: any[];
}

export default function AIRankings() {
  const [data, setData] = useState<RankingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [locked, setLocked] = useState(false);
  const { t } = useLanguage();

  useEffect(() => {
    const fetchRankings = async () => {
      try {
        const res = await apiFetch("/api/ai/insights?type=rankings");
        if (res.ok) {
          const payload = await res.json();
          if (payload.data.locked) {
            setLocked(true);
          } else {
            setData(payload.data);
          }
        }
      } catch (error) {
        console.error("Rankings error:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchRankings();
  }, []);

  if (loading) return <div className="h-64 vp-card animate-pulse"></div>;

  if (locked) {
    return (
      <div className="vp-card p-12 text-center flex flex-col items-center justify-center space-y-4">
        <Lock className="w-12 h-12 text-[hsl(var(--vp-muted))]" />
        <h3 className="text-xl font-bold">{String(t("lockedTitle", "ai.common"))}</h3>
        <p className="text-[hsl(var(--vp-muted))] max-w-md mx-auto">
          {String(t("lockedDesc", "ai.rankings"))}
        </p>
        <Link href="/upgrade" className="vp-button vp-button-primary">{String(t("upgradeNow", "ai.common"))}</Link>
      </div>
    );
  }

  return (
    <div className="space-y-8 vp-fade-in text-left">
      <div className="grid md:grid-cols-3 gap-6">
        {/* Best Sellers */}
        <div className="vp-card overflow-hidden">
          <div className="p-4 border-b border-[hsl(var(--vp-border))] bg-[hsl(var(--vp-primary)/0.03)] flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-500" />
            <h4 className="font-bold">{String(t("bestSellers", "ai.rankings"))}</h4>
          </div>
          <div className="divide-y divide-[hsl(var(--vp-border))]">
            {data?.bestSellers.map((p, i) => (
              <div key={i} className="p-3 flex items-center justify-between hover:bg-[hsl(var(--vp-bg-soft))] transition-colors">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold text-[hsl(var(--vp-muted))] w-4">{i + 1}</span>
                  <span className="text-sm font-medium truncate max-w-[120px]">{p.name}</span>
                </div>
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-[hsl(var(--vp-primary)/0.1)] text-[hsl(var(--vp-primary))]">
                  {p.volume} {String(t("units", "ai.rankings"))}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Most Profitable */}
        <div className="vp-card overflow-hidden">
          <div className="p-4 border-b border-[hsl(var(--vp-border))] bg-[hsl(var(--vp-success)/0.03)] flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-emerald-500" />
            <h4 className="font-bold">{String(t("mostProfitable", "ai.rankings"))}</h4>
          </div>
          <div className="divide-y divide-[hsl(var(--vp-border))]">
            {data?.mostProfitable.map((p, i) => (
              <div key={i} className="p-3 flex items-center justify-between hover:bg-[hsl(var(--vp-bg-soft))] transition-colors">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold text-[hsl(var(--vp-muted))] w-4">{i + 1}</span>
                  <span className="text-sm font-medium truncate max-w-[120px]">{p.name}</span>
                </div>
                <span className="text-xs font-bold tabular-nums">
                  ${p.revenue.toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Stagnant */}
        <div className="vp-card overflow-hidden">
          <div className="p-4 border-b border-[hsl(var(--vp-border))] bg-[hsl(var(--vp-error)/0.03)] flex items-center gap-2">
            <PackageX className="w-5 h-5 text-rose-500" />
            <h4 className="font-bold">{String(t("stagnantProducts", "ai.rankings"))}</h4>
          </div>
          <div className="divide-y divide-[hsl(var(--vp-border))]">
            {data?.stagnant.length === 0 ? (
              <p className="p-4 text-sm text-[hsl(var(--vp-muted))] italic">{String(t("noStagnant", "ai.rankings"))}</p>
            ) : (
              data?.stagnant.map((p, i) => (
                <div key={i} className="p-3 flex items-center justify-between hover:bg-[hsl(var(--vp-bg-soft))] transition-colors">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium truncate max-w-[120px]">{p.name}</span>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-bold text-rose-600">{String(t("inStock", "ai.rankings", { count: p.stock }))}</p>
                    <p className="text-[10px] text-[hsl(var(--vp-muted))]">{String(t("noSalesThirty", "ai.rankings"))}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <div className="vp-card p-6 bg-gradient-to-r from-[hsl(var(--vp-primary)/0.05)] to-transparent border-l-4 border-[hsl(var(--vp-primary))]">
        <div className="flex items-start gap-4">
          <Sparkles className="w-6 h-6 text-[hsl(var(--vp-primary))] shrink-0" />
          <div>
            <h4 className="font-bold">{String(t("strategyTitle", "ai.rankings"))}</h4>
            <p className="text-sm text-[hsl(var(--vp-muted))] mt-1 leading-relaxed">
              {String(t("strategyDesc", "ai.rankings", { 
                amount: `$${data ? data.stagnant.reduce((acc, p) => acc + (p.stock * p.price), 0).toLocaleString() : 0}` 
              }))}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

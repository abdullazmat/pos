"use client";

import { useEffect, useState } from "react";
import { Sparkles, TrendingUp, AlertCircle, ArrowRight, Lock } from "lucide-react";
import Link from "next/link";
import { apiFetch } from "@/lib/utils/apiFetch";
import { useLanguage } from "@/lib/context/LanguageContext";

interface Insight {
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

interface HealthScore {
  score: number;
  factors: {
    salesGrowth: number;
    marginBalance: number;
    stockEfficiency: number;
    rotationHealth: number;
  };
  recommendation: string;
}

export default function AIInsights() {
  const [insights, setInsights] = useState<Insight[]>([]);
  const [healthScore, setHealthScore] = useState<HealthScore | null>(null);
  const [loading, setLoading] = useState(true);
  const [locked, setLocked] = useState(false);
  const { t } = useLanguage();

  useEffect(() => {
    const fetchInsights = async () => {
      try {
        const res = await apiFetch("/api/ai/insights");
        if (res.ok) {
          const data = await res.json();
          if (data.data.locked) {
            setLocked(true);
          } else {
            setInsights(data.data.insights || []);
            setHealthScore(data.data.healthScore || null);
          }
        }
      } catch (error) {
        console.error("Failed to fetch AI insights", error);
      } finally {
        setLoading(false);
      }
    };

    fetchInsights();
  }, []);

  if (loading) {
    return (
      <div className="vp-card p-6 animate-pulse">
        <div className="h-4 bg-[hsl(var(--vp-bg-soft))] rounded w-1/4 mb-4"></div>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <div className="h-10 bg-[hsl(var(--vp-bg-soft))] rounded"></div>
            <div className="h-10 bg-[hsl(var(--vp-bg-soft))] rounded"></div>
          </div>
          <div className="h-32 bg-[hsl(var(--vp-bg-soft))] rounded order-first md:order-last"></div>
        </div>
      </div>
    );
  }

  if (locked) {
    return (
      <div className="vp-card p-6 relative overflow-hidden group">
        <div className="absolute inset-0 bg-gradient-to-br from-[hsl(var(--vp-primary)/0.05)] to-transparent pointer-events-none"></div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[hsl(var(--vp-primary))]" />
            <h3 className="font-bold text-lg">{String(t("lockedCardTitle", "ai.insights"))}</h3>
          </div>
          <span className="vp-pill bg-[hsl(var(--vp-primary)/0.1)] text-[hsl(var(--vp-primary))] text-xs">{String(t("lockedCardBadge", "ai.insights"))}</span>
        </div>
        
        <div className="flex flex-col items-center justify-center py-6 text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-[hsl(var(--vp-bg-soft))] flex items-center justify-center">
            <Lock className="w-6 h-6 text-[hsl(var(--vp-muted))]" />
          </div>
          <div>
            <p className="text-[hsl(var(--vp-text))] font-medium">{String(t("lockedCardDesc", "ai.insights"))}</p>
            <p className="text-sm text-[hsl(var(--vp-muted))] mt-1">{String(t("lockedCardTeaser", "ai.insights"))}</p>
          </div>
          <Link href="/upgrade" className="vp-button vp-button-primary vp-button-sm">
            {String(t("lockedCardButton", "ai.insights"))}
          </Link>
        </div>
      </div>
    );
  }

  const scoreColor = healthScore ? (
    healthScore.score >= 80 ? 'text-emerald-500' :
    healthScore.score >= 50 ? 'text-amber-500' :
    'text-rose-500'
  ) : 'text-[hsl(var(--vp-muted))]';

  return (
    <div className="grid md:grid-cols-12 gap-6">
      <div className="md:col-span-8 vp-card p-6 border-l-4 border-[hsl(var(--vp-primary))] flex flex-col h-full">
        <div className="flex items-center gap-2 mb-6">
          <Sparkles className="w-5 h-5 text-[hsl(var(--vp-primary))]" />
          <h3 className="font-bold text-lg">{String(t("title", "ai.insights"))}</h3>
        </div>

        <div className="grid gap-4 flex-1">
          {insights.length === 0 ? (
            <p className="text-[hsl(var(--vp-muted))] text-sm italic">
              {String(t("empty", "ai.insights"))}
            </p>
          ) : (
            insights.map((insight, idx) => (
              <div key={idx} className="flex gap-4 p-4 rounded-xl bg-[hsl(var(--vp-bg-soft))] border border-[hsl(var(--vp-border))] hover:border-[hsl(var(--vp-primary)/0.3)] transition-colors">
                <div className={`shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                  insight.type === 'opportunity' ? 'bg-emerald-100 text-emerald-700' :
                  insight.type === 'warning' ? 'bg-amber-100 text-amber-700' :
                  'bg-blue-100 text-blue-700'
                }`}>
                  {insight.type === 'opportunity' ? <TrendingUp className="w-5 h-5" /> :
                   insight.type === 'warning' ? <AlertCircle className="w-5 h-5" /> :
                   <Sparkles className="w-5 h-5" />}
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-[hsl(var(--vp-text))]">
                    {insight.titleKey ? String(t(insight.titleKey, "ai.insights", insight.templateData)) : insight.title}
                  </h4>
                  <p className="text-sm text-[hsl(var(--vp-muted))] mt-1 leading-relaxed">
                    {insight.descriptionKey ? String(t(insight.descriptionKey, "ai.insights", insight.templateData)) : insight.description}
                  </p>
                  {insight.action && (
                    <Link href={insight.action.href} className="inline-flex items-center gap-1 text-xs font-bold text-[hsl(var(--vp-primary))] mt-3 hover:underline">
                      {insight.action.labelKey ? String(t(insight.action.labelKey, "ai.insights")) : insight.action.label} <ArrowRight className="w-3 h-3" />
                    </Link>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="md:col-span-4 vp-card p-6 bg-gradient-to-br from-[hsl(var(--vp-bg))] to-[hsl(var(--vp-bg-soft))] border border-[hsl(var(--vp-border))] flex flex-col h-full relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
          <TrendingUp className="w-24 h-24" />
        </div>

        <h3 className="font-bold text-lg mb-6 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-[hsl(var(--vp-primary))]" />
          {String(t("healthScoreTitle", "ai.insights"))}
        </h3>

        {healthScore && (
          <div className="flex flex-col items-center justify-center flex-1 space-y-6">
            <div className="relative flex items-center justify-center">
              {/* Circular Progress Placeholder - In a real app we'd use an SVG circle */}
              <div className={`w-32 h-32 rounded-full border-8 border-[hsl(var(--vp-bg-soft))] flex items-center justify-center`}>
                <span className={`text-4xl font-black ${scoreColor}`}>
                  {healthScore.score}
                </span>
              </div>
              <div className="absolute -bottom-2 px-3 py-1 bg-[hsl(var(--vp-primary))] text-white text-[10px] font-bold rounded-full uppercase tracking-wider">
                SCORE
              </div>
            </div>

            <div className="w-full space-y-4">
              <p className="text-sm text-center text-[hsl(var(--vp-text))] font-medium italic px-4">
                "{healthScore.recommendation}"
              </p>

              <div className="grid grid-cols-2 gap-3 pt-4">
                <div className="p-3 rounded-lg bg-[hsl(var(--vp-bg-soft))] border border-[hsl(var(--vp-border))]">
                  <p className="text-[10px] uppercase text-[hsl(var(--vp-muted))] font-bold">{String(t("salesGrowth", "ai.health"))}</p>
                  <div className="h-1.5 w-full bg-[hsl(var(--vp-bg))] rounded-full mt-2 overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full transition-all duration-1000" style={{ width: `${(healthScore.factors.salesGrowth / 25) * 100}%` }}></div>
                  </div>
                </div>
                <div className="p-3 rounded-lg bg-[hsl(var(--vp-bg-soft))] border border-[hsl(var(--vp-border))]">
                  <p className="text-[10px] uppercase text-[hsl(var(--vp-muted))] font-bold">{String(t("marginBalance", "ai.health"))}</p>
                  <div className="h-1.5 w-full bg-[hsl(var(--vp-bg))] rounded-full mt-2 overflow-hidden">
                    <div className="h-full bg-blue-500 rounded-full transition-all duration-1000" style={{ width: `${(healthScore.factors.marginBalance / 25) * 100}%` }}></div>
                  </div>
                </div>
                <div className="p-3 rounded-lg bg-[hsl(var(--vp-bg-soft))] border border-[hsl(var(--vp-border))]">
                  <p className="text-[10px] uppercase text-[hsl(var(--vp-muted))] font-bold">{String(t("stockEfficiency", "ai.health"))}</p>
                  <div className="h-1.5 w-full bg-[hsl(var(--vp-bg))] rounded-full mt-2 overflow-hidden">
                    <div className="h-full bg-amber-500 rounded-full transition-all duration-1000" style={{ width: `${(healthScore.factors.stockEfficiency / 25) * 100}%` }}></div>
                  </div>
                </div>
                <div className="p-3 rounded-lg bg-[hsl(var(--vp-bg-soft))] border border-[hsl(var(--vp-border))]">
                  <p className="text-[10px] uppercase text-[hsl(var(--vp-muted))] font-bold">{String(t("rotationHealth", "ai.health"))}</p>
                  <div className="h-1.5 w-full bg-[hsl(var(--vp-bg))] rounded-full mt-2 overflow-hidden">
                    <div className="h-full bg-indigo-500 rounded-full transition-all duration-1000" style={{ width: `${(healthScore.factors.rotationHealth / 25) * 100}%` }}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

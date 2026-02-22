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

export default function AIInsights() {
  const [insights, setInsights] = useState<Insight[]>([]);
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
        <div className="space-y-3">
          <div className="h-10 bg-[hsl(var(--vp-bg-soft))] rounded"></div>
          <div className="h-10 bg-[hsl(var(--vp-bg-soft))] rounded"></div>
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

  return (
    <div className="vp-card p-6 border-l-4 border-[hsl(var(--vp-primary))]">
      <div className="flex items-center gap-2 mb-6">
        <Sparkles className="w-5 h-5 text-[hsl(var(--vp-primary))]" />
        <h3 className="font-bold text-lg">{String(t("title", "ai.insights"))}</h3>
      </div>

      <div className="grid gap-4">
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
  );
}

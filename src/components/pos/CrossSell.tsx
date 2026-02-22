"use client";

import { useEffect, useState } from "react";
import { Sparkles, Plus } from "lucide-react";
import { apiFetch } from "@/lib/utils/apiFetch";
import { formatARS } from "@/lib/utils/currency";
import { useLanguage } from "@/lib/context/LanguageContext";

interface Product {
  _id: string;
  name: string;
  price: number;
  stock: number;
  isSoldByWeight: boolean;
}

interface CrossSellProps {
  cartProductIds: string[];
  onAdd: (product: Product) => void;
  /** When true, renders as a compact horizontally-scrollable pill row */
  compact?: boolean;
}

export default function CrossSell({ cartProductIds, onAdd, compact = false }: CrossSellProps) {
  const [suggestions, setSuggestions] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const { t } = useLanguage();

  useEffect(() => {
    if (cartProductIds.length === 0) {
      setSuggestions([]);
      return;
    }

    const fetchSuggestions = async () => {
      setLoading(true);
      try {
        const res = await apiFetch(`/api/ai/insights?type=cross-sell&productIds=${cartProductIds.join(",")}`);
        if (res.ok) {
          const payload = await res.json();
          console.log("[CrossSell] API Response:", payload);
          
          // Ensure data is an array before filtering
          const dataArray = Array.isArray(payload.data) ? payload.data : [];
          
          // Filter out products already in cart AND zero-stock products
          const filtered = dataArray.filter(
            (p: Product) => !cartProductIds.includes(p._id) && p.stock > 0
          );
          setSuggestions(filtered);
        } else {
          console.error("[CrossSell] API Error:", res.status);
        }
      } catch (error) {
        console.error("[CrossSell] Fetch error:", error);
      } finally {
        setLoading(false);
      }
    };

    const timer = setTimeout(fetchSuggestions, 600); // Debounce
    return () => clearTimeout(timer);
  }, [cartProductIds]);

  if (suggestions.length === 0) return null;

  /* ── COMPACT MODE: horizontal pill strip, always pinned above totals ── */
  if (compact) {
    return (
      <div className="mb-4 rounded-xl border border-[hsl(var(--vp-primary)/0.2)] bg-[hsl(var(--vp-primary)/0.04)] p-3">
        <div className="flex items-center gap-1.5 mb-2">
          <Sparkles className="w-3.5 h-3.5 text-[hsl(var(--vp-primary))]" />
          <span className="text-[10px] font-bold uppercase tracking-wider text-[hsl(var(--vp-primary))]">
            {String(t("title", "ai.crossSell"))}
          </span>
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
          {suggestions.map((p) => (
            <button
              key={p._id}
              onClick={() => onAdd(p)}
              className="flex-shrink-0 flex items-center gap-2 px-3 py-2 rounded-lg bg-[hsl(var(--vp-bg-card))] border border-[hsl(var(--vp-border))] hover:border-[hsl(var(--vp-primary)/0.5)] hover:bg-[hsl(var(--vp-primary)/0.06)] transition-all group text-left"
            >
              <div className="min-w-0">
                <p className="text-xs font-semibold text-[hsl(var(--vp-text))] truncate max-w-[100px]">{p.name}</p>
                <p className="text-xs font-bold text-[hsl(var(--vp-primary))]">{formatARS(p.price)}</p>
              </div>
              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-[hsl(var(--vp-primary))] flex items-center justify-center opacity-70 group-hover:opacity-100 transition-opacity">
                <Plus className="w-3.5 h-3.5 text-white" />
              </div>
            </button>
          ))}
        </div>
      </div>
    );
  }

  /* ── DEFAULT (full) MODE: 2-column grid ── */
  return (
    <div className="mt-6 pt-6 border-t border-[hsl(var(--vp-border))]">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="w-4 h-4 text-[hsl(var(--vp-primary))]" />
        <h4 className="text-sm font-bold text-[hsl(var(--vp-text))] uppercase tracking-wider">{String(t("title", "ai.crossSell"))}</h4>
      </div>
      
      <div className="grid grid-cols-2 gap-3">
        {suggestions.map((p) => (
          <button
            key={p._id}
            onClick={() => onAdd(p)}
            className="flex flex-col text-left p-3 rounded-xl bg-[hsl(var(--vp-primary)/0.03)] border border-[hsl(var(--vp-primary)/0.1)] hover:bg-[hsl(var(--vp-primary)/0.08)] hover:border-[hsl(var(--vp-primary)/0.3)] transition-all group"
          >
            <span className="text-xs font-semibold text-[hsl(var(--vp-text))] truncate mb-1">{p.name}</span>
            <div className="flex items-center justify-between mt-auto">
              <span className="text-xs font-bold text-[hsl(var(--vp-primary))]">{formatARS(p.price)}</span>
              <div className="p-1 rounded-md bg-[hsl(var(--vp-primary))] text-white opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 px-2">
                <span className="text-[10px] uppercase">{String(t("add", "ai.crossSell"))}</span>
                <Plus className="w-3 h-3" />
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

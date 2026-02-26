"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { Sparkles, Plus, X, ShoppingBag, Loader2 } from "lucide-react";
import { apiFetch } from "@/lib/utils/apiFetch";
import { formatARS } from "@/lib/utils/currency";
import { useGlobalLanguage } from "@/lib/hooks/useGlobalLanguage";

interface Product {
  _id: string;
  name: string;
  price: number;
  stock: number;
  isSoldByWeight: boolean;
}

interface CheckoutCrossSellModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  cartProductIds: string[];
  onAdd: (product: Product) => void;
}

export default function CheckoutCrossSellModal({
  isOpen,
  onClose,
  onConfirm,
  cartProductIds,
  onAdd,
}: CheckoutCrossSellModalProps) {
  const [suggestions, setSuggestions] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { t } = useGlobalLanguage();
  // Use refs to hold the latest callbacks without triggering re-renders
  const onConfirmRef = useRef(onConfirm);
  onConfirmRef.current = onConfirm;
  const hasFetchedRef = useRef(false);

  useEffect(() => {
    // Reset state whenever modal opens
    if (!isOpen) {
      setSuggestions([]);
      setLoading(true);
      hasFetchedRef.current = false;
      return;
    }

    // Prevent double-fetch within same open cycle
    if (hasFetchedRef.current) return;
    hasFetchedRef.current = true;

    if (cartProductIds.length === 0) {
      // No cart items — skip straight to checkout
      onConfirmRef.current();
      return;
    }

    const controller = new AbortController();

    const fetchSuggestions = async () => {
      setLoading(true);
      try {
        const res = await apiFetch(
          `/api/ai/insights?type=cross-sell&productIds=${cartProductIds.join(",")}`,
          { signal: controller.signal },
        );

        if (!res.ok) {
          // API error — don't block checkout
          onConfirmRef.current();
          return;
        }

        const payload = await res.json();
        const dataArray = Array.isArray(payload.data) ? payload.data : [];
        const filtered = dataArray.filter(
          (p: Product) => !cartProductIds.includes(p._id) && p.stock > 0,
        );

        if (filtered.length === 0) {
          // Nothing to suggest — proceed to checkout
          onConfirmRef.current();
          return;
        }

        setSuggestions(filtered.slice(0, 3));
      } catch (error: any) {
        if (error?.name !== "AbortError") {
          console.error("[CheckoutCrossSell] Fetch error", error);
          // Don't block checkout on errors
          onConfirmRef.current();
        }
      } finally {
        setLoading(false);
      }
    };

    fetchSuggestions();

    return () => controller.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]); // Only depends on isOpen — cartProductIds is read from closure

  if (!isOpen) return null;

  // Still loading — show a minimal loading indicator so the user sees something
  if (loading) {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <div className="bg-[hsl(var(--vp-bg-card))] border border-[hsl(var(--vp-border))] w-full max-w-md rounded-2xl shadow-2xl p-8 flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 text-[hsl(var(--vp-primary))] animate-spin" />
          <p className="text-sm text-[hsl(var(--vp-muted))]">
            {String(t("loading", "ai.crossSell"))}
          </p>
        </div>
      </div>
    );
  }

  // No suggestions after loading — this shouldn't normally render
  // because we call onConfirm in the effect, but guard just in case
  if (suggestions.length === 0) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[hsl(var(--vp-bg-card))] border border-[hsl(var(--vp-border))] w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-start mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[hsl(var(--vp-primary)/0.12)] flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-[hsl(var(--vp-primary))]" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-[hsl(var(--vp-text))]">
                  {String(t("somethingElse", "ai.crossSell"))}
                </h3>
                <p className="text-sm text-[hsl(var(--vp-muted))]">
                  {String(t("basedOnCart", "ai.crossSell"))}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-[hsl(var(--vp-bg-soft))] rounded-full transition-colors"
            >
              <X className="w-5 h-5 text-[hsl(var(--vp-muted))]" />
            </button>
          </div>

          {/* Suggestions */}
          <div className="space-y-3 mb-6">
            {suggestions.map((p) => (
              <button
                key={p._id}
                onClick={() => onAdd(p)}
                className="w-full flex items-center gap-4 p-4 rounded-xl border border-[hsl(var(--vp-border))] hover:border-[hsl(var(--vp-primary)/0.5)] hover:bg-[hsl(var(--vp-primary)/0.05)] transition-all text-left group"
              >
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-[hsl(var(--vp-text))] truncate">
                    {p.name}
                  </p>
                  <p className="text-sm font-black text-[hsl(var(--vp-primary))]">
                    {formatARS(p.price)}
                  </p>
                </div>
                <div className="flex items-center gap-2 text-xs font-bold text-[hsl(var(--vp-primary))] opacity-0 group-hover:opacity-100 transition-opacity">
                  <Plus className="w-4 h-4" />
                  {String(t("addUpper", "ai.crossSell"))}
                </div>
              </button>
            ))}
          </div>

          {/* Confirm Button */}
          <button
            onClick={onConfirm}
            className="w-full vp-button vp-button-primary py-4 text-base font-bold shadow-lg shadow-[hsl(var(--vp-primary)/0.2)] flex items-center justify-center gap-2"
          >
            {String(t("closeSale", "ai.crossSell"))}
            <ShoppingBag className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}

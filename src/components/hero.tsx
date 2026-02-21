"use client";

import Link from "next/link";
import { useLanguage } from "@/lib/context/LanguageContext";

export default function Hero() {
  const { t } = useLanguage();
  const hero = t("hero", "landing") as {
    titleLines?: string[];
    titleMain?: string;
    titleHighlight?: string;
    titleHighlightIndex?: number;
    description?: string;
    primaryCta?: string;
    secondaryCta?: string;
  };
  const titleLines =
    hero?.titleLines ?? [hero?.titleMain, hero?.titleHighlight].filter(Boolean);
  const highlightIndex = hero?.titleHighlightIndex ?? 0;

  return (
    <section className="max-w-2xl vp-reveal">
      <h1 className="vp-hero-title">
        {titleLines.map((line, index) => (
          <span
            key={`${line}-${index}`}
            className={
              index === highlightIndex ? "vp-hero-highlight block" : "block"
            }
          >
            {line}
          </span>
        ))}
      </h1>

      <p className="vp-hero-subtitle max-w-xl">{hero?.description}</p>

      <div className="mt-10 flex flex-col sm:flex-row gap-4">
        <Link
          href="/auth/register"
          className="vp-button vp-button-primary px-8 text-lg"
        >
          {hero?.primaryCta}
        </Link>
        <Link
          href="/auth/register"
          className="vp-button px-8 text-lg bg-[hsl(var(--vp-bg-card))] border-[hsl(var(--vp-border))]"
        >
          {hero?.secondaryCta}
        </Link>
      </div>
    </section>
  );
}


"use client";

import { useLanguage } from "@/lib/context/LanguageContext";

export default function Hero() {
  const { t } = useLanguage();
  const hero = t("hero", "landing") as {
    titleLines?: string[];
    titleMain?: string;
    titleHighlight?: string;
    titleHighlightIndex?: number;
    description?: string;
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
    </section>
  );
}

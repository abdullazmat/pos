"use client";

import type { CSSProperties } from "react";
import { useLanguage } from "@/lib/context/LanguageContext";
import { useTheme } from "@/lib/context/ThemeContext";
import ThemeControls from "@/components/ThemeControls";

const VARIANT_TOKENS = {
  minimal: {
    primary: "221 63% 52%",
    accent: "215 16% 47%",
    surface: "210 40% 99%",
    text: "222 47% 11%",
  },
  balanced: {
    primary: "221 83% 56%",
    accent: "192 70% 45%",
    surface: "210 40% 99%",
    text: "222 47% 11%",
  },
  vibrant: {
    primary: "221 92% 60%",
    accent: "195 85% 48%",
    surface: "210 40% 99%",
    text: "222 47% 11%",
  },
} as const;

type VariantKey = keyof typeof VARIANT_TOKENS;

export default function PaletteShowcaseSection() {
  const { t } = useLanguage();
  const { themeVariant, setThemeVariant } = useTheme();

  const content = t("designSystem", "landing") as {
    badge: string;
    title: string;
    subtitle: string;
    paletteTitle: string;
    paletteSubtitle: string;
    motionTitle: string;
    motionDescription: string;
    cta: string;
    variants: Array<{
      key: VariantKey;
      label: string;
      description: string;
      traits: string[];
    }>;
    tokens: {
      primary: string;
      accent: string;
      surface: string;
      text: string;
    };
    activeLabel: string;
    motionSamples: {
      primaryAction: string;
      liveSync: string;
      notification: string;
      notificationText: string;
      auto: string;
      menu: string;
      hover: string;
      sales: string;
      reports: string;
      products: string;
      cash: string;
      note: string;
    };
  };

  return (
    <section
      id="design-system"
      className="vp-section vp-reveal relative overflow-hidden"
    >
      <div className="absolute inset-0 -z-10">
        <div className="absolute -top-24 left-[-10%] h-72 w-72 rounded-full bg-[hsl(var(--vp-primary))]/12 blur-3xl" />
        <div className="absolute bottom-[-20%] right-[-5%] h-80 w-80 rounded-full bg-[hsl(var(--vp-accent))]/10 blur-[120px]" />
      </div>

      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-12">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[hsl(var(--vp-border))] bg-[hsl(var(--vp-bg-soft))] text-xs uppercase tracking-[0.2em] text-[hsl(var(--vp-muted))] vp-micro">
            {content?.badge}
          </span>
          <h2 className="vp-section-title mt-5">{content?.title}</h2>
          <p className="vp-section-subtitle text-lg">{content?.subtitle}</p>
        </div>

        <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] items-start">
          <div className="space-y-6">
            <div className="vp-card p-6">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h3 className="text-lg font-semibold text-[hsl(var(--vp-text))]">
                    {content?.paletteTitle}
                  </h3>
                  <p className="text-sm text-[hsl(var(--vp-muted))] mt-1">
                    {content?.paletteSubtitle}
                  </p>
                </div>
                <ThemeControls compact />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              {content?.variants?.map((variant) => {
                const tokens = VARIANT_TOKENS[variant.key];
                const isActive = themeVariant === variant.key;
                return (
                  <div
                    key={variant.key}
                    className="vp-card vp-variant-card p-5"
                    data-active={isActive}
                    style={
                      {
                        "--vp-primary": tokens.primary,
                        "--vp-accent": tokens.accent,
                        "--vp-surface": tokens.surface,
                        "--vp-text": tokens.text,
                      } as CSSProperties
                    }
                  >
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold text-[hsl(var(--vp-text))]">
                        {variant.label}
                      </p>
                      {isActive && (
                        <span className="vp-pill">{content?.activeLabel}</span>
                      )}
                    </div>
                    <p className="text-xs text-[hsl(var(--vp-muted))] mt-2">
                      {variant.description}
                    </p>
                    <div className="flex items-center gap-2 mt-4">
                      <div
                        className="vp-swatch"
                        title={content?.tokens?.primary}
                        style={{ background: `hsl(${tokens.primary})` }}
                      />
                      <div
                        className="vp-swatch"
                        title={content?.tokens?.accent}
                        style={{ background: `hsl(${tokens.accent})` }}
                      />
                      <div
                        className="vp-swatch"
                        title={content?.tokens?.surface}
                        style={{ background: `hsl(${tokens.surface})` }}
                      />
                      <div
                        className="vp-swatch"
                        title={content?.tokens?.text}
                        style={{ background: `hsl(${tokens.text})` }}
                      />
                    </div>
                    <ul className="mt-4 space-y-2 text-xs text-[hsl(var(--vp-muted))]">
                      {variant.traits?.map((trait) => (
                        <li key={trait} className="flex items-center gap-2">
                          <span className="vp-dot" />
                          <span>{trait}</span>
                        </li>
                      ))}
                    </ul>
                    <button
                      type="button"
                      className="vp-button vp-button-primary vp-button-sm w-full mt-4 vp-press"
                      onClick={() => setThemeVariant(variant.key)}
                    >
                      {content?.cta}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="space-y-6">
            <div className="vp-card p-6">
              <h3 className="text-lg font-semibold text-[hsl(var(--vp-text))]">
                {content?.motionTitle}
              </h3>
              <p className="text-sm text-[hsl(var(--vp-muted))] mt-2">
                {content?.motionDescription}
              </p>
              <div className="mt-6 space-y-4">
                <div className="flex items-center justify-between">
                  <button className="vp-button vp-button-primary vp-micro vp-press">
                    {content?.motionSamples?.primaryAction}
                  </button>
                  <span className="vp-pill vp-pulse">
                    {content?.motionSamples?.liveSync}
                  </span>
                </div>
                <div className="vp-flow-step" />
                <div className="flex items-center justify-between vp-card vp-card-soft p-3">
                  <div className="space-y-1">
                    <p className="text-xs text-[hsl(var(--vp-muted))]">
                      {content?.motionSamples?.notification}
                    </p>
                    <p className="text-sm font-semibold text-[hsl(var(--vp-text))]">
                      {content?.motionSamples?.notificationText}
                    </p>
                  </div>
                  <span className="vp-pill">
                    {content?.motionSamples?.auto}
                  </span>
                </div>
                <div className="vp-card vp-card-soft p-3">
                  <div className="flex items-center justify-between text-xs text-[hsl(var(--vp-muted))]">
                    <span>{content?.motionSamples?.menu}</span>
                    <span className="vp-pill">
                      {content?.motionSamples?.hover}
                    </span>
                  </div>
                  <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                    <div className="vp-chip">
                      {content?.motionSamples?.sales}
                    </div>
                    <div className="vp-chip">
                      {content?.motionSamples?.reports}
                    </div>
                    <div className="vp-chip">
                      {content?.motionSamples?.products}
                    </div>
                    <div className="vp-chip">
                      {content?.motionSamples?.cash}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="vp-card vp-card-soft p-6">
              <p className="text-sm text-[hsl(var(--vp-muted))]">
                {content?.motionSamples?.note}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

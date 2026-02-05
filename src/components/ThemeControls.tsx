"use client";

import { useTheme } from "@/lib/context/ThemeContext";
import { useLanguage } from "@/lib/context/LanguageContext";

const VARIANTS = ["minimal", "balanced", "vibrant"] as const;

type ThemeVariant = (typeof VARIANTS)[number];

export default function ThemeControls({
  compact = false,
}: {
  compact?: boolean;
}) {
  const { t } = useLanguage();
  const { theme, themeVariant, toggleTheme, setThemeVariant } = useTheme();

  const variantLabels: Record<ThemeVariant, string> = {
    minimal: String(t("minimal", "common")),
    balanced: String(t("balanced", "common")),
    vibrant: String(t("vibrant", "common")),
  };

  return (
    <div className={`flex items-center gap-2 ${compact ? "flex-wrap" : ""}`}>
      <button
        type="button"
        className="vp-button vp-button-ghost vp-button-sm vp-press"
        onClick={toggleTheme}
      >
        {theme === "dark"
          ? String(t("lightMode", "common"))
          : String(t("darkMode", "common"))}
      </button>
      <div className="vp-segment" role="group" aria-label="Palette variants">
        {VARIANTS.map((variant) => (
          <button
            key={variant}
            type="button"
            className="vp-segment-button"
            data-active={themeVariant === variant}
            aria-pressed={themeVariant === variant}
            onClick={() => setThemeVariant(variant)}
          >
            {variantLabels[variant]}
          </button>
        ))}
      </div>
    </div>
  );
}

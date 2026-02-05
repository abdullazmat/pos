"use client";

import { useLanguage } from "@/lib/context/LanguageContext";
import { useTheme } from "@/lib/context/ThemeContext";
import { Moon, Sun } from "lucide-react";

export function LanguageSelector() {
  const { currentLanguage, setLanguage, t } = useLanguage();
  const { theme, toggleTheme } = useTheme();

  const languages = [
    { code: "es" as const, label: "Español" },
    { code: "en" as const, label: "English" },
    { code: "pt" as const, label: "Português" },
  ];

  return (
    <div className="flex items-center gap-3">
      <select
        value={currentLanguage}
        onChange={(e) => setLanguage(e.target.value as any)}
        className="text-sm"
      >
        {languages.map((lang) => (
          <option key={lang.code} value={lang.code}>
            {lang.label}
          </option>
        ))}
      </select>

      <button
        onClick={toggleTheme}
        className="vp-button vp-button-ghost"
        title={String(t(`${theme}Mode`, "common"))}
        aria-label="Toggle theme"
      >
        {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
      </button>
    </div>
  );
}

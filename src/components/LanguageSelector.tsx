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
    <div className="flex items-center gap-4">
      {/* Language Selector */}
      <select
        value={currentLanguage}
        onChange={(e) => setLanguage(e.target.value as any)}
        className="px-3 py-2 rounded-lg border border-gray-700 bg-gray-800 text-white hover:border-gray-600 transition text-sm"
      >
        {languages.map((lang) => (
          <option key={lang.code} value={lang.code}>
            {lang.label}
          </option>
        ))}
      </select>

      {/* Theme Toggle */}
      <button
        onClick={toggleTheme}
        className="p-2 rounded-lg border border-gray-700 bg-gray-800 text-white hover:bg-gray-700 transition"
        title={String(t(`${theme}Mode`, "common"))}
        aria-label="Toggle theme"
      >
        {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
      </button>
    </div>
  );
}

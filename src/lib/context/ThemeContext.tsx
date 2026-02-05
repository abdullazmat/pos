"use client";

import { createContext, useContext, useState, useEffect } from "react";

type Theme = "light" | "dark";
type ThemeVariant = "minimal" | "balanced" | "vibrant";

interface ThemeContextType {
  theme: Theme;
  themeVariant: ThemeVariant;
  toggleTheme: () => void;
  setThemeVariant: (variant: ThemeVariant) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>("dark");
  const [themeVariant, setThemeVariantState] =
    useState<ThemeVariant>("balanced");
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    const savedTheme = localStorage.getItem("theme") as Theme;
    const savedVariant = localStorage.getItem("themeVariant") as ThemeVariant;
    if (
      savedVariant &&
      ["minimal", "balanced", "vibrant"].includes(savedVariant)
    ) {
      setThemeVariantState(savedVariant);
      applyVariant(savedVariant);
    } else {
      applyVariant("balanced");
    }

    if (savedTheme && ["light", "dark"].includes(savedTheme)) {
      setTheme(savedTheme);
      applyTheme(savedTheme);
    } else {
      const prefersDark = window.matchMedia(
        "(prefers-color-scheme: dark)",
      ).matches;
      const initialTheme = prefersDark ? "dark" : "light";
      setTheme(initialTheme);
      applyTheme(initialTheme);
    }
  }, []);

  const applyTheme = (newTheme: Theme) => {
    const html = document.documentElement;
    if (newTheme === "dark") {
      html.classList.add("dark");
      html.style.colorScheme = "dark";
    } else {
      html.classList.remove("dark");
      html.style.colorScheme = "light";
    }
  };

  const applyVariant = (variant: ThemeVariant) => {
    const html = document.documentElement;
    html.dataset.theme = variant;
  };

  const toggleTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    applyTheme(newTheme);
  };

  const setThemeVariant = (variant: ThemeVariant) => {
    setThemeVariantState(variant);
    localStorage.setItem("themeVariant", variant);
    applyVariant(variant);
  };

  return (
    <ThemeContext.Provider
      value={{ theme, themeVariant, toggleTheme, setThemeVariant }}
    >
      {isClient && children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return context;
}

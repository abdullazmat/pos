"use client";

import { useLanguage } from "@/lib/context/LanguageContext";

// Proxy hook that reuses the central LanguageContext translations
export function useLang(namespace: string = "common") {
  const { t } = useLanguage();

  const translate = (key: string, isArray: boolean = false): any => {
    const value = t(key, namespace);
    if (isArray && Array.isArray(value)) return value;
    return typeof value === "string" ? value : key;
  };

  return translate;
}
// Export useLanguage for direct access when needed
export { useLanguage };

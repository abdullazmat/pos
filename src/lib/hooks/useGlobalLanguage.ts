"use client";

import { useLanguage } from "@/lib/context/LanguageContext";
import { subscribeToLanguageChange } from "@/lib/context/LanguageContext";
import { useEffect, useState } from "react";

// Hook that ensures component re-renders when language changes globally
// This hook adds an additional listener to trigger re-renders when language changes
export function useGlobalLanguage() {
  const context = useLanguage();
  const [, setLanguageChangeCount] = useState(0);

  useEffect(() => {
    // Subscribe to language changes and trigger re-render
    const unsubscribe = subscribeToLanguageChange(() => {
      setLanguageChangeCount((prev) => prev + 1);
    });

    return unsubscribe;
  }, []);

  return context;
}

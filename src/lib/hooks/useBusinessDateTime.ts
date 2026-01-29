"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useGlobalLanguage } from "@/lib/hooks/useGlobalLanguage";
import {
  formatWithCountry,
  resolveCountryLocaleTimeZone,
} from "@/lib/utils/businessDateTime";

const DEFAULT_COUNTRY = "argentina";

export const useBusinessDateTime = () => {
  const { currentLanguage } = useGlobalLanguage();
  const [country, setCountry] = useState<string>(() => {
    if (typeof window === "undefined") return DEFAULT_COUNTRY;
    return localStorage.getItem("businessCountry") || DEFAULT_COUNTRY;
  });

  const applyCountry = useCallback((value?: string) => {
    const normalized = (value || "").toString().trim();
    if (!normalized) return;
    setCountry(normalized);
  }, []);

  useEffect(() => {
    const storedCountry = localStorage.getItem("businessCountry");
    if (storedCountry) {
      applyCountry(storedCountry);
    }

    const loadCountry = async () => {
      try {
        const token = localStorage.getItem("accessToken");
        const response = await fetch("/api/business-config", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (response.ok) {
          const payload = await response.json();
          const data = payload?.data ?? payload;
          if (data?.country) {
            localStorage.setItem("businessCountry", String(data.country));
            applyCountry(String(data.country));
            return;
          }
        }
      } catch (error) {
        console.warn("Failed to load business country", error);
      }
    };

    loadCountry();
  }, [applyCountry]);

  useEffect(() => {
    const handleCountryEvent = (event: Event) => {
      const customEvent = event as CustomEvent<{ country?: string }>;
      applyCountry(customEvent?.detail?.country);
    };

    const handleStorage = (event: StorageEvent) => {
      if (event.key === "businessCountry") {
        applyCountry(event.newValue || undefined);
      }
    };

    window.addEventListener(
      "business-country-changed",
      handleCountryEvent as EventListener,
    );
    window.addEventListener("storage", handleStorage);

    return () => {
      window.removeEventListener(
        "business-country-changed",
        handleCountryEvent as EventListener,
      );
      window.removeEventListener("storage", handleStorage);
    };
  }, [applyCountry]);

  const localeConfig = useMemo(
    () => resolveCountryLocaleTimeZone(country, currentLanguage),
    [country, currentLanguage],
  );

  const formatDateTime = useCallback(
    (value?: string | Date) =>
      formatWithCountry(value, country, currentLanguage, {
        dateStyle: "short",
        timeStyle: "medium",
      }),
    [country, currentLanguage],
  );

  const formatDate = useCallback(
    (value?: string | Date) =>
      formatWithCountry(value, country, currentLanguage, {
        dateStyle: "short",
        timeStyle: undefined,
      }),
    [country, currentLanguage],
  );

  const formatTime = useCallback(
    (value?: string | Date) =>
      formatWithCountry(value, country, currentLanguage, {
        dateStyle: undefined,
        timeStyle: "medium",
      }),
    [country, currentLanguage],
  );

  return {
    country,
    locale: localeConfig.locale,
    timeZone: localeConfig.timeZone,
    formatDateTime,
    formatDate,
    formatTime,
  };
};

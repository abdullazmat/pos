"use client";

import { useEffect } from "react";
import { toast } from "react-toastify";

// Known non-critical error patterns that should be suppressed silently
const SUPPRESSED_PATTERNS = [
  "removeChild",
  "Failed to execute 'removeChild'",
  "not a child of this node",
  "ResizeObserver loop",
  "ResizeObserver loop limit exceeded",
];

const SUPPRESSED_CONSOLE_PATTERNS = [
  ...SUPPRESSED_PATTERNS,
  "Warning: ReactDOM.render",
  "Hydration failed",
];

const SUPPRESSED_WARN_PATTERNS = [
  "Warning: Did not expect server HTML to contain",
  "Warning: useLayoutEffect does nothing on the server",
  "Extra attributes from the server",
];

const isSuppressed = (message: string, patterns: string[]) =>
  patterns.some((p) => message.includes(p));

/**
 * Global error handler that:
 * 1. Suppresses known non-critical DOM errors (removeChild, ResizeObserver, hydration)
 * 2. Shows toast notifications for genuine unexpected errors
 * 3. Prevents blank screens / silent failures
 */
export function GlobalErrorHandler() {
  useEffect(() => {
    const originalError = console.error;
    const originalWarn = console.warn;

    // Debounce: don't spam multiple toasts for the same error
    let lastToastTime = 0;
    let lastToastMsg = "";

    const showErrorToast = (message: string) => {
      const now = Date.now();
      // Deduplicate: same message within 5 seconds
      if (message === lastToastMsg && now - lastToastTime < 5000) return;
      lastToastTime = now;
      lastToastMsg = message;

      // Read language from localStorage for label
      const lang =
        typeof window !== "undefined"
          ? localStorage.getItem("language") || "es"
          : "es";
      const labels: Record<string, string> = {
        es: "Ocurrió un error inesperado en la aplicación.",
        en: "An unexpected error occurred in the application.",
        pt: "Ocorreu um erro inesperado na aplicação.",
      };

      toast.error(labels[lang] || labels.es, {
        toastId: "global-error",
        autoClose: 5000,
      });
    };

    // Intercept and handle window errors
    const handleError = (event: ErrorEvent) => {
      const errorMessage = event.message || event.error?.toString() || "";

      if (isSuppressed(errorMessage, SUPPRESSED_PATTERNS)) {
        event.preventDefault();
        event.stopPropagation();
        return true;
      }

      // Show toast for genuine errors
      showErrorToast(errorMessage);
      return false;
    };

    // Intercept unhandled promise rejections
    const handleRejection = (event: PromiseRejectionEvent) => {
      const errorMessage = event.reason?.toString() || "";

      if (isSuppressed(errorMessage, SUPPRESSED_PATTERNS)) {
        event.preventDefault();
        return true;
      }

      // Show toast for genuine unhandled rejections
      showErrorToast(errorMessage);
      return false;
    };

    // Override console.error to suppress specific errors
    console.error = function (...args: any[]) {
      const errorMessage = args[0]?.toString?.() || JSON.stringify(args[0]);

      if (isSuppressed(errorMessage || "", SUPPRESSED_CONSOLE_PATTERNS)) {
        return;
      }

      return originalError.apply(console, args);
    };

    // Override console.warn to suppress specific warnings
    console.warn = function (...args: any[]) {
      const warnMessage = args[0]?.toString?.() || JSON.stringify(args[0]);

      if (isSuppressed(warnMessage || "", SUPPRESSED_WARN_PATTERNS)) {
        return;
      }

      return originalWarn.apply(console, args);
    };

    // Add global error listeners
    window.addEventListener("error", handleError, true);
    window.addEventListener("unhandledrejection", handleRejection, true);

    return () => {
      console.error = originalError;
      console.warn = originalWarn;
      window.removeEventListener("error", handleError, true);
      window.removeEventListener("unhandledrejection", handleRejection, true);
    };
  }, []);

  return null;
}

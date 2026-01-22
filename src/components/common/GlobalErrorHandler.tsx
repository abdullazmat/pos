"use client";

import { useEffect } from "react";

/**
 * Global error handler that catches and suppresses non-critical DOM errors
 * particularly "removeChild" errors from third-party libraries and React DOM
 */
export function GlobalErrorHandler() {
  useEffect(() => {
    // Store original error handler
    const originalError = console.error;
    const originalWarn = console.warn;

    // Intercept and handle window errors
    const handleError = (event: ErrorEvent) => {
      const errorMessage = event.message || event.error?.toString() || "";

      // Suppress known non-critical errors
      if (
        errorMessage.includes("removeChild") ||
        errorMessage.includes("Failed to execute 'removeChild'") ||
        errorMessage.includes("not a child of this node") ||
        errorMessage.includes("ResizeObserver loop") ||
        errorMessage.includes("ResizeObserver loop limit exceeded")
      ) {
        event.preventDefault();
        event.stopPropagation();
        return true; // Prevent default error handling
      }
      return false;
    };

    // Intercept unhandled promise rejections
    const handleRejection = (event: PromiseRejectionEvent) => {
      const errorMessage = event.reason?.toString() || "";

      if (
        errorMessage.includes("removeChild") ||
        errorMessage.includes("not a child of this node")
      ) {
        event.preventDefault();
        return true;
      }
      return false;
    };

    // Override console.error to suppress specific errors
    console.error = function (...args: any[]) {
      const errorMessage = args[0]?.toString?.() || JSON.stringify(args[0]);

      // Suppress known non-critical errors
      if (
        errorMessage?.includes("removeChild") ||
        errorMessage?.includes("Failed to execute 'removeChild'") ||
        errorMessage?.includes("not a child of this node") ||
        errorMessage?.includes("ResizeObserver loop limit exceeded") ||
        errorMessage?.includes("Warning: ReactDOM.render") ||
        errorMessage?.includes("Hydration failed")
      ) {
        // Don't show these errors in console
        return;
      }

      // Log everything else normally
      return originalError.apply(console, args);
    };

    // Override console.warn to suppress specific warnings
    console.warn = function (...args: any[]) {
      const warnMessage = args[0]?.toString?.() || JSON.stringify(args[0]);

      // Suppress hydration warnings from portals
      if (
        warnMessage?.includes(
          "Warning: Did not expect server HTML to contain",
        ) ||
        warnMessage?.includes(
          "Warning: useLayoutEffect does nothing on the server",
        ) ||
        warnMessage?.includes("Extra attributes from the server")
      ) {
        return;
      }

      return originalWarn.apply(console, args);
    };

    // Add global error listeners
    window.addEventListener("error", handleError, true);
    window.addEventListener("unhandledrejection", handleRejection, true);

    return () => {
      // Restore original handlers on cleanup
      console.error = originalError;
      console.warn = originalWarn;
      window.removeEventListener("error", handleError, true);
      window.removeEventListener("unhandledrejection", handleRejection, true);
    };
  }, []);

  return null;
}

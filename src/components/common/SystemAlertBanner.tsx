"use client";

import { useEffect, useState, useCallback } from "react";
import {
  SystemAlert,
  onSystemAlert,
  onAlertDismiss,
  onAlertsClear,
  dismissAlert,
  getActiveAlerts,
} from "@/lib/autoRecovery/systemAlerts";

/**
 * SystemAlertBanner - Shows major system issues as a persistent warning
 *
 * Behavior:
 * - Minor issues: NOT shown (handled silently)
 * - Major issues: Shown as a non-blocking warning banner at the top
 * - User can dismiss individual alerts
 */
export default function SystemAlertBanner() {
  const [alerts, setAlerts] = useState<SystemAlert[]>([]);

  const refreshAlerts = useCallback(() => {
    setAlerts(getActiveAlerts());
  }, []);

  useEffect(() => {
    // Load any existing alerts
    refreshAlerts();

    // Subscribe to new alerts
    const unsubAlert = onSystemAlert(() => refreshAlerts());
    const unsubDismiss = onAlertDismiss(() => refreshAlerts());
    const unsubClear = onAlertsClear(() => setAlerts([]));

    return () => {
      unsubAlert();
      unsubDismiss();
      unsubClear();
    };
  }, [refreshAlerts]);

  const handleDismiss = (id: string) => {
    dismissAlert(id);
    refreshAlerts();
  };

  if (alerts.length === 0) return null;

  // Read language for user-facing text
  const lang =
    typeof window !== "undefined"
      ? localStorage.getItem("language") || "es"
      : "es";

  const labels: Record<
    string,
    { contact: string; dismiss: string; issues: string }
  > = {
    es: {
      contact: "Contactar desarrollador",
      dismiss: "Cerrar",
      issues: "problema(s) del sistema",
    },
    en: {
      contact: "Contact developer",
      dismiss: "Dismiss",
      issues: "system issue(s)",
    },
    pt: {
      contact: "Contatar desenvolvedor",
      dismiss: "Fechar",
      issues: "problema(s) do sistema",
    },
  };

  const l = labels[lang] || labels.es;

  return (
    <div className="fixed top-0 left-0 right-0 z-[9999] pointer-events-none">
      <div className="flex flex-col items-center gap-2 p-2">
        {alerts.slice(0, 3).map((alert) => (
          <div
            key={alert.id}
            className="pointer-events-auto w-full max-w-2xl mx-auto animate-slide-down"
            role="alert"
            aria-live="assertive"
          >
            <div
              className={`
              flex items-start gap-3 px-4 py-3 rounded-lg shadow-lg border
              ${
                alert.severity === "major"
                  ? "bg-amber-50 dark:bg-amber-950/80 border-amber-300 dark:border-amber-700"
                  : "bg-blue-50 dark:bg-blue-950/80 border-blue-300 dark:border-blue-700"
              }
            `}
            >
              {/* Warning Icon */}
              <div className="flex-shrink-0 mt-0.5">
                <svg
                  className={`w-5 h-5 ${
                    alert.severity === "major"
                      ? "text-amber-600 dark:text-amber-400"
                      : "text-blue-600 dark:text-blue-400"
                  }`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
                  />
                </svg>
              </div>

              {/* Message */}
              <div className="flex-1 min-w-0">
                <p
                  className={`text-sm font-medium ${
                    alert.severity === "major"
                      ? "text-amber-800 dark:text-amber-200"
                      : "text-blue-800 dark:text-blue-200"
                  }`}
                >
                  {alert.message}
                </p>
                <p
                  className={`text-xs mt-1 ${
                    alert.severity === "major"
                      ? "text-amber-600 dark:text-amber-400"
                      : "text-blue-600 dark:text-blue-400"
                  }`}
                >
                  [{alert.module}]{" "}
                  {new Date(alert.timestamp).toLocaleTimeString()}
                </p>
              </div>

              {/* Dismiss button */}
              <button
                onClick={() => handleDismiss(alert.id)}
                className={`flex-shrink-0 p-1 rounded-md transition-colors ${
                  alert.severity === "major"
                    ? "text-amber-500 hover:text-amber-700 hover:bg-amber-200/50 dark:hover:bg-amber-800/50"
                    : "text-blue-500 hover:text-blue-700 hover:bg-blue-200/50 dark:hover:bg-blue-800/50"
                }`}
                title={l.dismiss}
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          </div>
        ))}

        {/* Show count if more than 3 */}
        {alerts.length > 3 && (
          <div className="pointer-events-auto text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/80 px-3 py-1 rounded-full border border-amber-300 dark:border-amber-700">
            +{alerts.length - 3} {l.issues}
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * System Alert Manager
 *
 * Manages user-facing alerts for major issues.
 * - Minor issues: handled silently in the background
 * - Major issues: show a clear, non-intrusive warning banner
 *
 * Client-side only. Uses events to communicate with the UI component.
 */

import { ClassifiedIssue, IssueSeverity } from "./issueClassifier";

export interface SystemAlert {
  id: string;
  severity: IssueSeverity;
  category: string;
  message: string;
  module: string;
  timestamp: string;
  dismissed: boolean;
  autoRecovered: boolean;
}

// Custom event name for alert communication
const SYSTEM_ALERT_EVENT = "system-alert";
const SYSTEM_ALERT_DISMISS_EVENT = "system-alert-dismiss";
const SYSTEM_ALERT_CLEAR_EVENT = "system-alert-clear";

// In-memory alert store (client-side)
let alerts: SystemAlert[] = [];
const MAX_ALERTS = 20;

/**
 * Emit a system alert from a classified issue
 */
export function emitSystemAlert(issue: ClassifiedIssue): void {
  if (typeof window === "undefined") return;

  const alert: SystemAlert = {
    id: `alert_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    severity: issue.severity,
    category: issue.category,
    message: issue.userMessage || issue.message,
    module: issue.module,
    timestamp: issue.timestamp,
    dismissed: false,
    autoRecovered: issue.autoRecoverable,
  };

  // Only show alerts for major non-auto-recovered issues
  if (issue.severity === "major" && !issue.autoRecoverable) {
    alerts.push(alert);
    if (alerts.length > MAX_ALERTS) {
      alerts = alerts.slice(-MAX_ALERTS);
    }

    window.dispatchEvent(
      new CustomEvent(SYSTEM_ALERT_EVENT, { detail: alert }),
    );
  }
}

/**
 * Dismiss a specific alert
 */
export function dismissAlert(alertId: string): void {
  const alert = alerts.find((a) => a.id === alertId);
  if (alert) {
    alert.dismissed = true;
    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent(SYSTEM_ALERT_DISMISS_EVENT, { detail: alertId }),
      );
    }
  }
}

/**
 * Clear all alerts
 */
export function clearAlerts(): void {
  alerts = [];
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(SYSTEM_ALERT_CLEAR_EVENT));
  }
}

/**
 * Get active (non-dismissed) alerts
 */
export function getActiveAlerts(): SystemAlert[] {
  return alerts.filter((a) => !a.dismissed);
}

/**
 * Get all alerts (including dismissed)
 */
export function getAllAlerts(): SystemAlert[] {
  return [...alerts];
}

/**
 * Subscribe to new system alerts (returns unsubscribe function)
 */
export function onSystemAlert(
  callback: (alert: SystemAlert) => void,
): () => void {
  if (typeof window === "undefined") return () => {};

  const handler = (event: Event) => {
    const customEvent = event as CustomEvent<SystemAlert>;
    callback(customEvent.detail);
  };

  window.addEventListener(SYSTEM_ALERT_EVENT, handler);
  return () => window.removeEventListener(SYSTEM_ALERT_EVENT, handler);
}

/**
 * Subscribe to alert dismissals
 */
export function onAlertDismiss(
  callback: (alertId: string) => void,
): () => void {
  if (typeof window === "undefined") return () => {};

  const handler = (event: Event) => {
    const customEvent = event as CustomEvent<string>;
    callback(customEvent.detail);
  };

  window.addEventListener(SYSTEM_ALERT_DISMISS_EVENT, handler);
  return () => window.removeEventListener(SYSTEM_ALERT_DISMISS_EVENT, handler);
}

/**
 * Subscribe to clear all events
 */
export function onAlertsClear(callback: () => void): () => void {
  if (typeof window === "undefined") return () => {};

  window.addEventListener(SYSTEM_ALERT_CLEAR_EVENT, callback);
  return () => window.removeEventListener(SYSTEM_ALERT_CLEAR_EVENT, callback);
}

export default emitSystemAlert;

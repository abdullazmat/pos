/**
 * Feature Flags System
 *
 * Enable/disable specific modules without redeploying.
 * Flags can be set via:
 * 1. Environment variables (NEXT_PUBLIC_FF_*)
 * 2. Runtime configuration (API / admin panel)
 * 3. localStorage overrides (for testing)
 */

import logger from "./logger";

export interface FeatureFlag {
  name: string;
  enabled: boolean;
  description: string;
  /** If true, this flag can be changed at runtime */
  mutable: boolean;
  /** Timestamp of last change */
  lastChanged?: string;
}

// ─── Default Feature Flags ──────────────────────────────────────────────────

const DEFAULT_FLAGS: Record<string, FeatureFlag> = {
  // Module toggles
  pos_enabled: {
    name: "pos_enabled",
    enabled: true,
    description: "POS module",
    mutable: true,
  },
  stock_enabled: {
    name: "stock_enabled",
    enabled: true,
    description: "Stock management module",
    mutable: true,
  },
  invoicing_enabled: {
    name: "invoicing_enabled",
    enabled: true,
    description: "Electronic invoicing (AFIP)",
    mutable: true,
  },
  payments_enabled: {
    name: "payments_enabled",
    enabled: true,
    description: "Payment processing",
    mutable: true,
  },
  reports_enabled: {
    name: "reports_enabled",
    enabled: true,
    description: "Reports module",
    mutable: true,
  },
  subscriptions_enabled: {
    name: "subscriptions_enabled",
    enabled: true,
    description: "Subscription management",
    mutable: true,
  },
  cash_register_enabled: {
    name: "cash_register_enabled",
    enabled: true,
    description: "Cash register module",
    mutable: true,
  },
  fiscal_reports_enabled: {
    name: "fiscal_reports_enabled",
    enabled: true,
    description: "Fiscal reports (Libro IVA)",
    mutable: true,
  },

  // Auto-recovery features
  auto_retry_enabled: {
    name: "auto_retry_enabled",
    enabled: true,
    description: "Auto-retry for transient errors",
    mutable: true,
  },
  circuit_breaker_enabled: {
    name: "circuit_breaker_enabled",
    enabled: true,
    description: "Circuit breaker pattern",
    mutable: true,
  },
  auto_correct_minor: {
    name: "auto_correct_minor",
    enabled: true,
    description: "Auto-correct minor issues",
    mutable: true,
  },
  system_alerts_enabled: {
    name: "system_alerts_enabled",
    enabled: true,
    description: "Show system alert banners",
    mutable: true,
  },
  health_check_enabled: {
    name: "health_check_enabled",
    enabled: true,
    description: "Health check endpoint",
    mutable: true,
  },

  // Maintenance mode
  maintenance_mode: {
    name: "maintenance_mode",
    enabled: false,
    description: "System in maintenance mode",
    mutable: true,
  },
};

// ─── Runtime State ──────────────────────────────────────────────────────────

let runtimeFlags: Record<string, boolean> = {};

/**
 * Initialize flags from environment variables and localStorage
 */
function loadFlags(): void {
  // 1. Load from environment variables (NEXT_PUBLIC_FF_FLAG_NAME=true/false)
  if (typeof process !== "undefined" && process.env) {
    Object.keys(DEFAULT_FLAGS).forEach((flagName) => {
      const envKey = `NEXT_PUBLIC_FF_${flagName.toUpperCase()}`;
      const envValue = process.env[envKey];
      if (envValue !== undefined) {
        runtimeFlags[flagName] = envValue === "true" || envValue === "1";
      }
    });
  }

  // 2. Load from localStorage overrides (client-side only)
  if (typeof window !== "undefined") {
    try {
      const stored = localStorage.getItem("featureFlags");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (typeof parsed === "object") {
          Object.assign(runtimeFlags, parsed);
        }
      }
    } catch {
      // Ignore parse errors
    }
  }
}

// Load on import
loadFlags();

// ─── Public API ─────────────────────────────────────────────────────────────

/**
 * Check if a feature flag is enabled
 */
export function isFeatureEnabled(flagName: string): boolean {
  // Runtime override takes priority
  if (flagName in runtimeFlags) {
    return runtimeFlags[flagName];
  }

  // Fall back to default
  const flag = DEFAULT_FLAGS[flagName];
  return flag ? flag.enabled : false;
}

/**
 * Set a feature flag at runtime
 */
export function setFeatureFlag(flagName: string, enabled: boolean): void {
  const flag = DEFAULT_FLAGS[flagName];
  if (flag && !flag.mutable) {
    logger.warn(`Cannot change immutable flag: ${flagName}`, {
      module: "System",
      action: "featureFlag:set",
    });
    return;
  }

  runtimeFlags[flagName] = enabled;

  // Persist to localStorage if available
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem("featureFlags", JSON.stringify(runtimeFlags));
    } catch {
      // Ignore storage errors
    }
  }

  logger.info(
    `Feature flag "${flagName}" ${enabled ? "ENABLED" : "DISABLED"}`,
    {
      module: "System",
      action: "featureFlag:set",
      metadata: { flagName, enabled },
    },
  );
}

/**
 * Get all feature flags with their current state
 */
export function getAllFeatureFlags(): FeatureFlag[] {
  return Object.values(DEFAULT_FLAGS).map((flag) => ({
    ...flag,
    enabled: isFeatureEnabled(flag.name),
  }));
}

/**
 * Reset all flags to defaults (clear runtime overrides)
 */
export function resetFeatureFlags(): void {
  runtimeFlags = {};
  if (typeof window !== "undefined") {
    try {
      localStorage.removeItem("featureFlags");
    } catch {
      // Ignore
    }
  }
  logger.info("All feature flags reset to defaults", {
    module: "System",
    action: "featureFlag:reset",
  });
}

/**
 * HOC/wrapper: only execute if flag is enabled, otherwise return fallback
 */
export function withFeatureFlag<T>(
  flagName: string,
  fn: () => T,
  fallback: T,
): T {
  if (isFeatureEnabled(flagName)) {
    return fn();
  }
  return fallback;
}

/**
 * Async version: only execute if flag is enabled
 */
export async function withAsyncFeatureFlag<T>(
  flagName: string,
  fn: () => Promise<T>,
  fallback: T,
): Promise<T> {
  if (isFeatureEnabled(flagName)) {
    return fn();
  }
  return fallback;
}

export default isFeatureEnabled;

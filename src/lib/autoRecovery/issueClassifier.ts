/**
 * Issue Classifier & Auto-Corrector
 *
 * The brain of the auto-recovery system. Classifies issues into:
 * - MINOR: Auto-correctable in the background (missing defaults, transient errors, etc.)
 * - MAJOR: Requires user/developer notification (financial errors, data corruption, etc.)
 *
 * IMPORTANT: This system NEVER modifies business logic, sales calculations,
 * invoicing rules, or payment processing. It only handles operational issues.
 */

import logger, { SystemModule } from "./logger";

export type IssueSeverity = "minor" | "major";

export type IssueCategory =
  | "missing_value" // Missing field that can be defaulted
  | "format_error" // Date/number format issues
  | "transient_error" // Temporary network/service failure
  | "stale_data" // Cached data that needs refresh
  | "ui_render_error" // Non-critical UI rendering issue
  | "calculation_error" // Financial calculation mismatch
  | "data_integrity" // Data corruption or inconsistency
  | "service_down" // External service unavailable
  | "auth_failure" // Authentication/authorization failure
  | "payment_error" // Payment processing failure
  | "invoice_error" // Invoice generation/AFIP failure
  | "database_error" // Database connection/query failure
  | "unknown";

export interface ClassifiedIssue {
  severity: IssueSeverity;
  category: IssueCategory;
  message: string;
  userMessage: string; // What to show the user
  autoRecoverable: boolean;
  recoveryAction?: string; // Description of what auto-recovery did
  requiresDeveloper: boolean;
  originalError?: unknown;
  module: SystemModule;
  timestamp: string;
}

// ─── Issue Classification Rules ─────────────────────────────────────────────

interface ClassificationRule {
  test: (error: unknown, context?: IssueContext) => boolean;
  category: IssueCategory;
  severity: IssueSeverity;
  autoRecoverable: boolean;
  requiresDeveloper: boolean;
  userMessage: (lang: string) => string;
}

export interface IssueContext {
  module?: SystemModule;
  action?: string;
  httpStatus?: number;
  errorCode?: string;
}

const CLASSIFICATION_RULES: ClassificationRule[] = [
  // ─── MINOR: Auto-Recoverable ──────────────────────────────────────────

  // Missing values that can be defaulted
  {
    test: (error) => {
      const msg = errorMessage(error);
      return (
        msg.includes("undefined") ||
        msg.includes("null") ||
        msg.includes("missing") ||
        msg.includes("required field") ||
        msg.includes("cannot read properties of undefined") ||
        msg.includes("cannot read properties of null")
      );
    },
    category: "missing_value",
    severity: "minor",
    autoRecoverable: true,
    requiresDeveloper: false,
    userMessage: () => "", // Silent fix
  },

  // Format errors (dates, numbers)
  {
    test: (error) => {
      const msg = errorMessage(error);
      return (
        msg.includes("invalid date") ||
        msg.includes("invalid time") ||
        msg.includes("nan") ||
        msg.includes("invalid number") ||
        msg.includes("tolocalestring") ||
        msg.includes("tolocaledatestring")
      );
    },
    category: "format_error",
    severity: "minor",
    autoRecoverable: true,
    requiresDeveloper: false,
    userMessage: () => "",
  },

  // Network/transient errors
  {
    test: (error, context) => {
      const msg = errorMessage(error);
      return (
        msg.includes("network") ||
        msg.includes("fetch failed") ||
        msg.includes("econnrefused") ||
        msg.includes("econnreset") ||
        msg.includes("etimedout") ||
        msg.includes("socket hang up") ||
        msg.includes("aborted") ||
        msg.includes("timeout") ||
        context?.httpStatus === 503 ||
        context?.httpStatus === 502 ||
        context?.httpStatus === 504
      );
    },
    category: "transient_error",
    severity: "minor",
    autoRecoverable: true,
    requiresDeveloper: false,
    userMessage: () => "",
  },

  // Stale cache / data that can be refreshed
  {
    test: (error) => {
      const msg = errorMessage(error);
      return (
        msg.includes("stale") ||
        msg.includes("cache") ||
        msg.includes("expired") ||
        msg.includes("version mismatch")
      );
    },
    category: "stale_data",
    severity: "minor",
    autoRecoverable: true,
    requiresDeveloper: false,
    userMessage: () => "",
  },

  // UI rendering errors (hydration, removeChild, ResizeObserver)
  {
    test: (error) => {
      const msg = errorMessage(error);
      return (
        msg.includes("hydration") ||
        msg.includes("removechild") ||
        msg.includes("resizeobserver") ||
        msg.includes("text content does not match") ||
        msg.includes("minified react error")
      );
    },
    category: "ui_render_error",
    severity: "minor",
    autoRecoverable: true,
    requiresDeveloper: false,
    userMessage: () => "",
  },

  // ─── MAJOR: Requires Alert ────────────────────────────────────────────

  // Financial calculation errors — NEVER auto-correct
  {
    test: (error, context) => {
      const msg = errorMessage(error);
      return (
        (context?.module === "Invoice" ||
          context?.module === "Payment" ||
          msg.includes("calculation") ||
          msg.includes("total mismatch") ||
          msg.includes("balance") ||
          msg.includes("decimal") ||
          msg.includes("rounding")) &&
        (msg.includes("error") ||
          msg.includes("mismatch") ||
          msg.includes("invalid") ||
          msg.includes("failed"))
      );
    },
    category: "calculation_error",
    severity: "major",
    autoRecoverable: false,
    requiresDeveloper: true,
    userMessage: (lang) => MAJOR_USER_MESSAGES[lang] || MAJOR_USER_MESSAGES.es,
  },

  // Data integrity issues
  {
    test: (error) => {
      const msg = errorMessage(error);
      return (
        msg.includes("integrity") ||
        msg.includes("corrupt") ||
        msg.includes("inconsistent") ||
        msg.includes("duplicate key") ||
        msg.includes("constraint violation")
      );
    },
    category: "data_integrity",
    severity: "major",
    autoRecoverable: false,
    requiresDeveloper: true,
    userMessage: (lang) => MAJOR_USER_MESSAGES[lang] || MAJOR_USER_MESSAGES.es,
  },

  // Payment processing failures
  {
    test: (error, context) => {
      const msg = errorMessage(error);
      return (
        (context?.module === "MercadoPago" ||
          context?.module === "Payment" ||
          msg.includes("payment") ||
          msg.includes("charge") ||
          msg.includes("billing")) &&
        (msg.includes("failed") ||
          msg.includes("declined") ||
          msg.includes("error"))
      );
    },
    category: "payment_error",
    severity: "major",
    autoRecoverable: false,
    requiresDeveloper: true,
    userMessage: (lang) =>
      PAYMENT_USER_MESSAGES[lang] || PAYMENT_USER_MESSAGES.es,
  },

  // AFIP/Invoice errors
  {
    test: (error, context) => {
      const msg = errorMessage(error);
      return (
        (context?.module === "AFIP" ||
          msg.includes("afip") ||
          msg.includes("arca") ||
          msg.includes("cae") ||
          msg.includes("factura")) &&
        (msg.includes("failed") ||
          msg.includes("rejected") ||
          msg.includes("error"))
      );
    },
    category: "invoice_error",
    severity: "major",
    autoRecoverable: false,
    requiresDeveloper: true,
    userMessage: (lang) =>
      INVOICE_USER_MESSAGES[lang] || INVOICE_USER_MESSAGES.es,
  },

  // Database errors (connection failures after initial connect)
  {
    test: (error) => {
      const msg = errorMessage(error);
      return (
        msg.includes("mongo") ||
        msg.includes("database") ||
        msg.includes("connection refused") ||
        msg.includes("topology was destroyed")
      );
    },
    category: "database_error",
    severity: "major",
    autoRecoverable: false,
    requiresDeveloper: true,
    userMessage: (lang) => MAJOR_USER_MESSAGES[lang] || MAJOR_USER_MESSAGES.es,
  },

  // Auth failures (beyond simple token refresh)
  {
    test: (error, context) => {
      const msg = errorMessage(error);
      return (
        context?.httpStatus === 401 ||
        context?.httpStatus === 403 ||
        msg.includes("unauthorized") ||
        msg.includes("forbidden")
      );
    },
    category: "auth_failure",
    severity: "minor", // Auth failures are handled by apiFetch token refresh
    autoRecoverable: true,
    requiresDeveloper: false,
    userMessage: () => "",
  },
];

// ─── User-Facing Messages ───────────────────────────────────────────────────

const MAJOR_USER_MESSAGES: Record<string, string> = {
  es: "⚠️ Se detectó un problema en el sistema. Por favor contacte al desarrollador.",
  en: "⚠️ A system issue was detected. Please contact the developer.",
  pt: "⚠️ Um problema no sistema foi detectado. Por favor, entre em contato com o desenvolvedor.",
};

const PAYMENT_USER_MESSAGES: Record<string, string> = {
  es: "⚠️ Error en el procesamiento de pago. Por favor contacte al desarrollador.",
  en: "⚠️ Payment processing error. Please contact the developer.",
  pt: "⚠️ Erro no processamento do pagamento. Por favor, entre em contato com o desenvolvedor.",
};

const INVOICE_USER_MESSAGES: Record<string, string> = {
  es: "⚠️ Error en facturación electrónica. Por favor contacte al desarrollador.",
  en: "⚠️ Electronic invoicing error. Please contact the developer.",
  pt: "⚠️ Erro na faturação eletrônica. Por favor, entre em contato com o desenvolvedor.",
};

// ─── Helpers ────────────────────────────────────────────────────────────────

function errorMessage(error: unknown): string {
  if (typeof error === "string") return error.toLowerCase();
  if (error instanceof Error) return error.message.toLowerCase();
  return String(error).toLowerCase();
}

function getLanguage(): string {
  if (typeof window !== "undefined") {
    return localStorage.getItem("language") || "es";
  }
  return "es";
}

// ─── Public API ─────────────────────────────────────────────────────────────

/**
 * Classify an error into minor (auto-fixable) or major (needs alert)
 */
export function classifyIssue(
  error: unknown,
  context: IssueContext = {},
): ClassifiedIssue {
  const lang = getLanguage();
  const module = context.module || "System";

  // Try each rule in order
  for (const rule of CLASSIFICATION_RULES) {
    if (rule.test(error, context)) {
      const issue: ClassifiedIssue = {
        severity: rule.severity,
        category: rule.category,
        message: errorMessage(error),
        userMessage: rule.userMessage(lang),
        autoRecoverable: rule.autoRecoverable,
        requiresDeveloper: rule.requiresDeveloper,
        originalError: error,
        module,
        timestamp: new Date().toISOString(),
      };

      // Log based on severity
      if (issue.severity === "major") {
        logger.error(
          `MAJOR issue: [${issue.category}] ${issue.message}`,
          {
            module,
            action: context.action,
            metadata: { category: issue.category, severity: "major" },
          },
          error,
        );
      } else {
        logger.info(
          `Minor issue auto-handled: [${issue.category}] ${issue.message}`,
          {
            module,
            action: context.action,
            metadata: { category: issue.category, severity: "minor" },
          },
        );
      }

      return issue;
    }
  }

  // Default: unknown issues are treated as MAJOR for safety
  const issue: ClassifiedIssue = {
    severity: "major",
    category: "unknown",
    message: errorMessage(error),
    userMessage: MAJOR_USER_MESSAGES[lang] || MAJOR_USER_MESSAGES.es,
    autoRecoverable: false,
    requiresDeveloper: true,
    originalError: error,
    module,
    timestamp: new Date().toISOString(),
  };

  logger.error(
    `Unclassified issue treated as MAJOR: ${issue.message}`,
    {
      module,
      action: context.action,
      metadata: { category: "unknown", severity: "major" },
    },
    error,
  );

  return issue;
}

// ─── Auto-Correction Functions ──────────────────────────────────────────────

/**
 * Safe defaults for common missing values
 * These ONLY apply to non-financial, non-business-critical fields
 */
export const SAFE_DEFAULTS = {
  /** Default empty string for missing text fields */
  text: (value: unknown): string => {
    if (value === null || value === undefined) return "";
    return String(value);
  },

  /** Default 0 for missing non-financial numeric fields (quantities, page numbers, etc.) */
  safeNumber: (value: unknown, fallback: number = 0): number => {
    const num = Number(value);
    if (isNaN(num) || !isFinite(num)) return fallback;
    return num;
  },

  /** Safe date that defaults to current date if invalid */
  safeDate: (value: unknown): Date => {
    if (value instanceof Date && !isNaN(value.getTime())) return value;
    const parsed = new Date(value as string);
    if (!isNaN(parsed.getTime())) return parsed;
    return new Date();
  },

  /** Safe date string formatting */
  safeDateString: (value: unknown, locale: string = "es-AR"): string => {
    try {
      const date = SAFE_DEFAULTS.safeDate(value);
      return date.toLocaleDateString(locale);
    } catch {
      return new Date().toLocaleDateString(locale);
    }
  },

  /** Safe array that defaults to empty array */
  safeArray: <T>(value: unknown): T[] => {
    if (Array.isArray(value)) return value;
    return [];
  },

  /** Safe object that defaults to empty object */
  safeObject: <T extends Record<string, unknown>>(value: unknown): T => {
    if (typeof value === "object" && value !== null && !Array.isArray(value))
      return value as T;
    return {} as T;
  },

  /** Safe boolean */
  safeBool: (value: unknown, fallback: boolean = false): boolean => {
    if (typeof value === "boolean") return value;
    if (value === "true" || value === 1) return true;
    if (value === "false" || value === 0) return false;
    return fallback;
  },

  /** Safe JSON parse with fallback */
  safeJsonParse: <T>(value: string, fallback: T): T => {
    try {
      return JSON.parse(value) as T;
    } catch {
      return fallback;
    }
  },

  /** Safe percentage (clamped 0-100) */
  safePercentage: (value: unknown): number => {
    const num = Number(value);
    if (isNaN(num) || !isFinite(num)) return 0;
    return Math.min(100, Math.max(0, num));
  },
};

/**
 * Wrap a function call with auto-recovery.
 * - If error is minor → auto-correct with fallback and continue silently
 * - If error is major → throw the classified issue for the UI to handle
 */
export function withAutoRecovery<T>(
  fn: () => T,
  fallback: T,
  context: IssueContext = {},
): T {
  try {
    const result = fn();
    // Guard against undefined/null results when a value is expected
    if (result === undefined || result === null) {
      logger.info("Auto-corrected null/undefined result with fallback", {
        module: context.module || "System",
        action: context.action,
        metadata: { fallbackUsed: true },
      });
      return fallback;
    }
    return result;
  } catch (error) {
    const issue = classifyIssue(error, context);

    if (issue.severity === "minor" && issue.autoRecoverable) {
      logger.info(`Auto-recovered [${issue.category}]: using fallback value`, {
        module: issue.module,
        action: context.action,
        metadata: { category: issue.category, recoveryAction: "fallback" },
      });
      return fallback;
    }

    // Major issue — re-throw with classification info
    const majorError = new AutoRecoveryError(issue);
    throw majorError;
  }
}

/**
 * Async version of withAutoRecovery
 */
export async function withAsyncAutoRecovery<T>(
  fn: () => Promise<T>,
  fallback: T,
  context: IssueContext = {},
): Promise<T> {
  try {
    const result = await fn();
    if (result === undefined || result === null) {
      logger.info("Auto-corrected null/undefined async result with fallback", {
        module: context.module || "System",
        action: context.action,
        metadata: { fallbackUsed: true },
      });
      return fallback;
    }
    return result;
  } catch (error) {
    const issue = classifyIssue(error, context);

    if (issue.severity === "minor" && issue.autoRecoverable) {
      logger.info(
        `Auto-recovered async [${issue.category}]: using fallback value`,
        {
          module: issue.module,
          action: context.action,
          metadata: { category: issue.category, recoveryAction: "fallback" },
        },
      );
      return fallback;
    }

    throw new AutoRecoveryError(issue);
  }
}

/**
 * Custom error class that carries classification info
 */
export class AutoRecoveryError extends Error {
  public readonly issue: ClassifiedIssue;

  constructor(issue: ClassifiedIssue) {
    super(issue.userMessage || issue.message);
    this.name = "AutoRecoveryError";
    this.issue = issue;
  }
}

export default classifyIssue;

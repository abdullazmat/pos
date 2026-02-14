/**
 * Structured Logger for Auto-Recovery System
 *
 * Provides contextual, structured logging with severity levels.
 * No sensitive data (tokens, payment details) is stored in logs.
 */

export type LogLevel = "debug" | "info" | "warn" | "error" | "critical";

export type SystemModule =
  | "POS"
  | "Stock"
  | "Invoice"
  | "Payment"
  | "Subscription"
  | "Auth"
  | "AFIP"
  | "MercadoPago"
  | "CashRegister"
  | "Reports"
  | "AutoRecovery"
  | "HealthCheck"
  | "System"
  | "API"
  | "Database";

export interface LogContext {
  tenant_id?: string;
  user_id?: string;
  role?: string;
  module: SystemModule;
  action?: string;
  version?: string;
  request_id?: string;
  duration_ms?: number;
  metadata?: Record<string, unknown>;
}

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context: LogContext;
  error?: {
    name: string;
    message: string;
    stack?: string;
    code?: string;
  };
}

// In-memory log buffer for recent entries (last 500)
const LOG_BUFFER_SIZE = 500;
const logBuffer: LogEntry[] = [];

/**
 * Sanitize data to remove sensitive information before logging
 */
function sanitize(data: Record<string, unknown>): Record<string, unknown> {
  const sensitiveKeys = [
    "token",
    "accessToken",
    "refreshToken",
    "password",
    "secret",
    "authorization",
    "cookie",
    "credit_card",
    "cvv",
    "card_number",
    "payment_token",
    "api_key",
    "apiKey",
    "private_key",
    "privateKey",
    "MERCADO_PAGO_ACCESS_TOKEN",
    "STRIPE_SECRET_KEY",
  ];

  const sanitized: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(data)) {
    if (
      sensitiveKeys.some((sk) => key.toLowerCase().includes(sk.toLowerCase()))
    ) {
      sanitized[key] = "[REDACTED]";
    } else if (
      typeof value === "object" &&
      value !== null &&
      !Array.isArray(value)
    ) {
      sanitized[key] = sanitize(value as Record<string, unknown>);
    } else {
      sanitized[key] = value;
    }
  }
  return sanitized;
}

/**
 * Create a structured log entry
 */
function createLogEntry(
  level: LogLevel,
  message: string,
  context: LogContext,
  error?: unknown,
): LogEntry {
  const entry: LogEntry = {
    timestamp: new Date().toISOString(),
    level,
    message,
    context: {
      ...context,
      version:
        context.version || process.env.NEXT_PUBLIC_APP_VERSION || "1.0.0",
      metadata: context.metadata ? sanitize(context.metadata) : undefined,
    },
  };

  if (error) {
    if (error instanceof Error) {
      entry.error = {
        name: error.name,
        message: error.message,
        stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
        code: (error as any).code,
      };
    } else {
      entry.error = {
        name: "UnknownError",
        message: String(error),
      };
    }
  }

  return entry;
}

/**
 * Write log entry to console and buffer
 */
function writeLog(entry: LogEntry): void {
  // Add to in-memory buffer
  logBuffer.push(entry);
  if (logBuffer.length > LOG_BUFFER_SIZE) {
    logBuffer.shift();
  }

  // Format for console
  const prefix = `[${entry.level.toUpperCase()}][${entry.context.module}]`;
  const ctx = entry.context.tenant_id
    ? ` tenant=${entry.context.tenant_id}`
    : "";
  const action = entry.context.action ? ` action=${entry.context.action}` : "";
  const formatted = `${prefix}${ctx}${action} ${entry.message}`;

  switch (entry.level) {
    case "debug":
      if (process.env.NODE_ENV === "development")
        console.debug(formatted, entry.context.metadata || "");
      break;
    case "info":
      console.info(formatted);
      break;
    case "warn":
      console.warn(formatted, entry.error || "");
      break;
    case "error":
      console.error(formatted, entry.error || "");
      break;
    case "critical":
      console.error(`🚨 CRITICAL: ${formatted}`, entry.error || "");
      break;
  }
}

/**
 * Structured logger instance
 */
export const logger = {
  debug(message: string, context: LogContext) {
    writeLog(createLogEntry("debug", message, context));
  },

  info(message: string, context: LogContext) {
    writeLog(createLogEntry("info", message, context));
  },

  warn(message: string, context: LogContext, error?: unknown) {
    writeLog(createLogEntry("warn", message, context, error));
  },

  error(message: string, context: LogContext, error?: unknown) {
    writeLog(createLogEntry("error", message, context, error));
  },

  critical(message: string, context: LogContext, error?: unknown) {
    writeLog(createLogEntry("critical", message, context, error));
  },

  /**
   * Get recent log entries (for diagnostics / health check)
   */
  getRecentLogs(count: number = 50, level?: LogLevel): LogEntry[] {
    let entries = [...logBuffer];
    if (level) {
      entries = entries.filter((e) => e.level === level);
    }
    return entries.slice(-count);
  },

  /**
   * Get error/critical count in last N minutes
   */
  getErrorCount(minutes: number = 5): number {
    const cutoff = new Date(Date.now() - minutes * 60 * 1000).toISOString();
    return logBuffer.filter(
      (e) =>
        (e.level === "error" || e.level === "critical") &&
        e.timestamp >= cutoff,
    ).length;
  },

  /**
   * Clear log buffer
   */
  clearBuffer() {
    logBuffer.length = 0;
  },
};

export default logger;

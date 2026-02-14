/**
 * Health Check Monitor
 *
 * Server-side health monitoring with status for:
 * - Database connection
 * - External services (AFIP, MercadoPago)
 * - Circuit breakers
 * - System metrics (error rates, uptime)
 * - Memory usage
 */

import { getAllCircuitStatuses } from "./circuitBreaker";
import logger from "./logger";

export type ServiceStatus = "healthy" | "degraded" | "unhealthy";

export interface ServiceHealth {
  name: string;
  status: ServiceStatus;
  latencyMs?: number;
  lastChecked: string;
  error?: string;
  metadata?: Record<string, unknown>;
}

export interface SystemHealth {
  status: ServiceStatus;
  timestamp: string;
  uptime: number;
  version: string;
  services: ServiceHealth[];
  circuits: Record<string, unknown>;
  metrics: {
    errorRate5m: number; // Errors per minute in last 5 min
    totalErrorsBuffer: number; // Total errors in log buffer
    memoryUsageMB?: number;
  };
}

// Track startup time
const startTime = Date.now();

/**
 * Check database health by attempting a simple operation
 */
async function checkDatabase(): Promise<ServiceHealth> {
  const start = Date.now();
  try {
    // Dynamic import to avoid circular deps
    const { default: dbConnect } = await import("@/lib/db/connect");
    const mongoose = await dbConnect();

    // Simple ping
    if (mongoose?.connection?.readyState === 1) {
      return {
        name: "MongoDB",
        status: "healthy",
        latencyMs: Date.now() - start,
        lastChecked: new Date().toISOString(),
      };
    }

    return {
      name: "MongoDB",
      status: "degraded",
      latencyMs: Date.now() - start,
      lastChecked: new Date().toISOString(),
      error: `Connection state: ${mongoose?.connection?.readyState}`,
    };
  } catch (error) {
    return {
      name: "MongoDB",
      status: "unhealthy",
      latencyMs: Date.now() - start,
      lastChecked: new Date().toISOString(),
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

/**
 * Check external service health via lightweight request
 */
async function checkExternalService(
  name: string,
  url: string,
  timeoutMs: number = 5000,
): Promise<ServiceHealth> {
  const start = Date.now();
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);

    const response = await fetch(url, {
      method: "HEAD",
      signal: controller.signal,
    }).catch(() => null);

    clearTimeout(timeout);

    if (response && response.ok) {
      return {
        name,
        status: "healthy",
        latencyMs: Date.now() - start,
        lastChecked: new Date().toISOString(),
      };
    }

    return {
      name,
      status: "degraded",
      latencyMs: Date.now() - start,
      lastChecked: new Date().toISOString(),
      error: response ? `HTTP ${response.status}` : "No response",
    };
  } catch (error) {
    return {
      name,
      status: (error as any)?.name === "AbortError" ? "degraded" : "unhealthy",
      latencyMs: Date.now() - start,
      lastChecked: new Date().toISOString(),
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

/**
 * Perform full system health check
 */
export async function performHealthCheck(): Promise<SystemHealth> {
  const services: ServiceHealth[] = [];

  // Check database
  const dbHealth = await checkDatabase();
  services.push(dbHealth);

  // Check external services (lightweight - just HEAD requests)
  const afipHealth = await checkExternalService(
    "AFIP/ARCA",
    "https://wsaa.afip.gob.ar/ws/services/LoginCms",
    5000,
  );
  services.push(afipHealth);

  // Get circuit breaker statuses
  const circuits = getAllCircuitStatuses();

  // Get error metrics
  const errorRate5m = logger.getErrorCount(5);
  const totalErrorsBuffer =
    logger.getRecentLogs(9999, "error").length +
    logger.getRecentLogs(9999, "critical").length;

  // Memory usage (server-side only)
  let memoryUsageMB: number | undefined;
  if (typeof process !== "undefined" && process.memoryUsage) {
    memoryUsageMB = Math.round(process.memoryUsage().heapUsed / 1024 / 1024);
  }

  // Determine overall status
  let overallStatus: ServiceStatus = "healthy";
  if (services.some((s) => s.status === "unhealthy")) {
    overallStatus = "unhealthy";
  } else if (services.some((s) => s.status === "degraded")) {
    overallStatus = "degraded";
  }
  // High error rate triggers degraded
  if (errorRate5m > 10) {
    overallStatus = overallStatus === "unhealthy" ? "unhealthy" : "degraded";
  }

  const health: SystemHealth = {
    status: overallStatus,
    timestamp: new Date().toISOString(),
    uptime: Math.round((Date.now() - startTime) / 1000),
    version: process.env.NEXT_PUBLIC_APP_VERSION || "1.0.0",
    services,
    circuits,
    metrics: {
      errorRate5m,
      totalErrorsBuffer,
      memoryUsageMB,
    },
  };

  // Log health check result
  if (overallStatus !== "healthy") {
    logger.warn(`Health check: ${overallStatus}`, {
      module: "HealthCheck",
      metadata: {
        status: overallStatus,
        unhealthyServices: services
          .filter((s) => s.status !== "healthy")
          .map((s) => s.name),
      },
    });
  }

  return health;
}

export default performHealthCheck;

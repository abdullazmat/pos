/**
 * Circuit Breaker Pattern
 *
 * Prevents cascading failures when external services are down.
 * States: CLOSED (normal) → OPEN (failing, reject calls) → HALF_OPEN (testing recovery)
 */

import logger, { SystemModule } from "./logger";

export type CircuitState = "CLOSED" | "OPEN" | "HALF_OPEN";

export interface CircuitBreakerOptions {
  /** Name for this circuit (used in logging) */
  name: string;
  /** Module for logging context */
  module: SystemModule;
  /** Number of failures before opening the circuit (default: 5) */
  failureThreshold?: number;
  /** Time in ms to wait before trying a request in HALF_OPEN state (default: 30000) */
  resetTimeoutMs?: number;
  /** Number of successful calls in HALF_OPEN to close the circuit (default: 2) */
  successThreshold?: number;
  /** Optional: callback when circuit state changes */
  onStateChange?: (from: CircuitState, to: CircuitState, name: string) => void;
}

export class CircuitBreaker {
  private state: CircuitState = "CLOSED";
  private failureCount = 0;
  private successCount = 0;
  private lastFailureTime = 0;
  private readonly name: string;
  private readonly module: SystemModule;
  private readonly failureThreshold: number;
  private readonly resetTimeoutMs: number;
  private readonly successThreshold: number;
  private readonly onStateChange?: (
    from: CircuitState,
    to: CircuitState,
    name: string,
  ) => void;

  constructor(options: CircuitBreakerOptions) {
    this.name = options.name;
    this.module = options.module;
    this.failureThreshold = options.failureThreshold ?? 5;
    this.resetTimeoutMs = options.resetTimeoutMs ?? 30000;
    this.successThreshold = options.successThreshold ?? 2;
    this.onStateChange = options.onStateChange;
  }

  /**
   * Execute a function through the circuit breaker
   */
  async execute<T>(fn: () => Promise<T>): Promise<T> {
    // Check if circuit should transition from OPEN to HALF_OPEN
    if (this.state === "OPEN") {
      const timeSinceLastFailure = Date.now() - this.lastFailureTime;
      if (timeSinceLastFailure >= this.resetTimeoutMs) {
        this.transition("HALF_OPEN");
      } else {
        const waitTime = this.resetTimeoutMs - timeSinceLastFailure;
        logger.warn(
          `Circuit OPEN for "${this.name}" — rejecting call. Retry in ${Math.round(waitTime / 1000)}s`,
          {
            module: this.module,
            action: `circuit:${this.name}`,
            metadata: { state: this.state, waitTimeMs: waitTime },
          },
        );
        throw new CircuitOpenError(this.name, waitTime);
      }
    }

    try {
      const result = await fn();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure(error);
      throw error;
    }
  }

  private onSuccess(): void {
    if (this.state === "HALF_OPEN") {
      this.successCount++;
      if (this.successCount >= this.successThreshold) {
        this.transition("CLOSED");
        logger.info(
          `Circuit "${this.name}" recovered — service is healthy again`,
          {
            module: this.module,
            action: `circuit:${this.name}`,
          },
        );
      }
    }
    // Reset failure count on success in CLOSED state too
    this.failureCount = 0;
  }

  private onFailure(error: unknown): void {
    this.failureCount++;
    this.lastFailureTime = Date.now();

    if (this.state === "HALF_OPEN") {
      // Any failure in HALF_OPEN goes back to OPEN
      this.transition("OPEN");
      logger.warn(
        `Circuit "${this.name}" back to OPEN — recovery attempt failed`,
        {
          module: this.module,
          action: `circuit:${this.name}`,
        },
        error,
      );
    } else if (
      this.state === "CLOSED" &&
      this.failureCount >= this.failureThreshold
    ) {
      this.transition("OPEN");
      logger.error(
        `Circuit "${this.name}" OPENED — ${this.failureCount} consecutive failures`,
        {
          module: this.module,
          action: `circuit:${this.name}`,
          metadata: {
            failureCount: this.failureCount,
            threshold: this.failureThreshold,
          },
        },
        error,
      );
    }
  }

  private transition(newState: CircuitState): void {
    const oldState = this.state;
    this.state = newState;

    if (newState === "CLOSED") {
      this.failureCount = 0;
      this.successCount = 0;
    }
    if (newState === "HALF_OPEN") {
      this.successCount = 0;
    }

    this.onStateChange?.(oldState, newState, this.name);
  }

  /** Get current circuit state */
  getState(): CircuitState {
    return this.state;
  }

  /** Get current failure count */
  getFailureCount(): number {
    return this.failureCount;
  }

  /** Get circuit info for health checks */
  getInfo() {
    return {
      name: this.name,
      state: this.state,
      failureCount: this.failureCount,
      lastFailureTime: this.lastFailureTime
        ? new Date(this.lastFailureTime).toISOString()
        : null,
    };
  }

  /** Manually reset the circuit to CLOSED */
  reset(): void {
    this.transition("CLOSED");
    logger.info(`Circuit "${this.name}" manually reset`, {
      module: this.module,
      action: `circuit:${this.name}`,
    });
  }
}

/**
 * Error thrown when a circuit breaker is open
 */
export class CircuitOpenError extends Error {
  public readonly circuitName: string;
  public readonly retryAfterMs: number;

  constructor(circuitName: string, retryAfterMs: number) {
    super(
      `Service "${circuitName}" is temporarily unavailable. Please try again in ${Math.round(retryAfterMs / 1000)} seconds.`,
    );
    this.name = "CircuitOpenError";
    this.circuitName = circuitName;
    this.retryAfterMs = retryAfterMs;
  }
}

// ─── Global Circuit Breaker Registry ──────────────────────────────────────────

const circuitRegistry = new Map<string, CircuitBreaker>();

/**
 * Get or create a circuit breaker by name
 */
export function getCircuitBreaker(
  options: CircuitBreakerOptions,
): CircuitBreaker {
  const existing = circuitRegistry.get(options.name);
  if (existing) return existing;

  const breaker = new CircuitBreaker(options);
  circuitRegistry.set(options.name, breaker);
  return breaker;
}

/**
 * Get all circuit breaker statuses (for health check)
 */
export function getAllCircuitStatuses() {
  const statuses: Record<string, ReturnType<CircuitBreaker["getInfo"]>> = {};
  circuitRegistry.forEach((breaker, name) => {
    statuses[name] = breaker.getInfo();
  });
  return statuses;
}

export default CircuitBreaker;

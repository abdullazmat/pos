/**
 * Simple in-memory job queue for async processing.
 * For production, replace with Redis Queue / BullMQ / external queue.
 *
 * Supports:
 * - Recurring expense generation (daily cron)
 * - Batch OCR processing
 * - Large file import (>100 records)
 * - Complex report generation
 * - Budget alert sending
 */

export type JobStatus = "pending" | "processing" | "completed" | "failed";

export interface Job<T = any> {
  id: string;
  type: string;
  payload: T;
  status: JobStatus;
  result?: any;
  error?: string;
  createdAt: Date;
  startedAt?: Date;
  completedAt?: Date;
  attempts: number;
  maxAttempts: number;
}

type JobHandler = (payload: any) => Promise<any>;

class JobQueue {
  private jobs: Map<string, Job> = new Map();
  private handlers: Map<string, JobHandler> = new Map();
  private processing = false;
  private maxConcurrent = 3;
  private activeCount = 0;

  /**
   * Register a handler for a specific job type.
   */
  registerHandler(type: string, handler: JobHandler): void {
    this.handlers.set(type, handler);
  }

  /**
   * Enqueue a new job for async processing.
   */
  enqueue<T>(type: string, payload: T, maxAttempts = 3): string {
    const id = `job_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
    const job: Job<T> = {
      id,
      type,
      payload,
      status: "pending",
      createdAt: new Date(),
      attempts: 0,
      maxAttempts,
    };
    this.jobs.set(id, job);
    this.processNext();
    return id;
  }

  /**
   * Get job status by ID.
   */
  getJob(id: string): Job | undefined {
    return this.jobs.get(id);
  }

  /**
   * Get all jobs, optionally filtered by type or status.
   */
  getJobs(filter?: { type?: string; status?: JobStatus }): Job[] {
    const all = Array.from(this.jobs.values());
    if (!filter) return all;
    return all.filter((j) => {
      if (filter.type && j.type !== filter.type) return false;
      if (filter.status && j.status !== filter.status) return false;
      return true;
    });
  }

  /**
   * Process the next pending job(s).
   */
  private async processNext(): Promise<void> {
    if (this.activeCount >= this.maxConcurrent) return;

    const pending = Array.from(this.jobs.values()).find(
      (j) => j.status === "pending",
    );
    if (!pending) return;

    const handler = this.handlers.get(pending.type);
    if (!handler) {
      pending.status = "failed";
      pending.error = `No handler registered for job type: ${pending.type}`;
      return;
    }

    pending.status = "processing";
    pending.startedAt = new Date();
    pending.attempts++;
    this.activeCount++;

    try {
      pending.result = await handler(pending.payload);
      pending.status = "completed";
      pending.completedAt = new Date();
    } catch (error: any) {
      if (pending.attempts < pending.maxAttempts) {
        pending.status = "pending"; // retry
        console.warn(
          `Job ${pending.id} (${pending.type}) attempt ${pending.attempts} failed, retrying...`,
          error.message,
        );
      } else {
        pending.status = "failed";
        pending.error = error.message || "Unknown error";
        pending.completedAt = new Date();
        console.error(
          `Job ${pending.id} (${pending.type}) failed after ${pending.maxAttempts} attempts:`,
          error,
        );
      }
    } finally {
      this.activeCount--;
      // Clean up old completed/failed jobs (keep last 100)
      this.cleanup();
      // Process next in queue
      this.processNext();
    }
  }

  /**
   * Remove old completed/failed jobs to prevent memory leaks.
   */
  private cleanup(): void {
    const completed = Array.from(this.jobs.values())
      .filter((j) => j.status === "completed" || j.status === "failed")
      .sort(
        (a, b) =>
          (b.completedAt?.getTime() || 0) - (a.completedAt?.getTime() || 0),
      );

    if (completed.length > 100) {
      for (const job of completed.slice(100)) {
        this.jobs.delete(job.id);
      }
    }
  }
}

// Singleton instance
const globalQueue = globalThis as any;
if (!globalQueue.__jobQueue) {
  globalQueue.__jobQueue = new JobQueue();
}

export const jobQueue: JobQueue = globalQueue.__jobQueue;

// ─── Job type constants ──────────────────────────────────────────────
export const JOB_TYPES = {
  RECURRING_EXPENSE_GENERATION: "recurring_expense_generation",
  BATCH_OCR: "batch_ocr",
  LARGE_IMPORT: "large_import",
  COMPLEX_REPORT: "complex_report",
  BUDGET_ALERTS: "budget_alerts",
} as const;

import { runArcaRetry } from "@/lib/server/arcaRetryService";

const DEFAULT_INTERVAL_MINUTES = 5;
const DEFAULT_BATCH_SIZE = 25;

type SchedulerState = {
  started: boolean;
  running: boolean;
  timerId?: NodeJS.Timeout;
};

const getSchedulerState = (): SchedulerState => {
  const globalAny = globalThis as typeof globalThis & {
    __arcaRetryScheduler?: SchedulerState;
  };

  if (!globalAny.__arcaRetryScheduler) {
    globalAny.__arcaRetryScheduler = {
      started: false,
      running: false,
    };
  }

  return globalAny.__arcaRetryScheduler;
};

const parseIntervalMinutes = () => {
  const raw = process.env.ARCA_RETRY_INTERVAL_MINUTES;
  const parsed = raw ? Number.parseInt(raw, 10) : NaN;
  if (Number.isFinite(parsed) && parsed > 0) {
    return parsed;
  }
  return DEFAULT_INTERVAL_MINUTES;
};

const parseBatchSize = () => {
  const raw = process.env.ARCA_RETRY_BATCH_SIZE;
  const parsed = raw ? Number.parseInt(raw, 10) : NaN;
  if (Number.isFinite(parsed) && parsed > 0) {
    return parsed;
  }
  return DEFAULT_BATCH_SIZE;
};

export const startArcaRetryScheduler = () => {
  const enabled = process.env.ARCA_RETRY_ENABLED === "true";
  if (!enabled) {
    return;
  }

  const state = getSchedulerState();
  if (state.started) {
    return;
  }

  const intervalMinutes = parseIntervalMinutes();
  const batchSize = parseBatchSize();

  state.started = true;

  state.timerId = setInterval(
    async () => {
      if (state.running) {
        return;
      }

      state.running = true;
      try {
        await runArcaRetry({ limit: batchSize, source: "scheduler" });
      } catch (error) {
        console.error("[ARCA RETRY] Scheduler error:", error);
      } finally {
        state.running = false;
      }
    },
    intervalMinutes * 60 * 1000,
  );
};

startArcaRetryScheduler();

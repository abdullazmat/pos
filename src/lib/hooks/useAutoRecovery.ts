/**
 * React Hook: useAutoRecovery
 *
 * Provides auto-recovery capabilities to React components:
 * - Wraps data fetching with retry and issue classification
 * - Handles minor issues silently, shows alerts for major issues
 * - Exposes safe defaults for rendering
 */

"use client";

import { useCallback, useRef } from "react";
import {
  classifyIssue,
  SAFE_DEFAULTS,
  withAutoRecovery,
  type IssueContext,
} from "@/lib/autoRecovery/issueClassifier";
import { emitSystemAlert } from "@/lib/autoRecovery/systemAlerts";
import { isFeatureEnabled } from "@/lib/autoRecovery/featureFlags";
import logger, { type SystemModule } from "@/lib/autoRecovery/logger";

interface UseAutoRecoveryOptions {
  module: SystemModule;
  action?: string;
}

export function useAutoRecovery(options: UseAutoRecoveryOptions) {
  const { module, action } = options;
  const errorCountRef = useRef(0);

  /**
   * Safely execute a synchronous function with auto-recovery
   * Minor errors → return fallback
   * Major errors → show alert + return fallback
   */
  const safeExecute = useCallback(
    <T>(fn: () => T, fallback: T, actionName?: string): T => {
      if (!isFeatureEnabled("auto_correct_minor")) {
        return fn();
      }

      try {
        return withAutoRecovery(fn, fallback, {
          module,
          action: actionName || action,
        });
      } catch (error) {
        // withAutoRecovery throws AutoRecoveryError for major issues
        const issue = classifyIssue(error, {
          module,
          action: actionName || action,
        });
        if (
          issue.severity === "major" &&
          isFeatureEnabled("system_alerts_enabled")
        ) {
          emitSystemAlert(issue);
        }
        errorCountRef.current++;
        return fallback;
      }
    },
    [module, action],
  );

  /**
   * Safely execute an async function with auto-recovery
   */
  const safeAsyncExecute = useCallback(
    async <T>(
      fn: () => Promise<T>,
      fallback: T,
      actionName?: string,
    ): Promise<T> => {
      if (!isFeatureEnabled("auto_correct_minor")) {
        return fn();
      }

      try {
        const result = await fn();
        if (result === undefined || result === null) return fallback;
        return result;
      } catch (error) {
        const issue = classifyIssue(error, {
          module,
          action: actionName || action,
        });

        if (issue.severity === "minor" && issue.autoRecoverable) {
          logger.info(`Component auto-recovered: [${issue.category}]`, {
            module,
            action: actionName || action,
            metadata: { category: issue.category },
          });
          return fallback;
        }

        // Major issue → alert user
        if (isFeatureEnabled("system_alerts_enabled")) {
          emitSystemAlert(issue);
        }
        errorCountRef.current++;
        return fallback;
      }
    },
    [module, action],
  );

  /**
   * Safe value accessor — wraps a value with null/undefined protection
   */
  const safeValue = useCallback(
    <T>(value: T | null | undefined, fallback: T): T => {
      if (value === null || value === undefined) return fallback;
      return value;
    },
    [],
  );

  return {
    safeExecute,
    safeAsyncExecute,
    safeValue,
    safe: SAFE_DEFAULTS,
    errorCount: errorCountRef.current,
  };
}

export default useAutoRecovery;

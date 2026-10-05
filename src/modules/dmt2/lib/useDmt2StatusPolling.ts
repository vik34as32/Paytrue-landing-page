"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { Dmt2Transaction } from "../types";
import { DMT2_TERMINAL_STATUSES } from "./dmt2-normalizers";
import { fetchTransactionStatus } from "./dmt2-service";

export type Dmt2PollPhase = "idle" | "polling" | "success" | "failed" | "timeout";

export const DMT2_STATUS_POLL_INTERVAL_MS = 4000;
/** Stop auto-polling after this long; the user can resume with `restart()`. */
export const DMT2_STATUS_POLL_MAX_MS = 5 * 60 * 1000;

interface UseDmt2StatusPollingOptions {
  reference: string;
  enabled: boolean;
  fallback?: Partial<Dmt2Transaction>;
  onUpdate?: (txn: Dmt2Transaction) => void;
  intervalMs?: number;
  maxDurationMs?: number;
}

/**
 * Polls GET /dmt2/transaction/status/:reference until SUCCESS / FAILED / timeout.
 * Uses one chained setTimeout per run (next request only after the previous
 * one settles), so there is never more than one timer or in-flight request.
 */
export function useDmt2StatusPolling({
  reference,
  enabled,
  fallback,
  onUpdate,
  intervalMs = DMT2_STATUS_POLL_INTERVAL_MS,
  maxDurationMs = DMT2_STATUS_POLL_MAX_MS,
}: UseDmt2StatusPollingOptions) {
  const [runId, setRunId] = useState(0);
  const [result, setResult] = useState<{ key: string; phase: Dmt2PollPhase } | null>(null);
  const onUpdateRef = useRef(onUpdate);
  const fallbackRef = useRef(fallback);

  useEffect(() => {
    onUpdateRef.current = onUpdate;
    fallbackRef.current = fallback;
  });

  const runKey = `${reference}#${runId}`;
  const active = enabled && Boolean(reference);

  useEffect(() => {
    if (!active) return;

    let cancelled = false;
    let finished = false;
    let timer: ReturnType<typeof setTimeout> | null = null;
    const startedAt = Date.now();

    const finish = (phase: Dmt2PollPhase, reason: string) => {
      finished = true;
      if (timer) clearTimeout(timer);
      timer = null;
      console.log("[DMT2 FRONTEND] polling stopped:", { reference, reason });
      setResult({ key: runKey, phase });
    };

    const tick = async () => {
      timer = null;
      try {
        const txn = await fetchTransactionStatus(reference, fallbackRef.current);
        if (cancelled) return;
        console.log("[DMT2 FRONTEND] polling status:", { reference, status: txn.status });
        onUpdateRef.current?.(txn);

        if (txn.status === "SUCCESS") {
          console.log("[DMT2 FRONTEND] success received:", { reference });
          finish("success", "SUCCESS");
          return;
        }
        if (DMT2_TERMINAL_STATUSES.includes(txn.status)) {
          finish("failed", txn.status);
          return;
        }
      } catch (error) {
        if (cancelled) return;
        console.warn("[DMT2 FRONTEND] polling status error:", {
          reference,
          message: error instanceof Error ? error.message : "unknown",
        });
      }

      if (Date.now() - startedAt >= maxDurationMs) {
        finish("timeout", "TIMEOUT");
        return;
      }
      timer = setTimeout(() => void tick(), intervalMs);
    };

    void tick();

    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
      timer = null;
      if (!finished) {
        console.log("[DMT2 FRONTEND] polling stopped:", { reference, reason: "UNMOUNT" });
      }
    };
  }, [active, reference, runKey, intervalMs, maxDurationMs]);

  const phase: Dmt2PollPhase = !active
    ? "idle"
    : result?.key === runKey
      ? result.phase
      : "polling";

  const restart = useCallback(() => setRunId((n) => n + 1), []);

  return { phase, restart };
}

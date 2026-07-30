"use client";

import { useQuery } from "@tanstack/react-query";
import {
  fetchAepsLedger,
  type AepsLedgerQuery,
} from "@/src/services/aepsLedgerService";

export const AEPS_STATEMENT_LEDGER_QUERY_KEY = [
  "retailer",
  "aeps",
  "statement-ledger",
] as const;

/** AEPS statement CW/CD ledger — GET /aeps/ledger (separate from wallet AEPS ledger page). */
export function useAepsStatementLedger(
  query: AepsLedgerQuery = {},
  options: { enabled?: boolean } = {}
) {
  const page = query.page ?? 1;
  const limit = query.limit ?? 100;
  const transactionType = query.transactionType ?? "";
  const startDate = query.startDate ?? "";
  const endDate = query.endDate ?? "";
  const enabled = options.enabled ?? true;

  return useQuery({
    queryKey: [
      ...AEPS_STATEMENT_LEDGER_QUERY_KEY,
      page,
      limit,
      transactionType,
      startDate,
      endDate,
    ],
    queryFn: () =>
      fetchAepsLedger({
        page,
        limit,
        transactionType: transactionType || undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
      }),
    enabled,
    staleTime: 30_000,
    placeholderData: (previous) => previous,
  });
}

/** @deprecated Use useAepsStatementLedger — kept for older imports */
export const useAepsLedger = useAepsStatementLedger;
export const AEPS_LEDGER_QUERY_KEY = AEPS_STATEMENT_LEDGER_QUERY_KEY;

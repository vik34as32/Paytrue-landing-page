"use client";

import { useQuery } from "@tanstack/react-query";
import {
  fetchAepsLedger,
  type AepsLedgerQuery,
} from "@/src/services/aepsLedgerService";

export const AEPS_LEDGER_QUERY_KEY = ["retailer", "aeps", "ledger"] as const;

/** High-quality AEPS ledger query — separate CW / CD tables via transactionType. */
export function useAepsLedger(
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
      ...AEPS_LEDGER_QUERY_KEY,
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

"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchRetailerAepsLedger } from "@/src/services/aeps-ledger.service";
import type { AepsLedgerListParams } from "@/types/aeps-ledger";

export const AEPS_WALLET_LEDGER_QUERY_KEY = [
  "retailer",
  "aeps-wallet-ledger",
] as const;

/** Retailer AEPS Wallet Ledger — GET /retailer/aeps-ledger */
export function useAepsLedger(params: AepsLedgerListParams = {}) {
  return useQuery({
    queryKey: [...AEPS_WALLET_LEDGER_QUERY_KEY, params],
    queryFn: () => fetchRetailerAepsLedger(params),
    staleTime: 20_000,
    placeholderData: (previous) => previous,
  });
}

"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchWalletSummary } from "@/src/services/walletSummaryService";
import type {
  WalletSummaryListParams,
  WalletSummaryPortalRole,
} from "@/src/types/walletSummary";

export const walletSummaryQueryKey = (role: WalletSummaryPortalRole = "rt") =>
  ["wallet-summary", role] as const;

export function useWalletSummary(
  params: WalletSummaryListParams = {},
  role: WalletSummaryPortalRole = "rt"
) {
  return useQuery({
    queryKey: [...walletSummaryQueryKey(role), params],
    queryFn: () => fetchWalletSummary(params, role),
    staleTime: 20_000,
    placeholderData: (previous) => previous,
  });
}

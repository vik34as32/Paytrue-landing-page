"use client";

import { useEffect, useRef } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { getAepsWalletBalance } from "@/src/services/wallet";

export const AEPS_WALLET_BALANCE_QUERY_KEY = [
  "wallet",
  "aeps",
  "balance",
] as const;

const FALLBACK = {
  balance: 0,
  currency: "INR",
  walletType: "AEPS",
  status: "ACTIVE",
} as const;

/** AEPS wallet balance — loads on mount, reusable across AEPS pages. */
export function useAepsWalletBalance(options: { enabled?: boolean } = {}) {
  const enabled = options.enabled ?? true;
  const toastedRef = useRef(false);

  const query = useQuery({
    queryKey: AEPS_WALLET_BALANCE_QUERY_KEY,
    queryFn: getAepsWalletBalance,
    enabled,
    staleTime: 20_000,
    retry: 1,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    if (query.isError && !toastedRef.current) {
      toastedRef.current = true;
      toast.error("Unable to fetch AEPS wallet balance.");
    }
    if (query.isSuccess) {
      toastedRef.current = false;
    }
  }, [query.isError, query.isSuccess]);

  const data = query.data ?? FALLBACK;

  return {
    loading: query.isLoading || (query.isFetching && !query.data),
    isFetching: query.isFetching,
    balance: data.balance ?? 0,
    currency: data.currency ?? "INR",
    walletType: data.walletType ?? "AEPS",
    status: data.status ?? "ACTIVE",
    error: query.error ?? null,
    refetch: query.refetch,
    isError: query.isError,
  };
}

/** Call after a successful AEPS transaction to refresh wallet balance. */
export function useRefreshAepsWalletBalance() {
  const queryClient = useQueryClient();
  return () =>
    queryClient.invalidateQueries({ queryKey: AEPS_WALLET_BALANCE_QUERY_KEY });
}

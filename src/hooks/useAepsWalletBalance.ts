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
    staleTime: 10_000,
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

/**
 * Refresh AEPS wallet after cash withdrawal (credit) / cash deposit (debit).
 * Forces an immediate network refetch so the page balance updates right away.
 */
export function useRefreshAepsWalletBalance() {
  const queryClient = useQueryClient();
  return async () => {
    await queryClient.invalidateQueries({
      queryKey: AEPS_WALLET_BALANCE_QUERY_KEY,
    });
    await queryClient.refetchQueries({
      queryKey: AEPS_WALLET_BALANCE_QUERY_KEY,
      type: "active",
    });
  };
}

/** Treat common InstantPay / PayTrue success statuses as wallet-moving txn. */
export function isAepsWalletMovingSuccess(status?: string | null): boolean {
  const value = String(status || "")
    .trim()
    .toUpperCase();
  if (!value) return true;
  return (
    value === "SUCCESS" ||
    value === "SUCCESSFUL" ||
    value === "TXN" ||
    value === "COMPLETED" ||
    value === "OK"
  );
}

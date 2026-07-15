"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  fetchCommissionLedger,
  fetchCommissionWallet,
  topupCommissionToMainWallet,
} from "@/src/services/commissionService";
import type {
  CommissionLedgerFilters,
  CommissionTopupRequest,
} from "@/src/types/commission";

export const commissionQueryKey = {
  wallet: ["wallet", "commission"] as const,
  ledger: (filters: CommissionLedgerFilters) =>
    ["wallet", "commission", "ledger", filters] as const,
};

export function useCommissionWallet(enabled = true) {
  return useQuery({
    queryKey: commissionQueryKey.wallet,
    queryFn: fetchCommissionWallet,
    enabled,
    staleTime: 30_000,
    refetchOnWindowFocus: true,
  });
}

export function useCommissionLedger(filters: CommissionLedgerFilters, enabled = true) {
  return useQuery({
    queryKey: commissionQueryKey.ledger(filters),
    queryFn: () => fetchCommissionLedger(filters),
    enabled,
    placeholderData: (prev) => prev,
  });
}

export function useCommissionTopup() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CommissionTopupRequest) => topupCommissionToMainWallet(payload),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: commissionQueryKey.wallet }),
        queryClient.invalidateQueries({ queryKey: ["wallet", "commission", "ledger"] }),
      ]);
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("paytrue:commission-updated"));
      }
    },
  });
}

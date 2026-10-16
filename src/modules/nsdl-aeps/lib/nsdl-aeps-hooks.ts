"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";
import type { NsdlLedgerQuery } from "../types";
import {
  fetchNsdlBanks,
  fetchNsdlLedger,
  fetchNsdlMerchant,
  fetchNsdlStates,
} from "./nsdl-aeps-api";
import { isNsdlDailyLoginDone } from "./nsdl-aeps-normalizers";

export const NSDL_QUERY_KEYS = {
  banks: ["nsdl-aeps", "banks"] as const,
  states: ["nsdl-aeps", "states"] as const,
  merchant: ["nsdl-aeps", "merchant"] as const,
  ledger: (query: NsdlLedgerQuery) => ["nsdl-aeps", "ledger", query] as const,
};

export function useNsdlBanks() {
  return useQuery({
    queryKey: NSDL_QUERY_KEYS.banks,
    queryFn: fetchNsdlBanks,
    staleTime: 6 * 60 * 60 * 1000,
  });
}

export function useNsdlStates(enabled = true) {
  return useQuery({
    queryKey: NSDL_QUERY_KEYS.states,
    queryFn: fetchNsdlStates,
    staleTime: 24 * 60 * 60 * 1000,
    enabled,
  });
}

export function useNsdlMerchant() {
  const query = useQuery({
    queryKey: NSDL_QUERY_KEYS.merchant,
    queryFn: fetchNsdlMerchant,
    staleTime: 30_000,
  });
  return {
    ...query,
    merchant: query.data ?? null,
    activated: Boolean(query.data?.activated),
    loginDone: isNsdlDailyLoginDone(query.data),
  };
}

export function useRefreshNsdlMerchant() {
  const queryClient = useQueryClient();
  return useCallback(
    () => queryClient.invalidateQueries({ queryKey: NSDL_QUERY_KEYS.merchant }),
    [queryClient]
  );
}

export function useNsdlLedger(query: NsdlLedgerQuery) {
  return useQuery({
    queryKey: NSDL_QUERY_KEYS.ledger(query),
    queryFn: () => fetchNsdlLedger(query),
    placeholderData: (previous) => previous,
  });
}

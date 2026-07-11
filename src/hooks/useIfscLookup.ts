"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchIfscDetails } from "@/src/services/ifscService";
import { isValidIfscCode } from "@/src/types/ifsc";

export const IFSC_QUERY_KEY = ["ifsc"] as const;

export function useIfscLookup(ifscCode?: string) {
  const normalized = ifscCode?.trim().toUpperCase() ?? "";

  return useQuery({
    queryKey: [...IFSC_QUERY_KEY, normalized],
    queryFn: () => fetchIfscDetails(normalized),
    enabled: isValidIfscCode(normalized),
    staleTime: 24 * 60 * 60 * 1000,
    gcTime: 7 * 24 * 60 * 60 * 1000,
    retry: 1,
  });
}

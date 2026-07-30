"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  changeMpin,
  createMpin,
  fetchMpinStatus,
  mapMpinApiError,
  verifyMpin,
} from "../services/mpinApi";
import type {
  ChangeMpinPayload,
  CreateMpinPayload,
  VerifyMpinPayload,
} from "../types";

export const MPIN_STATUS_QUERY_KEY = ["retailer", "mpin", "status"] as const;

export function useMpinStatus(options: { enabled?: boolean } = {}) {
  return useQuery({
    queryKey: MPIN_STATUS_QUERY_KEY,
    queryFn: fetchMpinStatus,
    enabled: options.enabled ?? true,
    staleTime: 30_000,
    retry: 1,
    refetchOnWindowFocus: false,
  });
}

export function useCreateMpin() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateMpinPayload) => createMpin(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: MPIN_STATUS_QUERY_KEY });
    },
    meta: { errorMapper: mapMpinApiError },
  });
}

export function useChangeMpin() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: ChangeMpinPayload) => changeMpin(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: MPIN_STATUS_QUERY_KEY });
    },
  });
}

export function useVerifyMpin() {
  return useMutation({
    mutationFn: (payload: VerifyMpinPayload) => verifyMpin(payload),
  });
}

export { mapMpinApiError };

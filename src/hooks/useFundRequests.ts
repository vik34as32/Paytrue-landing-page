"use client";

import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import {
  cancelFundRequest,
  createFundRequest,
  fetchCompanyBankAccounts,
  fetchFundRequestById,
  fetchFundRequests,
} from "@/src/services/fundRequestService";
import type {
  CreateFundRequestPayload,
  FundRequestListParams,
  FundRequestListResult,
} from "@/src/types/fundRequest";

export type FundRequestPortalRole = "md" | "dd" | "rt";

export const fundRequestsQueryKey = (role: FundRequestPortalRole = "rt") =>
  ["fund-requests", role] as const;

export const companyBankAccountsQueryKey = (role: FundRequestPortalRole = "rt") =>
  ["company-bank-accounts", role] as const;

export function useFundRequests(
  params: FundRequestListParams = {},
  role: FundRequestPortalRole = "rt"
) {
  return useQuery({
    queryKey: [...fundRequestsQueryKey(role), params],
    queryFn: () => fetchFundRequests(params),
    staleTime: 30_000,
    placeholderData: (previous) => previous,
  });
}

export function useFundRequestById(
  requestId: string | null | undefined,
  enabled = true
) {
  return useQuery({
    queryKey: ["fund-request", requestId],
    queryFn: () => fetchFundRequestById(requestId!),
    enabled: Boolean(requestId) && enabled,
    staleTime: 15_000,
  });
}

export function useCompanyBankAccounts(role: FundRequestPortalRole = "rt") {
  return useQuery({
    queryKey: companyBankAccountsQueryKey(role),
    queryFn: fetchCompanyBankAccounts,
    staleTime: 5 * 60_000,
  });
}

export function useSubmitFundRequest(role: FundRequestPortalRole = "rt") {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateFundRequestPayload) => {
      const { onUploadProgress, ...requestPayload } = payload;
      return createFundRequest(requestPayload, { onUploadProgress });
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: fundRequestsQueryKey(role) });
    },
  });
}

export function useCancelFundRequest(role: FundRequestPortalRole = "rt") {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (requestId: string) => cancelFundRequest(requestId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: fundRequestsQueryKey(role) });
    },
  });
}

export type { FundRequestListResult };

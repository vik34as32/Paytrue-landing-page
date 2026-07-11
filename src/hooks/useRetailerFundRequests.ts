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
  fetchFundRequests,
} from "@/src/services/fundRequestService";
import type {
  CreateFundRequestPayload,
  FundRequestListParams,
  FundRequestListResult,
} from "@/src/types/fundRequest";

export const RETAILER_FUND_REQUESTS_KEY = ["retailer", "fund-requests"] as const;
export const COMPANY_BANK_ACCOUNTS_KEY = ["retailer", "company-bank-accounts"] as const;

export function useRetailerFundRequests(params: FundRequestListParams = {}) {
  return useQuery({
    queryKey: [...RETAILER_FUND_REQUESTS_KEY, params],
    queryFn: () => fetchFundRequests(params),
    staleTime: 30_000,
    placeholderData: (previous) => previous,
  });
}

export function useCompanyBankAccounts() {
  return useQuery({
    queryKey: COMPANY_BANK_ACCOUNTS_KEY,
    queryFn: fetchCompanyBankAccounts,
    staleTime: 5 * 60_000,
  });
}

export function useSubmitRetailerFundRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateFundRequestPayload) => createFundRequest(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: RETAILER_FUND_REQUESTS_KEY });
    },
  });
}

export function useCancelRetailerFundRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (requestId: string) => cancelFundRequest(requestId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: RETAILER_FUND_REQUESTS_KEY });
    },
  });
}

export type { FundRequestListResult };

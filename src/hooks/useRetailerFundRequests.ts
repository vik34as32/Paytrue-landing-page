"use client";

import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import {
  cancelRetailerFundRequest,
  createRetailerFundRequest,
  fetchRetailerOwnFundRequests,
} from "@/src/services/retailerFundRequestService";
import type {
  CreateFundRequestPayload,
  FundRequest,
} from "@/src/types/fundRequest";

export const RETAILER_FUND_REQUESTS_KEY = ["retailer", "fund-requests"] as const;

export function useRetailerFundRequests() {
  return useQuery({
    queryKey: RETAILER_FUND_REQUESTS_KEY,
    queryFn: fetchRetailerOwnFundRequests,
    staleTime: 30_000,
  });
}

export function useSubmitRetailerFundRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateFundRequestPayload) =>
      createRetailerFundRequest(payload),
    onSuccess: (newRequest) => {
      queryClient.setQueryData<FundRequest[]>(
        RETAILER_FUND_REQUESTS_KEY,
        (current = []) => [newRequest, ...current]
      );
    },
  });
}

export function useCancelRetailerFundRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (requestId: string) => cancelRetailerFundRequest(requestId),
    onSuccess: (updatedRequest) => {
      queryClient.setQueryData<FundRequest[]>(
        RETAILER_FUND_REQUESTS_KEY,
        (current = []) =>
          current.map((item) =>
            item.id === updatedRequest.id ? updatedRequest : item
          )
      );
    },
  });
}

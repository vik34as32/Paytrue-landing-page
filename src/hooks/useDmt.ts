"use client";

import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import {
  addBeneficiary,
  checkSender,
  deleteBeneficiary,
  fetchBeneficiaries,
  fetchSenderByMobile,
  fetchSenderProfile,
  fetchTransactionById,
  fetchTransactions,
  initiateTransfer,
  registerSender,
  resendSenderOtp,
  sendSenderOtp,
  verifyBeneficiary,
  verifySenderOtp,
} from "@/src/services/dmtService";
import { buildDashboardStats } from "@/src/lib/dmtUtils";
import type {
  AddBeneficiaryPayload,
  DmtTransactionFilters,
  RegisterSenderPayload,
  TransferPayload,
  VerifyBeneficiaryPayload,
  VerifyOtpPayload,
} from "@/src/types/dmt";

export const DMT_KEYS = {
  all: ["dmt"] as const,
  sender: (mobile?: string) => ["dmt", "sender", mobile ?? "profile"] as const,
  beneficiaries: (mobile?: string) => ["dmt", "beneficiaries", mobile ?? "all"] as const,
  transactions: (filters: DmtTransactionFilters) =>
    ["dmt", "transactions", filters] as const,
  transaction: (id: string) => ["dmt", "transaction", id] as const,
  dashboard: (walletBalance: number) => ["dmt", "dashboard", walletBalance] as const,
};

export function useCheckSender() {
  return useMutation({
    mutationFn: (mobile: string) => checkSender(mobile),
  });
}

export function useSenderProfile(enabled = true) {
  return useQuery({
    queryKey: DMT_KEYS.sender(),
    queryFn: fetchSenderProfile,
    enabled,
    staleTime: 30_000,
  });
}

export function useSenderByMobile(mobile: string, enabled = true) {
  return useQuery({
    queryKey: DMT_KEYS.sender(mobile),
    queryFn: () => fetchSenderByMobile(mobile),
    enabled: enabled && Boolean(mobile),
    staleTime: 30_000,
  });
}

export function useRegisterSender() {
  return useMutation({
    mutationFn: (payload: RegisterSenderPayload) => registerSender(payload),
  });
}

export function useSendSenderOtp() {
  return useMutation({
    mutationFn: (mobile: string) => sendSenderOtp(mobile),
  });
}

export function useVerifySenderOtp() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: VerifyOtpPayload) => verifySenderOtp(payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: DMT_KEYS.sender(variables.mobile) });
      queryClient.invalidateQueries({ queryKey: DMT_KEYS.sender() });
    },
  });
}

export function useResendSenderOtp() {
  return useMutation({
    mutationFn: (mobile: string) => resendSenderOtp(mobile),
  });
}

export function useBeneficiaries(mobile?: string) {
  return useQuery({
    queryKey: DMT_KEYS.beneficiaries(mobile),
    queryFn: () => fetchBeneficiaries({ mobile }),
    staleTime: 20_000,
  });
}

export function useAddBeneficiary() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: AddBeneficiaryPayload) => addBeneficiary(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dmt", "beneficiaries"] });
    },
  });
}

export function useVerifyBeneficiary() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      beneficiaryId,
      payload,
    }: {
      beneficiaryId: string;
      payload: VerifyBeneficiaryPayload;
    }) => verifyBeneficiary(beneficiaryId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dmt", "beneficiaries"] });
    },
  });
}

export function useDeleteBeneficiary() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (beneficiaryId: string) => deleteBeneficiary(beneficiaryId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dmt", "beneficiaries"] });
    },
  });
}

export function useInitiateTransfer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: TransferPayload) => initiateTransfer(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dmt", "transactions"] });
      queryClient.invalidateQueries({ queryKey: ["dmt", "dashboard"] });
    },
  });
}

export function useDmtTransactions(filters: DmtTransactionFilters) {
  return useQuery({
    queryKey: DMT_KEYS.transactions(filters),
    queryFn: () => fetchTransactions(filters),
    staleTime: 15_000,
    placeholderData: (previous) => previous,
  });
}

export function useDmtTransaction(id: string, enabled = true) {
  return useQuery({
    queryKey: DMT_KEYS.transaction(id),
    queryFn: () => fetchTransactionById(id),
    enabled: enabled && Boolean(id),
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      return status === "pending" || status === "processing" ? 5000 : false;
    },
  });
}

export function useDmtDashboard(walletBalance: number) {
  const beneficiariesQuery = useBeneficiaries();
  const transactionsQuery = useDmtTransactions({ page: 1, limit: 100 });

  const isLoading =
    beneficiariesQuery.isLoading || transactionsQuery.isLoading;
  const isError = beneficiariesQuery.isError || transactionsQuery.isError;

  const stats =
    beneficiariesQuery.data && transactionsQuery.data
      ? buildDashboardStats(
          transactionsQuery.data.items,
          walletBalance,
          beneficiariesQuery.data,
          1
        )
      : null;

  return {
    stats,
    isLoading,
    isError,
    refetch: () => {
      beneficiariesQuery.refetch();
      transactionsQuery.refetch();
    },
    isFetching: beneficiariesQuery.isFetching || transactionsQuery.isFetching,
  };
}

"use client";

import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import {
  addBeneficiary,
  checkRemitter,
  deleteBeneficiary,
  fetchBeneficiaries,
  fetchDmtBanks,
  fetchReceipt,
  fetchRemitterByMobile,
  fetchSenderByMobile,
  fetchTransactionById,
  fetchTransactions,
  fetchTransferStatus,
  generateTransactionOtp,
  initiateTransfer,
  refundTransfer,
  registerRemitter,
  registerSender,
  remitterEkyc,
  resendSenderOtp,
  searchSender,
  sendRemitterOtp,
  sendSenderOtp,
  transferImps,
  transferNeft,
  verifyBeneficiary,
  verifyBeneficiaryDelete,
  verifyRemitterOtp,
  verifySenderOtp,
  verifyTransactionOtp,
} from "@/src/services/dmtService";
import { buildDashboardStats } from "@/src/lib/dmtUtils";
import { getActiveSenderMobile, resolveSenderMobile } from "@/src/lib/dmtSession";
import type {
  AddBeneficiaryPayload,
  DmtTransactionFilters,
  GenerateTransactionOtpPayload,
  RefundPayload,
  RegisterSenderPayload,
  RemitterEkycPayload,
  TransferPayload,
  VerifyBeneficiaryDeletePayload,
  VerifyBeneficiaryPayload,
  VerifyOtpPayload,
  VerifyTransactionOtpPayload,
} from "@/src/types/dmt";

export const DMT_KEYS = {
  all: ["dmt"] as const,
  sender: (mobile?: string) => ["dmt", "sender", mobile ?? "profile"] as const,
  beneficiaries: (mobile?: string) => ["dmt", "beneficiaries", mobile ?? "all"] as const,
  banks: ["dmt", "banks"] as const,
  transactions: (filters: DmtTransactionFilters) =>
    ["dmt", "transactions", filters] as const,
  transaction: (id: string) => ["dmt", "transaction", id] as const,
  status: (reference: string) => ["dmt", "status", reference] as const,
  receipt: (reference: string) => ["dmt", "receipt", reference] as const,
  dashboard: (walletBalance: number) => ["dmt", "dashboard", walletBalance] as const,
};

export function useSearchSender() {
  return useMutation({
    mutationFn: (mobile: string) => searchSender(mobile),
  });
}

export function useCheckSender() {
  return useMutation({
    mutationFn: (mobile: string) => searchSender(mobile),
  });
}

export function useCheckRemitter() {
  return useMutation({
    mutationFn: (mobile: string) => checkRemitter(mobile),
  });
}

export function useRemitterByMobile(mobile: string, enabled = true) {
  return useQuery({
    queryKey: DMT_KEYS.sender(mobile),
    queryFn: () => fetchRemitterByMobile(mobile),
    enabled: enabled && Boolean(mobile),
    staleTime: 30_000,
  });
}

export function useRegisterRemitter() {
  return useMutation({
    mutationFn: (payload: RegisterSenderPayload) => registerRemitter(payload),
  });
}

export function useSendRemitterOtp() {
  return useMutation({
    mutationFn: (mobile: string) => sendRemitterOtp(mobile),
  });
}

export function useVerifyRemitterOtp() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: VerifyOtpPayload) => verifyRemitterOtp(payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: DMT_KEYS.sender(variables.mobile) });
    },
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
    },
  });
}

export function useResendSenderOtp() {
  return useMutation({
    mutationFn: (mobile: string) => resendSenderOtp(mobile),
  });
}

export function useRemitterEkyc() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: RemitterEkycPayload) => remitterEkyc(payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: DMT_KEYS.sender(variables.mobile) });
    },
  });
}

export function useDmtBanks() {
  return useQuery({
    queryKey: DMT_KEYS.banks,
    queryFn: fetchDmtBanks,
    staleTime: 60_000 * 10,
  });
}

export function useBeneficiaries(mobile?: string) {
  const senderMobile = resolveSenderMobile(mobile);
  return useQuery({
    queryKey: DMT_KEYS.beneficiaries(senderMobile || "none"),
    queryFn: () => fetchBeneficiaries({ senderMobile }),
    enabled: Boolean(senderMobile),
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
  return useMutation({
    mutationFn: ({
      beneficiaryId,
      senderMobile,
    }: {
      beneficiaryId: string;
      senderMobile?: string;
    }) => deleteBeneficiary(beneficiaryId, senderMobile),
  });
}

export function useVerifyBeneficiaryDelete() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      beneficiaryId,
      payload,
    }: {
      beneficiaryId: string;
      payload: VerifyBeneficiaryDeletePayload;
    }) => verifyBeneficiaryDelete(beneficiaryId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dmt", "beneficiaries"] });
    },
  });
}

export function useGenerateTransactionOtp() {
  return useMutation({
    mutationFn: (payload: GenerateTransactionOtpPayload) =>
      generateTransactionOtp(payload),
  });
}

export function useVerifyTransactionOtp() {
  return useMutation({
    mutationFn: (payload: VerifyTransactionOtpPayload) =>
      verifyTransactionOtp(payload),
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

export function useTransferImps() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: TransferPayload) => transferImps(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dmt", "transactions"] });
    },
  });
}

export function useTransferNeft() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: TransferPayload) => transferNeft(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dmt", "transactions"] });
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

export function useTransferStatus(reference: string, enabled = true) {
  return useQuery({
    queryKey: DMT_KEYS.status(reference),
    queryFn: () => fetchTransferStatus(reference),
    enabled: enabled && Boolean(reference),
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      return status === "pending" || status === "processing" ? 5000 : false;
    },
  });
}

export function useDmtReceipt(reference: string, enabled = true) {
  return useQuery({
    queryKey: DMT_KEYS.receipt(reference),
    queryFn: () => fetchReceipt(reference),
    enabled: enabled && Boolean(reference),
  });
}

export function useRefundTransfer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      reference,
      payload,
    }: {
      reference: string;
      payload?: RefundPayload;
    }) => refundTransfer(reference, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: DMT_KEYS.transaction(variables.reference) });
      queryClient.invalidateQueries({ queryKey: ["dmt", "transactions"] });
    },
  });
}

export function useDmtDashboard(walletBalance: number) {
  const senderMobile = getActiveSenderMobile();
  const beneficiariesQuery = useBeneficiaries(senderMobile || undefined);
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

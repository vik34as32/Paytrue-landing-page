"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import {
  aepsAadhaarPay,
  aepsBalanceEnquiry,
  aepsCashDeposit,
  aepsCashWithdrawal,
  aepsHealthCheck,
  aepsMiniStatement,
  aepsTransactionOtp,
  aepsTransactionStatus,
  aepsVerifyCashDepositAccount,
  fetchAepsBanks,
} from "@/src/services/aepsService";
import type {
  AepsAccountVerifyPayload,
  AepsTransactionOtpPayload,
  AepsTransactionPayload,
  AepsTransactionStatusPayload,
} from "@/src/types/aeps";

export function useAepsHealth() {
  return useQuery({
    queryKey: ["aeps", "health"],
    queryFn: aepsHealthCheck,
    staleTime: 30_000,
    retry: 1,
  });
}

export function useAepsBanks() {
  return useQuery({
    queryKey: ["aeps", "banks"],
    queryFn: fetchAepsBanks,
    staleTime: 24 * 60 * 60_000,
    gcTime: 24 * 60 * 60_000,
    retry: 1,
  });
}

export function useAepsCashWithdrawal() {
  return useMutation({ mutationFn: aepsCashWithdrawal });
}

export function useAepsBalanceEnquiry() {
  return useMutation({ mutationFn: aepsBalanceEnquiry });
}

export function useAepsMiniStatement() {
  return useMutation({ mutationFn: aepsMiniStatement });
}

export function useAepsCashDepositAccountVerify() {
  return useMutation({ mutationFn: aepsVerifyCashDepositAccount });
}

export function useAepsCashDeposit() {
  return useMutation({ mutationFn: aepsCashDeposit });
}

export function useAepsAadhaarPay() {
  return useMutation({ mutationFn: aepsAadhaarPay });
}

export function useAepsTransactionOtp() {
  return useMutation({ mutationFn: aepsTransactionOtp });
}

export function useAepsTransactionStatus() {
  return useMutation({ mutationFn: aepsTransactionStatus });
}

export type {
  AepsAccountVerifyPayload,
  AepsTransactionPayload, AepsTransactionOtpPayload, AepsTransactionStatusPayload };

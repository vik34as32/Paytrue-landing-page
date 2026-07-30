"use client";

import { useMutation } from "@tanstack/react-query";
import {
  resendLoginOtp,
  verifyLoginOtp,
  type ResendLoginOtpResult,
  type VerifyLoginOtpPayload,
  type VerifyLoginOtpResult,
} from "@/src/services/loginOtpService";

export function useVerifyLoginOtpMutation() {
  return useMutation<VerifyLoginOtpResult, unknown, VerifyLoginOtpPayload>({
    mutationFn: (payload) => verifyLoginOtp(payload),
  });
}

export function useResendLoginOtpMutation() {
  return useMutation<ResendLoginOtpResult, unknown, string>({
    mutationFn: (loginToken) => resendLoginOtp(loginToken),
  });
}

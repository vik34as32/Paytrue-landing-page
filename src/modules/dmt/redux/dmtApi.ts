import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { API_BASE_URL } from "@/src/constants/api";
import { getAccessToken } from "@/src/lib/cookies";
import { buildAepsLoginApiBody } from "@/src/lib/aepsUtils";
import { resolveBeneficiaryBankFields, resolveBeneficiaryMobileNumber } from "@/src/lib/dmtUtils";
import {
  buildVerifyBankAccountPayload,
  normalizeVerifyBankAccountResponse,
} from "@/src/lib/dmtBankVerify";
import { DMT_MODULE_ENDPOINTS } from "../services/endpoints";
import { normalizeBeneficiaryList, normalizeDmtBankList, normalizeWorkflowResponse } from "../services/normalizers";
import type {
  AddBeneficiaryRequest,
  BioAuthRequest,
  DmtBank,
  DmtWorkflowResponse,
  DeleteBeneficiaryRequest,
  VerifyDeleteBeneficiaryRequest,
  GenerateTransactionOtpRequest,
  RegisterSenderRequest,
  SearchSenderRequest,
  TransferRequest,
  VerifyBeneficiaryOtpRequest,
  VerifySenderOtpRequest,
  VerifyTransactionOtpRequest,
  VerifyBankAccountRequest,
  VerifyBankAccountResult,
} from "../types";

function mapApiError(error: unknown): { message: string; code?: string } {
  const err = error as {
    data?: { message?: string; error?: string; code?: string };
    error?: string;
    message?: string;
  };
  return {
    message:
      err?.data?.message ||
      err?.data?.error ||
      err?.error ||
      err?.message ||
      "Something went wrong",
    code: err?.data?.code,
  };
}

export const dmtApi = createApi({
  reducerPath: "dmtApi",
  baseQuery: fetchBaseQuery({
    baseUrl: API_BASE_URL,
    prepareHeaders: (headers) => {
      const token = getAccessToken();
      if (token) headers.set("Authorization", `Bearer ${token}`);
      return headers;
    },
  }),
  tagTypes: ["Beneficiaries", "Transaction"],
  endpoints: (builder) => ({
    searchSender: builder.mutation<DmtWorkflowResponse, SearchSenderRequest>({
      query: (body) => ({
        url: DMT_MODULE_ENDPOINTS.searchSender,
        method: "POST",
        body,
      }),
      transformResponse: (response: unknown) => normalizeWorkflowResponse(response),
      transformErrorResponse: mapApiError,
    }),

    registerSender: builder.mutation<DmtWorkflowResponse, RegisterSenderRequest>({
      query: (body) => {
        const referenceKey = String(body.referenceKey || "").trim();
        if (!referenceKey) {
          throw new Error("referenceKey is required. Call remitter/check first.");
        }

        return {
          url: DMT_MODULE_ENDPOINTS.registerSender,
          method: "POST",
          body: {
            mobile: body.mobile.trim(),
            aadhaar: body.aadhaar?.trim(),
            firstName: body.name?.trim() || "Customer",
            lastName: ".",
            referenceKey,
          },
        };
      },
      transformResponse: (response: unknown) => normalizeWorkflowResponse(response),
      transformErrorResponse: mapApiError,
    }),

    verifySenderOtp: builder.mutation<DmtWorkflowResponse, VerifySenderOtpRequest>({
      query: (body) => ({
        url: DMT_MODULE_ENDPOINTS.verifySenderOtp,
        method: "POST",
        body,
      }),
      transformResponse: (response: unknown) => normalizeWorkflowResponse(response),
      transformErrorResponse: mapApiError,
    }),

    bioAuth: builder.mutation<DmtWorkflowResponse, BioAuthRequest>({
      query: (body) => {
        const biometricBase = buildAepsLoginApiBody({
          pidData: body.pidData,
          latitude: body.latitude,
          longitude: body.longitude,
          captureType: body.captureType || "FINGER",
        });

        const bd = (biometricBase.biometricData ?? {}) as Record<string, unknown>;
        // Backend/InstantPay eKYC expects the standard Aadhaar PID field names
        // (Skey, Hmac, Data). Our parser exposes them as sessionKey/hmac/pidData,
        // so remap them here while keeping the original fields for compatibility.
        const biometricData = {
          ...bd,
          Skey: bd.sessionKey,
          ci: bd.ci,
          Hmac: bd.hmac,
          Data: bd.pidData,
          type: bd.pidDataType,
        };

        return {
          url: DMT_MODULE_ENDPOINTS.bioAuth,
          method: "POST",
          body: {
            mobile: body.mobile,
            referenceKey: body.referenceKey,
            latitude: biometricBase.latitude,
            longitude: biometricBase.longitude,
            externalRef: body.externalRef || biometricBase.externalRef,
            consentTaken: body.consentTaken,
            captureType: body.captureType || "FINGER",
            biometricData,
          },
        };
      },
      transformResponse: (response: unknown) => normalizeWorkflowResponse(response),
      transformErrorResponse: mapApiError,
    }),

    fetchBeneficiaries: builder.query<DmtWorkflowResponse, { senderMobile: string }>({
      query: ({ senderMobile }) => ({
        url: DMT_MODULE_ENDPOINTS.beneficiaries,
        params: { senderMobile },
      }),
      transformResponse: (response: unknown) => {
        const normalized = normalizeWorkflowResponse(response);
        return {
          ...normalized,
          beneficiaries: normalizeBeneficiaryList(response),
        };
      },
      providesTags: ["Beneficiaries"],
    }),

    fetchBanks: builder.query<DmtBank[], void>({
      query: () => DMT_MODULE_ENDPOINTS.banks,
      transformResponse: (response: unknown) => normalizeDmtBankList(response),
    }),

    verifyBankAccount: builder.mutation<VerifyBankAccountResult, VerifyBankAccountRequest>({
      query: (body) => ({
        url: DMT_MODULE_ENDPOINTS.verifyBankAccount,
        method: "POST",
        body: buildVerifyBankAccountPayload({
          accountNumber: body.accountNumber,
          ifscCode: body.bankIfsc,
          name: body.name,
          pennyDrop: body.pennyDrop ?? "YES",
          latitude: body.latitude,
          longitude: body.longitude,
        }),
      }),
      transformResponse: (response: unknown) => normalizeVerifyBankAccountResponse(response),
      transformErrorResponse: mapApiError,
    }),

    addBeneficiary: builder.mutation<DmtWorkflowResponse, AddBeneficiaryRequest>({
      query: (body) => {
        const beneficiaryMobileNumber = resolveBeneficiaryMobileNumber(
          body.senderMobile,
          body.beneficiaryMobileNumber
        );

        return {
          url: DMT_MODULE_ENDPOINTS.addBeneficiary,
          method: "POST",
          body: {
            senderMobile: body.senderMobile,
            name: body.name,
            accountNumber: body.accountNumber,
            ifscCode: body.ifscCode.toUpperCase(),
            ...(beneficiaryMobileNumber ? { beneficiaryMobileNumber } : {}),
            ...resolveBeneficiaryBankFields({
              bankId: body.bankId,
              instantPayBankId: body.instantPayBankId,
            }),
          },
        };
      },
      transformResponse: (response: unknown) => normalizeWorkflowResponse(response),
      transformErrorResponse: mapApiError,
      invalidatesTags: ["Beneficiaries"],
    }),

    verifyBeneficiaryOtp: builder.mutation<DmtWorkflowResponse, VerifyBeneficiaryOtpRequest>({
      query: ({ beneficiaryId, otp, referenceKey }) => {
        const id = String(beneficiaryId || "").trim();
        const key = String(referenceKey || "").trim();
        const code = String(otp || "").trim();

        if (!id) throw new Error("Beneficiary ID is required.");
        if (!key) throw new Error("Reference key is required.");
        if (!code) throw new Error("OTP is required.");

        return {
          url: DMT_MODULE_ENDPOINTS.verifyBeneficiaryOtp(id),
          method: "POST",
          body: { otp: code, referenceKey: key },
        };
      },
      transformResponse: (response: unknown) => normalizeWorkflowResponse(response),
      transformErrorResponse: mapApiError,
      invalidatesTags: ["Beneficiaries"],
    }),

    deleteBeneficiary: builder.mutation<DmtWorkflowResponse, DeleteBeneficiaryRequest>({
      query: ({ beneficiaryId }) => {
        const id = String(beneficiaryId || "").trim();
        if (!id) throw new Error("Beneficiary ID is required.");

        return {
          url: DMT_MODULE_ENDPOINTS.deleteBeneficiary(id),
          method: "DELETE",
        };
      },
      transformResponse: (response: unknown) => normalizeWorkflowResponse(response),
      transformErrorResponse: mapApiError,
    }),

    verifyBeneficiaryDelete: builder.mutation<
      DmtWorkflowResponse,
      VerifyDeleteBeneficiaryRequest
    >({
      query: ({ beneficiaryId, otp, referenceKey }) => {
        const id = String(beneficiaryId || "").trim();
        const code = String(otp || "").trim();
        if (!id) throw new Error("Beneficiary ID is required.");
        if (!code) throw new Error("OTP is required.");

        const body: { otp: string; referenceKey?: string } = { otp: code };
        const key = String(referenceKey || "").trim();
        if (key) body.referenceKey = key;

        return {
          url: DMT_MODULE_ENDPOINTS.deleteBeneficiaryVerify(id),
          method: "POST",
          body,
        };
      },
      transformResponse: (response: unknown) => normalizeWorkflowResponse(response),
      transformErrorResponse: mapApiError,
      invalidatesTags: ["Beneficiaries"],
    }),

    generateTransactionOtp: builder.mutation<
      DmtWorkflowResponse,
      GenerateTransactionOtpRequest
    >({
      query: (body) => ({
        url: DMT_MODULE_ENDPOINTS.generateTransactionOtp,
        method: "POST",
        body: {
          senderMobile: body.senderMobile,
          amount: body.amount,
          referenceKey: body.referenceKey,
        },
      }),
      transformResponse: (response: unknown) => normalizeWorkflowResponse(response),
      transformErrorResponse: mapApiError,
    }),

    verifyTransactionOtp: builder.mutation<
      DmtWorkflowResponse,
      VerifyTransactionOtpRequest
    >({
      query: (body) => ({
        url: DMT_MODULE_ENDPOINTS.verifyTransactionOtp,
        method: "POST",
        body,
      }),
      transformResponse: (response: unknown) => normalizeWorkflowResponse(response),
      transformErrorResponse: mapApiError,
    }),

    transfer: builder.mutation<DmtWorkflowResponse, TransferRequest>({
      query: (body) => {
        const beneficiaryId = String(body.beneficiaryId || "").trim();
        const senderMobile = String(body.senderMobile || "").trim();
        const referenceKey = String(body.referenceKey || "").trim();
        const otp = String(body.otp || "").trim();
        const latitude = String(body.latitude || "").trim();
        const longitude = String(body.longitude || "").trim();

        if (!beneficiaryId) throw new Error("Beneficiary ID is required.");
        if (!senderMobile) throw new Error("Sender mobile is required.");
        if (!referenceKey) throw new Error("Reference key is required.");
        if (!otp) throw new Error("OTP is required.");
        if (!latitude || !longitude) throw new Error("Location is required for transfer.");

        const payload: Record<string, unknown> = {
          senderMobile,
          beneficiaryId,
          amount: body.amount,
          transferMode: body.transferMode,
          otp,
          referenceKey,
          latitude,
          longitude,
        };
        if (body.remarks?.trim()) payload.remarks = body.remarks.trim();

        return {
          url:
            body.transferMode === "NEFT"
              ? DMT_MODULE_ENDPOINTS.transferNeft
              : DMT_MODULE_ENDPOINTS.transferImps,
          method: "POST",
          body: payload,
        };
      },
      transformResponse: (response: unknown) => normalizeWorkflowResponse(response),
      transformErrorResponse: mapApiError,
      invalidatesTags: ["Transaction"],
    }),

    transactionStatus: builder.query<DmtWorkflowResponse, string>({
      query: (reference) => DMT_MODULE_ENDPOINTS.transactionStatus(reference),
      transformResponse: (response: unknown) => normalizeWorkflowResponse(response),
      providesTags: ["Transaction"],
    }),
  }),
});

export const {
  useSearchSenderMutation,
  useRegisterSenderMutation,
  useVerifySenderOtpMutation,
  useBioAuthMutation,
  useFetchBeneficiariesQuery,
  useFetchBanksQuery,
  useVerifyBankAccountMutation,
  useAddBeneficiaryMutation,
  useVerifyBeneficiaryOtpMutation,
  useDeleteBeneficiaryMutation,
  useVerifyBeneficiaryDeleteMutation,
  useGenerateTransactionOtpMutation,
  useVerifyTransactionOtpMutation,
  useTransferMutation,
  useTransactionStatusQuery,
} = dmtApi;

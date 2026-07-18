import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { API_BASE_URL } from "@/src/constants/api";
import { getAccessToken } from "@/src/lib/cookies";
import { createAepsExternalRef, buildInstantPayRemitterEkycBiometricData } from "@/src/lib/pidParser";
import { formatGeoLocation } from "@/src/lib/geoUtils";
import { resolveDmtTransferServiceId } from "@/features/retailer/store/retailerServicesStore";
import { resolveBeneficiaryBankFields, resolveBeneficiaryMobileNumber } from "@/src/lib/dmtUtils";
import {
  buildVerifyBankAccountPayload,
  normalizeVerifyBankAccountResponse,
  resolveDmtGeoCoordinates,
} from "@/src/lib/dmtBankVerify";
import { DMT_MODULE_ENDPOINTS } from "../services/endpoints";
import { normalizeBeneficiaryList, normalizeDmtBankList, normalizeWorkflowResponse } from "../services/normalizers";
import {
  normalizeRemitterPidOptions,
  logEkycDebug,
  type RemitterPidOptionsResult,
} from "@/src/lib/biometric/pidOptions";
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

    /** GET /dmt/remitter/:mobile/pid-options — fresh referenceKey + pidOptionWadh for eKYC */
    fetchRemitterPidOptions: builder.query<RemitterPidOptionsResult, { mobile: string }>({
      query: ({ mobile }) => ({
        url: DMT_MODULE_ENDPOINTS.remitterPidOptions(mobile),
        method: "GET",
      }),
      transformResponse: (response: unknown) => normalizeRemitterPidOptions(response),
      transformErrorResponse: mapApiError,
    }),

    /** GET /dmt/remitter/:mobile — remitter profile (post-OTP fresh key + pid materials) */
    fetchRemitterProfile: builder.query<DmtWorkflowResponse, { mobile: string }>({
      query: ({ mobile }) => ({
        url: DMT_MODULE_ENDPOINTS.senderProfile(mobile),
        method: "GET",
      }),
      transformResponse: (response: unknown) => normalizeWorkflowResponse(response),
      transformErrorResponse: mapApiError,
    }),

    bioAuth: builder.mutation<DmtWorkflowResponse, BioAuthRequest>({
      query: (body) => {
        const referenceKey = String(body.referenceKey || "").trim();
        if (!referenceKey) {
          throw new Error(
            "eKYC referenceKey missing. Call GET /remitter/:mobile/pid-options before eKYC."
          );
        }

        // InstantPay remitter eKYC schema requires Skey (RD sessionKey), not sessionKey
        const biometricData = buildInstantPayRemitterEkycBiometricData(body.pidData);
        const coords = formatGeoLocation({
          latitude: body.latitude,
          longitude: body.longitude,
        });

        logEkycDebug({
          referenceKey,
          pidLength: body.pidData?.length ?? 0,
        });

        const mobileNumber = String(body.mobile || "").trim();

        return {
          url: DMT_MODULE_ENDPOINTS.bioAuth,
          method: "POST",
          body: {
            mobileNumber,
            referenceKey,
            latitude: coords.latitude,
            longitude: coords.longitude,
            externalRef: body.externalRef || createAepsExternalRef("DMT"),
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

    verifyBankAccount: builder.mutation<
      VerifyBankAccountResult,
      Omit<VerifyBankAccountRequest, "latitude" | "longitude"> & {
        latitude?: string;
        longitude?: string;
      }
    >({
      async queryFn(body, _api, _extraOptions, baseQuery) {
        try {
          const coords =
            body.latitude && body.longitude
              ? { latitude: body.latitude, longitude: body.longitude }
              : await resolveDmtGeoCoordinates();

          const payload = buildVerifyBankAccountPayload({
            accountNumber: body.accountNumber,
            ifscCode: body.bankIfsc,
            name: body.name,
            pennyDrop: body.pennyDrop ?? "YES",
            latitude: coords.latitude,
            longitude: coords.longitude,
          });

          const result = await baseQuery({
            url: DMT_MODULE_ENDPOINTS.verifyBankAccount,
            method: "POST",
            body: payload,
          });

          if (result.error) {
            return { error: mapApiError(result.error) as never };
          }

          return {
            data: normalizeVerifyBankAccountResponse(result.data),
          };
        } catch (error) {
          return {
            error: {
              message:
                error instanceof Error
                  ? error.message
                  : "Bank verification failed",
            } as never,
          };
        }
      },
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
      async queryFn(body, _api, _extraOptions, baseQuery) {
        try {
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

          const serviceId = await resolveDmtTransferServiceId(body.transferMode);

          const payload: Record<string, unknown> = {
            senderMobile,
            beneficiaryId,
            amount: body.amount,
            transferMode: body.transferMode,
            otp,
            referenceKey,
            latitude,
            longitude,
            serviceId,
          };
          if (body.remarks?.trim()) payload.remarks = body.remarks.trim();

          const result = await baseQuery({
            url:
              body.transferMode === "NEFT"
                ? DMT_MODULE_ENDPOINTS.transferNeft
                : DMT_MODULE_ENDPOINTS.transferImps,
            method: "POST",
            body: payload,
          });

          if (result.error) {
            return { error: result.error };
          }

          return {
            data: normalizeWorkflowResponse(result.data),
          };
        } catch (error) {
          const mapped = mapApiError(error);
          return {
            error: {
              status: "CUSTOM_ERROR" as const,
              error: mapped.message,
              data: mapped,
            },
          };
        }
      },
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
  useFetchRemitterPidOptionsQuery,
  useLazyFetchRemitterPidOptionsQuery,
  useLazyFetchRemitterProfileQuery,
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

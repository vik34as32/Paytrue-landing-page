import type { AxiosRequestConfig } from "axios";
import api from "@/src/lib/axios";
import { DMT3_ENDPOINTS } from "./dmt3.endpoints";
import {
  dmt3ApiMessage,
  isUuid,
  normalizeBeneficiary,
  normalizeCommissionPreview,
  normalizeRemitter,
  normalizeTransaction,
  normalizeTransactionListResponse,
  pickApiMessage,
  unwrapList,
  unwrapRecord,
  extractRemitterBeneficiaries,
} from "./dmt3.mapper";
import type {
  Dmt3AddBeneficiaryInput,
  Dmt3CommissionPreview,
  Dmt3InitiateTransactionInput,
  Dmt3PaginationMeta,
  Dmt3Remitter,
  Dmt3Beneficiary,
  Dmt3Transaction,
  Dmt3TransferMode,
} from "../types/dmt3.types";

const skipAuthLogout = { skipSessionLogout: true } as AxiosRequestConfig;

function rethrow(error: unknown, fallback: string): never {
  throw new Error(dmt3ApiMessage(error, fallback));
}

export const dmt3Api = {
  async getRemitter(mobile: string): Promise<{
    remitter: Dmt3Remitter;
    beneficiaries: Dmt3Beneficiary[];
  } | null> {
    try {
      const { data } = await api.get(
        DMT3_ENDPOINTS.remitterByMobile(mobile),
        skipAuthLogout
      );
      return {
        remitter: normalizeRemitter(data, mobile),
        beneficiaries: extractRemitterBeneficiaries(data),
      };
    } catch (error) {
      const err = error as {
        status?: number;
        response?: { status?: number; data?: unknown };
        data?: unknown;
      };
      const status = err.response?.status ?? err.status;
      const payload = err.data ?? err.response?.data;
      const remitter = payload ? normalizeRemitter(payload, mobile) : null;
      if (remitter?.remitterId || remitter?.fullName) {
        return {
          remitter,
          beneficiaries: extractRemitterBeneficiaries(payload),
        };
      }
      if (status === 404) return null;
      rethrow(error, "Unable to search remitter");
    }
  },

  async registerRemitter(body: {
    mobile: string;
    name?: string;
    email?: string;
  }): Promise<unknown> {
    try {
      const { data } = await api.post(
        DMT3_ENDPOINTS.remitterRegister,
        body,
        skipAuthLogout
      );
      return data;
    } catch (error) {
      rethrow(error, "Unable to register remitter");
    }
  },

  async resendRemitterOtp(mobile: string): Promise<unknown> {
    try {
      const { data } = await api.post(
        DMT3_ENDPOINTS.remitterResendOtp,
        { mobile },
        skipAuthLogout
      );
      return data;
    } catch (error) {
      rethrow(error, "Unable to resend OTP");
    }
  },

  async verifyRemitterOtp(body: {
    mobile: string;
    otp: string;
  }): Promise<unknown> {
    try {
      const { data } = await api.post(
        DMT3_ENDPOINTS.remitterVerifyOtp,
        body,
        skipAuthLogout
      );
      return data;
    } catch (error) {
      rethrow(error, "Invalid OTP");
    }
  },

  async getBeneficiaries(query?: {
    remitterMobile?: string;
    remitterId?: string;
    page?: number;
    limit?: number;
  }): Promise<ReturnType<typeof normalizeBeneficiary>[]> {
    try {
      const params: Record<string, string | number> = {
        page: query?.page ?? 1,
        limit: query?.limit ?? 100,
      };
      const mobile = String(query?.remitterMobile || "").trim();
      if (mobile) params.remitterMobile = mobile;
      if (isUuid(query?.remitterId)) params.remitterId = query!.remitterId!.trim();

      const { data } = await api.get(DMT3_ENDPOINTS.beneficiaries, {
        ...skipAuthLogout,
        params,
      });
      return unwrapList(data)
        .map(normalizeBeneficiary)
        .filter((row) => row.id || row.accountNumber || row.name);
    } catch (error) {
      rethrow(error, "Unable to load beneficiaries");
    }
  },

  async addBeneficiary(
    body: Dmt3AddBeneficiaryInput & {
      latitude?: string;
      longitude?: string;
    }
  ): Promise<ReturnType<typeof normalizeBeneficiary>> {
    try {
      const payload: Record<string, string> = {
        name: body.name.trim(),
        accountNumber: body.accountNumber.trim(),
        ifscCode: body.ifscCode.trim().toUpperCase(),
        bankName: body.bankName.trim(),
        accountType: body.accountType || "SAVING",
      };
      if (body.remitterMobile) payload.remitterMobile = body.remitterMobile;
      if (isUuid(body.remitterId)) payload.remitterId = body.remitterId!.trim();
      if (body.mobile) payload.mobile = body.mobile.trim();
      if (body.latitude) payload.latitude = body.latitude;
      if (body.longitude) payload.longitude = body.longitude;

      const { data } = await api.post(
        DMT3_ENDPOINTS.beneficiaryAdd,
        payload,
        skipAuthLogout
      );
      return normalizeBeneficiary(unwrapRecord(data));
    } catch (error) {
      rethrow(error, "Unable to add beneficiary");
    }
  },

  async getBeneficiary(id: string): Promise<ReturnType<typeof normalizeBeneficiary>> {
    try {
      const { data } = await api.get(
        DMT3_ENDPOINTS.beneficiaryById(id),
        skipAuthLogout
      );
      return normalizeBeneficiary(unwrapRecord(data));
    } catch (error) {
      rethrow(error, "Unable to load beneficiary");
    }
  },

  async verifyBeneficiary(
    id: string,
    coords?: { latitude?: string; longitude?: string }
  ): Promise<ReturnType<typeof normalizeBeneficiary>> {
    try {
      const { data } = await api.post(
        DMT3_ENDPOINTS.beneficiaryVerify,
        {
          beneficiaryId: id,
          latitude: coords?.latitude,
          longitude: coords?.longitude,
        },
        skipAuthLogout
      );
      return normalizeBeneficiary(unwrapRecord(data));
    } catch (error) {
      rethrow(error, "Unable to verify beneficiary");
    }
  },

  async deleteBeneficiary(id: string): Promise<void> {
    try {
      await api.delete(DMT3_ENDPOINTS.beneficiaryById(id), skipAuthLogout);
    } catch (error) {
      rethrow(error, "Unable to delete beneficiary");
    }
  },

  async previewCommission(input: {
    amount: number;
    transferMode: Dmt3TransferMode;
    serviceId?: string;
    serviceCode?: string;
  }): Promise<Dmt3CommissionPreview> {
    try {
      const payload: Record<string, unknown> = {
        amount: input.amount,
        transferMode: input.transferMode,
      };
      if (input.serviceId) payload.serviceId = input.serviceId;
      if (input.serviceCode) payload.serviceCode = input.serviceCode;

      const { data } = await api.post(
        DMT3_ENDPOINTS.commissionPreview,
        payload,
        skipAuthLogout
      );
      return normalizeCommissionPreview(data);
    } catch (error) {
      rethrow(error, "Unable to preview commission");
    }
  },

  async payout(body: Dmt3InitiateTransactionInput): Promise<Dmt3Transaction> {
    try {
      const mode = body.transferMode || "IMPS";
      const path =
        mode === "NEFT"
          ? DMT3_ENDPOINTS.payoutNeft
          : mode === "RTGS"
            ? DMT3_ENDPOINTS.payoutRtgs
            : DMT3_ENDPOINTS.payoutImps;
      const payload: Record<string, unknown> = {
        beneficiaryId: body.beneficiaryId,
        amount: body.amount,
        transferMode: mode,
        remarks: (body.remarks || "DMT3").replace(/\s+/g, " ").slice(0, 50),
        mpin: body.mpin,
        latitude: body.latitude,
        longitude: body.longitude,
      };
      if (body.payerName) payload.payerName = body.payerName;
      if (body.remitterMobile) payload.remitterMobile = body.remitterMobile;
      if (body.email) payload.email = body.email;
      if (body.clientTxnId) payload.clientTxnId = body.clientTxnId;
      if (body.serviceId) payload.serviceId = body.serviceId;
      if (body.serviceCode) payload.serviceCode = body.serviceCode;

      const { data } = await api.post(path, payload, skipAuthLogout);
      return normalizeTransaction(data);
    } catch (error) {
      rethrow(error, "Unable to initiate transaction");
    }
  },

  async initiateTransaction(
    body: Dmt3InitiateTransactionInput
  ): Promise<Dmt3Transaction> {
    return this.payout(body);
  },

  async getTransactions(query?: {
    page?: number;
    limit?: number;
    status?: string;
    clientTxnId?: string;
  }): Promise<{ items: Dmt3Transaction[]; pagination: Dmt3PaginationMeta }> {
    try {
      const { data } = await api.get(DMT3_ENDPOINTS.transactions, {
        ...skipAuthLogout,
        params: {
          page: query?.page ?? 1,
          limit: query?.limit ?? 20,
          status: query?.status,
          clientTxnId: query?.clientTxnId,
        },
      });
      return normalizeTransactionListResponse(data);
    } catch (error) {
      rethrow(error, "Unable to load transactions");
    }
  },

  async getTransaction(id: string): Promise<Dmt3Transaction> {
    try {
      const { data } = await api.get(
        DMT3_ENDPOINTS.transactionById(id),
        skipAuthLogout
      );
      return normalizeTransaction(data);
    } catch (error) {
      rethrow(error, "Unable to load transaction");
    }
  },

  async enquireTransaction(id: string): Promise<Dmt3Transaction> {
    try {
      const { data } = await api.post(
        DMT3_ENDPOINTS.transactionEnquiry(id),
        {},
        skipAuthLogout
      );
      return normalizeTransaction(data);
    } catch (error) {
      rethrow(error, "Unable to check transaction status");
    }
  },

  async getStatus(reference: string): Promise<Dmt3Transaction> {
    try {
      const { data } = await api.get(
        DMT3_ENDPOINTS.transactionStatus(reference),
        skipAuthLogout
      );
      return normalizeTransaction(data);
    } catch (error) {
      rethrow(error, "Unable to fetch transaction status");
    }
  },

  async getReceipt(reference: string): Promise<Dmt3Transaction> {
    try {
      const { data } = await api.get(
        DMT3_ENDPOINTS.receipt(reference),
        skipAuthLogout
      );
      return normalizeTransaction(unwrapRecord(data));
    } catch (error) {
      rethrow(error, "Receipt not found");
    }
  },

  pickMessage(payload: unknown, fallback: string): string {
    return pickApiMessage(payload, fallback);
  },
};

export default dmt3Api;

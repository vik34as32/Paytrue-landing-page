import type { AxiosRequestConfig } from "axios";
import api from "@/src/lib/axios";
import { DMT3_ENDPOINTS } from "./dmt3.endpoints";
import {
  dmt3ApiMessage,
  normalizeBeneficiary,
  normalizeCommissionPreview,
  normalizeTransaction,
  normalizeTransactionListResponse,
  pickApiMessage,
  unwrapList,
  unwrapRecord,
} from "./dmt3.mapper";
import type {
  Dmt3AddBeneficiaryInput,
  Dmt3CommissionPreview,
  Dmt3InitiateTransactionInput,
  Dmt3PaginationMeta,
  Dmt3Transaction,
  Dmt3TransferMode,
} from "../types/dmt3.types";

const skipAuthLogout = { skipSessionLogout: true } as AxiosRequestConfig;

function rethrow(error: unknown, fallback: string): never {
  throw new Error(dmt3ApiMessage(error, fallback));
}

export const dmt3Api = {
  async getBeneficiaries(): Promise<ReturnType<typeof normalizeBeneficiary>[]> {
    try {
      const { data } = await api.get(DMT3_ENDPOINTS.beneficiaries, skipAuthLogout);
      return unwrapList(data)
        .map(normalizeBeneficiary)
        .filter((row) => row.id || row.accountNumber || row.name);
    } catch (error) {
      rethrow(error, "Unable to load beneficiaries");
    }
  },

  async addBeneficiary(
    body: Dmt3AddBeneficiaryInput
  ): Promise<ReturnType<typeof normalizeBeneficiary>> {
    try {
      const { data } = await api.post(
        DMT3_ENDPOINTS.beneficiaries,
        {
          name: body.name.trim(),
          mobile: body.mobile.trim(),
          bankName: body.bankName.trim(),
          accountNumber: body.accountNumber.trim(),
          ifscCode: body.ifscCode.trim().toUpperCase(),
        },
        skipAuthLogout
      );
      return normalizeBeneficiary(unwrapRecord(data));
    } catch (error) {
      rethrow(error, "Unable to add beneficiary");
    }
  },

  async verifyBeneficiary(id: string): Promise<ReturnType<typeof normalizeBeneficiary>> {
    try {
      const { data } = await api.post(
        DMT3_ENDPOINTS.beneficiaryVerify(id),
        {},
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
  }): Promise<Dmt3CommissionPreview> {
    try {
      const { data } = await api.post(
        DMT3_ENDPOINTS.commissionPreview,
        {
          amount: input.amount,
          transferMode: input.transferMode,
        },
        skipAuthLogout
      );
      return normalizeCommissionPreview(data);
    } catch (error) {
      rethrow(error, "Unable to preview commission");
    }
  },

  async initiateTransaction(
    body: Dmt3InitiateTransactionInput
  ): Promise<Dmt3Transaction> {
    try {
      const { data } = await api.post(
        DMT3_ENDPOINTS.transactionInitiate,
        {
          beneficiaryId: body.beneficiaryId,
          amount: body.amount,
          transferMode: body.transferMode,
          remarks: body.remarks,
          mpin: body.mpin,
          latitude: body.latitude,
          longitude: body.longitude,
          clientTxnId: body.clientTxnId,
          senderName: body.senderName,
          senderMobile: body.senderMobile,
          email: body.email,
        },
        skipAuthLogout
      );
      return normalizeTransaction(data);
    } catch (error) {
      rethrow(error, "Unable to initiate transaction");
    }
  },

  async getTransactions(query?: {
    page?: number;
    limit?: number;
    status?: string;
  }): Promise<{ items: Dmt3Transaction[]; pagination: Dmt3PaginationMeta }> {
    try {
      const { data } = await api.get(DMT3_ENDPOINTS.transactions, {
        ...skipAuthLogout,
        params: {
          page: query?.page ?? 1,
          limit: query?.limit ?? 20,
          status: query?.status,
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

  pickMessage(payload: unknown, fallback: string): string {
    return pickApiMessage(payload, fallback);
  },
};

export default dmt3Api;

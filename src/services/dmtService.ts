import api from "@/src/lib/axios";
import { DMT_ENDPOINTS } from "@/src/constants/dmtApi";
import {
  mapDmtError,
  normalizeBeneficiary,
  normalizeBeneficiaryList,
  normalizeCheckSenderResponse,
  normalizeSender,
  normalizeTransaction,
  normalizeTransactionList,
  unwrapApiData,
} from "@/src/lib/dmtUtils";
import type {
  AddBeneficiaryPayload,
  CheckSenderResponse,
  DmtBeneficiary,
  DmtPaginatedResponse,
  DmtSender,
  DmtTransaction,
  DmtTransactionFilters,
  RegisterSenderPayload,
  TransferInitResponse,
  TransferPayload,
  VerifyBeneficiaryPayload,
  VerifyOtpPayload,
} from "@/src/types/dmt";

async function request<T>(fn: () => Promise<T>): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    throw mapDmtError(error);
  }
}

export async function checkSender(mobile: string): Promise<CheckSenderResponse> {
  return request(async () => {
    const response = await api.get(DMT_ENDPOINTS.checkSender, {
      params: { mobile },
    });
    return normalizeCheckSenderResponse(response.data);
  });
}

export async function fetchSenderProfile(): Promise<DmtSender> {
  return request(async () => {
    const response = await api.get(DMT_ENDPOINTS.senderProfile);
    const data = unwrapApiData<Record<string, unknown>>(response.data);
    return normalizeSender(
      (data?.sender as Record<string, unknown>) ?? data ?? {}
    );
  });
}

export async function fetchSenderByMobile(mobile: string): Promise<DmtSender> {
  return request(async () => {
    const response = await api.get(DMT_ENDPOINTS.senderByMobile(mobile));
    const data = unwrapApiData<Record<string, unknown>>(response.data);
    return normalizeSender(
      (data?.sender as Record<string, unknown>) ?? data ?? {}
    );
  });
}

export async function registerSender(
  payload: RegisterSenderPayload
): Promise<{ message?: string; requestId?: string }> {
  return request(async () => {
    const response = await api.post(DMT_ENDPOINTS.registerSender, {
      mobile: payload.mobile,
      aadhaarNumber: payload.aadhaarNumber,
      aadhaar: payload.aadhaarNumber,
    });
    return unwrapApiData(response.data);
  });
}

export async function sendSenderOtp(mobile: string): Promise<{ requestId?: string }> {
  return request(async () => {
    const response = await api.post(DMT_ENDPOINTS.sendSenderOtp, { mobile });
    return unwrapApiData(response.data);
  });
}

export async function verifySenderOtp(payload: VerifyOtpPayload): Promise<DmtSender> {
  return request(async () => {
    const response = await api.post(DMT_ENDPOINTS.verifySenderOtp, payload);
    const data = unwrapApiData<Record<string, unknown>>(response.data);
    return normalizeSender(
      (data?.sender as Record<string, unknown>) ?? data ?? {}
    );
  });
}

export async function resendSenderOtp(mobile: string): Promise<{ requestId?: string }> {
  return request(async () => {
    const response = await api.get(DMT_ENDPOINTS.resendSenderOtp, {
      params: { mobile },
    });
    return unwrapApiData(response.data);
  });
}

export async function fetchBeneficiaries(params?: {
  mobile?: string;
  page?: number;
  limit?: number;
  search?: string;
}): Promise<DmtBeneficiary[]> {
  return request(async () => {
    const response = await api.get(DMT_ENDPOINTS.beneficiaries, { params });
    return normalizeBeneficiaryList(response.data);
  });
}

export async function addBeneficiary(
  payload: AddBeneficiaryPayload
): Promise<DmtBeneficiary> {
  return request(async () => {
    const response = await api.post(DMT_ENDPOINTS.beneficiaries, payload);
    const data = unwrapApiData<Record<string, unknown>>(response.data);
    return normalizeBeneficiary(
      (data?.beneficiary as Record<string, unknown>) ?? data ?? {}
    );
  });
}

export async function verifyBeneficiary(
  beneficiaryId: string,
  payload: VerifyBeneficiaryPayload
): Promise<DmtBeneficiary> {
  return request(async () => {
    const response = await api.post(
      DMT_ENDPOINTS.beneficiaryVerify(beneficiaryId),
      payload
    );
    const data = unwrapApiData<Record<string, unknown>>(response.data);
    return normalizeBeneficiary(
      (data?.beneficiary as Record<string, unknown>) ?? data ?? {}
    );
  });
}

export async function deleteBeneficiary(beneficiaryId: string): Promise<void> {
  return request(async () => {
    await api.delete(DMT_ENDPOINTS.beneficiaryDelete(beneficiaryId));
  });
}

export async function initiateTransfer(
  payload: TransferPayload
): Promise<TransferInitResponse> {
  return request(async () => {
    const response = await api.post(DMT_ENDPOINTS.transfer, payload);
    const data = unwrapApiData<Record<string, unknown>>(response.data);
    const transaction = data?.transaction
      ? normalizeTransaction(data.transaction as Record<string, unknown>)
      : data?.id
        ? normalizeTransaction(data)
        : undefined;

    return {
      requiresOtp: Boolean(
        data?.requiresOtp ?? data?.otpRequired ?? !payload.otp
      ),
      requestId: data?.requestId ? String(data.requestId) : undefined,
      transaction,
      charges: data?.charges != null ? Number(data.charges) : undefined,
      gst: data?.gst != null ? Number(data.gst) : undefined,
      netAmount: data?.netAmount != null ? Number(data.netAmount) : undefined,
    };
  });
}

export async function fetchTransactions(
  filters: DmtTransactionFilters = {}
): Promise<DmtPaginatedResponse<DmtTransaction>> {
  return request(async () => {
    const params: Record<string, string | number> = {
      page: filters.page ?? 1,
      limit: filters.limit ?? 10,
    };

    if (filters.search) params.search = filters.search;
    if (filters.status && filters.status !== "all") params.status = filters.status;
    if (filters.dateFrom) params.dateFrom = filters.dateFrom;
    if (filters.dateTo) params.dateTo = filters.dateTo;
    if (filters.minAmount != null) params.minAmount = filters.minAmount;
    if (filters.maxAmount != null) params.maxAmount = filters.maxAmount;
    if (filters.sortBy) params.sortBy = filters.sortBy;
    if (filters.sortOrder) params.sortOrder = filters.sortOrder;

    const response = await api.get(DMT_ENDPOINTS.transactions, { params });
    return normalizeTransactionList(response.data);
  });
}

export async function fetchTransactionById(id: string): Promise<DmtTransaction> {
  return request(async () => {
    try {
      const response = await api.get(DMT_ENDPOINTS.transactionById(id));
      const data = unwrapApiData<Record<string, unknown>>(response.data);
      return normalizeTransaction(
        (data?.transaction as Record<string, unknown>) ?? data ?? {}
      );
    } catch (error) {
      const mapped = mapDmtError(error);
      if (mapped.status === 404) {
        const list = await fetchTransactions({ search: id, limit: 1 });
        const match = list.items.find(
          (item) => item.id === id || item.transactionId === id
        );
        if (match) return match;
      }
      throw mapped;
    }
  });
}

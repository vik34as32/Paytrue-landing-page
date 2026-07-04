import api from "@/src/lib/axios";
import { API_ENDPOINTS } from "@/src/constants/api";
import {
  buildFundRequestListQuery,
  extractCompanyBankAccounts,
  extractFundRequestList,
  extractFundRequestPagination,
  normalizeCompanyBankAccount,
  normalizeFundRequest,
} from "@/src/lib/fundRequestUtils";
import type {
  CompanyBankAccount,
  CreateFundRequestPayload,
  FundRequest,
  FundRequestListParams,
  FundRequestListResult,
} from "@/src/types/fundRequest";

export async function fetchRetailerFundRequests(
  params: FundRequestListParams = {}
): Promise<FundRequestListResult> {
  const page = params.page ?? 1;
  const limit = params.limit ?? 10;
  const query = buildFundRequestListQuery({ ...params, page, limit });

  const response = await api.get(API_ENDPOINTS.fundRequests, { params: query });
  const payload = response.data?.data ?? response.data;
  const list = extractFundRequestList(payload).map((item) =>
    normalizeFundRequest(item)
  );
  const pagination = extractFundRequestPagination(payload, { page, limit });

  return {
    list,
    total: pagination.total || list.length,
    page: pagination.page,
    limit: pagination.limit,
  };
}

export async function fetchCompanyBankAccounts(): Promise<CompanyBankAccount[]> {
  try {
    const response = await api.get(`${API_ENDPOINTS.fundRequests}/company-bank-accounts`);
    const data = response.data?.data ?? response.data;
    const list = Array.isArray(data) ? data : extractCompanyBankAccounts(data);
    return list
      .map((item) => normalizeCompanyBankAccount(item))
      .filter((item) => item.id && item.isActive !== false);
  } catch {
    return [];
  }
}

export async function createRetailerFundRequest(
  payload: CreateFundRequestPayload
): Promise<FundRequest> {
  const formData = new FormData();
  formData.append("amount", String(payload.amount));
  formData.append("paymentMode", payload.paymentMode);
  formData.append("companyBankAccountId", payload.companyBankAccountId);
  formData.append("paymentDate", payload.paymentDate);

  if (payload.utrNumber?.trim()) {
    formData.append("utrNumber", payload.utrNumber.trim());
  }
  if (payload.bankName?.trim()) {
    formData.append("bankName", payload.bankName.trim());
  }
  if (payload.remark?.trim()) {
    formData.append("remark", payload.remark.trim());
  }
  if (payload.receipt) {
    formData.append("receipt", payload.receipt);
  }

  const response = await api.post(API_ENDPOINTS.fundRequests, formData);
  const data = response.data?.data ?? response.data;
  return normalizeFundRequest(
    (data?.fundRequest as Record<string, unknown>) ||
      (data?.request as Record<string, unknown>) ||
      (data as Record<string, unknown>) ||
      {}
  );
}

export async function cancelRetailerFundRequest(
  requestId: string
): Promise<FundRequest> {
  const response = await api.patch(
    `${API_ENDPOINTS.fundRequests}/${requestId}/cancel`
  );
  const data = response.data?.data ?? response.data;
  return normalizeFundRequest(
    (data?.fundRequest as Record<string, unknown>) ||
      (data as Record<string, unknown>) ||
      {}
  );
}

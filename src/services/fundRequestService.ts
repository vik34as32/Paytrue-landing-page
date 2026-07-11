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

function unwrapFundRequestRecord(data: unknown): Record<string, unknown> {
  const root = (data ?? {}) as Record<string, unknown>;
  return (
    (root.fundRequest as Record<string, unknown>) ||
    (root.request as Record<string, unknown>) ||
    root
  );
}

export async function fetchFundRequests(
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

export async function fetchFundRequestById(requestId: string): Promise<FundRequest> {
  const response = await api.get(`${API_ENDPOINTS.fundRequests}/${requestId}`);
  const data = response.data?.data ?? response.data;
  return normalizeFundRequest(unwrapFundRequestRecord(data));
}

export async function fetchCompanyBankAccounts(): Promise<CompanyBankAccount[]> {
  const response = await api.get(API_ENDPOINTS.myBankAccounts);
  const payload = response.data?.data ?? response.data;
  const list = extractCompanyBankAccounts(payload);

  return list
    .map((item) => normalizeCompanyBankAccount(item))
    .filter((item) => item.id && item.isActive !== false);
}

function buildCreateFundRequestBody(payload: CreateFundRequestPayload) {
  const body: Record<string, unknown> = {
    amount: Number(payload.amount),
    paymentMode: payload.paymentMode,
    linkedBankAccountId: payload.companyBankAccountId,
    depositDate: payload.paymentDate,
  };

  const referenceNumber = payload.utrNumber?.trim();
  if (referenceNumber) {
    body.referenceNumber = referenceNumber;
    body.utr = referenceNumber;
  }

  const remarks = payload.remark?.trim();
  if (remarks) {
    body.remarks = remarks;
  }

  if (payload.imageUrl?.trim()) {
    body.imageUrl = payload.imageUrl.trim();
  }

  return body;
}

function buildCreateFundRequestFormData(payload: CreateFundRequestPayload): FormData {
  const formData = new FormData();
  formData.append("amount", String(payload.amount));
  formData.append("paymentMode", payload.paymentMode);
  formData.append("linkedBankAccountId", payload.companyBankAccountId);
  formData.append("depositDate", payload.paymentDate);

  const referenceNumber = payload.utrNumber?.trim();
  if (referenceNumber) {
    formData.append("referenceNumber", referenceNumber);
    formData.append("utr", referenceNumber);
  }

  const remarks = payload.remark?.trim();
  if (remarks) {
    formData.append("remarks", remarks);
  }

  if (payload.imageUrl?.trim()) {
    formData.append("imageUrl", payload.imageUrl.trim());
  }

  if (payload.receipt instanceof File) {
    formData.append("image", payload.receipt, payload.receipt.name);
  }

  return formData;
}

export interface CreateFundRequestOptions {
  onUploadProgress?: (percent: number) => void;
}

export async function createFundRequest(
  payload: CreateFundRequestPayload,
  options: CreateFundRequestOptions = {}
): Promise<FundRequest> {
  const hasReceipt = payload.receipt instanceof File;

  const response = hasReceipt
    ? await api.post(
        API_ENDPOINTS.fundRequests,
        buildCreateFundRequestFormData(payload),
        {
          onUploadProgress: options.onUploadProgress
            ? (event) => {
                if (!event.total) return;
                options.onUploadProgress?.(
                  Math.round((event.loaded * 100) / event.total)
                );
              }
            : undefined,
        }
      )
    : await api.post(
        API_ENDPOINTS.fundRequests,
        buildCreateFundRequestBody(payload)
      );
  const data = response.data?.data ?? response.data;
  return normalizeFundRequest(unwrapFundRequestRecord(data));
}

export async function cancelFundRequest(
  requestId: string,
  cancellationRemarks = "Cancelled by user"
): Promise<FundRequest> {
  const response = await api.put(`${API_ENDPOINTS.fundRequests}/cancel`, {
    fundRequestId: requestId,
    cancellationRemarks,
  });
  const data = response.data?.data ?? response.data;
  return normalizeFundRequest(unwrapFundRequestRecord(data));
}

/** @deprecated use fetchFundRequests */
export const fetchRetailerFundRequests = fetchFundRequests;

/** @deprecated use createFundRequest */
export const createRetailerFundRequest = createFundRequest;

/** @deprecated use cancelFundRequest */
export const cancelRetailerFundRequest = cancelFundRequest;

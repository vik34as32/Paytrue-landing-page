import type { AxiosRequestConfig } from "axios";
import api from "@/src/lib/axios";
import { UPI_PAYOUT_ENDPOINTS } from "./upi-payout-endpoints";
import { unwrapList, unwrapRecord } from "./upi-payout-normalizers";

const skipAuthLogout: AxiosRequestConfig = { skipSessionLogout: true };

export async function apiUpiVerifyVpa(body: Record<string, unknown>): Promise<unknown> {
  const { data } = await api.post(UPI_PAYOUT_ENDPOINTS.verifyVpa, body, skipAuthLogout);
  return data;
}

export async function apiUpiPayoutPreview(body: Record<string, unknown>): Promise<unknown> {
  const { data } = await api.post(UPI_PAYOUT_ENDPOINTS.commissionPreview, body, skipAuthLogout);
  return data;
}

export async function apiUpiPayoutPay(body: Record<string, unknown>): Promise<unknown> {
  const { data } = await api.post(UPI_PAYOUT_ENDPOINTS.pay, body, skipAuthLogout);
  return data;
}

export async function apiUpiPayoutStatus(reference: string): Promise<unknown> {
  const { data } = await api.get(UPI_PAYOUT_ENDPOINTS.transactionStatus(reference), skipAuthLogout);
  return unwrapRecord(data);
}

export async function apiUpiPayoutList(query?: {
  status?: string;
  page?: number;
  limit?: number;
}): Promise<unknown[]> {
  const { data } = await api.get(UPI_PAYOUT_ENDPOINTS.transactions, {
    ...skipAuthLogout,
    params: {
      status: query?.status,
      page: query?.page ?? 1,
      limit: query?.limit ?? 50,
    },
  });
  return unwrapList(data);
}

export async function apiUpiPayoutReceipt(reference: string): Promise<unknown> {
  const { data } = await api.get(UPI_PAYOUT_ENDPOINTS.receipt(reference), skipAuthLogout);
  return unwrapRecord(data);
}

import type { AxiosRequestConfig } from "axios";
import api from "@/src/lib/axios";
import { CCBP_ENDPOINTS } from "./ccbp-endpoints";
import { unwrapList, unwrapRecord } from "./ccbp-normalizers";

const skipAuthLogout: AxiosRequestConfig = { skipSessionLogout: true };

export async function apiCcbpPay(body: Record<string, unknown>): Promise<unknown> {
  const { data } = await api.post(CCBP_ENDPOINTS.pay, body, skipAuthLogout);
  return data;
}

export async function apiCcbpStatus(reference: string): Promise<unknown> {
  const { data } = await api.get(CCBP_ENDPOINTS.status(reference), skipAuthLogout);
  return unwrapRecord(data);
}

export async function apiCcbpList(query?: {
  status?: string;
  page?: number;
  limit?: number;
}): Promise<unknown[]> {
  const { data } = await api.get(CCBP_ENDPOINTS.transactions, {
    ...skipAuthLogout,
    params: {
      status: query?.status,
      page: query?.page ?? 1,
      limit: query?.limit ?? 50,
    },
  });
  return unwrapList(data);
}

export async function apiCcbpReceipt(reference: string): Promise<unknown> {
  const { data } = await api.get(CCBP_ENDPOINTS.receipt(reference), skipAuthLogout);
  return unwrapRecord(data);
}

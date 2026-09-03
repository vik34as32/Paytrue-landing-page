import type { AxiosRequestConfig } from "axios";
import api from "@/src/lib/axios";
import { DMT2_ENDPOINTS } from "./dmt2-endpoints";
import { isUuid, unwrapList, unwrapRecord } from "./dmt2-normalizers";
import type { Dmt2TransferMode } from "../types";

const skipAuthLogout: AxiosRequestConfig = { skipSessionLogout: true };

export async function apiGetRemitter(mobile: string): Promise<unknown | null> {
  try {
    const { data } = await api.get(DMT2_ENDPOINTS.remitterByMobile(mobile), skipAuthLogout);
    return data;
  } catch (error) {
    const status = (error as { status?: number }).status;
    if (status === 404) return null;
    throw error;
  }
}

export async function apiRegisterRemitter(body: {
  mobile: string;
  name?: string;
  email?: string;
  latitude: string;
  longitude: string;
}): Promise<unknown> {
  const { data } = await api.post(DMT2_ENDPOINTS.remitterRegister, body, skipAuthLogout);
  return data;
}

export async function apiVerifyRemitterOtp(body: {
  mobile: string;
  otp: string;
  latitude: string;
  longitude: string;
}): Promise<unknown> {
  const { data } = await api.post(DMT2_ENDPOINTS.remitterVerifyOtp, body, skipAuthLogout);
  return data;
}

export async function apiAddBeneficiary(body: {
  remitterMobile?: string;
  remitterId?: string;
  name: string;
  accountNumber: string;
  ifscCode: string;
  accountType?: string;
  mobile?: string;
  latitude?: string;
  longitude?: string;
  syncProvider?: boolean;
}): Promise<unknown> {
  const { data } = await api.post(DMT2_ENDPOINTS.beneficiaryAdd, body, skipAuthLogout);
  return data;
}

export async function apiVerifyBeneficiary(body: {
  beneficiaryId: string;
  latitude?: string;
  longitude?: string;
}): Promise<unknown> {
  const { data } = await api.post(DMT2_ENDPOINTS.beneficiaryVerify, body, skipAuthLogout);
  return data;
}

export async function apiGetBeneficiary(id: string): Promise<unknown> {
  const { data } = await api.get(DMT2_ENDPOINTS.beneficiaryById(id), skipAuthLogout);
  return data;
}

export async function apiListBeneficiaries(query: {
  remitterMobile?: string;
  remitterId?: string;
  page?: number;
  limit?: number;
}): Promise<unknown[]> {
  const params: Record<string, string | number> = {
    page: query.page ?? 1,
    limit: query.limit ?? 100,
  };
  const mobile = String(query.remitterMobile || "").trim();
  if (mobile) params.remitterMobile = mobile;
  if (isUuid(query.remitterId)) params.remitterId = query.remitterId!.trim();

  const { data } = await api.get(DMT2_ENDPOINTS.beneficiaries, {
    ...skipAuthLogout,
    params,
  });
  return unwrapList(data);
}

export async function apiPayout(
  mode: Dmt2TransferMode,
  body: {
    beneficiaryId: string;
    amount: number;
    transferMode?: Dmt2TransferMode;
    remarks?: string;
    mpin: string;
    latitude: string;
    longitude: string;
    payerName?: string;
    remitterMobile?: string;
  }
): Promise<unknown> {
  const path =
    mode === "NEFT"
      ? DMT2_ENDPOINTS.payoutNeft
      : mode === "RTGS"
        ? DMT2_ENDPOINTS.payoutRtgs
        : DMT2_ENDPOINTS.payoutImps;
  const { data } = await api.post(path, body, skipAuthLogout);
  return data;
}

export async function apiTransactionStatus(reference: string): Promise<unknown> {
  const { data } = await api.get(
    DMT2_ENDPOINTS.transactionStatus(reference),
    skipAuthLogout
  );
  return data;
}

export async function apiListTransactions(query?: {
  status?: string;
  page?: number;
  limit?: number;
}): Promise<unknown[]> {
  const { data } = await api.get(DMT2_ENDPOINTS.transactions, {
    ...skipAuthLogout,
    params: {
      status: query?.status,
      page: query?.page ?? 1,
      limit: query?.limit ?? 50,
    },
  });
  return unwrapList(data);
}

export async function apiReceipt(reference: string): Promise<unknown> {
  const { data } = await api.get(DMT2_ENDPOINTS.receipt(reference), skipAuthLogout);
  return unwrapRecord(data);
}

import api from "@/src/lib/axios";
import { AEPS_ENDPOINTS } from "@/src/constants/aepsApi";
import {
  buildAepsLoginApiBody,
  buildAepsAccountVerifyApiBody,
  buildAepsTransactionApiBody,
  mapAepsError,
  normalizeAepsAccountVerifyResult,
  normalizeAepsBankList,
  normalizeAepsHealth,
  normalizeAepsLoginResult,
  normalizeAepsTransactionResult,
  unwrapAepsData,
} from "@/src/lib/aepsUtils";
import type {
  AepsAccountVerifyPayload,
  AepsAccountVerifyResult,
  AepsBank,
  AepsHealthResult,
  AepsLoginPayload,
  AepsLoginResult,
  AepsTransactionOtpPayload,
  AepsTransactionPayload,
  AepsTransactionResult,
  AepsTransactionStatusPayload,
} from "@/src/types/aeps";

async function request<T>(fn: () => Promise<T>): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    throw mapAepsError(error);
  }
}

export async function aepsHealthCheck(): Promise<AepsHealthResult> {
  return request(async () => {
    const { data } = await api.get(AEPS_ENDPOINTS.health);
    const payload = unwrapAepsData<Record<string, unknown>>(data);
    return normalizeAepsHealth(payload ?? (data as Record<string, unknown>));
  });
}

export async function aepsDailyLogin(payload: AepsLoginPayload): Promise<AepsLoginResult> {
  return request(async () => {
    const body = buildAepsLoginApiBody(payload);
    const { data } = await api.post(AEPS_ENDPOINTS.login, body);
    const raw = unwrapAepsData<Record<string, unknown>>(data) ?? (data as Record<string, unknown>);
    return normalizeAepsLoginResult(raw);
  });
}

export async function fetchAepsBanks(): Promise<AepsBank[]> {
  return request(async () => {
    const { data } = await api.get(AEPS_ENDPOINTS.banks);
    const banks = normalizeAepsBankList(data);
    if (banks.length > 0) return banks;

    const unwrapped = unwrapAepsData<unknown>(data);
    return normalizeAepsBankList(unwrapped);
  });
}

export async function aepsCashWithdrawal(
  payload: AepsTransactionPayload
): Promise<AepsTransactionResult> {
  return request(async () => {
    const body = buildAepsTransactionApiBody(payload);
    const { data } = await api.post(AEPS_ENDPOINTS.cashWithdrawal, body);
    const raw = unwrapAepsData<Record<string, unknown>>(data) ?? (data as Record<string, unknown>);
    return normalizeAepsTransactionResult(raw);
  });
}

export async function aepsBalanceEnquiry(
  payload: AepsTransactionPayload
): Promise<AepsTransactionResult> {
  return request(async () => {
    const body = buildAepsTransactionApiBody(payload);
    const { data } = await api.post(AEPS_ENDPOINTS.balanceEnquiry, body);
    const raw = unwrapAepsData<Record<string, unknown>>(data) ?? (data as Record<string, unknown>);
    return normalizeAepsTransactionResult(raw);
  });
}

export async function aepsMiniStatement(
  payload: AepsTransactionPayload
): Promise<AepsTransactionResult> {
  return request(async () => {
    const body = buildAepsTransactionApiBody(payload);
    const { data } = await api.post(AEPS_ENDPOINTS.miniStatement, body);
    const raw = unwrapAepsData<Record<string, unknown>>(data) ?? (data as Record<string, unknown>);
    return normalizeAepsTransactionResult(raw);
  });
}

export async function aepsVerifyCashDepositAccount(
  payload: AepsAccountVerifyPayload
): Promise<AepsAccountVerifyResult> {
  return request(async () => {
    const body = buildAepsAccountVerifyApiBody(payload);
    const { data } = await api.post(AEPS_ENDPOINTS.cashDepositVerifyAccount, body);
    const raw = unwrapAepsData<Record<string, unknown>>(data) ?? (data as Record<string, unknown>);
    return normalizeAepsAccountVerifyResult(raw);
  });
}

export async function aepsCashDeposit(
  payload: AepsTransactionPayload
): Promise<AepsTransactionResult> {
  return request(async () => {
    const body = buildAepsTransactionApiBody(payload);
    const { data } = await api.post(AEPS_ENDPOINTS.cashDeposit, body);
    const raw = unwrapAepsData<Record<string, unknown>>(data) ?? (data as Record<string, unknown>);
    return normalizeAepsTransactionResult(raw);
  });
}

export async function aepsAadhaarPay(
  payload: AepsTransactionPayload
): Promise<AepsTransactionResult> {
  return request(async () => {
    const body = buildAepsTransactionApiBody(payload);
    const { data } = await api.post(AEPS_ENDPOINTS.aadhaarPay, body);
    const raw = unwrapAepsData<Record<string, unknown>>(data) ?? (data as Record<string, unknown>);
    return normalizeAepsTransactionResult(raw);
  });
}

export async function aepsTransactionOtp(
  payload: AepsTransactionOtpPayload
): Promise<AepsTransactionResult> {
  return request(async () => {
    const { data } = await api.post(AEPS_ENDPOINTS.transactionOtp, payload);
    const raw = unwrapAepsData<Record<string, unknown>>(data) ?? (data as Record<string, unknown>);
    return normalizeAepsTransactionResult(raw);
  });
}

export async function aepsTransactionStatus(
  payload: AepsTransactionStatusPayload
): Promise<AepsTransactionResult> {
  return request(async () => {
    const { data } = await api.post(AEPS_ENDPOINTS.transactionStatus, payload);
    const raw = unwrapAepsData<Record<string, unknown>>(data) ?? (data as Record<string, unknown>);
    return normalizeAepsTransactionResult(raw);
  });
}

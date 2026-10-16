import api from "@/src/lib/axios";
import type {
  NsdlBank,
  NsdlDailyLoginAuthType,
  NsdlLedgerQuery,
  NsdlLedgerResult,
  NsdlMerchant,
  NsdlOnboardInput,
  NsdlState,
  NsdlStepResult,
  NsdlTransaction,
  NsdlTransactionInput,
} from "../types";
import { NSDL_AEPS_ENDPOINTS } from "./nsdl-aeps-endpoints";
import {
  normalizeNsdlBanks,
  normalizeNsdlLedger,
  normalizeNsdlMerchant,
  normalizeNsdlStates,
  normalizeNsdlStepResult,
  normalizeNsdlTransaction,
  nsdlErrorMessage,
  resultPayloadFromError,
} from "./nsdl-aeps-normalizers";

interface GeoBiometric {
  latitude: string;
  longitude: string;
  pidBlock: string;
}

async function get<T>(url: string, map: (payload: unknown) => T, params?: object): Promise<T> {
  try {
    const { data } = await api.get(url, params ? { params } : undefined);
    return map(data);
  } catch (error) {
    throw new Error(nsdlErrorMessage(error));
  }
}

/** POST whose failure body (HTTP 400) still describes the outcome — returned, not thrown. */
async function postResult<T>(
  url: string,
  body: object,
  map: (payload: unknown) => T
): Promise<T> {
  try {
    const { data } = await api.post(url, body);
    return map(data);
  } catch (error) {
    const payload = resultPayloadFromError(error);
    if (payload) return map(payload);
    throw new Error(nsdlErrorMessage(error));
  }
}

export function fetchNsdlBanks(): Promise<NsdlBank[]> {
  return get(NSDL_AEPS_ENDPOINTS.banks, normalizeNsdlBanks);
}

export function fetchNsdlStates(): Promise<NsdlState[]> {
  return get(NSDL_AEPS_ENDPOINTS.states, normalizeNsdlStates);
}

export function fetchNsdlMerchant(): Promise<NsdlMerchant> {
  return get(NSDL_AEPS_ENDPOINTS.merchant, normalizeNsdlMerchant);
}

export function submitNsdlOnboarding(input: NsdlOnboardInput): Promise<NsdlStepResult> {
  return postResult(NSDL_AEPS_ENDPOINTS.onboardMerchant, input, normalizeNsdlStepResult);
}

export function requestNsdlOnboardingOtp(location: {
  latitude: string;
  longitude: string;
}): Promise<NsdlStepResult> {
  return postResult(NSDL_AEPS_ENDPOINTS.onboardRequestOtp, location, normalizeNsdlStepResult);
}

export function verifyNsdlOnboardingOtp(input: {
  latitude: string;
  longitude: string;
  otp: string;
}): Promise<NsdlStepResult> {
  return postResult(NSDL_AEPS_ENDPOINTS.onboardVerifyOtp, input, normalizeNsdlStepResult);
}

export function submitNsdlEkyc(input: GeoBiometric & { bankIin: string }): Promise<NsdlStepResult> {
  return postResult(NSDL_AEPS_ENDPOINTS.onboardEkyc, input, normalizeNsdlStepResult);
}

export function nsdlDailyLogin(
  input: GeoBiometric & { authType: NsdlDailyLoginAuthType }
): Promise<NsdlStepResult> {
  return postResult(NSDL_AEPS_ENDPOINTS.dailyLogin, input, normalizeNsdlStepResult);
}

export function performNsdlTransaction(input: NsdlTransactionInput): Promise<NsdlTransaction> {
  const body: Record<string, unknown> = {
    serviceType: input.serviceType,
    aadhaarNumber: input.aadhaarNumber,
    mobile: input.mobile,
    bankIIN: input.bankIIN,
    captureType: "biometric",
    pidBlock: input.pidBlock,
    latitude: input.latitude,
    longitude: input.longitude,
    mpin: input.mpin,
    idempotencyKey: input.idempotencyKey,
    consent: true,
  };
  if (input.amount != null) body.amount = input.amount;
  return postResult(NSDL_AEPS_ENDPOINTS.transaction, body, normalizeNsdlTransaction);
}

export function fetchNsdlTransaction(transactionId: string): Promise<NsdlTransaction> {
  return get(NSDL_AEPS_ENDPOINTS.transactionById(transactionId), normalizeNsdlTransaction);
}

export function reconcileNsdlTransaction(transactionId: string): Promise<NsdlTransaction> {
  return postResult(NSDL_AEPS_ENDPOINTS.status, { transactionId }, normalizeNsdlTransaction);
}

export function fetchNsdlLedger(query: NsdlLedgerQuery): Promise<NsdlLedgerResult> {
  const page = query.page ?? 1;
  const limit = query.limit ?? 20;
  const params = Object.fromEntries(
    Object.entries({ ...query, page, limit }).filter(([, value]) => value !== undefined && value !== "")
  );
  return get(
    NSDL_AEPS_ENDPOINTS.ledger,
    (payload) => normalizeNsdlLedger(payload, page, limit),
    params
  );
}

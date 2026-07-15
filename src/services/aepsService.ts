import api from "@/src/lib/axios";
import { AEPS_ENDPOINTS } from "@/src/constants/aepsApi";
import { RETAILER_SERVICE_NAMES } from "@/src/constants/retailerServices";
import {
  appendServiceId,
  ensureRetailerServicesLoaded,
} from "@/features/retailer/store/retailerServicesStore";
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

export interface AepsLedgerFilters {
  page?: number;
  limit?: number;
}

export interface AepsLedgerRecord {
  id: string;
  referenceId: string;
  transactionType: string;
  customerMobile?: string | null;
  amount?: number | null;
  balance?: number | null;
  bankName?: string | null;
  status: string;
  message?: string | null;
  rrn?: string | null;
  bankRRN?: string | null;
  txnId?: string | null;
  createdAt: string;
  updatedAt?: string;
}

export interface AepsLedgerResult {
  records: AepsLedgerRecord[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

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
    await ensureRetailerServicesLoaded();
    const body = appendServiceId(
      buildAepsTransactionApiBody(payload),
      RETAILER_SERVICE_NAMES.AEPS_CASH_WITHDRAWAL
    );
    const { data } = await api.post(AEPS_ENDPOINTS.cashWithdrawal, body);
    const raw = unwrapAepsData<Record<string, unknown>>(data) ?? (data as Record<string, unknown>);
    return normalizeAepsTransactionResult(raw);
  });
}

export async function aepsBalanceEnquiry(
  payload: AepsTransactionPayload
): Promise<AepsTransactionResult> {
  return request(async () => {
    await ensureRetailerServicesLoaded();
    const body = appendServiceId(
      buildAepsTransactionApiBody(payload),
      RETAILER_SERVICE_NAMES.AEPS_BALANCE_ENQUIRY
    );
    const { data } = await api.post(AEPS_ENDPOINTS.balanceEnquiry, body);
    const envelope = data as Record<string, unknown>;
    const raw = unwrapAepsData<Record<string, unknown>>(data) ?? envelope;
    return normalizeAepsTransactionResult({
      ...(raw ?? {}),
      message: envelope.message ?? raw?.message,
    });
  });
}

export async function aepsMiniStatement(
  payload: AepsTransactionPayload
): Promise<AepsTransactionResult> {
  return request(async () => {
    await ensureRetailerServicesLoaded();
    const body = appendServiceId(
      buildAepsTransactionApiBody(payload),
      RETAILER_SERVICE_NAMES.AEPS_MINI_STATEMENT
    );
    const { data } = await api.post(AEPS_ENDPOINTS.miniStatement, body);
    const envelope = data as Record<string, unknown>;
    const raw = unwrapAepsData<Record<string, unknown>>(data) ?? envelope;
    return normalizeAepsTransactionResult({
      ...(raw ?? {}),
      message: envelope.message ?? raw?.message,
    });
  });
}

export async function aepsVerifyCashDepositAccount(
  payload: AepsAccountVerifyPayload
): Promise<AepsAccountVerifyResult> {
  return request(async () => {
    await ensureRetailerServicesLoaded();
    const body = appendServiceId(
      buildAepsAccountVerifyApiBody(payload),
      RETAILER_SERVICE_NAMES.AEPS_CASH_DEPOSIT
    );
    const { data } = await api.post(AEPS_ENDPOINTS.cashDepositVerifyAccount, body);
    const raw = unwrapAepsData<Record<string, unknown>>(data) ?? (data as Record<string, unknown>);
    return normalizeAepsAccountVerifyResult(raw);
  });
}

export async function aepsCashDeposit(
  payload: AepsTransactionPayload
): Promise<AepsTransactionResult> {
  return request(async () => {
    await ensureRetailerServicesLoaded();
    const body = appendServiceId(
      buildAepsTransactionApiBody(payload),
      RETAILER_SERVICE_NAMES.AEPS_CASH_DEPOSIT
    );
    const { data } = await api.post(AEPS_ENDPOINTS.cashDeposit, body);
    const raw = unwrapAepsData<Record<string, unknown>>(data) ?? (data as Record<string, unknown>);
    return normalizeAepsTransactionResult(raw);
  });
}

export async function aepsAadhaarPay(
  payload: AepsTransactionPayload
): Promise<AepsTransactionResult> {
  return request(async () => {
    await ensureRetailerServicesLoaded();
    const body = appendServiceId(
      buildAepsTransactionApiBody(payload),
      RETAILER_SERVICE_NAMES.AEPS_AADHAAR_PAY
    );
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

function normalizeAepsLedgerRecord(raw: Record<string, unknown>): AepsLedgerRecord {
  return {
    id: String(raw.id ?? raw.referenceId ?? ""),
    referenceId: String(raw.referenceId ?? raw.id ?? ""),
    transactionType: String(raw.transactionType ?? "AEPS"),
    customerMobile: raw.customerMobile != null ? String(raw.customerMobile) : null,
    amount:
      raw.amount == null || raw.amount === ""
        ? null
        : Number(raw.amount),
    balance:
      raw.balance == null || raw.balance === ""
        ? null
        : Number(raw.balance),
    bankName: raw.bankName != null ? String(raw.bankName) : null,
    status: String(raw.status ?? "FAILED"),
    message: raw.message != null ? String(raw.message) : null,
    rrn: raw.rrn != null ? String(raw.rrn) : null,
    bankRRN: raw.bankRRN != null ? String(raw.bankRRN) : null,
    txnId: raw.txnId != null ? String(raw.txnId) : null,
    createdAt: String(raw.createdAt ?? new Date().toISOString()),
    updatedAt: raw.updatedAt ? String(raw.updatedAt) : undefined,
  };
}

export async function fetchAepsLedger(
  filters: AepsLedgerFilters = {}
): Promise<AepsLedgerResult> {
  return request(async () => {
    const params: Record<string, number> = {
      page: filters.page ?? 1,
      limit: filters.limit ?? 100,
    };

    const { data } = await api.get(AEPS_ENDPOINTS.ledger, { params });
    const payload = unwrapAepsData<Record<string, unknown>>(data) ?? {};
    const rows = Array.isArray(payload)
      ? payload
      : ((payload.records as unknown[]) ?? []);
    const meta = (payload.meta as Record<string, unknown>) ?? payload;

    const total = Number(meta.total ?? rows.length) || rows.length;
    const page = Number(meta.page ?? params.page) || params.page;
    const limit = Number(meta.limit ?? params.limit) || params.limit;
    const totalPages =
      Number(meta.totalPages ?? (Math.ceil(total / limit) || 1)) || 1;

    return {
      records: (rows as Record<string, unknown>[]).map(normalizeAepsLedgerRecord),
      pagination: { page, limit, total, totalPages },
    };
  });
}

import {
  createAepsExternalRef,
  parsePidXmlToBiometricData,
  type AepsBiometricData,
} from "@/src/lib/pidParser";
import { formatGeoLocation } from "@/src/lib/geoUtils";
import type {
  AepsAccountVerifyPayload,
  AepsAccountVerifyResult,
  AepsBank,
  AepsBiometricCaptureInput,
  AepsLoginPayload,
  AepsLoginResult,
  AepsMiniStatementRow,
  AepsTransactionPayload,
  AepsTransactionResult,
  AepsHealthResult,
} from "@/src/types/aeps";

interface AepsBiometricApiBase {
  latitude: string;
  longitude: string;
  externalRef: string;
  captureType: "FINGER" | "FACE" | "IRIS";
  biometricData: AepsBiometricData;
}

function buildBiometricApiBase(
  input: AepsBiometricCaptureInput
): AepsBiometricApiBase {
  const biometricData = parsePidXmlToBiometricData(input.pidData);
  const coords = formatGeoLocation({
    latitude: input.latitude,
    longitude: input.longitude,
  });
  return {
    latitude: coords.latitude,
    longitude: coords.longitude,
    externalRef: input.externalRef || createAepsExternalRef(),
    captureType: input.captureType || "FINGER",
    biometricData,
  };
}

export function buildAepsLoginApiBody(payload: AepsLoginPayload) {
  const base = buildBiometricApiBase(payload);
  const body: Record<string, unknown> = { ...base };

  if (payload.aadhaarNumber?.trim()) {
    body.aadhaarNumber = payload.aadhaarNumber.trim();
    body.aadhaar = payload.aadhaarNumber.trim();
  }
  if (payload.aadhaar?.trim()) body.aadhaar = payload.aadhaar.trim();
  if (payload.encryptedAadhaar?.trim()) {
    body.encryptedAadhaar = payload.encryptedAadhaar.trim();
    base.biometricData.encryptedAadhaar = payload.encryptedAadhaar.trim();
  }

  return body;
}

export function buildAepsTransactionApiBody(payload: AepsTransactionPayload) {
  const base = buildBiometricApiBase(payload);
  const body: Record<string, unknown> = {
    ...base,
    aadhaarNumber: payload.aadhaarNumber,
    aadhaar: payload.aadhaarNumber,
    mobile: payload.mobileNumber,
    mobileNumber: payload.mobileNumber,
    bankIIN: payload.bankIIN,
    bankiin: payload.bankIIN,
  };

  if (payload.amount != null) body.amount = String(payload.amount);
  if (payload.accountNumber?.trim()) {
    body.accountNumber = payload.accountNumber.trim();
    body.accountNo = payload.accountNumber.trim();
  }
  if (payload.ifscCode?.trim()) {
    body.ifscCode = payload.ifscCode.trim().toUpperCase();
    body.ifsc = payload.ifscCode.trim().toUpperCase();
  }
  if (payload.accountHolderName?.trim()) {
    body.accountHolderName = payload.accountHolderName.trim();
    body.beneficiaryName = payload.accountHolderName.trim();
  }
  if (payload.referenceId) body.referenceId = payload.referenceId;
  if (payload.referenceKey) body.referenceKey = payload.referenceKey;
  if (payload.otp) body.otp = payload.otp;
  if (payload.encryptedAadhaar?.trim()) {
    body.encryptedAadhaar = payload.encryptedAadhaar.trim();
    base.biometricData.encryptedAadhaar = payload.encryptedAadhaar.trim();
  }

  return body;
}

export function unwrapAepsData<T>(payload: unknown): T {
  if (payload && typeof payload === "object" && "data" in payload) {
    return (payload as { data: T }).data;
  }
  return payload as T;
}

export function mapAepsError(error: unknown): Error {
  if (error && typeof error === "object") {
    const err = error as {
      message?: string;
      data?: {
        message?: string;
        errors?: Array<{ field?: string; message?: string }>;
      };
    };

    const validationErrors = err.data?.errors;
    if (Array.isArray(validationErrors) && validationErrors.length > 0) {
      const details = validationErrors
        .map((item) =>
          item.field ? `${item.field}: ${item.message || "invalid"}` : item.message
        )
        .filter(Boolean)
        .join("; ");
      return new Error(details || err.data?.message || err.message || "Validation failed.");
    }

    const message =
      err.data?.message ||
      err.message ||
      "AEPS request failed. Please try again.";
    return new Error(message);
  }
  return new Error("AEPS request failed. Please try again.");
}

export function normalizeAepsBank(raw: Record<string, unknown>): AepsBank | null {
  const name = String(
    raw.name ?? raw.bankName ?? raw.bank_name ?? raw.BankName ?? ""
  ).trim();
  const iin = String(
    raw.iin ??
      raw.IIN ??
      raw.iinno ??
      raw.IINNO ??
      raw.iinNo ??
      raw.bankIIN ??
      raw.bank_iin ??
      raw.bankIin ??
      raw.bankCode ??
      raw.bank_code ??
      ""
  ).trim();

  if (!name || !iin) return null;

  return {
    id: String(raw.id ?? raw._id ?? iin),
    name,
    iin,
    bankCode: String(raw.bankCode ?? raw.bank_code ?? iin),
    isActive:
      raw.isActive !== false &&
      raw.active !== false &&
      raw.status !== "inactive" &&
      raw.isEnabled !== false,
  };
}

/** Parse AEPS bank list from API / InstantPay nested payloads */
export function extractAepsBankList(payload: unknown): unknown[] {
  if (Array.isArray(payload)) return payload;
  if (!payload || typeof payload !== "object") return [];

  const root = payload as Record<string, unknown>;
  const candidates = [
    root.banks,
    root.items,
    root.list,
    root.records,
    root.data,
  ];

  for (const candidate of candidates) {
    if (Array.isArray(candidate)) return candidate;

    if (candidate && typeof candidate === "object") {
      const nested = candidate as Record<string, unknown>;
      if (Array.isArray(nested.banks)) return nested.banks;
      if (Array.isArray(nested.items)) return nested.items;
      if (Array.isArray(nested.list)) return nested.list;
      if (Array.isArray(nested.records)) return nested.records;

      const inner = nested.data;
      if (Array.isArray(inner)) return inner;
      if (inner && typeof inner === "object") {
        const level2 = inner as Record<string, unknown>;
        if (Array.isArray(level2.banks)) return level2.banks;
        if (Array.isArray(level2.items)) return level2.items;
      }
    }
  }

  return [];
}

export function normalizeAepsBankList(payload: unknown): AepsBank[] {
  return extractAepsBankList(payload)
    .map((item) => normalizeAepsBank(item as Record<string, unknown>))
    .filter((bank): bank is AepsBank => Boolean(bank))
    .sort((a, b) => a.name.localeCompare(b.name, "en-IN"));
}

export function normalizeAepsLoginResult(raw: Record<string, unknown>): AepsLoginResult {
  return {
    success: raw.success !== false,
    message: String(raw.message ?? "Daily login successful"),
    loginDate: String(raw.loginDate ?? raw.date ?? new Date().toISOString()),
    agentName: raw.agentName ? String(raw.agentName) : undefined,
    raw,
  };
}

export function normalizeAepsTransactionResult(
  raw: Record<string, unknown>
): AepsTransactionResult {
  const miniStatementRaw =
    raw.miniStatement ?? raw.statement ?? raw.transactions ?? raw.mini_statement;

  let miniStatement: AepsMiniStatementRow[] | undefined;
  if (Array.isArray(miniStatementRaw)) {
    miniStatement = miniStatementRaw.map((row) => {
      const item = row as Record<string, unknown>;
      return {
        date: String(item.date ?? item.txnDate ?? ""),
        narration: String(item.narration ?? item.description ?? item.remark ?? ""),
        amount: Number(item.amount ?? 0),
        type: String(item.type ?? item.txnType ?? ""),
        balance: item.balance != null ? Number(item.balance) : undefined,
      };
    });
  }

  return {
    referenceId: String(raw.referenceId ?? raw.reference ?? raw.refId ?? ""),
    transactionId: String(raw.transactionId ?? raw.txnId ?? raw.id ?? ""),
    status: String(raw.status ?? "pending").toLowerCase(),
    message: String(raw.message ?? raw.statusMessage ?? ""),
    amount: raw.amount != null ? Number(raw.amount) : undefined,
    balance: raw.balance != null ? Number(raw.balance) : undefined,
    bankName: raw.bankName ? String(raw.bankName) : undefined,
    aadhaarNumber: raw.aadhaarNumber ? String(raw.aadhaarNumber) : undefined,
    mobileNumber: raw.mobileNumber ? String(raw.mobileNumber) : undefined,
    customerName: raw.customerName ? String(raw.customerName) : undefined,
    rrn: raw.rrn ? String(raw.rrn) : undefined,
    stan: raw.stan ? String(raw.stan) : undefined,
    miniStatement,
    receipt: (raw.receipt as Record<string, unknown>) ?? undefined,
    raw,
  };
}

export function normalizeAepsHealth(raw: Record<string, unknown>): AepsHealthResult {
  return {
    status: String(raw.status ?? "unknown"),
    message: raw.message ? String(raw.message) : undefined,
    provider: raw.provider ? String(raw.provider) : undefined,
  };
}

export function buildAepsAccountVerifyApiBody(payload: AepsAccountVerifyPayload) {
  const coords = formatGeoLocation({
    latitude: payload.latitude,
    longitude: payload.longitude,
  });
  const body: Record<string, unknown> = {
    accountNumber: payload.accountNumber.trim(),
    accountNo: payload.accountNumber.trim(),
    bankIIN: payload.bankIIN,
    bankiin: payload.bankIIN,
    latitude: coords.latitude,
    longitude: coords.longitude,
    externalRef: createAepsExternalRef(),
  };
  if (payload.mobileNumber?.trim()) {
    body.mobile = payload.mobileNumber.trim();
    body.mobileNumber = payload.mobileNumber.trim();
  }
  return body;
}

export function normalizeAepsAccountVerifyResult(
  raw: Record<string, unknown>
): AepsAccountVerifyResult {
  const payee = (raw.payee as Record<string, unknown>) ?? {};
  const data = (raw.data as Record<string, unknown>) ?? raw;
  const nestedPayee = (data.payee as Record<string, unknown>) ?? payee;

  const accountHolderName = String(
    raw.accountHolderName ??
      raw.accountHolder ??
      raw.beneficiaryName ??
      raw.customerName ??
      raw.name ??
      nestedPayee.name ??
      data.accountHolderName ??
      data.beneficiaryName ??
      data.customerName ??
      ""
  ).trim();

  const ifscCode = String(
    raw.ifscCode ??
      raw.ifsc ??
      nestedPayee.ifsc ??
      nestedPayee.bankIfsc ??
      data.ifscCode ??
      data.ifsc ??
      ""
  )
    .trim()
    .toUpperCase();

  const accountNumber = String(
    raw.accountNumber ??
      raw.accountNo ??
      nestedPayee.account ??
      nestedPayee.accountNumber ??
      data.accountNumber ??
      data.accountNo ??
      ""
  ).trim();

  const bankName = String(
    raw.bankName ?? data.bankName ?? nestedPayee.bankName ?? ""
  ).trim();

  const verified =
    raw.verified === true ||
    data.verified === true ||
    raw.statuscode === "TXN" ||
    String(raw.status ?? data.status ?? "")
      .toLowerCase()
      .includes("success") ||
    Boolean(accountHolderName && ifscCode);

  return {
    verified,
    accountHolderName,
    accountNumber,
    ifscCode,
    bankName,
    accountType:
      raw.accountType != null
        ? String(raw.accountType)
        : nestedPayee.accountType != null
          ? String(nestedPayee.accountType)
          : undefined,
    message: String(raw.message ?? data.message ?? raw.status ?? "Account verified"),
    referenceId: String(
      raw.referenceId ?? data.referenceId ?? raw.poolReferenceId ?? data.poolReferenceId ?? ""
    ) || undefined,
  };
}

export function maskAadhaar(value: string): string {
  const digits = String(value || "").replace(/\D/g, "");
  if (digits.length < 4) return value;
  return `XXXX-XXXX-${digits.slice(-4)}`;
}

export function isTodayLoginDate(loginDate: string | null | undefined): boolean {
  if (!loginDate) return false;
  const date = new Date(loginDate);
  if (Number.isNaN(date.getTime())) return false;
  const today = new Date();
  return (
    date.getFullYear() === today.getFullYear() &&
    date.getMonth() === today.getMonth() &&
    date.getDate() === today.getDate()
  );
}

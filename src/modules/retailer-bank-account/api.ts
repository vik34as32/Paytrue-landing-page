import api from "@/src/lib/axios";
import type {
  AddRetailerBankAccountInput,
  AddRetailerBankAccountResult,
  RetailerBankAccount,
} from "./types";

export const RETAILER_BANK_ACCOUNT_ENDPOINTS = {
  status: "/retailer/bank-account",
  add: "/retailer/bank-account/add",
} as const;

export const RETAILER_BANK_ACCOUNT_QUERY_KEY = ["retailer", "bank-account"] as const;

type Rec = Record<string, unknown>;

function asRecord(value: unknown): Rec {
  return value && typeof value === "object" && !Array.isArray(value) ? (value as Rec) : {};
}

function strOrNull(value: unknown): string | null {
  const text = value == null ? "" : String(value).trim();
  return text || null;
}

function pick(record: Rec, keys: string[]): string | null {
  for (const key of keys) {
    const value = strOrNull(record[key]);
    if (value) return value;
  }
  return null;
}

function accountRecord(payload: unknown): Rec {
  const root = asRecord(payload);
  const data = asRecord(root.data ?? root);
  const nested = asRecord(data.bankAccount ?? data.account ?? data.bankDetails);
  return Object.keys(nested).length > 0 ? { ...data, ...nested } : data;
}

function maskAccountNumber(value: string | null): string | null {
  if (!value) return null;
  const compact = value.replace(/\s/g, "");
  if (/^\d{9,18}$/.test(compact)) {
    return `${"X".repeat(compact.length - 4)}${compact.slice(-4)}`;
  }
  return value;
}

function normalizeAccount(payload: unknown): RetailerBankAccount {
  const data = accountRecord(payload);
  const accountNumberMasked = maskAccountNumber(
    pick(data, [
      "accountNumberMasked",
      "maskedAccountNumber",
      "accountNumber",
      "accountNo",
      "bankAccountNo",
      "bankAccountNumber",
    ])
  );
  const ifscCode = pick(data, ["ifscCode", "ifsc", "bankIfsc", "bankIFSC"])?.toUpperCase() ?? null;
  const explicitStatus = pick(data, ["status", "instantpayLinkStatus", "linkStatus"]);
  return {
    status: (explicitStatus ?? (accountNumberMasked || ifscCode ? "LINKED" : "NOT_LINKED")).toUpperCase(),
    accountNumberMasked,
    ifscCode,
    bankName: pick(data, ["bankName", "bank"]),
    accountHolderName: pick(data, ["accountHolderName", "accountHolder", "holderName", "payeeName"]),
    linkedAt: pick(data, ["linkedAt", "instantpayLinkedAt", "createdAt"]),
    ipayUuid: pick(data, ["ipayUuid", "instantpayIpayUuid"]),
    message: pick(data, ["message"]),
  };
}

export function hasRetailerBankAccount(account: RetailerBankAccount | null | undefined): boolean {
  return Boolean(account?.accountNumberMasked || account?.ifscCode);
}

export async function fetchRetailerBankAccount(): Promise<RetailerBankAccount> {
  const { data } = await api.get(RETAILER_BANK_ACCOUNT_ENDPOINTS.status);
  return normalizeAccount(data);
}

export async function addRetailerBankAccount(
  input: AddRetailerBankAccountInput
): Promise<AddRetailerBankAccountResult> {
  const { data } = await api.post(RETAILER_BANK_ACCOUNT_ENDPOINTS.add, input);
  const root = asRecord(data);
  const account = normalizeAccount(data);
  const message = strOrNull(root.message) ?? account.message ?? "Bank account request recorded";
  return {
    account,
    message,
    linked: account.status === "LINKED",
    pending: account.status === "PENDING" || asRecord(root.data).uncertain === true,
  };
}

export function retailerBankAccountErrorMessage(error: unknown): string {
  const err = asRecord(error);
  const body = asRecord(err.data);
  const fieldErrors = Array.isArray(body.errors) ? body.errors : [];
  const firstField = asRecord(fieldErrors[0]);
  return (
    strOrNull(firstField.message) ??
    strOrNull(body.message) ??
    strOrNull(err.message) ??
    "Bank account could not be linked."
  );
}

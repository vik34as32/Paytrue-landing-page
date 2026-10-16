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

function normalizeAccount(payload: unknown): RetailerBankAccount {
  const root = asRecord(payload);
  const data = asRecord(root.data ?? root);
  return {
    status: (strOrNull(data.status) ?? "NOT_LINKED").toUpperCase(),
    accountNumberMasked: strOrNull(data.accountNumberMasked),
    ifscCode: strOrNull(data.ifscCode)?.toUpperCase() ?? null,
    bankName: strOrNull(data.bankName),
    linkedAt: strOrNull(data.linkedAt),
    ipayUuid: strOrNull(data.ipayUuid),
    message: strOrNull(data.message),
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

import api from "@/src/lib/axios";
import type {
  AepsSettlement,
  AepsSettlementInput,
  AepsSettlementList,
  AepsSettlementQuery,
} from "./types";

export const AEPS_SETTLEMENT_ENDPOINTS = {
  settle: "/wallet/aeps/settlement",
  list: "/wallet/aeps/settlements",
} as const;

export const AEPS_SETTLEMENTS_QUERY_KEY = ["wallet", "aeps", "settlements"] as const;

export const AEPS_SETTLEMENTS_PATH = "/rt/retailer/aeps-settlements";

type Rec = Record<string, unknown>;

function asRecord(value: unknown): Rec {
  return value && typeof value === "object" && !Array.isArray(value) ? (value as Rec) : {};
}

function str(value: unknown): string {
  return value == null ? "" : String(value).trim();
}

function strOrNull(value: unknown): string | null {
  return str(value) || null;
}

function numOrNull(value: unknown): number | null {
  if (value == null || value === "") return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

export function normalizeAepsSettlement(raw: unknown): AepsSettlement {
  const row = asRecord(raw);
  return {
    id: str(row.id),
    amount: numOrNull(row.amount) ?? 0,
    status: str(row.status).toUpperCase() || "PENDING",
    externalRef: str(row.externalRef),
    transferMode: str(row.transferMode).toUpperCase() || "IMPS",
    accountNumberMasked: str(row.accountNumberMasked),
    ifscCode: str(row.ifscCode).toUpperCase(),
    payeeName: str(row.payeeName),
    openingBalance: numOrNull(row.openingBalance),
    closingBalance: numOrNull(row.closingBalance),
    walletReversed: row.walletReversed === true,
    ipayUuid: strOrNull(row.ipayUuid),
    orderId: strOrNull(row.orderId),
    txnReferenceId: strOrNull(row.txnReferenceId),
    providerMessage: strOrNull(row.providerMessage),
    message: strOrNull(row.message),
    createdAt: strOrNull(row.createdAt),
  };
}

/** Alphanumeric, 8-30 chars, as required by the settlement validator. */
export function createSettlementIdempotencyKey(): string {
  const random =
    typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
      ? crypto.randomUUID().replace(/-/g, "")
      : `${Date.now().toString(36)}${Math.random().toString(36).slice(2)}`;
  return `AES${random}`.replace(/[^A-Za-z0-9]/g, "").slice(0, 30).toUpperCase();
}

export async function settleAepsToBank(input: AepsSettlementInput): Promise<AepsSettlement> {
  const { data } = await api.post(AEPS_SETTLEMENT_ENDPOINTS.settle, {
    amount: input.amount,
    transferMode: input.transferMode,
    latitude: input.latitude,
    longitude: input.longitude,
    remarks: input.remarks || undefined,
    purpose: "OTHERS",
    idempotencyKey: input.idempotencyKey,
  });
  const root = asRecord(data);
  const settlement = normalizeAepsSettlement(root.data ?? root);
  return { ...settlement, message: settlement.message ?? strOrNull(root.message) };
}

export async function fetchAepsSettlements(query: AepsSettlementQuery): Promise<AepsSettlementList> {
  const { data } = await api.get(AEPS_SETTLEMENT_ENDPOINTS.list, {
    params: {
      page: query.page,
      limit: query.limit,
      status: query.status || undefined,
    },
  });
  const root = asRecord(data);
  const items = Array.isArray(root.data) ? root.data.map(normalizeAepsSettlement) : [];
  const pagination = asRecord(root.pagination ?? root.meta);
  const total = numOrNull(pagination.total) ?? items.length;
  const limit = numOrNull(pagination.limit) ?? query.limit;
  return {
    items,
    page: numOrNull(pagination.page) ?? query.page,
    limit,
    total,
    totalPages: numOrNull(pagination.totalPages) ?? Math.max(1, Math.ceil(total / limit)),
  };
}

/** True when the request may have reached the server but no response came back. */
export function isUncertainSettlementError(error: unknown): boolean {
  const status = asRecord(error).status;
  return status == null || (Number(status) >= 500 && Number(status) !== 503);
}

export function aepsSettlementErrorMessage(error: unknown): string {
  const err = asRecord(error);
  const body = asRecord(err.data);
  const fieldErrors = Array.isArray(body.errors) ? body.errors : [];
  return (
    strOrNull(asRecord(fieldErrors[0]).message) ??
    strOrNull(body.message) ??
    strOrNull(err.message) ??
    "AEPS settlement could not be completed."
  );
}

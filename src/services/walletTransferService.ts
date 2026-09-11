import api from "@/src/lib/axios";
import { API_ENDPOINTS } from "@/src/constants/api";

export type WalletTransferRole =
  | "RETAILER"
  | "DISTRIBUTOR"
  | "MASTER_DISTRIBUTOR";

export interface WalletTransferUser {
  id: string;
  userId: string;
  name: string;
  mobile: string;
  userCode: string;
  role: string;
  walletBalance: number;
  status: string;
}

export interface WalletTransferHistoryItem {
  id: string;
  transactionId: string;
  receiverName: string;
  receiverMobile: string;
  amount: number;
  status: string;
  remarks: string;
  createdAt: string;
}

export interface PaginatedResult<T> {
  items: T[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

function pickString(...values: unknown[]): string {
  for (const value of values) {
    if (value == null) continue;
    const text = String(value).trim();
    if (text) return text;
  }
  return "";
}

function pickNumber(...values: unknown[]): number {
  for (const value of values) {
    const num = typeof value === "number" ? value : Number(value);
    if (Number.isFinite(num)) return num;
  }
  return 0;
}

function unwrapRows(payload: unknown): unknown[] {
  const root = asRecord(payload);
  const data = root.data;
  if (Array.isArray(data)) return data;
  const nested = asRecord(data);
  const rows =
    nested.users ||
    nested.items ||
    nested.rows ||
    nested.history ||
    nested.transfers ||
    nested.records ||
    root.users ||
    root.items ||
    root.history;
  return Array.isArray(rows) ? rows : [];
}

function unwrapPagination(payload: unknown, fallbackTotal: number) {
  const root = asRecord(payload);
  const data = asRecord(root.data);
  const pagination = asRecord(data.pagination || root.pagination || data.meta || root.meta);
  const page = pickNumber(pagination.page, 1) || 1;
  const limit = pickNumber(pagination.limit, 20) || 20;
  const total = pickNumber(pagination.total, pagination.totalCount, fallbackTotal);
  const totalPages =
    pickNumber(pagination.totalPages) || Math.max(1, Math.ceil((total || 0) / (limit || 1)));
  return { page, limit, total, totalPages };
}

export function mapWalletTransferUser(row: unknown): WalletTransferUser {
  const rec = asRecord(row);
  const id = pickString(rec.id, rec.userId, rec.uuid);
  return {
    id,
    userId: pickString(rec.userId, rec.id),
    name: pickString(rec.name, rec.fullName, rec.firstName) || "Member",
    mobile: pickString(rec.mobile, rec.phone),
    userCode: pickString(rec.userCode, rec.code),
    role: pickString(rec.role, rec.userType),
    walletBalance: pickNumber(rec.walletBalance, rec.balance),
    status: pickString(rec.status) || "ACTIVE",
  };
}

export function mapWalletTransferHistory(row: unknown): WalletTransferHistoryItem {
  const rec = asRecord(row);
  const receiver = asRecord(rec.receiver);
  return {
    id: pickString(rec.id, rec.transactionId, rec.reference) || `txn_${Date.now()}`,
    transactionId: pickString(
      rec.transactionId,
      rec.reference,
      rec.txnId,
      rec.id
    ),
    receiverName: pickString(
      rec.receiverName,
      receiver.name,
      rec.receiver,
      rec.toName
    ),
    receiverMobile: pickString(rec.receiverMobile, receiver.mobile),
    amount: pickNumber(rec.amount),
    status: pickString(rec.status) || "SUCCESS",
    remarks: pickString(rec.remarks, rec.remark, rec.description),
    createdAt: pickString(rec.createdAt, rec.date, rec.transferredAt),
  };
}

export async function fetchWalletTransferUsers(input: {
  role: WalletTransferRole;
  search?: string;
  page?: number;
  limit?: number;
}): Promise<PaginatedResult<WalletTransferUser>> {
  const params: Record<string, string | number> = {
    role: input.role,
    page: input.page ?? 1,
    limit: input.limit ?? 40,
    status: "ACTIVE",
  };
  if (input.search?.trim()) params.search = input.search.trim();

  const response = await api.get(API_ENDPOINTS.walletPeerTransferUsers, { params });
  const payload = response.data;
  const items = unwrapRows(payload)
    .map(mapWalletTransferUser)
    .filter((row) => row.id && (!row.role || row.role === input.role));
  return { items, ...unwrapPagination(payload, items.length) };
}

export async function fetchWalletTransferHistory(input: {
  page?: number;
  limit?: number;
  search?: string;
} = {}): Promise<PaginatedResult<WalletTransferHistoryItem>> {
  const params: Record<string, string | number> = {
    page: input.page ?? 1,
    limit: input.limit ?? 10,
  };
  if (input.search?.trim()) params.search = input.search.trim();

  const response = await api.get(API_ENDPOINTS.walletPeerTransferHistory, { params });
  const payload = response.data;
  const items = unwrapRows(payload).map(mapWalletTransferHistory);
  return { items, ...unwrapPagination(payload, items.length) };
}

export async function submitWalletTransfer(input: {
  receiverId: string;
  amount: number;
  remarks?: string;
  mpin?: string;
}): Promise<{ transactionId?: string; amount?: number; status?: string; message?: string }> {
  const idempotencyKey =
    typeof crypto !== "undefined" && crypto.randomUUID
      ? crypto.randomUUID().replace(/-/g, "").slice(0, 24)
      : `w2w${Date.now()}${Math.random().toString(16).slice(2, 10)}`;

  const body: Record<string, string | number> = {
    receiverId: input.receiverId,
    amount: input.amount,
    remarks: input.remarks?.trim() || "Balance transfer",
    idempotencyKey,
  };
  if (input.mpin) body.mpin = input.mpin;

  const response = await api.post(API_ENDPOINTS.walletPeerTransfer, body, {
    headers: { "Idempotency-Key": idempotencyKey },
  });
  const root = asRecord(response.data);
  const data = asRecord(root.data);
  return {
    transactionId: pickString(data.transactionId, root.transactionId),
    amount: pickNumber(data.amount, input.amount),
    status: pickString(data.status, "SUCCESS"),
    message: pickString(root.message, "Balance transferred successfully"),
  };
}

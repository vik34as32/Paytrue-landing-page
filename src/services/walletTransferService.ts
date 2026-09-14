import api from "@/src/lib/axios";
import { API_ENDPOINTS } from "@/src/constants/api";

export type WalletTransferRole =
  | "RETAILER"
  | "DISTRIBUTOR"
  | "MASTER_DISTRIBUTOR";

/** Allowed receivers by sender role. Listing still comes from JWT-scoped APIs. */
export const TRANSFER_TARGET_ROLES: Record<WalletTransferRole, WalletTransferRole[]> = {
  RETAILER: ["RETAILER", "DISTRIBUTOR"],
  DISTRIBUTOR: ["RETAILER", "DISTRIBUTOR"],
  MASTER_DISTRIBUTOR: ["RETAILER", "DISTRIBUTOR", "MASTER_DISTRIBUTOR"],
};

export function normalizeWalletTransferRole(value: string): WalletTransferRole | "" {
  const key = String(value || "")
    .trim()
    .toUpperCase()
    .replace(/[\s-]+/g, "_");
  if (key === "RT" || key === "RETAILER") return "RETAILER";
  if (key === "DD" || key === "DISTRIBUTOR") return "DISTRIBUTOR";
  if (key === "MD" || key === "MASTER_DISTRIBUTOR" || key === "MASTERDISTRIBUTOR") {
    return "MASTER_DISTRIBUTOR";
  }
  return "";
}

function isInactiveStatus(status: string) {
  const key = status.trim().toUpperCase();
  return ["INACTIVE", "BLOCKED", "SUSPENDED", "DISABLED", "REJECTED"].includes(key);
}

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

async function fetchUsersByTypePage(
  userType: WalletTransferRole,
  search?: string,
  page = 1,
  limit = 100
): Promise<{ items: WalletTransferUser[]; totalPages: number; total: number }> {
  const params: Record<string, string | number> = {
    page,
    limit,
    userType,
  };
  if (search?.trim()) params.search = search.trim();

  const response = await api.get(API_ENDPOINTS.users, { params });
  const items = unwrapRows(response.data)
    .map((row) => {
      const mapped = mapWalletTransferUser(row);
      return {
        ...mapped,
        role: normalizeWalletTransferRole(mapped.role) || userType,
      };
    })
    .filter((row) => row.id);
  const pagination = unwrapPagination(response.data, items.length);
  return {
    items,
    totalPages: pagination.totalPages,
    total: pagination.total,
  };
}

async function fetchUsersByType(
  userType: WalletTransferRole,
  search?: string,
  page = 1,
  limit = 100
): Promise<WalletTransferUser[]> {
  const result = await fetchUsersByTypePage(userType, search, page, limit);
  return result.items;
}

/** Load every page for a userType so hierarchy dropdowns are complete. */
async function fetchAllUsersByType(
  userType: WalletTransferRole,
  search?: string,
  pageSize = 100
): Promise<WalletTransferUser[]> {
  const first = await fetchUsersByTypePage(userType, search, 1, pageSize);
  const items = [...first.items];
  const totalPages = Math.max(1, first.totalPages || 1);
  const maxPages = Math.min(totalPages, 50);

  for (let page = 2; page <= maxPages; page += 1) {
    const next = await fetchUsersByTypePage(userType, search, page, pageSize);
    items.push(...next.items);
    if (!next.items.length) break;
  }
  return items;
}

async function fetchSameRolePeers(
  role: WalletTransferRole,
  search?: string,
  page = 1,
  limit = 100
): Promise<WalletTransferUser[]> {
  const params: Record<string, string | number> = {
    role,
    page,
    limit,
    status: "ACTIVE",
  };
  if (search?.trim()) params.search = search.trim();

  const response = await api.get(API_ENDPOINTS.walletPeerTransferUsers, { params });
  return unwrapRows(response.data)
    .map((row) => {
      const mapped = mapWalletTransferUser(row);
      return {
        ...mapped,
        role: normalizeWalletTransferRole(mapped.role) || role,
      };
    })
    .filter((row) => row.id);
}

async function safeList(loader: () => Promise<WalletTransferUser[]>): Promise<WalletTransferUser[]> {
  try {
    return await loader();
  } catch {
    return [];
  }
}

function mobileMatchesDigits(mobile: string | undefined, digits: string): boolean {
  if (!digits) return false;
  const normalized = String(mobile || "").replace(/\D/g, "");
  return normalized.includes(digits);
}

export async function fetchWalletTransferUsers(input: {
  role: WalletTransferRole;
  search?: string;
  page?: number;
  limit?: number;
  /** Override default TRANSFER_TARGET_ROLES for this sender */
  targetRoles?: WalletTransferRole[];
  /** Paginate through all hierarchy pages (for Balance Transfer dropdowns) */
  fetchAll?: boolean;
}): Promise<PaginatedResult<WalletTransferUser>> {
  const senderRole = normalizeWalletTransferRole(input.role) || input.role;
  const targetRoles =
    input.targetRoles?.length
      ? input.targetRoles
      : TRANSFER_TARGET_ROLES[senderRole] ?? [senderRole];
  const page = input.page ?? 1;
  const limit = input.limit ?? 100;
  const search = input.search?.trim() || "";
  const searchDigits = search.replace(/\D/g, "");
  const isNumberSearch =
    searchDigits.length >= 3 && /^\d[\d\s+-]*$/.test(search);
  const fetchAll = Boolean(input.fetchAll) && !isNumberSearch;

  const allowed = new Set(targetRoles);

  const collectAllowed = (rows: WalletTransferUser[]) => {
    const seen = new Set<string>();
    const items: WalletTransferUser[] = [];
    for (const row of rows) {
      if (!row.id || seen.has(row.id)) continue;
      if (isInactiveStatus(row.status)) continue;
      const role = normalizeWalletTransferRole(row.role) || row.role;
      if (role && !allowed.has(role as WalletTransferRole)) continue;
      // Number search: ONLY users whose mobile contains the typed digits
      if (isNumberSearch && !mobileMatchesDigits(row.mobile, searchDigits)) {
        continue;
      }
      seen.add(row.id);
      items.push({ ...row, role });
    }
    return items;
  };

  // Number search → hierarchy-scoped /users/search (partial mobile match)
  if (isNumberSearch) {
    try {
      const response = await api.get(API_ENDPOINTS.usersSearch, {
        params: {
          number: searchDigits,
          page: 1,
          limit: Math.max(limit, 50),
        },
      });
      const items = collectAllowed(
        unwrapRows(response.data).map((row) => {
          const mapped = mapWalletTransferUser(row);
          return {
            ...mapped,
            role: normalizeWalletTransferRole(mapped.role) || mapped.role,
          };
        })
      );
      return { items, page: 1, limit, total: items.length, totalPages: 1 };
    } catch {
      // Fallback: load allowed targets, then keep ONLY mobile matches
      const lists = await Promise.all([
        ...targetRoles.map((userType) =>
          safeList(() => fetchUsersByType(userType, undefined, page, limit))
        ),
        // Same-role peers only when peer role is in targetRoles
        targetRoles.includes(senderRole)
          ? safeList(() => fetchSameRolePeers(senderRole, undefined, page, limit))
          : Promise.resolve([]),
      ]);
      const items = collectAllowed(lists.flat());
      return { items, page: 1, limit, total: items.length, totalPages: 1 };
    }
  }

  const lists = await Promise.all([
    ...targetRoles.map((userType) =>
      safeList(() =>
        fetchAll
          ? fetchAllUsersByType(userType, search || undefined, limit)
          : fetchUsersByType(userType, search || undefined, page, limit)
      )
    ),
    targetRoles.includes(senderRole)
      ? safeList(() => fetchSameRolePeers(senderRole, search || undefined, page, limit))
      : Promise.resolve([]),
  ]);

  const items = collectAllowed(lists.flat());

  return {
    items,
    page: fetchAll ? 1 : page,
    limit,
    total: items.length,
    totalPages: 1,
  };
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

function parseTransferResponse(
  payload: unknown,
  amount: number
): { transactionId?: string; amount?: number; status?: string; message?: string } {
  const root = asRecord(payload);
  const data = asRecord(root.data);
  return {
    transactionId: pickString(data.transactionId, root.transactionId),
    amount: pickNumber(data.amount, amount),
    status: pickString(data.status, "SUCCESS"),
    message: pickString(root.message, "Balance transferred successfully"),
  };
}

async function postHierarchyTransfer(input: {
  receiverId: string;
  amount: number;
  remarks: string;
  mpin?: string;
  idempotencyKey: string;
}) {
  const body: Record<string, string | number> = {
    receiverId: input.receiverId,
    amount: input.amount,
    description: input.remarks,
    remarks: input.remarks,
    idempotencyKey: input.idempotencyKey,
  };
  if (input.mpin) body.mpin = input.mpin;

  const response = await api.post(API_ENDPOINTS.walletTransfer, body, {
    headers: { "Idempotency-Key": input.idempotencyKey },
  });
  return parseTransferResponse(response.data, input.amount);
}

async function postPeerTransfer(input: {
  receiverId: string;
  amount: number;
  remarks: string;
  mpin?: string;
  idempotencyKey: string;
}) {
  const body: Record<string, string | number> = {
    receiverId: input.receiverId,
    amount: input.amount,
    remarks: input.remarks,
    idempotencyKey: input.idempotencyKey,
  };
  if (input.mpin) body.mpin = input.mpin;

  const response = await api.post(API_ENDPOINTS.walletPeerTransfer, body, {
    headers: { "Idempotency-Key": input.idempotencyKey },
  });
  return parseTransferResponse(response.data, input.amount);
}

export async function submitWalletTransfer(input: {
  receiverId: string;
  amount: number;
  remarks?: string;
  mpin?: string;
  senderRole?: string;
  receiverRole?: string;
}): Promise<{ transactionId?: string; amount?: number; status?: string; message?: string }> {
  const idempotencyKey =
    typeof crypto !== "undefined" && crypto.randomUUID
      ? crypto.randomUUID().replace(/-/g, "").slice(0, 24)
      : `w2w${Date.now()}${Math.random().toString(16).slice(2, 10)}`;

  const remarks = input.remarks?.trim() || "Balance transfer";
  const senderRole = normalizeWalletTransferRole(input.senderRole || "");
  const receiverRole = normalizeWalletTransferRole(input.receiverRole || "");
  const sameRole = Boolean(senderRole && receiverRole && senderRole === receiverRole);

  const payload = {
    receiverId: input.receiverId,
    amount: input.amount,
    remarks,
    mpin: input.mpin,
    idempotencyKey,
  };

  // Same-role (RT→RT, DD→DD, MD→MD) uses /wallet-transfer.
  // Cross-role hierarchy (MD→DD, MD→RT, DD→RT) uses the existing /wallet/transfer API.
  if (!sameRole) {
    return postHierarchyTransfer(payload);
  }

  try {
    return await postPeerTransfer(payload);
  } catch (error) {
    const status = Number((error as { status?: number })?.status);
    const message = String((error as { message?: string })?.message || "").toLowerCase();
    const shouldFallback =
      status === 404 ||
      status === 405 ||
      /same role|same-role|role mismatch|receiver role|user type|not allowed|unauthorized|hierarchy/.test(
        message
      );
    if (!shouldFallback) throw error;
    return postHierarchyTransfer(payload);
  }
}

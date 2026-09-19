import api from "@/src/lib/axios";
import { API_ENDPOINTS } from "@/src/constants/api";
import { fetchUserById } from "@/src/services/profileApi";
import {
  extractCommissionLedgerRows,
  extractCommissionPagination,
  extractCommissionWalletType,
  normalizeCommissionLedgerEntry,
  normalizeCommissionWallet,
} from "@/src/lib/commissionUtils";
import { getUserDisplayName } from "@/src/lib/userUtils";
import type {
  CommissionLedgerFilters,
  CommissionLedgerResult,
  CommissionTopupRequest,
  CommissionWallet,
  CommissionLedgerEntry,
} from "@/src/types/commission";
import { COMMISSION_TRANSFER_REMARKS } from "@/src/types/commission";

export async function fetchCommissionWallet(): Promise<CommissionWallet> {
  const response = await api.get(API_ENDPOINTS.walletCommission);
  return normalizeCommissionWallet(response.data);
}

/** Strip commission suffix → original service txn reference. */
function extractSourceTxnReference(reference: string): string {
  const raw = String(reference || "").trim();
  if (!raw) return "";
  return raw
    .replace(/-COMM-(DST|RET|MD|RTL|DIST).*$/i, "")
    .replace(/-COMMISSION.*$/i, "")
    .trim();
}

type RetailerInfo = {
  retailerId: string;
  retailerName: string;
  retailerMobile: string;
  retailerCode: string;
};

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

function pickStr(...vals: unknown[]): string {
  for (const v of vals) {
    if (typeof v === "string" && v.trim()) return v.trim();
    if (typeof v === "number" && Number.isFinite(v)) return String(v);
  }
  return "";
}

function retailerFromUserRecord(
  user: Record<string, unknown>,
  fallbackId = ""
): RetailerInfo {
  const id = pickStr(user.id, user.userId, fallbackId);
  const name = getUserDisplayName(user, "");
  const mobile = pickStr(user.mobile, user.phone, user.phoneNumber);
  const code = pickStr(user.userCode, user.retailerCode, user.code);
  return {
    retailerId: id,
    retailerName: name === "—" ? "" : name,
    retailerMobile: mobile,
    retailerCode: code,
  };
}

function retailerFromLedgerRow(row: Record<string, unknown>): RetailerInfo | null {
  const nested = asRecord(row.retailer || row.user || row.createdBy);
  const id = pickStr(
    row.retailerId,
    row.userId,
    row.sourceUserId,
    nested.id,
    nested.userId
  );
  const name = pickStr(
    row.retailerName,
    nested.name,
    nested.fullName,
    [nested.firstName, nested.lastName].filter(Boolean).join(" ").trim(),
    nested.firstName
  );
  const mobile = pickStr(
    row.retailerMobile,
    nested.mobile,
    nested.phone,
    nested.phoneNumber,
    row.mobile
  );
  const code = pickStr(
    row.retailerCode,
    nested.userCode,
    nested.retailerCode,
    nested.code
  );

  if (!id && !name && !mobile) return null;
  return {
    retailerId: id,
    retailerName: name,
    retailerMobile: mobile,
    retailerCode: code,
  };
}

async function resolveRetailerByUserId(
  userId: string,
  cache: Map<string, RetailerInfo | null>
): Promise<RetailerInfo | null> {
  const id = String(userId || "").trim();
  if (!id) return null;
  if (cache.has(id)) return cache.get(id) || null;

  try {
    const user = await fetchUserById(id);
    const info = retailerFromUserRecord(user, id);
    if (info.retailerName || info.retailerMobile || info.retailerCode) {
      cache.set(id, info);
      return info;
    }
  } catch {
    /* user may be inaccessible */
  }
  cache.set(id, null);
  return null;
}

/** Search downline ledger by source txn ref (no UI hide-filters). */
async function resolveRetailerByTxnReference(
  reference: string,
  cache: Map<string, RetailerInfo | null>
): Promise<RetailerInfo | null> {
  const sourceRef = extractSourceTxnReference(reference);
  if (!sourceRef || sourceRef.length < 6) return null;

  const cacheKey = `ref:${sourceRef}`;
  if (cache.has(cacheKey)) return cache.get(cacheKey) || null;

  try {
    const response = await api.get(API_ENDPOINTS.downlineRetailerLedger, {
      params: { search: sourceRef, page: 1, limit: 20 },
    });
    const body = asRecord(response.data);
    const data = body.data;
    let rows: unknown[] = [];
    if (Array.isArray(data)) {
      rows = data;
    } else if (data && typeof data === "object") {
      const rec = data as Record<string, unknown>;
      const numeric = Object.keys(rec)
        .filter((k) => /^\d+$/.test(k))
        .sort((a, b) => Number(a) - Number(b));
      if (numeric.length) {
        rows = numeric.map((k) => rec[k]);
      } else {
        for (const key of ["transactions", "items", "rows", "records"]) {
          if (Array.isArray(rec[key])) {
            rows = rec[key] as unknown[];
            break;
          }
        }
      }
    }

    const sourceUpper = sourceRef.toUpperCase();
    const matched =
      rows
        .map((r) => asRecord(r))
        .find((row) => {
          const hay = [
            row.reference,
            row.referenceId,
            row.referenceNo,
            row.txnReference,
            row.transactionId,
            row.clientTxnId,
            row.narration,
            row.remarks,
          ]
            .map((v) => String(v || "").toUpperCase())
            .join(" ");
          return hay.includes(sourceUpper);
        }) || asRecord(rows[0]);

    const info = retailerFromLedgerRow(matched);
    cache.set(cacheKey, info);
    if (info?.retailerId) cache.set(info.retailerId, info);
    return info;
  } catch {
    cache.set(cacheKey, null);
    return null;
  }
}

function candidateRetailerUserId(
  entry: CommissionLedgerEntry,
  raw: Record<string, unknown>
): string {
  return pickStr(
    raw.retailerId,
    raw.sourceUserId,
    raw.sourceRetailerId,
    raw.fromUserId,
    raw.childUserId,
    entry.retailerId
  );
}

/**
 * Enrich commission rows with retailer name/mobile/code.
 * 1) retailerId / sourceUserId → GET /users/:id
 * 2) source txn reference (…-COMM-DST) → downline ledger → retailerId → users API
 */
async function enrichCommissionEntriesWithRetailers(
  items: CommissionLedgerEntry[],
  rawRows: unknown[]
): Promise<CommissionLedgerEntry[]> {
  const cache = new Map<string, RetailerInfo | null>();

  // Pre-resolve unique refs & user ids in parallel
  const refsToResolve = new Set<string>();
  const userIdsToResolve = new Set<string>();

  items.forEach((entry, i) => {
    if (
      entry.creditDebit === "DEBIT" &&
      !/COMMISSION/i.test(`${entry.type || ""} ${entry.remarks || ""}`)
    ) {
      return;
    }
    if (entry.retailerName && entry.retailerMobile) return;

    const raw = asRecord(rawRows[i]);
    const uid = candidateRetailerUserId(entry, raw);
    if (uid) userIdsToResolve.add(uid);

    const sourceRef = extractSourceTxnReference(entry.reference);
    if (sourceRef.length >= 6) refsToResolve.add(entry.reference);
  });

  await Promise.all([
    ...[...userIdsToResolve].map((id) => resolveRetailerByUserId(id, cache)),
    ...[...refsToResolve].map((ref) => resolveRetailerByTxnReference(ref, cache)),
  ]);

  // Second pass: any retailerIds found via ref that still need name/mobile
  const followUpIds = new Set<string>();
  for (const ref of refsToResolve) {
    const info = cache.get(`ref:${extractSourceTxnReference(ref)}`);
    if (info?.retailerId && (!info.retailerName || !info.retailerMobile)) {
      followUpIds.add(info.retailerId);
    }
  }
  await Promise.all(
    [...followUpIds].map((id) => resolveRetailerByUserId(id, cache))
  );

  return items.map((entry, i) => {
    if (entry.retailerName && entry.retailerMobile) return entry;

    const isSettlementDebit =
      entry.creditDebit === "DEBIT" &&
      !/COMMISSION/i.test(
        `${entry.type || ""} ${entry.remarks || ""} ${entry.reference || ""}`
      );
    if (isSettlementDebit) return entry;

    const raw = asRecord(rawRows[i]);
    let info: RetailerInfo | null = null;

    const uid = candidateRetailerUserId(entry, raw);
    if (uid) info = cache.get(uid) || null;

    if ((!info || !info.retailerName) && entry.reference) {
      const fromRef =
        cache.get(`ref:${extractSourceTxnReference(entry.reference)}`) || null;
      if (fromRef) {
        info = {
          retailerId: fromRef.retailerId || info?.retailerId || "",
          retailerName: fromRef.retailerName || info?.retailerName || "",
          retailerMobile: fromRef.retailerMobile || info?.retailerMobile || "",
          retailerCode: fromRef.retailerCode || info?.retailerCode || "",
        };
      }
    }

    if (info?.retailerId && (!info.retailerName || !info.retailerMobile)) {
      const fromUser = cache.get(info.retailerId);
      if (fromUser) {
        info = {
          retailerId: info.retailerId,
          retailerName: info.retailerName || fromUser.retailerName,
          retailerMobile: info.retailerMobile || fromUser.retailerMobile,
          retailerCode: info.retailerCode || fromUser.retailerCode,
        };
      }
    }

    if (!info) return entry;

    return {
      ...entry,
      retailerId: info.retailerId || entry.retailerId,
      retailerName: info.retailerName || entry.retailerName,
      retailerMobile: info.retailerMobile || entry.retailerMobile,
      retailerCode: info.retailerCode || entry.retailerCode,
    };
  });
}

export async function fetchCommissionLedger(
  filters: CommissionLedgerFilters = {}
): Promise<CommissionLedgerResult> {
  const params: Record<string, string | number> = {
    page: filters.page ?? 1,
    limit: filters.limit ?? 20,
  };
  if (filters.search?.trim()) params.search = filters.search.trim();
  if (filters.dateFrom) params.dateFrom = filters.dateFrom;
  if (filters.dateTo) params.dateTo = filters.dateTo;

  const response = await api.get(API_ENDPOINTS.walletCommissionLedger, { params });
  const rows = extractCommissionLedgerRows(response.data);
  const walletType = extractCommissionWalletType(response.data);
  const items = rows.map((row) => {
    const entry = normalizeCommissionLedgerEntry(row);
    return {
      ...entry,
      walletType: entry.walletType || walletType || "COMMISSION",
    };
  });

  const enrichedItems = await enrichCommissionEntriesWithRetailers(items, rows);

  const pagination = extractCommissionPagination(response.data, {
    page: Number(params.page) || 1,
    limit: Number(params.limit) || 20,
    total: enrichedItems.length,
  });

  return {
    items: enrichedItems,
    pagination,
    walletType,
  };
}

/** Fetch every page for full Excel / PDF / print exports. */
export async function fetchAllCommissionLedger(
  filters: Omit<CommissionLedgerFilters, "page" | "limit"> = {}
): Promise<CommissionLedgerEntry[]> {
  const pageSize = 100;
  const first = await fetchCommissionLedger({
    ...filters,
    page: 1,
    limit: pageSize,
  });

  const all = [...first.items];
  const totalPages = first.pagination.totalPages || 1;

  for (let page = 2; page <= totalPages; page += 1) {
    const next = await fetchCommissionLedger({
      ...filters,
      page,
      limit: pageSize,
    });
    all.push(...next.items);
  }

  return all;
}

export async function topupCommissionToMainWallet(
  payload: CommissionTopupRequest
): Promise<unknown> {
  const response = await api.post(API_ENDPOINTS.walletCommissionTransferToMain, {
    amount: payload.amount,
    remarks: COMMISSION_TRANSFER_REMARKS,
  });
  return response.data?.data ?? response.data;
}

import { DMT_ENDPOINTS } from "@/src/constants/dmtApi";
import { AEPS_ENDPOINTS } from "@/src/constants/aepsApi";
import { UPI_ATM_ENDPOINTS } from "@/src/constants/upiAtmApi";
import api from "@/src/lib/axios";
import { unwrapApiData } from "@/src/lib/dmtUtils";
import {
  mapAepsToStatement,
  mapDmtToStatement,
  mapUpiAtmToStatement,
  mergeStatementTransactions,
} from "@/src/lib/statementMappers";
import type { StatementTransaction } from "@/types/statementReceipt";

export interface StatementFetchOptions {
  page?: number;
  limit?: number;
}

export interface RetailerStatementResult {
  transactions: StatementTransaction[];
  errors: string[];
  totals: {
    dmt: number;
    upiAtm: number;
    aeps: number;
    all: number;
  };
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

function extractErrorMessage(reason: unknown, fallback: string): string {
  const err = reason as {
    message?: string;
    data?: { message?: string };
  };
  return err?.data?.message || err?.message || fallback;
}

function parseDmtRows(payload: unknown): StatementTransaction[] {
  const data = unwrapApiData<Record<string, unknown>>(payload) ?? {};
  const rows = Array.isArray(data)
    ? data
    : ((data.transactions as unknown[]) ?? []);

  return (rows as Record<string, unknown>[]).map(mapDmtToStatement);
}

function parseUpiAtmRows(payload: unknown): StatementTransaction[] {
  const root = asRecord(payload);
  const rows = Array.isArray(root.data)
    ? root.data
    : ((unwrapApiData<unknown[]>(payload) as unknown[]) ?? []);

  return (rows as Record<string, unknown>[]).map(mapUpiAtmToStatement);
}

function parseAepsRows(payload: unknown): StatementTransaction[] {
  const data = unwrapApiData<Record<string, unknown>>(payload) ?? {};
  const rows = Array.isArray(data)
    ? data
    : ((data.records as unknown[]) ?? []);

  return (rows as Record<string, unknown>[]).map(mapAepsToStatement);
}

export async function fetchRetailerStatement(
  options: StatementFetchOptions = {}
): Promise<RetailerStatementResult> {
  const page = options.page ?? 1;
  const limit = options.limit ?? 100;
  const params = { page, limit };

  const [dmtResult, upiResult, aepsResult] = await Promise.allSettled([
    api.get(DMT_ENDPOINTS.transactions, { params }),
    api.get(UPI_ATM_ENDPOINTS.history, { params }),
    api.get(AEPS_ENDPOINTS.ledger, { params }),
  ]);

  const errors: string[] = [];
  const dmtRows =
    dmtResult.status === "fulfilled"
      ? parseDmtRows(dmtResult.value.data)
      : (errors.push(extractErrorMessage(dmtResult.reason, "DMT history failed")),
        []);

  const upiRows =
    upiResult.status === "fulfilled"
      ? parseUpiAtmRows(upiResult.value.data)
      : (errors.push(
          extractErrorMessage(upiResult.reason, "UPI ATM history failed")
        ),
        []);

  const aepsRows =
    aepsResult.status === "fulfilled"
      ? parseAepsRows(aepsResult.value.data)
      : (errors.push(extractErrorMessage(aepsResult.reason, "AEPS ledger failed")),
        []);

  const transactions = mergeStatementTransactions([
    ...dmtRows,
    ...upiRows,
    ...aepsRows,
  ]);

  return {
    transactions,
    errors,
    totals: {
      dmt: dmtRows.length,
      upiAtm: upiRows.length,
      aeps: aepsRows.length,
      all: transactions.length,
    },
  };
}

import api from "@/src/lib/axios";
import { API_ENDPOINTS } from "@/src/constants/api";
import type {
  DistributorBusinessResponse,
  DistributorDashboardMetrics,
  DistributorStatsResponse,
} from "@/src/types/distributorDashboard";

function unwrapApiData<T>(response: { data?: unknown }): T {
  const root = response.data as { data?: T } | T;
  if (root && typeof root === "object" && "data" in root && root.data !== undefined) {
    return root.data as T;
  }
  return root as T;
}

function toNumber(value: unknown): number {
  const num = Number(value);
  return Number.isFinite(num) ? num : 0;
}

function isToday(isoDate: string): boolean {
  if (!isoDate) return false;
  return new Date(isoDate).toDateString() === new Date().toDateString();
}

function isCommissionCredit(txn: Record<string, unknown>): boolean {
  const type = String(txn.type || txn.transactionType || "").toUpperCase();
  if (type && type !== "CREDIT") return false;

  const text = [
    txn.description,
    txn.remarks,
    txn.category,
    txn.purpose,
    txn.referenceType,
    txn.source,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  return text.includes("commission") || text.includes("comm");
}

async function fetchTodayCommissionFallback(): Promise<number> {
  try {
    const response = await api.get(`${API_ENDPOINTS.wallet}/transactions`, {
      params: { page: 1, limit: 100 },
    });
    const payload = unwrapApiData<Record<string, unknown>>(response);
    const rows = Array.isArray(payload?.transactions)
      ? (payload.transactions as Record<string, unknown>[])
      : [];

    return rows.reduce((sum, txn) => {
      if (!isToday(String(txn.createdAt || ""))) return sum;
      if (!isCommissionCredit(txn)) return sum;
      return sum + toNumber(txn.amount);
    }, 0);
  } catch {
    return 0;
  }
}

export async function fetchDistributorDashboardMetrics(): Promise<DistributorDashboardMetrics> {
  const [businessRes, statsRes] = await Promise.all([
    api.get(API_ENDPOINTS.dashboardBusiness),
    api.get(API_ENDPOINTS.dashboardStats),
  ]);

  const business = unwrapApiData<DistributorBusinessResponse>(businessRes);
  const stats = unwrapApiData<DistributorStatsResponse>(statsRes);

  const totalCommission = toNumber(
    stats.commissionEarned?.total ?? stats.totalCommission
  );

  let todayCommission = toNumber(
    stats.commissionEarned?.today ?? stats.todayCommission
  );

  if (!todayCommission) {
    todayCommission = await fetchTodayCommissionFallback();
  }

  return {
    totalBusiness: toNumber(business.business?.total),
    todayBusiness: toNumber(business.business?.today),
    monthlyBusiness: toNumber(business.business?.monthly),
    todayCommission,
    totalCommission,
  };
}

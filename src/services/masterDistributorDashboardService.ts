import api from "@/src/lib/axios";
import { API_ENDPOINTS } from "@/src/constants/api";
import type {
  MasterDistributorBusinessResponse,
  MasterDistributorDashboardMetrics,
} from "@/src/types/masterDistributorDashboard";

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

function computeNetworkStats(users: Record<string, unknown>[] = []) {
  const today = new Date().toDateString();
  const distributors = users.filter((user) => user.userType === "DISTRIBUTOR");
  const active = distributors.filter(
    (user) => user.status !== "inactive" && user.isActive !== false
  );
  const inactive = distributors.filter(
    (user) => user.status === "inactive" || user.isActive === false
  );
  const todayCreated = distributors.filter(
    (user) => user.createdAt && new Date(String(user.createdAt)).toDateString() === today
  );

  return {
    totalDistributors: distributors.length,
    activeDistributors: active.length,
    inactiveDistributors: inactive.length,
    todayDistributors: todayCreated.length,
    recentDistributors: distributors.slice(0, 5),
    recentLogins: distributors
      .filter((user) => user.lastLoginAt)
      .sort(
        (a, b) =>
          new Date(String(b.lastLoginAt)).getTime() -
          new Date(String(a.lastLoginAt)).getTime()
      )
      .slice(0, 5),
  };
}

export async function fetchMasterDistributorDashboardMetrics(): Promise<MasterDistributorDashboardMetrics> {
  const [businessRes, usersRes] = await Promise.all([
    api.get(API_ENDPOINTS.dashboardBusiness),
    api.get(API_ENDPOINTS.users, {
      params: { page: 1, limit: 100, userType: "DISTRIBUTOR" },
    }),
  ]);

  const businessPayload = unwrapApiData<MasterDistributorBusinessResponse>(businessRes);
  const usersPayload = unwrapApiData<Record<string, unknown>>(usersRes);
  const users = Array.isArray(usersPayload)
    ? usersPayload
    : ((usersPayload?.users ||
        usersPayload?.items ||
        usersPayload?.data ||
        []) as Record<string, unknown>[]);

  const network = computeNetworkStats(users);
  const business = businessPayload?.business || {};

  return {
    ...network,
    todayBusiness: toNumber(business.today),
    monthlyBusiness: toNumber(business.monthly),
    yearlyBusiness: toNumber(business.yearly),
    totalBusiness: toNumber(business.total),
    retailerCount: toNumber(businessPayload?.meta?.retailerCount),
    breakdown: businessPayload?.breakdown || [],
  };
}

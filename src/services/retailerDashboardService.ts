import api from "@/src/lib/axios";
import { API_ENDPOINTS } from "@/src/constants/api";
import type {
  RetailerBusinessStats,
  RetailerDashboardData,
} from "@/src/types/retailerDashboard";

function unwrapApiData<T>(response: { data?: unknown }): T {
  const root = response.data as { data?: T } | T;
  if (root && typeof root === "object" && "data" in root && root.data !== undefined) {
    return root.data as T;
  }
  return root as T;
}

export async function fetchRetailerDashboard(): Promise<RetailerDashboardData> {
  const response = await api.get(API_ENDPOINTS.dashboardRetailer);
  return unwrapApiData<RetailerDashboardData>(response);
}

export async function fetchRetailerBusinessStats(): Promise<RetailerBusinessStats> {
  const response = await api.get(API_ENDPOINTS.dashboardBusiness);
  return unwrapApiData<RetailerBusinessStats>(response);
}

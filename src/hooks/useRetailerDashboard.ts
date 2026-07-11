"use client";

import { useQuery } from "@tanstack/react-query";
import {
  fetchRetailerBusinessStats,
  fetchRetailerDashboard,
} from "@/src/services/retailerDashboardService";

export const RETAILER_DASHBOARD_KEY = ["retailer", "dashboard"] as const;
export const RETAILER_BUSINESS_KEY = ["retailer", "dashboard", "business"] as const;

export function useRetailerDashboard() {
  const dashboardQuery = useQuery({
    queryKey: RETAILER_DASHBOARD_KEY,
    queryFn: fetchRetailerDashboard,
    staleTime: 60_000,
    refetchOnWindowFocus: true,
  });

  const businessQuery = useQuery({
    queryKey: RETAILER_BUSINESS_KEY,
    queryFn: fetchRetailerBusinessStats,
    staleTime: 60_000,
    refetchOnWindowFocus: true,
  });

  return {
    dashboard: dashboardQuery.data,
    business: businessQuery.data,
    isLoading: dashboardQuery.isLoading || businessQuery.isLoading,
    isFetching: dashboardQuery.isFetching || businessQuery.isFetching,
    isError: dashboardQuery.isError || businessQuery.isError,
    error:
      (dashboardQuery.error as Error | null)?.message ||
      (businessQuery.error as Error | null)?.message ||
      null,
    refetch: async () => {
      await Promise.all([dashboardQuery.refetch(), businessQuery.refetch()]);
    },
  };
}

"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchDistributorDashboardMetrics } from "@/src/services/distributorDashboardService";

export const DISTRIBUTOR_DASHBOARD_KEY = ["distributor", "dashboard"] as const;

export function useDistributorDashboard() {
  return useQuery({
    queryKey: DISTRIBUTOR_DASHBOARD_KEY,
    queryFn: fetchDistributorDashboardMetrics,
    staleTime: 60_000,
    refetchOnWindowFocus: true,
  });
}

"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchMasterDistributorDashboardMetrics } from "@/src/services/masterDistributorDashboardService";

export const MASTER_DISTRIBUTOR_DASHBOARD_KEY = ["master-distributor", "dashboard"] as const;

export function useMasterDistributorDashboard() {
  return useQuery({
    queryKey: MASTER_DISTRIBUTOR_DASHBOARD_KEY,
    queryFn: fetchMasterDistributorDashboardMetrics,
    staleTime: 60_000,
    refetchOnWindowFocus: true,
  });
}

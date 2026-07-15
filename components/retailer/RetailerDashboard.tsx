"use client";

import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import NewsBar from "@/components/retailer/NewsBar";
import BiometricKycDashboardCard from "@/components/biometric/BiometricKycDashboardCard";
import DashboardHeader from "@/components/retailer/DashboardHeader";
import DashboardStats from "@/components/retailer/DashboardStats";
import BusinessVolumePanel from "@/components/retailer/BusinessVolumePanel";
import QuickActions from "@/components/retailer/QuickActions";
import ServiceGrid from "@/components/retailer/ServiceGrid";
import CommissionBalanceCard from "@/src/components/commission/CommissionBalanceCard";
import { useCommissionWallet } from "@/src/hooks/useCommission";
import { useRetailerDashboard } from "@/src/hooks/useRetailerDashboard";

function RetailerDashboardContent() {
  const { dashboard, business, isLoading, isFetching, isError, error, refetch } =
    useRetailerDashboard();
  const commissionQuery = useCommissionWallet();

  return (
    <div className="w-full space-y-4 sm:space-y-5">
      <NewsBar />
      <DashboardHeader dashboard={dashboard} loading={isLoading} />
      <BiometricKycDashboardCard />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <CommissionBalanceCard
          role="rt"
          wallet={commissionQuery.data}
          loading={commissionQuery.isLoading}
          error={
            commissionQuery.error instanceof Error
              ? commissionQuery.error.message
              : commissionQuery.isError
                ? "Unable to load commission."
                : null
          }
          onRetry={() => void commissionQuery.refetch()}
        />
      </div>
      <DashboardStats
        dashboard={dashboard}
        loading={isLoading}
        isFetching={isFetching}
        isError={isError}
        error={error}
        onRetry={() => void refetch()}
      />
      <BusinessVolumePanel business={business?.business} loading={isLoading} />

      <div>
        <p className="mb-2.5 text-[12px] font-bold uppercase tracking-[0.08em] text-slate-400">
          Quick Actions
        </p>
        <QuickActions />
      </div>

      <ServiceGrid />
    </div>
  );
}

export default function RetailerDashboard() {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            refetchOnWindowFocus: true,
            retry: 1,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <RetailerDashboardContent />
    </QueryClientProvider>
  );
}

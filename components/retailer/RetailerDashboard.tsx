"use client";

import NewsBar from "@/components/retailer/NewsBar";
import BiometricKycDashboardCard from "@/components/biometric/BiometricKycDashboardCard";
import DashboardHeader from "@/components/retailer/DashboardHeader";
import DashboardStats from "@/components/retailer/DashboardStats";
import QuickActions from "@/components/retailer/QuickActions";
import ServiceGrid from "@/components/retailer/ServiceGrid";

export default function RetailerDashboard() {
  return (
    <div className="w-full space-y-4 sm:space-y-5">
      <NewsBar />
      <DashboardHeader />
      <BiometricKycDashboardCard />
      <DashboardStats />

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

"use client";

import { motion } from "framer-motion";
import { RETAILER_USER } from "@/features/retailer/constants";
import NewsBar from "@/components/retailer/NewsBar";
import KycBanner from "@/components/retailer/KycBanner";
import DashboardStats from "@/components/retailer/DashboardStats";
import QuickActions from "@/components/retailer/QuickActions";
import ServiceGrid from "@/components/retailer/ServiceGrid";

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good Morning";
  if (hour < 17) return "Good Afternoon";
  return "Good Evening";
}

export default function RetailerDashboardPage() {
  return (
    <div className="w-full space-y-4 sm:space-y-5">
      <NewsBar />

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between"
      >
        <div>
          <p className="text-[12px] font-semibold uppercase tracking-[0.1em] text-[#1565d8]">
            {getGreeting()}
          </p>
          <h1 className="text-xl font-bold tracking-tight text-[#0b1f3a] sm:text-2xl">
            {RETAILER_USER.name}
            <span className="ml-2 text-base font-medium text-slate-400 sm:text-lg">
              · Retailer
            </span>
          </h1>
          <p className="mt-0.5 text-[13px] text-slate-500">
            Retailer ID:{" "}
            <span className="font-semibold text-slate-700">
              {RETAILER_USER.retailerId}
            </span>
            {" · "}
            <span className="inline-flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              All systems operational
            </span>
          </p>
        </div>

        <div className="flex items-center gap-2 text-[11px] font-medium text-slate-400">
          <span>
            Last login:{" "}
            {new Date().toLocaleDateString("en-IN", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })}
          </span>
        </div>
      </motion.div>

      {RETAILER_USER.kycStatus === "pending" && <KycBanner />}

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

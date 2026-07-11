"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { motion } from "framer-motion";
import { useSelector } from "react-redux";
import { selectUser } from "@/src/redux/slices/authSlice";
import { selectProfileLoading } from "@/src/redux/slices/profileSlice";
import { useMasterDistributorDashboard } from "@/src/hooks/useMasterDistributorDashboard";
import MasterDistributorStatsCards from "./MasterDistributorStatsCards";
import MasterDistributorBusinessBreakdown from "./MasterDistributorBusinessBreakdown";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good Morning";
  if (hour < 17) return "Good Afternoon";
  return "Good Evening";
}

function getDisplayName(user: Record<string, unknown>) {
  const firstName = String(user.firstName || "");
  const lastName = String(user.lastName || "");
  const fullName = `${firstName} ${lastName}`.trim();
  return fullName || String(user.email || "Distributor");
}

function MasterDistributorDashboardContent() {
  const user = useSelector(selectUser);
  const profileLoading = useSelector(selectProfileLoading);
  const { data, isLoading, isFetching, isError, error, refetch } =
    useMasterDistributorDashboard();

  return (
    <div className="w-full space-y-6 pb-8">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex flex-col gap-1"
      >
        <p className="text-[12px] font-semibold uppercase tracking-[0.1em] text-[#1565d8]">
          {getGreeting()}
        </p>
        <h1 className="text-xl font-bold tracking-tight text-[#0b1f3a] sm:text-2xl">
          {profileLoading && !user?.name ? (
            <span className="inline-block h-7 w-48 animate-pulse rounded bg-slate-200" />
          ) : (
            user?.name
          )}
          <span className="ml-2 text-base font-medium text-slate-400 sm:text-lg">
            · {user?.roleLabel || "Master Distributor"}
          </span>
        </h1>
        <p className="mt-0.5 text-[13px] text-slate-500">
          ID:{" "}
          <span className="font-semibold text-slate-700">{user?.userId || "—"}</span>
          {" · "}
          <span className="inline-flex items-center gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            All systems operational
          </span>
        </p>
      </motion.div>

      <MasterDistributorStatsCards
        metrics={data}
        loading={isLoading}
        isFetching={isFetching}
        isError={isError}
        error={error instanceof Error ? error.message : null}
        onRetry={() => void refetch()}
      />

      <MasterDistributorBusinessBreakdown
        breakdown={data?.breakdown}
        retailerCount={data?.retailerCount}
        loading={isLoading}
      />
{/* 
      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="rounded-2xl border-slate-200/80 shadow-sm">
          <CardHeader>
            <CardTitle>Recent Distributors</CardTitle>
            <CardDescription>Latest onboarded distributors</CardDescription>
          </CardHeader>
          <CardContent>
            {!data?.recentDistributors?.length ? (
              <p className="py-8 text-center text-sm text-slate-500">No recent distributors</p>
            ) : (
              <div className="space-y-3">
                {data.recentDistributors.map((dist) => (
                  <div
                    key={String(dist.id || dist.email)}
                    className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/80 px-4 py-3"
                  >
                    <div>
                      <p className="text-sm font-semibold text-[#0b1f3a]">
                        {getDisplayName(dist)}
                      </p>
                      <p className="text-xs text-slate-500">
                        {String(dist.mobile || dist.email || "—")}
                      </p>
                    </div>
                    <p className="text-xs text-slate-400">
                      {dist.createdAt
                        ? new Date(String(dist.createdAt)).toLocaleDateString("en-IN")
                        : "—"}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-slate-200/80 shadow-sm">
          <CardHeader>
            <CardTitle>Recent Login</CardTitle>
            <CardDescription>Latest distributor login activity</CardDescription>
          </CardHeader>
          <CardContent>
            {!data?.recentLogins?.length ? (
              <p className="py-8 text-center text-sm text-slate-500">No recent login activity</p>
            ) : (
              <div className="space-y-3">
                {data.recentLogins.map((dist) => (
                  <div
                    key={`login-${String(dist.id || dist.email)}`}
                    className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/80 px-4 py-3"
                  >
                    <div>
                      <p className="text-sm font-semibold text-[#0b1f3a]">
                        {getDisplayName(dist)}
                      </p>
                      <p className="text-xs text-slate-500">{String(dist.email || "—")}</p>
                    </div>
                    <p className="text-xs text-slate-400">
                      {dist.lastLoginAt
                        ? new Date(String(dist.lastLoginAt)).toLocaleString("en-IN")
                        : "—"}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div> */}
    </div>
  );
}

export default function MasterDistributorDashboardPage() {
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
      <MasterDistributorDashboardContent />
    </QueryClientProvider>
  );
}

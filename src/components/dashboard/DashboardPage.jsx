"use client";

import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { motion } from "framer-motion";
import { formatCurrency } from "@/lib/utils";
import Link from "next/link";
import { ArrowLeftRight, Users, Store, Wallet, FileText } from "lucide-react";
import StatsCards from "@/src/components/dashboard/StatsCards";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { mdDashboardStats, ddDashboardStats } from "@/src/mock/dashboardData";
import { fetchMdDashboard, fetchDdDashboard } from "@/src/redux/thunks/dashboardThunk";
import { selectMdDashboard, selectDdDashboard } from "@/src/redux/slices/dashboardSlice";
import { selectUser } from "@/src/redux/slices/authSlice";
import { selectMdTransactions, selectDdTransactions } from "@/src/redux/slices/transactionSlice";
import { selectDdWallet } from "@/src/redux/slices/walletSlice";
import { selectProfileLoading } from "@/src/redux/slices/profileSlice";

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good Morning";
  if (hour < 17) return "Good Afternoon";
  return "Good Evening";
}

export default function DashboardPage({ role }) {
  const dispatch = useDispatch();
  const mdDashboard = useSelector(selectMdDashboard);
  const ddDashboard = useSelector(selectDdDashboard);
  const user = useSelector(selectUser);
  const profileLoading = useSelector(selectProfileLoading);
  const ddWallet = useSelector(selectDdWallet);
  const mdTransactions = useSelector(selectMdTransactions);
  const ddTransactions = useSelector(selectDdTransactions);

  const isMd = role === "md";
  const dashboard = isMd ? mdDashboard : ddDashboard;
  const statsConfig = isMd ? mdDashboardStats : ddDashboardStats;
  const dashboardStats = isMd
    ? dashboard.stats
    : {
        ...dashboard.stats,
        walletBalance:
          ddWallet.lastUpdated != null
            ? ddWallet.balance
            : dashboard.stats?.walletBalance,
      };
  const recentTransactions = (isMd ? mdTransactions : ddTransactions).slice(0, 5);
  const recentDistributors = dashboard.stats?.recentDistributors || [];
  const recentLogins = dashboard.stats?.recentLogins || [];
  const basePath = isMd ? "/md" : "/dd";

  const quickActions = isMd
    ? [
        { label: "Create Distributor", href: `${basePath}/distributors/create`, icon: Users },
        { label: "Balance Transfer", href: `${basePath}/balance-transfer`, icon: ArrowLeftRight },
        { label: "Fund Request", href: `${basePath}/fund-requests`, icon: Wallet },
        { label: "Transactions", href: `${basePath}/transactions`, icon: FileText },
      ]
    : [
        { label: "Create Retailer", href: `${basePath}/retailers/create`, icon: Store },
        { label: "Balance Transfer", href: `${basePath}/balance-transfer`, icon: ArrowLeftRight },
        { label: "Fund Requests", href: `${basePath}/fund-requests`, icon: Wallet },
        { label: "Transactions", href: `${basePath}/transactions`, icon: FileText },
      ];

  useEffect(() => {
    if (isMd) {
      dispatch(fetchMdDashboard());
    } else {
      dispatch(fetchDdDashboard());
    }
  }, [dispatch, isMd]);

  return (
    <div className="w-full space-y-4 sm:space-y-5">
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
            {profileLoading && !user?.name ? (
              <span className="inline-block h-7 w-48 animate-pulse rounded bg-slate-200" />
            ) : (
              user?.name
            )}
            <span className="ml-2 text-base font-medium text-slate-400 sm:text-lg">
              · {user?.roleLabel}
            </span>
          </h1>
          <p className="mt-0.5 text-[13px] text-slate-500">
            ID:{" "}
            <span className="font-semibold text-slate-700">{user?.userId}</span>
            {" · "}
            <span className="inline-flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              All systems operational
            </span>
          </p>
        </div>
      </motion.div>

      {isMd && (
        <Card className="overflow-hidden border-0 bg-gradient-to-r from-[#001F5B] via-[#0057D9] to-[#1565d8] text-white shadow-lg">
          <CardContent className="flex flex-col gap-2 p-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-blue-100">Welcome back</p>
              <h2 className="text-2xl font-bold">{user?.name || "Master Distributor"}</h2>
              <p className="mt-1 text-sm text-blue-100/90">
                Manage distributors, monitor activity, and grow your network from one dashboard.
              </p>
            </div>
            <Button asChild variant="secondary" className="shrink-0">
              <Link href={`${basePath}/distributors/create`}>Create Distributor</Link>
            </Button>
          </CardContent>
        </Card>
      )}

      {!isMd && (
        <Card className="overflow-hidden border-0 bg-gradient-to-r from-[#001F5B] via-[#0057D9] to-[#1565d8] text-white shadow-lg">
          <CardContent className="flex flex-col gap-4 p-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-start gap-4">
              {user?.profileImage ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={user.profileImage}
                  alt={user.name}
                  className="h-16 w-16 rounded-2xl border-2 border-white/20 object-cover"
                />
              ) : (
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl border-2 border-white/20 bg-white/10 text-2xl font-bold">
                  {user?.name?.charAt(0) || "D"}
                </div>
              )}
              <div>
                <p className="text-sm text-blue-100">Welcome back</p>
                <h2 className="text-2xl font-bold">{user?.name || "Distributor"}</h2>
                <p className="mt-1 text-sm text-blue-100/90">
                  {user?.outlet?.outletName || user?.outletName || "Manage retailers and grow your business"}
                </p>
                <p className="mt-2 text-xs text-blue-100/80">
                  ID: {user?.userId || "—"}
                  {user?.outlet?.city ? ` · ${user.outlet.city}` : ""}
                  {user?.outlet?.state ? `, ${user.outlet.state}` : ""}
                </p>
              </div>
            </div>
            <div className="rounded-2xl bg-white/10 px-5 py-4 backdrop-blur-sm">
              <p className="text-xs uppercase tracking-wide text-blue-100/80">
                Current Wallet Balance
              </p>
              <p className="mt-1 text-2xl font-bold">
                {ddWallet.lastUpdated != null
                  ? formatCurrency(ddWallet.balance)
                  : ddWallet.loading
                    ? "Loading..."
                    : formatCurrency(dashboardStats.walletBalance ?? 0)}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      <StatsCards
        stats={statsConfig}
        values={dashboardStats}
        loading={dashboard.loading}
      />

      <div>
        <p className="mb-2.5 text-[12px] font-bold uppercase tracking-[0.08em] text-slate-400">
          Quick Actions
        </p>
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <Link key={action.label} href={action.href}>
                <div className="flex h-full flex-col items-start gap-3 rounded-xl border border-slate-100 bg-white p-4 transition hover:border-[#1565d8]/20 hover:shadow-[0_8px_28px_rgba(21,101,216,0.1)]">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-[#1565d8]">
                    <Icon className="h-5 w-5" />
                  </div>
                  <p className="text-sm font-semibold text-[#0b1f3a]">{action.label}</p>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {isMd ? (
        <div className="grid gap-4 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Recent Distributors</CardTitle>
              <CardDescription>Latest onboarded distributors</CardDescription>
            </CardHeader>
            <CardContent>
              {recentDistributors.length === 0 ? (
                <p className="py-8 text-center text-sm text-slate-500">No recent distributors</p>
              ) : (
                <div className="space-y-3">
                  {recentDistributors.map((dist) => (
                    <div
                      key={dist.id || dist.email}
                      className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/80 px-4 py-3"
                    >
                      <div>
                        <p className="text-sm font-semibold text-[#0b1f3a]">
                          {`${dist.firstName || ""} ${dist.lastName || ""}`.trim() || dist.email}
                        </p>
                        <p className="text-xs text-slate-500">{dist.mobile || dist.email}</p>
                      </div>
                      <p className="text-xs text-slate-400">
                        {dist.createdAt
                          ? new Date(dist.createdAt).toLocaleDateString("en-IN")
                          : "—"}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Login</CardTitle>
              <CardDescription>Latest distributor login activity</CardDescription>
            </CardHeader>
            <CardContent>
              {recentLogins.length === 0 ? (
                <p className="py-8 text-center text-sm text-slate-500">No recent login activity</p>
              ) : (
                <div className="space-y-3">
                  {recentLogins.map((dist) => (
                    <div
                      key={`login-${dist.id || dist.email}`}
                      className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/80 px-4 py-3"
                    >
                      <div>
                        <p className="text-sm font-semibold text-[#0b1f3a]">
                          {`${dist.firstName || ""} ${dist.lastName || ""}`.trim() || dist.email}
                        </p>
                        <p className="text-xs text-slate-500">{dist.email}</p>
                      </div>
                      <p className="text-xs text-slate-400">
                        {dist.lastLoginAt
                          ? new Date(dist.lastLoginAt).toLocaleString("en-IN")
                          : "—"}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      ) : (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Recent Transactions</CardTitle>
            <CardDescription>Latest activity on your account</CardDescription>
          </div>
          <Button variant="outline" size="sm" asChild>
            <Link href={`${basePath}/transactions`}>View All</Link>
          </Button>
        </CardHeader>
        <CardContent>
          {recentTransactions.length === 0 ? (
            <p className="py-8 text-center text-sm text-slate-500">
              No recent transactions
            </p>
          ) : (
            <div className="space-y-3">
              {recentTransactions.map((txn) => (
                <div
                  key={txn.id}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-slate-100 bg-slate-50/80 px-4 py-3"
                >
                  <div>
                    <p className="text-sm font-semibold text-[#0b1f3a]">
                      {txn.transactionType}
                    </p>
                    <p className="text-xs text-slate-500">
                      {txn.retailerName} ·{" "}
                      {new Date(txn.dateTime).toLocaleString("en-IN")}
                    </p>
                  </div>
                  <p className="text-sm font-bold text-[#1565d8]">
                    ₹{txn.amount.toLocaleString("en-IN")}
                  </p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
      )}
    </div>
  );
}

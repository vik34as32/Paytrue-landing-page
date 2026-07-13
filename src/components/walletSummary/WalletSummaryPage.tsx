"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Wallet } from "lucide-react";
import { toast } from "sonner";
import PageHeader from "@/src/components/common/PageHeader";
import WalletSummaryTable from "@/src/components/walletSummary/WalletSummaryTable";
import { useDebounce } from "@/src/hooks/useDebounce";
import { useWalletSummary } from "@/src/hooks/useWalletSummary";
import type {
  WalletSummaryPortalRole,
  WalletSummaryStatusFilter,
  WalletSummaryTypeFilter,
} from "@/src/types/walletSummary";

const PAGE_CONFIG: Record<
  WalletSummaryPortalRole,
  { title: string; description: string; backHref: string; useMotionHeader?: boolean }
> = {
  md: {
    title: "Wallet Summary",
    description: "Your wallet account statement — credits, deductions, and balance ledger.",
    backHref: "/md/dashboard",
  },
  dd: {
    title: "Wallet Summary",
    description: "Your wallet account statement — credits, deductions, and balance ledger.",
    backHref: "/dd/dashboard",
  },
  rt: {
    title: "Wallet Summary",
    description: "Your wallet account statement — credits, deductions, and balance ledger.",
    backHref: "/rt/retailer",
    useMotionHeader: true,
  },
};

function WalletSummaryContent({ role }: { role: WalletSummaryPortalRole }) {
  const config = PAGE_CONFIG[role];
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<WalletSummaryTypeFilter>("ALL");
  const [statusFilter, setStatusFilter] = useState<WalletSummaryStatusFilter>("All");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const debouncedSearch = useDebounce(search, 400);

  const queryParams = useMemo(
    () => ({
      page,
      limit,
      search: debouncedSearch.trim() || undefined,
      type: typeFilter,
      status: statusFilter !== "All" ? statusFilter : undefined,
      startDate: dateFrom || undefined,
      endDate: dateTo || undefined,
      sortBy: "createdAt",
      sortOrder: "desc" as const,
    }),
    [page, limit, debouncedSearch, typeFilter, statusFilter, dateFrom, dateTo]
  );

  const { data, isLoading, isFetching, error, refetch } = useWalletSummary(
    queryParams,
    role
  );

  useEffect(() => {
    if (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Unable to load wallet summary. Please try again.";
      toast.error(message);
    }
  }, [error]);

  const resetPage = useCallback(() => setPage(1), []);

  const handleSearchChange = useCallback(
    (value: string) => {
      setSearch(value);
      resetPage();
    },
    [resetPage]
  );

  const handleTypeFilterChange = useCallback(
    (value: WalletSummaryTypeFilter) => {
      setTypeFilter(value);
      resetPage();
    },
    [resetPage]
  );

  const handleStatusFilterChange = useCallback(
    (value: WalletSummaryStatusFilter) => {
      setStatusFilter(value);
      resetPage();
    },
    [resetPage]
  );

  const handleDateFromChange = useCallback(
    (value: string) => {
      setDateFrom(value);
      resetPage();
    },
    [resetPage]
  );

  const handleDateToChange = useCallback(
    (value: string) => {
      setDateTo(value);
      resetPage();
    },
    [resetPage]
  );

  const handleLimitChange = useCallback(
    (value: number) => {
      setLimit(value);
      resetPage();
    },
    [resetPage]
  );

  const loading = isLoading || isFetching;

  return (
    <div className="space-y-5">
      {config.useMotionHeader ? (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="flex items-start gap-4"
        >
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#0A84FF] to-[#0057D9] text-white shadow-lg">
            <Wallet className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[#001F5B] dark:text-white">
              Wallet Statement
            </h1>
            <p className="mt-1 max-w-3xl text-sm text-slate-500 dark:text-slate-400">
              {config.description}
            </p>
          </div>
        </motion.div>
      ) : (
        <PageHeader
          title="Wallet Statement"
          description={config.description}
          icon={Wallet}
          backHref={config.backHref}
          actions={null}
        />
      )}

      <WalletSummaryTable
        transactions={data?.transactions ?? []}
        wallet={data?.wallet}
        user={data?.user}
        total={data?.meta.total ?? 0}
        page={data?.meta.page ?? page}
        limit={data?.meta.limit ?? limit}
        search={search}
        typeFilter={typeFilter}
        statusFilter={statusFilter}
        dateFrom={dateFrom}
        dateTo={dateTo}
        loading={loading}
        onRefresh={() => refetch()}
        onSearchChange={handleSearchChange}
        onTypeFilterChange={handleTypeFilterChange}
        onStatusFilterChange={handleStatusFilterChange}
        onDateFromChange={handleDateFromChange}
        onDateToChange={handleDateToChange}
        onPageChange={setPage}
        onLimitChange={handleLimitChange}
      />
    </div>
  );
}

export default function WalletSummaryPage({
  role,
}: {
  role: WalletSummaryPortalRole;
}) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            retry: 1,
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <WalletSummaryContent role={role} />
    </QueryClientProvider>
  );
}

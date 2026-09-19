"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BookOpen } from "lucide-react";
import { toast } from "sonner";
import PageHeader from "@/src/components/common/PageHeader";
import DownlineLedgerTable from "@/src/components/downlineLedger/DownlineLedgerTable";
import { useDebounce } from "@/src/hooks/useDebounce";
import { useDownlineLedger } from "@/src/hooks/useDownlineLedger";
import type {
  DownlineLedgerPortalRole,
  DownlineLedgerServiceFilter,
  DownlineLedgerStatusFilter,
  DownlineLedgerTxnTypeFilter,
} from "@/src/types/downlineLedger";

const PAGE_CONFIG: Record<
  DownlineLedgerPortalRole,
  { title: string; description: string; backHref: string }
> = {
  md: {
    title: "Report",
    description:
      "Wallet ledger of retailers under your distributor hierarchy. Filter by DMT, DMT3, AEPS, and UPI ATM.",
    backHref: "/md/dashboard",
  },
  dd: {
    title: "Report",
    description:
      "Wallet ledger of your retailers. Filter by DMT, DMT3, AEPS, and UPI ATM with date range and pagination.",
    backHref: "/dd/dashboard",
  },
};

function DownlineLedgerContent({ role }: { role: DownlineLedgerPortalRole }) {
  const config = PAGE_CONFIG[role];
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [search, setSearch] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [serviceType, setServiceType] =
    useState<DownlineLedgerServiceFilter>("ALL");
  const [transactionType, setTransactionType] =
    useState<DownlineLedgerTxnTypeFilter>("ALL");
  const [status, setStatus] = useState<DownlineLedgerStatusFilter>("ALL");

  const debouncedSearch = useDebounce(search, 400);

  const queryParams = useMemo(
    () => ({
      page,
      limit,
      search: String(debouncedSearch || "").trim() || undefined,
      serviceType,
      transactionType,
      status,
      fromDate: dateFrom || undefined,
      toDate: dateTo || undefined,
    }),
    [
      page,
      limit,
      debouncedSearch,
      serviceType,
      transactionType,
      status,
      dateFrom,
      dateTo,
    ]
  );

  const { data, isLoading, isFetching, error, refetch } = useDownlineLedger(
    queryParams,
    role
  );

  useEffect(() => {
    if (!error) return;
    const message =
      error instanceof Error
        ? error.message
        : "Unable to load downline ledger. Please try again.";
    toast.error(message);
  }, [error]);

  const resetPage = useCallback(() => setPage(1), []);

  const handleSearchChange = useCallback(
    (value: string) => {
      setSearch(value);
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

  const handleServiceTypeChange = useCallback(
    (value: DownlineLedgerServiceFilter) => {
      setServiceType(value);
      resetPage();
    },
    [resetPage]
  );

  const handleTransactionTypeChange = useCallback(
    (value: DownlineLedgerTxnTypeFilter) => {
      setTransactionType(value);
      resetPage();
    },
    [resetPage]
  );

  const handleStatusChange = useCallback(
    (value: DownlineLedgerStatusFilter) => {
      setStatus(value);
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
      <PageHeader
        title={config.title}
        description={config.description}
        icon={BookOpen}
        backHref={config.backHref}
        actions={null}
      />

      <DownlineLedgerTable
        transactions={data?.transactions ?? []}
        summary={data?.summary}
        total={data?.pagination.total ?? 0}
        page={page}
        limit={limit}
        search={search}
        dateFrom={dateFrom}
        dateTo={dateTo}
        serviceType={serviceType}
        transactionType={transactionType}
        status={status}
        loading={loading}
        onSearchChange={handleSearchChange}
        onDateFromChange={handleDateFromChange}
        onDateToChange={handleDateToChange}
        onServiceTypeChange={handleServiceTypeChange}
        onTransactionTypeChange={handleTransactionTypeChange}
        onStatusChange={handleStatusChange}
        onPageChange={setPage}
        onLimitChange={handleLimitChange}
        onRefresh={() => void refetch()}
      />
    </div>
  );
}

export default function DownlineLedgerPage({
  role,
}: {
  role: DownlineLedgerPortalRole;
}) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            refetchOnWindowFocus: false,
            retry: 1,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <DownlineLedgerContent role={role} />
    </QueryClientProvider>
  );
}

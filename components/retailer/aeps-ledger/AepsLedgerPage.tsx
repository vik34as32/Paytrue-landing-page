"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Landmark } from "lucide-react";
import { toast } from "sonner";
import PageHeader from "@/src/components/common/PageHeader";
import { AepsLedgerTable } from "@/components/retailer/aeps-ledger/AepsLedgerTable";
import { useDebounce } from "@/src/hooks/useDebounce";
import { useAepsLedger } from "@/src/hooks/useAepsLedger";
import type {
  AepsLedgerSortBy,
  AepsLedgerSortOrder,
} from "@/types/aeps-ledger";

function AepsLedgerContent() {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [search, setSearch] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [status, setStatus] = useState("All");
  const [service, setService] = useState("All");
  const [sortBy, setSortBy] = useState<AepsLedgerSortBy>("createdAt");
  const [sortOrder, setSortOrder] = useState<AepsLedgerSortOrder>("desc");

  const debouncedSearch = useDebounce(search, 500);

  const queryParams = useMemo(
    () => ({
      page,
      limit,
      search: debouncedSearch.trim() || undefined,
      fromDate: dateFrom || undefined,
      toDate: dateTo || undefined,
      status: status !== "All" ? status : undefined,
      service: service !== "All" ? service : undefined,
      sortBy,
      sortOrder,
    }),
    [
      page,
      limit,
      debouncedSearch,
      dateFrom,
      dateTo,
      status,
      service,
      sortBy,
      sortOrder,
    ]
  );

  const { data, isLoading, isFetching, isError, error, refetch } =
    useAepsLedger(queryParams);

  useEffect(() => {
    if (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Unable to load AEPS ledger. Please try again.";
      toast.error(message);
    }
  }, [error]);

  const resetPage = useCallback(() => setPage(1), []);

  const loading = isLoading || isFetching;

  return (
    <div className="space-y-5">
      <PageHeader
        title="AEPS Wallet Ledger"
        description="View all AEPS transactions."
        icon={Landmark}
        backHref="/rt/retailer"
        actions={null}
      />

      <AepsLedgerTable
        transactions={data?.transactions ?? []}
        wallet={data?.wallet}
        total={data?.meta.total ?? 0}
        page={data?.meta.page ?? page}
        limit={data?.meta.limit ?? limit}
        search={search}
        dateFrom={dateFrom}
        dateTo={dateTo}
        status={status}
        service={service}
        sortBy={sortBy}
        sortOrder={sortOrder}
        loading={loading}
        error={isError}
        onRefresh={() => void refetch()}
        onSearchChange={(value) => {
          setSearch(value);
          resetPage();
        }}
        onDateFromChange={(value) => {
          setDateFrom(value);
          resetPage();
        }}
        onDateToChange={(value) => {
          setDateTo(value);
          resetPage();
        }}
        onStatusChange={(value) => {
          setStatus(value);
          resetPage();
        }}
        onServiceChange={(value) => {
          setService(value);
          resetPage();
        }}
        onPageChange={setPage}
        onLimitChange={(value) => {
          setLimit(value);
          resetPage();
        }}
        onSortChange={(nextSortBy, nextSortOrder) => {
          setSortBy(nextSortBy);
          setSortOrder(nextSortOrder);
          resetPage();
        }}
      />
    </div>
  );
}

export default function AepsLedgerPage() {
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
      <AepsLedgerContent />
    </QueryClientProvider>
  );
}

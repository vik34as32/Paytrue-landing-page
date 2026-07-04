"use client";

import { useState, useCallback, useMemo, useEffect } from "react";
import { useSelector } from "react-redux";
import { motion } from "framer-motion";
import { Landmark } from "lucide-react";
import { toast } from "sonner";
import { selectUser } from "@/src/redux/slices/authSlice";
import {
  useRetailerFundRequests,
  useCompanyBankAccounts,
  useSubmitRetailerFundRequest,
  useCancelRetailerFundRequest,
} from "@/src/hooks/useRetailerFundRequests";
import { mapFundRequestStatusFilterToApi } from "@/src/lib/fundRequestUtils";
import { type FundRequestFormValues } from "@/src/components/fundRequests/retailer/FundRequestForm";
import FundRequestTable from "@/src/components/fundRequests/retailer/FundRequestTable";
import NewFundRequestModal, {
  NewFundRequestButton,
} from "@/src/components/fundRequests/retailer/NewFundRequestModal";
import RequestDrawer from "@/src/components/fundRequests/retailer/RequestDrawer";
import CancelDialog from "@/src/components/fundRequests/retailer/CancelDialog";
import SkeletonLoader from "@/src/components/fundRequests/retailer/SkeletonLoader";
import ErrorState from "@/src/components/fundRequests/retailer/ErrorState";
import type {
  FundRequest,
  FundRequestStatusFilter,
  PaymentMode,
} from "@/src/types/fundRequest";

export default function FundRequestPage() {
  useSelector(selectUser);

  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<FundRequestStatusFilter>("All");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedSearch(searchInput), 400);
    return () => window.clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, statusFilter, dateFrom, dateTo, limit]);

  const listParams = useMemo(
    () => ({
      page,
      limit,
      search: debouncedSearch || undefined,
      status: mapFundRequestStatusFilterToApi(statusFilter),
      dateFrom: dateFrom || undefined,
      dateTo: dateTo || undefined,
      sortBy: "createdAt",
      sortOrder: "desc" as const,
    }),
    [page, limit, debouncedSearch, statusFilter, dateFrom, dateTo]
  );

  const {
    data,
    isLoading: requestsLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useRetailerFundRequests(listParams);

  const requests = data?.list ?? [];
  const total = data?.total ?? 0;

  const {
    data: bankAccounts = [],
    isLoading: banksLoading,
    isError: banksError,
  } = useCompanyBankAccounts();
  const submitMutation = useSubmitRetailerFundRequest();
  const cancelMutation = useCancelRetailerFundRequest();

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<FundRequest | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [cancelTarget, setCancelTarget] = useState<FundRequest | null>(null);
  const [formResetSignal, setFormResetSignal] = useState(0);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleSubmit = useCallback(
    async (values: FundRequestFormValues) => {
      setUploadProgress(15);
      const progressTimer = window.setInterval(() => {
        setUploadProgress((current) => Math.min(current + 12, 90));
      }, 200);

      try {
        await submitMutation.mutateAsync({
          amount: values.amount,
          paymentMode: values.paymentMode as PaymentMode,
          companyBankAccountId: values.companyBankAccountId,
          utrNumber: values.utrNumber,
          paymentDate: values.paymentDate,
          remark: values.remark,
          receipt: values.receipt ?? undefined,
        });

        setUploadProgress(100);
        setModalOpen(false);
        setFormResetSignal((current) => current + 1);
        setPage(1);
        await refetch();
        toast.success("Fund request submitted successfully.");
      } catch (err) {
        toast.error(
          err instanceof Error ? err.message : "Failed to submit fund request"
        );
      } finally {
        window.clearInterval(progressTimer);
        setTimeout(() => setUploadProgress(0), 400);
      }
    },
    [refetch, submitMutation]
  );

  const handleRowClick = useCallback((request: FundRequest) => {
    setSelectedRequest(request);
    setDrawerOpen(true);
  }, []);

  const handleCancelClick = useCallback((request: FundRequest) => {
    setCancelTarget(request);
    setCancelOpen(true);
  }, []);

  const handleConfirmCancel = useCallback(async () => {
    if (!cancelTarget) return;
    try {
      await cancelMutation.mutateAsync(cancelTarget.id);
      toast.success("Fund request cancelled successfully.");
      setCancelOpen(false);
      setCancelTarget(null);
      if (selectedRequest?.id === cancelTarget.id) {
        setDrawerOpen(false);
      }
      await refetch();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to cancel fund request"
      );
    }
  }, [cancelMutation, cancelTarget, refetch, selectedRequest?.id]);

  if (isError) {
    return (
      <ErrorState
        message={error instanceof Error ? error.message : undefined}
        onRetry={() => void refetch()}
        retrying={isFetching}
      />
    );
  }

  const initialLoading = requestsLoading && !data;

  return (
    <div className="space-y-5">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between"
      >
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#0A84FF] to-[#0057D9] text-white shadow-lg">
            <Landmark className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[#001F5B] dark:text-white">
              Fund Request
            </h1>
            <p className="mt-1 max-w-2xl text-sm text-slate-500 dark:text-slate-400">
              View fund request history and submit new deposit requests with payment proof.
            </p>
          </div>
        </div>
        <NewFundRequestButton
          onClick={() => setModalOpen(true)}
          className="w-full shrink-0 sm:w-auto"
        />
      </motion.div>

      {initialLoading ? (
        <SkeletonLoader rows={5} />
      ) : (
        <FundRequestTable
          requests={requests}
          total={total}
          page={page}
          limit={limit}
          search={searchInput}
          statusFilter={statusFilter}
          dateFrom={dateFrom}
          dateTo={dateTo}
          serverMode
          loading={isFetching}
          onSearchChange={setSearchInput}
          onStatusFilterChange={setStatusFilter}
          onDateFromChange={setDateFrom}
          onDateToChange={setDateTo}
          onPageChange={setPage}
          onLimitChange={setLimit}
          onRowClick={handleRowClick}
          onCancelRequest={handleCancelClick}
          onCreateClick={() => setModalOpen(true)}
        />
      )}

      <NewFundRequestModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        bankAccounts={bankAccounts}
        banksLoading={banksLoading}
        banksError={banksError}
        submitting={submitMutation.isPending}
        uploadProgress={uploadProgress}
        resetSignal={formResetSignal}
        onSubmit={handleSubmit}
      />

      <RequestDrawer
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        request={selectedRequest}
      />

      <CancelDialog
        open={cancelOpen}
        onOpenChange={setCancelOpen}
        request={cancelTarget}
        onConfirm={() => void handleConfirmCancel()}
        loading={cancelMutation.isPending}
      />
    </div>
  );
}

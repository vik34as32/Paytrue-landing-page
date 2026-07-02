"use client";

import { useState, useCallback, useRef } from "react";
import Link from "next/link";
import { useSelector } from "react-redux";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { ArrowLeft, Wallet } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getUserDisplayName } from "@/src/lib/userUtils";
import { selectUser } from "@/src/redux/slices/authSlice";
import { selectRtWallet } from "@/src/redux/slices/walletSlice";
import { RETAILER_USER } from "@/features/retailer/constants";
import {
  useRetailerFundRequests,
  useSubmitRetailerFundRequest,
  useCancelRetailerFundRequest,
} from "@/src/hooks/useRetailerFundRequests";
import FundRequestForm, {
  type FundRequestFormValues,
} from "@/src/components/fundRequests/retailer/FundRequestForm";
import FundRequestTable from "@/src/components/fundRequests/retailer/FundRequestTable";
import RequestDrawer from "@/src/components/fundRequests/retailer/RequestDrawer";
import CancelDialog from "@/src/components/fundRequests/retailer/CancelDialog";
import SkeletonLoader from "@/src/components/fundRequests/retailer/SkeletonLoader";
import ErrorState from "@/src/components/fundRequests/retailer/ErrorState";
import type { FundRequest, PaymentMode } from "@/src/types/fundRequest";

function FundRequestPageContent() {
  const formSectionRef = useRef<HTMLDivElement>(null);
  const user = useSelector(selectUser);
  const apiWallet = useSelector(selectRtWallet);

  const hasLoadedBalance = apiWallet.lastUpdated != null;
  const balanceLoading = apiWallet.loading && !hasLoadedBalance;
  const balance = hasLoadedBalance
    ? apiWallet.currentBalance ?? apiWallet.availableBalance ?? 0
    : 0;

  const { data: requests = [], isLoading, isError, error, refetch, isFetching } =
    useRetailerFundRequests();
  const submitMutation = useSubmitRetailerFundRequest();
  const cancelMutation = useCancelRetailerFundRequest();

  const [selectedRequest, setSelectedRequest] = useState<FundRequest | null>(
    null
  );
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [cancelTarget, setCancelTarget] = useState<FundRequest | null>(null);
  const [formResetSignal, setFormResetSignal] = useState(0);

  const createdBy = getUserDisplayName(user, RETAILER_USER.name);

  const handleSubmit = useCallback(
    async (values: FundRequestFormValues) => {
      try {
        await submitMutation.mutateAsync({
          amount: values.amount,
          paymentMode: values.paymentMode as PaymentMode,
          utrNumber: values.utrNumber,
          paymentDate: values.paymentDate,
          remark: values.remark,
          createdBy,
        });
        toast.success("Fund request submitted successfully.");
        setFormResetSignal((current) => current + 1);
      } catch (err) {
        toast.error(
          err instanceof Error ? err.message : "Failed to submit fund request"
        );
      }
    },
    [createdBy, submitMutation]
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
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to cancel fund request"
      );
    }
  }, [cancelMutation, cancelTarget, selectedRequest?.id]);

  const scrollToForm = useCallback(() => {
    formSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  if (isLoading) {
    return <SkeletonLoader />;
  }

  if (isError) {
    return (
      <ErrorState
        message={error instanceof Error ? error.message : undefined}
        onRetry={() => void refetch()}
        retrying={isFetching}
      />
    );
  }

  return (
    <div className="w-full max-w-none space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild>
          <Link href="/rt/retailer">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#0A84FF] to-[#0057D9] text-white shadow-lg">
            <Wallet className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[#001F5B]">Fund Request</h1>
            <p className="text-sm text-slate-500">
              Request wallet balance from your Distributor/Admin
            </p>
          </div>
        </div>
      </div>

      <motion.div
        ref={formSectionRef}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
      >
        <Card className="rounded-2xl border-slate-200/80 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-[#001F5B]">Request Funds</CardTitle>
            <CardDescription>
              Request wallet balance from your Distributor/Admin.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FundRequestForm
              balance={balance}
              balanceLoading={balanceLoading}
              submitting={submitMutation.isPending}
              resetSignal={formResetSignal}
              onSubmit={handleSubmit}
            />
          </CardContent>
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.08 }}
      >
        <FundRequestTable
          requests={requests}
          onRowClick={handleRowClick}
          onCancelRequest={handleCancelClick}
          onCreateClick={scrollToForm}
        />
      </motion.div>

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

export default function FundRequestPage() {
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
      <FundRequestPageContent />
    </QueryClientProvider>
  );
}

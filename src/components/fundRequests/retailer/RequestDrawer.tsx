"use client";

import { motion } from "framer-motion";
import {
  CheckCircle2,
  Circle,
  Clock3,
  XCircle,
  Ban,
  Wallet,
  Loader2,
} from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { formatCurrency } from "@/lib/utils";
import { useFundRequestById } from "@/src/hooks/useFundRequests";
import type { FundRequest, FundRequestStatus } from "@/src/types/fundRequest";
import { formatPaymentModeLabel } from "@/src/lib/fundRequestUtils";
import FundRequestStatusBadge from "./FundRequestStatusBadge";

interface RequestDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  request: FundRequest | null;
}

function formatDateTime(value: string): string {
  if (!value) return "—";
  return new Date(value).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatDate(value: string): string {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

interface TimelineStep {
  key: string;
  label: string;
  description: string;
  state: "complete" | "current" | "upcoming" | "failed" | "cancelled";
}

function buildTimeline(status: FundRequestStatus): TimelineStep[] {
  const base: TimelineStep[] = [
    {
      key: "created",
      label: "New Request",
      description: "Fund request submitted",
      state: "complete",
    },
    {
      key: "pending",
      label: "Pending",
      description: "Awaiting distributor/admin review",
      state: "upcoming",
    },
    {
      key: "review",
      label: "Admin Review",
      description: "Payment verification in progress",
      state: "upcoming",
    },
  ];

  if (status === "pending") {
    base[1].state = "current";
    return base;
  }

  if (status === "approved") {
    return [
      ...base.map((step) => ({ ...step, state: "complete" as const })),
      {
        key: "approved",
        label: "Approved",
        description: "Request approved by admin",
        state: "complete",
      },
      {
        key: "credited",
        label: "Wallet Credited",
        description: "Amount added to wallet balance",
        state: "complete",
      },
    ];
  }

  if (status === "rejected") {
    return [
      base[0],
      { ...base[1], state: "complete" },
      { ...base[2], state: "current" },
      {
        key: "rejected",
        label: "Declined",
        description: "Request was declined",
        state: "failed",
      },
    ];
  }

  return [
    base[0],
    { ...base[1], state: "cancelled" },
    {
      key: "cancelled",
      label: "Cancelled",
      description: "Request cancelled by retailer",
      state: "cancelled",
    },
  ];
}

function TimelineIcon({ state }: { state: TimelineStep["state"] }) {
  if (state === "complete") {
    return <CheckCircle2 className="h-5 w-5 text-emerald-500" />;
  }
  if (state === "current") {
    return <Clock3 className="h-5 w-5 text-amber-500" />;
  }
  if (state === "failed") {
    return <XCircle className="h-5 w-5 text-red-500" />;
  }
  if (state === "cancelled") {
    return <Ban className="h-5 w-5 text-slate-400" />;
  }
  return <Circle className="h-5 w-5 text-slate-300" />;
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 py-2.5">
      <span className="text-sm text-slate-500">{label}</span>
      <span className="max-w-[60%] text-right text-sm font-medium text-slate-800">
        {value}
      </span>
    </div>
  );
}

export default function RequestDrawer({
  open,
  onOpenChange,
  request,
}: RequestDrawerProps) {
  const { data: detail, isLoading } = useFundRequestById(
    request?.id,
    open && Boolean(request?.id)
  );

  const displayRequest = detail ?? request;
  if (!displayRequest) return null;

  const timeline = buildTimeline(displayRequest.status);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full overflow-y-auto p-0 sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Request Details</SheetTitle>
          <SheetDescription>
            {displayRequest.referenceNumber || displayRequest.requestId}
          </SheetDescription>
        </SheetHeader>

        {isLoading && !detail ? (
          <div className="flex items-center justify-center gap-2 px-6 py-10 text-sm text-slate-500">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading request details...
          </div>
        ) : (
        <div className="space-y-6 px-6 pb-8">
          <div className="rounded-2xl bg-gradient-to-br from-blue-50 to-slate-50 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                  Requested Amount
                </p>
                <p className="mt-1 text-2xl font-bold text-[#001F5B]">
                  {formatCurrency(displayRequest.amount)}
                </p>
              </div>
              <FundRequestStatusBadge status={displayRequest.status} />
            </div>
          </div>

          <div className="rounded-2xl bg-white shadow-sm ring-1 ring-slate-100">
            <div className="border-b border-slate-100 px-4 py-3">
              <h4 className="text-sm font-semibold text-[#001F5B]">
                Payment Information
              </h4>
            </div>
            <div className="divide-y divide-slate-100 px-4">
              <DetailRow
                label="Company Bank"
                value={displayRequest.companyBankName || "—"}
              />
              <DetailRow label="Payment Mode" value={formatPaymentModeLabel(displayRequest.paymentMode)} />
              <DetailRow
                label="UTR Number"
                value={displayRequest.utrNumber || "—"}
              />
              <DetailRow label="Deposit Date" value={formatDate(displayRequest.paymentDate)} />
              <DetailRow label="Remark" value={displayRequest.remark || "—"} />
            </div>
          </div>

          <div className="rounded-2xl bg-white shadow-sm ring-1 ring-slate-100">
            <div className="border-b border-slate-100 px-4 py-3">
              <h4 className="text-sm font-semibold text-[#001F5B]">
                Audit Trail
              </h4>
            </div>
            <div className="divide-y divide-slate-100 px-4">
              <DetailRow label="Created By" value={displayRequest.createdBy || "—"} />
              <DetailRow
                label="Created Time"
                value={formatDateTime(displayRequest.createdAt)}
              />
              <DetailRow
                label="Updated Time"
                value={formatDateTime(displayRequest.updatedAt)}
              />
              {displayRequest.approvedBy && (
                <DetailRow label="Approved By" value={displayRequest.approvedBy} />
              )}
              {displayRequest.approvedDate && (
                <DetailRow
                  label="Approved Date"
                  value={formatDateTime(displayRequest.approvedDate)}
                />
              )}
              {displayRequest.adminRemark ? (
                <DetailRow label="Admin Remark" value={displayRequest.adminRemark} />
              ) : null}
            </div>
          </div>

          <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-100">
            <div className="mb-4 flex items-center gap-2">
              <Wallet className="h-4 w-4 text-[#0057D9]" />
              <h4 className="text-sm font-semibold text-[#001F5B]">
                Status Timeline
              </h4>
            </div>
            <div className="space-y-4">
              {timeline.map((step, index) => (
                <motion.div
                  key={step.key}
                  initial={{ opacity: 0, x: 8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex gap-3"
                >
                  <div className="flex flex-col items-center">
                    <TimelineIcon state={step.state} />
                    {index < timeline.length - 1 && (
                      <div className="mt-1 h-full min-h-[24px] w-px bg-slate-200" />
                    )}
                  </div>
                  <div className="pb-1">
                    <p className="text-sm font-semibold text-slate-800">
                      {step.label}
                    </p>
                    <p className="text-xs text-slate-500">{step.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
        )}
      </SheetContent>
    </Sheet>
  );
}

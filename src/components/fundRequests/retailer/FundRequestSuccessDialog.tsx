"use client";

import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { formatCurrency } from "@/lib/utils";
import { formatFundRequestDateOnly, formatPaymentModeLabel } from "@/src/lib/fundRequestUtils";
import type { FundRequest } from "@/src/types/fundRequest";
import FundRequestStatusBadge from "./FundRequestStatusBadge";

interface FundRequestSuccessDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  request: FundRequest | null;
  companyBankName?: string;
  onGoToHistory: () => void;
  onCreateNew: () => void;
}

export default function FundRequestSuccessDialog({
  open,
  onOpenChange,
  request,
  companyBankName,
  onGoToHistory,
  onCreateNew,
}: FundRequestSuccessDialogProps) {
  if (!request) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md rounded-2xl">
        <DialogHeader className="items-center text-center">
          <div className="mb-2 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 dark:bg-emerald-950/40">
            <CheckCircle2 className="h-8 w-8 text-emerald-600" />
          </div>
          <DialogTitle className="text-xl text-[#001F5B] dark:text-white">
            Fund Request Submitted Successfully
          </DialogTitle>
          <DialogDescription>
            Your request has been sent for approval. You will be notified once it is processed.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 rounded-2xl border border-slate-100 bg-slate-50/80 p-4 text-sm dark:border-slate-800 dark:bg-slate-900/50">
          <div className="flex items-center justify-between gap-3">
            <span className="text-slate-500">Reference Number</span>
            <span className="font-semibold text-[#001F5B] dark:text-white">
              {request.referenceNumber || request.requestId}
            </span>
          </div>
          <div className="flex items-center justify-between gap-3">
            <span className="text-slate-500">Amount</span>
            <span className="font-bold text-[#001F5B] dark:text-white">
              {formatCurrency(request.amount)}
            </span>
          </div>
          <div className="flex items-center justify-between gap-3">
            <span className="text-slate-500">Bank Name</span>
            <span className="text-right font-medium text-slate-700 dark:text-slate-200">
              {companyBankName || request.companyBankName || "—"}
            </span>
          </div>
          <div className="flex items-center justify-between gap-3">
            <span className="text-slate-500">Payment Mode</span>
            <span className="font-medium text-slate-700 dark:text-slate-200">
              {formatPaymentModeLabel(request.paymentMode)}
            </span>
          </div>
          <div className="flex items-center justify-between gap-3">
            <span className="text-slate-500">Date</span>
            <span className="font-medium text-slate-700 dark:text-slate-200">
              {formatFundRequestDateOnly(request.paymentDate)}
            </span>
          </div>
          <div className="flex items-center justify-between gap-3">
            <span className="text-slate-500">Status</span>
            <FundRequestStatusBadge status={request.status || "pending"} />
          </div>
        </div>

        <DialogFooter className="flex-col gap-2 sm:flex-col">
          <Button type="button" className="w-full" onClick={onGoToHistory}>
            View History
          </Button>
          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={onCreateNew}
          >
            New Fund Request
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

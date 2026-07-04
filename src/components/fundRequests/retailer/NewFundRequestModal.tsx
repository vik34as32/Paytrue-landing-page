"use client";

import { useEffect, useState } from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { Landmark, Loader2, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogDescription,
  DialogPortal,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/src/hooks/useIsMobile";
import FundRequestForm, {
  type FundRequestFormValues,
} from "./FundRequestForm";
import type { CompanyBankAccount } from "@/src/types/fundRequest";

const FORM_ID = "new-fund-request-form";

/** Compact premium width — fits form content without stretching */
const MODAL_MAX_W = 580;

interface NewFundRequestModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bankAccounts: CompanyBankAccount[];
  banksLoading?: boolean;
  banksError?: boolean;
  submitting?: boolean;
  uploadProgress?: number;
  resetSignal?: number;
  onSubmit: (values: FundRequestFormValues) => void;
}

function ModalHeader({ onClose }: { onClose: () => void }) {
  return (
    <header className="relative z-10 shrink-0 border-b border-slate-100 bg-white px-6 py-4 pr-14">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#0A84FF] to-[#0057D9] text-white shadow-md shadow-blue-500/25">
          <Landmark className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <DialogTitle className="text-base font-bold leading-tight text-[#001F5B]">
            New Fund Request
          </DialogTitle>
          <DialogDescription className="mt-0.5 text-xs leading-snug text-slate-500">
            Select a deposit account and upload your payment proof.
          </DialogDescription>
        </div>
      </div>
      <DialogPrimitive.Close
        onClick={onClose}
        className="absolute right-4 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#1565d8]/25"
        aria-label="Close"
      >
        <X className="h-4 w-4" />
      </DialogPrimitive.Close>
    </header>
  );
}

function ModalFooter({
  submitting,
  onCancel,
}: {
  submitting: boolean;
  onCancel: () => void;
}) {
  return (
    <footer className="flex shrink-0 items-center justify-between gap-3 border-t border-slate-100 bg-slate-50/60 px-6 py-4">
      <Button
        type="button"
        variant="outline"
        disabled={submitting}
        onClick={onCancel}
        className="h-10 rounded-xl border-slate-200 bg-white px-5 text-sm font-medium text-slate-700"
      >
        Cancel
      </Button>
      <Button
        type="submit"
        form={FORM_ID}
        disabled={submitting}
        className={cn(
          "h-10 gap-2 rounded-xl px-5 text-sm font-semibold text-white",
          "bg-gradient-to-r from-[#0A84FF] to-[#0057D9] shadow-md shadow-blue-500/25",
          "hover:from-[#0077ED] hover:to-[#004FC4]"
        )}
      >
        {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
        {submitting ? "Submitting..." : "Submit Request"}
      </Button>
    </footer>
  );
}

export default function NewFundRequestModal({
  open,
  onOpenChange,
  bankAccounts,
  banksLoading = false,
  banksError = false,
  submitting = false,
  uploadProgress = 0,
  resetSignal = 0,
  onSubmit,
}: NewFundRequestModalProps) {
  const [selectedBankId, setSelectedBankId] = useState("");
  const isMobile = useIsMobile();

  useEffect(() => {
    if (!open) setSelectedBankId("");
  }, [open]);

  useEffect(() => {
    if (resetSignal > 0) setSelectedBankId("");
  }, [resetSignal]);

  const formProps = {
    formId: FORM_ID,
    bankAccounts,
    selectedBankId,
    onSelectBank: setSelectedBankId,
    banksLoading,
    banksError,
    submitting,
    uploadProgress,
    resetSignal,
    onSubmit,
  };

  const desktopWidth = `min(${MODAL_MAX_W}px,calc(100vw-var(--rt-sidebar-w-tablet)-50px))`;
  const desktopWidthXl = `min(${MODAL_MAX_W}px,calc(100vw-var(--rt-sidebar-w-desktop)-50px))`;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogPortal>
        <DialogPrimitive.Overlay
          className={cn(
            /* z-[55] sits above app header (z-50), below sidebar (z-60) */
            "fixed z-[55] bg-[#0b1f3a]/40 backdrop-blur-[4px]",
            "duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out",
            "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
            isMobile
              ? "inset-0"
              : cn(
                  "inset-y-0 right-0 left-0",
                  "md:left-[var(--rt-sidebar-w-tablet)]",
                  "xl:left-[var(--rt-sidebar-w-desktop)]"
                )
          )}
        />

        <DialogPrimitive.Content
          className={cn(
            "fund-request-modal fixed z-[56] flex flex-col overflow-hidden bg-white text-slate-900 outline-none [color-scheme:light]",
            "rounded-2xl border border-slate-200/80",
            "shadow-[0_20px_50px_-12px_rgba(11,31,58,0.18)]",
            "duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out",
            "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
            isMobile
              ? cn(
                  "left-4 right-4 bottom-4 top-auto max-h-[calc(100vh-50px)] w-auto",
                  "data-[state=closed]:slide-out-to-bottom-full data-[state=open]:slide-in-from-bottom-full"
                )
              : cn(
                  "top-[calc(50%+32px)] max-h-[calc(100vh-80px)] -translate-y-1/2",
                  "left-1/2 -translate-x-1/2",
                  "md:left-[calc(50%+var(--rt-sidebar-w-tablet)/2)]",
                  "xl:left-[calc(50%+var(--rt-sidebar-w-desktop)/2)]",
                  "w-[min(580px,calc(100vw-50px))]",
                  "md:w-[var(--fund-modal-w)]",
                  "xl:w-[var(--fund-modal-w-xl)]",
                  "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95"
                )
          )}
          style={
            !isMobile
              ? ({
                  ["--fund-modal-w" as string]: desktopWidth,
                  ["--fund-modal-w-xl" as string]: desktopWidthXl,
                } as React.CSSProperties)
              : undefined
          }
          onOpenAutoFocus={(event) => event.preventDefault()}
          onInteractOutside={(event) => {
            if (submitting) event.preventDefault();
          }}
        >
          <ModalHeader onClose={() => onOpenChange(false)} />

          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-6 py-5">
            <FundRequestForm {...formProps} />
          </div>

          <ModalFooter
            submitting={submitting}
            onCancel={() => onOpenChange(false)}
          />
        </DialogPrimitive.Content>
      </DialogPortal>
    </Dialog>
  );
}

export function NewFundRequestButton({
  onClick,
  className,
}: {
  onClick: () => void;
  className?: string;
}) {
  return (
    <Button
      type="button"
      onClick={onClick}
      className={cn(
        "gap-2 rounded-xl bg-gradient-to-r from-[#0A84FF] to-[#0057D9]",
        "shadow-md shadow-blue-200/40",
        className
      )}
    >
      <Plus className="h-4 w-4" />
      New Fund Request
    </Button>
  );
}

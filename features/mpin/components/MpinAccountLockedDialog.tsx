"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, ShieldAlert } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface MpinAccountLockedDialogProps {
  open: boolean;
  onOpenChange?: (open: boolean) => void;
  dashboardHref?: string;
  message?: string;
}

const DEFAULT_LOCK_MESSAGE =
  "Your account has been temporarily locked due to multiple incorrect MPIN attempts. You cannot use DMT, AEPS, or UPI ATM for the next 1 hour.";

export function MpinAccountLockedDialog({
  open,
  onOpenChange,
  dashboardHref = "/rt/retailer",
  message = DEFAULT_LOCK_MESSAGE,
}: MpinAccountLockedDialogProps) {
  const router = useRouter();

  const handleClose = () => onOpenChange?.(false);

  const goDashboard = () => {
    onOpenChange?.(false);
    router.push(dashboardHref);
  };

  return (
    <Dialog open={open} onOpenChange={(next) => !next && handleClose()}>
      <DialogContent className="max-w-md gap-0 overflow-hidden border-0 p-0 sm:rounded-3xl [&>button]:hidden">
        <div className="bg-gradient-to-br from-rose-700 via-rose-600 to-orange-500 px-6 py-7 text-white">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15 ring-1 ring-white/25 backdrop-blur">
            <Lock className="h-7 w-7" />
          </div>
          <DialogHeader>
            <DialogTitle className="text-xl font-extrabold text-white">
              Account Temporarily Locked
            </DialogTitle>
            <DialogDescription className="text-rose-50/95">
              Security lockout active for 1 hour
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="space-y-4 px-6 py-5">
          <div className="flex gap-3 rounded-2xl border border-rose-100 bg-rose-50/80 px-4 py-3 text-sm text-rose-900">
            <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0 text-rose-600" />
            <p className="leading-relaxed">{message}</p>
          </div>
        </div>

        <DialogFooter className="gap-2 border-t border-slate-100 bg-slate-50 px-6 py-4 sm:justify-end">
          <Button type="button" variant="outline" onClick={handleClose}>
            Close
          </Button>
          <Button type="button" onClick={goDashboard}>
            Go to Dashboard
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/** Imperative helper for full-viewport lock overlay outside dialog trees if needed */
export function useMpinLockDialog() {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState(DEFAULT_LOCK_MESSAGE);

  useEffect(() => {
    if (!open) setMessage(DEFAULT_LOCK_MESSAGE);
  }, [open]);

  return {
    open,
    message,
    showLock: (nextMessage?: string) => {
      if (nextMessage) setMessage(nextMessage);
      setOpen(true);
    },
    hideLock: () => setOpen(false),
    setOpen,
  };
}

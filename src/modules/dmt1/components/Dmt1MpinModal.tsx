"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AnimatedMpinInput, MPIN_LENGTH } from "@/features/mpin";

interface Dmt1MpinModalProps {
  open: boolean;
  loading?: boolean;
  mpin: string;
  onChange: (value: string) => void;
  onClose: () => void;
  onSubmit: () => void;
}

/** DMT1-specific MPIN UI wrapper — MPIN is never persisted or logged. */
export default function Dmt1MpinModal({
  open,
  loading,
  mpin,
  onChange,
  onClose,
  onSubmit,
}: Dmt1MpinModalProps) {
  return (
    <Dialog open={open} onOpenChange={(next) => !next && !loading && onClose()}>
      <DialogContent className="max-w-md rounded-2xl">
        <DialogHeader>
          <DialogTitle>Authorize DMT1 Transfer</DialogTitle>
          <DialogDescription>
            Enter your 4-digit MPIN to confirm this transaction.
          </DialogDescription>
        </DialogHeader>

        <AnimatedMpinInput
          label="MPIN"
          hint="MPIN is used once for authorization and is not stored."
          value={mpin}
          onChange={onChange}
          length={MPIN_LENGTH}
          autoFocus
          disabled={loading}
          allowPaste={false}
        />

        <div className="flex gap-2 pt-2">
          <Button variant="outline" onClick={onClose} disabled={loading} className="flex-1">
            Cancel
          </Button>
          <Button
            onClick={onSubmit}
            disabled={loading || mpin.length !== MPIN_LENGTH}
            className="flex-1"
          >
            {loading ? "Processing…" : "Confirm Transfer"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

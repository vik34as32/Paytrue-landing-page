"use client";

import { Landmark, WalletCards } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import AepsBankSettlementPanel from "./AepsBankSettlementPanel";
import AepsMainWalletTopupPanel from "./AepsMainWalletTopupPanel";

export type AepsTransferTarget = "main" | "bank";

const TABS: Array<{ value: AepsTransferTarget; label: string; Icon: typeof Landmark }> = [
  { value: "main", label: "Main Wallet", Icon: WalletCards },
  { value: "bank", label: "Bank Account", Icon: Landmark },
];

export default function AepsWalletTransferModal({
  open,
  onOpenChange,
  target,
  onTargetChange,
  balance,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  target: AepsTransferTarget;
  onTargetChange: (target: AepsTransferTarget) => void;
  balance: number;
}) {
  const close = () => onOpenChange(false);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] overflow-y-auto rounded-2xl sm:max-w-[560px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#1565d8] to-[#0b4fb3] text-white">
              {target === "bank" ? <Landmark className="h-5 w-5" /> : <WalletCards className="h-5 w-5" />}
            </span>
            Transfer AEPS Balance
          </DialogTitle>
          <DialogDescription>
            {target === "bank"
              ? "Settle your AEPS balance to your own linked bank account."
              : "Move AEPS balance into your main wallet."}
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-1 rounded-xl bg-slate-100 p-1">
          {TABS.map(({ value, label, Icon }) => (
            <button
              key={value}
              type="button"
              onClick={() => onTargetChange(value)}
              className={cn(
                "flex items-center justify-center gap-2 rounded-lg py-2 text-sm font-semibold transition",
                target === value ? "bg-white text-[#1565d8] shadow-sm" : "text-slate-500 hover:text-slate-700"
              )}
            >
              <Icon className="h-4 w-4" />
              {label}
            </button>
          ))}
        </div>

        {open ? (
          <>
            <div className={target === "main" ? undefined : "hidden"}>
              <AepsMainWalletTopupPanel balance={balance} onClose={close} />
            </div>
            <div className={target === "bank" ? undefined : "hidden"}>
              <AepsBankSettlementPanel balance={balance} onClose={close} />
            </div>
          </>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}

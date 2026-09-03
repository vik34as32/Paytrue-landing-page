"use client";

import { motion } from "framer-motion";
import { Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AnimatedMpinInput, MPIN_LENGTH } from "@/features/mpin";
import { formatInr, maskCard } from "../lib/ccbp-normalizers";
import { detectCardNetwork, networkLabel } from "../lib/ccbp-bin";
import type { CcbpIssuer, CcbpPaymentType } from "../types";

export default function CcbpConfirmStep({
  issuer,
  cardNumber,
  name,
  amount,
  paymentType,
  ifscCode,
  mpin,
  paying,
  onMpin,
  onBack,
  onPay,
}: {
  issuer: CcbpIssuer;
  cardNumber: string;
  name: string;
  amount: number;
  paymentType: CcbpPaymentType;
  ifscCode: string;
  mpin: string;
  paying: boolean;
  onMpin: (value: string) => void;
  onBack: () => void;
  onPay: () => void;
}) {
  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-bold tracking-tight text-[#0b1f3a]">Authorize payment</h2>
        <p className="mt-0.5 text-sm text-slate-500">
          Review the settlement and enter retailer MPIN. This cannot be undone.
        </p>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200">
        <div className="flex items-center justify-between bg-slate-50 px-4 py-3">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
            Settlement summary
          </p>
          <span className="text-lg font-extrabold tabular-nums text-[#0b1f3a]">{formatInr(amount)}</span>
        </div>
        <dl className="divide-y divide-slate-100 px-4">
          <Row label="Issuing bank" value={issuer.name} />
          <Row label="Network" value={networkLabel(detectCardNetwork(cardNumber)) || "—"} />
          <Row label="Card" value={maskCard(cardNumber)} />
          <Row label="Cardholder" value={name} />
          <Row label="IFSC" value={ifscCode} />
          <Row label="Rail" value={paymentType} />
        </dl>
      </div>

      <div className="rounded-2xl border border-indigo-100 bg-indigo-50/40 p-4">
        <AnimatedMpinInput
          label="Retailer MPIN"
          hint="4-digit MPIN authorizes wallet debit"
          value={mpin}
          onChange={onMpin}
          length={MPIN_LENGTH}
          autoFocus
          disabled={paying}
          allowPaste={false}
        />
      </div>

      <div className="grid grid-cols-2 gap-2">
        <Button type="button" variant="outline" className="h-12 rounded-xl" disabled={paying} onClick={onBack}>
          Back
        </Button>
        <Button
          type="button"
          disabled={paying || mpin.length !== MPIN_LENGTH}
          className="h-12 rounded-xl bg-[#0b1f3a] font-bold hover:bg-[#132a4a]"
          onClick={onPay}
        >
          {paying ? "Authorizing…" : `Pay ${formatInr(amount)}`}
        </Button>
      </div>

      {paying ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center justify-center gap-2 text-sm text-indigo-700"
        >
          <Lock className="h-4 w-4 animate-pulse" />
          Connecting to bank rails…
        </motion.div>
      ) : null}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 py-2.5 text-sm">
      <dt className="text-slate-500">{label}</dt>
      <dd className="max-w-[62%] truncate text-right font-semibold text-[#0b1f3a]">{value || "—"}</dd>
    </div>
  );
}

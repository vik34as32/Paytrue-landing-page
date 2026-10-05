"use client";

import { motion } from "framer-motion";
import { BadgeCheck, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AnimatedMpinInput, MPIN_LENGTH } from "@/features/mpin";
import UpiAppMark from "./UpiAppMark";
import { detectUpiApp, formatInr } from "../lib/upi-payout-normalizers";
import type { UpiPayoutPreview } from "../types";

export default function UpiConfirmStep({
  vpa,
  payeeName,
  payeeMobile,
  verified,
  amount,
  preview,
  mpin,
  paying,
  onMpin,
  onBack,
  onPay,
}: {
  vpa: string;
  payeeName: string;
  payeeMobile: string;
  verified: boolean;
  amount: number;
  preview: UpiPayoutPreview | null;
  mpin: string;
  paying: boolean;
  onMpin: (value: string) => void;
  onBack: () => void;
  onPay: () => void;
}) {
  const app = detectUpiApp(vpa);
  const total = preview?.totalDebit || amount;
  const rows: { label: string; value: string }[] = [
    { label: "UPI app", value: app?.name ?? "UPI" },
    ...(payeeMobile ? [{ label: "Mobile", value: payeeMobile }] : []),
    { label: "Amount", value: formatInr(amount) },
    ...(preview ? [{ label: "Charges", value: formatInr(preview.charges) }] : []),
    ...(preview && preview.gst > 0 ? [{ label: "GST", value: formatInr(preview.gst) }] : []),
  ];

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-bold tracking-tight text-[#0a1630]">Authorize transfer</h2>
        <p className="mt-0.5 text-sm text-slate-500">Check the details and enter your MPIN. UPI transfers cannot be reversed.</p>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200">
        <div className="flex items-center gap-3 bg-gradient-to-r from-slate-50 to-violet-50/50 px-4 py-4">
          <UpiAppMark vpa={vpa} />
          <div className="min-w-0 flex-1">
            <p className="flex items-center gap-1 truncate font-bold text-[#0a1630]">
              {payeeName}
              {verified ? <BadgeCheck className="h-4 w-4 shrink-0 text-emerald-500" /> : null}
            </p>
            <p className="truncate font-mono text-xs text-slate-500">{vpa}</p>
          </div>
        </div>
        <dl className="divide-y divide-slate-100 px-4">
          {rows.map((row, index) => (
            <motion.div
              key={row.label}
              initial={{ opacity: 0, x: 8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.05 + index * 0.05 }}
              className="flex items-center justify-between gap-3 py-2.5 text-sm"
            >
              <dt className="text-slate-500">{row.label}</dt>
              <dd className="font-semibold tabular-nums text-[#0a1630]">{row.value}</dd>
            </motion.div>
          ))}
        </dl>
        <div className="flex items-center justify-between bg-[#0a1630] px-4 py-3 text-white">
          <span className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-300">Total debit</span>
          <span className="text-lg font-extrabold tabular-nums">{formatInr(total)}</span>
        </div>
      </div>

      {!verified ? (
        <div className="flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800">
          <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0" />
          UPI ID was not verified. Make sure the ID belongs to {payeeName || "the beneficiary"}.
        </div>
      ) : null}

      <div className="rounded-2xl border border-violet-100 bg-violet-50/40 p-4">
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
        <motion.div whileTap={{ scale: mpin.length === MPIN_LENGTH ? 0.97 : 1 }}>
          <Button
            type="button"
            disabled={paying || mpin.length !== MPIN_LENGTH}
            onClick={onPay}
            className="relative h-12 w-full overflow-hidden rounded-xl bg-gradient-to-r from-emerald-500 via-teal-500 to-violet-600 font-bold text-white shadow-lg shadow-violet-200 hover:opacity-95"
          >
            {mpin.length === MPIN_LENGTH && !paying ? (
              <motion.span
                className="pointer-events-none absolute inset-y-0 w-16 bg-white/25 blur-md"
                initial={{ x: "-120%" }}
                animate={{ x: "520%" }}
                transition={{ duration: 1.6, repeat: Infinity, repeatDelay: 0.6 }}
              />
            ) : null}
            <span className="relative">{paying ? "Sending…" : `Send ${formatInr(total)}`}</span>
          </Button>
        </motion.div>
      </div>
    </div>
  );
}

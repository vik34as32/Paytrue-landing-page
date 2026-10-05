"use client";

import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

export type UpiPayoutStep = "payee" | "amount" | "confirm";

export const UPI_PAYOUT_STEPS: UpiPayoutStep[] = ["payee", "amount", "confirm"];

const LABELS: Record<UpiPayoutStep, string> = {
  payee: "UPI ID",
  amount: "Amount",
  confirm: "Authorize",
};

export default function UpiPayoutStepper({
  step,
  canJump,
  onJump,
}: {
  step: UpiPayoutStep;
  canJump: (step: UpiPayoutStep) => boolean;
  onJump: (step: UpiPayoutStep) => void;
}) {
  const current = UPI_PAYOUT_STEPS.indexOf(step);

  return (
    <ol className="flex items-center gap-2">
      {UPI_PAYOUT_STEPS.map((item, index) => {
        const done = index < current;
        const active = index === current;
        const clickable = !active && canJump(item);
        return (
          <li key={item} className="flex flex-1 items-center gap-2">
            <button
              type="button"
              disabled={!clickable}
              onClick={() => onJump(item)}
              className={cn(
                "flex items-center gap-2 rounded-full pr-2 text-left transition",
                clickable ? "cursor-pointer hover:opacity-80" : "cursor-default"
              )}
            >
              <span
                className={cn(
                  "relative flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold ring-1 transition-colors",
                  done && "bg-emerald-500 text-white ring-emerald-500",
                  active && "bg-[#0a1630] text-white ring-[#0a1630]",
                  !done && !active && "bg-white text-slate-400 ring-slate-200"
                )}
              >
                {active ? (
                  <motion.span
                    className="absolute inset-0 rounded-full ring-2 ring-violet-400/60"
                    animate={{ scale: [1, 1.25, 1], opacity: [0.8, 0, 0.8] }}
                    transition={{ duration: 1.8, repeat: Infinity }}
                  />
                ) : null}
                {done ? <Check className="h-4 w-4" strokeWidth={3} /> : index + 1}
              </span>
              <span
                className={cn(
                  "hidden text-xs font-semibold sm:inline",
                  active ? "text-[#0a1630]" : done ? "text-emerald-700" : "text-slate-400"
                )}
              >
                {LABELS[item]}
              </span>
            </button>
            {index < UPI_PAYOUT_STEPS.length - 1 ? (
              <span className="relative h-0.5 flex-1 overflow-hidden rounded-full bg-slate-100">
                <motion.span
                  className="absolute inset-y-0 left-0 bg-gradient-to-r from-emerald-400 to-violet-500"
                  initial={false}
                  animate={{ width: done ? "100%" : "0%" }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                />
              </span>
            ) : null}
          </li>
        );
      })}
    </ol>
  );
}

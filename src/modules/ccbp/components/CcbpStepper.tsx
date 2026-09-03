"use client";

import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { CCBP_STEPS, type CcbpStep } from "../lib/ccbp-form-schema";

const LABELS: Record<CcbpStep, string> = {
  card: "Card",
  amount: "Amount",
  confirm: "Pay",
};

export default function CcbpStepper({
  step,
  onJump,
}: {
  step: CcbpStep;
  onJump?: (next: CcbpStep) => void;
}) {
  const active = CCBP_STEPS.indexOf(step);

  return (
    <ol className="grid grid-cols-3 gap-2">
      {CCBP_STEPS.map((item, index) => {
        const done = index < active;
        const current = index === active;
        return (
          <li key={item}>
            <button
              type="button"
              disabled={!done || !onJump}
              onClick={() => onJump?.(item)}
              className="group w-full text-left disabled:cursor-default"
            >
              <div
                className={cn(
                  "h-1 rounded-full transition-colors duration-300",
                  done || current ? "bg-indigo-600" : "bg-slate-200"
                )}
              />
              <div className="mt-2 flex items-center gap-1.5">
                <span
                  className={cn(
                    "flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold transition-all duration-300",
                    done && "bg-indigo-600 text-white",
                    current && "bg-indigo-600 text-white ring-4 ring-indigo-100",
                    !done && !current && "bg-slate-200 text-slate-500"
                  )}
                >
                  {done ? <Check className="h-3 w-3" /> : index + 1}
                </span>
                <span
                  className={cn(
                    "text-[11px] font-semibold sm:text-xs",
                    current ? "text-[#0b1f3a]" : "text-slate-400"
                  )}
                >
                  {LABELS[item]}
                </span>
              </div>
            </button>
          </li>
        );
      })}
    </ol>
  );
}

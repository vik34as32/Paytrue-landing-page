"use client";

import type { Dmt3FlowStep } from "../types/dmt3.types";

const STEPS: { id: Dmt3FlowStep; label: string }[] = [
  { id: "beneficiaries", label: "Beneficiary" },
  { id: "transfer", label: "Amount" },
  { id: "commission", label: "Commission" },
  { id: "review", label: "Review" },
  { id: "mpin", label: "MPIN" },
  { id: "status", label: "Status" },
];

const ORDER: Dmt3FlowStep[] = STEPS.map((s) => s.id);

interface Dmt3HeaderProps {
  step: Dmt3FlowStep;
}

export default function Dmt3Header({ step }: Dmt3HeaderProps) {
  const activeIndex = ORDER.indexOf(
    step === "add-beneficiary" ? "beneficiaries" : step === "processing" ? "mpin" : step
  );

  return (
    <div className="w-full rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex flex-wrap items-center gap-2">
        {STEPS.map((item, index) => {
          const done = activeIndex > index;
          const active = activeIndex === index;
          return (
            <div key={item.id} className="flex items-center gap-2">
              <div
                className={`flex h-7 min-w-[7rem] items-center justify-center rounded-full px-3 text-[11px] font-bold ${
                  active
                    ? "bg-[#1565d8] text-white"
                    : done
                      ? "bg-emerald-50 text-emerald-700"
                      : "bg-slate-100 text-slate-500"
                }`}
              >
                {item.label}
              </div>
              {index < STEPS.length - 1 && (
                <span className="hidden h-px w-4 bg-slate-200 sm:block" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

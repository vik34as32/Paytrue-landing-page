"use client";

import { cn } from "@/lib/utils";

interface StepIndicatorProps {
  currentStep: 1 | 2;
  totalSteps?: 2;
  className?: string;
  stepLabel?: string;
}

export function StepIndicator({
  currentStep,
  totalSteps = 2,
  className,
  stepLabel,
}: StepIndicatorProps) {
  return (
    <div className={cn("space-y-2.5", className)}>
      <div className="flex items-center justify-between text-[11px] font-semibold uppercase tracking-[0.14em]">
        <span className="text-blue-100/90">
          Step {currentStep} of {totalSteps}
        </span>
        <span className="text-white/80">
          {stepLabel ?? (currentStep === 1 ? "Verify" : "Create New")}
        </span>
      </div>
      <div className="flex gap-2">
        {Array.from({ length: totalSteps }).map((_, i) => {
          const step = (i + 1) as 1 | 2;
          const active = step <= currentStep;
          return (
            <div
              key={step}
              className={cn(
                "h-1.5 flex-1 overflow-hidden rounded-full bg-white/20",
                active && "bg-white/25"
              )}
            >
              <div
                className={cn(
                  "h-full rounded-full bg-white transition-all duration-500 ease-out",
                  step < currentStep && "w-full",
                  step === currentStep && "w-full",
                  step > currentStep && "w-0"
                )}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}

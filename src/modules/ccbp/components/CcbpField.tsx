"use client";

import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export default function CcbpField({
  label,
  hint,
  error,
  className,
  children,
}: {
  label: string;
  hint?: string;
  error?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <div className="flex items-baseline justify-between gap-3">
        <Label className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">
          {label}
        </Label>
        {hint && !error ? <span className="text-[11px] text-slate-400">{hint}</span> : null}
      </div>
      {children}
      {error ? (
        <p className="text-xs font-medium text-rose-600" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}

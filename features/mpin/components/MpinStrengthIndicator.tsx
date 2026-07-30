"use client";

import { cn } from "@/lib/utils";
import { getMpinStrength } from "../schemas";

interface MpinStrengthIndicatorProps {
  mpin: string;
  className?: string;
}

export function MpinStrengthIndicator({ mpin, className }: MpinStrengthIndicatorProps) {
  if (!mpin) return null;
  const strength = getMpinStrength(mpin);

  return (
    <div className={cn("space-y-1.5", className)}>
      <div className="flex items-center justify-between text-xs">
        <span className="font-medium text-slate-500 dark:text-slate-400">Strength</span>
        <span
          className={cn(
            "font-semibold",
            strength.label === "Strong" && "text-emerald-600 dark:text-emerald-400",
            strength.label === "Fair" && "text-sky-600 dark:text-sky-400",
            strength.label === "Weak" && "text-amber-600 dark:text-amber-400"
          )}
        >
          {strength.label}
        </span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
        <div
          className={cn("h-full rounded-full transition-all duration-300", strength.color)}
          style={{ width: `${strength.score}%` }}
        />
      </div>
      <p className="text-[11px] text-slate-400 dark:text-slate-500">
        Use 4 digits and avoid sequences like 1234 or repeated digits.
      </p>
    </div>
  );
}

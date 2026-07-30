"use client";

import { useEffect, useRef } from "react";
import { Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";
import { MPIN_LENGTH } from "../schemas";

interface MpinInputFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  revealed: boolean;
  onToggleReveal: () => void;
  error?: string;
  /** Fixed MPIN length (4 digits). */
  maxLength?: number;
  autoFocus?: boolean;
  disabled?: boolean;
  className?: string;
  hint?: string;
}

/**
 * Web-style MPIN field — keyboard entry only (no on-screen numeric keypad).
 */
export function MpinInputField({
  label,
  value,
  onChange,
  revealed,
  onToggleReveal,
  error,
  maxLength = MPIN_LENGTH,
  autoFocus = false,
  disabled = false,
  className,
  hint,
}: MpinInputFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const slots = maxLength;

  useEffect(() => {
    if (autoFocus) inputRef.current?.focus();
  }, [autoFocus]);

  const digits = value.split("");

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center justify-between gap-2">
        <label className="text-sm font-semibold text-slate-700">{label}</label>
        <button
          type="button"
          onClick={onToggleReveal}
          className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium text-[#1565d8] hover:bg-blue-50"
          aria-label={revealed ? "Hide MPIN" : "Show MPIN"}
        >
          {revealed ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
          {revealed ? "Hide" : "Show"}
        </button>
      </div>

      <div className="relative">
        <input
          ref={inputRef}
          type={revealed ? "text" : "password"}
          inputMode="numeric"
          pattern="[0-9]*"
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck={false}
          data-lpignore="true"
          data-form-type="other"
          name={`mpin-${label.replace(/\s+/g, "-").toLowerCase()}`}
          value={value}
          disabled={disabled}
          maxLength={maxLength}
          onChange={(e) => {
            const next = e.target.value.replace(/\D/g, "").slice(0, maxLength);
            onChange(next);
          }}
          onCopy={(e) => e.preventDefault()}
          onCut={(e) => e.preventDefault()}
          onPaste={(e) => e.preventDefault()}
          className="absolute inset-0 z-10 h-full w-full cursor-text opacity-0"
          aria-label={label}
        />

        <button
          type="button"
          disabled={disabled}
          onClick={() => inputRef.current?.focus()}
          className={cn(
            "flex w-full items-center justify-center gap-2 rounded-xl border bg-white px-3 py-3 transition",
            error
              ? "border-rose-300 ring-2 ring-rose-100"
              : "border-slate-200 hover:border-[#1565d8]/50 focus-within:border-[#1565d8] focus-within:ring-2 focus-within:ring-[#1565d8]/15"
          )}
        >
          {Array.from({ length: slots }).map((_, index) => {
            const digit = digits[index];
            const filled = digit != null && digit !== "";
            const isActive = index === value.length && value.length < maxLength;
            return (
              <span
                key={index}
                className={cn(
                  "flex h-11 w-9 items-center justify-center rounded-lg border text-base font-semibold tabular-nums sm:h-12 sm:w-10",
                  filled
                    ? "border-[#1565d8] bg-[#1565d8]/5 text-[#001F5B]"
                    : "border-slate-200 bg-slate-50 text-transparent",
                  isActive && "border-[#1565d8] ring-2 ring-[#1565d8]/20"
                )}
                aria-hidden
              >
                {filled ? (revealed ? digit : "•") : ""}
              </span>
            );
          })}
        </button>
      </div>

      {hint && !error ? (
        <p className="text-[11px] text-slate-400">{hint}</p>
      ) : null}
      {error ? (
        <p className="text-xs font-medium text-rose-600">{error}</p>
      ) : null}
    </div>
  );
}

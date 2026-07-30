"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ClipboardEvent,
  type KeyboardEvent,
} from "react";
import { motion } from "framer-motion";
import { Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";
import { MPIN_LENGTH } from "../schemas";

export interface AnimatedMpinInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  length?: number;
  autoFocus?: boolean;
  disabled?: boolean;
  error?: string;
  success?: boolean;
  hint?: string;
  className?: string;
  /** When false, paste is blocked (secure verify flows). Default true. */
  allowPaste?: boolean;
}

export function AnimatedMpinInput({
  label,
  value,
  onChange,
  length = MPIN_LENGTH,
  autoFocus = false,
  disabled = false,
  error,
  success = false,
  hint,
  className,
  allowPaste = true,
}: AnimatedMpinInputProps) {
  const [revealed, setRevealed] = useState(false);
  const refs = useRef<Array<HTMLInputElement | null>>([]);

  const focusBox = useCallback(
    (index: number) => {
      const clamped = Math.max(0, Math.min(length - 1, index));
      requestAnimationFrame(() => refs.current[clamped]?.focus());
    },
    [length]
  );

  useEffect(() => {
    if (autoFocus) {
      focusBox(Math.min(value.length, length - 1));
    }
  }, [autoFocus, focusBox, length, value.length]);

  const applyValue = (next: string, focusAt?: number) => {
    const cleaned = next.replace(/\D/g, "").slice(0, length);
    onChange(cleaned);
    if (typeof focusAt === "number") {
      focusBox(focusAt);
    } else if (cleaned.length < length) {
      focusBox(cleaned.length);
    } else {
      focusBox(length - 1);
    }
  };

  const handleInput = (index: number, raw: string) => {
    if (disabled) return;
    const digitsOnly = raw.replace(/\D/g, "");

    if (!digitsOnly) {
      applyValue(value.slice(0, index) + value.slice(index + 1), index);
      return;
    }

    if (digitsOnly.length > 1) {
      applyValue(value.slice(0, index) + digitsOnly, Math.min(index + digitsOnly.length, length - 1));
      return;
    }

    const next =
      value.slice(0, index) + digitsOnly + value.slice(index + 1);
    applyValue(next.replace(/\D/g, "").slice(0, length), index + 1);
  };

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (disabled) return;

    if (e.key === "Backspace") {
      e.preventDefault();
      if (value[index]) {
        applyValue(value.slice(0, index) + value.slice(index + 1), index);
      } else if (index > 0) {
        applyValue(value.slice(0, index - 1) + value.slice(index), index - 1);
      }
      return;
    }

    if (e.key === "ArrowLeft") {
      e.preventDefault();
      focusBox(index - 1);
      return;
    }

    if (e.key === "ArrowRight") {
      e.preventDefault();
      focusBox(index + 1);
    }
  };

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (!allowPaste || disabled) return;
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, length);
    if (!pasted) return;
    applyValue(pasted, Math.min(pasted.length, length - 1));
  };

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center justify-between gap-2">
        <label className="text-[13px] font-semibold tracking-wide text-slate-700">
          {label}
        </label>
        <button
          type="button"
          onClick={() => setRevealed((r) => !r)}
          className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-[#1565d8]"
          aria-label={revealed ? "Hide MPIN" : "Show MPIN"}
          tabIndex={-1}
        >
          {revealed ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>

      <div className="flex items-center justify-between gap-1.5 sm:gap-2">
        {Array.from({ length }).map((_, index) => {
          const digit = value[index] ?? "";
          const filled = digit !== "";
          const isActive = index === Math.min(value.length, length - 1);

          return (
            <motion.div
              key={index}
              animate={filled ? { scale: [1, 1.06, 1] } : { scale: 1 }}
              transition={{ duration: 0.18 }}
              className="relative flex-1"
            >
              <input
                ref={(el) => {
                  refs.current[index] = el;
                }}
                type={revealed ? "text" : "password"}
                inputMode="numeric"
                pattern="[0-9]*"
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="off"
                spellCheck={false}
                data-lpignore="true"
                data-form-type="other"
                maxLength={1}
                disabled={disabled}
                value={digit}
                onChange={(e) => handleInput(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                onPaste={handlePaste}
                onFocus={() => focusBox(index > value.length ? value.length : index)}
                className={cn(
                  "h-11 w-full rounded-xl border bg-white/90 text-center text-base font-bold tabular-nums text-[#001F5B] outline-none transition-all backdrop-blur-sm",
                  "focus:border-[#1565d8] focus:ring-2 focus:ring-[#1565d8]/20",
                  filled && "border-[#1565d8]/50 bg-[#1565d8]/5",
                  isActive && !error && "border-[#1565d8] shadow-[0_0_0_3px_rgba(21,101,216,0.12)]",
                  error && "border-rose-400 focus:border-rose-500 focus:ring-rose-100",
                  success && "border-emerald-400 bg-emerald-50/80",
                  disabled && "cursor-not-allowed opacity-60"
                )}
                aria-label={`${label} digit ${index + 1}`}
              />
            </motion.div>
          );
        })}
      </div>

      <div className="h-4">
        {error ? (
          <p className="text-[11px] font-medium text-rose-600">{error}</p>
        ) : success ? (
          <p className="text-[11px] font-medium text-emerald-600">MPINs match</p>
        ) : hint ? (
          <p className="text-[11px] text-slate-400">{hint}</p>
        ) : null}
      </div>
    </div>
  );
}

"use client";

import {
  useCallback,
  useEffect,
  useRef,
  type ClipboardEvent,
  type KeyboardEvent,
} from "react";
import { cn } from "@/lib/utils";

const OTP_LENGTH = 6;

interface OtpInputProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  error?: boolean;
  autoFocus?: boolean;
  onComplete?: (value: string) => void;
}

export default function OtpInput({
  value,
  onChange,
  disabled = false,
  error = false,
  autoFocus = true,
  onComplete,
}: OtpInputProps) {
  const refs = useRef<Array<HTMLInputElement | null>>([]);

  const focusBox = useCallback((index: number) => {
    const clamped = Math.max(0, Math.min(OTP_LENGTH - 1, index));
    requestAnimationFrame(() => refs.current[clamped]?.focus());
  }, []);

  useEffect(() => {
    if (autoFocus) focusBox(Math.min(value.length, OTP_LENGTH - 1));
  }, [autoFocus, focusBox, value.length]);

  const applyValue = (next: string, focusAt?: number) => {
    const cleaned = next.replace(/\D/g, "").slice(0, OTP_LENGTH);
    onChange(cleaned);
    if (cleaned.length === OTP_LENGTH) onComplete?.(cleaned);
    if (typeof focusAt === "number") focusBox(focusAt);
    else if (cleaned.length < OTP_LENGTH) focusBox(cleaned.length);
    else focusBox(OTP_LENGTH - 1);
  };

  const handleInput = (index: number, raw: string) => {
    if (disabled) return;
    const digits = raw.replace(/\D/g, "");
    if (!digits) {
      applyValue(value.slice(0, index) + value.slice(index + 1), index);
      return;
    }
    if (digits.length > 1) {
      applyValue(value.slice(0, index) + digits, Math.min(index + digits.length, OTP_LENGTH - 1));
      return;
    }
    const next = value.slice(0, index) + digits + value.slice(index + 1);
    applyValue(next.replace(/\D/g, "").slice(0, OTP_LENGTH), index + 1);
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
    }
    if (e.key === "ArrowRight") {
      e.preventDefault();
      focusBox(index + 1);
    }
  };

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (disabled) return;
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, OTP_LENGTH);
    if (!pasted) return;
    applyValue(pasted, Math.min(pasted.length, OTP_LENGTH - 1));
  };

  return (
    <div className="flex items-center justify-center gap-2 sm:gap-2.5">
      {Array.from({ length: OTP_LENGTH }).map((_, index) => {
        const digit = value[index] ?? "";
        const filled = digit !== "";
        const active = index === Math.min(value.length, OTP_LENGTH - 1);
        return (
          <input
            key={index}
            ref={(el) => {
              refs.current[index] = el;
            }}
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            autoComplete={index === 0 ? "one-time-code" : "off"}
            maxLength={1}
            disabled={disabled}
            value={digit}
            onChange={(e) => handleInput(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            onPaste={handlePaste}
            onFocus={() => focusBox(index > value.length ? value.length : index)}
            aria-label={`OTP digit ${index + 1}`}
            className={cn(
              "h-12 w-10 rounded-xl border bg-white text-center text-lg font-bold tabular-nums text-[#001F5B] outline-none transition sm:h-14 sm:w-12 sm:text-xl",
              "focus:border-[#1565d8] focus:ring-2 focus:ring-[#1565d8]/20",
              filled && "border-[#1565d8]/50 bg-[#1565d8]/5",
              active && !error && "border-[#1565d8] shadow-[0_0_0_3px_rgba(21,101,216,0.12)]",
              error && "border-rose-400 focus:border-rose-500 focus:ring-rose-100",
              disabled && "cursor-not-allowed opacity-60"
            )}
          />
        );
      })}
    </div>
  );
}

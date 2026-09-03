"use client";

import { useEffect, useRef, useState, type ClipboardEvent, type KeyboardEvent } from "react";
import { cn } from "@/lib/utils";

const OTP_LENGTH = 6;

interface Dmt3OtpInputProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  error?: boolean;
}

export default function Dmt3OtpInput({
  value,
  onChange,
  disabled = false,
  error = false,
}: Dmt3OtpInputProps) {
  const refs = useRef<Array<HTMLInputElement | null>>([]);
  const [focused, setFocused] = useState(0);

  useEffect(() => {
    refs.current[Math.min(value.length, OTP_LENGTH - 1)]?.focus();
  }, []);

  const apply = (next: string) => {
    const cleaned = next.replace(/\D/g, "").slice(0, OTP_LENGTH);
    onChange(cleaned);
    const idx = Math.min(cleaned.length, OTP_LENGTH - 1);
    setFocused(idx);
    requestAnimationFrame(() => refs.current[idx]?.focus());
  };

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace") {
      e.preventDefault();
      if (value[index]) apply(value.slice(0, index) + value.slice(index + 1));
      else if (index > 0) apply(value.slice(0, index - 1) + value.slice(index));
    }
    if (e.key === "ArrowLeft") refs.current[Math.max(0, index - 1)]?.focus();
    if (e.key === "ArrowRight") refs.current[Math.min(OTP_LENGTH - 1, index + 1)]?.focus();
  };

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    apply(e.clipboardData.getData("text"));
  };

  return (
    <div className="flex items-center justify-center gap-2 sm:gap-2.5">
      {Array.from({ length: OTP_LENGTH }).map((_, index) => {
        const digit = value[index] ?? "";
        return (
          <input
            key={index}
            ref={(el) => {
              refs.current[index] = el;
            }}
            type="text"
            inputMode="numeric"
            maxLength={1}
            disabled={disabled}
            value={digit}
            aria-label={`OTP digit ${index + 1}`}
            onChange={(e) => {
              const digits = e.target.value.replace(/\D/g, "");
              if (!digits) {
                apply(value.slice(0, index) + value.slice(index + 1));
                return;
              }
              apply(value.slice(0, index) + digits);
            }}
            onKeyDown={(e) => handleKeyDown(index, e)}
            onPaste={handlePaste}
            onFocus={() => setFocused(index)}
            className={cn(
              "h-12 w-10 rounded-xl border bg-white text-center text-lg font-bold tabular-nums text-[#001F5B] outline-none transition sm:h-14 sm:w-12 sm:text-xl",
              "focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20",
              digit && "border-indigo-400/50 bg-indigo-50",
              focused === index && !error && "border-indigo-500",
              error && "border-rose-400",
              disabled && "cursor-not-allowed opacity-60"
            )}
          />
        );
      })}
    </div>
  );
}

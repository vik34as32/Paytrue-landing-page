"use client";

import type { CcbpNetwork } from "../lib/ccbp-bin";

export default function CcbpNetworkMark({
  network,
  className = "",
}: {
  network: CcbpNetwork;
  className?: string;
}) {
  if (network === "UNKNOWN") return null;

  if (network === "VISA") {
    return (
      <span className={`inline-flex items-center ${className}`} aria-label="Visa">
        <svg viewBox="0 0 48 16" className="h-4 w-12" fill="currentColor">
          <text x="0" y="13" fontFamily="Arial Black, sans-serif" fontSize="14" fontStyle="italic" letterSpacing="-0.5">
            VISA
          </text>
        </svg>
      </span>
    );
  }

  if (network === "MASTERCARD") {
    return (
      <span className={`inline-flex items-center ${className}`} aria-label="Mastercard">
        <svg viewBox="0 0 40 24" className="h-6 w-10">
          <circle cx="15" cy="12" r="10" fill="#eb001b" />
          <circle cx="25" cy="12" r="10" fill="#f79e1b" />
          <path
            d="M20 4.6a10 10 0 0 1 0 14.8 10 10 0 0 1 0-14.8z"
            fill="#ff5f00"
          />
        </svg>
      </span>
    );
  }

  if (network === "RUPAY") {
    return (
      <span
        className={`inline-flex items-center rounded bg-white px-1.5 py-0.5 text-[10px] font-black tracking-tight text-[#0b3a82] ${className}`}
        aria-label="RuPay"
      >
        RuPay
      </span>
    );
  }

  if (network === "AMEX") {
    return (
      <span
        className={`inline-flex items-center rounded-sm bg-[#006fcf] px-1.5 py-0.5 text-[9px] font-black tracking-widest text-white ${className}`}
        aria-label="American Express"
      >
        AMEX
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center rounded bg-white/90 px-1.5 py-0.5 text-[9px] font-black text-slate-700 ${className}`}
      aria-label="Diners Club"
    >
      DINERS
    </span>
  );
}

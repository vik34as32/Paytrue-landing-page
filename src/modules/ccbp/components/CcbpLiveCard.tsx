"use client";

import { motion } from "framer-motion";
import { Nfc } from "lucide-react";
import { BankLogo } from "@/components/retailer/BankLogo";
import CcbpNetworkMark from "./CcbpNetworkMark";
import { detectCardNetwork, networkLabel } from "../lib/ccbp-bin";
import { formatCardInput, formatInr } from "../lib/ccbp-normalizers";
import type { CcbpIssuer } from "../types";

export default function CcbpLiveCard({
  issuer,
  cardNumber,
  name,
  amount,
}: {
  issuer?: CcbpIssuer;
  cardNumber: string;
  name: string;
  amount?: number;
}) {
  const network = detectCardNetwork(cardNumber);
  const display = formatCardInput(cardNumber) || "•••• •••• •••• ••••";
  const from = issuer?.cardFrom ?? "#0b1f3a";
  const to = issuer?.cardTo ?? "#2563eb";

  return (
    <div className="perspective-[1200px]">
      <motion.div
        key={issuer?.id || "unknown"}
        initial={{ rotateY: -12, opacity: 0.6, y: 12 }}
        animate={{ rotateY: 0, opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 220, damping: 22 }}
        whileHover={{ y: -4, rotateX: 4 }}
        className="relative isolate overflow-hidden rounded-[22px] p-5 text-white shadow-[0_24px_50px_-18px_rgba(15,23,42,0.55)]"
        style={{
          background: `linear-gradient(145deg, ${from} 0%, ${to} 72%, #0b1220 140%)`,
        }}
      >
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_80%_0%,rgba(255,255,255,0.22),transparent_42%)]" />
        <motion.div
          key={`${issuer?.id}-${cardNumber.replace(/\D/g, "").slice(0, 6)}`}
          initial={{ x: "-120%", opacity: 0 }}
          animate={{ x: "220%", opacity: [0, 0.45, 0] }}
          transition={{ duration: 1.15, ease: "easeInOut" }}
          className="pointer-events-none absolute inset-y-0 w-16 -skew-x-12 bg-white/25 blur-md"
        />
        <div className="relative flex items-start justify-between">
          {issuer ? (
            <span className="rounded-lg bg-white p-1 shadow-sm">
              <BankLogo
                bank={{
                  id: issuer.id,
                  name: issuer.name,
                  shortName: issuer.shortName,
                  ifscPrefix: issuer.ifscPrefix,
                  logo: issuer.logoSrc,
                }}
                size={32}
              />
            </span>
          ) : (
            <span className="rounded-lg bg-white/15 px-2 py-1 text-[10px] font-bold tracking-widest text-white/80">
              BANK
            </span>
          )}
          <div className="flex items-center gap-2 text-white">
            <Nfc className="h-5 w-5 opacity-80" />
            {network !== "UNKNOWN" ? (
              <span className="rounded bg-white/90 px-1.5 py-0.5 text-[#1a1f71]">
                <CcbpNetworkMark network={network} />
              </span>
            ) : null}
          </div>
        </div>

        <div className="relative mt-6 h-8 w-11 overflow-hidden rounded-md bg-gradient-to-br from-amber-200 via-amber-400 to-amber-700 shadow-inner">
          <div className="absolute inset-y-0 left-1/3 w-px bg-black/20" />
          <div className="absolute inset-x-0 top-1/2 h-px bg-black/20" />
        </div>

        <p className="relative mt-5 font-mono text-[17px] tracking-[0.22em] sm:text-xl">
          {display}
        </p>

        <div className="relative mt-6 flex items-end justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-white/60">
              Card holder
            </p>
            <p className="truncate text-sm font-semibold uppercase tracking-wide">
              {name || "NAME ON CARD"}
            </p>
          </div>
          <div className="text-right">
            <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-white/60">
              Payable
            </p>
            <p className="text-lg font-extrabold tabular-nums">
              {amount ? formatInr(Number(amount)) : "₹0.00"}
            </p>
          </div>
        </div>
        <p className="relative mt-4 text-[10px] font-medium tracking-[0.16em] text-white/55">
          {(issuer?.name || "CREDIT CARD").toUpperCase()}
          {network !== "UNKNOWN" ? ` • ${networkLabel(network).toUpperCase()}` : ""}
        </p>
      </motion.div>
    </div>
  );
}

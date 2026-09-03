"use client";

import { AnimatePresence, motion } from "framer-motion";
import type { UseFormReturn } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { BankLogo } from "@/components/retailer/BankLogo";
import CcbpField from "./CcbpField";
import CcbpIssuerPicker from "./CcbpIssuerPicker";
import CcbpNetworkMark from "./CcbpNetworkMark";
import type { CcbpFormValues } from "../lib/ccbp-form-schema";
import { detectCardNetwork, networkLabel } from "../lib/ccbp-bin";
import { formatCardInput } from "../lib/ccbp-normalizers";
import type { CcbpIssuer } from "../types";

export default function CcbpCardStep({
  form,
  issuer,
  cardRaw,
  detected,
  onIssuer,
  onCardNumber,
}: {
  form: UseFormReturn<CcbpFormValues>;
  issuer?: CcbpIssuer;
  cardRaw: string;
  detected: CcbpIssuer | null;
  onIssuer: (id: string) => void;
  onCardNumber: (value: string) => void;
}) {
  const errors = form.formState.errors;
  const network = detectCardNetwork(cardRaw || "");
  const digits = (cardRaw || "").replace(/\D/g, "");

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-bold tracking-tight text-[#0b1f3a]">Card details</h2>
        <p className="mt-0.5 text-sm text-slate-500">
          Number se Visa / Mastercard / RuPay aur bank khud detect hota hai — jaise PhonePe / CRED.
        </p>
      </div>

      <CcbpField label="Credit card number" error={errors.creditCardNumber?.message}>
        <div className="relative">
          <Input
            inputMode="numeric"
            autoComplete="cc-number"
            placeholder="XXXX XXXX XXXX XXXX"
            value={formatCardInput(cardRaw || "")}
            onChange={(e) => onCardNumber(e.target.value)}
            className="h-12 pr-16 font-mono text-base tracking-[0.18em]"
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[#1a1f71]">
            <CcbpNetworkMark network={network} />
          </div>
        </div>
      </CcbpField>

      <AnimatePresence>
        {digits.length >= 1 && network !== "UNKNOWN" ? (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5"
          >
            <div className="flex min-w-0 items-center gap-2.5">
              {issuer ? (
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
              ) : null}
              <div className="min-w-0">
                <p className="truncate text-sm font-bold text-[#0b1f3a]">
                  {issuer?.name || "Issuing bank not identified yet"}
                </p>
                <p className="text-[11px] text-slate-500">
                  {networkLabel(network)}
                  {detected ? " · matched from card BIN" : digits.length >= 6 ? " · choose bank below if this is wrong" : " · keep typing to detect bank"}
                </p>
              </div>
            </div>
            <CcbpNetworkMark network={network} className="shrink-0" />
          </motion.div>
        ) : null}
      </AnimatePresence>

      <CcbpField label="Name on card" error={errors.payeeName?.message}>
        <Input
          autoComplete="cc-name"
          placeholder="As printed on the card"
          className="h-12 uppercase"
          {...form.register("payeeName")}
        />
      </CcbpField>

      <div className="grid gap-4 sm:grid-cols-2">
        <CcbpField label="Registered mobile" error={errors.payeeMobile?.message}>
          <Input
            maxLength={10}
            inputMode="numeric"
            autoComplete="tel"
            placeholder="10-digit mobile"
            className="h-12"
            {...form.register("payeeMobile")}
          />
        </CcbpField>
        <CcbpField label="Registered email" error={errors.payeeEmail?.message}>
          <Input
            type="email"
            autoComplete="email"
            placeholder="name@email.com"
            className="h-12"
            {...form.register("payeeEmail")}
          />
        </CcbpField>
      </div>

      <CcbpField
        label={issuer ? `${issuer.shortName} IFSC` : "Bank IFSC"}
        hint="11 characters"
        error={errors.ifscCode?.message}
      >
        <Input
          placeholder={issuer ? `${issuer.ifscPrefix}0XXXXXX` : "BANK0XXXXXX"}
          className="h-12 uppercase tracking-wider"
          {...form.register("ifscCode")}
        />
      </CcbpField>

      <div>
        <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">
          Credit card issuer
        </p>
        <p className="mb-2 text-xs text-slate-500">
          Auto-detected from the number. Change only if the bank is different — SBI, Fino, and all other cards are listed.
        </p>
        {errors.issuerId?.message ? (
          <p className="mb-2 text-xs font-medium text-rose-600">{errors.issuerId.message}</p>
        ) : null}
        <CcbpIssuerPicker issuerId={form.watch("issuerId")} detectedId={detected?.id} onSelect={onIssuer} />
      </div>
    </div>
  );
}

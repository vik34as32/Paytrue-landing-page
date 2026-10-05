"use client";

import type { ComponentType, ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { AtSign, BadgeCheck, Mail, MessageSquareText, Smartphone, User } from "lucide-react";
import { cn } from "@/lib/utils";
import UpiAppMark from "./UpiAppMark";
import {
  detectUpiApp,
  isValidPayeeEmail,
  isValidPayeeMobile,
  isValidVpa,
  sanitizeRemarks,
  UPI_PAYOUT_REMARKS_MAX,
} from "../lib/upi-payout-normalizers";

const HANDLE_SUGGESTIONS = ["ybl", "okaxis", "paytm", "upi", "okhdfcbank", "oksbi"];

function Field({
  id,
  label,
  optional,
  icon: Icon,
  error,
  children,
}: {
  id: string;
  label: string;
  optional?: boolean;
  icon: ComponentType<{ className?: string }>;
  error?: string;
  children: ReactNode;
}) {
  return (
    <div className="space-y-2">
      <label htmlFor={id} className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
        {label}
        {optional ? (
          <span className="ml-1 font-normal normal-case tracking-normal text-slate-400">(optional)</span>
        ) : null}
      </label>
      <div
        className={cn(
          "flex items-center gap-2 rounded-2xl border bg-white px-3 transition focus-within:ring-4",
          error
            ? "border-rose-300 focus-within:ring-rose-100"
            : "border-slate-200 focus-within:border-violet-400 focus-within:ring-violet-100"
        )}
      >
        <Icon className="h-4 w-4 shrink-0 text-slate-400" />
        {children}
      </div>
      <AnimatePresence>
        {error ? (
          <motion.p
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="text-xs font-medium text-rose-600"
          >
            {error}
          </motion.p>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

const inputClass =
  "h-12 min-w-0 flex-1 bg-transparent text-sm font-semibold text-[#0a1630] outline-none placeholder:font-normal placeholder:text-slate-400";

export default function UpiPayeeStep({
  vpa,
  onVpa,
  payeeName,
  onPayeeName,
  payeeMobile,
  onPayeeMobile,
  payeeEmail,
  onPayeeEmail,
  remarks,
  onRemarks,
}: {
  vpa: string;
  onVpa: (value: string) => void;
  payeeName: string;
  onPayeeName: (value: string) => void;
  payeeMobile: string;
  onPayeeMobile: (value: string) => void;
  payeeEmail: string;
  onPayeeEmail: (value: string) => void;
  remarks: string;
  onRemarks: (value: string) => void;
}) {
  const valid = isValidVpa(vpa);
  const userPart = vpa.split("@")[0] ?? "";
  const showHandles = Boolean(userPart) && !vpa.includes("@");
  const app = valid ? detectUpiApp(vpa) : null;

  const mobileError =
    payeeMobile.length === 10 && !isValidPayeeMobile(payeeMobile) ? "Enter a valid Indian mobile number" : "";
  const emailError =
    payeeEmail.includes("@") && payeeEmail.includes(".") && !isValidPayeeEmail(payeeEmail)
      ? "Enter a valid email address"
      : "";

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-bold tracking-tight text-[#0a1630]">Who are you paying?</h2>
        <p className="mt-0.5 text-sm text-slate-500">
          Enter the receiver&apos;s UPI ID and contact details. Money is credited instantly to the linked bank account.
        </p>
      </div>

      <div className="space-y-2">
        <label htmlFor="upi-vpa" className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
          UPI ID
        </label>
        <div
          className={cn(
            "relative flex items-center gap-2 overflow-hidden rounded-2xl border bg-white px-3 transition focus-within:ring-4",
            valid
              ? "border-emerald-300 focus-within:ring-emerald-100"
              : "border-slate-200 focus-within:border-violet-400 focus-within:ring-violet-100"
          )}
        >
          {valid ? <UpiAppMark vpa={vpa} size="sm" /> : <AtSign className="h-5 w-5 text-slate-400" />}
          <input
            id="upi-vpa"
            value={vpa}
            onChange={(event) => onVpa(event.target.value)}
            placeholder="mobile@ybl or name@okaxis"
            autoComplete="off"
            spellCheck={false}
            className="h-14 min-w-0 flex-1 bg-transparent font-mono text-[15px] font-semibold text-[#0a1630] outline-none placeholder:font-sans placeholder:font-normal placeholder:text-slate-400"
          />
          <AnimatePresence>
            {valid ? (
              <motion.span
                initial={{ scale: 0, rotate: -45 }}
                animate={{ scale: 1, rotate: 0 }}
                exit={{ scale: 0 }}
                transition={{ type: "spring", stiffness: 320, damping: 16 }}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500 text-white shadow-md shadow-emerald-200"
              >
                <BadgeCheck className="h-4 w-4" />
              </motion.span>
            ) : null}
          </AnimatePresence>
        </div>

        <AnimatePresence>
          {showHandles ? (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="flex flex-wrap gap-1.5 overflow-hidden"
            >
              {HANDLE_SUGGESTIONS.map((handle, index) => (
                <motion.button
                  key={handle}
                  type="button"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.03 }}
                  onClick={() => onVpa(`${userPart}@${handle}`)}
                  className="rounded-full bg-slate-100 px-2.5 py-1 font-mono text-xs font-semibold text-slate-600 transition hover:bg-violet-100 hover:text-violet-700"
                >
                  @{handle}
                </motion.button>
              ))}
            </motion.div>
          ) : null}
        </AnimatePresence>

        {vpa && !valid && vpa.includes("@") ? (
          <p className="text-xs font-medium text-rose-600">Enter a valid UPI ID, e.g. 9876543210@ybl</p>
        ) : null}
      </div>

      <AnimatePresence mode="wait">
        {app ? (
          <motion.div
            key={app.id + vpa.split("@")[1]}
            initial={{ opacity: 0, y: 10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ type: "spring", stiffness: 260, damping: 22 }}
            className="flex items-center gap-3 rounded-2xl border border-violet-100 bg-gradient-to-r from-violet-50 to-white p-3.5"
          >
            <UpiAppMark vpa={vpa} />
            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-violet-700">
                {app.name}
              </p>
              <p className="truncate font-mono text-sm font-bold text-[#0a1630]">{vpa}</p>
            </div>
            <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-700">
              Valid format
            </span>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field id="upi-name" label="Beneficiary name" icon={User}>
          <input
            id="upi-name"
            value={payeeName}
            maxLength={100}
            onChange={(event) => onPayeeName(event.target.value)}
            placeholder="As per bank records"
            className={inputClass}
          />
        </Field>
        <Field id="upi-mobile" label="Beneficiary mobile" icon={Smartphone} error={mobileError}>
          <input
            id="upi-mobile"
            value={payeeMobile}
            inputMode="numeric"
            onChange={(event) => onPayeeMobile(event.target.value.replace(/\D/g, "").slice(0, 10))}
            placeholder="10-digit mobile"
            className={cn(inputClass, "tabular-nums")}
          />
        </Field>
        <Field id="upi-email" label="Beneficiary email" icon={Mail} error={emailError}>
          <input
            id="upi-email"
            type="email"
            value={payeeEmail}
            onChange={(event) => onPayeeEmail(event.target.value.replace(/\s+/g, ""))}
            placeholder="name@example.com"
            autoComplete="off"
            className={inputClass}
          />
        </Field>
        <Field id="upi-remarks" label="Remark" optional icon={MessageSquareText}>
          <input
            id="upi-remarks"
            value={remarks}
            onChange={(event) => onRemarks(sanitizeRemarks(event.target.value))}
            placeholder="e.g. Rent"
            className={inputClass}
          />
          <span className="text-[11px] tabular-nums text-slate-400">
            {remarks.length}/{UPI_PAYOUT_REMARKS_MAX}
          </span>
        </Field>
      </div>
    </div>
  );
}

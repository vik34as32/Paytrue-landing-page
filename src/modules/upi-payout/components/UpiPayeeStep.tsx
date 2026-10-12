"use client";

import type { ComponentType, ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { AtSign, BadgeCheck, Loader2, ShieldCheck, Smartphone, User } from "lucide-react";
import { cn } from "@/lib/utils";
import UpiAppMark from "./UpiAppMark";
import { detectUpiApp, isValidPayeeMobile, isValidVpa } from "../lib/upi-payout-normalizers";
import type { UpiVerification } from "../types";

const HANDLE_SUGGESTIONS = ["ybl", "okaxis", "paytm", "upi", "okhdfcbank", "oksbi"];

function Field({
  id,
  label,
  hint,
  icon: Icon,
  error,
  locked,
  children,
}: {
  id: string;
  label: string;
  hint?: string;
  icon: ComponentType<{ className?: string }>;
  error?: string;
  locked?: boolean;
  children: ReactNode;
}) {
  return (
    <div className="space-y-2">
      <label htmlFor={id} className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
        {label}
        {hint ? (
          <span className="ml-1 font-normal normal-case tracking-normal text-emerald-600">{hint}</span>
        ) : null}
      </label>
      <div
        className={cn(
          "flex items-center gap-2 rounded-2xl border px-3 transition focus-within:ring-4",
          locked ? "bg-emerald-50/50" : "bg-white",
          error
            ? "border-rose-300 focus-within:ring-rose-100"
            : locked
              ? "border-emerald-200 focus-within:ring-emerald-100"
              : "border-slate-200 focus-within:border-violet-400 focus-within:ring-violet-100"
        )}
      >
        <Icon className={cn("h-4 w-4 shrink-0", locked ? "text-emerald-600" : "text-slate-400")} />
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
  verification,
  verifying,
  verifyError,
  onVerify,
  payeeName,
  onPayeeName,
  payeeMobile,
  onPayeeMobile,
}: {
  vpa: string;
  onVpa: (value: string) => void;
  /** Verification result for the current `vpa` only. */
  verification: UpiVerification | null;
  verifying: boolean;
  verifyError: string;
  onVerify: () => void;
  payeeName: string;
  onPayeeName: (value: string) => void;
  payeeMobile: string;
  onPayeeMobile: (value: string) => void;
}) {
  const valid = isValidVpa(vpa);
  const verified = Boolean(verification?.verified);
  const userPart = vpa.split("@")[0] ?? "";
  const showHandles = Boolean(userPart) && !vpa.includes("@");
  const app = valid ? detectUpiApp(vpa) : null;
  const nameLocked = verified && Boolean(verification?.name);

  const mobileError =
    payeeMobile.length === 10 && !isValidPayeeMobile(payeeMobile) ? "Enter a valid Indian mobile number" : "";

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-bold tracking-tight text-[#0a1630]">Who are you paying?</h2>
        <p className="mt-0.5 text-sm text-slate-500">
          Enter the receiver&apos;s UPI ID and tap Check. We verify the account holder before any money moves.
        </p>
      </div>

      <div className="space-y-2">
        <label htmlFor="upi-vpa" className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
          UPI ID
        </label>
        <div
          className={cn(
            "relative flex items-center gap-2 overflow-hidden rounded-2xl border bg-white pl-3 pr-1.5 transition focus-within:ring-4",
            verified
              ? "border-emerald-300 focus-within:ring-emerald-100"
              : verifyError
                ? "border-rose-300 focus-within:ring-rose-100"
                : "border-slate-200 focus-within:border-violet-400 focus-within:ring-violet-100"
          )}
        >
          {valid ? <UpiAppMark vpa={vpa} size="sm" /> : <AtSign className="h-5 w-5 text-slate-400" />}
          <input
            id="upi-vpa"
            value={vpa}
            onChange={(event) => onVpa(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter" && valid && !verified && !verifying) {
                event.preventDefault();
                onVerify();
              }
            }}
            placeholder="mobile@ybl or name@okaxis"
            autoComplete="off"
            spellCheck={false}
            disabled={verifying}
            className="h-14 min-w-0 flex-1 bg-transparent font-mono text-[15px] font-semibold text-[#0a1630] outline-none placeholder:font-sans placeholder:font-normal placeholder:text-slate-400"
          />
          <AnimatePresence mode="wait" initial={false}>
            {verified ? (
              <motion.span
                key="verified"
                initial={{ scale: 0.6, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.6, opacity: 0 }}
                transition={{ type: "spring", stiffness: 320, damping: 18 }}
                className="inline-flex h-10 items-center gap-1.5 rounded-xl bg-emerald-500 px-3 text-xs font-bold text-white shadow-md shadow-emerald-200"
              >
                <BadgeCheck className="h-4 w-4" />
                Verified
              </motion.span>
            ) : (
              <motion.button
                key="check"
                type="button"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                whileTap={{ scale: 0.95 }}
                disabled={!valid || verifying}
                onClick={onVerify}
                className="inline-flex h-10 min-w-[92px] items-center justify-center gap-1.5 rounded-xl bg-[#0a1630] px-3 text-xs font-bold text-white transition hover:bg-[#16244a] disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400"
              >
                {verifying ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Checking
                  </>
                ) : (
                  <>
                    <ShieldCheck className="h-4 w-4" />
                    Check
                  </>
                )}
              </motion.button>
            )}
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
        ) : verifyError ? (
          <p className="text-xs font-medium text-rose-600">{verifyError}</p>
        ) : valid && !verified && !verifying ? (
          <p className="text-xs text-slate-500">Tap Check to verify this UPI ID before continuing.</p>
        ) : null}
      </div>

      <AnimatePresence mode="wait">
        {verified && verification ? (
          <motion.div
            key={`verified-${verification.vpa}`}
            initial={{ opacity: 0, y: 10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ type: "spring", stiffness: 260, damping: 22 }}
            className="flex items-center gap-3 rounded-2xl border border-emerald-200 bg-gradient-to-r from-emerald-50 to-white p-3.5"
          >
            <UpiAppMark vpa={vpa} />
            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-emerald-700">
                {app?.name ?? "UPI"} · Account holder
              </p>
              <p className="truncate text-base font-extrabold text-[#0a1630]">
                {verification.name || "Name not shared by bank"}
              </p>
              <p className="truncate font-mono text-xs text-slate-500">{verification.vpa}</p>
            </div>
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-700">
              <BadgeCheck className="h-3 w-3" />
              Verified
            </span>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field
          id="upi-name"
          label="Beneficiary name"
          hint={nameLocked ? "· from bank" : undefined}
          icon={User}
          locked={nameLocked}
        >
          <input
            id="upi-name"
            value={payeeName}
            maxLength={100}
            readOnly={nameLocked}
            onChange={(event) => onPayeeName(event.target.value)}
            placeholder={verified ? "As per bank records" : "Auto-filled after Check"}
            className={inputClass}
          />
        </Field>
        <Field
          id="upi-mobile"
          label="Beneficiary mobile"
          hint={verified && verification?.mobile && verification.mobile === payeeMobile ? "· auto-filled" : undefined}
          icon={Smartphone}
          error={mobileError}
        >
          <input
            id="upi-mobile"
            value={payeeMobile}
            inputMode="numeric"
            onChange={(event) => onPayeeMobile(event.target.value.replace(/\D/g, "").slice(0, 10))}
            placeholder="10-digit mobile"
            className={cn(inputClass, "tabular-nums")}
          />
        </Field>
      </div>
    </div>
  );
}

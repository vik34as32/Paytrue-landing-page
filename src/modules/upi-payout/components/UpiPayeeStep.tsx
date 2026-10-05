"use client";

import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle, AtSign, BadgeCheck, Loader2, ScanLine, Smartphone, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import UpiAppMark from "./UpiAppMark";
import { detectUpiApp, isValidVpa } from "../lib/upi-payout-normalizers";
import type { UpiVpaVerification } from "../types";

const HANDLE_SUGGESTIONS = ["ybl", "okaxis", "paytm", "upi", "okhdfcbank", "oksbi"];

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
  verification: UpiVpaVerification | null;
  verifying: boolean;
  verifyError: string;
  onVerify: () => void;
  payeeName: string;
  onPayeeName: (value: string) => void;
  payeeMobile: string;
  onPayeeMobile: (value: string) => void;
}) {
  const valid = isValidVpa(vpa);
  const userPart = vpa.split("@")[0] ?? "";
  const showHandles = Boolean(userPart) && !vpa.includes("@");
  const verified = Boolean(verification?.verified);
  const app = valid ? detectUpiApp(vpa) : null;

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-bold tracking-tight text-[#0a1630]">Who are you paying?</h2>
        <p className="mt-0.5 text-sm text-slate-500">
          Enter the receiver&apos;s UPI ID and verify the registered name before sending.
        </p>
      </div>

      <div className="space-y-2">
        <label htmlFor="upi-vpa" className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
          UPI ID
        </label>
        <div
          className={cn(
            "relative flex items-center gap-2 overflow-hidden rounded-2xl border bg-white px-3 transition focus-within:ring-4",
            verified
              ? "border-emerald-300 focus-within:ring-emerald-100"
              : "border-slate-200 focus-within:border-violet-400 focus-within:ring-violet-100"
          )}
        >
          {valid ? <UpiAppMark vpa={vpa} size="sm" /> : <AtSign className="h-5 w-5 text-slate-400" />}
          <input
            id="upi-vpa"
            value={vpa}
            onChange={(event) => onVpa(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter" && valid && !verifying) onVerify();
            }}
            placeholder="mobile@ybl or name@okaxis"
            autoComplete="off"
            spellCheck={false}
            className="h-14 min-w-0 flex-1 bg-transparent font-mono text-[15px] font-semibold text-[#0a1630] outline-none placeholder:font-sans placeholder:font-normal placeholder:text-slate-400"
          />
          <Button
            type="button"
            size="sm"
            disabled={!valid || verifying || verified}
            onClick={onVerify}
            className={cn(
              "h-10 rounded-xl px-4 font-semibold",
              verified ? "bg-emerald-500 hover:bg-emerald-500" : "bg-[#0a1630] hover:bg-[#16244a]"
            )}
          >
            {verifying ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : verified ? (
              <>
                <BadgeCheck className="h-4 w-4" />
                Verified
              </>
            ) : (
              <>
                <ScanLine className="h-4 w-4" />
                Verify
              </>
            )}
          </Button>
          {verifying ? (
            <motion.span
              className="pointer-events-none absolute inset-y-0 w-24 bg-gradient-to-r from-transparent via-violet-200/50 to-transparent"
              initial={{ x: "-30%" }}
              animate={{ x: "520%" }}
              transition={{ duration: 1.1, repeat: Infinity, ease: "easeInOut" }}
            />
          ) : null}
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

        {app && !verified ? (
          <p className="text-xs text-slate-500">
            Detected: <span className="font-semibold text-slate-700">{app.name}</span>
          </p>
        ) : null}
        {vpa && !valid && vpa.includes("@") ? (
          <p className="text-xs font-medium text-rose-600">Enter a valid UPI ID, e.g. 9876543210@ybl</p>
        ) : null}
      </div>

      <AnimatePresence mode="wait">
        {verified && verification ? (
          <motion.div
            key="verified"
            initial={{ opacity: 0, y: 10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ type: "spring", stiffness: 260, damping: 22 }}
            className="flex items-center gap-3 rounded-2xl border border-emerald-200 bg-gradient-to-r from-emerald-50 to-white p-4"
          >
            <motion.div
              initial={{ scale: 0, rotate: -45 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 320, damping: 14, delay: 0.05 }}
              className="flex h-11 w-11 items-center justify-center rounded-full bg-emerald-500 text-white shadow-lg shadow-emerald-200"
            >
              <BadgeCheck className="h-6 w-6" />
            </motion.div>
            <div className="min-w-0">
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-emerald-700">
                Registered name
              </p>
              <p className="truncate text-base font-extrabold text-[#0a1630]">
                {verification.name || payeeName}
              </p>
              <p className="truncate font-mono text-xs text-slate-500">{verification.vpa}</p>
            </div>
          </motion.div>
        ) : verifyError ? (
          <motion.div
            key="error"
            initial={{ opacity: 0, x: -6 }}
            animate={{ opacity: 1, x: [0, -6, 6, -3, 0] }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="flex items-start gap-2 rounded-2xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800"
          >
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>
              {verifyError}. You can enter the beneficiary name manually — double-check the UPI ID before sending.
            </span>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <label htmlFor="upi-name" className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
            Beneficiary name
          </label>
          <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 focus-within:border-violet-400 focus-within:ring-4 focus-within:ring-violet-100">
            <User className="h-4 w-4 text-slate-400" />
            <input
              id="upi-name"
              value={payeeName}
              onChange={(event) => onPayeeName(event.target.value)}
              readOnly={verified && Boolean(verification?.name)}
              placeholder="As per bank records"
              className="h-12 min-w-0 flex-1 bg-transparent text-sm font-semibold text-[#0a1630] outline-none placeholder:font-normal placeholder:text-slate-400 read-only:text-slate-600"
            />
          </div>
        </div>
        <div className="space-y-2">
          <label htmlFor="upi-mobile" className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
            Mobile <span className="font-normal normal-case tracking-normal text-slate-400">(optional)</span>
          </label>
          <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 focus-within:border-violet-400 focus-within:ring-4 focus-within:ring-violet-100">
            <Smartphone className="h-4 w-4 text-slate-400" />
            <input
              id="upi-mobile"
              value={payeeMobile}
              inputMode="numeric"
              onChange={(event) => onPayeeMobile(event.target.value.replace(/\D/g, "").slice(0, 10))}
              placeholder="10-digit mobile"
              className="h-12 min-w-0 flex-1 bg-transparent text-sm font-semibold tabular-nums text-[#0a1630] outline-none placeholder:font-normal placeholder:text-slate-400"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, Loader2, SendHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatInr } from "../lib/upi-payout-normalizers";

const STAGES = [
  "Securing request",
  "Debiting retailer wallet",
  "Routing through UPI network",
  "Awaiting bank confirmation",
];

export default function UpiProcessingOverlay({
  open,
  amount,
  vpa,
}: {
  open: boolean;
  amount: number;
  vpa: string;
}) {
  const [stage, setStage] = useState(0);

  useEffect(() => {
    if (!open) return;
    const timer = setInterval(() => {
      setStage((current) => Math.min(current + 1, STAGES.length - 1));
    }, 1100);
    return () => {
      clearInterval(timer);
      setStage(0);
    };
  }, [open]);

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 z-20 flex items-center justify-center bg-white/90 px-6 backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 0.94, y: 8 }}
            animate={{ scale: 1, y: 0 }}
            className="w-full max-w-sm text-center"
          >
            <div className="relative mx-auto flex h-28 w-28 items-center justify-center">
              {[0, 1, 2].map((ring) => (
                <motion.span
                  key={ring}
                  className="absolute inset-0 rounded-full border-2 border-violet-400/50"
                  animate={{ scale: [0.6, 1.5], opacity: [0.8, 0] }}
                  transition={{ duration: 2, repeat: Infinity, delay: ring * 0.6, ease: "easeOut" }}
                />
              ))}
              <motion.div
                className="relative flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-violet-600 text-white shadow-xl shadow-violet-300"
                animate={{ rotate: [0, -8, 8, 0] }}
                transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
              >
                <SendHorizontal className="h-7 w-7" />
              </motion.div>
            </div>
            <p className="mt-4 text-2xl font-extrabold tabular-nums text-[#0a1630]">{formatInr(amount)}</p>
            <p className="truncate font-mono text-xs text-slate-500">to {vpa}</p>

            <ul className="mx-auto mt-6 max-w-xs space-y-2.5 text-left">
              {STAGES.map((label, index) => {
                const done = index < stage;
                const active = index === stage;
                return (
                  <motion.li
                    key={label}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: index <= stage ? 1 : 0.4, x: 0 }}
                    transition={{ delay: index * 0.08 }}
                    className="flex items-center gap-2.5 text-sm"
                  >
                    <span
                      className={cn(
                        "flex h-5 w-5 items-center justify-center rounded-full",
                        done && "bg-emerald-500 text-white",
                        active && "bg-violet-100 text-violet-600",
                        !done && !active && "bg-slate-100 text-slate-300"
                      )}
                    >
                      {done ? (
                        <Check className="h-3 w-3" strokeWidth={3} />
                      ) : active ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (
                        <span className="h-1.5 w-1.5 rounded-full bg-current" />
                      )}
                    </span>
                    <span className={cn("font-medium", active ? "text-[#0a1630]" : "text-slate-500")}>
                      {label}
                    </span>
                  </motion.li>
                );
              })}
            </ul>
            <p className="mt-6 text-xs text-slate-400">Please don&apos;t refresh or close this page.</p>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

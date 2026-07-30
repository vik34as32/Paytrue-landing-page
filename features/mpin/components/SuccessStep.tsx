"use client";

import { motion } from "framer-motion";
import { Check } from "lucide-react";

export function SuccessStep() {
  return (
    <div className="flex flex-col items-center justify-center py-6 text-center">
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 16 }}
        className="relative mb-5 flex h-20 w-20 items-center justify-center"
      >
        <motion.span
          initial={{ scale: 0.6, opacity: 0.4 }}
          animate={{ scale: 1.35, opacity: 0 }}
          transition={{ duration: 0.9, ease: "easeOut" }}
          className="absolute inset-0 rounded-full bg-emerald-400/40"
        />
        <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 text-white shadow-lg shadow-emerald-500/30">
          <Check className="h-10 w-10 stroke-[3]" />
        </div>
      </motion.div>

      <motion.h3
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="text-lg font-bold text-[#001F5B]"
      >
        MPIN Updated Successfully
      </motion.h3>
      <motion.p
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="mt-1.5 text-sm text-slate-500"
      >
        Redirecting to your profile…
      </motion.p>
    </div>
  );
}

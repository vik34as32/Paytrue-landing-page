"use client";

import { motion } from "framer-motion";
import { Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EmptyStateProps {
  onCreateClick?: () => void;
}

export default function EmptyState({ onCreateClick }: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center px-6 py-16 text-center"
    >
      <div className="relative mb-6">
        <div className="flex h-24 w-24 items-center justify-center rounded-full bg-blue-50">
          <Wallet className="h-10 w-10 text-[#0057D9]" />
        </div>
        <motion.div
          animate={{ scale: [1, 1.08, 1] }}
          transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
          className="absolute -right-1 -top-1 h-6 w-6 rounded-full bg-amber-400/30"
        />
        <motion.div
          animate={{ scale: [1, 1.12, 1] }}
          transition={{ repeat: Infinity, duration: 3, ease: "easeInOut", delay: 0.4 }}
          className="absolute -bottom-2 -left-2 h-8 w-8 rounded-full bg-emerald-400/20"
        />
      </div>

      <h3 className="text-lg font-bold text-[#001F5B]">No Fund Requests Yet</h3>
      <p className="mt-2 max-w-sm text-sm text-slate-500">
        You haven&apos;t requested any funds. Create your first request to top up
        your wallet balance.
      </p>

      {onCreateClick && (
        <Button type="button" className="mt-6" onClick={onCreateClick}>
          Create your first request
        </Button>
      )}
    </motion.div>
  );
}

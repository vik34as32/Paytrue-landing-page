"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  Wallet,
  Send,
  FileText,
  Fingerprint,
  Smartphone,
  User,
  type LucideIcon,
} from "lucide-react";
import { QUICK_ACTIONS } from "@/features/retailer/dashboard";

const iconMap: Record<string, LucideIcon> = {
  Wallet,
  Send,
  FileText,
  Fingerprint,
  Smartphone,
  User,
};

export default function QuickActions() {
  return (
    <div className="flex gap-2.5 overflow-x-auto pb-1 rt-service-grid">
      {QUICK_ACTIONS.map((action, i) => {
        const Icon = iconMap[action.icon] || Wallet;

        return (
          <motion.div
            key={action.id}
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: i * 0.05 }}
            className="shrink-0"
          >
            <Link
              href={action.href}
              className="group flex w-[88px] flex-col items-center gap-2 rounded-xl border border-slate-100 bg-white px-3 py-3.5 transition-all duration-300 hover:border-[#1565d8]/25 hover:shadow-[0_6px_20px_rgba(21,101,216,0.12)] sm:w-[96px]"
              style={{ boxShadow: "0 1px 6px rgba(11, 31, 58, 0.04)" }}
            >
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-xl ${action.color} text-white shadow-md transition-transform duration-300 group-hover:scale-105`}
              >
                <Icon className="h-[18px] w-[18px]" strokeWidth={2} />
              </div>
              <span className="text-center text-[10px] font-bold leading-tight text-slate-700 group-hover:text-[#1565d8] sm:text-[11px]">
                {action.label}
              </span>
            </Link>
          </motion.div>
        );
      })}
    </div>
  );
}

"use client";

import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";

interface RetailerPageHeaderProps {
  title: string;
  description?: string;
  icon: LucideIcon;
  iconClassName?: string;
  actions?: React.ReactNode;
}

export default function RetailerPageHeader({
  title,
  description,
  icon: Icon,
  iconClassName = "from-[#0A84FF] to-[#0057D9]",
  actions,
}: RetailerPageHeaderProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between"
    >
      <div className="flex items-start gap-4">
        <div
          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br text-white shadow-lg ${iconClassName}`}
        >
          <Icon className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-[#001F5B]">{title}</h1>
          {description && (
            <p className="mt-1 max-w-2xl text-sm text-slate-500">{description}</p>
          )}
        </div>
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </motion.div>
  );
}

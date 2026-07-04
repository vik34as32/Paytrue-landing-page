"use client";

import { cn } from "@/lib/utils";

export type FundRequestTab = "request" | "bank";

interface FundRequestTabsProps {
  activeTab: FundRequestTab;
  onTabChange: (tab: FundRequestTab) => void;
}

const TABS: { id: FundRequestTab; label: string }[] = [
  { id: "request", label: "Fund Request" },
  { id: "bank", label: "Bank Details" },
];

export default function FundRequestTabs({
  activeTab,
  onTabChange,
}: FundRequestTabsProps) {
  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white p-1.5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="grid grid-cols-2 gap-1.5">
        {TABS.map((tab) => {
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onTabChange(tab.id)}
              className={cn(
                "rounded-xl px-4 py-2.5 text-sm font-semibold transition-all duration-200",
                active
                  ? "bg-gradient-to-r from-[#0A84FF] to-[#0057D9] text-white shadow-md shadow-blue-200/40 dark:shadow-none"
                  : "text-slate-600 hover:bg-slate-50 hover:text-[#1565d8] dark:text-slate-300 dark:hover:bg-slate-800"
              )}
            >
              {tab.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

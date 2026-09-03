"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { BankLogo } from "@/components/retailer/BankLogo";
import { cn } from "@/lib/utils";
import { CCBP_ISSUERS } from "../lib/ccbp-issuers";
import type { CcbpIssuer } from "../types";

export default function CcbpIssuerPicker({
  issuerId,
  onSelect,
  detectedId,
}: {
  issuerId: string;
  onSelect: (id: string) => void;
  detectedId?: string;
}) {
  const [query, setQuery] = useState("");

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return CCBP_ISSUERS;
    return CCBP_ISSUERS.filter(
      (item) =>
        item.name.toLowerCase().includes(q) ||
        item.shortName.toLowerCase().includes(q) ||
        item.ifscPrefix.toLowerCase().includes(q)
    );
  }, [query]);

  return (
    <div className="space-y-2">
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search SBI, Fino, HDFC, Axis…"
          className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-3 text-sm outline-none ring-indigo-500 focus:bg-white focus:ring-2"
        />
      </div>
      <div className="max-h-52 overflow-y-auto rounded-xl border border-slate-200">
        {rows.map((item) => (
          <IssuerRow
            key={item.id}
            item={item}
            active={item.id === issuerId}
            detected={item.id === detectedId}
            onSelect={onSelect}
          />
        ))}
        {!rows.length ? (
          <p className="px-3 py-6 text-center text-xs text-slate-500">No issuer matches that search.</p>
        ) : null}
      </div>
    </div>
  );
}

function IssuerRow({
  item,
  active,
  detected,
  onSelect,
}: {
  item: CcbpIssuer;
  active: boolean;
  detected: boolean;
  onSelect: (id: string) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onSelect(item.id)}
      className={cn(
        "flex w-full items-center gap-3 border-b border-slate-100 px-3 py-2.5 text-left last:border-0",
        active ? "bg-indigo-50" : "hover:bg-slate-50"
      )}
    >
      <BankLogo bank={{ id: item.id, name: item.name, shortName: item.shortName, ifscPrefix: item.ifscPrefix, logo: item.logoSrc }} size={28} />
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-semibold text-[#0b1f3a]">{item.name}</span>
        <span className="text-[11px] text-slate-500">{item.ifscPrefix}0••••••</span>
      </span>
      {detected ? (
        <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-emerald-700">
          Detected
        </span>
      ) : null}
    </button>
  );
}

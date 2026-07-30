"use client";

import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface AepsLedgerSearchProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

export function AepsLedgerSearch({
  value,
  onChange,
  disabled,
}: AepsLedgerSearchProps) {
  return (
    <div className="relative">
      <Label htmlFor="aeps-ledger-search" className="sr-only">
        Search
      </Label>
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
      <Input
        id="aeps-ledger-search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Search ledger no, RRN, remarks..."
        className="h-10 pl-9"
        disabled={disabled}
      />
      {value ? (
        <button
          type="button"
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-slate-400 hover:text-slate-600"
          onClick={() => onChange("")}
          aria-label="Clear search"
        >
          <X className="h-4 w-4" />
        </button>
      ) : null}
    </div>
  );
}

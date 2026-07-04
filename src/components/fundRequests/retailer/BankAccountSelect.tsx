"use client";

import { useMemo, useRef, useState, useEffect } from "react";
import { Check, ChevronDown, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BankLogo } from "@/components/retailer/BankLogo";
import { maskAccountNumberCompact } from "@/src/lib/fundRequestUtils";
import { fundRequestFieldClass as fieldClassName } from "./fundRequestFieldStyles";

const labelClass = "text-xs font-semibold text-slate-700";
import type { CompanyBankAccount } from "@/src/types/fundRequest";

interface BankAccountSelectProps {
  accounts: CompanyBankAccount[];
  value: string;
  onChange: (id: string) => void;
  loading?: boolean;
  error?: boolean;
  disabled?: boolean;
}

export default function BankAccountSelect({
  accounts,
  value,
  onChange,
  loading = false,
  error = false,
  disabled = false,
}: BankAccountSelectProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  const selected = accounts.find((a) => a.id === value);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return accounts;
    return accounts.filter(
      (a) =>
        a.bankName.toLowerCase().includes(q) ||
        a.ifscCode.toLowerCase().includes(q) ||
        a.accountNumber.replace(/\D/g, "").includes(q.replace(/\D/g, "")) ||
        a.accountHolderName.toLowerCase().includes(q)
    );
  }, [accounts, query]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (id: string) => {
    onChange(id);
    setOpen(false);
    setQuery("");
  };

  return (
    <div ref={containerRef} className="relative">
      <Label className="mb-1.5 block text-xs font-semibold text-slate-700">
        Company Account <span className="text-red-500">*</span>
      </Label>

      <button
        type="button"
        disabled={disabled || loading || accounts.length === 0}
        onClick={() => setOpen((prev) => !prev)}
        className={cn(
          fieldClassName,
          "flex w-full items-center justify-between gap-2 px-3 text-left",
          !selected && "text-slate-400",
          open && "border-[#1565d8] ring-2 ring-[#1565d8]/10",
          (disabled || loading) && "cursor-not-allowed opacity-60"
        )}
      >
        <div className="flex min-w-0 flex-1 items-center gap-2">
          {selected ? (
            <>
              <BankLogo bank={selected.bankName} size={24} className="rounded-md" />
              <div className="min-w-0">
                <p className="truncate text-xs font-semibold text-slate-800">
                  {selected.bankName}
                </p>
                <p className="truncate font-mono text-[10px] text-slate-500">
                  {maskAccountNumberCompact(selected.accountNumber)}
                </p>
              </div>
            </>
          ) : (
            <span className="text-sm">
              {loading ? "Loading accounts..." : "Select deposit account"}
            </span>
          )}
        </div>
        <ChevronDown
          className={cn(
            "h-4 w-4 shrink-0 text-slate-400 transition-transform",
            open && "rotate-180 text-[#1565d8]"
          )}
        />
      </button>

      {open && (
        <div className="absolute z-[60] mt-1 w-full overflow-hidden rounded-lg border border-slate-200 bg-white shadow-lg">
          <div className="border-b border-slate-100 p-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search bank or IFSC..."
                className="h-8 rounded-md border-slate-200 bg-slate-50 pl-8 text-sm text-slate-900 shadow-none"
                autoFocus
              />
            </div>
          </div>

          <ul className="bank-select-scroll max-h-44 overflow-y-auto p-1">
            {filtered.length === 0 ? (
              <li className="px-3 py-5 text-center text-xs text-slate-500">
                No matching accounts
              </li>
            ) : (
              filtered.map((account) => {
                const isSelected = account.id === value;
                return (
                  <li key={account.id}>
                    <button
                      type="button"
                      onClick={() => handleSelect(account.id)}
                      className={cn(
                        "flex w-full items-center gap-2 rounded-md px-2 py-2 text-left transition-colors",
                        isSelected ? "bg-blue-50" : "hover:bg-slate-50"
                      )}
                    >
                      <BankLogo bank={account.bankName} size={28} className="rounded-md" />
                      <div className="min-w-0 flex-1">
                        <p className="text-[11px] font-semibold uppercase text-slate-800">
                          {account.bankName}
                        </p>
                        <p className="font-mono text-[10px] text-slate-500">
                          {maskAccountNumberCompact(account.accountNumber)}
                        </p>
                        <p className="font-mono text-[10px] text-slate-400">
                          {account.ifscCode}
                        </p>
                      </div>
                      {isSelected && (
                        <Check className="h-3.5 w-3.5 shrink-0 text-[#1565d8]" />
                      )}
                    </button>
                  </li>
                );
              })
            )}
          </ul>
        </div>
      )}

      {error && accounts.length === 0 && !loading && (
        <p className="mt-1 text-[11px] text-red-500">
          Unable to load company bank accounts
        </p>
      )}
    </div>
  );
}

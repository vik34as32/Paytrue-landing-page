"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { Check, ChevronDown, Loader2, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BankLogo } from "@/components/retailer/BankLogo";
import { aepsBankToLogoInput, normalizeBankOption } from "@/src/lib/bankLogos";
import { useNsdlBanks } from "../lib/nsdl-aeps-hooks";
import type { NsdlBank } from "../types";

interface NsdlBankSelectProps {
  value: string;
  onChange: (iin: string) => void;
  disabled?: boolean;
  error?: string;
  label?: string;
}

function logoOf(bank: NsdlBank) {
  return normalizeBankOption(aepsBankToLogoInput(bank));
}

export default function NsdlBankSelect({
  value,
  onChange,
  disabled = false,
  error,
  label = "Bank",
}: NsdlBankSelectProps) {
  const fieldId = useId();
  const containerRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const { data: banks = [], isLoading, isError, refetch, isFetching } = useNsdlBanks();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const selected = useMemo(() => banks.find((bank) => bank.iin === value) ?? null, [banks, value]);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return banks;
    return banks.filter(
      (bank) => bank.name.toLowerCase().includes(query) || bank.iin.includes(query)
    );
  }, [banks, search]);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false);
        setSearch("");
      }
    };
    document.addEventListener("mousedown", onPointerDown);
    const focusTimer = window.setTimeout(() => searchRef.current?.focus(), 50);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      window.clearTimeout(focusTimer);
    };
  }, [open]);

  if (isLoading) {
    return (
      <div className="space-y-2">
        <Label>{label}</Label>
        <div className="flex h-11 items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-500">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading NSDL AEPS banks...
        </div>
      </div>
    );
  }

  const fieldDisabled = disabled || banks.length === 0;

  return (
    <div ref={containerRef} className="space-y-2">
      <Label htmlFor={fieldId}>{label}</Label>
      <button
        id={fieldId}
        type="button"
        role="combobox"
        aria-expanded={open}
        aria-controls={`${fieldId}-listbox`}
        disabled={fieldDisabled}
        onClick={() => setOpen((current) => !current)}
        className={cn(
          "flex h-11 w-full items-center justify-between rounded-xl border border-slate-200 bg-white px-3 py-2 text-left text-sm shadow-sm transition-all",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500",
          "disabled:cursor-not-allowed disabled:opacity-50",
          open && "border-violet-300 ring-2 ring-violet-100",
          error && "border-red-300"
        )}
      >
        {selected ? (
          <span className="flex min-w-0 flex-1 items-center gap-3 pr-2">
            <BankLogo bank={logoOf(selected)} size={24} />
            <span className="truncate font-medium text-slate-800">{selected.name}</span>
          </span>
        ) : (
          <span className="truncate text-slate-400">Search and select bank</span>
        )}
        <ChevronDown className={cn("h-4 w-4 shrink-0 text-slate-400 transition", open && "rotate-180")} />
      </button>

      {open ? (
        <div className="relative z-20">
          <div className="absolute mt-1 w-full overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg">
            <div className="border-b border-slate-100 p-2">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                  ref={searchRef}
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search bank name or IIN"
                  className="h-9 border-0 bg-slate-50 pl-9 shadow-none focus-visible:ring-0"
                />
              </div>
              <p className="mt-1 px-1 text-[11px] text-slate-400">{banks.length} banks from NSDL AEPS</p>
            </div>
            <div id={`${fieldId}-listbox`} role="listbox" className="max-h-60 overflow-y-auto p-1">
              {filtered.length === 0 ? (
                <p className="px-3 py-4 text-center text-sm text-slate-500">No banks found</p>
              ) : (
                filtered.map((bank) => {
                  const active = bank.iin === value;
                  return (
                    <button
                      key={bank.iin}
                      type="button"
                      role="option"
                      aria-selected={active}
                      onClick={() => {
                        onChange(bank.iin);
                        setOpen(false);
                        setSearch("");
                      }}
                      className={cn(
                        "flex w-full items-center justify-between gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition hover:bg-violet-50",
                        active && "bg-violet-50 text-[#6D28D9]"
                      )}
                    >
                      <span className="flex min-w-0 flex-1 items-center gap-3">
                        <BankLogo bank={logoOf(bank)} size={28} />
                        <span className="min-w-0">
                          <span className="block truncate font-medium">{bank.name}</span>
                          <span className="text-xs text-slate-500">IIN: {bank.iin}</span>
                        </span>
                      </span>
                      {active ? <Check className="h-4 w-4 shrink-0 text-[#6D28D9]" /> : null}
                    </button>
                  );
                })
              )}
            </div>
          </div>
        </div>
      ) : null}

      {error ? <p className="text-xs text-rose-600">{error}</p> : null}

      {isError || (!isFetching && banks.length === 0) ? (
        <div className="flex items-center justify-between gap-2 rounded-lg border border-rose-100 bg-rose-50 px-3 py-2 text-xs text-rose-700">
          <span>{isError ? "Unable to load NSDL AEPS bank list." : "No banks returned from NSDL AEPS."}</span>
          <Button type="button" variant="outline" size="sm" className="h-7 shrink-0" onClick={() => void refetch()}>
            Retry
          </Button>
        </div>
      ) : null}
    </div>
  );
}

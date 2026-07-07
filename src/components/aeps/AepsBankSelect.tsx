"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { Check, ChevronDown, Loader2, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BankLogo } from "@/components/retailer/BankLogo";
import { aepsBankToLogoInput, normalizeBankOption } from "@/src/lib/bankLogos";
import { useAepsBanks } from "@/src/hooks/useAeps";
import type { AepsBank } from "@/src/types/aeps";

interface AepsBankSelectProps {
  value: string;
  onChange: (bankIin: string) => void;
  disabled?: boolean;
  error?: string;
  label?: string;
  id?: string;
}

function AepsBankRow({
  bank,
  active,
  onSelect,
}: {
  bank: AepsBank;
  active: boolean;
  onSelect: () => void;
}) {
  const normalized = normalizeBankOption(aepsBankToLogoInput(bank));

  return (
    <button
      type="button"
      role="option"
      aria-selected={active}
      onClick={onSelect}
      className={cn(
        "flex w-full items-center justify-between gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition hover:bg-blue-50",
        active && "bg-blue-50 text-[#1565d8]"
      )}
    >
      <span className="flex min-w-0 flex-1 items-center gap-3">
        <BankLogo bank={normalized} size={28} />
        <span className="min-w-0">
          <span className="block truncate font-medium">{bank.name}</span>
          <span className="text-xs text-slate-500">IIN: {bank.iin}</span>
        </span>
      </span>
      {active ? <Check className="h-4 w-4 shrink-0 text-[#0057D9]" /> : null}
    </button>
  );
}

export default function AepsBankSelect({
  value,
  onChange,
  disabled = false,
  error,
  label = "Bank",
  id,
}: AepsBankSelectProps) {
  const generatedId = useId();
  const fieldId = id ?? generatedId;
  const listboxId = `${fieldId}-listbox`;
  const containerRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  const {
    data: banks = [],
    isLoading,
    isFetching,
    isError,
    refetch,
  } = useAepsBanks();

  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const selectedBank = useMemo(
    () => banks.find((bank) => bank.iin === value) ?? null,
    [banks, value]
  );

  const selectedNormalized = useMemo(
    () =>
      selectedBank ? normalizeBankOption(aepsBankToLogoInput(selectedBank)) : null,
    [selectedBank]
  );

  const filteredBanks = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return banks;
    return banks.filter(
      (bank) =>
        bank.name.toLowerCase().includes(query) ||
        bank.iin.includes(query) ||
        bank.bankCode.toLowerCase().includes(query)
    );
  }, [banks, search]);

  useEffect(() => {
    if (!open) return;
    const handlePointerDown = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false);
        setSearch("");
      }
    };
    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, [open]);

  useEffect(() => {
    if (open) {
      window.setTimeout(() => searchRef.current?.focus(), 50);
    }
  }, [open]);

  const selectBank = (bank: AepsBank) => {
    onChange(bank.iin);
    setOpen(false);
    setSearch("");
  };

  const loading = isLoading || isFetching;
  const fieldDisabled = disabled || loading;

  if (loading && banks.length === 0) {
    return (
      <div className="space-y-2">
        {label ? <Label htmlFor={fieldId}>{label}</Label> : null}
        <div className="flex h-11 items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-500">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading banks from AEPS...
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="space-y-2">
      {label ? <Label htmlFor={fieldId}>{label}</Label> : null}

      <button
        id={fieldId}
        type="button"
        role="combobox"
        aria-expanded={open}
        aria-controls={listboxId}
        aria-haspopup="listbox"
        disabled={fieldDisabled || banks.length === 0}
        onClick={() => !fieldDisabled && banks.length > 0 && setOpen((current) => !current)}
        className={cn(
          "flex h-11 w-full items-center justify-between rounded-xl border border-slate-200 bg-white px-3 py-2 text-left text-sm shadow-sm transition-all",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500",
          "disabled:cursor-not-allowed disabled:opacity-50",
          open && "border-blue-300 ring-2 ring-blue-100",
          error && "border-red-300"
        )}
      >
        {selectedNormalized ? (
          <span className="flex min-w-0 flex-1 items-center gap-3 pr-2">
            <BankLogo bank={selectedNormalized} size={24} />
            <span className="truncate font-medium text-slate-800">
              {selectedBank?.name}
            </span>
          </span>
        ) : (
          <span className="truncate text-slate-400">Search and select bank</span>
        )}
        <ChevronDown
          className={cn("h-4 w-4 shrink-0 text-slate-400 transition", open && "rotate-180")}
        />
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
              <p className="mt-1 px-1 text-[11px] text-slate-400">
                {banks.length} banks from AEPS
              </p>
            </div>

            <div
              id={listboxId}
              role="listbox"
              className="bank-select-scroll max-h-60 overflow-y-auto p-1"
            >
              {filteredBanks.length === 0 ? (
                <p className="px-3 py-4 text-center text-sm text-slate-500">No banks found</p>
              ) : (
                filteredBanks.map((bank) => (
                  <AepsBankRow
                    key={`${bank.iin}-${bank.id}`}
                    bank={bank}
                    active={bank.iin === value}
                    onSelect={() => selectBank(bank)}
                  />
                ))
              )}
            </div>
          </div>
        </div>
      ) : null}

      {error ? <p className="text-xs text-rose-600">{error}</p> : null}

      {isError ? (
        <div className="flex items-center justify-between gap-2 rounded-lg border border-rose-100 bg-rose-50 px-3 py-2 text-xs text-rose-700">
          <span>Unable to load AEPS bank list.</span>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-7 shrink-0"
            onClick={() => refetch()}
          >
            Retry
          </Button>
        </div>
      ) : null}

      {!loading && !isError && banks.length === 0 ? (
        <p className="text-xs text-amber-700">No banks returned from AEPS API.</p>
      ) : null}
    </div>
  );
}

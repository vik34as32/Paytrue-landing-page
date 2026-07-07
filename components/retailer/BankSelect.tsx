"use client";

import {
  memo,
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, ChevronDown, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { normalizeBankList, normalizeBankOption } from "@/src/lib/bankLogos";
import { BankOptionLabel } from "@/components/retailer/BankLogo";
import type { BankApiInput, BankOption } from "@/types/bank";

interface BankSelectProps {
  banks: Array<BankApiInput | string>;
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
  error?: string;
  disabled?: boolean;
  loading?: boolean;
  id?: string;
  /** Field used as the selected value — defaults to bank name */
  valueKey?: "name" | "id";
}

function BankSelectSkeleton() {
  return (
    <div className="space-y-2">
      <div className="h-4 w-24 animate-pulse rounded bg-slate-200" />
      <div className="h-11 animate-pulse rounded-xl bg-slate-100" />
    </div>
  );
}

function BankSelectComponent({
  banks,
  value = "",
  onChange,
  placeholder = "Select bank",
  label = "Bank Name",
  error,
  disabled = false,
  loading = false,
  id,
  valueKey = "name",
}: BankSelectProps) {
  const generatedId = useId();
  const fieldId = id ?? generatedId;
  const listboxId = `${fieldId}-listbox`;
  const containerRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [highlightIndex, setHighlightIndex] = useState(0);

  const normalizedBanks = useMemo(() => normalizeBankList(banks), [banks]);

  const selectedBank = useMemo(
    () =>
      normalizedBanks.find(
        (bank) => bank.name === value || bank.id === value
      ) ?? null,
    [normalizedBanks, value]
  );

  const filteredBanks = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return normalizedBanks;

    return normalizedBanks.filter((bank) => {
      return (
        bank.name.toLowerCase().includes(query) ||
        bank.shortName.toLowerCase().includes(query) ||
        bank.ifscPrefix.toLowerCase().includes(query) ||
        bank.id.toLowerCase().includes(query)
      );
    });
  }, [normalizedBanks, search]);

  const closeDropdown = useCallback(() => {
    setOpen(false);
    setSearch("");
    setHighlightIndex(0);
  }, []);

  const selectBank = useCallback(
    (bank: BankOption) => {
      onChange(valueKey === "id" ? bank.id : bank.name);
      closeDropdown();
    },
    [closeDropdown, onChange, valueKey]
  );

  useEffect(() => {
    if (!open) return;

    const handlePointerDown = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        closeDropdown();
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, [closeDropdown, open]);

  useEffect(() => {
    if (open) {
      window.setTimeout(() => searchRef.current?.focus(), 50);
    }
  }, [open]);

  useEffect(() => {
    setHighlightIndex(0);
  }, [search, open]);

  useEffect(() => {
    if (!open || !listRef.current) return;
    const activeItem = listRef.current.querySelector<HTMLElement>(
      `[data-index="${highlightIndex}"]`
    );
    activeItem?.scrollIntoView({ block: "nearest" });
  }, [highlightIndex, open]);

  const handleTriggerKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>) => {
    if (disabled) return;

    if (event.key === "Enter" || event.key === " " || event.key === "ArrowDown") {
      event.preventDefault();
      setOpen(true);
    }
  };

  const handleSearchKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Escape") {
      event.preventDefault();
      closeDropdown();
      return;
    }

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setHighlightIndex((current) =>
        Math.min(current + 1, Math.max(filteredBanks.length - 1, 0))
      );
      return;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      setHighlightIndex((current) => Math.max(current - 1, 0));
      return;
    }

    if (event.key === "Enter" && filteredBanks[highlightIndex]) {
      event.preventDefault();
      selectBank(filteredBanks[highlightIndex]);
    }
  };

  if (loading) {
    return <BankSelectSkeleton />;
  }

  return (
    <div ref={containerRef} className="relative space-y-2">
      {label ? <Label htmlFor={fieldId}>{label}</Label> : null}

      <button
        id={fieldId}
        type="button"
        role="combobox"
        aria-expanded={open}
        aria-controls={listboxId}
        aria-haspopup="listbox"
        aria-label={label || "Select bank"}
        disabled={disabled}
        onClick={() => !disabled && setOpen((current) => !current)}
        onKeyDown={handleTriggerKeyDown}
        className={cn(
          "flex h-11 w-full items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-2 text-left text-sm shadow-sm transition-all",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500",
          "disabled:cursor-not-allowed disabled:opacity-50",
          open && "border-blue-300 ring-2 ring-blue-100",
          error && "border-red-300"
        )}
      >
        {selectedBank ? (
          <BankOptionLabel
            bank={selectedBank}
            logoSize={24}
            className="flex-1 pr-2"
          />
        ) : (
          <span className="text-slate-400">{placeholder}</span>
        )}
        <ChevronDown
          className={cn(
            "h-4 w-4 shrink-0 text-slate-400 transition-transform",
            open && "rotate-180"
          )}
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }}
            transition={{ duration: 0.16, ease: "easeOut" }}
            className="absolute z-50 mt-2 w-full overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xl"
          >
            <div className="sticky top-0 z-10 border-b border-slate-100 bg-white p-3">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                  ref={searchRef}
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  onKeyDown={handleSearchKeyDown}
                  placeholder="Search bank name, IFSC..."
                  aria-label="Search banks"
                  className="h-10 rounded-lg pl-9"
                />
              </div>
            </div>

            <div
              id={listboxId}
              ref={listRef}
              role="listbox"
              aria-label="Banks"
              className="bank-select-scroll max-h-[500px] overflow-y-auto p-2"
            >
              {filteredBanks.length === 0 ? (
                <div className="px-4 py-10 text-center">
                  <p className="text-sm font-medium text-slate-600">
                    No banks found
                  </p>
                  <p className="mt-1 text-xs text-slate-400">
                    Try searching with SBI, HDFC, ICICI, Axis, Union, Canara...
                  </p>
                </div>
              ) : (
                filteredBanks.map((bank, index) => {
                  const isSelected = selectedBank?.name === bank.name;
                  const isHighlighted = highlightIndex === index;

                  return (
                    <button
                      key={bank.id}
                      type="button"
                      role="option"
                      data-index={index}
                      aria-selected={isSelected}
                      onMouseEnter={() => setHighlightIndex(index)}
                      onClick={() => selectBank(bank)}
                      className={cn(
                        "flex w-full items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-left transition-all",
                        isHighlighted && "bg-blue-50",
                        isSelected && "bg-blue-100/80",
                        !isHighlighted && !isSelected && "hover:bg-blue-50/70"
                      )}
                    >
                      <BankOptionLabel bank={bank} logoSize={28} />
                      {isSelected ? (
                        <Check className="h-4 w-4 shrink-0 text-[#0057D9]" />
                      ) : (
                        <span className="w-4 shrink-0" aria-hidden />
                      )}
                    </button>
                  );
                })
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {error ? <p className="text-xs text-red-500">{error}</p> : null}
    </div>
  );
}

const BankSelect = memo(BankSelectComponent);
export default BankSelect;

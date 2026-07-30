"use client";

import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AEPS_LEDGER_SERVICE_OPTIONS,
  AEPS_LEDGER_STATUS_OPTIONS,
} from "@/src/lib/aepsLedgerUtils";

interface AepsLedgerFiltersProps {
  dateFrom: string;
  dateTo: string;
  status: string;
  service: string;
  disabled?: boolean;
  onDateFromChange: (value: string) => void;
  onDateToChange: (value: string) => void;
  onStatusChange: (value: string) => void;
  onServiceChange: (value: string) => void;
}

export function AepsLedgerFilters({
  dateFrom,
  dateTo,
  status,
  service,
  disabled,
  onDateFromChange,
  onDateToChange,
  onStatusChange,
  onServiceChange,
}: AepsLedgerFiltersProps) {
  return (
    <div className="flex flex-col gap-2 sm:items-end">
      <div className="flex flex-wrap gap-2">
        <Input
          type="date"
          value={dateFrom}
          onChange={(event) => onDateFromChange(event.target.value)}
          className="h-10 w-[150px]"
          disabled={disabled}
          aria-label="Start date"
        />
        <Input
          type="date"
          value={dateTo}
          onChange={(event) => onDateToChange(event.target.value)}
          className="h-10 w-[150px]"
          disabled={disabled}
          aria-label="End date"
        />
        <Select
          value={status || "All"}
          onValueChange={onStatusChange}
          disabled={disabled}
        >
          <SelectTrigger className="h-10 w-[140px]" aria-label="Status">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            {AEPS_LEDGER_STATUS_OPTIONS.map((option) => (
              <SelectItem key={option} value={option}>
                {option === "All" ? "All Status" : option}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={service || "All"}
          onValueChange={onServiceChange}
          disabled={disabled}
        >
          <SelectTrigger className="h-10 w-[170px]" aria-label="Service">
            <SelectValue placeholder="Service" />
          </SelectTrigger>
          <SelectContent>
            {AEPS_LEDGER_SERVICE_OPTIONS.map((option) => (
              <SelectItem key={option} value={option}>
                {option === "All"
                  ? "All Services"
                  : option
                      .toLowerCase()
                      .split("_")
                      .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
                      .join(" ")}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <p className="text-[11px] text-slate-400">
        Start &amp; End date required for CSV / Excel
      </p>
    </div>
  );
}

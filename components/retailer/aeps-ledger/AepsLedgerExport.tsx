"use client";

import type { ComponentType } from "react";
import {
  Download,
  FileSpreadsheet,
  Loader2,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";

function ExportButton({
  label,
  icon: Icon,
  onClick,
  disabled,
  loading,
}: {
  label: string;
  icon: ComponentType<{ className?: string }>;
  onClick: () => void;
  disabled?: boolean;
  loading?: boolean;
}) {
  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      className="h-8 gap-1.5 rounded-md px-2.5 text-xs font-semibold text-slate-600 hover:bg-white hover:text-[#001F5B]"
      disabled={disabled}
      onClick={onClick}
    >
      {loading ? (
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
      ) : (
        <Icon className="h-3.5 w-3.5" />
      )}
      {label}
    </Button>
  );
}

interface AepsLedgerExportProps {
  disabled?: boolean;
  loading?: boolean;
  csvLoading?: boolean;
  excelLoading?: boolean;
  onCsv: () => void;
  onExcel: () => void;
  onRefresh?: () => void;
}

export function AepsLedgerExport({
  disabled,
  loading,
  csvLoading,
  excelLoading,
  onCsv,
  onExcel,
  onRefresh,
}: AepsLedgerExportProps) {
  const busy = Boolean(csvLoading || excelLoading);

  return (
    <div className="flex flex-wrap items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 p-1">
      <ExportButton
        label="CSV"
        icon={Download}
        disabled={disabled || busy}
        loading={csvLoading}
        onClick={onCsv}
      />
      <ExportButton
        label="Excel"
        icon={FileSpreadsheet}
        disabled={disabled || busy}
        loading={excelLoading}
        onClick={onExcel}
      />
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="h-8 gap-1.5 rounded-md px-2.5 text-xs font-semibold"
        disabled={loading}
        onClick={() => onRefresh?.()}
      >
        {loading ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : (
          <RefreshCw className="h-3.5 w-3.5" />
        )}
        Refresh
      </Button>
    </div>
  );
}

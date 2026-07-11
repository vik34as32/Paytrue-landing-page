"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useReactToPrint } from "react-to-print";
import { Building2, Download, FileText, Loader2, Printer } from "lucide-react";
import { toast } from "sonner";
import { BankLogo } from "@/components/retailer/BankLogo";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";
import AepsMiniStatementTable from "@/src/components/aeps/AepsMiniStatementTable";
import {
  buildAepsMiniStatementViewModel,
  downloadAepsMiniStatementPdf,
} from "@/src/lib/aepsMiniStatementPdf";
import type { AepsTransactionResult } from "@/src/types/aeps";

interface AepsMiniStatementInlineResultProps {
  result: AepsTransactionResult;
}

function maskAccountNumber(value?: string): string {
  if (!value) return "—";
  const digits = value.replace(/\D/g, "");
  if (digits.length <= 4) return value;
  return `XXXX${digits.slice(-4)}`;
}

export default function AepsMiniStatementInlineResult({
  result,
}: AepsMiniStatementInlineResultProps) {
  const printRef = useRef<HTMLDivElement>(null);
  const pdfDownloadedRef = useRef(false);
  const [downloading, setDownloading] = useState(false);

  const view = useMemo(() => buildAepsMiniStatementViewModel(result), [result]);
  const rows = view.rows;
  const bankBalance = view.bankAccountBalance;

  const generatedLabel = useMemo(
    () =>
      new Date(view.generatedAt).toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }),
    [view.generatedAt]
  );

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: `Mini_Statement_${view.bankName.replace(/[^a-z0-9]+/gi, "_")}`,
    pageStyle: `
      @page { size: A4 portrait; margin: 12mm; }
      body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    `,
  });

  const handleDownload = useCallback(async () => {
    setDownloading(true);
    try {
      await downloadAepsMiniStatementPdf(result);
      toast.success("Mini statement PDF downloaded");
    } catch {
      toast.error("Failed to download mini statement PDF");
    } finally {
      setDownloading(false);
    }
  }, [result]);

  useEffect(() => {
    if (pdfDownloadedRef.current) return;
    pdfDownloadedRef.current = true;

    void downloadAepsMiniStatementPdf(result)
      .then(() => {
        toast.success("Mini statement PDF downloaded automatically");
      })
      .catch(() => {
        toast.error("Could not auto-download mini statement PDF");
        pdfDownloadedRef.current = false;
      });
  }, [result]);

  return (
    <div className="space-y-3">
      <div
        ref={printRef}
        className="overflow-hidden rounded-2xl border border-[#E5E7EB] bg-white shadow-lg"
      >
        <div className="border-b border-[#E5E7EB] bg-[#F8FAFC] px-5 py-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-[#001F5B] to-[#0057D9] text-white">
                <FileText className="h-5 w-5" />
              </div>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#0057D9]">
                  AEPS Mini Statement
                </p>
                <h3 className="text-lg font-bold text-[#001F5B]">Bank Account Statement</h3>
                <p className="text-xs text-slate-500">Generated on {generatedLabel}</p>
              </div>
            </div>
            {bankBalance != null ? (
              <div className="rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-2.5 text-right">
                <p className="text-[10px] font-semibold uppercase tracking-wide text-emerald-700">
                  Available Balance
                </p>
                <p className="text-2xl font-bold leading-tight text-emerald-800">
                  {formatCurrency(bankBalance)}
                </p>
              </div>
            ) : null}
          </div>
        </div>

        <div className="bg-gradient-to-r from-[#001F5B] via-[#0057D9] to-[#1565d8] px-5 py-4 text-white">
          <div className="flex items-center gap-4">
            <BankLogo
              bank={{
                name: view.bankName,
                shortName: view.bankName,
                ifscPrefix: view.ifscCode?.slice(0, 4) || "",
              }}
              size={52}
              className="rounded-xl bg-white p-1.5"
            />
            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-blue-100">
                Bank Name
              </p>
              <h4 className="truncate text-xl font-bold">{view.bankName}</h4>
              {view.customerName ? (
                <p className="mt-1 truncate text-sm text-blue-100">{view.customerName}</p>
              ) : null}
            </div>
          </div>
        </div>

        <div className="divide-y divide-[#E5E7EB]">
          <div className="grid grid-cols-1 sm:grid-cols-2">
            <div className="grid grid-cols-[minmax(130px,38%)_1fr] border-b border-[#E5E7EB] sm:border-b-0 sm:border-r">
              <div className="border-r border-[#E5E7EB] bg-[#F8FAFC] px-4 py-3 text-sm font-semibold text-[#475569]">
                Bank Name
              </div>
              <div className="flex items-center gap-2 bg-white px-4 py-3 text-sm font-semibold text-[#111827]">
                <Building2 className="h-4 w-4 shrink-0 text-[#0057D9]" />
                <span className="truncate">{view.bankName}</span>
              </div>
            </div>
            <div className="grid grid-cols-[minmax(130px,38%)_1fr]">
              <div className="border-r border-[#E5E7EB] bg-[#F8FAFC] px-4 py-3 text-sm font-semibold text-[#475569]">
                Account Number
              </div>
              <div className="bg-white px-4 py-3 font-mono text-sm font-semibold text-[#111827]">
                {view.accountNumber || "—"}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2">
            <div className="grid grid-cols-[minmax(130px,38%)_1fr] border-b border-[#E5E7EB] sm:border-b-0 sm:border-r">
              <div className="border-r border-[#E5E7EB] bg-[#F8FAFC] px-4 py-3 text-sm font-semibold text-[#475569]">
                Account Balance
              </div>
              <div className="bg-white px-4 py-3 text-sm font-bold text-emerald-700">
                {bankBalance != null ? formatCurrency(bankBalance) : "—"}
              </div>
            </div>
            <div className="grid grid-cols-[minmax(130px,38%)_1fr]">
              <div className="border-r border-[#E5E7EB] bg-[#F8FAFC] px-4 py-3 text-sm font-semibold text-[#475569]">
                Masked A/c
              </div>
              <div className="bg-white px-4 py-3 font-mono text-sm font-semibold text-[#111827]">
                {maskAccountNumber(view.accountNumber)}
              </div>
            </div>
          </div>

          {view.mobileNumber ? (
            <div className="grid grid-cols-[minmax(130px,19%)_1fr]">
              <div className="border-r border-[#E5E7EB] bg-[#F8FAFC] px-4 py-3 text-sm font-semibold text-[#475569]">
                Mobile Number
              </div>
              <div className="bg-white px-4 py-3 text-sm font-semibold text-[#111827]">
                {view.mobileNumber}
              </div>
            </div>
          ) : null}
        </div>

        <div className="border-t border-[#E5E7EB] bg-[#F8FAFC] px-4 py-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-[#475569]">
            Recent Transactions
          </p>
        </div>

        <div className="max-h-[320px] overflow-auto px-3 py-3 sm:px-4">
          <AepsMiniStatementTable rows={rows} statementStyle />
        </div>

        <div className="border-t border-[#E5E7EB] bg-[#F8FAFC] px-5 py-3 text-center text-[11px] text-slate-500">
          {view.referenceId ? <span>Reference: {view.referenceId}</span> : null}
          {view.referenceId && view.rrn ? <span className="mx-2">•</span> : null}
          {view.rrn ? <span>RRN: {view.rrn}</span> : null}
          {!view.referenceId && !view.rrn ? (
            <span>System-generated mini statement via Paytrue AEPS</span>
          ) : null}
        </div>
      </div>

      <div className="flex flex-wrap gap-2 print:hidden">
        <Button
          type="button"
          variant="outline"
          className="gap-1.5"
          disabled={downloading}
          onClick={() => void handleDownload()}
        >
          {downloading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Download className="h-4 w-4" />
          )}
          Download PDF
        </Button>
        <Button
          type="button"
          variant="outline"
          className="gap-1.5"
          onClick={() => handlePrint()}
        >
          <Printer className="h-4 w-4" />
          Print Statement
        </Button>
      </div>
    </div>
  );
}

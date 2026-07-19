"use client";

import { Building2, Copy, Loader2, MapPin } from "lucide-react";
import { toast } from "sonner";
import { BankLogo } from "@/components/retailer/BankLogo";
import { useIfscLookup } from "@/src/hooks/useIfscLookup";
import { cn } from "@/lib/utils";
import type { ReceiptViewModel } from "@/types/statementReceipt";

interface BankDetailsCardProps {
  receipt: ReceiptViewModel;
  className?: string;
}

interface DetailRow {
  key: string;
  label: string;
  value?: string;
  mono?: boolean;
  copyable?: boolean;
}

async function copyValue(label: string, value: string) {
  if (!value) return;
  try {
    await navigator.clipboard.writeText(value);
    toast.success(`${label} copied`);
  } catch {
    toast.error(`Failed to copy ${label.toLowerCase()}`);
  }
}

export default function BankDetailsCard({
  receipt,
  className,
}: BankDetailsCardProps) {
  const { data: ifscDetails, isLoading, isFetching } = useIfscLookup(
    receipt.ifscCode
  );

  const bankName = ifscDetails?.BANK || receipt.bankName || "Bank";
  const ifscCode = ifscDetails?.IFSC || receipt.ifscCode || "";
  const branch = ifscDetails?.BRANCH || receipt.bankBranch || "";
  const address =
    ifscDetails?.ADDRESS ||
    receipt.bankAddress ||
    [ifscDetails?.CITY || receipt.bankCity, ifscDetails?.STATE || receipt.bankState]
      .filter(Boolean)
      .join(", ");

  const rows: DetailRow[] = [
    {
      key: "bank",
      label: "Bank Name",
      value: bankName,
    },
    {
      key: "account",
      label: "Account Number",
      value: receipt.accountNumber,
      mono: true,
      copyable: true,
    },
    ...(ifscCode
      ? [
          {
            key: "ifsc",
            label: "IFSC Code",
            value: ifscCode,
            mono: true,
            copyable: true,
          } as DetailRow,
        ]
      : []),
    ...(branch
      ? [
          {
            key: "branch",
            label: "Branch",
            value: branch,
          } as DetailRow,
        ]
      : []),
    ...(address
      ? [
          {
            key: "address",
            label: "Bank Address",
            value: address,
          } as DetailRow,
        ]
      : []),
  ].filter((row) => row.value?.trim());

  const showAddressLoader =
    Boolean(receipt.ifscCode) && (isLoading || isFetching) && !address;

  return (
    <section
      className={cn(
        "overflow-hidden rounded-2xl border border-[#E5E7EB] bg-white shadow-sm",
        className
      )}
    >
      <div className="bg-gradient-to-r from-[#001F5B] via-[#0057D9] to-[#1565d8] px-4 py-3 text-white">
        <div className="flex items-center gap-3">
          <BankLogo
            bank={{
              name: bankName,
              shortName: bankName,
              ifscPrefix: ifscCode.slice(0, 4) || ifscDetails?.BANKCODE || "",
            }}
            size={40}
            className="rounded-xl bg-white p-1"
          />
          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-blue-100">
              Beneficiary Bank
            </p>
            <h3 className="truncate text-sm font-bold sm:text-base">{bankName}</h3>
          </div>
        </div>
      </div>

      {receipt.accountHolderName ? (
        <header className="bg-[#E67E22] px-4 py-2 text-center">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-orange-100">
            Account Holder
          </p>
          <h4 className="mt-0.5 text-sm font-bold uppercase leading-snug tracking-wide text-white">
            {receipt.accountHolderName}
          </h4>
        </header>
      ) : null}

      <div className="divide-y divide-[#E5E7EB]">
        {rows.map(({ key, label, value, mono, copyable }) => (
          <div
            key={key}
            className={cn(
              "grid grid-cols-[minmax(120px,34%)_1fr] text-sm sm:grid-cols-[minmax(150px,32%)_1fr]",
              key === "address" && "receipt-print-hide"
            )}
          >
            <div className="border-r border-[#E5E7EB] bg-[#F8FAFC] px-3 py-2.5 font-semibold text-[#475569]">
              {label}
            </div>
            <div className="flex items-start justify-between gap-2 bg-white px-3 py-2.5 font-semibold text-[#111827]">
              <span
                className={cn(
                  "break-words leading-snug",
                  mono && "font-mono text-[13px]"
                )}
              >
                {value}
              </span>
              {copyable && value ? (
                <button
                  type="button"
                  className="receipt-no-print shrink-0 rounded-md p-1 text-slate-400 transition hover:bg-slate-100 hover:text-[#0057D9]"
                  onClick={() => void copyValue(label, value)}
                  aria-label={`Copy ${label}`}
                >
                  <Copy className="h-3.5 w-3.5" />
                </button>
              ) : null}
            </div>
          </div>
        ))}

        {showAddressLoader ? (
          <div className="receipt-no-print flex items-center gap-2 px-4 py-3 text-sm text-slate-500">
            <Loader2 className="h-4 w-4 animate-spin text-[#0057D9]" />
            Fetching branch address from IFSC…
          </div>
        ) : null}

        {ifscCode ? (
          <div className="receipt-no-print flex items-start gap-2 bg-[#F8FAFC] px-4 py-2.5 text-xs text-slate-500">
            <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#0057D9]" />
            <span className="leading-relaxed">
              Branch details verified via Razorpay IFSC lookup · {ifscCode}
            </span>
          </div>
        ) : null}
      </div>
    </section>
  );
}

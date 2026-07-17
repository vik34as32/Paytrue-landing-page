"use client";

import { BankLogo } from "@/components/retailer/BankLogo";
import { useIfscLookup } from "@/src/hooks/useIfscLookup";

interface StatementBankCellProps {
  bankName?: string | null;
  receiverName?: string | null;
  ifscCode?: string | null;
}

/** Resolve display bank name from IFSC (Razorpay), else fall back to row fields. */
export default function StatementBankCell({
  bankName,
  receiverName,
  ifscCode,
}: StatementBankCellProps) {
  const ifsc = String(ifscCode || "").trim().toUpperCase();
  const { data: ifscDetails, isLoading } = useIfscLookup(ifsc);

  const resolvedName =
    ifscDetails?.BANK ||
    bankName ||
    receiverName ||
    (isLoading && ifsc ? "Loading…" : "") ||
    "—";

  const showLogo = Boolean(resolvedName !== "—" && (ifsc || bankName || receiverName));

  return (
    <div className="flex min-w-0 items-center gap-2">
      {showLogo ? (
        <BankLogo
          bank={{
            name: resolvedName,
            shortName: resolvedName,
            ifscPrefix: ifsc.slice(0, 4) || "",
          }}
          size={24}
        />
      ) : null}
      <span className="truncate text-slate-700" title={resolvedName}>
        {resolvedName}
      </span>
    </div>
  );
}

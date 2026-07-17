"use client";

import { useState } from "react";
import type { TableColumn } from "react-data-table-component";
import { Download, Eye, MoreHorizontal, Printer, QrCode } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import ReferenceCopyCell from "@/src/components/statement/ReferenceCopyCell";
import { formatCurrency, cn } from "@/lib/utils";
import type {
  StatementTransaction,
  TransactionStatus,
} from "@/types/statementReceipt";

/** Dedicated widths for UPI ATM statement — independent of DMT / AEPS */
const COL = {
  date: "150px",
  reference: "210px",
  customer: "140px",
  mobile: "118px",
  vpa: "180px",
  account: "140px",
  rrn: "140px",
  status: "104px",
  qr: "88px",
  amount: "112px",
  response: "240px",
  action: "88px",
} as const;

function UpiAtmQrCell({ row }: { row: StatementTransaction }) {
  const [open, setOpen] = useState(false);
  const src = row.qrImage?.trim();

  if (!src) {
    return <span className="text-slate-300">—</span>;
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="group inline-flex flex-col items-center gap-0.5 rounded-md border border-slate-200 bg-white p-1 transition hover:border-[#001F5B]/40 hover:shadow-sm"
        title="View QR"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt="UPI QR"
          className="h-12 w-12 object-contain"
        />
        <span className="flex items-center gap-0.5 text-[9px] font-medium uppercase tracking-wide text-slate-500 group-hover:text-[#001F5B]">
          <QrCode className="h-2.5 w-2.5" />
          View
        </span>
      </button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-base">UPI ATM QR</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center gap-3 py-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={src}
              alt="UPI ATM QR code"
              className="h-56 w-56 rounded-lg border border-slate-200 bg-white object-contain p-2"
            />
            <p className="max-w-full truncate font-mono text-xs text-slate-500">
              {row.referenceNumber}
            </p>
            {row.qrString ? (
              <p className="max-h-16 w-full overflow-auto break-all rounded-md bg-slate-50 p-2 font-mono text-[10px] leading-snug text-slate-600">
                {row.qrString}
              </p>
            ) : null}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

function StackedHeader({ lines }: { lines: string[] }) {
  return (
    <span className="inline-flex flex-col items-center justify-center text-[11px] font-bold uppercase tracking-wide leading-[1.2]">
      {lines.map((line) => (
        <span key={line}>{line}</span>
      ))}
    </span>
  );
}

function formatStatementDate(value: string): string {
  return new Date(value).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function hasBalance(txn: StatementTransaction): boolean {
  return txn.openingBalance > 0 || txn.balanceAfter > 0;
}

function nullToZero(value: number | null | undefined): number {
  return value ?? 0;
}

function getWithdrawal(txn: StatementTransaction): number {
  return nullToZero(txn.withdrawalAmount ?? txn.amount);
}

function getCharge(txn: StatementTransaction): number {
  return nullToZero(txn.deductionAmount ?? txn.charges);
}

function getCommission(txn: StatementTransaction): number {
  return nullToZero(txn.commission);
}

/** Only settled success rows show credit / debit movement. */
function getCredit(txn: StatementTransaction): number {
  if (txn.status !== "success") return 0;
  return nullToZero(txn.creditAmount);
}

function getDebit(txn: StatementTransaction): number {
  if (txn.status !== "success") return 0;
  return nullToZero(txn.debitAmount);
}

function AmountCell({
  value,
  tone,
}: {
  value: number;
  tone: "credit" | "debit" | "neutral" | "balance";
}) {
  if (!value && tone !== "balance" && tone !== "neutral") {
    return <span className="text-slate-300">—</span>;
  }

  return (
    <span
      className={cn(
        "font-bold tabular-nums tracking-tight",
        tone === "credit" && "text-emerald-700",
        tone === "debit" && "text-red-600",
        tone === "balance" && "text-[#001F5B]",
        tone === "neutral" && "text-slate-600"
      )}
    >
      {tone === "credit" ? "+" : tone === "debit" ? "−" : ""}
      {formatCurrency(value)}
    </span>
  );
}

function UpiStatusBadge({ status }: { status: TransactionStatus }) {
  if (status === "success") return <Badge variant="success">Success</Badge>;
  if (status === "pending") return <Badge variant="warning">Pending</Badge>;
  if (status === "expired") {
    return (
      <Badge className="border-amber-200 bg-amber-50 text-amber-800 hover:bg-amber-50">
        Expired
      </Badge>
    );
  }
  return <Badge variant="destructive">Failed</Badge>;
}

export type UpiAtmStatementColumnActions = {
  openReceipt: (row: StatementTransaction) => void;
  downloadReceipt: (row: StatementTransaction) => void;
  printReceipt: (row: StatementTransaction) => void;
};

/** UPI ATM–only column set — do not share with DMT / AEPS tables. */
export function buildUpiAtmStatementColumns(
  actions: UpiAtmStatementColumnActions
): TableColumn<StatementTransaction>[] {
  return [
    {
      id: "createdAt",
      name: "Date",
      selector: (row) => row.createdAt,
      sortable: true,
      width: COL.date,
      cell: (row) => (
        <span className="whitespace-nowrap text-slate-600">
          {formatStatementDate(row.createdAt)}
        </span>
      ),
    },
    {
      id: "referenceNumber",
      name: "Reference No.",
      selector: (row) => row.referenceNumber,
      sortable: true,
      width: COL.reference,
      cell: (row) => <ReferenceCopyCell value={row.referenceNumber} />,
    },
    {
      id: "customer",
      name: "Customer",
      selector: (row) => row.accountHolderName ?? row.senderName ?? "",
      sortable: true,
      width: COL.customer,
      wrap: true,
      cell: (row) => (
        <span className="text-slate-700">
          {row.accountHolderName || row.senderName || "—"}
        </span>
      ),
    },
    {
      id: "mobile",
      name: "Mobile",
      selector: (row) => row.mobile,
      sortable: true,
      width: COL.mobile,
      cell: (row) => (
        <span className="tabular-nums text-slate-700">{row.mobile || "—"}</span>
      ),
    },
    {
      id: "vpa",
      name: "VPA",
      selector: (row) => row.vpa ?? "",
      sortable: true,
      width: COL.vpa,
      wrap: true,
      cell: (row) => (
        <span className="break-all font-mono text-xs text-slate-600">
          {row.vpa || "—"}
        </span>
      ),
    },
    {
      id: "accountNumber",
      name: "Account",
      selector: (row) => row.accountNumber ?? "",
      sortable: true,
      width: COL.account,
      cell: (row) => (
        <span className="font-mono text-xs text-slate-700">
          {row.accountNumber || "—"}
        </span>
      ),
    },
    {
      id: "rrn",
      name: "RRN",
      selector: (row) => row.bankReference ?? "",
      sortable: true,
      width: COL.rrn,
      cell: (row) => (
        <span className="font-mono text-xs text-slate-600">
          {row.bankReference || "—"}
        </span>
      ),
    },
    {
      id: "status",
      name: "Status",
      selector: (row) => row.status,
      sortable: true,
      width: COL.status,
      cell: (row) => (
        <span className="inline-flex shrink-0 whitespace-nowrap">
          <UpiStatusBadge status={row.status} />
        </span>
      ),
    },
    {
      id: "qr",
      name: "QR",
      width: COL.qr,
      center: true,
      cell: (row) => <UpiAtmQrCell row={row} />,
      ignoreRowClick: true,
      allowOverflow: true,
      button: true,
    },
    {
      id: "withdrawalAmount",
      name: <StackedHeader lines={["Withdrawal", "Amount"]} />,
      selector: (row) => getWithdrawal(row),
      sortable: true,
      right: true,
      width: COL.amount,
      cell: (row) => (
        <AmountCell value={getWithdrawal(row)} tone="neutral" />
      ),
    },
    {
      id: "chargeAmount",
      name: <StackedHeader lines={["Charge", "Amount"]} />,
      selector: (row) => getCharge(row),
      sortable: true,
      right: true,
      width: COL.amount,
      cell: (row) => (
        <AmountCell
          value={getCharge(row)}
          tone={getCharge(row) > 0 ? "debit" : "neutral"}
        />
      ),
    },
    {
      id: "commission",
      name: "Commission",
      selector: (row) => getCommission(row),
      sortable: true,
      right: true,
      width: COL.amount,
      cell: (row) => (
        <AmountCell
          value={getCommission(row)}
          tone={getCommission(row) > 0 ? "credit" : "neutral"}
        />
      ),
    },
    {
      id: "openingBalance",
      name: <StackedHeader lines={["Previous", "Balance"]} />,
      selector: (row) => row.openingBalance,
      sortable: true,
      right: true,
      width: COL.amount,
      cell: (row) =>
        hasBalance(row) ? (
          <AmountCell value={row.openingBalance} tone="neutral" />
        ) : (
          <span className="text-slate-300">—</span>
        ),
    },
    {
      id: "creditAmount",
      name: <StackedHeader lines={["Credit", "Amount"]} />,
      selector: (row) => getCredit(row),
      sortable: true,
      right: true,
      width: COL.amount,
      cell: (row) => <AmountCell value={getCredit(row)} tone="credit" />,
    },
    {
      id: "debitAmount",
      name: <StackedHeader lines={["Debit", "Amount"]} />,
      selector: (row) => getDebit(row),
      sortable: true,
      right: true,
      width: COL.amount,
      cell: (row) => <AmountCell value={getDebit(row)} tone="debit" />,
    },
    {
      id: "balanceAfter",
      name: <StackedHeader lines={["Updated", "Balance"]} />,
      selector: (row) => row.balanceAfter,
      sortable: true,
      right: true,
      width: COL.amount,
      cell: (row) =>
        hasBalance(row) ? (
          <AmountCell value={row.balanceAfter} tone="balance" />
        ) : (
          <span className="text-slate-300">—</span>
        ),
    },
    {
      id: "response",
      name: "Response",
      selector: (row) => row.remark ?? "",
      sortable: true,
      width: COL.response,
      wrap: true,
      cell: (row) => (
        <span
          className={cn(
            "line-clamp-2 text-xs leading-snug",
            row.status === "failed" || row.status === "expired"
              ? "font-medium text-red-600"
              : row.status === "success"
                ? "text-emerald-700"
                : "text-slate-600"
          )}
          title={row.remark || undefined}
        >
          {row.remark?.trim() ? row.remark : "—"}
        </span>
      ),
    },
    {
      id: "action",
      name: "Action",
      width: COL.action,
      center: true,
      cell: (row) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="icon" className="h-8 w-8">
              <MoreHorizontal className="h-4 w-4" />
              <span className="sr-only">Actions</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-44">
            <DropdownMenuItem onClick={() => actions.openReceipt(row)}>
              <Eye className="h-4 w-4" />
              View Receipt
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => void actions.downloadReceipt(row)}
            >
              <Download className="h-4 w-4" />
              Download PDF
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => void actions.printReceipt(row)}>
              <Printer className="h-4 w-4" />
              Print Receipt
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
      ignoreRowClick: true,
      allowOverflow: false,
      button: true,
    },
  ];
}

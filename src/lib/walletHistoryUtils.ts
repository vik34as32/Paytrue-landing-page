import type { WalletTransferRecord } from "@/types/wallet";

export function formatWalletHistoryDate(value: string): string {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatWalletHistoryDateOnly(value: string): string {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export type WalletHistoryTypeFilter = "All" | "Credit" | "Debit";

export function filterWalletHistoryRows(
  rows: WalletTransferRecord[],
  {
    search,
    typeFilter,
    dateFrom,
    dateTo,
  }: {
    search: string;
    typeFilter: WalletHistoryTypeFilter;
    dateFrom: string;
    dateTo: string;
  }
): WalletTransferRecord[] {
  const query = search.trim().toLowerCase();

  return rows.filter((row) => {
    if (typeFilter === "Credit" && !(row.credit > 0)) return false;
    if (typeFilter === "Debit" && !(row.debit > 0)) return false;

    if (dateFrom || dateTo) {
      const rowDate = row.date ? new Date(row.date) : null;
      if (!rowDate || Number.isNaN(rowDate.getTime())) return false;
      if (dateFrom) {
        const from = new Date(`${dateFrom}T00:00:00`);
        if (rowDate < from) return false;
      }
      if (dateTo) {
        const to = new Date(`${dateTo}T23:59:59`);
        if (rowDate > to) return false;
      }
    }

    if (!query) return true;

    return (
      row.transactionId.toLowerCase().includes(query) ||
      row.transactionType.toLowerCase().includes(query) ||
      row.description.toLowerCase().includes(query) ||
      row.remark.toLowerCase().includes(query) ||
      row.sender.toLowerCase().includes(query) ||
      row.receiver.toLowerCase().includes(query) ||
      row.status.toLowerCase().includes(query)
    );
  });
}

export const WALLET_HISTORY_EXPORT_COLUMNS = [
  {
    label: "Transaction ID",
    key: "transactionId",
    selector: (row: WalletTransferRecord) => row.transactionId,
  },
  {
    label: "Date",
    key: "date",
    selector: (row: WalletTransferRecord) => formatWalletHistoryDate(row.date),
  },
  {
    label: "Transaction Type",
    key: "transactionType",
    selector: (row: WalletTransferRecord) => row.transactionType,
  },
  {
    label: "Description",
    key: "description",
    selector: (row: WalletTransferRecord) => row.description || row.remark,
  },
  {
    label: "Credit",
    key: "credit",
    selector: (row: WalletTransferRecord) => row.credit,
  },
  {
    label: "Debit",
    key: "debit",
    selector: (row: WalletTransferRecord) => row.debit,
  },
  {
    label: "Opening Balance",
    key: "openingBalance",
    selector: (row: WalletTransferRecord) => row.openingBalance,
  },
  {
    label: "Closing Balance",
    key: "closingBalance",
    selector: (row: WalletTransferRecord) => row.closingBalance,
  },
  {
    label: "Status",
    key: "status",
    selector: (row: WalletTransferRecord) => row.status,
  },
];

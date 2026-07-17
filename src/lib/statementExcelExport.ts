import ExcelJS from "exceljs";
import { saveAs } from "file-saver";

export type StatementExportType = "debit" | "credit";
export type StatementExportStatus =
  | "success"
  | "pending"
  | "failed"
  | "expired";

export interface StatementExportTransaction {
  id: string;
  referenceNumber: string;
  createdAt: string;
  service: string;
  description: string;
  type: StatementExportType;
  status: StatementExportStatus;
  amount: number;
  transferAmount?: number;
  /** AEPS cash withdrawal principal */
  withdrawalAmount?: number;
  aepsTransactionType?: string;
  deductionAmount?: number;
  charges?: number;
  commission?: number;
  openingBalance: number;
  balanceAfter: number;
  senderName: string;
  receiverName: string;
  mobile: string;
  remark: string;
}

export interface StatementSortState {
  field: string;
  direction: "asc" | "desc";
}

export interface StatementExcelExportOptions {
  generatedBy: string;
  sortState?: StatementSortState;
}

const WORKSHEET_NAME = "Transaction Statement";
const HEADER_FILL = "FFFFD966";
const TOTAL_FILL = "FFFFD966";
const COLUMN_COUNT = 20;

const COLUMN_HEADERS = [
  "Sr No",
  "Transaction ID",
  "Reference Number",
  "Date",
  "Time",
  "Service",
  "Description",
  "Sender",
  "Receiver",
  "Mobile",
  "Type",
  "Status",
  "Transfer Amount",
  "Deduction Amount",
  "Commission",
  "Opening Balance",
  "Debit",
  "Credit",
  "Closing Balance",
  "Remark",
] as const;

const MIN_COLUMN_WIDTHS: Record<number, number> = {
  1: 8,
  2: 20,
  3: 30,
  4: 22,
  5: 16,
  6: 20,
  7: 35,
  8: 20,
  9: 20,
  10: 16,
  11: 12,
  12: 15,
  13: 16,
  14: 16,
  15: 14,
  16: 18,
  17: 18,
  18: 18,
  19: 18,
  20: 28,
};

const CURRENCY_FORMAT = '"₹"#,##0.00';
const DATE_FORMAT = "dd-mm-yyyy";
const TIME_FORMAT = "hh:mm:ss AM/PM";

const thinBorder: Partial<ExcelJS.Borders> = {
  top: { style: "thin" },
  left: { style: "thin" },
  bottom: { style: "thin" },
  right: { style: "thin" },
};

export function formatStatementTransactionId(id: string): string {
  const numeric = id.replace(/\D/g, "").padStart(6, "0").slice(-6);
  return `TXN${numeric}`;
}

function formatExportFileName(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `Transaction_Statement_${year}_${month}_${day}.xlsx`;
}

function splitDateTime(iso: string): { date: Date; dateOnly: Date; timeOnly: Date } {
  const date = new Date(iso);
  const dateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const timeOnly = new Date(1899, 11, 30, date.getHours(), date.getMinutes(), date.getSeconds());
  return { date, dateOnly, timeOnly };
}

function statusFontColor(status: StatementExportStatus): string {
  if (status === "success") return "FF16A34A";
  if (status === "pending") return "FFEA580C";
  if (status === "expired") return "FF64748B";
  return "FFDC2626";
}

function applyBorder(cell: ExcelJS.Cell) {
  cell.border = thinBorder;
}

function compareValues(
  left: string | number,
  right: string | number,
  direction: StatementSortState["direction"]
): number {
  const multiplier = direction === "asc" ? 1 : -1;
  if (typeof left === "number" && typeof right === "number") {
    return (left - right) * multiplier;
  }
  return String(left).localeCompare(String(right), "en-IN") * multiplier;
}

export function sortStatementTransactions(
  rows: StatementExportTransaction[],
  sortState: StatementSortState
): StatementExportTransaction[] {
  const sorted = [...rows];

  sorted.sort((a, b) => {
    switch (sortState.field) {
      case "createdAt":
        return compareValues(
          new Date(a.createdAt).getTime(),
          new Date(b.createdAt).getTime(),
          sortState.direction
        );
      case "referenceNumber":
      case "Reference No.":
        return compareValues(a.referenceNumber, b.referenceNumber, sortState.direction);
      case "service":
      case "Service":
        return compareValues(a.service, b.service, sortState.direction);
      case "description":
      case "Description":
        return compareValues(a.description, b.description, sortState.direction);
      case "type":
      case "Type":
        return compareValues(a.type, b.type, sortState.direction);
      case "status":
      case "Status":
        return compareValues(a.status, b.status, sortState.direction);
      case "amount":
      case "Amount":
        return compareValues(a.amount, b.amount, sortState.direction);
      case "openingBalance":
      case "Previous Balance":
        return compareValues(a.openingBalance, b.openingBalance, sortState.direction);
      case "balanceAfter":
      case "Closing Balance":
        return compareValues(a.balanceAfter, b.balanceAfter, sortState.direction);
      default:
        return compareValues(
          new Date(a.createdAt).getTime(),
          new Date(b.createdAt).getTime(),
          sortState.direction
        );
    }
  });

  return sorted;
}

function autoFitColumnWidths(sheet: ExcelJS.Worksheet, headerRow: number, dataRowCount: number) {
  for (let col = 1; col <= COLUMN_COUNT; col += 1) {
    let maxLength = MIN_COLUMN_WIDTHS[col] ?? 20;
    const startRow = headerRow;
    const endRow = headerRow + dataRowCount + 1;

    for (let row = startRow; row <= endRow; row += 1) {
      const value = sheet.getCell(row, col).value;
      const text =
        value instanceof Date
          ? value.toLocaleString("en-IN")
          : value == null
            ? ""
            : String(value);
      maxLength = Math.max(maxLength, Math.min(text.length + 2, 50));
    }

    sheet.getColumn(col).width = maxLength;
  }
}

export async function exportStatementToExcel(
  rows: StatementExportTransaction[],
  options: StatementExcelExportOptions
): Promise<void> {
  const generatedAt = new Date();
  const sortState = options.sortState ?? { field: "createdAt", direction: "desc" };
  const sortedRows = sortStatementTransactions(rows, sortState);

  const workbook = new ExcelJS.Workbook();
  workbook.creator = "PayTrue";
  workbook.created = generatedAt;

  const sheet = workbook.addWorksheet(WORKSHEET_NAME, {
    views: [{ state: "frozen", ySplit: 6, activeCell: "A7" }],
  });

  sheet.mergeCells(1, 1, 1, COLUMN_COUNT);
  const titleCell = sheet.getCell(1, 1);
  titleCell.value = "PAYTRUE";
  titleCell.font = { bold: true, size: 16, color: { argb: "FF001F5B" } };
  titleCell.alignment = { horizontal: "center", vertical: "middle" };
  applyBorder(titleCell);

  sheet.mergeCells(2, 1, 2, COLUMN_COUNT);
  const subtitleCell = sheet.getCell(2, 1);
  subtitleCell.value = "Transaction Statement";
  subtitleCell.font = { bold: true, size: 12 };
  subtitleCell.alignment = { horizontal: "center", vertical: "middle" };
  applyBorder(subtitleCell);

  sheet.mergeCells(3, 1, 3, COLUMN_COUNT);
  const generatedOnCell = sheet.getCell(3, 1);
  generatedOnCell.value = `Generated On: ${generatedAt.toLocaleString("en-IN")}`;
  generatedOnCell.alignment = { horizontal: "center", vertical: "middle" };
  applyBorder(generatedOnCell);

  sheet.mergeCells(4, 1, 4, COLUMN_COUNT);
  const generatedByCell = sheet.getCell(4, 1);
  generatedByCell.value = `Generated By: ${options.generatedBy}`;
  generatedByCell.alignment = { horizontal: "center", vertical: "middle" };
  applyBorder(generatedByCell);

  sheet.getRow(5).height = 6;

  const headerRowIndex = 6;
  const headerRow = sheet.getRow(headerRowIndex);
  headerRow.height = 24;

  COLUMN_HEADERS.forEach((header, index) => {
    const cell = headerRow.getCell(index + 1);
    cell.value = header;
    cell.font = { bold: true, size: 12, color: { argb: "FF000000" } };
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: HEADER_FILL },
    };
    cell.alignment = { horizontal: "center", vertical: "middle", wrapText: true };
    applyBorder(cell);
  });

  let totalDebit = 0;
  let totalCredit = 0;
  let closingBalance = 0;

  sortedRows.forEach((txn, index) => {
    const rowIndex = headerRowIndex + 1 + index;
    const row = sheet.getRow(rowIndex);
    const { dateOnly, timeOnly } = splitDateTime(txn.createdAt);
    const debit =
      txn.status === "failed" ? 0 : txn.type === "debit" ? txn.amount : 0;
    const credit =
      txn.status === "failed" ? 0 : txn.type === "credit" ? txn.amount : 0;

    totalDebit += debit;
    totalCredit += credit;
    closingBalance = txn.balanceAfter;

    const transferAmount = txn.withdrawalAmount != null && String(txn.aepsTransactionType || "").toUpperCase() === "CASH_WITHDRAWAL"
      ? (txn.withdrawalAmount ?? txn.amount ?? 0)
      : String(txn.aepsTransactionType || "").toUpperCase() === "CASH_DEPOSIT"
        ? (txn.transferAmount ?? txn.amount ?? 0)
        : (txn.transferAmount ?? txn.amount ?? 0);
    const deductionAmount = txn.deductionAmount ?? txn.charges ?? 0;
    const commissionAmount = txn.commission ?? 0;

    const values: (string | number | Date)[] = [
      index + 1,
      formatStatementTransactionId(txn.id),
      txn.referenceNumber,
      dateOnly,
      timeOnly,
      txn.service,
      txn.description,
      txn.senderName,
      txn.receiverName,
      txn.mobile,
      txn.type.toUpperCase(),
      txn.status.toUpperCase(),
      transferAmount,
      deductionAmount,
      commissionAmount,
      txn.openingBalance,
      debit || "",
      credit || "",
      txn.balanceAfter,
      txn.remark,
    ];

    values.forEach((value, colIndex) => {
      const cell = row.getCell(colIndex + 1);
      cell.value = value;
      cell.alignment = {
        horizontal: colIndex === 0 ? "center" : "left",
        vertical: "middle",
        wrapText: colIndex === 6 || colIndex === 19,
      };
      applyBorder(cell);

      if (colIndex === 3) cell.numFmt = DATE_FORMAT;
      if (colIndex === 4) cell.numFmt = TIME_FORMAT;
      if ([12, 13, 14, 15, 16, 17, 18].includes(colIndex)) {
        cell.numFmt = CURRENCY_FORMAT;
        cell.alignment = { horizontal: "right", vertical: "middle" };
      }
      if (colIndex === 11) {
        cell.font = { bold: true, color: { argb: statusFontColor(txn.status) } };
        cell.alignment = { horizontal: "center", vertical: "middle" };
      }
    });
  });

  const totalRowIndex = headerRowIndex + 1 + sortedRows.length;
  const totalRow = sheet.getRow(totalRowIndex);

  const totalValues: (string | number)[] = [
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "TOTAL",
    "",
    "",
    "",
    "",
    totalDebit,
    totalCredit,
    closingBalance,
    "",
  ];

  totalValues.forEach((value, colIndex) => {
    const cell = totalRow.getCell(colIndex + 1);
    cell.value = value;
    cell.font = { bold: true, color: { argb: "FF000000" } };
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: TOTAL_FILL },
    };
    cell.alignment = {
      horizontal: [12, 13, 14, 15, 16, 17, 18].includes(colIndex)
        ? "right"
        : "center",
      vertical: "middle",
    };
    applyBorder(cell);
    if ([16, 17, 18].includes(colIndex)) {
      cell.numFmt = CURRENCY_FORMAT;
    }
  });

  autoFitColumnWidths(sheet, headerRowIndex, sortedRows.length + 1);

  if (sortedRows.length > 0) {
    sheet.autoFilter = {
      from: { row: headerRowIndex, column: 1 },
      to: { row: headerRowIndex + sortedRows.length, column: COLUMN_COUNT },
    };
  }

  const buffer = await workbook.xlsx.writeBuffer();
  saveAs(
    new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    }),
    formatExportFileName(generatedAt)
  );
}

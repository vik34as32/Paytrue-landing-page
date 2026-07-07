import type {
  CompanyBankAccount,
  FundRequest,
  FundRequestStatus,
  FundRequestStatusFilter,
  FundRequestListParams,
  PaymentMode,
} from "@/src/types/fundRequest";
import { PAYMENT_MODE_OPTIONS } from "@/src/types/fundRequest";
import { exportToCsv, exportToExcel, printTable } from "@/src/lib/exportUtils";

export function formatFundRequestDate(value: string): string {
  if (!value) return "—";
  return new Date(value).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatFundRequestDateOnly(value: string): string {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function maskAccountNumber(accountNumber: string): string {
  const digits = String(accountNumber || "").replace(/\D/g, "");
  if (digits.length <= 4) return accountNumber || "—";
  const last4 = digits.slice(-4);
  const masked = "XXXX XXXX ".repeat(Math.max(0, Math.ceil((digits.length - 4) / 4))).trim();
  return `${masked} ${last4}`.trim();
}

/** Compact mask for dropdowns: ********0038 */
export function maskAccountNumberCompact(accountNumber: string): string {
  const digits = String(accountNumber || "").replace(/\D/g, "");
  if (digits.length <= 4) return accountNumber || "—";
  return `${"*".repeat(8)}${digits.slice(-4)}`;
}

/** Display mask for fintech UI: XXXXXXXX9187 */
export function maskAccountNumberDisplay(accountNumber: string): string {
  const digits = String(accountNumber || "").replace(/\D/g, "");
  if (digits.length <= 4) return accountNumber || "—";
  return `${"X".repeat(8)}${digits.slice(-4)}`;
}

function normalizeStatus(raw: unknown): FundRequestStatus {
  const value = String(raw || "pending").toLowerCase().trim();
  if (value === "approve" || value === "approved") return "approved";
  if (
    value === "decline" ||
    value === "declined" ||
    value === "reject" ||
    value === "rejected"
  ) {
    return "rejected";
  }
  if (value === "cancelled" || value === "processing" || value === "pending") {
    return value;
  }
  return "pending";
}

/** User-facing status label (Approved / Declined etc.) */
export function formatFundRequestStatusLabel(status: FundRequestStatus | string): string {
  const normalized = String(status || "pending").toLowerCase();
  if (normalized === "approved") return "Approved";
  if (normalized === "rejected") return "Declined";
  if (normalized === "pending") return "Pending";
  if (normalized === "processing") return "Processing";
  if (normalized === "cancelled") return "Cancelled";
  return normalized.charAt(0).toUpperCase() + normalized.slice(1);
}

/** Match table filter chip to normalized request status */
export function matchesFundRequestStatusFilter(
  status: FundRequestStatus | string,
  filter: FundRequestStatusFilter
): boolean {
  if (filter === "All") return true;
  const normalized = String(status || "pending").toLowerCase();
  switch (filter) {
    case "Pending":
      return normalized === "pending";
    case "Processing":
      return normalized === "processing";
    case "Approved":
      return normalized === "approved";
    case "Declined":
      return (
        normalized === "rejected" ||
        normalized === "declined" ||
        normalized === "decline"
      );
    case "Cancelled":
      return normalized === "cancelled";
    default:
      return true;
  }
}

function isWithinDateRange(
  isoDate: string,
  dateFrom: string,
  dateTo: string
): boolean {
  if (!isoDate) return true;
  const created = new Date(isoDate);
  if (Number.isNaN(created.getTime())) return true;
  if (dateFrom) {
    const from = new Date(`${dateFrom}T00:00:00`);
    if (created < from) return false;
  }
  if (dateTo) {
    const to = new Date(`${dateTo}T23:59:59.999`);
    if (created > to) return false;
  }
  return true;
}

export function filterFundRequests(
  requests: FundRequest[],
  options: {
    search?: string;
    statusFilter?: FundRequestStatusFilter;
    dateFrom?: string;
    dateTo?: string;
  }
): FundRequest[] {
  const query = (options.search ?? "").trim().toLowerCase();
  const statusFilter = options.statusFilter ?? "All";
  const dateFrom = options.dateFrom ?? "";
  const dateTo = options.dateTo ?? "";

  return requests.filter((request) => {
    if (!matchesFundRequestStatusFilter(request.status, statusFilter)) {
      return false;
    }

    if (!isWithinDateRange(request.createdAt, dateFrom, dateTo)) {
      return false;
    }

    if (!query) return true;

    return (
      request.requestId.toLowerCase().includes(query) ||
      (request.referenceNumber || "").toLowerCase().includes(query) ||
      formatPaymentModeLabel(request.paymentMode).toLowerCase().includes(query) ||
      (request.utrNumber || "").toLowerCase().includes(query) ||
      (request.companyBankName || "").toLowerCase().includes(query) ||
      (request.remark || "").toLowerCase().includes(query) ||
      formatFundRequestStatusLabel(request.status).toLowerCase().includes(query) ||
      (request.approvedBy || "").toLowerCase().includes(query) ||
      (request.createdBy || "").toLowerCase().includes(query)
    );
  });
}

function normalizePaymentMode(raw: unknown): PaymentMode {
  const value = String(raw || "UPI")
    .trim()
    .toUpperCase()
    .replace(/\s+/g, "_");

  const aliases: Record<string, PaymentMode> = {
    UPI: "UPI",
    IMPS: "IMPS",
    NEFT: "NEFT",
    RTGS: "RTGS",
    BANK_TRANSFER: "BANK_TRANSFER",
    BANKTRANSFER: "BANK_TRANSFER",
    CASH_DEPOSIT: "CASH_DEPOSIT",
    CASHDEPOSIT: "CASH_DEPOSIT",
  };

  return aliases[value] ?? "UPI";
}

export function formatPaymentModeLabel(mode: PaymentMode | string): string {
  const normalized = normalizePaymentMode(mode);
  const match = PAYMENT_MODE_OPTIONS.find((option) => option.value === normalized);
  return match?.label ?? normalized.replace(/_/g, " ");
}

export function normalizeCompanyBankAccount(raw: Record<string, unknown>): CompanyBankAccount {
  return {
    id: String(raw.id ?? raw._id ?? raw.bankAccountId ?? ""),
    bankName: String(raw.bankName ?? raw.bank ?? "—"),
    accountHolderName: String(
      raw.accountHolderName ?? raw.accountHolder ?? raw.holderName ?? "—"
    ),
    accountNumber: String(raw.accountNumber ?? raw.accountNo ?? ""),
    ifscCode: String(raw.ifscCode ?? raw.ifsc ?? ""),
    branch: raw.branch ? String(raw.branch) : undefined,
    upiId: raw.upiId ? String(raw.upiId) : raw.upi ? String(raw.upi) : undefined,
    isActive: raw.isActive !== false && raw.status !== "inactive",
  };
}

export function normalizeFundRequest(raw: Record<string, unknown>): FundRequest {
  const companyBank =
    (raw.companyBank as Record<string, unknown> | undefined) ||
    (raw.bankAccount as Record<string, unknown> | undefined);

  return {
    id: String(raw.id ?? raw._id ?? ""),
    requestId: String(
      raw.requestId ?? raw.referenceNumber ?? raw.reference ?? raw.id ?? ""
    ),
    referenceNumber: String(
      raw.referenceNumber ?? raw.requestId ?? raw.reference ?? raw.id ?? ""
    ),
    amount: Number(raw.amount ?? 0),
    paymentMode: normalizePaymentMode(raw.paymentMode ?? raw.mode),
    utrNumber: String(raw.utrNumber ?? raw.utr ?? raw.referenceNumber ?? ""),
    paymentDate: String(raw.paymentDate ?? raw.transferDate ?? raw.date ?? ""),
    remark: String(raw.remark ?? raw.remarks ?? raw.description ?? ""),
    status: normalizeStatus(raw.status),
    createdBy: String(raw.createdBy ?? raw.requestedBy ?? raw.userName ?? ""),
    approvedBy: String(raw.approvedBy ?? raw.approvedByName ?? ""),
    approvedDate: String(raw.approvedDate ?? raw.approvedAt ?? ""),
    adminRemark: String(
      raw.adminRemark ??
        raw.adminRemarks ??
        raw.adminComment ??
        raw.rejectionReason ??
        ""
    ),
    createdAt: String(raw.createdAt ?? raw.requestedDate ?? new Date().toISOString()),
    updatedAt: String(raw.updatedAt ?? raw.createdAt ?? new Date().toISOString()),
    companyBankId: String(
      raw.companyBankAccountId ?? raw.companyBankId ?? companyBank?.id ?? ""
    ),
    companyBankName: String(
      raw.companyBankName ??
        companyBank?.bankName ??
        raw.depositBankName ??
        ""
    ),
    bankName: String(raw.bankName ?? raw.senderBankName ?? ""),
    receiptUrl: String(raw.receiptUrl ?? raw.receipt ?? raw.proofUrl ?? "") || undefined,
  };
}

export function extractFundRequestList(payload: unknown): Record<string, unknown>[] {
  if (Array.isArray(payload)) return payload as Record<string, unknown>[];
  if (payload && typeof payload === "object") {
    const data = payload as Record<string, unknown>;
    const list =
      data.requests ??
      data.items ??
      data.list ??
      data.fundRequests ??
      data.records ??
      data.data;
    if (Array.isArray(list)) return list as Record<string, unknown>[];
  }
  return [];
}

export function extractFundRequestPagination(
  payload: unknown,
  fallback: { page: number; limit: number }
): { total: number; page: number; limit: number } {
  if (!payload || typeof payload !== "object") {
    return { total: 0, ...fallback };
  }
  const data = payload as Record<string, unknown>;
  const pagination =
    data.pagination && typeof data.pagination === "object"
      ? (data.pagination as Record<string, unknown>)
      : undefined;

  const list = extractFundRequestList(payload);

  return {
    total: Number(
      data.total ??
        data.totalCount ??
        pagination?.total ??
        pagination?.totalCount ??
        list.length
    ),
    page: Number(data.page ?? pagination?.page ?? fallback.page),
    limit: Number(data.limit ?? pagination?.limit ?? fallback.limit),
  };
}

/** Map UI status chip to API query value */
export function mapFundRequestStatusFilterToApi(
  filter: FundRequestStatusFilter
): string | undefined {
  switch (filter) {
    case "Pending":
      return "pending";
    case "Processing":
      return "processing";
    case "Approved":
      return "approved";
    case "Declined":
      return "rejected";
    case "Cancelled":
      return "cancelled";
    default:
      return undefined;
  }
}

export function buildFundRequestListQuery(
  params: FundRequestListParams
): Record<string, string | number> {
  const query: Record<string, string | number> = {};

  if (params.page) query.page = params.page;
  if (params.limit) query.limit = params.limit;
  if (params.search?.trim()) query.search = params.search.trim();
  if (params.status) query.status = params.status;
  if (params.dateFrom) query.dateFrom = params.dateFrom;
  if (params.dateTo) query.dateTo = params.dateTo;
  if (params.sortBy) query.sortBy = params.sortBy;
  if (params.sortOrder) query.sortOrder = params.sortOrder;

  return query;
}

export function extractCompanyBankAccounts(payload: unknown): Record<string, unknown>[] {
  if (payload && typeof payload === "object") {
    const data = payload as Record<string, unknown>;
    const list =
      data.companyBankAccounts ??
      data.companyBanks ??
      data.bankAccounts ??
      data.depositAccounts ??
      data.accounts;
    if (Array.isArray(list)) return list as Record<string, unknown>[];
  }
  return [];
}

const EXPORT_COLUMNS = [
  { label: "Reference", key: "referenceNumber", selector: (row: FundRequest) => row.referenceNumber || row.requestId },
  { label: "Amount", key: "amount", selector: (row: FundRequest) => row.amount },
  { label: "Company Account", key: "companyBankName", selector: (row: FundRequest) => row.companyBankName || "—" },
  { label: "Payment Mode", key: "paymentMode", selector: (row: FundRequest) => formatPaymentModeLabel(row.paymentMode) },
  { label: "UTR", key: "utrNumber", selector: (row: FundRequest) => row.utrNumber || "—" },
  { label: "Status", key: "status", selector: (row: FundRequest) => formatFundRequestStatusLabel(row.status) },
  { label: "Requested Date", key: "createdAt", selector: (row: FundRequest) => formatFundRequestDate(row.createdAt) },
  { label: "Approved By", key: "approvedBy", selector: (row: FundRequest) => row.approvedBy || "—" },
];

export function exportFundRequestsCsv(rows: FundRequest[]): void {
  exportToCsv(
    `Fund_Requests_${new Date().toISOString().slice(0, 10)}.csv`,
    rows,
    EXPORT_COLUMNS
  );
}

export function exportFundRequestsExcel(rows: FundRequest[]): void {
  exportToExcel(
    `Fund_Requests_${new Date().toISOString().slice(0, 10)}`,
    rows,
    EXPORT_COLUMNS
  );
}

export function printFundRequests(rows: FundRequest[]): void {
  printTable(
    `Fund Request History (${rows.length} records)`,
    rows,
    EXPORT_COLUMNS
  );
}

export async function exportFundRequestsPdf(rows: FundRequest[]): Promise<void> {
  const { jsPDF } = await import("jspdf");
  const autoTable = (await import("jspdf-autotable")).default;

  const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
  doc.setFontSize(16);
  doc.setTextColor(0, 31, 91);
  doc.text("Fund Request History", 14, 14);
  doc.setFontSize(9);
  doc.setTextColor(100, 100, 100);
  doc.text(`Generated: ${new Date().toLocaleString("en-IN")} · ${rows.length} records`, 14, 20);

  autoTable(doc, {
    head: [EXPORT_COLUMNS.map((col) => col.label)],
    body: rows.map((row) =>
      EXPORT_COLUMNS.map((col) => String(col.selector(row) ?? ""))
    ),
    startY: 24,
    styles: { fontSize: 8, cellPadding: 2 },
    headStyles: { fillColor: [0, 87, 217], textColor: 255 },
    alternateRowStyles: { fillColor: [248, 250, 252] },
  });

  doc.save(`Fund_Requests_${new Date().toISOString().slice(0, 10)}.pdf`);
}

export async function downloadFundRequestReceipt(
  request: FundRequest
): Promise<void> {
  if (request.receiptUrl) {
    window.open(request.receiptUrl, "_blank", "noopener,noreferrer");
    return;
  }

  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF();

  doc.setFontSize(18);
  doc.setTextColor(0, 31, 91);
  doc.text("PAYTRUE", 105, 20, { align: "center" });

  doc.setFontSize(14);
  doc.text("Fund Request Receipt", 105, 30, { align: "center" });

  doc.setFontSize(10);
  doc.setTextColor(80, 80, 80);

  const lines = [
    ["Reference", request.referenceNumber || request.requestId],
    ["Amount", `₹${request.amount.toLocaleString("en-IN")}`],
    ["Company Bank", request.companyBankName || "—"],
    ["Payment Mode", formatPaymentModeLabel(request.paymentMode)],
    ["UTR", request.utrNumber || "—"],
    ["Status", formatFundRequestStatusLabel(request.status)],
    ["Created By", request.createdBy],
    ["Approved By", request.approvedBy || "—"],
    ["Created At", formatFundRequestDate(request.createdAt)],
    ["Approved At", request.approvedDate ? formatFundRequestDate(request.approvedDate) : "—"],
    ["Remark", request.remark || "—"],
  ];

  let y = 48;
  lines.forEach(([label, value]) => {
    doc.setFont("helvetica", "bold");
    doc.text(`${label}:`, 20, y);
    doc.setFont("helvetica", "normal");
    doc.text(String(value), 70, y);
    y += 10;
  });

  doc.save(`Receipt_${request.requestId}.pdf`);
}

export function viewFundRequestReceipt(request: FundRequest): void {
  if (request.receiptUrl) {
    window.open(request.receiptUrl, "_blank", "noopener,noreferrer");
    return;
  }
  void downloadFundRequestReceipt(request);
}

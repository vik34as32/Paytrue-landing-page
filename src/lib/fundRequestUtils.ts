import type { FundRequest } from "@/src/types/fundRequest";

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

export function exportFundRequestsCsv(rows: FundRequest[]): void {
  const headers = [
    "Request ID",
    "Requested Amount",
    "Payment Mode",
    "UTR",
    "Remark",
    "Requested Date",
    "Status",
    "Approved By",
    "Approved Date",
  ];

  const csvRows = rows.map((row) => [
    row.requestId,
    row.amount,
    row.paymentMode,
    row.utrNumber || "",
    `"${row.remark.replace(/"/g, '""')}"`,
    formatFundRequestDate(row.createdAt),
    row.status,
    row.approvedBy || "",
    row.approvedDate ? formatFundRequestDate(row.approvedDate) : "",
  ]);

  const csv = [headers.join(","), ...csvRows.map((r) => r.join(","))].join(
    "\n"
  );

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `Fund_Requests_${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

export async function downloadFundRequestReceipt(
  request: FundRequest
): Promise<void> {
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
    ["Request ID", request.requestId],
    ["Amount", `₹${request.amount.toLocaleString("en-IN")}`],
    ["Payment Mode", request.paymentMode],
    ["UTR", request.utrNumber || "—"],
    ["Status", request.status.toUpperCase()],
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

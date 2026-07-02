import { formatStatementTransactionId } from "@/src/lib/statementExcelExport";
import { formatCurrency } from "@/lib/utils";
import type {
  ReceiptCustomerInfo,
  ReceiptViewModel,
  StatementTransaction,
} from "@/types/statementReceipt";

export function formatTransactionId(id: string): string {
  return formatStatementTransactionId(id);
}

export function formatStatementDateTime(value: string): string {
  return new Date(value).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function splitReceiptDateTime(value: string): { date: string; time: string } {
  const parsed = new Date(value);
  return {
    date: parsed.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }),
    time: parsed.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    }),
  };
}

function extractOperator(txn: StatementTransaction): string {
  if (txn.description.includes("·")) {
    return txn.description.split("·")[0]?.trim() || txn.receiverName;
  }
  return txn.receiverName;
}

function deriveCommission(txn: StatementTransaction): number {
  if (txn.type !== "credit") return 0;
  const hint = `${txn.remark} ${txn.description} ${txn.senderName}`.toLowerCase();
  if (hint.includes("commission")) return txn.amount;
  return 0;
}

function getStatusLabel(status: StatementTransaction["status"]): string {
  if (status === "success") return "Payment Successful";
  if (status === "pending") return "Payment Pending";
  return "Payment Failed";
}

function getStatusBadgeLabel(status: StatementTransaction["status"]): string {
  if (status === "success") return "Success";
  if (status === "pending") return "Pending";
  return "Failed";
}

export function buildReceiptViewModel(
  txn: StatementTransaction,
  customer: ReceiptCustomerInfo
): ReceiptViewModel {
  const transactionId = formatTransactionId(txn.id);
  const { date, time } = splitReceiptDateTime(txn.createdAt);
  const commission = deriveCommission(txn);
  const charge = 0;
  const gst = 0;

  return {
    receiptNo: txn.referenceNumber,
    transactionId,
    date,
    time,
    dateTime: formatStatementDateTime(txn.createdAt),
    status: txn.status,
    statusLabel: getStatusLabel(txn.status),
    statusBadge: getStatusBadgeLabel(txn.status),
    operator: extractOperator(txn),
    service: txn.service,
    description: txn.description,
    amount: txn.amount,
    charge,
    gst,
    commission,
    netDebit: txn.type === "debit" ? txn.amount : 0,
    netAmount:
      txn.type === "debit"
        ? txn.amount + charge + gst
        : Math.max(txn.amount - commission, 0),
    openingBalance: txn.openingBalance,
    closingBalance: txn.balanceAfter,
    referenceNumber: txn.referenceNumber,
    bankReference: `BNK-${txn.referenceNumber}`,
    paymentMode: "PayTrue Wallet",
    transactionType: txn.type,
    remark: txn.remark,
    customer,
    qrPayload: JSON.stringify({
      transactionId,
      amount: txn.amount,
      status: txn.status.toUpperCase(),
      date,
    }),
  };
}

export function getReceiptPdfFilename(txn: StatementTransaction): string {
  const txnId = formatTransactionId(txn.id);
  const date = new Date(txn.createdAt);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `PAYTRUE_RECEIPT_${txnId}_${year}-${month}-${day}.pdf`;
}

export function formatAmountDisplay(
  type: StatementTransaction["type"],
  amount: number
): string {
  return `${type === "debit" ? "-" : "+"}${formatCurrency(amount)}`;
}

async function loadImageAsDataUrl(path: string): Promise<string | null> {
  try {
    const response = await fetch(path);
    const blob = await response.blob();
    return await new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(String(reader.result));
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
}

export async function downloadStatementReceiptPdf(
  txn: StatementTransaction,
  customer: ReceiptCustomerInfo
): Promise<void> {
  const [{ jsPDF }, QRCode, autoTableModule] = await Promise.all([
    import("jspdf"),
    import("qrcode"),
    import("jspdf-autotable"),
  ]);

  const autoTable = autoTableModule.default;
  const receipt = buildReceiptViewModel(txn, customer);
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 14;
  let y = margin;

  const logoDataUrl = await loadImageAsDataUrl("/images/paytrue-logo.png");
  if (logoDataUrl) {
    doc.addImage(logoDataUrl, "PNG", margin, y, 14, 14);
  }

  doc.setTextColor(0, 31, 91);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text("Paytrue", margin + 18, y + 6);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139);
  doc.text("Retailer Payment Receipt", margin + 18, y + 11);

  doc.setFontSize(8);
  doc.setTextColor(17, 24, 39);
  doc.text(`Receipt No: ${receipt.receiptNo}`, pageWidth - margin, y + 2, {
    align: "right",
  });
  doc.text(`Transaction ID: ${receipt.transactionId}`, pageWidth - margin, y + 7, {
    align: "right",
  });
  doc.text(`Date: ${receipt.date}`, pageWidth - margin, y + 12, { align: "right" });
  doc.text(`Time: ${receipt.time}`, pageWidth - margin, y + 17, { align: "right" });
  doc.text(`Status: ${receipt.statusBadge}`, pageWidth - margin, y + 22, {
    align: "right",
  });

  y += 28;

  doc.setDrawColor(229, 231, 235);
  doc.setFillColor(236, 253, 245);
  doc.roundedRect(margin, y, pageWidth - margin * 2, 28, 3, 3, "FD");
  doc.setTextColor(22, 163, 74);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.text(receipt.statusLabel, pageWidth / 2, y + 10, { align: "center" });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(71, 85, 105);
  doc.text(
    "Your transaction has been successfully completed.",
    pageWidth / 2,
    y + 16,
    { align: "center" }
  );
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.setTextColor(0, 31, 91);
  doc.text(formatCurrency(receipt.amount), pageWidth / 2, y + 24, {
    align: "center",
  });

  y += 36;

  autoTable(doc, {
    startY: y,
    theme: "plain",
    styles: { fontSize: 8.5, cellPadding: 2.5, textColor: [17, 24, 39] },
    headStyles: {
      fillColor: [248, 250, 252],
      textColor: [0, 31, 91],
      fontStyle: "bold",
    },
    head: [["Customer Details", ""]],
    body: [
      ["Customer Name", receipt.customer.customerName],
      ["Retailer ID", receipt.customer.retailerId],
      ["Mobile Number", receipt.customer.mobile],
      ["Outlet Name", receipt.customer.outletName],
      ["Location", receipt.customer.location],
    ],
    margin: { left: margin, right: margin },
  });

  y =
    ((doc as { lastAutoTable?: { finalY: number } }).lastAutoTable?.finalY ??
      y) + 6;

  autoTable(doc, {
    startY: y,
    theme: "plain",
    styles: { fontSize: 8.5, cellPadding: 2.5, textColor: [17, 24, 39] },
    headStyles: {
      fillColor: [248, 250, 252],
      textColor: [0, 31, 91],
      fontStyle: "bold",
    },
    head: [["Transaction Details", ""]],
    body: [
      ["Transaction ID", receipt.transactionId],
      ["Reference Number", receipt.referenceNumber],
      ["Operator", receipt.operator],
      ["Service", receipt.service],
      ["Payment Mode", receipt.paymentMode],
      ["Status", receipt.status.toUpperCase()],
      ["Date", receipt.date],
      ["Time", receipt.time],
      ["Opening Balance", formatCurrency(receipt.openingBalance)],
      ["Closing Balance", formatCurrency(receipt.closingBalance)],
      ["Commission", formatCurrency(receipt.commission)],
      ["Charges", formatCurrency(receipt.charge)],
      ["GST", formatCurrency(receipt.gst)],
    ],
    margin: { left: margin, right: margin },
  });

  y =
    ((doc as { lastAutoTable?: { finalY: number } }).lastAutoTable?.finalY ??
      y) + 6;

  autoTable(doc, {
    startY: y,
    theme: "grid",
    styles: { fontSize: 8.5, cellPadding: 2.5, textColor: [17, 24, 39] },
    headStyles: { fillColor: [10, 132, 255], textColor: 255, fontStyle: "bold" },
    head: [["Payment Summary", "Amount"]],
    body: [
      ["Amount", formatCurrency(receipt.amount)],
      ["Charges", formatCurrency(receipt.charge)],
      ["Commission", formatCurrency(receipt.commission)],
      ["GST", formatCurrency(receipt.gst)],
      ["Net Amount", formatCurrency(receipt.netAmount)],
      ["Wallet Balance", formatCurrency(receipt.closingBalance)],
    ],
    margin: { left: margin, right: margin },
  });

  y =
    ((doc as { lastAutoTable?: { finalY: number } }).lastAutoTable?.finalY ??
      y) + 6;

  doc.setFillColor(239, 246, 255);
  doc.setDrawColor(191, 219, 254);
  doc.roundedRect(margin, y, pageWidth - margin * 2, 18, 2, 2, "FD");
  doc.setFontSize(8);
  doc.setTextColor(0, 31, 91);
  const notice =
    "This transaction has been securely processed through the Paytrue Digital Payment Platform. Please keep this receipt for future reference.";
  doc.text(doc.splitTextToSize(notice, pageWidth - margin * 2 - 8), margin + 4, y + 6);

  const qrDataUrl = await QRCode.toDataURL(receipt.qrPayload, {
    margin: 1,
    width: 120,
    color: { dark: "#001F5B", light: "#FFFFFF" },
  });

  const qrY = y + 24;
  if (qrY + 42 < 285) {
    doc.addImage(qrDataUrl, "PNG", pageWidth - margin - 32, qrY, 32, 32);
    doc.setFontSize(7);
    doc.setTextColor(100, 116, 139);
    doc.text("Scan to Verify", pageWidth - margin - 16, qrY + 36, {
      align: "center",
    });
    doc.text("Transaction Verification", pageWidth - margin - 16, qrY + 40, {
      align: "center",
    });
  }

  const footerY = Math.min(Math.max(qrY + 48, y + 48), 272);
  doc.setDrawColor(229, 231, 235);
  doc.line(margin, footerY, pageWidth - margin, footerY);
  doc.setFontSize(8);
  doc.setTextColor(0, 31, 91);
  doc.setFont("helvetica", "bold");
  doc.text("Powered by Paytrue", pageWidth / 2, footerY + 8, { align: "center" });
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100, 116, 139);
  doc.text("support@paytrue.co.in", pageWidth / 2, footerY + 13, { align: "center" });
  doc.text("www.paytrue.co.in", pageWidth / 2, footerY + 18, { align: "center" });
  doc.text("Thank you for using Paytrue.", pageWidth / 2, footerY + 25, {
    align: "center",
  });
  doc.setFontSize(7);
  doc.text("Computer Generated Receipt", pageWidth / 2, footerY + 30, {
    align: "center",
  });
  doc.text("No Signature Required", pageWidth / 2, footerY + 34, {
    align: "center",
  });

  doc.save(getReceiptPdfFilename(txn));
}

export async function generateReceiptQrDataUrl(payload: string): Promise<string> {
  const QRCode = (await import("qrcode")).default;
  return QRCode.toDataURL(payload, {
    margin: 1,
    width: 160,
    color: { dark: "#001F5B", light: "#FFFFFF" },
  });
}

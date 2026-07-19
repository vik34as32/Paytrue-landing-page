import { formatStatementTransactionId } from "@/src/lib/statementExcelExport";
import { formatCurrency } from "@/lib/utils";
import { resolveBankLogoFromIfsc } from "@/src/lib/bankLogos";
import { enrichStatementWithIfsc } from "@/src/services/ifscService";
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
  if (typeof txn.commission === "number" && Number.isFinite(txn.commission)) {
    return txn.commission;
  }
  if (txn.type !== "credit") return 0;
  const hint = `${txn.remark} ${txn.description} ${txn.senderName}`.toLowerCase();
  if (hint.includes("commission")) return txn.amount;
  return 0;
}

function getStatusLabel(status: StatementTransaction["status"]): string {
  if (status === "success") return "Payment Successful";
  if (status === "pending") return "Payment Pending";
  if (status === "expired") return "QR Expired";
  return "Payment Failed";
}

function getStatusBadgeLabel(status: StatementTransaction["status"]): string {
  if (status === "success") return "Success";
  if (status === "pending") return "Pending";
  if (status === "expired") return "Expired";
  return "Failed";
}

export function buildReceiptViewModel(
  txn: StatementTransaction,
  customer: ReceiptCustomerInfo
): ReceiptViewModel {
  const transactionId = formatTransactionId(txn.id);
  const { date, time } = splitReceiptDateTime(txn.createdAt);
  const commission = deriveCommission(txn);
  const charge = txn.charges ?? 0;
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
    bankReference: txn.bankReference || "",
    paymentMode: txn.transferMode || txn.service,
    transactionType: txn.type,
    remark: txn.remark,
    customer,
    qrPayload: JSON.stringify({
      transactionId,
      reference: txn.referenceNumber,
      amount: txn.amount,
      status: txn.status.toUpperCase(),
      date,
    }),
    bankName: txn.bankName || undefined,
    accountNumber: txn.accountNumber,
    accountHolderName: txn.accountHolderName || txn.receiverName || undefined,
    ifscCode: txn.ifscCode || undefined,
    bankBranch: txn.bankBranch || undefined,
    bankAddress: txn.bankAddress || undefined,
    bankCity: txn.bankCity || undefined,
    bankState: txn.bankState || undefined,
    txnMobile: txn.mobile,
    aepsTransactionLabel: txn.aepsTransactionType
      ? txn.aepsTransactionType
          .replace(/_/g, " ")
          .toLowerCase()
          .replace(/\b\w/g, (char) => char.toUpperCase())
      : undefined,
    showWalletBalance: txn.source === "dmt" && txn.openingBalance > 0,
    showBankDetailsCard: Boolean(
      txn.bankName || txn.accountNumber || txn.ifscCode || txn.accountHolderName
    ),
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
  const enrichedTxn = await enrichStatementWithIfsc(txn);
  const receipt = buildReceiptViewModel(enrichedTxn, customer);
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

  /* Compact status + amount strip (no Payment Summary section) */
  doc.setDrawColor(229, 231, 235);
  doc.setFillColor(236, 253, 245);
  doc.roundedRect(margin, y, pageWidth - margin * 2, 18, 2, 2, "FD");
  doc.setTextColor(22, 163, 74);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text(receipt.statusLabel, pageWidth / 2, y + 7, { align: "center" });
  doc.setFontSize(14);
  doc.setTextColor(0, 31, 91);
  doc.text(formatCurrency(receipt.amount), pageWidth / 2, y + 14, {
    align: "center",
  });

  y += 24;

  autoTable(doc, {
    startY: y,
    theme: "plain",
    styles: { fontSize: 8, cellPadding: 1.8, textColor: [17, 24, 39] },
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
      y) + 4;

  if (receipt.showBankDetailsCard) {
    const bankLogoPath = resolveBankLogoFromIfsc(
      receipt.bankName || "",
      receipt.ifscCode
    );
    const bankLogoDataUrl = bankLogoPath
      ? await loadImageAsDataUrl(bankLogoPath)
      : null;

    doc.setFillColor(0, 31, 91);
    doc.roundedRect(margin, y, pageWidth - margin * 2, 12, 2, 2, "F");
    if (bankLogoDataUrl) {
      doc.addImage(bankLogoDataUrl, "SVG", margin + 2, y + 1.5, 9, 9);
    }
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.text(
      receipt.bankName || "Bank",
      margin + (bankLogoDataUrl ? 14 : 3),
      y + 7.5
    );

    y += 14;

    if (receipt.accountHolderName) {
      doc.setFillColor(230, 126, 34);
      doc.rect(margin, y, pageWidth - margin * 2, 7, "F");
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(8);
      doc.text(receipt.accountHolderName, pageWidth / 2, y + 4.8, {
        align: "center",
      });
      y += 9;
    }

    autoTable(doc, {
      startY: y,
      theme: "plain",
      styles: { fontSize: 8, cellPadding: 1.8, textColor: [17, 24, 39] },
      headStyles: {
        fillColor: [248, 250, 252],
        textColor: [0, 31, 91],
        fontStyle: "bold",
      },
      head: [["Beneficiary Bank Details", ""]],
      body: [
        ...(receipt.accountNumber
          ? [["Account Number", receipt.accountNumber] as [string, string]]
          : []),
        ...(receipt.ifscCode
          ? [["IFSC Code", receipt.ifscCode] as [string, string]]
          : []),
        ...(receipt.bankBranch
          ? [["Branch", receipt.bankBranch] as [string, string]]
          : []),
      ],
      margin: { left: margin, right: margin },
    });

    y =
      ((doc as { lastAutoTable?: { finalY: number } }).lastAutoTable?.finalY ??
        y) + 4;
  }

  const txnBody: [string, string][] = [
    ["Amount", formatCurrency(receipt.amount)],
    ["Transaction ID", receipt.transactionId],
    ["Reference Number", receipt.referenceNumber],
    ...(receipt.bankReference
      ? [["Bank Reference / RRN", receipt.bankReference] as [string, string]]
      : []),
    ...(receipt.aepsTransactionLabel
      ? [["Transaction Type", receipt.aepsTransactionLabel] as [string, string]]
      : []),
    ...(receipt.showBankDetailsCard
      ? []
      : receipt.bankName
        ? [["Bank Name", receipt.bankName] as [string, string]]
        : []),
    ...(receipt.showBankDetailsCard
      ? []
      : receipt.accountNumber
        ? [["Account Number", receipt.accountNumber] as [string, string]]
        : []),
    ...(receipt.txnMobile
      ? [["Mobile Number", receipt.txnMobile] as [string, string]]
      : []),
    ["Payment Mode", receipt.paymentMode],
    ["Status", receipt.status.toUpperCase()],
    ["Date", receipt.date],
    ["Time", receipt.time],
  ];

  autoTable(doc, {
    startY: y,
    theme: "plain",
    styles: { fontSize: 8, cellPadding: 1.8, textColor: [17, 24, 39] },
    headStyles: {
      fillColor: [248, 250, 252],
      textColor: [0, 31, 91],
      fontStyle: "bold",
    },
    head: [["Transaction Details", ""]],
    body: txnBody,
    margin: { left: margin, right: margin },
  });

  y =
    ((doc as { lastAutoTable?: { finalY: number } }).lastAutoTable?.finalY ??
      y) + 4;

  doc.setFillColor(239, 246, 255);
  doc.setDrawColor(191, 219, 254);
  doc.roundedRect(margin, y, pageWidth - margin * 2, 12, 2, 2, "FD");
  doc.setFontSize(7.5);
  doc.setTextColor(0, 31, 91);
  const notice =
    "This transaction has been securely processed through the Paytrue Digital Payment Platform. Please keep this receipt for future reference.";
  doc.text(doc.splitTextToSize(notice, pageWidth - margin * 2 - 8), margin + 3, y + 5);

  const qrDataUrl = await QRCode.toDataURL(receipt.qrPayload, {
    margin: 1,
    width: 100,
    color: { dark: "#001F5B", light: "#FFFFFF" },
  });

  const qrY = y + 16;
  if (qrY + 34 < 275) {
    doc.addImage(qrDataUrl, "PNG", pageWidth - margin - 28, qrY, 28, 28);
    doc.setFontSize(6.5);
    doc.setTextColor(100, 116, 139);
    doc.text("Scan to Verify", pageWidth - margin - 14, qrY + 31, {
      align: "center",
    });
  }

  const footerY = Math.min(Math.max(qrY + 36, y + 30), 280);
  doc.setDrawColor(229, 231, 235);
  doc.line(margin, footerY, pageWidth - margin, footerY);
  doc.setFontSize(8);
  doc.setTextColor(0, 31, 91);
  doc.setFont("helvetica", "bold");
  doc.text("Powered by Paytrue", pageWidth / 2, footerY + 6, { align: "center" });
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100, 116, 139);
  doc.setFontSize(7);
  doc.text(
    "support@paytrue.co.in · www.paytrue.co.in",
    pageWidth / 2,
    footerY + 11,
    { align: "center" }
  );
  doc.text("Thank you for using Paytrue. · Computer Generated Receipt", pageWidth / 2, footerY + 16, {
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

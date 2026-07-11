import { formatCurrency } from "@/lib/utils";
import { resolveBankLogoFromIfsc } from "@/src/lib/bankLogos";
import type { AepsMiniStatementRow, AepsTransactionResult } from "@/src/types/aeps";

export interface AepsMiniStatementViewModel {
  bankName: string;
  accountNumber?: string;
  bankAccountBalance?: number;
  customerName?: string;
  mobileNumber?: string;
  referenceId?: string;
  rrn?: string;
  generatedAt: string;
  rows: AepsMiniStatementRow[];
  ifscCode?: string;
}

function formatTxnType(type: string): string {
  const normalized = type.trim().toUpperCase();
  if (normalized === "C" || normalized === "CR" || normalized === "CREDIT") {
    return "Credit";
  }
  if (normalized === "D" || normalized === "DR" || normalized === "DEBIT") {
    return "Debit";
  }
  return type || "—";
}

function isCreditType(type: string): boolean {
  const normalized = type.trim().toUpperCase();
  return normalized === "C" || normalized === "CR" || normalized === "CREDIT";
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

export function buildAepsMiniStatementViewModel(
  result: AepsTransactionResult
): AepsMiniStatementViewModel {
  return {
    bankName: result.bankName || "Bank",
    accountNumber: result.accountNumber,
    bankAccountBalance: result.bankAccountBalance ?? result.balance,
    customerName: result.customerName,
    mobileNumber: result.mobileNumber,
    referenceId: result.referenceId,
    rrn: result.rrn,
    generatedAt: new Date().toISOString(),
    rows: result.miniStatement ?? [],
    ifscCode: result.ifscCode,
  };
}

export function getMiniStatementPdfFilename(view: AepsMiniStatementViewModel): string {
  const bankKey = view.bankName.replace(/[^a-z0-9]+/gi, "_").slice(0, 24) || "BANK";
  const date = new Date(view.generatedAt).toISOString().slice(0, 10);
  return `MINI_STATEMENT_${bankKey}_${date}.pdf`;
}

export async function downloadAepsMiniStatementPdf(
  result: AepsTransactionResult
): Promise<void> {
  const view = buildAepsMiniStatementViewModel(result);
  const [{ jsPDF }, autoTableModule] = await Promise.all([
    import("jspdf"),
    import("jspdf-autotable"),
  ]);

  const autoTable = autoTableModule.default;
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 14;
  let y = margin;

  const paytrueLogo = await loadImageAsDataUrl("/images/paytrue-logo.png");
  if (paytrueLogo) {
    doc.addImage(paytrueLogo, "PNG", margin, y, 14, 14);
  }

  doc.setTextColor(0, 31, 91);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text("Paytrue", margin + 18, y + 6);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139);
  doc.text("AEPS Mini Statement", margin + 18, y + 11);

  const generatedLabel = new Date(view.generatedAt).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
  doc.setFontSize(8);
  doc.setTextColor(17, 24, 39);
  doc.text(`Generated: ${generatedLabel}`, pageWidth - margin, y + 6, {
    align: "right",
  });
  if (view.referenceId) {
    doc.text(`Reference: ${view.referenceId}`, pageWidth - margin, y + 11, {
      align: "right",
    });
  }

  y += 22;

  const bankLogoPath = resolveBankLogoFromIfsc(view.bankName, view.ifscCode);
  const bankLogoDataUrl = bankLogoPath ? await loadImageAsDataUrl(bankLogoPath) : null;

  doc.setFillColor(0, 31, 91);
  doc.roundedRect(margin, y, pageWidth - margin * 2, 18, 2, 2, "F");
  if (bankLogoDataUrl) {
    doc.addImage(bankLogoDataUrl, "SVG", margin + 4, y + 3, 12, 12);
  }
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text(view.bankName, margin + (bankLogoDataUrl ? 20 : 6), y + 8);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.text("Account Mini Statement", margin + (bankLogoDataUrl ? 20 : 6), y + 14);

  if (view.bankAccountBalance != null) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.text(
      `Balance: ${formatCurrency(view.bankAccountBalance)}`,
      pageWidth - margin - 4,
      y + 11,
      { align: "right" }
    );
  }

  y += 22;

  if (view.customerName) {
    doc.setFillColor(230, 126, 34);
    doc.rect(margin, y, pageWidth - margin * 2, 8, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(8.5);
    doc.text(view.customerName, pageWidth / 2, y + 5.5, { align: "center" });
    y += 10;
  }

  autoTable(doc, {
    startY: y,
    theme: "plain",
    styles: { fontSize: 8.5, cellPadding: 2.5, textColor: [17, 24, 39] },
    headStyles: {
      fillColor: [248, 250, 252],
      textColor: [0, 31, 91],
      fontStyle: "bold",
    },
    head: [["Account Details", ""]],
    body: [
      ["Bank Name", view.bankName],
      ...(view.accountNumber
        ? [["Account Number", view.accountNumber] as [string, string]]
        : []),
      ...(view.bankAccountBalance != null
        ? [["Available Balance", formatCurrency(view.bankAccountBalance)] as [string, string]]
        : []),
      ...(view.mobileNumber
        ? [["Mobile Number", view.mobileNumber] as [string, string]]
        : []),
      ...(view.rrn ? [["RRN", view.rrn] as [string, string]] : []),
    ],
    margin: { left: margin, right: margin },
  });

  y =
    ((doc as { lastAutoTable?: { finalY: number } }).lastAutoTable?.finalY ?? y) + 6;

  const showBalanceColumn = view.rows.some((row) => row.balance != null);
  const tableBody = view.rows.length
    ? view.rows.map((row) => {
        const credit = isCreditType(row.type);
        const amountLabel = `${credit ? "+" : "−"}${formatCurrency(Math.abs(row.amount))}`;
        const base = [
          row.date || "—",
          row.narration || "—",
          formatTxnType(row.type),
          amountLabel,
        ];
        if (showBalanceColumn) {
          base.push(row.balance != null ? formatCurrency(row.balance) : "—");
        }
        return base;
      })
    : [["—", "No transactions found in mini statement.", "—", "—"]];

  autoTable(doc, {
    startY: y,
    theme: "striped",
    styles: { fontSize: 8, cellPadding: 2.2, textColor: [17, 24, 39] },
    headStyles: {
      fillColor: [0, 31, 91],
      textColor: [255, 255, 255],
      fontStyle: "bold",
    },
    alternateRowStyles: { fillColor: [248, 250, 252] },
    head: [
      showBalanceColumn
        ? ["Date", "Narration", "Type", "Amount", "Balance"]
        : ["Date", "Narration", "Type", "Amount"],
    ],
    body: tableBody,
    margin: { left: margin, right: margin },
    columnStyles: {
      0: { cellWidth: 24 },
      1: { cellWidth: showBalanceColumn ? 58 : 78 },
      2: { cellWidth: 18 },
      3: { halign: "right", cellWidth: 24 },
      ...(showBalanceColumn ? { 4: { halign: "right", cellWidth: 24 } } : {}),
    },
  });

  y =
    ((doc as { lastAutoTable?: { finalY: number } }).lastAutoTable?.finalY ?? y) + 8;

  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text(
    "This is a system-generated mini statement via Paytrue AEPS. For disputes, contact your bank.",
    pageWidth / 2,
    y,
    { align: "center", maxWidth: pageWidth - margin * 2 }
  );

  doc.save(getMiniStatementPdfFilename(view));
}

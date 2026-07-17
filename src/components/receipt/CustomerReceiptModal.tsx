"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useReactToPrint } from "react-to-print";
import { useSelector } from "react-redux";
import { CheckCircle2, Download, Loader2, Printer, XCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import TransactionReceipt from "@/src/components/statement/TransactionReceipt";
import { buildReceiptCustomerInfo } from "@/src/lib/receiptCustomerInfo";
import {
  downloadStatementReceiptPdf,
  getReceiptPdfFilename,
} from "@/src/lib/statementReceiptUtils";
import { enrichStatementWithIfsc } from "@/src/services/ifscService";
import { RECEIPT_PRINT_PAGE_STYLE } from "@/src/constants/receiptPrint";
import { selectUser } from "@/src/redux/slices/authSlice";
import type { StatementTransaction } from "@/types/statementReceipt";

interface CustomerReceiptModalProps {
  open: boolean;
  onClose: () => void;
  transaction: StatementTransaction | null;
  title?: string;
}

export default function CustomerReceiptModal({
  open,
  onClose,
  transaction,
  title = "Transaction Receipt",
}: CustomerReceiptModalProps) {
  const user = useSelector(selectUser);
  const printRef = useRef<HTMLDivElement>(null);
  const [enrichedTxn, setEnrichedTxn] = useState<StatementTransaction | null>(null);
  const [downloading, setDownloading] = useState(false);

  const customer = useMemo(() => buildReceiptCustomerInfo(user), [user]);
  const displayTxn = enrichedTxn ?? transaction;
  const isSuccess = displayTxn?.status === "success";

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: displayTxn
      ? getReceiptPdfFilename(displayTxn).replace(".pdf", "")
      : "PAYTRUE_RECEIPT",
    pageStyle: RECEIPT_PRINT_PAGE_STYLE,
  });

  useEffect(() => {
    if (!open || !transaction) {
      setEnrichedTxn(null);
      return;
    }

    setEnrichedTxn(transaction);
    void enrichStatementWithIfsc(transaction).then(setEnrichedTxn);
  }, [open, transaction]);

  const handleDownload = useCallback(async () => {
    if (!displayTxn) return;
    setDownloading(true);
    try {
      await downloadStatementReceiptPdf(displayTxn, customer);
    } finally {
      setDownloading(false);
    }
  }, [customer, displayTxn]);

  if (!open) return null;

  return (
    <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
      <DialogContent
        className="!flex h-[90vh] max-h-[90vh] w-[calc(100%-1.5rem)] max-w-4xl flex-col gap-0 overflow-hidden p-0 sm:max-w-4xl"
        style={{ display: "flex" }}
      >
        <DialogHeader className="receipt-no-print shrink-0 border-b border-slate-100 px-5 py-4 pr-12">
          <DialogTitle className="flex items-center gap-2 text-lg">
            {isSuccess ? (
              <CheckCircle2 className="h-5 w-5 text-emerald-600" />
            ) : (
              <XCircle className="h-5 w-5 text-red-600" />
            )}
            {title}
          </DialogTitle>
        </DialogHeader>

        <div
          className="receipt-modal-scroll min-h-0 flex-1 overflow-y-auto overscroll-contain bg-slate-50/60"
          style={{ WebkitOverflowScrolling: "touch" }}
        >
          {displayTxn ? (
            <TransactionReceipt
              ref={printRef}
              txn={displayTxn}
              customer={customer}
              className="shadow-none"
            />
          ) : (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-[#0057D9]" />
            </div>
          )}
        </div>

        <div className="receipt-no-print flex shrink-0 flex-wrap gap-2 border-t border-slate-100 bg-white px-5 py-4">
          {isSuccess ? (
            <>
              <Button
                type="button"
                variant="outline"
                className="flex-1 gap-1.5 sm:flex-none"
                onClick={() => handlePrint()}
              >
                <Printer className="h-4 w-4" />
                Print Receipt
              </Button>
              <Button
                type="button"
                variant="outline"
                className="flex-1 gap-1.5 sm:flex-none"
                disabled={downloading}
                onClick={() => void handleDownload()}
              >
                {downloading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Download className="h-4 w-4" />
                )}
                Download PDF
              </Button>
            </>
          ) : null}
          <Button type="button" className="flex-1 sm:ml-auto sm:flex-none" onClick={onClose}>
            Done
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

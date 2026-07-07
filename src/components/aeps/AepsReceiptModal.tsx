"use client";

import { useRef } from "react";
import { Printer } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import AepsReceipt from "@/src/components/aeps/AepsReceipt";
import type { AepsTransactionResult } from "@/src/types/aeps";

interface AepsReceiptModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  result: AepsTransactionResult | null;
  serviceLabel: string;
}

export default function AepsReceiptModal({
  open,
  onOpenChange,
  result,
  serviceLabel,
}: AepsReceiptModalProps) {
  const receiptRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    if (!receiptRef.current) return;
    const printWindow = window.open("", "_blank", "width=800,height=900");
    if (!printWindow) return;
    printWindow.document.write(`
      <!DOCTYPE html>
      <html><head><title>AEPS Receipt</title>
      <style>body{font-family:system-ui,sans-serif;margin:0;padding:16px;}</style>
      </head><body>${receiptRef.current.outerHTML}</body></html>
    `);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  };

  if (!result) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Transaction Receipt</DialogTitle>
        </DialogHeader>
        <AepsReceipt ref={receiptRef} result={result} serviceLabel={serviceLabel} />
        <div className="flex gap-2 pt-2">
          <Button type="button" variant="outline" className="flex-1" onClick={handlePrint}>
            <Printer className="mr-2 h-4 w-4" />
            Print
          </Button>
          <Button type="button" className="flex-1" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

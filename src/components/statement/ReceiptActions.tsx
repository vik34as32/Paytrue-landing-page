"use client";

import {
  ArrowLeft,
  Download,
  Loader2,
  Printer,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ReceiptActionsProps {
  onDownload: () => void;
  onPrint: () => void;
  onBack: () => void;
  downloading?: boolean;
  className?: string;
}

export default function ReceiptActions({
  onDownload,
  onPrint,
  onBack,
  downloading = false,
  className,
}: ReceiptActionsProps) {
  return (
    <div
      className={cn(
        "receipt-no-print flex flex-wrap items-center justify-between gap-3 border-b border-[#E5E7EB] bg-white px-6 py-4 sm:px-8 lg:px-10",
        className
      )}
    >
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="gap-1.5 border-[#E5E7EB]"
        onClick={onBack}
      >
        <ArrowLeft className="h-4 w-4" />
        Back
      </Button>

      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          size="sm"
          className="gap-1.5 bg-gradient-to-r from-[#0A84FF] to-[#0057D9] shadow-md hover:opacity-95"
          disabled={downloading}
          onClick={onDownload}
        >
          {downloading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Download className="h-4 w-4" />
          )}
          Download PDF
        </Button>
        <Button
          type="button"
          size="sm"
          className="gap-1.5 bg-gradient-to-r from-[#0A84FF] to-[#0057D9] shadow-md hover:opacity-95"
          onClick={onPrint}
        >
          <Printer className="h-4 w-4" />
          Print Receipt
        </Button>
      </div>
    </div>
  );
}

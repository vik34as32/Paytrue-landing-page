"use client";

import { useRef } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useReactToPrint } from "react-to-print";
import { Download, Printer, RefreshCw, RotateCcw, Share2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import DmtPageHeader from "@/src/components/dmt/DmtPageHeader";
import DmtStatusBadge from "@/src/components/dmt/DmtStatusBadge";
import DmtErrorState from "@/src/components/dmt/DmtErrorState";
import { useDmtTransaction, useRefundTransfer } from "@/src/hooks/useDmt";
import { formatCurrency } from "@/lib/utils";

function Info({ label, value }: { label: string; value?: string }) {
  return (
    <div className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-3">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">{label}</p>
      <p className="mt-1 break-all text-sm font-semibold text-[#001F5B]">{value || "—"}</p>
    </div>
  );
}

export default function DmtTransactionDetailPage() {
  const params = useParams<{ id: string }>();
  const transactionId = params?.id ?? "";
  const receiptRef = useRef<HTMLDivElement>(null);
  const { data, isLoading, isError, error, refetch, isFetching } = useDmtTransaction(
    transactionId
  );
  const refundMutation = useRefundTransfer();

  const handlePrint = useReactToPrint({
    contentRef: receiptRef,
    documentTitle: data ? `DMT_${data.transactionId}` : "DMT_Receipt",
  });

  const handleShare = async () => {
    if (!data) return;
    const text = `DMT Receipt\nTxn: ${data.transactionId}\nAmount: ${formatCurrency(data.amount)}\nStatus: ${data.status}`;
    try {
      if (navigator.share) {
        await navigator.share({ title: "DMT Receipt", text });
      } else {
        await navigator.clipboard.writeText(text);
        toast.success("Receipt details copied");
      }
    } catch {
      toast.error("Unable to share receipt");
    }
  };

  const handleRefund = async () => {
    if (!data) return;
    const reference = data.referenceNumber || data.transactionId || transactionId;
    try {
      await refundMutation.mutateAsync({ reference });
      toast.success("Refund request submitted");
      refetch();
    } catch {
      toast.error("Unable to process refund");
    }
  };

  if (isLoading) {
    return <div className="h-48 animate-pulse rounded-2xl bg-slate-100" />;
  }

  if (isError || !data) {
    return (
      <DmtErrorState
        message={(error as Error)?.message || "Transaction not found"}
        onRetry={() => refetch()}
      />
    );
  }

  return (
    <div className="space-y-6">
      <DmtPageHeader
        title="Transaction Details"
        description="Complete transfer receipt and status"
        backHref="/rt/retailer/dmt/transactions"
        actions={
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isFetching}>
              <RefreshCw className={`h-4 w-4 ${isFetching ? "animate-spin" : ""}`} />
              Refresh Status
            </Button>
            <Button variant="outline" size="sm" onClick={() => handlePrint()}>
              <Printer className="h-4 w-4" />
              Print
            </Button>
            <Button variant="outline" size="sm" onClick={handleShare}>
              <Share2 className="h-4 w-4" />
              Share
            </Button>
            <Button size="sm" className="bg-gradient-to-r from-[#0A84FF] to-[#0057D9]" onClick={() => handlePrint()}>
              <Download className="h-4 w-4" />
              Download PDF
            </Button>
            {data.status === "success" || data.status === "failed" ? (
              <Button
                variant="outline"
                size="sm"
                disabled={refundMutation.isPending}
                onClick={handleRefund}
              >
                <RotateCcw className="h-4 w-4" />
                Refund
              </Button>
            ) : null}
          </div>
        }
      />

      <div ref={receiptRef} className="space-y-4">
        <Card className="overflow-hidden border-0 bg-gradient-to-br from-[#001F5B] via-[#0057D9] to-[#1565d8] text-white">
          <CardContent className="flex flex-wrap items-center justify-between gap-4 p-6">
            <div>
              <p className="text-sm text-blue-100">Transfer Amount</p>
              <p className="text-3xl font-bold">{formatCurrency(data.amount)}</p>
            </div>
            <DmtStatusBadge status={data.status} className="bg-white/10 text-white" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Receipt Details</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <Info label="Transaction ID" value={data.transactionId} />
            <Info label="Reference Number" value={data.referenceNumber} />
            <Info label="RRN" value={data.rrn} />
            <Info label="UTR" value={data.utr} />
            <Info label="Beneficiary" value={data.beneficiaryName} />
            <Info label="Bank" value={data.bankName} />
            <Info label="Account Number" value={data.accountNumber} />
            <Info label="IFSC" value={data.ifscCode} />
            <Info label="Transfer Mode" value={data.transferMode} />
            <Info label="Charges" value={formatCurrency(data.charges)} />
            <Info label="GST" value={formatCurrency(data.gst)} />
            <Info label="Date" value={new Date(data.createdAt).toLocaleString("en-IN")} />
            <Info label="Remark" value={data.remark} />
          </CardContent>
        </Card>
      </div>

      <Button asChild variant="outline">
        <Link href="/rt/retailer/dmt/transactions">Back to History</Link>
      </Button>
    </div>
  );
}

"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import dmt1Api from "../services/dmt1.api";
import Dmt1TransactionDetails from "../components/Dmt1TransactionDetails";
import type { Dmt1Transaction } from "../types/dmt1.types";

export default function Dmt1TransactionDetailPage() {
  const params = useParams<{ id: string }>();
  const id = decodeURIComponent(String(params?.id || ""));
  const [transaction, setTransaction] = useState<Dmt1Transaction | null>(null);
  const [loading, setLoading] = useState(true);
  const [enquiryLoading, setEnquiryLoading] = useState(false);

  const loadTransaction = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const txn = await dmt1Api.getTransaction(id);
      setTransaction(txn);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to load transaction"
      );
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    void loadTransaction();
  }, [loadTransaction]);

  const handleEnquire = useCallback(async () => {
    if (!id) return;
    setEnquiryLoading(true);
    try {
      const txn = await dmt1Api.enquireTransaction(id);
      setTransaction(txn);
      toast.success(`Status updated: ${txn.status}`);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Enquiry failed"
      );
    } finally {
      setEnquiryLoading(false);
    }
  }, [id]);

  if (loading) {
    return (
      <div className="flex min-h-[200px] items-center justify-center rounded-2xl border border-slate-200 bg-white">
        <Loader2 className="h-6 w-6 animate-spin text-[#1565d8]" />
      </div>
    );
  }

  if (!transaction) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center">
        <p className="text-sm text-slate-500">Transaction not found</p>
        <Button asChild variant="outline" className="mt-4">
          <Link href="/rt/retailer/dmt1/transactions">Back to history</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="w-full space-y-4">
      <Button asChild variant="outline" size="sm" className="gap-2">
        <Link href="/rt/retailer/dmt1/transactions">
          <ArrowLeft className="h-4 w-4" />
          Back to History
        </Link>
      </Button>
      <Dmt1TransactionDetails
        transaction={transaction}
        loading={enquiryLoading}
        onEnquire={handleEnquire}
      />
    </div>
  );
}

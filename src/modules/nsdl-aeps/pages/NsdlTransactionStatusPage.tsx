"use client";

import { useState, type FormEvent } from "react";
import { Loader2, ReceiptText, RefreshCw, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatCurrency } from "@/lib/utils";
import AepsPageHeader from "@/src/components/aeps/AepsPageHeader";
import FormStatusAlert from "@/src/components/common/FormStatusAlert";
import NsdlReceiptModal from "../components/NsdlReceiptModal";
import NsdlStatusBadge from "../components/NsdlStatusBadge";
import { fetchNsdlTransaction, reconcileNsdlTransaction } from "../lib/nsdl-aeps-api";
import { nsdlServiceLabel } from "../lib/nsdl-aeps-normalizers";
import type { NsdlTransaction } from "../types";

const RECEIPT_SERVICES = new Set(["CASH_WITHDRAWAL", "CASH_DEPOSIT", "AADHAAR_PE"]);

function Row({ label, value }: { label: string; value?: string | number | null }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-slate-100 py-2.5 text-sm last:border-0">
      <span className="text-slate-500">{label}</span>
      <span className="text-right font-medium text-slate-800">
        {value === undefined || value === null || value === "" ? "—" : value}
      </span>
    </div>
  );
}

export default function NsdlTransactionStatusPage() {
  const [reference, setReference] = useState("");
  const [txn, setTxn] = useState<NsdlTransaction | null>(null);
  const [loading, setLoading] = useState(false);
  const [reconciling, setReconciling] = useState(false);
  const [error, setError] = useState("");
  const [receiptOpen, setReceiptOpen] = useState(false);

  const onSearch = async (event: FormEvent) => {
    event.preventDefault();
    const id = reference.trim();
    if (!id) {
      setError("Enter a transaction reference.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      setTxn(await fetchNsdlTransaction(id));
    } catch (err) {
      setTxn(null);
      setError(err instanceof Error ? err.message : "Transaction not found.");
    } finally {
      setLoading(false);
    }
  };

  const onReconcile = async () => {
    if (!txn) return;
    setError("");
    setReconciling(true);
    try {
      const updated = await reconcileNsdlTransaction(txn.transactionId || txn.id);
      setTxn({ ...txn, ...updated });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to refresh status.");
    } finally {
      setReconciling(false);
    }
  };

  const showAmount = txn && !["BALANCE_ENQUIRY", "MINI_STATEMENT"].includes(String(txn.serviceType));

  return (
    <div className="space-y-6">
      <AepsPageHeader
        title="Transaction Status"
        description="Track an NSDL AEPS transaction and refresh pending status with the bank"
      />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <Card>
          <CardHeader>
            <CardTitle>Find Transaction</CardTitle>
            <CardDescription>Enter the NSDL AEPS transaction reference (e.g. A2…)</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={(event) => void onSearch(event)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="nsdl-reference">Transaction Reference</Label>
                <Input
                  id="nsdl-reference"
                  value={reference}
                  onChange={(event) => setReference(event.target.value)}
                  placeholder="Transaction reference / ID"
                  disabled={loading}
                />
              </div>
              {error ? (
                <FormStatusAlert variant="error" title="Status check" message={error} onDismiss={() => setError("")} />
              ) : null}
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Search className="mr-2 h-4 w-4" />}
                Check Status
              </Button>
            </form>
          </CardContent>
        </Card>

        {txn ? (
          <Card>
            <CardHeader className="flex flex-row items-start justify-between gap-3 space-y-0">
              <div>
                <CardTitle>{nsdlServiceLabel(String(txn.serviceType))}</CardTitle>
                <CardDescription className="mt-1 break-all">{txn.transactionId}</CardDescription>
              </div>
              <NsdlStatusBadge status={txn.status} />
            </CardHeader>
            <CardContent>
              {showAmount ? <Row label="Amount" value={formatCurrency(txn.amount)} /> : null}
              <Row label="Charges" value={formatCurrency(txn.charges)} />
              <Row label="Aadhaar" value={txn.aadhaarMasked} />
              <Row label="Bank IIN" value={txn.bankIIN} />
              <Row label="Bank RRN" value={txn.bankReference} />
              <Row label="Provider Txn ID" value={txn.providerTransactionId} />
              {txn.bankAccountBalance != null ? (
                <Row label="Account Balance" value={formatCurrency(txn.bankAccountBalance)} />
              ) : null}
              <Row label="Message" value={txn.message} />
              <Row label="Date" value={new Date(txn.createdAt).toLocaleString("en-IN")} />

              <div className="mt-4 flex flex-wrap gap-2">
                {txn.status === "PENDING" ? (
                  <Button type="button" variant="outline" disabled={reconciling} onClick={() => void onReconcile()}>
                    {reconciling ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
                    Refresh Status
                  </Button>
                ) : null}
                {RECEIPT_SERVICES.has(String(txn.serviceType)) ? (
                  <Button type="button" variant="outline" onClick={() => setReceiptOpen(true)}>
                    <ReceiptText className="h-4 w-4" />
                    View Receipt
                  </Button>
                ) : null}
              </div>
            </CardContent>
          </Card>
        ) : null}
      </div>

      <NsdlReceiptModal open={receiptOpen} onOpenChange={setReceiptOpen} transaction={txn} />
    </div>
  );
}

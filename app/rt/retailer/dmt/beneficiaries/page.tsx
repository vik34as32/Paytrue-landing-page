"use client";

import { Suspense, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Plus, Search, Send, ShieldCheck, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import DmtPageHeader from "@/src/components/dmt/DmtPageHeader";
import DmtStatusBadge from "@/src/components/dmt/DmtStatusBadge";
import DmtErrorState from "@/src/components/dmt/DmtErrorState";
import OtpInput from "@/src/components/dmt/OtpInput";
import {
  useBeneficiaries,
  useDeleteBeneficiary,
  useVerifyBeneficiaryDelete,
} from "@/src/hooks/useDmt";
import { maskAccountNumber } from "@/src/lib/dmtUtils";
import { resolveSenderMobile } from "@/src/lib/dmtSession";

function BeneficiaryListContent() {
  const params = useSearchParams();
  const mobileFromUrl = params?.get("mobile") ?? "";
  const senderMobile = resolveSenderMobile(mobileFromUrl);
  const [search, setSearch] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteReferenceKey, setDeleteReferenceKey] = useState("");
  const [deleteOtp, setDeleteOtp] = useState("");
  const [otpStep, setOtpStep] = useState(false);
  const { data = [], isLoading, isError, error, refetch } = useBeneficiaries(senderMobile);
  const deleteMutation = useDeleteBeneficiary();
  const verifyDeleteMutation = useVerifyBeneficiaryDelete();

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return data;
    return data.filter(
      (item) =>
        item.name.toLowerCase().includes(q) ||
        item.mobile.includes(q) ||
        item.accountNumber.includes(q) ||
        item.ifscCode.toLowerCase().includes(q)
    );
  }, [data, search]);

  const initiateDelete = async () => {
    if (!deleteId) return;
    try {
      const result = await deleteMutation.mutateAsync({
        beneficiaryId: deleteId,
        senderMobile,
      });
      setDeleteReferenceKey(result.referenceKey || "");
      setOtpStep(true);
      toast.success(result.message || "OTP sent to verify beneficiary deletion.");
    } catch (err) {
      toast.error((err as Error).message);
    }
  };

  const confirmDelete = async () => {
    if (!deleteId || deleteOtp.length < 4) {
      toast.error("Enter valid OTP");
      return;
    }
    try {
      await verifyDeleteMutation.mutateAsync({
        beneficiaryId: deleteId,
        payload: {
          otp: deleteOtp,
          referenceKey: deleteReferenceKey || undefined,
        },
      });
      toast.success("Beneficiary deleted");
      setDeleteId(null);
      setOtpStep(false);
      setDeleteOtp("");
      setDeleteReferenceKey("");
      refetch();
    } catch (err) {
      toast.error((err as Error).message);
    }
  };

  const closeDeleteDialog = () => {
    setDeleteId(null);
    setOtpStep(false);
    setDeleteOtp("");
    setDeleteReferenceKey("");
  };

  return (
    <div className="space-y-6">
      <DmtPageHeader
        title="Beneficiary List"
        description={
          senderMobile
            ? `Beneficiaries for sender ${senderMobile}`
            : "Search sender first to load beneficiaries"
        }
        actions={
          <Button asChild className="bg-gradient-to-r from-[#0A84FF] to-[#0057D9]">
            <Link
              href={`/rt/retailer/dmt/beneficiaries/add${senderMobile ? `?mobile=${encodeURIComponent(senderMobile)}` : ""}`}
            >
              <Plus className="h-4 w-4" />
              Add Beneficiary
            </Link>
          </Button>
        }
      />

      <Card>
        <CardHeader>
          <CardTitle>Beneficiaries</CardTitle>
          <CardDescription>{filtered.length} beneficiary records</CardDescription>
          <div className="relative max-w-sm pt-2">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              className="pl-9"
              placeholder="Search name, mobile, account, IFSC"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {isLoading && (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-20 animate-pulse rounded-xl bg-slate-100" />
              ))}
            </div>
          )}

          {isError && (
            <DmtErrorState
              message={(error as Error)?.message}
              onRetry={() => refetch()}
            />
          )}

          {!senderMobile && !isLoading && (
            <p className="py-6 text-center text-sm text-amber-700">
              No sender selected.{" "}
              <Link href="/rt/retailer/dmt/sender" className="font-semibold underline">
                Search remitter
              </Link>{" "}
              to continue.
            </p>
          )}

          {!isLoading && !isError && senderMobile && filtered.length === 0 && (
            <p className="py-10 text-center text-sm text-slate-500">
              No beneficiaries found
            </p>
          )}

          {filtered.map((ben) => (
            <div
              key={ben.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-100 bg-slate-50 p-4"
            >
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-[#001F5B]">{ben.name}</p>
                  <DmtStatusBadge status={ben.status} />
                </div>
                <p className="text-xs text-slate-500">
                  {ben.bankName} • {maskAccountNumber(ben.accountNumber)} • {ben.ifscCode}
                </p>
                <p className="text-xs text-slate-400">{ben.mobile}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                {!ben.isVerified && (
                  <Button asChild size="sm" variant="outline">
                    <Link href={`/rt/retailer/dmt/beneficiaries/${ben.id}/verify`}>
                      <ShieldCheck className="h-3.5 w-3.5" />
                      Verify
                    </Link>
                  </Button>
                )}
                <Button asChild size="sm">
                  <Link
                    href={`/rt/retailer/dmt/transfer?beneficiaryId=${encodeURIComponent(ben.id)}${senderMobile ? `&mobile=${encodeURIComponent(senderMobile)}` : ""}`}
                  >
                    <Send className="h-3.5 w-3.5" />
                    Transfer
                  </Link>
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="text-red-500"
                  onClick={() => setDeleteId(ben.id)}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Dialog open={Boolean(deleteId)} onOpenChange={closeDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {otpStep ? "Verify Delete OTP" : "Delete Beneficiary"}
            </DialogTitle>
            <DialogDescription>
              {otpStep
                ? "Enter OTP sent to verify beneficiary deletion."
                : "This will send an OTP to confirm deletion."}
            </DialogDescription>
          </DialogHeader>

          {otpStep ? (
            <div className="space-y-4 py-2">
              <OtpInput
                value={deleteOtp}
                onChange={setDeleteOtp}
                disabled={verifyDeleteMutation.isPending}
              />
              <DialogFooter>
                <Button variant="outline" onClick={closeDeleteDialog}>
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  disabled={verifyDeleteMutation.isPending}
                  onClick={confirmDelete}
                >
                  Confirm Delete
                </Button>
              </DialogFooter>
            </div>
          ) : (
            <DialogFooter>
              <Button variant="outline" onClick={closeDeleteDialog}>
                Cancel
              </Button>
              <Button
                variant="destructive"
                disabled={deleteMutation.isPending}
                onClick={initiateDelete}
              >
                Send Delete OTP
              </Button>
            </DialogFooter>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function BeneficiaryListPage() {
  return (
    <Suspense fallback={<div className="py-10 text-center text-sm text-slate-500">Loading...</div>}>
      <BeneficiaryListContent />
    </Suspense>
  );
}

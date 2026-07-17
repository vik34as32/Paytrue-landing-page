"use client";

import { Suspense, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Search } from "lucide-react";
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
import DmtErrorState from "@/src/components/dmt/DmtErrorState";
import OtpInput from "@/src/components/dmt/OtpInput";
import BeneficiaryList from "@/src/modules/dmt/components/BeneficiaryList";
import {
  useBeneficiaries,
  useDeleteBeneficiary,
  useVerifyBeneficiaryDelete,
} from "@/src/hooks/useDmt";
import { resolveSenderMobile } from "@/src/lib/dmtSession";
import type { DmtBeneficiary } from "@/src/modules/dmt/types";

function BeneficiaryListContent() {
  const router = useRouter();
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
        (item.mobile ?? "").includes(q) ||
        item.accountNumber.includes(q) ||
        item.ifscCode.toLowerCase().includes(q)
    );
  }, [data, search]);

  const addHref = `/rt/retailer/dmt/beneficiaries/add${
    senderMobile ? `?mobile=${encodeURIComponent(senderMobile)}` : ""
  }`;

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

  const handleVerify = (ben: DmtBeneficiary) => {
    router.push(`/rt/retailer/dmt/beneficiaries/${ben.id}/verify`);
  };

  const handleTransfer = (ben: DmtBeneficiary) => {
    const qs = new URLSearchParams({
      beneficiaryId: ben.id,
      ...(senderMobile ? { mobile: senderMobile } : {}),
    });
    router.push(`/rt/retailer/dmt/transfer?${qs.toString()}`);
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
            <Link href={addHref}>Add Beneficiary</Link>
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

          {senderMobile || isLoading ? (
            <BeneficiaryList
              beneficiaries={filtered}
              loading={isLoading}
              error={null}
              showHeader={false}
              onAdd={() => router.push(addHref)}
              onVerify={handleVerify}
              onTransfer={handleTransfer}
              onDelete={(item) => setDeleteId(item.id)}
            />
          ) : null}
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

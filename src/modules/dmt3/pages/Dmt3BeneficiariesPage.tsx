"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
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
import Dmt3FlowHeader from "../components/Dmt3FlowHeader";
import BeneficiaryList from "@/src/modules/dmt/components/BeneficiaryList";
import { RequireVerifiedRemitter } from "../components/Dmt3Guards";
import { useDmt3Store } from "../lib/dmt3-store";
import {
  deleteBeneficiaryApi,
  fetchBeneficiaries,
} from "../lib/dmt3-service";
import type { Dmt3Beneficiary } from "../types/dmt3.types";
import type { DmtBeneficiary } from "@/src/modules/dmt/types";

export default function Dmt3BeneficiariesPage() {
  const router = useRouter();
  const remitter = useDmt3Store((s) => s.remitter);
  const setBeneficiaries = useDmt3Store((s) => s.setBeneficiaries);
  const selectBeneficiary = useDmt3Store((s) => s.selectBeneficiary);
  const setStep = useDmt3Store((s) => s.setStep);
  const [rows, setRows] = useState<Dmt3Beneficiary[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState("");

  const toDmtRow = (item: Dmt3Beneficiary): DmtBeneficiary => ({
    id: item.id,
    name: item.name,
    mobile: item.mobile,
    bankName: item.bankName,
    accountNumber: item.accountNumber || item.accountMasked || "",
    ifscCode: item.ifsc,
    isVerified: item.isVerified || item.verificationStatus === "VERIFIED",
    status: item.verificationStatus,
  });

  const load = useCallback(async () => {
    if (!remitter.mobile) return;
    setLoading(true);
    setError("");
    try {
      const list = await fetchBeneficiaries({
        remitterMobile: remitter.mobile,
        remitterId: remitter.remitterId,
      });
      setRows(list);
      setBeneficiaries(list);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Unable to load beneficiaries";
      setError(message);
      setRows([]);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }, [remitter.mobile, remitter.remitterId, setBeneficiaries]);

  useEffect(() => {
    void load();
  }, [load]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter(
      (item) =>
        item.name.toLowerCase().includes(q) ||
        item.mobile.includes(q) ||
        item.accountNumber.includes(q) ||
        item.ifsc.toLowerCase().includes(q) ||
        item.bankName.toLowerCase().includes(q)
    );
  }, [rows, search]);

  const onPay = (item: DmtBeneficiary) => {
    if (!item.id) {
      toast.error("Beneficiary id missing from API");
      return;
    }
    selectBeneficiary(item.id);
    setStep("transfer");
    router.push("/rt/retailer/dmt3/transfer");
  };

  const onDelete = async (item: DmtBeneficiary) => {
    if (!item.id) return;
    if (!window.confirm("Delete this beneficiary?")) return;
    setActionLoading(true);
    try {
      await deleteBeneficiaryApi(item.id);
      toast.success("Beneficiary deleted");
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Delete failed");
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <RequireVerifiedRemitter>
      <div className="space-y-5">
        <Dmt3FlowHeader activeStep={3} />
        <Card>
          <CardHeader>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <CardTitle>Beneficiary List</CardTitle>
                <CardDescription>
                  {remitter.fullName || "Remitter"} • {remitter.mobile}
                  {!loading && !error ? ` • ${filtered.length} beneficiary records` : ""}
                </CardDescription>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button type="button" variant="outline" onClick={() => void load()} disabled={loading}>
                  Refresh
                </Button>
                <Button
                  className="bg-gradient-to-r from-[#0A84FF] to-[#0057D9]"
                  onClick={() => router.push("/rt/retailer/dmt3/beneficiaries/add")}
                >
                  Add Beneficiary
                </Button>
              </div>
            </div>
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
          <CardContent>
            {error ? (
              <div className="rounded-xl border border-rose-200 bg-rose-50 p-6 text-center">
                <p className="text-sm font-semibold text-rose-700">{error}</p>
                <Button className="mt-3" variant="outline" onClick={() => void load()}>
                  Retry
                </Button>
              </div>
            ) : (
              <BeneficiaryList
                beneficiaries={filtered.map(toDmtRow)}
                loading={loading || actionLoading}
                error={null}
                showHeader={false}
                onAdd={() => router.push("/rt/retailer/dmt3/beneficiaries/add")}
                onTransfer={onPay}
                onDelete={(item) => void onDelete(item)}
              />
            )}
          </CardContent>
        </Card>
      </div>
    </RequireVerifiedRemitter>
  );
}

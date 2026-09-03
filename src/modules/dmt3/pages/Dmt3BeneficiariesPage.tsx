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
import Dmt3BeneficiaryList from "../components/Dmt3BeneficiaryList";
import { RequireDmt3Session } from "../components/Dmt3Guards";
import { useDmt3RetailerContext } from "../hooks/useDmt3RetailerContext";
import { useDmt3Store } from "../lib/dmt3-store";
import {
  deleteBeneficiaryApi,
  fetchBeneficiaries,
  verifyBeneficiaryApi,
} from "../lib/dmt3-service";
import type { Dmt3Beneficiary } from "../types/dmt3.types";

export default function Dmt3BeneficiariesPage() {
  const router = useRouter();
  const retailer = useDmt3RetailerContext();
  const setBeneficiaries = useDmt3Store((s) => s.setBeneficiaries);
  const selectBeneficiary = useDmt3Store((s) => s.selectBeneficiary);
  const setStep = useDmt3Store((s) => s.setStep);
  const [rows, setRows] = useState<Dmt3Beneficiary[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const list = await fetchBeneficiaries();
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
  }, [setBeneficiaries]);

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

  const onPay = (item: Dmt3Beneficiary) => {
    if (!item.id) {
      toast.error("Beneficiary id missing from API");
      return;
    }
    selectBeneficiary(item.id);
    setStep("transfer");
    router.push("/rt/retailer/dmt3/transfer");
  };

  const onVerify = async (id: string) => {
    setActionLoading(true);
    try {
      await verifyBeneficiaryApi(id);
      toast.success("Beneficiary verified");
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Verification failed");
    } finally {
      setActionLoading(false);
    }
  };

  const onDelete = async (id: string) => {
    if (!window.confirm("Delete this beneficiary?")) return;
    setActionLoading(true);
    try {
      await deleteBeneficiaryApi(id);
      toast.success("Beneficiary deleted");
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Delete failed");
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <RequireDmt3Session>
      <div className="space-y-5">
        <Dmt3FlowHeader activeStep={1} />
        <Card>
          <CardHeader>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <CardTitle>Beneficiary List</CardTitle>
                <CardDescription>
                  {retailer.senderName} • {retailer.senderMobile}
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
              <Dmt3BeneficiaryList
                beneficiaries={filtered}
                loading={loading}
                actionLoading={actionLoading}
                onAdd={() => router.push("/rt/retailer/dmt3/beneficiaries/add")}
                onPay={onPay}
                onVerify={(id) => void onVerify(id)}
                onDelete={(id) => void onDelete(id)}
              />
            )}
          </CardContent>
        </Card>
      </div>
    </RequireDmt3Session>
  );
}

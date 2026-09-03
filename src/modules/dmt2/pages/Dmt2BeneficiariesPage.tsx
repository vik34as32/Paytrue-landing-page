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
import Dmt2FlowHeader from "../components/Dmt2FlowHeader";
import Dmt2BeneficiaryList from "../components/Dmt2BeneficiaryList";
import { RequireVerifiedRetailer } from "../components/Dmt2Guards";
import { useDmt2Store } from "../lib/dmt2-store";
import { fetchBeneficiaries } from "../lib/dmt2-service";
import type { Dmt2Beneficiary } from "../types";

export default function Dmt2BeneficiariesPage() {
  const router = useRouter();
  const retailer = useDmt2Store((s) => s.retailer);
  const setBeneficiaries = useDmt2Store((s) => s.setBeneficiaries);
  const selectBeneficiary = useDmt2Store((s) => s.selectBeneficiary);
  const setStep = useDmt2Store((s) => s.setStep);
  const [rows, setRows] = useState<Dmt2Beneficiary[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    if (!retailer.mobile) return;
    setLoading(true);
    setError("");
    try {
      const list = await fetchBeneficiaries({
        remitterMobile: retailer.mobile,
        remitterId: retailer.remitterId,
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
  }, [retailer.mobile, retailer.remitterId, setBeneficiaries]);

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
        item.ifsc.toLowerCase().includes(q)
    );
  }, [rows, search]);

  const onPay = (item: Dmt2Beneficiary) => {
    if (!item.id) {
      toast.error("Beneficiary id missing from API");
      return;
    }
    selectBeneficiary(item.id);
    setStep("transfer");
    router.push("/rt/retailer/dmt2/transfer");
  };

  return (
    <RequireVerifiedRetailer>
      <div className="space-y-5">
        <Dmt2FlowHeader activeStep={3} />
        <Card>
          <CardHeader>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <CardTitle>Beneficiary List</CardTitle>
                <CardDescription>
                  {retailer.fullName || "Remitter"} • {retailer.mobile}
                  {!loading && !error ? ` • ${filtered.length} beneficiary records` : ""}
                </CardDescription>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button type="button" variant="outline" onClick={() => void load()} disabled={loading}>
                  Refresh
                </Button>
                <Button
                  className="bg-gradient-to-r from-[#0A84FF] to-[#0057D9]"
                  onClick={() => router.push("/rt/retailer/dmt2/beneficiaries/add")}
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
              <Dmt2BeneficiaryList
                beneficiaries={filtered}
                loading={loading}
                onAdd={() => router.push("/rt/retailer/dmt2/beneficiaries/add")}
                onPay={onPay}
              />
            )}
          </CardContent>
        </Card>
      </div>
    </RequireVerifiedRetailer>
  );
}

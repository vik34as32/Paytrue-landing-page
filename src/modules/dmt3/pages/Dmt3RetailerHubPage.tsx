"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import Dmt3FlowHeader from "../components/Dmt3FlowHeader";
import { useDmt3Store } from "../lib/dmt3-store";

export default function Dmt3RetailerHubPage() {
  const router = useRouter();
  const remitter = useDmt3Store((s) => s.remitter);

  if (!remitter.otpVerified) {
    return (
      <div className="space-y-5">
        <Dmt3FlowHeader activeStep={remitter.registered ? 2 : remitter.mobile ? 1 : 0} />
        <div className="rounded-2xl border border-slate-200 bg-white p-6 text-center">
          <p className="text-sm text-slate-500">Search and register a retailer to continue.</p>
          <Button
            className="mt-4 bg-gradient-to-r from-indigo-500 to-violet-700"
            onClick={() => router.push("/rt/retailer/dmt3")}
          >
            Search Retailer
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <Dmt3FlowHeader activeStep={3} />
      <div className="mx-auto max-w-lg rounded-2xl border border-slate-200 bg-white p-6">
        <h2 className="text-lg font-extrabold text-[#0b1f3a]">Retailer Profile</h2>
        <dl className="mt-4 space-y-3 text-sm">
          <div>
            <dt className="text-slate-400">Mobile</dt>
            <dd className="font-semibold text-[#0b1f3a]">{remitter.mobile}</dd>
          </div>
          <div>
            <dt className="text-slate-400">Full Name</dt>
            <dd className="font-semibold text-[#0b1f3a]">{remitter.fullName || "—"}</dd>
          </div>
        </dl>
        <Button asChild className="mt-6 w-full bg-gradient-to-r from-indigo-500 to-violet-700">
          <Link href="/rt/retailer/dmt3/beneficiaries">Continue to Beneficiaries</Link>
        </Button>
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import SearchIcon from "@mui/icons-material/Search";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Dmt1FlowHeader from "../components/Dmt1FlowHeader";
import { useDmt1Store } from "../lib/dmt1-store";
import { registerRemitterOtp, searchRemitter, fetchBeneficiaries } from "../lib/dmt1-service";
import { INDIAN_MOBILE_RE } from "../lib/dmt1-constants";

const schema = z.object({
  mobile: z.string().regex(INDIAN_MOBILE_RE, "Enter valid 10-digit Indian mobile number"),
});

type FormValues = z.infer<typeof schema>;

export default function Dmt1SearchPage() {
  const router = useRouter();
  const defaultMobile = useDmt1Store((s) => s.remitter.mobile);
  const setSearchMobile = useDmt1Store((s) => s.setSearchMobile);
  const setStep = useDmt1Store((s) => s.setStep);
  const markRemitterRegistered = useDmt1Store((s) => s.markRemitterRegistered);
  const setBeneficiaries = useDmt1Store((s) => s.setBeneficiaries);
  const [loading, setLoading] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { mobile: defaultMobile || "" },
  });

  const onSearch = async (values: FormValues) => {
    setLoading(true);
    try {
      const result = await searchRemitter(values.mobile);
      setSearchMobile(values.mobile);
      if (result.found && result.remitter) {
        markRemitterRegistered(result.remitter);
        // Prefer nested list; if empty, fetch dedicated beneficiaries for this remitter
        let beneficiaries = result.beneficiaries;
        if (!beneficiaries.length && result.remitter.otpVerified) {
          try {
            beneficiaries = await fetchBeneficiaries({
              remitterMobile: values.mobile,
              remitterId: result.remitter.remitterId,
            });
          } catch {
            beneficiaries = [];
          }
        }
        setBeneficiaries(beneficiaries);
        if (!result.remitter.otpVerified) {
          setStep("otp");
          const otp = await registerRemitterOtp({
            mobile: values.mobile,
            name: result.remitter.fullName,
            email: result.remitter.email,
          });
          toast.info(otp.message || "OTP verification pending for this remitter.");
          router.push("/rt/retailer/dmt1/retailer/verify");
          return;
        }
        setStep("beneficiary");
        toast.success(
          beneficiaries.length
            ? `Remitter found · ${beneficiaries.length} beneficiary(ies)`
            : "Remitter found · add a beneficiary to continue"
        );
        router.push("/rt/retailer/dmt1/beneficiaries");
        return;
      }
      setStep("register");
      toast.info("Remitter not registered. Please complete registration.");
      router.push("/rt/retailer/dmt1/retailer/register");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Search failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-5">
      <Dmt1FlowHeader activeStep={0} />
      <div className="mx-auto max-w-2xl rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
        <h2 className="text-lg font-extrabold text-[#0b1f3a]">Search Remitter</h2>
        <p className="mt-1 text-sm text-slate-500">
          Enter remitter&apos;s 10-digit mobile. If registered, their beneficiaries
          load; otherwise register and add a new beneficiary.
        </p>
        <form onSubmit={form.handleSubmit(onSearch)} className="mt-5 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="mobile">Remitter Mobile Number</Label>
            <Input
              id="mobile"
              inputMode="numeric"
              maxLength={10}
              placeholder="10 digit mobile number"
              {...form.register("mobile")}
            />
            {form.formState.errors.mobile ? (
              <p className="text-sm text-rose-600">{form.formState.errors.mobile.message}</p>
            ) : null}
          </div>
          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-indigo-500 to-violet-700 sm:w-auto"
          >
            <SearchIcon sx={{ fontSize: 18 }} />
            {loading ? "Searching…" : "Search"}
          </Button>
        </form>
      </div>
    </div>
  );
}

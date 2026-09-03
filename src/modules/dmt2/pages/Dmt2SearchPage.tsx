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
import Dmt2FlowHeader from "../components/Dmt2FlowHeader";
import { useDmt2Store } from "../lib/dmt2-store";
import { searchRetailer, sendRetailerOtp } from "../lib/dmt2-service";
import { INDIAN_MOBILE_RE } from "../lib/dmt2-mock";

const schema = z.object({
  mobile: z.string().regex(INDIAN_MOBILE_RE, "Enter valid 10-digit Indian mobile number"),
});

type FormValues = z.infer<typeof schema>;

export default function Dmt2SearchPage() {
  const router = useRouter();
  const defaultMobile = useDmt2Store((s) => s.retailer.mobile);
  const setSearchMobile = useDmt2Store((s) => s.setSearchMobile);
  const setStep = useDmt2Store((s) => s.setStep);
  const markRetailerRegistered = useDmt2Store((s) => s.markRetailerRegistered);
  const [loading, setLoading] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { mobile: defaultMobile || "" },
  });

  const onSearch = async (values: FormValues) => {
    setLoading(true);
    try {
      const result = await searchRetailer(values.mobile);
      setSearchMobile(values.mobile);
      if (result.found && result.retailer) {
        markRetailerRegistered({
          ...result.retailer,
          gender: useDmt2Store.getState().retailer.gender || result.retailer.gender,
        });
        if (!result.retailer.otpVerified) {
          setStep("otp");
          const otp = await sendRetailerOtp({
            mobile: values.mobile,
            name: result.retailer.fullName,
          });
          toast.info(otp.message || "OTP verification pending for this remitter.");
          router.push("/rt/retailer/dmt2/retailer/verify");
          return;
        }
        setStep("beneficiary");
        toast.success("Remitter found");
        router.push("/rt/retailer/dmt2/beneficiaries");
        return;
      }
      setStep("register");
      toast.info("Remitter not registered. Please complete registration.");
      router.push("/rt/retailer/dmt2/retailer/register");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Search failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-5">
      <Dmt2FlowHeader activeStep={0} />
      <div className="mx-auto max-w-2xl rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
        <h2 className="text-lg font-extrabold text-[#0b1f3a]">Search Retailer</h2>
        <p className="mt-1 text-sm text-slate-500">
          Enter the retailer&apos;s 10-digit mobile number to continue.
        </p>
        <form onSubmit={form.handleSubmit(onSearch)} className="mt-5 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="mobile">Retailer Mobile Number</Label>
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

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Dmt2FlowHeader from "../components/Dmt2FlowHeader";
import { useDmt2Store } from "../lib/dmt2-store";
import { buildRetailer, sendRetailerOtp } from "../lib/dmt2-service";
import { normalizeRemitter } from "../lib/dmt2-normalizers";
import { INDIAN_MOBILE_RE } from "../lib/dmt2-mock";
import type { Dmt2Gender } from "../types";

const schema = z.object({
  mobile: z.string().regex(INDIAN_MOBILE_RE, "Enter valid 10-digit Indian mobile number"),
  fullName: z.string().trim().min(2, "Full name is required"),
  gender: z.enum(["male", "female", "other"], { message: "Gender is required" }),
});

type FormValues = z.infer<typeof schema>;

export default function Dmt2RegisterPage() {
  const router = useRouter();
  const retailer = useDmt2Store((s) => s.retailer);
  const markRetailerRegistered = useDmt2Store((s) => s.markRetailerRegistered);
  const setStep = useDmt2Store((s) => s.setStep);
  const [loading, setLoading] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      mobile: retailer.mobile || "",
      fullName: retailer.fullName || "",
      gender: (retailer.gender || undefined) as FormValues["gender"] | undefined,
    },
  });

  useEffect(() => {
    if (!retailer.mobile) {
      router.replace("/rt/retailer/dmt2");
    }
  }, [retailer.mobile, router]);

  const onSubmit = async (values: FormValues) => {
    setLoading(true);
    try {
      const next = buildRetailer({
        mobile: values.mobile,
        fullName: values.fullName,
        gender: values.gender as Dmt2Gender,
      });
      const otp = await sendRetailerOtp({
        mobile: values.mobile,
        name: values.fullName,
      });
      if (!otp.success) {
        toast.error(otp.message);
        return;
      }
      markRetailerRegistered({
        ...next,
        ...normalizeRemitter(otp.payload, values.mobile),
        fullName: values.fullName,
        gender: values.gender as Dmt2Gender,
        otpVerified: false,
        registered: true,
      });
      setStep("otp");
      toast.success(otp.message);
      router.push("/rt/retailer/dmt2/retailer/verify");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-5">
      <Dmt2FlowHeader activeStep={1} />
      <div className="mx-auto max-w-2xl rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
        <h2 className="text-lg font-extrabold text-[#0b1f3a]">Retailer Registration</h2>
        <p className="mt-1 text-sm text-slate-500">
          Complete retailer details to receive a verification OTP.
        </p>
        <form onSubmit={form.handleSubmit(onSubmit)} className="mt-5 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="mobile">Mobile Number</Label>
            <Input id="mobile" maxLength={10} inputMode="numeric" {...form.register("mobile")} />
            {form.formState.errors.mobile ? (
              <p className="text-sm text-rose-600">{form.formState.errors.mobile.message}</p>
            ) : null}
          </div>
          <div className="space-y-2">
            <Label htmlFor="fullName">Full Name</Label>
            <Input id="fullName" placeholder="Vikas Kumar" {...form.register("fullName")} />
            {form.formState.errors.fullName ? (
              <p className="text-sm text-rose-600">{form.formState.errors.fullName.message}</p>
            ) : null}
          </div>
          <div className="space-y-2">
            <Label>Gender</Label>
            <div className="flex flex-wrap gap-4 text-sm">
              {(
                [
                  { value: "male", label: "Male" },
                  { value: "female", label: "Female" },
                  { value: "other", label: "Other" },
                ] as const
              ).map((option) => (
                <label key={option.value} className="flex items-center gap-2 text-slate-700">
                  <input
                    type="radio"
                    value={option.value}
                    {...form.register("gender")}
                    className="h-4 w-4 accent-indigo-600"
                  />
                  {option.label}
                </label>
              ))}
            </div>
            {form.formState.errors.gender ? (
              <p className="text-sm text-rose-600">{form.formState.errors.gender.message}</p>
            ) : null}
          </div>
          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-indigo-500 to-violet-700 sm:w-auto"
          >
            {loading ? "Please wait…" : "Continue"}
          </Button>
        </form>
      </div>
    </div>
  );
}

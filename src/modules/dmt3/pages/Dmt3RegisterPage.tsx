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
import Dmt3FlowHeader from "../components/Dmt3FlowHeader";
import { useDmt3Store } from "../lib/dmt3-store";
import { registerRemitterOtp } from "../lib/dmt3-service";
import { normalizeRemitter } from "../services/dmt3.mapper";
import { INDIAN_MOBILE_RE } from "../lib/dmt3-constants";

const schema = z.object({
  mobile: z.string().regex(INDIAN_MOBILE_RE, "Enter valid 10-digit Indian mobile number"),
  fullName: z.string().trim().min(2, "Full name is required"),
  email: z.string().trim().email("Enter a valid email").optional().or(z.literal("")),
});

type FormValues = z.infer<typeof schema>;

export default function Dmt3RegisterPage() {
  const router = useRouter();
  const remitter = useDmt3Store((s) => s.remitter);
  const markRemitterRegistered = useDmt3Store((s) => s.markRemitterRegistered);
  const setStep = useDmt3Store((s) => s.setStep);
  const [loading, setLoading] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      mobile: remitter.mobile || "",
      fullName: remitter.fullName || "",
      email: remitter.email || "",
    },
  });

  useEffect(() => {
    if (!remitter.mobile) {
      router.replace("/rt/retailer/dmt3");
    }
  }, [remitter.mobile, router]);

  const onSubmit = async (values: FormValues) => {
    setLoading(true);
    try {
      const otp = await registerRemitterOtp({
        mobile: values.mobile,
        name: values.fullName,
        email: values.email || undefined,
      });
      if (!otp.success) {
        toast.error(otp.message);
        return;
      }
      markRemitterRegistered({
        ...normalizeRemitter(otp.payload, values.mobile),
        fullName: values.fullName,
        email: values.email || undefined,
        otpVerified: false,
        registered: true,
      });
      setStep("otp");
      toast.success(otp.message);
      router.push("/rt/retailer/dmt3/retailer/verify");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-5">
      <Dmt3FlowHeader activeStep={1} />
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
            <Label htmlFor="email">Email (optional)</Label>
            <Input id="email" type="email" placeholder="name@email.com" {...form.register("email")} />
            {form.formState.errors.email ? (
              <p className="text-sm text-rose-600">{form.formState.errors.email.message}</p>
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

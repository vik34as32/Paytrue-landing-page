"use client";

import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import DmtPageHeader from "@/src/components/dmt/DmtPageHeader";
import DmtErrorState from "@/src/components/dmt/DmtErrorState";
import { useRegisterSender, useSendSenderOtp } from "@/src/hooks/useDmt";
import { setActiveSenderMobile } from "@/src/lib/dmtSession";
import type { DmtApiError } from "@/src/types/dmt";
import { useState } from "react";

const schema = z.object({
  mobile: z.string().regex(/^[6-9]\d{9}$/, "Enter valid mobile number"),
  name: z.string().min(2, "Enter sender name"),
  aadhaar: z.string().regex(/^\d{12}$/, "Enter valid 12-digit Aadhaar number"),
});

type FormValues = z.infer<typeof schema>;

function RegisterSenderForm() {
  const router = useRouter();
  const params = useSearchParams();
  const registerMutation = useRegisterSender();
  const sendOtpMutation = useSendSenderOtp();
  const [error, setError] = useState<DmtApiError | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      mobile: params?.get("mobile") ?? "",
      name: "",
      aadhaar: "",
    },
  });

  useEffect(() => {
    const mobile = params?.get("mobile");
    if (mobile) form.setValue("mobile", mobile);
  }, [params, form]);

  const onSubmit = async (values: FormValues) => {
    setError(null);
    try {
      const registered = await registerMutation.mutateAsync({
        mobile: values.mobile,
        aadhaar: values.aadhaar,
        firstName: values.name.trim(),
      });
      setActiveSenderMobile(values.mobile);
      const otpResult = await sendOtpMutation.mutateAsync(values.mobile);
      toast.success("OTP sent to sender mobile");
      const referenceKey = otpResult.referenceKey || registered.referenceKey || "";
      const query = new URLSearchParams({ mobile: values.mobile });
      if (referenceKey) query.set("referenceKey", referenceKey);
      router.push(`/rt/retailer/dmt/sender/verify?${query.toString()}`);
    } catch (err) {
      const mapped = err as DmtApiError;
      setError(mapped);
      toast.error(mapped.message);
    }
  };

  const loading = registerMutation.isPending || sendOtpMutation.isPending;

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <DmtPageHeader
        title="Register Sender"
        description="Register a new remitter with mobile and Aadhaar"
        backHref="/rt/retailer/dmt/sender"
      />

      <Card>
        <CardHeader>
          <CardTitle>Sender Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input placeholder="Sender full name" {...form.register("name")} />
              {form.formState.errors.name && (
                <p className="text-xs text-red-500">
                  {form.formState.errors.name.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label>Mobile Number</Label>
              <Input maxLength={10} {...form.register("mobile")} />
              {form.formState.errors.mobile && (
                <p className="text-xs text-red-500">
                  {form.formState.errors.mobile.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label>Aadhaar Number</Label>
              <Input
                placeholder="12-digit Aadhaar"
                maxLength={12}
                {...form.register("aadhaar")}
              />
              {form.formState.errors.aadhaar && (
                <p className="text-xs text-red-500">
                  {form.formState.errors.aadhaar.message}
                </p>
              )}
            </div>
            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-[#0A84FF] to-[#0057D9]"
              disabled={loading}
            >
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              Register Sender
            </Button>
          </form>
        </CardContent>
      </Card>

      {error && (
        <DmtErrorState code={error.code} message={error.message} onRetry={() => setError(null)} />
      )}
    </div>
  );
}

export default function RegisterSenderPage() {
  return (
    <Suspense fallback={<div className="py-10 text-center text-sm text-slate-500">Loading...</div>}>
      <RegisterSenderForm />
    </Suspense>
  );
}

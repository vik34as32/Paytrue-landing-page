"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Search, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import DmtPageHeader from "@/src/components/dmt/DmtPageHeader";
import DmtErrorState from "@/src/components/dmt/DmtErrorState";
import { useCheckRemitter } from "@/src/hooks/useDmt";
import {
  setActiveSenderMobile,
  setSenderReferenceKey,
} from "@/src/lib/dmtSession";
import type { DmtApiError } from "@/src/types/dmt";

const schema = z.object({
  mobile: z.string().regex(/^[6-9]\d{9}$/, "Enter valid 10-digit mobile number"),
});

type FormValues = z.infer<typeof schema>;

export default function SenderSearchPage() {
  const router = useRouter();
  const checkMutation = useCheckRemitter();
  const [error, setError] = useState<DmtApiError | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { mobile: "" },
  });

  const onSubmit = async (values: FormValues) => {
    setError(null);
    try {
      const result = await checkMutation.mutateAsync(values.mobile);
      setActiveSenderMobile(values.mobile);
      if (result.referenceKey) {
        setSenderReferenceKey(result.referenceKey);
      }
      if (result.exists) {
        toast.success("Sender found");
        router.push(
          `/rt/retailer/dmt/sender/profile?mobile=${encodeURIComponent(values.mobile)}`
        );
      } else {
        toast.info("Sender not registered. Please register sender.");
        const query = new URLSearchParams({ mobile: values.mobile });
        if (result.referenceKey) query.set("referenceKey", result.referenceKey);
        router.push(`/rt/retailer/dmt/sender/register?${query.toString()}`);
      }
    } catch (err) {
      const mapped = err as DmtApiError;
      setError(mapped);
      toast.error(mapped.message);
    }
  };

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <DmtPageHeader
        title="Search Sender"
        description="Enter mobile number to continue with money transfer"
      />

      <Card>
        <CardHeader>
          <CardTitle>Sender Search</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label>Mobile Number</Label>
              <Input
                placeholder="10-digit mobile number"
                maxLength={10}
                {...form.register("mobile")}
              />
              {form.formState.errors.mobile && (
                <p className="text-xs text-red-500">
                  {form.formState.errors.mobile.message}
                </p>
              )}
            </div>
            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-[#0A84FF] to-[#0057D9]"
              disabled={checkMutation.isPending}
            >
              {checkMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Search className="h-4 w-4" />
              )}
              Search Sender
            </Button>
          </form>
        </CardContent>
      </Card>

      {error && (
        <DmtErrorState
          code={error.code}
          message={error.message}
          onRetry={() => setError(null)}
        />
      )}
    </div>
  );
}

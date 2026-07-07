"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Fingerprint, Loader2, MapPin } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import DmtPageHeader from "@/src/components/dmt/DmtPageHeader";
import DmtErrorState from "@/src/components/dmt/DmtErrorState";
import { useRemitterEkyc } from "@/src/hooks/useDmt";
import { useFingerprint } from "@/src/hooks/useFingerprint";
import type { DmtApiError } from "@/src/types/dmt";

function RemitterEkycForm() {
  const router = useRouter();
  const params = useSearchParams();
  const mobile = params?.get("mobile") ?? "";
  const referenceKey = params?.get("referenceKey") ?? "";
  const ekycMutation = useRemitterEkyc();
  const {
    rdStatus,
    refreshRdService,
    isCapturing,
    isFetchingLocation,
    captureWithLocation,
    location,
  } = useFingerprint();
  const [error, setError] = useState<DmtApiError | null>(null);
  const [consent, setConsent] = useState(true);

  const handleEkyc = async () => {
    if (!mobile) {
      toast.error("Sender mobile is required.");
      return;
    }
    if (!consent) {
      toast.error("Consent is required for eKYC.");
      return;
    }

    setError(null);
    try {
      const capture = await captureWithLocation();
      await ekycMutation.mutateAsync({
        mobile,
        referenceKey: referenceKey || undefined,
        latitude: capture.latitude,
        longitude: capture.longitude,
        consentTaken: "Y",
        captureType: "FINGER",
        pidData: capture.pidData,
      });
      toast.success("Remitter eKYC completed successfully.");
      router.push(`/rt/retailer/dmt/sender/profile?mobile=${encodeURIComponent(mobile)}`);
    } catch (err) {
      const mapped = err as DmtApiError;
      if (!String(err).includes("Location") && !String(err).includes("capture")) {
        setError(mapped);
        toast.error(mapped.message);
      }
    }
  };

  const busy = ekycMutation.isPending || isCapturing || isFetchingLocation;

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <DmtPageHeader
        title="Remitter eKYC"
        description="Complete Aadhaar biometric eKYC for the remitter"
        backHref={`/rt/retailer/dmt/sender/profile?mobile=${encodeURIComponent(mobile)}`}
      />

      <Card>
        <CardHeader>
          <CardTitle>Biometric eKYC</CardTitle>
          <CardDescription>
            Mobile: {mobile || "—"} • Scanner → location → fingerprint → API
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm">
            <p className="flex items-center gap-2 font-medium text-slate-700">
              <MapPin className="h-4 w-4 text-[#1565d8]" />
              Location
            </p>
            <p className="mt-1 text-slate-600">
              {location
                ? `${location.latitude}, ${location.longitude}`
                : "Fetched when you start eKYC"}
            </p>
          </div>

          <label className="flex items-center gap-2 text-sm text-slate-700">
            <input
              type="checkbox"
              checked={consent}
              onChange={(e) => setConsent(e.target.checked)}
              disabled={busy}
            />
            I confirm remitter consent for Aadhaar biometric eKYC
          </label>

          <div className="rounded-lg border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-800">
            <Fingerprint className="mr-1 inline h-4 w-4" />
            RD Service: {rdStatus.isRunning ? "Running" : "Not detected"}
            {!rdStatus.isRunning ? (
              <Button
                type="button"
                variant="link"
                className="ml-2 h-auto p-0 text-blue-700"
                onClick={() => refreshRdService()}
              >
                Refresh
              </Button>
            ) : null}
          </div>

          <Button
            type="button"
            className="w-full bg-gradient-to-r from-[#0A84FF] to-[#0057D9]"
            disabled={busy || !mobile}
            onClick={handleEkyc}
          >
            {busy ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {isFetchingLocation
                  ? "Getting location..."
                  : isCapturing
                    ? "Capturing fingerprint..."
                    : "Submitting eKYC..."}
              </>
            ) : (
              "Start Remitter eKYC"
            )}
          </Button>
        </CardContent>
      </Card>

      {error ? (
        <DmtErrorState code={error.code} message={error.message} onRetry={() => setError(null)} />
      ) : null}
    </div>
  );
}

export default function RemitterEkycPage() {
  return (
    <Suspense fallback={<div className="py-10 text-center text-sm text-slate-500">Loading...</div>}>
      <RemitterEkycForm />
    </Suspense>
  );
}

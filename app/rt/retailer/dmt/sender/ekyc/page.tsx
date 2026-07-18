"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Fingerprint, Loader2, MapPin } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import DmtPageHeader from "@/src/components/dmt/DmtPageHeader";
import DmtErrorState from "@/src/components/dmt/DmtErrorState";
import { useRemitterEkyc } from "@/src/hooks/useDmt";
import { useFingerprint } from "@/src/hooks/useFingerprint";
import { useRemitterEkycSession } from "@/src/modules/dmt/hooks/useRemitterEkycSession";
import { logEkycDebug, logRdDebug } from "@/src/lib/biometric/pidOptions";
import type { DmtApiError } from "@/src/types/dmt";

function isEkycReferenceExpiredError(error: unknown): boolean {
  const err = error as {
    code?: string;
    message?: string;
  };
  const code = String(err?.code || "").toUpperCase();
  const message = String(err?.message || "").toUpperCase();
  if (
    [
      "REFERENCE_KEY_EXPIRED",
      "REFERENCE_EXPIRED",
      "INVALID_REFERENCE_KEY",
      "EKYC_SESSION_EXPIRED",
      "PID_OPTIONS_EXPIRED",
    ].includes(code)
  ) {
    return true;
  }
  return (
    message.includes("REFERENCE KEY") &&
    (message.includes("EXPIRED") ||
      message.includes("INVALID") ||
      message.includes("REQUIRED"))
  );
}

function RemitterEkycForm() {
  const router = useRouter();
  const params = useSearchParams();
  const mobile = params?.get("mobile") ?? "";
  const ekycMutation = useRemitterEkyc();
  const { session, ensureSession, clearSession } = useRemitterEkycSession();
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
  const [loadingPidOptions, setLoadingPidOptions] = useState(false);
  const bootstrappedRef = useRef(false);

  /** Load pid-options once when page mounts (reuse if session already active) */
  useEffect(() => {
    if (!mobile.trim()) return;

    if (
      session.isActive &&
      session.mobile === mobile.trim() &&
      session.referenceKey &&
      session.pidOptions
    ) {
      bootstrappedRef.current = true;
      setLoadingPidOptions(false);
      return;
    }

    if (bootstrappedRef.current) return;

    let cancelled = false;
    bootstrappedRef.current = true;

    (async () => {
      setLoadingPidOptions(true);
      try {
        await ensureSession(mobile.trim());
      } catch (err) {
        bootstrappedRef.current = false;
        if (!cancelled) {
          toast.error(
            err instanceof Error ? err.message : "Failed to load pid-options."
          );
        }
      } finally {
        if (!cancelled) setLoadingPidOptions(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [
    ensureSession,
    mobile,
    session.isActive,
    session.mobile,
    session.pidOptions,
    session.referenceKey,
  ]);

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
      // Reuse session — do NOT call pid-options again on capture retry
      const active =
        session.isActive &&
        session.mobile === mobile.trim() &&
        session.referenceKey &&
        session.pidOptions
          ? {
              referenceKey: session.referenceKey,
              pidOptions: session.pidOptions,
              pidOptionWadh: session.pidOptionWadh,
            }
          : await ensureSession(mobile.trim());

      if (!active.referenceKey || !active.pidOptions) {
        throw new Error(
          "Missing referenceKey or pidOptions from GET /remitter/:mobile/pid-options."
        );
      }

      logRdDebug({
        referenceKey: active.referenceKey,
        pidOptionWadh: active.pidOptionWadh || null,
        generatedXml: active.pidOptions,
      });

      // Pass saved pidOptions XML directly to RD — no post-capture profile fetch
      const capture = await captureWithLocation({
        pidOptionsXml: active.pidOptions,
        wadh: active.pidOptionWadh || undefined,
      });

      logEkycDebug({
        referenceKey: active.referenceKey,
        pidLength: capture.pidData.length,
      });

      await ekycMutation.mutateAsync({
        mobile,
        referenceKey: active.referenceKey,
        latitude: capture.latitude,
        longitude: capture.longitude,
        consentTaken: "Y",
        captureType: "FINGER",
        pidData: capture.pidData,
      });

      clearSession();
      toast.success("Remitter eKYC completed successfully.");
      router.push(
        `/rt/retailer/dmt/sender/profile?mobile=${encodeURIComponent(mobile)}`
      );
    } catch (err) {
      if (isEkycReferenceExpiredError(err)) {
        clearSession();
      }
      // Capture / eKYC failure otherwise keeps session for retry
      const mapped = err as DmtApiError;
      toast.error(
        mapped.message || (err instanceof Error ? err.message : "eKYC failed.")
      );
      if (mapped?.message) setError(mapped);
    }
  };

  const busy =
    ekycMutation.isPending ||
    isCapturing ||
    isFetchingLocation ||
    loadingPidOptions;

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
            Mobile: {mobile || "—"} • pid-options once → RD capture → eKYC
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
                {loadingPidOptions
                  ? "Loading pid-options..."
                  : isFetchingLocation
                    ? "Getting location..."
                    : isCapturing
                      ? "Capturing fingerprint..."
                      : "Submitting eKYC..."}
              </>
            ) : session.isActive ? (
              "Start Remitter eKYC"
            ) : (
              "Start Remitter eKYC"
            )}
          </Button>
        </CardContent>
      </Card>

      {error ? (
        <DmtErrorState
          code={error.code}
          message={error.message}
          onRetry={() => setError(null)}
        />
      ) : null}
    </div>
  );
}

export default function RemitterEkycPage() {
  return (
    <Suspense
      fallback={
        <div className="py-10 text-center text-sm text-slate-500">Loading...</div>
      }
    >
      <RemitterEkycForm />
    </Suspense>
  );
}

"use client";

import { useState } from "react";
import { Fingerprint, Loader2, MapPin, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import AepsPageHeader from "@/src/components/aeps/AepsPageHeader";
import DeviceStatusCard from "@/src/components/aeps/DeviceStatusCard";
import DeviceSelector from "@/src/components/aeps/DeviceSelector";
import FormStatusAlert from "@/src/components/common/FormStatusAlert";
import { useFingerprint } from "@/src/hooks/useFingerprint";
import { nsdlDailyLogin } from "../lib/nsdl-aeps-api";
import { useNsdlMerchant, useRefreshNsdlMerchant } from "../lib/nsdl-aeps-hooks";
import type { NsdlDailyLoginAuthType } from "../types";

const AUTH_TYPES: { value: NsdlDailyLoginAuthType; label: string; hint: string }[] = [
  { value: "1", label: "Cash Withdrawal", hint: "Login for AEPS cash withdrawal" },
  { value: "2", label: "Aadhaar Pay", hint: "Login for Aadhaar Pe collections" },
  { value: "3", label: "Cash Deposit", hint: "Login for AEPS cash deposit" },
];

export default function NsdlDailyLoginPage() {
  const { merchant } = useNsdlMerchant();
  const refreshMerchant = useRefreshNsdlMerchant();
  const { rdStatus, refreshRdService, canCapture, isCapturing, isFetchingLocation, captureWithLocation, location } =
    useFingerprint();
  const [authType, setAuthType] = useState<NsdlDailyLoginAuthType>("1");
  const [loggingIn, setLoggingIn] = useState(false);
  const [error, setError] = useState("");

  const busy = loggingIn || isCapturing || isFetchingLocation;

  const onLogin = async () => {
    setError("");
    setLoggingIn(true);
    try {
      const capture = await captureWithLocation();
      const result = await nsdlDailyLogin({
        authType,
        pidBlock: capture.pidData,
        latitude: String(capture.latitude),
        longitude: String(capture.longitude),
      });
      if (!result.success) {
        setError(result.message || "Daily login failed.");
        return;
      }
      toast.success(result.message || "NSDL AEPS daily login successful");
      await refreshMerchant();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Daily login failed.");
    } finally {
      setLoggingIn(false);
    }
  };

  return (
    <div className="space-y-6">
      <AepsPageHeader
        title="Daily Login"
        description="Complete biometric outlet login for NSDL AEPS before transactions"
      />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <Card>
          <CardHeader>
            <CardTitle>Biometric Login</CardTitle>
            <CardDescription>
              Login type → location → RD Service check → fingerprint capture → API login
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3 rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm sm:grid-cols-2">
              <div>
                <p className="text-xs text-slate-500">Merchant ID</p>
                <p className="font-semibold text-slate-800">{merchant?.merchantId || "—"}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Merchant Aadhaar</p>
                <p className="font-semibold text-slate-800">{merchant?.aadhaarMasked || "—"}</p>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Login Type</Label>
              <div className="grid gap-2 sm:grid-cols-3">
                {AUTH_TYPES.map((option) => {
                  const active = authType === option.value;
                  return (
                    <label
                      key={option.value}
                      className={cn(
                        "flex cursor-pointer items-start gap-3 rounded-xl border px-4 py-3 transition",
                        active
                          ? "border-[#6D28D9] bg-violet-50 ring-1 ring-[#6D28D9]/30"
                          : "border-slate-200 bg-white hover:border-slate-300",
                        busy && "pointer-events-none opacity-60"
                      )}
                    >
                      <input
                        type="radio"
                        name="nsdl-auth-type"
                        value={option.value}
                        checked={active}
                        disabled={busy}
                        onChange={() => setAuthType(option.value)}
                        className="mt-1 h-4 w-4 accent-[#6D28D9]"
                      />
                      <span>
                        <span className="block text-sm font-semibold text-slate-800">{option.label}</span>
                        <span className="mt-0.5 block text-xs text-slate-500">{option.hint}</span>
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>

            <DeviceSelector disabled={busy} />

            <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm">
              <p className="flex items-center gap-2 font-medium text-slate-700">
                <MapPin className="h-4 w-4 text-[#6D28D9]" />
                Location
              </p>
              <p className="mt-1 text-slate-600">
                {location
                  ? `${location.latitude}, ${location.longitude}`
                  : "Location will be fetched when you start login"}
              </p>
            </div>

            <div className="rounded-lg border border-violet-100 bg-violet-50 px-4 py-3 text-sm text-violet-800">
              <Fingerprint className="mr-1 inline h-4 w-4" />
              Merchant (outlet owner) should place finger on the selected scanner when prompted.
            </div>

            {error ? (
              <FormStatusAlert
                variant="error"
                title="Daily login failed"
                message={error}
                onDismiss={() => setError("")}
              />
            ) : null}

            <Button type="button" className="w-full" disabled={busy} onClick={() => void onLogin()}>
              {busy ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {isFetchingLocation
                    ? "Getting location..."
                    : isCapturing
                      ? "Capturing fingerprint..."
                      : "Logging in..."}
                </>
              ) : (
                <>
                  <ShieldCheck className="mr-2 h-4 w-4" />
                  {canCapture ? "Start Daily Login" : "Start Daily Login (will discover RD Service)"}
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        <DeviceStatusCard status={rdStatus} isChecking={busy} onRefresh={refreshRdService} />
      </div>
    </div>
  );
}

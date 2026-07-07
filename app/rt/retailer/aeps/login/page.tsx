"use client";

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useForm } from "react-hook-form";
import { CreditCard, Fingerprint, Loader2, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import AepsPageHeader from "@/src/components/aeps/AepsPageHeader";
import DeviceStatusCard from "@/src/components/aeps/DeviceStatusCard";
import DeviceSelector from "@/src/components/aeps/DeviceSelector";
import FormStatusAlert, {
  isFormErrorVariant,
} from "@/src/components/common/FormStatusAlert";
import { useFormStatus } from "@/src/hooks/useFormStatus";
import SuccessModal from "@/src/components/common/SuccessModal";
import { useFingerprint } from "@/src/hooks/useFingerprint";
import { aepsDailyLogin } from "@/src/services/aepsService";
import { hydrateAepsLogin } from "@/src/redux/slices/aepsSlice";
import { saveAepsSessionToStorage } from "@/src/lib/aepsSession";
import { getProfileAadhaarNumber } from "@/src/lib/profileUtils";
import {
  selectProfile,
  selectProfileLoading,
} from "@/src/redux/slices/profileSlice";
import { selectAuthHydrated, selectIsAuthenticated } from "@/src/redux/slices/authSlice";
import { fetchProfile } from "@/src/redux/thunks/profileThunk";

interface LoginFormValues {
  aadhaarNumber: string;
}

export default function AepsDailyLoginPage() {
  const dispatch = useDispatch();
  const profile = useSelector(selectProfile);
  const profileLoading = useSelector(selectProfileLoading);
  const authHydrated = useSelector(selectAuthHydrated);
  const isAuthenticated = useSelector(selectIsAuthenticated);

  const aeps = useSelector((state: { aeps: {
    isDailyLoginComplete: boolean;
    lastLoginDate: string | null;
    error: string | null;
  } }) => state.aeps);

  const {
    rdStatus,
    refreshRdService,
    canCapture,
    isCapturing,
    isFetchingLocation,
    captureWithLocation,
    location,
  } = useFingerprint();

  const [successOpen, setSuccessOpen] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const { status, clearStatus, showError, showSuccess } = useFormStatus();

  const profileAadhaar = getProfileAadhaarNumber(
    profile as Record<string, unknown> | null
  );

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<LoginFormValues>({
    defaultValues: { aadhaarNumber: "" },
  });

  useEffect(() => {
    if (!authHydrated || !isAuthenticated) return;
    if (!profile && !profileLoading) {
      dispatch(fetchProfile());
    }
  }, [authHydrated, dispatch, isAuthenticated, profile, profileLoading]);

  useEffect(() => {
    if (!profileAadhaar) return;
    setValue("aadhaarNumber", profileAadhaar, {
      shouldValidate: true,
      shouldDirty: false,
    });
  }, [profileAadhaar, setValue]);

  const onSubmit = async (values: LoginFormValues) => {
    setIsLoggingIn(true);
    clearStatus();
    try {
      const capture = await captureWithLocation();
      const aadhaarNumber = values.aadhaarNumber.replace(/\D/g, "");
      const result = await aepsDailyLogin({
        pidData: capture.pidData,
        latitude: capture.latitude,
        longitude: capture.longitude,
        aadhaarNumber,
        aadhaar: aadhaarNumber,
      });
      const loginDate = result.loginDate || new Date().toISOString();
      dispatch(
        hydrateAepsLogin({
          isDailyLoginComplete: true,
          lastLoginDate: loginDate,
          agentName: result.agentName ?? "",
          loginMessage: result.message,
        })
      );
      saveAepsSessionToStorage({
        isDailyLoginComplete: true,
        lastLoginDate: loginDate,
        agentName: result.agentName ?? "",
        loginMessage: result.message,
      });
      showSuccess(
        result.message || "Daily AEPS login completed. You can now perform transactions.",
        "Daily login successful"
      );
      setSuccessOpen(true);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Daily login failed.";
      showError(message, "Daily login failed");
    } finally {
      setIsLoggingIn(false);
    }
  };

  const busy = isLoggingIn || isCapturing || isFetchingLocation;

  return (
    <div className="space-y-6">
      <AepsPageHeader
        title="Daily Login"
        description="Enter your registered Aadhaar and complete biometric login for AEPS"
      />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <Card>
          <CardHeader>
            <CardTitle>Biometric Login</CardTitle>
            <CardDescription>
              Aadhaar → location → RD Service check → fingerprint capture → API login
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="merchantAadhaar">Merchant Aadhaar Number</Label>
                <div className="relative">
                  <CreditCard className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <Input
                    id="merchantAadhaar"
                    inputMode="numeric"
                    maxLength={12}
                    placeholder="12-digit registered Aadhaar"
                    className="pl-10"
                    disabled={busy}
                    {...register("aadhaarNumber", {
                      required: "Aadhaar number is required",
                      pattern: {
                        value: /^[2-9]\d{11}$/,
                        message: "Enter a valid 12-digit Aadhaar number",
                      },
                    })}
                  />
                </div>
                {errors.aadhaarNumber ? (
                  <p className="text-xs text-rose-600">{errors.aadhaarNumber.message}</p>
                ) : profileAadhaar ? (
                  <p className="text-xs text-emerald-600">
                    Pre-filled from your profile KYC.
                  </p>
                ) : profileLoading ? (
                  <p className="text-xs text-slate-500">Loading Aadhaar from profile...</p>
                ) : (
                  <p className="text-xs text-slate-500">
                    Use the Aadhaar linked to your merchant/outlet account.
                  </p>
                )}
              </div>

              <DeviceSelector disabled={busy} />

              <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm">
                <p className="flex items-center gap-2 font-medium text-slate-700">
                  <MapPin className="h-4 w-4 text-[#1565d8]" />
                  Location
                </p>
                <p className="mt-1 text-slate-600">
                  {location
                    ? `${location.latitude}, ${location.longitude}`
                    : "Location will be fetched when you start login"}
                </p>
              </div>

              <div className="rounded-lg border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-800">
                <Fingerprint className="mr-1 inline h-4 w-4" />
                Place finger on the selected scanner when prompted.
              </div>

              {status && isFormErrorVariant(status.variant) ? (
                <FormStatusAlert
                  variant={status.variant}
                  title={status.title}
                  message={status.message}
                  onDismiss={clearStatus}
                />
              ) : aeps.error ? (
                <FormStatusAlert
                  variant="error"
                  title="Daily login failed"
                  message={aeps.error}
                />
              ) : null}

              <Button type="submit" className="w-full" disabled={busy}>
                {busy ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {isFetchingLocation
                      ? "Getting location..."
                      : isCapturing
                        ? "Capturing fingerprint..."
                        : "Logging in..."}
                  </>
                ) : canCapture ? (
                  "Start Daily Login"
                ) : (
                  "Start Daily Login (will discover RD Service)"
                )}
              </Button>

              {status && !isFormErrorVariant(status.variant) ? (
                <FormStatusAlert
                  variant={status.variant}
                  title={status.title}
                  message={status.message}
                />
              ) : null}
            </form>
          </CardContent>
        </Card>

        <DeviceStatusCard
          status={rdStatus}
          isChecking={busy}
          onRefresh={refreshRdService}
        />
      </div>

      <SuccessModal
        open={successOpen}
        onOpenChange={setSuccessOpen}
        title="Daily Login Successful"
        message={
          aeps.lastLoginDate
            ? `You are logged in for ${new Date(aeps.lastLoginDate).toLocaleDateString("en-IN")}.`
            : "You can now perform AEPS transactions."
        }
        buttonLabel="Go to Dashboard"
      />
    </div>
  );
}

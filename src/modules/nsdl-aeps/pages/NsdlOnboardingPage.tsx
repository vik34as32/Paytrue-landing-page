"use client";

import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { useSelector } from "react-redux";
import { useForm, type RegisterOptions } from "react-hook-form";
import {
  CheckCircle2,
  Clock3,
  ExternalLink,
  Fingerprint,
  Loader2,
  LogIn,
  RefreshCw,
  ShieldAlert,
  Video,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import AepsPageHeader from "@/src/components/aeps/AepsPageHeader";
import DeviceSelector from "@/src/components/aeps/DeviceSelector";
import DeviceStatusCard from "@/src/components/aeps/DeviceStatusCard";
import FormStatusAlert from "@/src/components/common/FormStatusAlert";
import PageLoader from "@/src/components/common/PageLoader";
import OtpInput from "@/src/components/dmt/OtpInput";
import { useFingerprint } from "@/src/hooks/useFingerprint";
import { getProfileAadhaarNumber, getProfileBank } from "@/src/lib/profileUtils";
import { useAppDispatch } from "@/src/redux/types";
import { selectAuthHydrated, selectIsAuthenticated, selectUser } from "@/src/redux/slices/authSlice";
import { selectProfile, selectProfileLoading } from "@/src/redux/slices/profileSlice";
import { fetchProfile } from "@/src/redux/thunks/profileThunk";
import NsdlBankSelect from "../components/NsdlBankSelect";
import {
  requestNsdlOnboardingOtp,
  submitNsdlEkyc,
  submitNsdlOnboarding,
  verifyNsdlOnboardingOtp,
} from "../lib/nsdl-aeps-api";
import { NSDL_AEPS_LOGIN_PATH } from "../lib/nsdl-aeps-endpoints";
import { useNsdlMerchant, useNsdlStates, useRefreshNsdlMerchant } from "../lib/nsdl-aeps-hooks";
import { asRecord } from "../lib/nsdl-aeps-normalizers";
import type { NsdlOnboardInput, NsdlStepResult } from "../types";

type FormValues = Omit<NsdlOnboardInput, "latitude" | "longitude" | "shopState"> & {
  shopStateId: string;
};

const MCC_OPTIONS = [
  { value: "5411", label: "5411 — Grocery / Kirana Store" },
  { value: "5999", label: "5999 — Miscellaneous Retail" },
  { value: "4814", label: "4814 — Mobile / Telecom Services" },
  { value: "5732", label: "5732 — Electronics Store" },
  { value: "5912", label: "5912 — Medical / Pharmacy" },
  { value: "7299", label: "7299 — Other Services" },
];

const SELECT_CLASS =
  "h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-violet-300 focus:ring-2 focus:ring-violet-100 disabled:opacity-60";

const RULES: Partial<Record<keyof FormValues, RegisterOptions<FormValues>>> = {
  firstName: { required: "First name is required" },
  lastName: { required: "Last name is required" },
  mobile: { required: "Mobile is required", pattern: { value: /^[6-9]\d{9}$/, message: "Invalid mobile number" } },
  email: { required: "Email is required", pattern: { value: /^\S+@\S+\.\S+$/, message: "Invalid email" } },
  aadhaarNumber: { required: "Aadhaar is required", pattern: { value: /^\d{12}$/, message: "Aadhaar must be 12 digits" } },
  pan: {
    required: "PAN is required",
    pattern: { value: /^[A-Z]{5}\d{4}[A-Z]$/, message: "Invalid PAN (e.g. ABCDE1234F)" },
  },
  addressLine1: { required: "Address is required" },
  city: { required: "City is required" },
  district: { required: "District is required" },
  stateId: { required: "Select state" },
  pincode: { required: "Pincode is required", pattern: { value: /^\d{6}$/, message: "Pincode must be 6 digits" } },
  shopName: { required: "Shop name is required" },
  mcc: { required: "Select business category" },
  accountHolderName: { required: "Account holder name is required" },
  bankAccountNumber: {
    required: "Account number is required",
    pattern: { value: /^\d{9,18}$/, message: "Account number must be 9-18 digits" },
  },
  ifsc: { required: "IFSC is required", pattern: { value: /^[A-Z]{4}0[A-Z0-9]{6}$/, message: "Invalid IFSC" } },
  bankName: { required: "Bank name is required" },
};

const SHOP_RULES: Partial<Record<keyof FormValues, RegisterOptions<FormValues>>> = {
  shopAddress: { required: "Shop address is required" },
  shopCity: { required: "Shop city is required" },
  shopDistrict: { required: "Shop district is required" },
  shopStateId: { required: "Select shop state" },
  shopPin: { required: "Shop pincode is required", pattern: { value: /^\d{6}$/, message: "Pincode must be 6 digits" } },
};

function pick(...values: unknown[]): string {
  for (const value of values) {
    const text = value == null ? "" : String(value).trim();
    if (text) return text;
  }
  return "";
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <fieldset className="space-y-3 rounded-xl border border-slate-200 p-4">
      <legend className="px-1 text-sm font-semibold text-slate-700">{title}</legend>
      <div className="grid gap-3 sm:grid-cols-2">{children}</div>
    </fieldset>
  );
}

function OnboardingForm({ onDone }: { onDone: (result: NsdlStepResult) => Promise<void> }) {
  const dispatch = useAppDispatch();
  const user = useSelector(selectUser) as Record<string, unknown> | null;
  const profile = useSelector(selectProfile) as Record<string, unknown> | null;
  const profileLoading = useSelector(selectProfileLoading);
  const authHydrated = useSelector(selectAuthHydrated);
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const { data: states = [], isLoading: statesLoading } = useNsdlStates();
  const { fetchLocation, isFetchingLocation } = useFingerprint();
  const [sameAsResidential, setSameAsResidential] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const {
    register,
    handleSubmit,
    setValue,
    getValues,
    formState: { errors },
  } = useForm<FormValues>({ defaultValues: { mcc: "5411" } });

  useEffect(() => {
    if (!authHydrated || !isAuthenticated) return;
    if (!profile && !profileLoading) dispatch(fetchProfile());
  }, [authHydrated, dispatch, isAuthenticated, profile, profileLoading]);

  useEffect(() => {
    const kyc = asRecord(profile?.kyc);
    const bank = profile ? getProfileBank(profile) : {};
    const prefill: Partial<FormValues> = {
      firstName: pick(user?.firstName, profile?.firstName),
      lastName: pick(user?.lastName, profile?.lastName),
      mobile: pick(user?.mobile, user?.phoneNumber, user?.phone, profile?.mobile).replace(/\D/g, "").slice(-10),
      email: pick(user?.email, profile?.email),
      aadhaarNumber: getProfileAadhaarNumber(profile),
      pan: pick(kyc.panNumber, kyc.pan, profile?.panNumber, profile?.pan).toUpperCase(),
      shopName: pick(profile?.shopName, profile?.businessName, user?.shopName),
      accountHolderName: pick(bank.accountHolderName, bank.accountHolder, bank.holderName),
      bankAccountNumber: pick(bank.accountNumber, bank.accountNo).replace(/\D/g, ""),
      ifsc: pick(bank.ifsc, bank.ifscCode).toUpperCase(),
      bankName: pick(bank.bankName, bank.name),
    };
    for (const [key, value] of Object.entries(prefill)) {
      const field = key as keyof FormValues;
      if (value && !getValues(field)) setValue(field, value);
    }
  }, [getValues, profile, setValue, user]);

  const field = (name: keyof FormValues, label: string, options: { placeholder?: string; upper?: boolean } = {}) => {
    const rules = RULES[name] ?? (sameAsResidential ? undefined : SHOP_RULES[name]);
    return (
      <div className="space-y-1.5">
        <Label htmlFor={`nsdl-${name}`}>{label}</Label>
        <Input
          id={`nsdl-${name}`}
          placeholder={options.placeholder}
          disabled={submitting}
          className={options.upper ? "uppercase" : undefined}
          {...register(name, {
            ...rules,
            setValueAs: (value: string) => (options.upper ? String(value).trim().toUpperCase() : String(value).trim()),
          })}
        />
        {errors[name] ? <p className="text-xs text-rose-600">{errors[name]?.message}</p> : null}
      </div>
    );
  };

  const stateSelect = (name: "stateId" | "shopStateId", label: string) => (
    <div className="space-y-1.5">
      <Label htmlFor={`nsdl-${name}`}>{label}</Label>
      <select
        id={`nsdl-${name}`}
        className={SELECT_CLASS}
        disabled={submitting || statesLoading}
        {...register(name, name === "stateId" ? RULES.stateId : sameAsResidential ? undefined : SHOP_RULES.shopStateId)}
      >
        <option value="">{statesLoading ? "Loading states..." : "Select state"}</option>
        {states.map((state) => (
          <option key={state.id} value={state.id}>
            {state.name}
          </option>
        ))}
      </select>
      {errors[name] ? <p className="text-xs text-rose-600">{errors[name]?.message}</p> : null}
    </div>
  );

  const onSubmit = handleSubmit(async (values) => {
    setError("");
    setSubmitting(true);
    try {
      const location = await fetchLocation();
      const stateName = (id: string) => states.find((state) => state.id === id)?.name ?? "";
      const shop = sameAsResidential
        ? {
            shopAddress: [values.addressLine1, values.addressLine2].filter(Boolean).join(", "),
            shopCity: values.city,
            shopDistrict: values.district,
            shopState: stateName(values.stateId),
            shopPin: values.pincode,
          }
        : {
            shopAddress: values.shopAddress,
            shopCity: values.shopCity,
            shopDistrict: values.shopDistrict,
            shopState: stateName(values.shopStateId),
            shopPin: values.shopPin,
          };
      const result = await submitNsdlOnboarding({
        mobile: values.mobile,
        email: values.email,
        latitude: String(location.latitude),
        longitude: String(location.longitude),
        city: values.city,
        district: values.district,
        pincode: values.pincode,
        shopName: values.shopName,
        aadhaarNumber: values.aadhaarNumber,
        pan: values.pan,
        firstName: values.firstName,
        middleName: values.middleName || "",
        lastName: values.lastName,
        addressLine1: values.addressLine1,
        addressLine2: values.addressLine2 || "",
        mcc: values.mcc,
        gstin: values.gstin || "",
        businessPan: values.businessPan || "",
        bankAccountNumber: values.bankAccountNumber,
        ifsc: values.ifsc,
        bankName: values.bankName,
        accountHolderName: values.accountHolderName,
        stateId: values.stateId,
        ...shop,
      });
      if (!result.success) {
        setError(result.message || "Onboarding could not be completed.");
        return;
      }
      await onDone(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Onboarding could not be completed.");
    } finally {
      setSubmitting(false);
    }
  });

  const busy = submitting || isFetchingLocation;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Merchant Onboarding</CardTitle>
        <CardDescription>
          Details are verified by NSDL. Use the Aadhaar-linked mobile number — an OTP will be sent to it.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-5" autoComplete="off">
          <Section title="Personal Details">
            {field("firstName", "First Name")}
            {field("middleName", "Middle Name (optional)")}
            {field("lastName", "Last Name")}
            {field("mobile", "Mobile Number", { placeholder: "Aadhaar-linked mobile" })}
            {field("email", "Email")}
            {field("aadhaarNumber", "Aadhaar Number", { placeholder: "12-digit Aadhaar" })}
            {field("pan", "PAN", { upper: true, placeholder: "ABCDE1234F" })}
          </Section>

          <Section title="Residential Address">
            {field("addressLine1", "Address Line 1")}
            {field("addressLine2", "Address Line 2 (optional)")}
            {field("city", "City")}
            {field("district", "District")}
            {stateSelect("stateId", "State")}
            {field("pincode", "Pincode")}
          </Section>

          <fieldset className="space-y-3 rounded-xl border border-slate-200 p-4">
            <legend className="px-1 text-sm font-semibold text-slate-700">Shop Details</legend>
            <div className="grid gap-3 sm:grid-cols-2">
              {field("shopName", "Shop Name")}
              <div className="space-y-1.5">
                <Label htmlFor="nsdl-mcc">Business Category (MCC)</Label>
                <select id="nsdl-mcc" className={SELECT_CLASS} disabled={submitting} {...register("mcc", RULES.mcc)}>
                  {MCC_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              {field("gstin", "GSTIN (optional)", { upper: true })}
              {field("businessPan", "Business PAN (optional)", { upper: true })}
            </div>
            <label className="flex items-center gap-2 text-sm text-slate-700">
              <input
                type="checkbox"
                className="h-4 w-4 accent-[#6D28D9]"
                checked={sameAsResidential}
                disabled={submitting}
                onChange={(event) => setSameAsResidential(event.target.checked)}
              />
              Shop address is same as residential address
            </label>
            {!sameAsResidential ? (
              <div className="grid gap-3 sm:grid-cols-2">
                {field("shopAddress", "Shop Address")}
                {field("shopCity", "Shop City")}
                {field("shopDistrict", "Shop District")}
                {stateSelect("shopStateId", "Shop State")}
                {field("shopPin", "Shop Pincode")}
              </div>
            ) : null}
          </fieldset>

          <Section title="Settlement Bank Account">
            {field("accountHolderName", "Account Holder Name")}
            {field("bankAccountNumber", "Account Number")}
            {field("ifsc", "IFSC", { upper: true })}
            {field("bankName", "Bank Name")}
          </Section>

          {error ? (
            <FormStatusAlert variant="error" title="Onboarding failed" message={error} onDismiss={() => setError("")} />
          ) : null}

          <Button type="submit" className="w-full" disabled={busy}>
            {busy ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {isFetchingLocation ? "Getting location..." : "Submitting..."}
              </>
            ) : (
              "Submit Onboarding"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

function OtpStep({ onDone }: { onDone: () => Promise<void> }) {
  const { fetchLocation } = useFingerprint();
  const [otp, setOtp] = useState("");
  const [sending, setSending] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState("");

  const onRequest = async () => {
    setError("");
    setSending(true);
    try {
      const location = await fetchLocation();
      const result = await requestNsdlOnboardingOtp({
        latitude: String(location.latitude),
        longitude: String(location.longitude),
      });
      if (result.success) toast.success(result.message || "OTP sent");
      else setError(result.message || "OTP request failed.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "OTP request failed.");
    } finally {
      setSending(false);
    }
  };

  const onVerify = async () => {
    if (!/^\d{6}$/.test(otp)) {
      setError("Enter the 6-digit OTP.");
      return;
    }
    setError("");
    setVerifying(true);
    try {
      const location = await fetchLocation();
      const result = await verifyNsdlOnboardingOtp({
        otp,
        latitude: String(location.latitude),
        longitude: String(location.longitude),
      });
      if (!result.success) {
        setError(result.message || "OTP verification failed.");
        return;
      }
      toast.success(result.message || "OTP verified");
      await onDone();
    } catch (err) {
      setError(err instanceof Error ? err.message : "OTP verification failed.");
    } finally {
      setVerifying(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Verify OTP</CardTitle>
        <CardDescription>
          Enter the OTP sent to the Aadhaar-linked mobile. Didn&apos;t receive it? Request a new OTP (once per minute).
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <OtpInput value={otp} onChange={setOtp} length={6} disabled={verifying} />
        {error ? <FormStatusAlert variant="error" title="OTP" message={error} onDismiss={() => setError("")} /> : null}
        <div className="flex flex-wrap gap-2">
          <Button type="button" onClick={() => void onVerify()} disabled={verifying || otp.length !== 6}>
            {verifying ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Verify OTP
          </Button>
          <Button type="button" variant="outline" onClick={() => void onRequest()} disabled={sending}>
            {sending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
            Request OTP
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function EkycStep({ onDone }: { onDone: (result: NsdlStepResult) => Promise<void> }) {
  const { rdStatus, refreshRdService, isCapturing, isFetchingLocation, captureWithLocation } = useFingerprint();
  const [bankIin, setBankIin] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const busy = submitting || isCapturing || isFetchingLocation;

  const onSubmit = async () => {
    if (!bankIin) {
      setError("Select the bank linked to your Aadhaar.");
      return;
    }
    setError("");
    setSubmitting(true);
    try {
      const capture = await captureWithLocation();
      const result = await submitNsdlEkyc({
        bankIin,
        pidBlock: capture.pidData,
        latitude: String(capture.latitude),
        longitude: String(capture.longitude),
      });
      if (!result.success) {
        setError(result.message || "eKYC failed.");
        return;
      }
      await onDone(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "eKYC failed.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
      <Card>
        <CardHeader>
          <CardTitle>Biometric eKYC</CardTitle>
          <CardDescription>Merchant fingerprint is verified against Aadhaar to complete eKYC.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <NsdlBankSelect value={bankIin} onChange={setBankIin} disabled={busy} label="Aadhaar-linked Bank" />
          <DeviceSelector disabled={busy} />
          <div className="rounded-lg border border-violet-100 bg-violet-50 px-3 py-2 text-xs text-violet-800">
            <Fingerprint className="mr-1 inline h-3.5 w-3.5" />
            Merchant should place finger on the scanner when prompted.
          </div>
          {error ? <FormStatusAlert variant="error" title="eKYC" message={error} onDismiss={() => setError("")} /> : null}
          <Button type="button" className="w-full" disabled={busy} onClick={() => void onSubmit()}>
            {busy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            {isCapturing ? "Capturing fingerprint..." : isFetchingLocation ? "Getting location..." : "Complete eKYC"}
          </Button>
        </CardContent>
      </Card>
      <DeviceStatusCard status={rdStatus} isChecking={busy} onRefresh={refreshRdService} />
    </div>
  );
}

function InfoCard({
  icon,
  title,
  message,
  children,
}: {
  icon: ReactNode;
  title: string;
  message: string;
  children?: ReactNode;
}) {
  return (
    <Card>
      <CardContent className="flex flex-col items-start gap-4 p-6">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-50 text-[#6D28D9]">{icon}</div>
          <div>
            <p className="text-base font-semibold text-slate-800">{title}</p>
            <p className="text-sm text-slate-500">{message}</p>
          </div>
        </div>
        {children ? <div className="flex flex-wrap gap-2">{children}</div> : null}
      </CardContent>
    </Card>
  );
}

const STEPS = ["Details", "OTP", "eKYC", "Video KYC", "Activation"];

function stepIndex(nextAction: string, activated: boolean): number {
  if (activated) return STEPS.length;
  switch (nextAction) {
    case "VERIFY_OTP":
      return 1;
    case "COMPLETE_EKYC":
      return 2;
    case "COMPLETE_VIDEO_KYC":
      return 3;
    case "AWAIT_ACTIVATION":
      return 4;
    default:
      return 0;
  }
}

export default function NsdlOnboardingPage() {
  const { merchant, isLoading, isError, error, refetch, isFetching, activated } = useNsdlMerchant();
  const refreshMerchant = useRefreshNsdlMerchant();

  if (isLoading) return <PageLoader message="Loading NSDL AEPS onboarding..." />;

  if (isError) {
    return (
      <InfoCard
        icon={<ShieldAlert className="h-5 w-5" />}
        title="Unable to load onboarding status"
        message={error instanceof Error ? error.message : "Please try again."}
      >
        <Button variant="outline" onClick={() => void refetch()}>
          <RefreshCw className="h-4 w-4" />
          Retry
        </Button>
      </InfoCard>
    );
  }

  const nextAction = merchant?.nextAction ?? "SUBMIT_ONBOARDING";
  const current = stepIndex(nextAction, activated);

  const afterStep = async (result?: NsdlStepResult) => {
    if (result?.message) toast.success(result.message);
    await refreshMerchant();
  };

  const refreshButton = (
    <Button variant="outline" onClick={() => void refetch()} disabled={isFetching}>
      <RefreshCw className={isFetching ? "h-4 w-4 animate-spin" : "h-4 w-4"} />
      Refresh Status
    </Button>
  );

  return (
    <div className="space-y-6">
      <AepsPageHeader
        title="NSDL AEPS Onboarding"
        description="One-time merchant activation — details, OTP, biometric eKYC and provider approval"
      />

      <ol className="flex flex-wrap gap-2">
        {STEPS.map((label, index) => (
          <li
            key={label}
            className={
              index < current
                ? "flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700"
                : index === current
                  ? "flex items-center gap-1.5 rounded-full bg-violet-600 px-3 py-1.5 text-xs font-semibold text-white"
                  : "flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-500"
            }
          >
            {index < current ? <CheckCircle2 className="h-3.5 w-3.5" /> : <span>{index + 1}.</span>}
            {label}
          </li>
        ))}
      </ol>

      {merchant?.merchantId ? (
        <p className="text-sm text-slate-500">
          Merchant ID: <span className="font-semibold text-slate-700">{merchant.merchantId}</span>
        </p>
      ) : null}

      {activated ? (
        <InfoCard
          icon={<CheckCircle2 className="h-5 w-5" />}
          title="NSDL AEPS is active"
          message="Onboarding is complete. Do your daily login to start transactions."
        >
          <Button asChild className="bg-gradient-to-r from-[#7C3AED] to-[#4F46E5]">
            <Link href={NSDL_AEPS_LOGIN_PATH}>
              <LogIn className="h-4 w-4" />
              Go to Daily Login
            </Link>
          </Button>
        </InfoCard>
      ) : nextAction === "VERIFY_OTP" ? (
        <OtpStep onDone={() => afterStep()} />
      ) : nextAction === "COMPLETE_EKYC" ? (
        <EkycStep onDone={afterStep} />
      ) : nextAction === "COMPLETE_VIDEO_KYC" ? (
        <InfoCard
          icon={<Video className="h-5 w-5" />}
          title="Complete Video KYC"
          message="eKYC is done. Complete the video KYC with the provider, then refresh the status here."
        >
          {merchant?.videoKycUrl ? (
            <Button asChild className="bg-gradient-to-r from-[#7C3AED] to-[#4F46E5]">
              <a href={merchant.videoKycUrl} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-4 w-4" />
                Start Video KYC
              </a>
            </Button>
          ) : null}
          {refreshButton}
        </InfoCard>
      ) : nextAction === "AWAIT_ACTIVATION" ? (
        <InfoCard
          icon={<Clock3 className="h-5 w-5" />}
          title="Awaiting provider activation"
          message="Your NSDL AEPS merchant is under review. Services unlock once the provider activates it."
        >
          {refreshButton}
        </InfoCard>
      ) : nextAction === "CONTACT_SUPPORT" ? (
        <InfoCard
          icon={<ShieldAlert className="h-5 w-5" />}
          title="Onboarding rejected"
          message="The provider rejected this merchant profile. Please contact support."
        >
          {refreshButton}
        </InfoCard>
      ) : (
        <OnboardingForm onDone={afterStep} />
      )}
    </div>
  );
}

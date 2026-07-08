"use client";

import { useEffect, useState, useRef } from "react";
import { Controller } from "react-hook-form";
import { Copy, RefreshCw, Eye, EyeOff, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import SelectField from "@/src/components/common/SelectField";
import ImageUpload from "@/src/components/common/ImageUpload";
import VideoUpload from "@/src/components/common/VideoUpload";
import PasswordStrengthMeter from "@/src/components/common/PasswordStrengthMeter";
import { INDIAN_STATES, GENDER_OPTIONS } from "@/src/constants/indianStates";
import { BUSINESS_TYPES } from "@/src/constants/businessTypes";
import { generateSecurePassword } from "@/src/lib/passwordUtils";
import { lookupPincode } from "@/src/lib/pincodeLookup";
import { lookupCoordinates } from "@/src/lib/geoLookup";
import { formatDateDisplay } from "@/src/validation/schemas";
import EmailVerificationField from "@/src/components/users/EmailVerificationField";
import { cn } from "@/lib/utils";

export function FormField({
  name,
  label,
  type = "text",
  placeholder,
  methods,
  disabled = false,
  readOnly = false,
  className,
  onChange,
  maxLength,
  inputMode,
}) {
  const {
    register,
    formState: { errors },
  } = methods;

  const registration = register(name);

  return (
    <div className="space-y-2" data-field={name}>
      <Label>{label}</Label>
      <Input
        type={type}
        placeholder={placeholder}
        disabled={disabled}
        readOnly={readOnly}
        maxLength={maxLength}
        inputMode={inputMode}
        className={className}
        {...registration}
        onChange={(event) => {
          if (onChange) onChange(event);
          registration.onChange(event);
        }}
      />
      {errors[name] && (
        <p className="text-xs text-red-500">{errors[name].message}</p>
      )}
    </div>
  );
}

function CoordinateField({ name, label, methods, loading, placeholder = "Auto-filled from location" }) {
  const {
    control,
    formState: { errors },
  } = methods;

  return (
    <div className="space-y-2" data-field={name}>
      <Label>{label}</Label>
      <Controller
        name={name}
        control={control}
        render={({ field }) => (
          <Input
            {...field}
            value={field.value || ""}
            readOnly
            tabIndex={-1}
            placeholder={loading ? "Fetching coordinates..." : placeholder}
            className="cursor-not-allowed bg-slate-50 dark:bg-slate-900/60"
          />
        )}
      />
      {loading && (
        <p className="flex items-center gap-1.5 text-xs text-slate-500">
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
          Resolving coordinates...
        </p>
      )}
      {errors[name] && (
        <p className="text-xs text-red-500">{errors[name].message}</p>
      )}
    </div>
  );
}

export function useOutletCoordinates(methods, values) {
  const { setValue } = methods;
  const [loadingCoords, setLoadingCoords] = useState(false);
  const requestRef = useRef(0);

  useEffect(() => {
    const { pincode, city, state, district } = values;
    if (!pincode || pincode.length !== 6 || !city || !state) {
      setLoadingCoords(false);
      return;
    }

    const requestId = ++requestRef.current;
    setLoadingCoords(true);
    setValue("latitude", "", { shouldValidate: false });
    setValue("longitude", "", { shouldValidate: false });

    lookupCoordinates({ pincode, city, state, district }).then((coords) => {
      if (requestId !== requestRef.current) return;
      setLoadingCoords(false);
      if (!coords) return;
      setValue("latitude", coords.latitude, { shouldValidate: true, shouldDirty: true });
      setValue("longitude", coords.longitude, { shouldValidate: true, shouldDirty: true });
    });

    return () => {
      requestRef.current += 1;
    };
  }, [values.pincode, values.city, values.state, values.district, setValue]);

  return { loadingCoords };
}

export function StepIndicator({ steps, currentStep }) {
  return (
    <ol className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
      {steps.map((stepItem, index) => {
        const stepNumber = index + 1;
        const isActive = currentStep === stepNumber;
        const isCompleted = currentStep > stepNumber;

        return (
          <li
            key={stepItem.id}
            className={cn(
              "flex min-w-0 flex-1 items-center gap-2 rounded-xl border px-3 py-2 text-xs font-semibold sm:min-w-[140px]",
              isActive && "border-[#1565d8] bg-[#1565d8] text-white shadow-sm",
              isCompleted && "border-emerald-200 bg-emerald-50 text-emerald-800",
              !isActive && !isCompleted && "border-slate-200 bg-slate-50 text-slate-500"
            )}
          >
            <span
              className={cn(
                "flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-bold",
                isActive && "bg-white/20 text-white",
                isCompleted && "bg-emerald-600 text-white",
                !isActive && !isCompleted && "bg-slate-200 text-slate-600"
              )}
            >
              {isCompleted ? "✓" : stepNumber}
            </span>
            <span className="truncate">{stepItem.title}</span>
          </li>
        );
      })}
    </ol>
  );
}

export function PasswordFieldGroup({ methods, isEdit, password }) {
  const [showPassword, setShowPassword] = useState(false);
  const { setValue, formState } = methods;

  const regenerate = () => {
    const next = generateSecurePassword();
    setValue("password", next, { shouldValidate: true, shouldDirty: true });
  };

  const copyPassword = async () => {
    if (!password) return;
    try {
      await navigator.clipboard.writeText(password);
      toast.success("Password copied");
    } catch {
      toast.error("Failed to copy password");
    }
  };

  return (
    <div className="space-y-2 lg:col-span-2" data-field="password">
      <Label>{isEdit ? "New Password (optional)" : "Password"}</Label>
      <div className="relative">
        <Input
          type={showPassword ? "text" : "password"}
          maxLength={8}
          placeholder={isEdit ? "Leave blank to keep current" : "8-character password"}
          className="pr-24"
          {...methods.register("password")}
        />
        <button
          type="button"
          className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-[#1565d8]"
          onClick={() => setShowPassword((prev) => !prev)}
        >
          {showPassword ? "Hide" : "Show"}
        </button>
      </div>
      <div className="flex flex-wrap gap-2">
        <Button type="button" variant="outline" size="sm" onClick={regenerate}>
          <RefreshCw className="h-3.5 w-3.5" />
          Generate Again
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => void copyPassword()}
          disabled={!password}
        >
          <Copy className="h-3.5 w-3.5" />
          Copy Password
        </Button>
      </div>
      {formState.errors.password && (
        <p className="text-xs text-red-500">{formState.errors.password.message}</p>
      )}
      <PasswordStrengthMeter password={password} />
    </div>
  );
}

function OutletLocationFields({
  methods,
  stateOptions,
  cityOptions,
  loadingPincode,
}) {
  const citySelectOptions = cityOptions.map((city) => ({ value: city, label: city }));

  return (
    <>
      <FormField
        name="address"
        label="Address"
        placeholder="Full outlet address"
        methods={methods}
      />
      <FormField
        name="pincode"
        label="Pincode"
        placeholder="6-digit pincode"
        methods={methods}
        maxLength={6}
        inputMode="numeric"
        onChange={(event) => {
          event.target.value = event.target.value.replace(/\D/g, "").slice(0, 6);
        }}
      />
      {loadingPincode && (
        <div className="flex items-center gap-2 text-xs text-slate-500 lg:col-span-2">
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
          Looking up pincode...
        </div>
      )}
      <SelectField
        name="state"
        label="State"
        placeholder="Select state"
        options={stateOptions}
        methods={methods}
        searchable
      />
      {citySelectOptions.length > 1 ? (
        <SelectField
          name="city"
          label="City"
          placeholder="Select city"
          options={citySelectOptions}
          methods={methods}
          searchable
        />
      ) : (
        <FormField name="city" label="City" placeholder="City" methods={methods} />
      )}
    </>
  );
}

export function useOutletPincodeLookup(methods, setCityOptions) {
  const { watch, setValue } = methods;
  const pincode = watch("pincode");
  const [loadingPincode, setLoadingPincode] = useState(false);

  useEffect(() => {
    const code = String(pincode || "").trim();
    if (code.length !== 6) return;

    let cancelled = false;
    setLoadingPincode(true);

    lookupPincode(code).then((result) => {
      if (cancelled) return;
      setLoadingPincode(false);
      if (!result) return;

      setValue("state", result.state, { shouldValidate: true });
      setValue("district", result.district || "", { shouldValidate: true });
      const cities =
        result.cities?.length > 0 ? result.cities : [result.city].filter(Boolean);
      setCityOptions(cities);
      setValue("city", result.city || "", { shouldValidate: true });
    });

    return () => {
      cancelled = true;
    };
  }, [pincode, setCityOptions, setValue]);

  return { loadingPincode };
}

export function PersonalDetailsStep({
  methods,
  isEdit,
  password,
  existingUrls,
  setFile,
  values,
  originalEmail = "",
  userType = "DISTRIBUTOR",
}) {
  const dateOfBirth = values.dateOfBirth;
  const isRetailer = userType === "RETAILER";

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {isRetailer ? (
        <div className="lg:col-span-2">
          <FormField
            name="fullName"
            label="Full Name"
            placeholder="Enter full name as per Aadhaar card"
            methods={methods}
          />
        </div>
      ) : (
        <>
          <FormField name="firstName" label="First Name" placeholder="Enter first name" methods={methods} />
          <FormField name="lastName" label="Last Name" placeholder="Enter last name" methods={methods} />
        </>
      )}
      <EmailVerificationField
        methods={methods}
        isEdit={isEdit}
        originalEmail={originalEmail}
      />
      <FormField name="mobile" label="Mobile" placeholder="10-digit mobile" methods={methods} maxLength={10} inputMode="numeric" />
      <SelectField name="gender" label="Gender" placeholder="Select gender" options={GENDER_OPTIONS} methods={methods} />
      <div className="space-y-2" data-field="dateOfBirth">
        <Label>Date of Birth</Label>
        <Input
          type="date"
          className="paytrue-filter-date"
          max={new Date().toISOString().slice(0, 10)}
          onKeyDown={(event) => event.preventDefault()}
          {...methods.register("dateOfBirth")}
        />
        {dateOfBirth && (
          <p className="text-xs text-slate-500">Display: {formatDateDisplay(dateOfBirth)}</p>
        )}
        {methods.formState.errors.dateOfBirth && (
          <p className="text-xs text-red-500">{methods.formState.errors.dateOfBirth.message}</p>
        )}
      </div>
      <PasswordFieldGroup methods={methods} isEdit={isEdit} password={password} />
      <div className="lg:col-span-2">
        <ImageUpload
          label="Profile Image"
          file={values.profileImage}
          existingUrl={existingUrls.profileImage}
          onChange={(file) => setFile("profileImage", file)}
        />
      </div>
    </div>
  );
}

export function OutletInformationStep({
  methods,
  outletCityOptions,
  setOutletCityOptions,
  values,
  setValue,
}) {
  const { loadingPincode } = useOutletPincodeLookup(methods, setOutletCityOptions);
  const { loadingCoords } = useOutletCoordinates(methods, values);
  const prevStateRef = useRef(values.state);

  useEffect(() => {
    if (prevStateRef.current && prevStateRef.current !== values.state) {
      setValue("city", "", { shouldValidate: false });
      setValue("latitude", "", { shouldValidate: false });
      setValue("longitude", "", { shouldValidate: false });
      setOutletCityOptions([]);
    }
    prevStateRef.current = values.state;
  }, [values.state, setOutletCityOptions, setValue]);

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <FormField name="outletName" label="Outlet Name" placeholder="Enter outlet name" methods={methods} />
      <SelectField name="businessType" label="Business Type" placeholder="Select business type" options={BUSINESS_TYPES} methods={methods} searchable />
      <FormField name="gstNumber" label="GST Number" placeholder="Optional" methods={methods} />
      <OutletLocationFields
        methods={methods}
        stateOptions={INDIAN_STATES}
        cityOptions={outletCityOptions}
        loadingPincode={loadingPincode}
      />
      <FormField name="district" label="District" placeholder="District" methods={methods} readOnly disabled />
      <CoordinateField name="latitude" label="Latitude" methods={methods} loading={loadingCoords} />
      <CoordinateField name="longitude" label="Longitude" methods={methods} loading={loadingCoords} />
    </div>
  );
}

export function KycStep({ methods, userType, values, existingUrls, setFile }) {
  const isRetailer = userType === "RETAILER";
  const { setValue } = methods;

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <FormField
        name="panNumber"
        label="PAN Number"
        placeholder="ABCDE1234F"
        methods={methods}
        maxLength={10}
        onChange={(event) => {
          const next = event.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "");
          event.target.value = next;
          setValue("panNumber", next, { shouldValidate: true, shouldDirty: true });
        }}
      />
      {isRetailer && (
        <FormField
          name="aadhaarNumber"
          label="Aadhaar Number"
          placeholder="12-digit Aadhaar"
          methods={methods}
          maxLength={12}
          inputMode="numeric"
          onChange={(event) => {
            const next = event.target.value.replace(/\D/g, "").slice(0, 12);
            event.target.value = next;
            setValue("aadhaarNumber", next, { shouldValidate: true, shouldDirty: true });
          }}
        />
      )}
      {isRetailer && (
        <>
          <ImageUpload label="Aadhaar Front" file={values.aadhaarFront} existingUrl={existingUrls.aadhaarFront} onChange={(file) => setFile("aadhaarFront", file)} />
          <ImageUpload label="Aadhaar Back" file={values.aadhaarBack} existingUrl={existingUrls.aadhaarBack} onChange={(file) => setFile("aadhaarBack", file)} />
        </>
      )}
      <ImageUpload label="PAN Card" file={values.panCard} existingUrl={existingUrls.panCard} onChange={(file) => setFile("panCard", file)} />
      <ImageUpload label="Owner Photo" file={values.ownerPhoto} existingUrl={existingUrls.ownerPhoto} onChange={(file) => setFile("ownerPhoto", file)} />
      <div className="lg:col-span-2">
        <VideoUpload label="Video Verification" file={values.videoVerification} existingUrl={existingUrls.videoVerification} onChange={(file) => setFile("videoVerification", file)} />
        {methods.formState.errors.videoVerification && (
          <p className="mt-1 text-xs text-red-500">{methods.formState.errors.videoVerification.message}</p>
        )}
      </div>
    </div>
  );
}

export function BankDetailsStep({ methods, values, existingUrls, setFile }) {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <FormField name="accountHolderName" label="Account Holder Name" placeholder="As per bank" methods={methods} />
      <FormField name="bankName" label="Bank Name" placeholder="Bank name" methods={methods} />
      <FormField name="accountNumber" label="Account Number" placeholder="Account number" methods={methods} inputMode="numeric" />
      <FormField name="confirmAccountNumber" label="Confirm Account Number" placeholder="Re-enter account number" methods={methods} inputMode="numeric" />
      <FormField
        name="ifscCode"
        label="IFSC Code"
        placeholder="IFSC code"
        methods={methods}
        maxLength={11}
        onChange={(event) => {
          event.target.value = event.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "");
        }}
      />
      <ImageUpload label="Passbook Image" file={values.passbookImage} existingUrl={existingUrls.passbookImage} onChange={(file) => setFile("passbookImage", file)} />
      <ImageUpload label="Cancelled Cheque" file={values.cancelledChequeImage} existingUrl={existingUrls.cancelledChequeImage} onChange={(file) => setFile("cancelledChequeImage", file)} enableCrop={false} />
    </div>
  );
}

export function PreviewSection({ title, items, onEdit }) {
  return (
    <div className="rounded-xl border border-slate-100 bg-slate-50/80 p-4 dark:border-slate-800 dark:bg-slate-900/50">
      <div className="mb-3 flex items-center justify-between gap-2">
        <h4 className="text-sm font-bold text-[#0b1f3a] dark:text-white">{title}</h4>
        {onEdit && (
          <Button type="button" variant="link" size="sm" className="h-auto p-0" onClick={onEdit}>
            Edit
          </Button>
        )}
      </div>
      <div className="grid gap-2 sm:grid-cols-2">
        {items.map(([label, value]) => (
          <div key={label}>
            <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">{label}</p>
            <p className="text-sm font-medium text-slate-700 dark:text-slate-200">{value || "—"}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

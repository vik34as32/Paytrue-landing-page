"use client";

import { useMemo, useState } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import { Users, ChevronLeft, ChevronRight, Check } from "lucide-react";
import { toast } from "sonner";
import PageHeader from "@/src/components/common/PageHeader";
import SuccessModal from "@/src/components/common/SuccessModal";
import ImageUpload from "@/src/components/common/ImageUpload";
import VideoUpload from "@/src/components/common/VideoUpload";
import SelectField from "@/src/components/common/SelectField";
import PasswordStrengthMeter from "@/src/components/common/PasswordStrengthMeter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  personalStepSchema,
  outletStepSchema,
  kycStepSchema,
  bankStepSchema,
} from "@/src/validation/schemas";
import {
  buildUserFormData,
  mapApiUserToFormValues,
  mapApiUserToExistingUrls,
} from "@/src/lib/buildUserFormData";
import { USER_FILE_FIELDS } from "@/src/constants/uploadConfig";
import {
  BUSINESS_TYPES,
  getBusinessTypeLabel,
} from "@/src/constants/businessTypes";
import {
  createDistributor,
  updateDistributor,
} from "@/src/redux/thunks/distributorThunk";
import {
  createRetailer,
  updateRetailer,
} from "@/src/redux/thunks/retailerThunk";
import { selectDistributorActionLoading } from "@/src/redux/slices/distributorSlice";
import { selectRetailerActionLoading } from "@/src/redux/slices/retailerSlice";

const STEPS = [
  { id: 1, title: "Personal Details", schema: personalStepSchema },
  { id: 2, title: "Outlet Information", schema: outletStepSchema },
  { id: 3, title: "KYC", schema: kycStepSchema },
  { id: 4, title: "Bank Details", schema: bankStepSchema },
  { id: 5, title: "Preview", schema: null },
];

const FILE_FIELD_KEYS = Object.keys(USER_FILE_FIELDS);

const emptyDefaults = {
  firstName: "",
  lastName: "",
  email: "",
  mobile: "",
  password: "",
  alternateMobileNumber: "",
  profileImage: null,
  outletName: "",
  businessType: "",
  gstNumber: "",
  address: "",
  state: "",
  district: "",
  city: "",
  village: "",
  pincode: "",
  latitude: "",
  longitude: "",
  aadhaarNumber: "",
  aadhaarFront: null,
  aadhaarBack: null,
  panNumber: "",
  panCard: null,
  ownerPhoto: null,
  videoVerification: null,
  accountHolderName: "",
  bankName: "",
  accountNumber: "",
  ifscCode: "",
  passbookImage: null,
  cancelledChequeImage: null,
};

function Field({ name, label, type = "text", placeholder, methods }) {
  const {
    register,
    formState: { errors },
  } = methods;

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <Input type={type} placeholder={placeholder} {...register(name)} />
      {errors[name] && (
        <p className="text-xs text-red-500">{errors[name].message}</p>
      )}
    </div>
  );
}

function PreviewSection({ title, items }) {
  return (
    <div className="rounded-xl border border-slate-100 bg-slate-50/80 p-4 dark:border-slate-800 dark:bg-slate-900/50">
      <h4 className="mb-3 text-sm font-bold text-[#0b1f3a] dark:text-white">{title}</h4>
      <div className="grid gap-2 sm:grid-cols-2">
        {items.map(([label, value]) => (
          <div key={label}>
            <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
              {label}
            </p>
            <p className="text-sm font-medium text-slate-700 dark:text-slate-200">
              {value || "—"}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

function extractFiles(values) {
  const files = {};
  FILE_FIELD_KEYS.forEach((key) => {
    if (values[key] instanceof File) {
      files[key] = values[key];
    }
  });
  return files;
}

export default function UserMultiStepForm({
  userType,
  mode = "create",
  userId = null,
  initialUser = null,
  title,
  description,
  backHref,
  successRedirect,
  icon: Icon = Users,
}) {
  const dispatch = useDispatch();
  const router = useRouter();
  const isEdit = mode === "edit";
  const distributorLoading = useSelector(selectDistributorActionLoading);
  const retailerLoading = useSelector(selectRetailerActionLoading);
  const actionLoading =
    userType === "DISTRIBUTOR" ? distributorLoading : retailerLoading;

  const existingUrls = useMemo(
    () => (initialUser ? mapApiUserToExistingUrls(initialUser) : {}),
    [initialUser]
  );

  const defaultValues = useMemo(() => {
    if (!initialUser) return emptyDefaults;
    return {
      ...emptyDefaults,
      ...mapApiUserToFormValues(initialUser),
      profileImage: null,
      aadhaarFront: null,
      aadhaarBack: null,
      panCard: null,
      ownerPhoto: null,
      videoVerification: null,
      passbookImage: null,
      cancelledChequeImage: null,
    };
  }, [initialUser]);

  const [step, setStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [successOpen, setSuccessOpen] = useState(false);

  const methods = useForm({
    defaultValues,
    mode: "onBlur",
  });

  const { handleSubmit, watch, setValue, setError, getValues } = methods;
  const password = watch("password");
  const values = watch();

  const validationContext = {
    isEdit,
    existingUrls,
  };

  const goNext = async () => {
    const currentSchema = STEPS[step - 1]?.schema;
    if (currentSchema) {
      try {
        await currentSchema.validate(getValues(), {
          abortEarly: false,
          context: validationContext,
        });
      } catch (err) {
        if (err.inner) {
          err.inner.forEach((e) => {
            if (e.path) setError(e.path, { message: e.message });
          });
        }
        toast.error("Please fix validation errors before continuing");
        return;
      }
    }
    setStep((s) => Math.min(s + 1, STEPS.length));
  };

  const goBack = () => setStep((s) => Math.max(s - 1, 1));

  const onSubmit = async () => {
    const data = getValues();
    const files = extractFiles(data);
    const formData = buildUserFormData(data, files, {
      userType,
      includePassword: !isEdit || Boolean(data.password),
    });

    try {
      if (isEdit && userId) {
        if (userType === "DISTRIBUTOR") {
          await dispatch(updateDistributor({ id: userId, formData })).unwrap();
        } else {
          await dispatch(updateRetailer({ id: userId, formData })).unwrap();
        }
        toast.success("Updated successfully");
        router.push(successRedirect);
        return;
      }

      if (userType === "DISTRIBUTOR") {
        await dispatch(createDistributor(formData)).unwrap();
      } else {
        await dispatch(createRetailer(formData)).unwrap();
      }

      toast.success("Created successfully");
      setSuccessOpen(true);
    } catch (err) {
      toast.error(typeof err === "string" ? err : "Submission failed");
    }
  };

  const setFile = (field, file) => {
    setValue(field, file, { shouldValidate: true });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={title}
        description={description}
        icon={Icon}
        backHref={backHref}
      />

      <div className="flex flex-wrap gap-2">
        {STEPS.map((s) => (
          <div
            key={s.id}
            className={`flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold ${
              step === s.id
                ? "bg-[#1565d8] text-white"
                : step > s.id
                  ? "bg-emerald-50 text-emerald-700"
                  : "bg-slate-100 text-slate-500"
            }`}
          >
            {step > s.id ? <Check className="h-3.5 w-3.5" /> : s.id}
            <span className="hidden sm:inline">{s.title}</span>
          </div>
        ))}
      </div>

      <FormProvider {...methods}>
        <form onSubmit={handleSubmit(step === 5 ? onSubmit : goNext)}>
          <Card>
            <CardHeader>
              <CardTitle>{STEPS[step - 1].title}</CardTitle>
              <CardDescription>
                Step {step} of {STEPS.length}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {step === 1 && (
                <div className="grid gap-4 lg:grid-cols-2">
                  <Field name="firstName" label="First Name" placeholder="Enter first name" methods={methods} />
                  <Field name="lastName" label="Last Name" placeholder="Enter last name" methods={methods} />
                  <Field name="email" label="Email" type="email" placeholder="Enter email" methods={methods} />
                  <Field name="mobile" label="Mobile" placeholder="10-digit mobile" methods={methods} />
                  <Field name="alternateMobileNumber" label="Alternate Mobile" placeholder="Optional" methods={methods} />
                  <div className="space-y-2">
                    <Label>{isEdit ? "New Password (optional)" : "Password"}</Label>
                    <div className="relative">
                      <Input
                        type={showPassword ? "text" : "password"}
                        placeholder={isEdit ? "Leave blank to keep current" : "Create password"}
                        {...methods.register("password")}
                      />
                      <button
                        type="button"
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-[#1565d8]"
                        onClick={() => setShowPassword((p) => !p)}
                      >
                        {showPassword ? "Hide" : "Show"}
                      </button>
                    </div>
                    {methods.formState.errors.password && (
                      <p className="text-xs text-red-500">
                        {methods.formState.errors.password.message}
                      </p>
                    )}
                    <PasswordStrengthMeter password={password} />
                  </div>
                  <div className="lg:col-span-2">
                    <ImageUpload
                      label="Profile Image"
                      file={values.profileImage}
                      existingUrl={existingUrls.profileImage}
                      onChange={(file) => setFile("profileImage", file)}
                    />
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="grid gap-4 lg:grid-cols-2">
                  <Field name="outletName" label="Outlet Name" placeholder="Enter outlet name" methods={methods} />
                  <SelectField
                    name="businessType"
                    label="Business Type"
                    placeholder="Select business type"
                    options={BUSINESS_TYPES}
                    methods={methods}
                    searchable
                  />
                  <Field name="gstNumber" label="GST Number" placeholder="Optional" methods={methods} />
                  <Field name="address" label="Address" placeholder="Full address" methods={methods} />
                  <Field name="state" label="State" placeholder="State" methods={methods} />
                  <Field name="district" label="District" placeholder="District" methods={methods} />
                  <Field name="city" label="City" placeholder="City" methods={methods} />
                  <Field name="village" label="Village" placeholder="Optional" methods={methods} />
                  <Field name="pincode" label="Pincode" placeholder="6-digit pincode" methods={methods} />
                  <Field name="latitude" label="Latitude" placeholder="Optional" methods={methods} />
                  <Field name="longitude" label="Longitude" placeholder="Optional" methods={methods} />
                </div>
              )}

              {step === 3 && (
                <div className="grid gap-6 lg:grid-cols-2">
                  <Field name="aadhaarNumber" label="Aadhaar Number" placeholder="12-digit Aadhaar" methods={methods} />
                  <Field name="panNumber" label="PAN Number" placeholder="PAN number" methods={methods} />
                  <ImageUpload
                    label="Aadhaar Front"
                    file={values.aadhaarFront}
                    existingUrl={existingUrls.aadhaarFront}
                    onChange={(file) => setFile("aadhaarFront", file)}
                  />
                  <ImageUpload
                    label="Aadhaar Back"
                    file={values.aadhaarBack}
                    existingUrl={existingUrls.aadhaarBack}
                    onChange={(file) => setFile("aadhaarBack", file)}
                  />
                  <ImageUpload
                    label="PAN Card"
                    file={values.panCard}
                    existingUrl={existingUrls.panCard}
                    onChange={(file) => setFile("panCard", file)}
                  />
                  <ImageUpload
                    label="Owner Photo"
                    file={values.ownerPhoto}
                    existingUrl={existingUrls.ownerPhoto}
                    onChange={(file) => setFile("ownerPhoto", file)}
                  />
                  <div className="lg:col-span-2">
                    <VideoUpload
                      label="Video Verification"
                      file={values.videoVerification}
                      existingUrl={existingUrls.videoVerification}
                      onChange={(file) => setFile("videoVerification", file)}
                    />
                    {methods.formState.errors.videoVerification && (
                      <p className="mt-1 text-xs text-red-500">
                        {methods.formState.errors.videoVerification.message}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {step === 4 && (
                <div className="grid gap-6 lg:grid-cols-2">
                  <Field name="accountHolderName" label="Account Holder Name" placeholder="As per bank" methods={methods} />
                  <Field name="bankName" label="Bank Name" placeholder="Bank name" methods={methods} />
                  <Field name="accountNumber" label="Account Number" placeholder="Account number" methods={methods} />
                  <Field name="ifscCode" label="IFSC Code" placeholder="IFSC code" methods={methods} />
                  <ImageUpload
                    label="Passbook Image"
                    file={values.passbookImage}
                    existingUrl={existingUrls.passbookImage}
                    onChange={(file) => setFile("passbookImage", file)}
                  />
                  <ImageUpload
                    label="Cancelled Cheque"
                    file={values.cancelledChequeImage}
                    existingUrl={existingUrls.cancelledChequeImage}
                    onChange={(file) => setFile("cancelledChequeImage", file)}
                    enableCrop={false}
                  />
                </div>
              )}

              {step === 5 && (
                <div className="space-y-4">
                  <PreviewSection
                    title="Personal Details"
                    items={[
                      ["Name", `${values.firstName} ${values.lastName}`],
                      ["Email", values.email],
                      ["Mobile", values.mobile],
                      ["Alternate Mobile", values.alternateMobileNumber],
                    ]}
                  />
                  <PreviewSection
                    title="Outlet Information"
                    items={[
                      ["Outlet", values.outletName],
                      ["Business Type", getBusinessTypeLabel(values.businessType)],
                      ["GST", values.gstNumber],
                      ["Address", values.address],
                      ["City", `${values.city}, ${values.district}, ${values.state}`],
                      ["Pincode", values.pincode],
                    ]}
                  />
                  <PreviewSection
                    title="KYC"
                    items={[
                      ["Aadhaar", values.aadhaarNumber],
                      ["PAN", values.panNumber],
                    ]}
                  />
                  <PreviewSection
                    title="Bank"
                    items={[
                      ["Account Holder", values.accountHolderName],
                      ["Bank", values.bankName],
                      ["Account Number", values.accountNumber],
                      ["IFSC", values.ifscCode],
                    ]}
                  />
                </div>
              )}

              <div className="flex flex-wrap justify-between gap-3 border-t border-slate-100 pt-4 dark:border-slate-800">
                <Button type="button" variant="outline" onClick={goBack} disabled={step === 1}>
                  <ChevronLeft className="h-4 w-4" />
                  Back
                </Button>
                {step < 5 ? (
                  <Button type="submit">
                    Next
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                ) : (
                  <Button type="submit" disabled={actionLoading}>
                    {actionLoading
                      ? "Submitting..."
                      : isEdit
                        ? "Update User"
                        : `Create ${userType === "RETAILER" ? "Retailer" : "Distributor"}`}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </form>
      </FormProvider>

      {!isEdit && (
        <SuccessModal
          open={successOpen}
          onOpenChange={(open) => {
            setSuccessOpen(open);
            if (!open) router.push(successRedirect);
          }}
          title="User Created!"
          message="The user has been onboarded successfully."
        />
      )}
    </div>
  );
}

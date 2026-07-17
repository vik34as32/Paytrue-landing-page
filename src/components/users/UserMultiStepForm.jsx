"use client";

import { useMemo, useState, useCallback } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import { Users, ChevronLeft, ChevronRight, Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import PageHeader from "@/src/components/common/PageHeader";
import SuccessModal from "@/src/components/common/SuccessModal";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  getPersonalStepSchema,
  outletStepSchema,
  bankStepSchema,
  getKycStepSchema,
  formatDateDisplay,
} from "@/src/validation/schemas";
import {
  buildUserFormData,
  buildUserJsonBody,
  mapApiUserToFormValues,
  mapApiUserToExistingUrls,
} from "@/src/lib/buildUserFormData";
import { USER_FILE_FIELDS } from "@/src/constants/uploadConfig";
import { getBusinessTypeLabel } from "@/src/constants/businessTypes";
import { getGenderLabel } from "@/src/constants/indianStates";
import { generateSecurePassword } from "@/src/lib/passwordUtils";
import { useUserFormDraft } from "@/src/hooks/useUserFormDraft";
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
import {
  StepIndicator,
  PersonalDetailsStep,
  OutletInformationStep,
  KycStep,
  BankDetailsStep,
  PreviewSection,
} from "@/src/components/users/UserFormSteps";

const FILE_FIELD_KEYS = Object.keys(USER_FILE_FIELDS);

const emptyDefaults = {
  firstName: "",
  lastName: "",
  fullName: "",
  email: "",
  emailVerified: false,
  mobileVerified: false,
  mobile: "",
  password: "",
  alternateMobileNumber: "",
  gender: "",
  dateOfBirth: "",
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
  confirmAccountNumber: "",
  ifscCode: "",
  passbookImage: null,
  cancelledChequeImage: null,
};

function extractFiles(values) {
  const files = {};
  FILE_FIELD_KEYS.forEach((key) => {
    if (values[key] instanceof File) {
      files[key] = values[key];
    }
  });
  return files;
}

function scrollToFirstError(paths) {
  if (!paths?.length) return;
  setTimeout(() => {
    const el =
      document.querySelector(`[data-field="${paths[0]}"]`) ||
      document.getElementsByName(paths[0])?.[0];
    el?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, 80);
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
  lockIdentityFields = false,
  forceCurrentLocation = false,
  hidePassword = false,
}) {
  const dispatch = useDispatch();
  const router = useRouter();
  const isEdit = mode === "edit";
  const identityLocked =
    lockIdentityFields || (isEdit && userType === "RETAILER");
  const distributorLoading = useSelector(selectDistributorActionLoading);
  const retailerLoading = useSelector(selectRetailerActionLoading);
  const actionLoading =
    userType === "DISTRIBUTOR" ? distributorLoading : retailerLoading;

  const steps = useMemo(
    () => [
      { id: 1, title: "Personal Details", schema: getPersonalStepSchema(userType) },
      { id: 2, title: "Outlet Information", schema: outletStepSchema },
      { id: 3, title: "KYC", schema: getKycStepSchema(userType) },
      { id: 4, title: "Bank Details", schema: bankStepSchema },
      { id: 5, title: "Preview & Submit", schema: null },
    ],
    [userType]
  );

  const existingUrls = useMemo(
    () => (initialUser ? mapApiUserToExistingUrls(initialUser) : {}),
    [initialUser]
  );

  const defaultValues = useMemo(() => {
    if (initialUser) {
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
    }
    return {
      ...emptyDefaults,
      password: generateSecurePassword(),
    };
  }, [initialUser]);

  const [step, setStep] = useState(1);
  const [successOpen, setSuccessOpen] = useState(false);
  const [clearDraftOpen, setClearDraftOpen] = useState(false);
  const [outletCityOptions, setOutletCityOptions] = useState([]);

  const methods = useForm({
    defaultValues,
    mode: "onBlur",
  });

  const { watch, setValue, setError, clearErrors, getValues, reset } = methods;
  const password = watch("password");
  const values = watch();

  const { clearDraft } = useUserFormDraft({
    userType,
    mode,
    watch,
    reset,
    getValues,
    step,
    setStep,
    enabled: !isEdit,
  });

  const requestClearSavedData = useCallback(() => {
    if (isEdit || actionLoading) return;
    setClearDraftOpen(true);
  }, [actionLoading, isEdit]);

  const confirmClearSavedData = useCallback(() => {
    clearDraft();
    clearErrors();
    reset({
      ...emptyDefaults,
      password: generateSecurePassword(),
    });
    setStep(1);
    setOutletCityOptions([]);
    window.setTimeout(() => clearDraft(), 500);
    setClearDraftOpen(false);
    toast.success("Saved form data removed from local storage.");
  }, [clearDraft, clearErrors, reset]);

  const validationContext = {
    isEdit,
    existingUrls,
    originalEmail: initialUser?.email || "",
    originalMobile: initialUser?.mobile || "",
  };

  const goNext = async () => {
    const currentSchema = steps[step - 1]?.schema;
    // Always clear previous step errors so a fixed upload/field can proceed.
    clearErrors();
    if (currentSchema) {
      try {
        await currentSchema.validate(getValues(), {
          abortEarly: false,
          context: validationContext,
        });
      } catch (err) {
        if (err.inner) {
          const paths = [];
          err.inner.forEach((e) => {
            if (e.path) {
              setError(e.path, { type: "manual", message: e.message });
              paths.push(e.path);
            }
          });
          scrollToFirstError(paths);
        }
        toast.error("Please fix validation errors before continuing");
        return;
      }
    }
    setStep((current) => Math.min(current + 1, steps.length));
  };

  const goBack = () => setStep((current) => Math.max(current - 1, 1));

  const onSubmit = async () => {
    const data = getValues();
    const errorPaths = [];
    clearErrors();

    for (const stepDef of steps.slice(0, 4)) {
      if (!stepDef.schema) continue;
      try {
        await stepDef.schema.validate(data, {
          abortEarly: false,
          context: validationContext,
        });
      } catch (err) {
        if (err.inner) {
          err.inner.forEach((e) => {
            if (e.path) {
              setError(e.path, { type: "manual", message: e.message });
              errorPaths.push(e.path);
            }
          });
        }
        scrollToFirstError(errorPaths);
        toast.error("Please fix validation errors before submitting");
        return;
      }
    }

    const files = extractFiles(data);
    const hasNewFiles = Object.keys(files).length > 0;
    const payloadOptions = {
      userType,
      includePassword: !isEdit || Boolean(data.password),
    };

    // PUT /users/:id validates body as a JSON object.
    // Multipart FormData fails with: { field: "body", message: "must be object" }.
    const payload = isEdit
      ? buildUserJsonBody(data, payloadOptions)
      : buildUserFormData(data, files, payloadOptions);

    try {
      if (isEdit && userId) {
        if (hasNewFiles) {
          toast.message(
            "Details will be saved. New document files are skipped on update (API expects JSON)."
          );
        }
        if (userType === "DISTRIBUTOR") {
          await dispatch(updateDistributor({ id: userId, formData: payload })).unwrap();
        } else {
          await dispatch(updateRetailer({ id: userId, formData: payload })).unwrap();
        }
        clearDraft();
        toast.success("Updated successfully");
        router.push(successRedirect);
        return;
      }

      if (userType === "DISTRIBUTOR") {
        await dispatch(createDistributor(payload)).unwrap();
      } else {
        await dispatch(createRetailer(payload)).unwrap();
      }

      clearDraft();
      toast.success("Created successfully");
      setSuccessOpen(true);
    } catch (err) {
      toast.error(typeof err === "string" ? err : "Submission failed");
    }
  };

  const setFile = useCallback(
    (field, file) => {
      // Clear stuck manual errors from a previous Next-click validation failure.
      clearErrors(field);
      setValue(field, file, {
        shouldDirty: true,
        shouldTouch: true,
        shouldValidate: false,
      });
    },
    [clearErrors, setValue]
  );

  const jumpToStep = (targetStep) => setStep(targetStep);

  return (
    <div className="space-y-6">
      <PageHeader
        title={title}
        description={description}
        icon={Icon}
        backHref={backHref}
        actions={
          !isEdit ? (
            <Button
              type="button"
              variant="outline"
              className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
              onClick={requestClearSavedData}
              disabled={actionLoading}
            >
              <Trash2 className="h-4 w-4" />
              Clear Saved Data
            </Button>
          ) : null
        }
      />

      <StepIndicator steps={steps} currentStep={step} />

      <FormProvider {...methods}>
        <form
          onSubmit={(event) => {
            event.preventDefault();
            if (step === 5) {
              void onSubmit();
            } else {
              void goNext();
            }
          }}
        >
          <Card>
            <CardHeader>
              <CardTitle>{steps[step - 1].title}</CardTitle>
              <CardDescription>
                Step {step} of {steps.length}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {step === 1 && (
                <PersonalDetailsStep
                  methods={methods}
                  isEdit={isEdit}
                  password={password}
                  existingUrls={existingUrls}
                  setFile={setFile}
                  values={values}
                  originalEmail={initialUser?.email || ""}
                  originalMobile={initialUser?.mobile || ""}
                  userType={userType}
                  lockIdentityFields={identityLocked}
                  hidePassword={hidePassword}
                />
              )}

              {step === 2 && (
                <OutletInformationStep
                  methods={methods}
                  outletCityOptions={outletCityOptions}
                  setOutletCityOptions={setOutletCityOptions}
                  values={values}
                  setValue={setValue}
                  lockIdentityFields={identityLocked}
                  forceCurrentLocation={forceCurrentLocation}
                />
              )}

              {step === 3 && (
                <KycStep
                  methods={methods}
                  userType={userType}
                  values={values}
                  existingUrls={existingUrls}
                  setFile={setFile}
                  lockIdentityFields={identityLocked}
                />
              )}

              {step === 4 && (
                <BankDetailsStep
                  methods={methods}
                  values={values}
                  existingUrls={existingUrls}
                  setFile={setFile}
                />
              )}

              {step === 5 && (
                <div className="space-y-4">
                  <PreviewSection
                    title="Personal Details"
                    onEdit={() => jumpToStep(1)}
                    items={[
                      [
                        "Name",
                        userType === "RETAILER"
                          ? values.fullName
                          : `${values.firstName} ${values.lastName}`,
                      ],
                      ["Email", values.emailVerified ? `${values.email} (Verified)` : values.email],
                      ["Mobile", values.mobileVerified ? `${values.mobile} (Verified)` : values.mobile],
                      ["Gender", getGenderLabel(values.gender)],
                      ["Date of Birth", formatDateDisplay(values.dateOfBirth)],
                    ]}
                  />
                  <PreviewSection
                    title="Outlet Information"
                    onEdit={() => jumpToStep(2)}
                    items={[
                      ["Outlet", values.outletName],
                      ["Business Type", getBusinessTypeLabel(values.businessType)],
                      ["GST", values.gstNumber],
                      ["Address", values.address],
                      ["City", values.city],
                      ["State", values.state],
                      ["Pincode", values.pincode],
                      ["Latitude", values.latitude],
                      ["Longitude", values.longitude],
                    ]}
                  />
                  <PreviewSection
                    title="KYC"
                    onEdit={() => jumpToStep(3)}
                    items={[
                      ...(userType === "RETAILER"
                        ? [["Aadhaar", values.aadhaarNumber]]
                        : []),
                      ["PAN", values.panNumber],
                    ]}
                  />
                  <PreviewSection
                    title="Bank Details"
                    onEdit={() => jumpToStep(4)}
                    items={[
                      ["Account Holder", values.accountHolderName],
                      ["Bank", values.bankName],
                      ["Account Number", values.accountNumber],
                      ["IFSC", values.ifscCode],
                    ]}
                  />
                </div>
              )}

              <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4 dark:border-slate-800">
                <div className="flex flex-wrap gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={goBack}
                    disabled={step === 1 || actionLoading}
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Previous
                  </Button>
                  {!isEdit ? (
                    <Button
                      type="button"
                      variant="ghost"
                      className="text-red-600 hover:bg-red-50 hover:text-red-700"
                      onClick={requestClearSavedData}
                      disabled={actionLoading}
                    >
                      <Trash2 className="h-4 w-4" />
                      Clear Saved Data
                    </Button>
                  ) : null}
                </div>
                {step < 5 ? (
                  <Button type="submit" disabled={actionLoading}>
                    Next
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                ) : (
                  <Button type="submit" disabled={actionLoading}>
                    {actionLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Submitting...
                      </>
                    ) : isEdit ? (
                      "Update User"
                    ) : (
                      `Create ${userType === "RETAILER" ? "Retailer" : "Distributor"}`
                    )}
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

      <Dialog open={clearDraftOpen} onOpenChange={setClearDraftOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Clear saved form data?</DialogTitle>
            <DialogDescription>
              This will remove all local storage draft data for this form. This
              cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setClearDraftOpen(false)}
            >
              No
            </Button>
            <Button
              type="button"
              className="bg-red-600 hover:bg-red-700"
              onClick={confirmClearSavedData}
            >
              Yes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

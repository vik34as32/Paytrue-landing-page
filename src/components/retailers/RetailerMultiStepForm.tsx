"use client";

import { Store } from "lucide-react";
import UserMultiStepForm from "@/src/components/users/UserMultiStepForm";

export interface RetailerMultiStepFormProps {
  mode?: "create" | "edit" | string;
  userId?: string | null;
  initialUser?: Record<string, unknown> | null;
  title?: string;
  description?: string;
  backHref?: string;
  successRedirect?: string;
  lockIdentityFields?: boolean;
  forceCurrentLocation?: boolean;
  hidePassword?: boolean;
}

export default function RetailerMultiStepForm({
  mode = "create",
  userId = null,
  initialUser = null,
  title,
  description,
  backHref = "/dd/retailers/list",
  successRedirect = "/dd/retailers/list",
  lockIdentityFields,
  forceCurrentLocation = false,
  hidePassword = false,
}: RetailerMultiStepFormProps) {
  const isEdit = mode === "edit";

  return (
    <UserMultiStepForm
      userType="RETAILER"
      mode={mode}
      userId={userId}
      initialUser={initialUser}
      title={title || (isEdit ? "Edit Retailer" : "Create Retailer")}
      description={
        description ||
        (isEdit
          ? "Update retailer information and documents"
          : "Complete the multi-step form to onboard a new retailer")
      }
      backHref={backHref}
      successRedirect={successRedirect}
      icon={Store}
      lockIdentityFields={lockIdentityFields ?? isEdit}
      forceCurrentLocation={forceCurrentLocation}
      hidePassword={hidePassword}
    />
  );
}

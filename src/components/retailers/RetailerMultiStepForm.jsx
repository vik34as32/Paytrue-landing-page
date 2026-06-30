"use client";

import { Store } from "lucide-react";
import UserMultiStepForm from "@/src/components/users/UserMultiStepForm";

export default function RetailerMultiStepForm({
  mode = "create",
  userId = null,
  initialUser = null,
}) {
  const isEdit = mode === "edit";

  return (
    <UserMultiStepForm
      userType="RETAILER"
      mode={mode}
      userId={userId}
      initialUser={initialUser}
      title={isEdit ? "Edit Retailer" : "Create Retailer"}
      description={
        isEdit
          ? "Update retailer information and documents"
          : "Complete the multi-step form to onboard a new retailer"
      }
      backHref="/dd/retailers/list"
      successRedirect="/dd/retailers/list"
      icon={Store}
    />
  );
}

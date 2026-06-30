"use client";

import { Users } from "lucide-react";
import UserMultiStepForm from "@/src/components/users/UserMultiStepForm";

export default function DistributorMultiStepForm({
  mode = "create",
  userId = null,
  initialUser = null,
}) {
  const isEdit = mode === "edit";

  return (
    <UserMultiStepForm
      userType="DISTRIBUTOR"
      mode={mode}
      userId={userId}
      initialUser={initialUser}
      title={isEdit ? "Edit Distributor" : "Create Distributor"}
      description={
        isEdit
          ? "Update distributor information and documents"
          : "Complete the multi-step form to onboard a new distributor"
      }
      backHref="/md/distributors/list"
      successRedirect="/md/distributors/list"
      icon={Users}
    />
  );
}

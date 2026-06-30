"use client";

import DistributorMultiStepForm from "@/src/components/distributors/DistributorMultiStepForm";

export default function DistributorFormPage({ mode = "create", distributor = null }) {
  return (
    <DistributorMultiStepForm
      mode={mode}
      userId={distributor?.id}
      initialUser={distributor?.raw || distributor}
    />
  );
}

"use client";

import RetailerMultiStepForm from "@/src/components/retailers/RetailerMultiStepForm";

export default function RetailerFormPage({ mode = "create", retailer = null }) {
  return (
    <RetailerMultiStepForm
      mode={mode}
      userId={retailer?.id}
      initialUser={retailer?.raw || retailer}
    />
  );
}

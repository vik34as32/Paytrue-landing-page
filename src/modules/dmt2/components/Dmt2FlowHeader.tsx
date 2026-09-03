"use client";

import Dmt2Stepper from "./Dmt2Stepper";

export default function Dmt2FlowHeader({
  title = "Domestic Money Transfer",
  description = "Search retailer, manage beneficiaries, and transfer money securely.",
  activeStep,
}: {
  title?: string;
  description?: string;
  activeStep: number;
}) {
  return (
    <div className="rounded-2xl border border-indigo-100 bg-white p-4 sm:p-6">
      <h1 className="text-2xl font-extrabold text-indigo-950">{title}</h1>
      <p className="mt-1 text-sm text-slate-500">{description}</p>
      <div className="mt-4">
        <Dmt2Stepper activeStep={activeStep} />
      </div>
    </div>
  );
}

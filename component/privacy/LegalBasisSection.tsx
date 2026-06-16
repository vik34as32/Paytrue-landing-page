import { Scale } from "lucide-react";

export default function LegalBasisSection() {
  return (
    <div
      id="legal"
      className="mb-8 rounded-3xl border bg-white p-8 shadow-sm hover:shadow-lg transition"
    >
      <div className="mb-4 flex items-center gap-3 text-gray-600">
        <Scale className="text-blue-600" />
        <h2 className="text-2xl font-bold">
          4. Legal Basis for Processing
        </h2>
      </div>

      <p className="text-slate-600 mb-4">
        We process personal information based on:
      </p>

      <div className="grid md:grid-cols-2 gap-4">
        {[
          "User Consent",
          "Contractual Necessity",
          "Compliance with Legal Obligations",
          "Legitimate Business Interests",
          "Fraud Prevention and Security Requirements",
        ].map((item) => (
          <div
            key={item}
            className="rounded-2xl bg-blue-50 p-4 font-medium text-gray-500"
          >
            {item}
          </div>
        ))}
      </div>
    </div>
  );
}
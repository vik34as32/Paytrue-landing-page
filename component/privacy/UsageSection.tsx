import { FileCheck } from "lucide-react";

export default function UsageSection() {
  return (
    <div
      id="usage"
      className="mb-8 rounded-3xl border bg-white p-8 shadow-sm hover:shadow-lg transition"
    >
      <div className="mb-4 flex items-center gap-3 text-gray-600">
        <FileCheck className="text-blue-600" />
        <h2 className="text-2xl font-bold">
          3. How We Use Your Information
        </h2>
      </div>

      <p className="mb-4 text-slate-600">
        We use your information for:
      </p>

      <ul className="list-disc pl-6 space-y-3 text-slate-600 leading-7">
        <li>Providing and maintaining our Services</li>
        <li>Identity verification and KYC compliance</li>
        <li>AML (Anti-Money Laundering) compliance</li>
        <li>Processing transactions</li>
        <li>Fraud detection and prevention</li>
        <li>Risk assessment</li>
        <li>Customer support</li>
        <li>Improving platform performance</li>
        <li>Regulatory and legal compliance</li>
        <li>Internal reporting and auditing</li>
      </ul>
    </div>
  );
}
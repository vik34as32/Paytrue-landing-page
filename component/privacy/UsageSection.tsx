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

      <ul className="list-disc pl-6 space-y-3 text-slate-600 leading-7">
        <li>Providing and maintaining our Services</li>
        <li>Identity Verification (KYC / AML Compliance)</li>
        <li>Processing Transactions</li>
        <li>Fraud Detection and Prevention</li>
        <li>Risk Assessment and Credit Scoring</li>
        <li>Customer Support</li>
        <li>Improving Our Platform</li>
        <li>Legal and Regulatory Compliance</li>
      </ul>
    </div>
  );
}
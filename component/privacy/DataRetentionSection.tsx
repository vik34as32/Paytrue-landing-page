import { Database } from "lucide-react";

export default function DataRetentionSection() {
  return (
    <div
      id="retention"
      className="mb-8 rounded-3xl border bg-white p-8 shadow-sm hover:shadow-lg transition"
    >
      <div className="mb-4 flex items-center gap-3 text-gray-600">
        <Database className="text-blue-600" />
        <h2 className="text-2xl font-bold">
          6. Data Retention
        </h2>
      </div>

      <p className="text-slate-600 mb-4">
        We retain your information only as long as necessary for:
      </p>

      <ul className="list-disc pl-6 space-y-2 text-slate-600">
        <li>Providing Services</li>
        <li>Legal and Regulatory Compliance</li>
        <li>Dispute Resolution</li>
      </ul>
    </div>
  );
}
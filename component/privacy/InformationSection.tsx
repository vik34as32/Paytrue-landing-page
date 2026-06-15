import { Database } from "lucide-react";

export default function InformationSection() {
  return (
    <div
      id="information"
      className="mb-8 rounded-3xl border bg-white p-8 shadow-sm"
    >
      <div className="mb-4 flex items-center gap-3">
        <Database className="text-blue-600" />
        <h2 className="text-2xl font-bold text-gray-600">
          2. Information We Collect
        </h2>
      </div>

      <ul className="list-disc pl-6 space-y-2 text-slate-600">
        <li>Full Name</li>
        <li>Date of Birth</li>
        <li>PAN / Aadhaar</li>
        <li>Email Address</li>
        <li>Phone Number</li>
      </ul>
    </div>
  );
}
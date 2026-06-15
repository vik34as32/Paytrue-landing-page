import { Lock } from "lucide-react";

export default function SharingSection() {
  return (
    <div
      id="sharing"
      className="mb-8 rounded-3xl border bg-white p-8 shadow-sm hover:shadow-lg transition"
    >
      <div className="mb-4 flex items-center gap-3 text-gray-600">
        <Lock className="text-blue-600" />
        <h2 className="text-2xl font-bold">
          5. Sharing Your Information
        </h2>
      </div>

      <div className="space-y-6">

        <div>
          <h3 className="font-semibold text-lg text-gray-400">
            5.1 Service Providers
          </h3>

          <ul className="list-disc pl-6 mt-2 text-slate-600 ">
            <li>Payment Processors</li>
            <li>Cloud Storage Providers</li>
            <li>Analytics Partners</li>
          </ul>
        </div>

        <div>
          <h3 className="font-semibold text-lg text-gray-400">
            5.2 Regulatory Authorities
          </h3>

          <ul className="list-disc pl-6 mt-2 text-slate-600">
            <li>Government Agencies</li>
            <li>Law Enforcement (When Required)</li>
          </ul>
        </div>

        <div>
          <h3 className="font-semibold text-lg text-gray-400">
            5.3 Business Transfers
          </h3>

          <p className="text-slate-600 mt-2">
            In case of merger, acquisition or asset sale.
          </p>
        </div>

      </div>
    </div>
  );
}
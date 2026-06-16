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
        {/* 5.1 Service Providers */}
        <div>
          <h3 className="font-semibold text-lg text-gray-400">
            5.1 Service Providers
          </h3>

          <p className="mt-2 text-slate-600">
            We may share information with:
          </p>

          <ul className="list-disc pl-6 mt-2 space-y-2 text-slate-600">
            <li>Payment Processing Partners</li>
            <li>Banking Partners</li>
            <li>Cloud Hosting Providers</li>
            <li>Technology Service Providers</li>
            <li>Analytics Providers</li>
          </ul>
        </div>

        {/* 5.2 Regulatory Authorities */}
        <div>
          <h3 className="font-semibold text-lg text-gray-400">
            5.2 Regulatory Authorities
          </h3>

          <p className="mt-2 text-slate-600">
            We may disclose information to:
          </p>

          <ul className="list-disc pl-6 mt-2 space-y-2 text-slate-600">
            <li>Government Agencies</li>
            <li>Regulatory Bodies</li>
            <li>Law Enforcement Authorities</li>
            <li>Courts and Judicial Authorities</li>
          </ul>
        </div>

        {/* 5.3 Business Transfers */}
        <div>
          <h3 className="font-semibold text-lg text-gray-400">
            5.3 Business Transfers
          </h3>

          <p className="mt-2 text-slate-600">
            Information may be transferred during:
          </p>

          <ul className="list-disc pl-6 mt-2 space-y-2 text-slate-600">
            <li>Merger</li>
            <li>Acquisition</li>
            <li>Restructuring</li>
            <li>Asset Sale</li>
            <li>Business Reorganization</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
import { Database } from "lucide-react";

export default function InformationSection() {
  return (
    <div
      id="information"
      className="mb-8 rounded-3xl border bg-white p-8 shadow-sm"
    >
      <div className="mb-6 flex items-center gap-3">
        <Database className="text-blue-600" />
        <h2 className="text-2xl font-bold text-gray-600">
          2. Information We Collect
        </h2>
      </div>

      {/* 2.1 Personal Information */}
      <div className="mb-6">
        <h3 className="mb-3 text-xl font-semibold text-gray-700">
          2.1 Personal Information
        </h3>
        <p className="mb-2 text-slate-600">We may collect:</p>
        <ul className="list-disc space-y-2 pl-6 text-slate-600">
          <li>Full Name</li>
          <li>Date of Birth</li>
          <li>
            Government-issued ID (PAN, Aadhaar, Passport, Driving License,
            Voter ID, etc.)
          </li>
          <li>
            Contact Details (Email Address, Mobile Number, Residential Address)
          </li>
          <li>
            Financial Information (Bank Account Details, IFSC Code,
            Transaction History)
          </li>
        </ul>
      </div>

      {/* 2.2 Sensitive Personal Data */}
      <div className="mb-6">
        <h3 className="mb-3 text-xl font-semibold text-gray-700">
          2.2 Sensitive Personal Data
        </h3>
        <p className="mb-2 text-slate-600">We may collect:</p>
        <ul className="list-disc space-y-2 pl-6 text-slate-600">
          <li>Biometric Data (where legally required)</li>
          <li>KYC Documents</li>
          <li>Financial and Credit-related Information</li>
          <li>Identity Verification Information</li>
        </ul>
      </div>

      {/* 2.3 Technical Data */}
      <div className="mb-6">
        <h3 className="mb-3 text-xl font-semibold text-gray-700">
          2.3 Technical Data
        </h3>
        <p className="mb-2 text-slate-600">We may collect:</p>
        <ul className="list-disc space-y-2 pl-6 text-slate-600">
          <li>IP Address</li>
          <li>Device Information</li>
          <li>Browser Type and Version</li>
          <li>Operating System</li>
          <li>App Usage Information</li>
          <li>Login Activity</li>
        </ul>
      </div>

      {/* 2.4 Transaction Data */}
      <div>
        <h3 className="mb-3 text-xl font-semibold text-gray-700">
          2.4 Transaction Data
        </h3>
        <p className="mb-2 text-slate-600">We may collect:</p>
        <ul className="list-disc space-y-2 pl-6 text-slate-600">
          <li>Payment Details</li>
          <li>Account Activity</li>
          <li>Merchant Information</li>
          <li>Transaction Records</li>
          <li>Wallet and Settlement Information</li>
        </ul>
      </div>
    </div>
  );
}
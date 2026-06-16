import { ShieldCheck } from "lucide-react";

export default function DataSecuritySection() {
  return (
    <div
      id="security"
      className="mb-8 rounded-3xl border bg-white p-8 shadow-sm hover:shadow-lg transition"
    >
      <div className="mb-4 flex items-center gap-3 text-gray-600">
        <ShieldCheck className="text-green-600" />
        <h2 className="text-2xl font-bold">
          7. Data Security
        </h2>
      </div>

      <p className="mb-4 text-slate-600">
        We implement industry-standard security measures including:
      </p>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="rounded-2xl bg-green-50 p-5 text-gray-400">
          SSL/TLS Encryption
        </div>

        <div className="rounded-2xl bg-green-50 p-5 text-gray-400">
          Secure Infrastructure
        </div>

        <div className="rounded-2xl bg-green-50 p-5 text-gray-400">
          Access Controls
        </div>

        <div className="rounded-2xl bg-green-50 p-5 text-gray-400">
          Multi-level Authentication
        </div>

        <div className="rounded-2xl bg-green-50 p-5 text-gray-400">
          Continuous Monitoring
        </div>

        <div className="rounded-2xl bg-green-50 p-5 text-gray-400">
          Security Audits
        </div>
      </div>

      <p className="mt-5 text-slate-600">
        Despite our efforts, no transmission method over the Internet is completely secure.
      </p>
    </div>
  );
}
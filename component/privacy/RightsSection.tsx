import { ShieldCheck } from "lucide-react";

export default function RightsSection() {
  return (
    <div
      id="rights"
      className="mb-8 rounded-3xl border bg-white p-8 shadow-sm hover:shadow-lg transition"
    >
      <div className="mb-4 flex items-center gap-3 text-gray-600">
        <ShieldCheck className="text-blue-600" />
        <h2 className="text-2xl font-bold">
          8. Your Rights
        </h2>
      </div>

      <p className="mb-4 text-slate-600">
        Subject to applicable laws, you may have the right to:
      </p>

      <div className="grid md:grid-cols-2 gap-4">
        {[
          "Access Personal Data",
          "Correct Inaccurate Information",
          "Request Deletion of Data",
          "Restrict Processing",
          "Withdraw Consent",
          "Request Data Portability",
          "Raise Complaints Regarding Data Usage",
        ].map((item) => (
          <div
            key={item}
            className="rounded-2xl bg-blue-50 p-5 font-medium text-gray-400"
          >
            {item}
          </div>
        ))}
      </div>

      <p className="mt-5 text-slate-600">
        To exercise these rights, contact us at:
      </p>

      <p className="mt-2 font-semibold text-blue-600">
        Email: care@paytrue.co.in
      </p>
    </div>
  );
}
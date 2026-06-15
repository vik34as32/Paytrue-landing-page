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

      <div className="grid md:grid-cols-2 gap-4">

        {[
          "Access Your Data",
          "Correct Information",
          "Request Deletion",
          "Restrict Processing",
          "Withdraw Consent",
          "Data Portability",
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
        To exercise your rights contact:
        <span className="font-semibold text-blue-600">
          {" "}support@paytrue.in
        </span>
      </p>
    </div>
  );
}
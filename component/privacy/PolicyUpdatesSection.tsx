import { Calendar } from "lucide-react";

export default function PolicyUpdatesSection() {
  return (
    <div
      id="updates"
      className="mb-8 rounded-3xl border bg-white p-8 shadow-sm hover:shadow-lg transition"
    >
      <div className="mb-4 flex items-center gap-3">
        <Calendar className="text-purple-600" />
        <h2 className="text-2xl font-bold text-gray-600">
          10. Updates to This Policy
        </h2>
      </div>

      <p className="leading-8 text-slate-600">
        We may update this Privacy Policy periodically.
        Changes will be posted on this page along with
        a revised "Last Updated" date.
      </p>
    </div>
  );
}
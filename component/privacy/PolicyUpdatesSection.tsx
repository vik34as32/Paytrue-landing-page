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
        We may update this Privacy Policy from time to time. Any changes will
        be posted on our website along with the revised{" "}
        <span className="font-medium">"Last Updated"</span> date.
      </p>

      <p className="mt-4 leading-8 text-slate-600">
        Continued use of our Services after such changes constitutes acceptance
        of the updated Privacy Policy.
      </p>
    </div>
  );
}
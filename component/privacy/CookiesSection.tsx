import { Cookie } from "lucide-react";

export default function CookiesSection() {
  return (
    <div
      id="cookies"
      className="mb-8 rounded-3xl border bg-white p-8 shadow-sm hover:shadow-lg transition"
    >
      <div className="mb-4 flex items-center gap-3">
        <Cookie className="text-orange-500" />
        <h2 className="text-2xl font-bold text-gray-600">
          9. Cookies & Tracking Technologies
        </h2>
      </div>

      <p className="text-slate-600 mb-4">
        We use cookies to:
      </p>

      <ul className="list-disc pl-6 space-y-2 text-slate-600">
        <li>Enhance User Experience</li>
        <li>Analyze Usage Patterns</li>
        <li>Improve Services</li>
      </ul>

      <p className="mt-5 text-slate-600">
        You can control cookies through your browser settings.
      </p>
    </div>
  );
}
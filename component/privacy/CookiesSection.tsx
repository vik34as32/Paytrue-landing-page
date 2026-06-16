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
          9. Cookies and Tracking Technologies
        </h2>
      </div>

      <p className="mb-4 text-slate-600">
        We use cookies and similar technologies to:
      </p>

      <ul className="list-disc pl-6 space-y-2 text-slate-600">
        <li>Improve User Experience</li>
        <li>Remember Preferences</li>
        <li>Analyze Platform Usage</li>
        <li>Enhance Security</li>
        <li>Improve Service Performance</li>
      </ul>

      <p className="mt-5 text-slate-600">
        Users can manage cookies through browser settings.
      </p>
    </div>
  );
}
import { Building2, Mail, Phone, Globe, MapPin } from "lucide-react";

export default function ContactUsSection() {
  return (
    <div
      id="contact"
      className="mb-8 rounded-3xl border bg-white p-8 shadow-sm hover:shadow-lg transition"
    >
      <div className="mb-6 flex items-center gap-3">
        <Building2 className="text-blue-600" />
        <h2 className="text-2xl font-bold text-gray-600">
          11. Contact Us
        </h2>
      </div>

      <p className="mb-6 text-slate-600 leading-7">
        If you have any questions regarding this Privacy Policy, please contact:
      </p>

      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-700">
            Goodlinks Services Private Limited
          </h3>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl bg-slate-50 p-4">
            <p className="text-sm text-slate-500">CIN</p>
            <p className="font-medium text-gray-700">
              U70200UW2026PTC250723
            </p>
          </div>

          <div className="rounded-2xl bg-slate-50 p-4">
            <p className="text-sm text-slate-500">PAN</p>
            <p className="font-medium text-gray-700">
              AAMCG9035A
            </p>
          </div>

          <div className="rounded-2xl bg-slate-50 p-4">
            <p className="text-sm text-slate-500">TAN</p>
            <p className="font-medium text-gray-700">
              MRTG18256A
            </p>
          </div>

          <div className="rounded-2xl bg-slate-50 p-4 flex items-center gap-3">
            <Globe className="h-5 w-5 text-blue-600" />
            <div>
              <p className="text-sm text-slate-500">Website</p>
              <a
                href="https://paytrue.co.in"
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-blue-600 hover:underline"
              >
                paytrue.co.in
              </a>
            </div>
          </div>

          <div className="rounded-2xl bg-slate-50 p-4 flex items-center gap-3">
            <Mail className="h-5 w-5 text-blue-600" />
            <div>
              <p className="text-sm text-slate-500">Support Email</p>
              <a
                href="mailto:care@paytrue.co.in"
                className="font-medium text-blue-600 hover:underline"
              >
                care@paytrue.co.in
              </a>
            </div>
          </div>

          <div className="rounded-2xl bg-slate-50 p-4 flex items-center gap-3">
            <Phone className="h-5 w-5 text-blue-600" />
            <div>
              <p className="text-sm text-slate-500">Support Phone</p>
              <a
                href="tel:+919811207438"
                className="font-medium text-blue-600 hover:underline"
              >
                +91 9811207438
              </a>
            </div>
          </div>
        </div>

        <div className="mt-6 rounded-2xl bg-blue-50 p-5">
          <div className="flex items-start gap-3">
            <MapPin className="mt-1 h-5 w-5 text-blue-600" />
            <div>
              <h4 className="font-semibold text-gray-700 mb-2">
                Registered Office Address
              </h4>

              <p className="text-slate-600 leading-7">
                F No GF2, P No B 305 Block B,
                <br />
                New Panchwati Colony, Ghaziabad,
                <br />
                Ghaziabad – 201001,
                <br />
                Uttar Pradesh, India
              </p>
            </div>
          </div>
        </div>

        <div className="border-t pt-6 mt-6">
          <p className="text-center text-sm text-slate-500">
            © 2026 Goodlinks Services Private Limited. All Rights Reserved.
          </p>
        </div>
      </div>
    </div>
  );
}
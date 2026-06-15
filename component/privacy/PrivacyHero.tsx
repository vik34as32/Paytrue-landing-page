import { ShieldCheck, Calendar } from "lucide-react";

export default function PrivacyHero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-[#0A84FF] via-[#0057D9] to-[#001F5B] text-white">

      <div className="absolute top-0 left-0 h-96 w-96 rounded-full bg-cyan-400/20 blur-3xl" />
      <div className="absolute bottom-0 right-0 h-96 w-96 rounded-full bg-blue-400/20 blur-3xl" />

      <div className="relative z-10 mx-auto max-w-7xl px-6 py-24">

        <div className="text-center">

          <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-5 py-2">
            <ShieldCheck size={18} />
            Official Privacy Policy
          </div>

          <h1 className="mt-8 text-5xl font-black md:text-7xl">
            Privacy Policy
          </h1>

          <p className="mx-auto mt-6 max-w-3xl text-blue-100">
            Protecting your privacy and securing your financial
            information is our highest priority.
          </p>

          <div className="mt-8 flex justify-center gap-4 flex-wrap">
            <div className="rounded-xl bg-white/10 px-5 py-3">
              <Calendar size={16} className="inline mr-2" />
              Effective Date: Jan 01, 2026
            </div>

            <div className="rounded-xl bg-white/10 px-5 py-3">
              <Calendar size={16} className="inline mr-2" />
              Last Updated: Jan 01, 2026
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
import { ShieldCheck } from "lucide-react";

export default function IntroductionSection() {
  return (
    <div
      id="introduction"
      className="mb-8 rounded-3xl border bg-white p-8 shadow-sm"
    >
      <div className="mb-4 flex items-center gap-3">
        <ShieldCheck className="text-blue-600" />
        <h2 className="text-2xl font-bold text-gray-600">
          1. Introduction
        </h2>
      </div>

      <p className="leading-8 text-slate-600">
        Goodlinks Services Private Limited ("we," "our," or "us") is committed to protecting your personal data and maintaining your trust. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our financial products and services (DMT, AePS, mATM, BBPS, CMS).
      </p>
      <p className="leading-8 text-slate-600">
        By accessing or using our Services, you agree to this Privacy Policy.
      </p>
    </div>
  );
}
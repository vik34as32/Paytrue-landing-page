"use client";

import {
  ShieldCheck,
  Database,
  Lock,
  FileCheck,
  Cookie,
  Phone,
  Calendar,
} from "lucide-react";
import PrivacyHero from "@/component/privacy/PrivacyHero";
import PrivacySidebar from "@/component/privacy/PrivacySidebar";

import IntroductionSection from "@/component/privacy/IntroductionSection";
import InformationSection from "@/component/privacy/InformationSection";
import UsageSection from "@/component/privacy/UsageSection";
import LegalBasisSection from "@/component/privacy/LegalBasisSection";
import SharingSection from "@/component/privacy/SharingSection";
import DataRetentionSection from "@/component/privacy/DataRetentionSection";
import DataSecuritySection from "@/component/privacy/DataSecuritySection";
import RightsSection from "@/component/privacy/RightsSection";
import CookiesSection from "@/component/privacy/CookiesSection";
import PolicyUpdatesSection from "@/component/privacy/PolicyUpdatesSection";

import Header from "../shared/components/layout/Header";
import PremiumFintechFooter from "../shared/components/layout/Footer";

export default function PrivacyPolicyPage() {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <Header />
      <PrivacyHero/>
       <section className="bg-slate-50 py-16">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">

          <div className="grid gap-10 lg:grid-cols-[320px_1fr]">

            {/* Sidebar */}
            <div className="hidden lg:block">
              <PrivacySidebar />
            </div>

            {/* Main Content */}
            <div>

              <IntroductionSection />

              <InformationSection />

              <UsageSection />

              <LegalBasisSection />

              <SharingSection />

              <DataRetentionSection />

              <DataSecuritySection />

              <RightsSection />

              <CookiesSection />

              <PolicyUpdatesSection />


            </div>

          </div>

        </div>
      </section>

      <PremiumFintechFooter />
    </div>
  );
}
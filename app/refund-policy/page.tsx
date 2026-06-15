"use client";
import {
    RefreshCw,
    Calendar,
    ShieldCheck,
    CreditCard,
    Clock,
    AlertTriangle,
    Phone,
} from "lucide-react";


import Header from "../shared/components/layout/Header";
import PremiumFintechFooter from "../shared/components/layout/Footer";

export default function RefundPolicyPage() {
    const sections = [
        {
            title: "1. Introduction",
            icon: <RefreshCw className="text-blue-600" size={24} />,
            content: (
                <>
                    <p>
                        This Refund Policy (“Policy”) outlines the terms under which
                        PayTrue (“we,” “our,” or “us”) processes refunds for
                        transactions conducted through our financial platform
                        (“Services”).
                    </p>

                    <p className="mt-3">
                        By using our Services, you agree to this Policy.
                    </p>
                </>
            ),
        },

        {
            title: "2. Scope of Refunds",
            icon: <CreditCard className="text-blue-600" size={24} />,
            content: (
                <ul className="list-disc pl-6 space-y-2">
                    <li>Failed or unsuccessful transactions</li>
                    <li>Duplicate payments</li>
                    <li>Unauthorized transactions (subject to verification)</li>
                    <li>Incorrect transaction amounts</li>
                    <li>Service fees (in limited cases)</li>
                </ul>
            ),
        },

        {
            title: "3. Non-Refundable Transactions",
            icon: <AlertTriangle className="text-red-500" size={24} />,
            content: (
                <ul className="list-disc pl-6 space-y-2">
                    <li>Successfully completed payments to third parties</li>
                    <li>Peer-to-peer transfers initiated by the user</li>
                    <li>Completed financial service charges</li>
                    <li>Losses due to incorrect details entered by the user</li>
                </ul>
            ),
        },

        {
            title: "4. Failed or Pending Transactions",
            icon: <Clock className="text-orange-500" size={24} />,
            content: (
                <>
                    <p>
                        If a transaction fails but the amount is debited,
                        the refund will typically be processed automatically.
                    </p>

                    <p className="mt-3">
                        Refund timelines depend on banking partners and may take
                        5–10 business days.
                    </p>
                </>
            ),
        },

        {
            title: "5. Duplicate Transactions",
            icon: <RefreshCw className="text-green-600" size={24} />,
            content: (
                <ul className="list-disc pl-6 space-y-2">
                    <li>Report the issue within 7 days</li>
                    <li>
                        Verified duplicate charges will be refunded to the
                        original payment method
                    </li>
                </ul>
            ),
        },

        {
            title: "6. Unauthorized Transactions",
            icon: <ShieldCheck className="text-green-600" size={24} />,
            content: (
                <ul className="list-disc pl-6 space-y-2">
                    <li>Notify us immediately</li>
                    <li>We may temporarily block your account</li>
                    <li>
                        Refunds will be processed if the claim is verified
                    </li>
                </ul>
            ),
        },

        {
            title: "7. Refund Process",
            icon: <CreditCard className="text-blue-600" size={24} />,
            content: (
                <>
                    <h4 className="font-semibold mb-3">
                        How to Request a Refund
                    </h4>

                    <ul className="list-disc pl-6 space-y-2">
                        <li>Contact Customer Support</li>
                        <li>Submit a request through the Website</li>
                    </ul>

                    <h4 className="font-semibold mt-6 mb-3">
                        Required Information
                    </h4>

                    <ul className="list-disc pl-6 space-y-2">
                        <li>Transaction ID</li>
                        <li>Date and Amount</li>
                        <li>Reason for Refund</li>
                    </ul>
                </>
            ),
        },

        {
            title: "8. Refund Timelines",
            icon: <Clock className="text-purple-600" size={24} />,
            content: (
                <ul className="list-disc pl-6 space-y-2">
                    <li>Wallet Refunds: 1–3 Business Days</li>
                    <li>Bank/Card Refunds: 5–10 Business Days</li>
                    <li>International Transactions: 7–15 Business Days</li>
                </ul>
            ),
        },

        {
            title: "9. Chargebacks",
            icon: <AlertTriangle className="text-orange-500" size={24} />,
            content: (
                <ul className="list-disc pl-6 space-y-2">
                    <li>We reserve the right to investigate claims</li>
                    <li>Your account may be suspended</li>
                    <li>
                        Abuse of chargebacks may result in restrictions
                    </li>
                </ul>
            ),
        },

        {
            title: "10. Service Fees",
            icon: <CreditCard className="text-blue-600" size={24} />,
            content: (
                <ul className="list-disc pl-6 space-y-2">
                    <li>Processing fees are generally non-refundable</li>
                    <li>Refunds may be granted for failed transactions</li>
                    <li>Technical platform errors may qualify</li>
                </ul>
            ),
        },

        {
            title: "11. Third-Party Services",
            icon: <ShieldCheck className="text-blue-600" size={24} />,
            content: (
                <ul className="list-disc pl-6 space-y-2">
                    <li>Refunds are subject to merchant policies</li>
                    <li>We may act only as an intermediary</li>
                </ul>
            ),
        },

        {
            title: "12. Compliance & Regulatory Requirements",
            icon: <ShieldCheck className="text-green-600" size={24} />,
            content: (
                <ul className="list-disc pl-6 space-y-2">
                    <li>Applicable Financial Regulations</li>
                    <li>AML Laws</li>
                    <li>Payment Network Rules</li>
                </ul>
            ),
        },

        {
            title: "13. Changes To This Policy",
            icon: <Calendar className="text-indigo-600" size={24} />,
            content: (
                <p>
                    We may update this Refund Policy from time to time.
                    Updates will be posted with a revised Last Updated date.
                </p>
            ),
        },
    ];

    return (
        <div className="flex flex-col flex-1 items-center justify-center bg-zinc-50 font-sans dark:bg-black">
            <Header />
            <main className="w-full">

                {/* HERO */}

                <section className="relative overflow-hidden bg-gradient-to-br from-[#0A84FF] via-[#0057D9] to-[#001F5B] text-white">

                    <div className="absolute top-0 left-0 h-96 w-96 rounded-full bg-cyan-400/20 blur-3xl" />
                    <div className="absolute bottom-0 right-0 h-96 w-96 rounded-full bg-blue-400/20 blur-3xl" />

                    <div className="relative z-10 mx-auto max-w-7xl px-6 py-24">

                        <div className="text-center">

                            <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-5 py-2 backdrop-blur-md">
                                <RefreshCw size={18} />
                                Official Refund Policy
                            </div>

                            <h1 className="mt-8 text-5xl font-black md:text-7xl">
                                Refund Policy
                            </h1>

                            <p className="mx-auto mt-6 max-w-3xl text-lg text-blue-100">
                                Learn how PayTrue handles refunds, failed
                                transactions, duplicate payments, chargebacks,
                                and refund timelines.
                            </p>

                            <div className="mt-10 flex flex-wrap justify-center gap-4">

                                <div className="rounded-2xl bg-white/10 px-5 py-3 backdrop-blur-md">
                                    Effective Date: Jan 01, 2026
                                </div>

                                <div className="rounded-2xl bg-white/10 px-5 py-3 backdrop-blur-md">
                                    Last Updated: Jan 01, 2026
                                </div>

                            </div>

                        </div>
                    </div>
                </section>
                <section className="mx-auto max-w-7xl px-6 py-20" style={{background:"white"}}>
  <div className="mb-12 text-center">
    <h2 className="text-4xl font-bold text-slate-900">
      Refund Policy Details
    </h2>

    <p className="mt-4 text-slate-600">
      Everything you need to know regarding refunds,
      chargebacks and transaction disputes.
    </p>
  </div>

  <div className="grid gap-8 lg:grid-cols-2">
    {sections.map((section, index) => (
      <div
        key={index}
        className="
          group
          rounded-3xl
          border
          border-slate-200
          bg-white
          p-8
          shadow-md
          transition-all
          duration-300
          hover:-translate-y-1
          hover:border-blue-200
          hover:shadow-2xl
        "
      >
        <div className="mb-5 flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50">
            {section.icon}
          </div>

          <h2 className="text-xl md:text-2xl font-bold text-slate-800">
            {section.title}
          </h2>
        </div>

        <div className="text-[16px] leading-8 text-slate-600">
          {section.content}
        </div>
      </div>
    ))}
  </div>
</section>
            </main>

            <PremiumFintechFooter />
        </div>
    );
}
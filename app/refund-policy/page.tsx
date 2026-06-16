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
                        This Refund Policy ("Policy") outlines the terms under which
                        Goodlinks Services Private Limited processes refunds for
                        transactions conducted through our financial platform and
                        related services including DMT, AePS, mATM, BBPS, and CMS.
                    </p>

                    <p className="mt-3">
                        By using our Services, you agree to this Refund Policy.
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
                    <li>Service fees (in limited cases, as described below)</li>
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
                    <li>
                        Charges for completed financial services, subscriptions, or
                        processing fees unless otherwise stated
                    </li>
                    <li>
                        Losses arising from incorrect information entered by the user
                    </li>
                    <li>
                        Transactions completed successfully through banking or payment
                        networks
                    </li>
                </ul>
            ),
        },

        {
            title: "4. Failed or Pending Transactions",
            icon: <Clock className="text-orange-500" size={24} />,
            content: (
                <>
                    <p>
                        If a transaction fails but the amount is debited from your
                        account, the refund will generally be processed automatically.
                    </p>

                    <p className="mt-3">
                        Refund timelines depend on banking partners and payment service
                        providers and may take 5–10 business days.
                    </p>
                </>
            ),
        },

        {
            title: "5. Duplicate Transactions",
            icon: <RefreshCw className="text-green-600" size={24} />,
            content: (
                <ul className="list-disc pl-6 space-y-2">
                    <li>
                        Report the issue within 7 days of the transaction date.
                    </li>
                    <li>
                        Verified duplicate charges will be refunded to the original
                        payment source.
                    </li>
                </ul>
            ),
        },

        {
            title: "6. Unauthorized Transactions",
            icon: <ShieldCheck className="text-green-600" size={24} />,
            content: (
                <ul className="list-disc pl-6 space-y-2">
                    <li>
                        Notify us immediately at care@paytrue.co.in or +91 9811207438.
                    </li>
                    <li>
                        We may temporarily restrict account access for security
                        purposes.
                    </li>
                    <li>
                        Refunds will be processed only after successful verification
                        and investigation, subject to applicable laws and regulatory
                        requirements.
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
                        7.1 How to Request a Refund
                    </h4>

                    <ul className="list-disc pl-6 space-y-2">
                        <li>Contact Customer Support via email or phone</li>
                        <li>
                            Submit a refund request through our website or application
                            (where available)
                        </li>
                    </ul>

                    <h4 className="font-semibold mt-6 mb-3">
                        Required Information
                    </h4>

                    <ul className="list-disc pl-6 space-y-2">
                        <li>Transaction ID</li>
                        <li>Date and amount of transaction</li>
                        <li>Reason for refund request</li>
                        <li>Supporting documents, if required</li>
                    </ul>

                    <h4 className="font-semibold mt-6 mb-3">
                        7.2 Verification
                    </h4>

                    <ul className="list-disc pl-6 space-y-2">
                        <li>Identity verification</li>
                        <li>Transaction validation</li>
                        <li>Fraud prevention and risk assessment checks</li>
                    </ul>
                </>
            ),
        },

        {
            title: "8. Refund Timelines",
            icon: <Clock className="text-purple-600" size={24} />,
            content: (
                <div className="overflow-x-auto">
                    <table className="w-full border border-slate-200">
                        <thead>
                            <tr className="bg-slate-100">
                                <th className="border p-3 text-left">Refund Type</th>
                                <th className="border p-3 text-left">Timeline</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td className="border p-3">Wallet Refunds</td>
                                <td className="border p-3">1–3 Business Days</td>
                            </tr>
                            <tr>
                                <td className="border p-3">
                                    Bank Account/Card Refunds
                                </td>
                                <td className="border p-3">5–10 Business Days</td>
                            </tr>
                            <tr>
                                <td className="border p-3">
                                    International Transactions
                                </td>
                                <td className="border p-3">7–15 Business Days</td>
                            </tr>
                        </tbody>
                    </table>

                    <p className="mt-4">
                        Delays may occur due to banks, payment gateways, card
                        networks, or regulatory reviews.
                    </p>
                </div>
            ),
        },

        {
            title: "9. Chargebacks",
            icon: <AlertTriangle className="text-orange-500" size={24} />,
            content: (
                <ul className="list-disc pl-6 space-y-2">
                    <li>Investigate the claim</li>
                    <li>Request supporting documentation</li>
                    <li>
                        Suspend or restrict your account during investigation
                    </li>
                    <li>
                        Misuse of chargeback procedures may result in account
                        suspension or termination
                    </li>
                </ul>
            ),
        },

        {
            title: "10. Service Fees",
            icon: <CreditCard className="text-blue-600" size={24} />,
            content: (
                <ul className="list-disc pl-6 space-y-2">
                    <li>
                        Convenience fees, platform fees, and processing charges are
                        generally non-refundable
                    </li>
                    <li>
                        The transaction fails due to a technical issue
                    </li>
                    <li>An error occurs on our platform</li>
                    <li>
                        Refund is required by applicable law or regulatory authority
                    </li>
                </ul>
            ),
        },

        {
            title: "11. Third-Party Services",
            icon: <ShieldCheck className="text-blue-600" size={24} />,
            content: (
                <ul className="list-disc pl-6 space-y-2">
                    <li>
                        Refunds may be subject to third-party merchant, bank, or
                        payment service provider policies and timelines
                    </li>
                    <li>
                        Goodlinks Services Private Limited acts only as an intermediary
                        where applicable
                    </li>
                </ul>
            ),
        },

        {
            title: "12. Compliance & Regulatory Requirements",
            icon: <ShieldCheck className="text-green-600" size={24} />,
            content: (
                <ul className="list-disc pl-6 space-y-2">
                    <li>Applicable laws of India</li>
                    <li>Anti-Money Laundering (AML) regulations</li>
                    <li>RBI guidelines (where applicable)</li>
                    <li>Payment network and banking partner rules</li>
                </ul>
            ),
        },

        {
            title: "13. Changes To This Policy",
            icon: <Calendar className="text-indigo-600" size={24} />,
            content: (
                <p>
                    Goodlinks Services Private Limited reserves the right to modify
                    or update this Refund Policy at any time. Any changes will be
                    published on our website with the revised Last Updated date.
                </p>
            ),
        },

        {
            title: "14. Contact Information",
            icon: <Phone className="text-blue-600" size={24} />,
            content: (
                <>
                    <p>
                        For refund-related inquiries, please contact:
                    </p>

                    <div className="mt-4 space-y-2">
                        <p>
                            <strong>Goodlinks Services Private Limited</strong>
                        </p>

                        <p>
                            <strong>CIN:</strong> U70200UW2026PTC250723
                        </p>

                        <p>
                            <strong>Website:</strong> paytrue.co.in
                        </p>

                        <p>
                            <strong>Email:</strong> care@paytrue.co.in
                        </p>

                        <p>
                            <strong>Phone:</strong> +91 9811207438
                        </p>

                        <p>
                            <strong>Registered Office Address:</strong>
                            <br />
                            F No GF2, P No B 305 Block B,
                            <br />
                            New Panchwati Colony, Ghaziabad,
                            <br />
                            Ghaziabad – 201001,
                            <br />
                            Uttar Pradesh, India
                        </p>
                    </div>
                </>
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
                                Learn how Goodlinks Services Private Limited handles refunds,
                                failed transactions, duplicate payments, chargebacks,
                                and refund timelines.
                            </p>

                            <div className="mt-10 flex flex-wrap justify-center gap-4">

                                <div className="rounded-2xl bg-white/10 px-5 py-3 backdrop-blur-md">
                                    Effective Date: May 01, 2026
                                </div>

                                <div className="rounded-2xl bg-white/10 px-5 py-3 backdrop-blur-md">
                                    Last Updated: June 16, 2026
                                </div>

                            </div>

                        </div>
                    </div>
                </section>
                <section className="mx-auto max-w-7xl px-6 py-20" style={{ background: "white" }}>
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
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
            title: "1. Eligibility",
            icon: <ShieldCheck className="text-blue-600" size={24} />,
            content: (
                <ul className="list-disc pl-6 space-y-2">
                    <li>Be at least 18 years of age.</li>
                    <li>Be legally capable of entering into a binding agreement.</li>
                    <li>Complete KYC verification wherever required.</li>
                    <li>Provide accurate and updated information.</li>
                </ul>
            ),
        },

        {
            title: "2. Services",
            icon: <CreditCard className="text-blue-600" size={24} />,
            content: (
                <ul className="list-disc pl-6 space-y-2">
                    <li>AEPS</li>
                    <li>Micro ATM (MATM)</li>
                    <li>Domestic Money Transfer (DMT)</li>
                    <li>BBPS Bill Payments</li>
                    <li>Mobile & DTH Recharge</li>
                    <li>Wallet Services</li>
                    <li>UPI Collection</li>
                    <li>PAN Services</li>
                    <li>Aadhaar Pay</li>
                    <li>Other financial and payment-related services.</li>
                </ul>
            ),
        },

        {
            title: "3. User Responsibilities",
            icon: <ShieldCheck className="text-green-600" size={24} />,
            content: (
                <ul className="list-disc pl-6 space-y-2">
                    <li>Provide correct information.</li>
                    <li>Maintain confidentiality of login credentials.</li>
                    <li>Do not share OTP, MPIN, passwords or authentication details.</li>
                    <li>Use services only for lawful purposes.</li>
                    <li>Report unauthorized transactions immediately.</li>
                </ul>
            ),
        },

        {
            title: "4. KYC Compliance",
            icon: <ShieldCheck className="text-green-600" size={24} />,
            content: (
                <p>
                    Users may be required to complete KYC as per RBI, NPCI, UIDAI,
                    FIU-IND and applicable regulatory guidelines. Failure to complete
                    KYC may result in suspension or termination of services.
                </p>
            ),
        },

        {
            title: "5. Wallet Usage",
            icon: <CreditCard className="text-blue-600" size={24} />,
            content: (
                <ul className="list-disc pl-6 space-y-2">
                    <li>Wallet balance cannot be treated as a bank deposit.</li>
                    <li>Wallet balances may be subject to RBI regulations.</li>
                    <li>Wallet loading limits may apply.</li>
                    <li>Refunds will be processed according to regulations.</li>
                </ul>
            ),
        },

        {
            title: "6. Transaction Processing",
            icon: <RefreshCw className="text-blue-600" size={24} />,
            content: (
                <ul className="list-disc pl-6 space-y-2">
                    <li>Bank availability</li>
                    <li>NPCI network</li>
                    <li>Partner APIs</li>
                    <li>Regulatory restrictions</li>
                </ul>
            ),
        },

        {
            title: "7. Failed Transactions",
            icon: <AlertTriangle className="text-orange-500" size={24} />,
            content: (
                <p>
                    Failed transactions may be automatically reversed within prescribed
                    timelines. Users may raise a support request if required.
                </p>
            ),
        },

        {
            title: "8. Fees & Charges",
            icon: <CreditCard className="text-purple-600" size={24} />,
            content: (
                <p>
                    Convenience fees, GST, commissions and platform fees will be
                    displayed before confirmation. Fees are generally non-refundable.
                </p>
            ),
        },

        {
            title: "9. Fraud Prevention",
            icon: <ShieldCheck className="text-red-500" size={24} />,
            content: (
                <ul className="list-disc pl-6 space-y-2">
                    <li>Suspend suspicious accounts.</li>
                    <li>Block fraudulent transactions.</li>
                    <li>Request additional verification.</li>
                    <li>Share information with authorities where legally required.</li>
                </ul>
            ),
        },

        {
            title: "10. Prohibited Activities",
            icon: <AlertTriangle className="text-red-500" size={24} />,
            content: (
                <ul className="list-disc pl-6 space-y-2">
                    <li>Illegal transactions.</li>
                    <li>Money laundering.</li>
                    <li>Terror financing.</li>
                    <li>Fake identities.</li>
                    <li>Aadhaar misuse.</li>
                    <li>Unauthorized access.</li>
                    <li>Reverse engineering or hacking.</li>
                </ul>
            ),
        },

        {
            title: "11. Intellectual Property",
            icon: <ShieldCheck className="text-indigo-600" size={24} />,
            content: (
                <p>
                    All trademarks, logos, software and website content belong to
                    Goodlinks Services Private Limited or its licensors.
                </p>
            ),
        },

        {
            title: "12. Privacy",
            icon: <ShieldCheck className="text-blue-600" size={24} />,
            content: (
                <p>
                    Use of the Services is governed by our Privacy Policy.
                </p>
            ),
        },

        {
            title: "13. Limitation of Liability",
            icon: <AlertTriangle className="text-orange-500" size={24} />,
            content: (
                <ul className="list-disc pl-6 space-y-2">
                    <li>Bank server failures</li>
                    <li>NPCI downtime</li>
                    <li>Telecom failures</li>
                    <li>Internet interruptions</li>
                    <li>User negligence</li>
                    <li>Incorrect beneficiary details</li>
                    <li>Force majeure events</li>
                </ul>
            ),
        },

        {
            title: "14. Indemnification",
            icon: <ShieldCheck className="text-green-600" size={24} />,
            content: (
                <p>
                    You agree to indemnify and hold harmless the Company and its
                    affiliates against claims arising from misuse of Services.
                </p>
            ),
        },

        {
            title: "15. Suspension & Termination",
            icon: <AlertTriangle className="text-red-500" size={24} />,
            content: (
                <ul className="list-disc pl-6 space-y-2">
                    <li>Fraud is suspected.</li>
                    <li>KYC requirements are not fulfilled.</li>
                    <li>Regulatory instructions are received.</li>
                    <li>These Terms are violated.</li>
                </ul>
            ),
        },

        {
            title: "16. Third-Party Services",
            icon: <CreditCard className="text-blue-600" size={24} />,
            content: (
                <p>
                    Certain services are provided through partner banks, APIs and
                    payment gateways. We are not responsible for third-party failures.
                </p>
            ),
        },

        {
            title: "17. Governing Law",
            icon: <ShieldCheck className="text-green-600" size={24} />,
            content: (
                <p>
                    These Terms shall be governed by the laws of India and disputes
                    shall be subject to the jurisdiction of competent courts.
                </p>
            ),
        },

        {
            title: "18. Changes to Terms",
            icon: <Calendar className="text-indigo-600" size={24} />,
            content: (
                <p>
                    We reserve the right to modify these Terms at any time. Continued
                    use of Services constitutes acceptance of revised Terms.
                </p>
            ),
        },

        {
            title: "19. Contact Information",
            icon: <Phone className="text-blue-600" size={24} />,
            content: (
                <>
                    <p><strong>Goodlinks Services Private Limited</strong></p>
                    <p>Website: paytrue.co.in</p>
                    <p>Email: care@paytrue.co.in</p>
                    <p>Phone: +91 9811207438</p>
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

                            

                            <h1 className="mt-8 text-5xl font-black md:text-7xl">
                                Terms & Conditions

                            </h1>

                            <p className="mx-auto mt-6 max-w-3xl text-lg text-blue-100">
                                Please read these Terms & Conditions carefully before using PayTrue services.
                                By accessing or using our platform, you agree to comply with these terms.
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
                              Terms & Conditions

                        </h2>
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
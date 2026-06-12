import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://www.paytrue.in"),

  title: {
    default: "PayTrue | Digital Payments, Money Transfer & Fintech Solutions",
    template: "%s | PayTrue",
  },

  description:
    "PayTrue is a trusted fintech platform offering secure money transfers, mobile recharges, bill payments, AEPS banking services, BBPS solutions, utility payments, and digital financial services across India. Experience fast, reliable, and seamless transactions with enterprise-grade security.",

  keywords: [
    "PayTrue",
    "Fintech",
    "Money Transfer",
    "Online Payments",
    "Digital Payments",
    "Mobile Recharge",
    "BBPS",
    "AEPS",
    "Utility Bill Payment",
    "Domestic Money Transfer",
    "Fintech Platform India",
    "Secure Payments",
    "Financial Services",
    "Payment Gateway",
    "Recharge Services",
    "Business Banking Solutions",
  ],

  authors: [
    {
      name: "PayTrue",
    },
  ],

  creator: "PayTrue",
  publisher: "PayTrue",

  robots: {
    index: true,
    follow: true,
  },

  openGraph: {
    type: "website",
    locale: "en_IN",
    url: "https://www.paytrue.in",
    siteName: "PayTrue",

    title:
      "PayTrue | Trusted Fintech Platform for Digital Payments & Money Transfers",

    description:
      "Secure and reliable fintech platform for money transfers, mobile recharges, bill payments, AEPS, BBPS, and digital financial services. Trusted by businesses and customers across India.",

    images: [
      {
        url: "/paytruelogo.png",
        width: 1200,
        height: 630,
        alt: "PayTrue Fintech Platform",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",

    title:
      "PayTrue | Trusted Fintech Platform for Digital Payments",

    description:
      "Fast, secure and reliable money transfers, recharges, bill payments and digital financial services.",

    images: ["/paytruelogo.png"],
  },

  icons: {
    icon: [
      {
        url: "/favicon.ico",
        sizes: "any",
      },
    ],

    apple: [
      {
        url: "/paytruelogo.png",
        sizes: "180x180",
      },
    ],

    shortcut: ["/paytruelogo.ico"],
  },

  category: "Finance",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {children}
      </body>
    </html>
  );
}
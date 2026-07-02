import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import ChunkLoadRecovery from "@/src/components/common/ChunkLoadRecovery";
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
  metadataBase: new URL("https://paytrue.co.in"),

  title: {
    default:
      "PayTrue | AEPS, BBPS, Money Transfer & Digital Payment Services",
    template: "%s | PayTrue",
  },

  description:
    "PayTrue is India's trusted fintech platform providing AEPS, BBPS, Domestic Money Transfer (DMT), Mobile Recharge, Aadhaar Pay, Utility Bill Payments and secure digital financial services.",

  keywords: [
    "PayTrue",
    "AEPS",
    "BBPS",
    "Money Transfer",
    "Domestic Money Transfer",
    "DMT",
    "Mobile Recharge",
    "Bill Payment",
    "Aadhaar Pay",
    "Fintech",
    "Digital Payments",
    "Payment Services",
    "Online Recharge",
    "Utility Payments",
    "India Fintech",
  ],

  authors: [
    {
      name: "PayTrue",
      url: "https://paytrue.co.in",
    },
  ],

  creator: "PayTrue",
  publisher: "PayTrue",

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },

  openGraph: {
    title:
      "PayTrue | Trusted Digital Payment & Fintech Platform",

    description:
      "Fast, secure and reliable AEPS, BBPS, Money Transfer, Recharge and Digital Payment Services across India.",

    url: "https://paytrue.co.in",

    siteName: "PayTrue",

    locale: "en_IN",

    type: "website",

    images: [
      {
        url: "https://paytrue-in-images.s3.ap-south-1.amazonaws.com/WhatsApp+Image+2026-06-12+at+2.48.31+PM.jpeg",
        width: 1200,
        height: 630,
        alt: "PayTrue Fintech Services",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",

    title:
      "PayTrue | Trusted Digital Payment & Fintech Platform",

    description:
      "Secure AEPS, BBPS, DMT, Recharge and Digital Financial Services.",

    images: [
      "https://paytrue-in-images.s3.ap-south-1.amazonaws.com/WhatsApp+Image+2026-06-12+at+2.48.31+PM.jpeg",
    ],

    creator: "@PayTrue",
  },

  alternates: {
    canonical: "https://paytrue.co.in",
  },

  icons: {
    icon: "/favicon.ico",

    shortcut: "/favicon.ico",

    apple: "/paytruelogo.png",
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
      className={`${geistSans.variable} ${geistMono.variable}`}
    >
      <body>
        <ChunkLoadRecovery />
        {children}
      </body>
    </html>
  );
}
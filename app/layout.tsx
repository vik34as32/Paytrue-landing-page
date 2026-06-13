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
    default: "PayTrue - India's Trusted Digital Payments & Fintech Platform",
    template: "%s | PayTrue",
  },

  description:
    "Empowering businesses and customers with secure digital payments, AEPS, BBPS, Domestic Money Transfer, Mobile Recharge, Utility Bill Payments and Financial Services across India.",

  keywords: [
    "PayTrue",
    "Digital Payments",
    "Fintech",
    "AEPS",
    "BBPS",
    "Money Transfer",
    "Domestic Money Transfer",
    "Mobile Recharge",
    "Utility Bill Payment",
    "Financial Services",
    "Payment Solutions",
    "Fintech India",
    "Secure Transactions",
    "Business Payments",
    "Digital Banking",
  ],

  authors: [
    {
      name: "PayTrue",
      url: "https://www.paytrue.in",
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
    },
  },

  alternates: {
    canonical: "https://www.paytrue.in",
  },

  openGraph: {
    title:
      "PayTrue - India's Trusted Digital Payments & Fintech Platform",

    description:
      "Fast, secure and reliable digital payment solutions including AEPS, BBPS, Money Transfer, Recharge Services and Financial Solutions.",

    url: "https://www.paytrue.in",
    siteName: "PayTrue",
    locale: "en_IN",
    type: "website",

    images: [
      {
        url: "https://www.paytrue.in/paytruelogo.png",
        width: 1200,
        height: 630,
        alt: "PayTrue - Digital Payments & Fintech Platform",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",

    title:
      "PayTrue - India's Trusted Digital Payments & Fintech Platform",

    description:
      "Secure money transfer, bill payments, AEPS, BBPS, mobile recharge and digital financial services across India.",

    images: [
      "https://www.paytrue.in/paytruelogo.png",
    ],

    creator: "@PayTrue",
  },

  icons: {
    icon: [
      {
        url: "/favicon.ico",
      },
    ],

    apple: [
      {
        url: "/paytruelogo.png",
        sizes: "180x180",
      },
    ],

    shortcut: ["/favicon.ico"],
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
      <body>{children}</body>
    </html>
  );
}
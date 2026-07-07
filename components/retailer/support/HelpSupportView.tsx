"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronDown,
  Headset,
  Mail,
  MessageCircle,
  Phone,
  Ticket,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  FAQ_ITEMS,
  SUPPORT_EMAIL,
  SUPPORT_MOBILE,
} from "@/features/retailer/constants";
import RetailerPageHeader from "@/components/retailer/RetailerPageHeader";

export default function HelpSupportView() {
  const [openFaq, setOpenFaq] = useState<string | null>(FAQ_ITEMS[0]?.id ?? null);

  return (
    <div className="min-w-0 space-y-6">
      <RetailerPageHeader
        title="Help & Support"
        description="Find answers, contact our team, or raise a support ticket anytime."
        icon={Headset}
        iconClassName="from-violet-500 to-violet-700"
        actions={
          <Button asChild>
            <Link href="/rt/retailer/raise-ticket">
              <Ticket className="h-4 w-4" />
              Raise Ticket
            </Link>
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-3">
        {[
          {
            icon: Phone,
            title: "Call Support",
            detail: SUPPORT_MOBILE,
            href: `tel:${SUPPORT_MOBILE.replace(/\s/g, "")}`,
            color: "from-emerald-500 to-emerald-700",
          },
          {
            icon: Mail,
            title: "Email Us",
            detail: SUPPORT_EMAIL,
            href: `mailto:${SUPPORT_EMAIL}`,
            color: "from-blue-500 to-blue-700",
          },
          {
            icon: MessageCircle,
            title: "Live Chat",
            detail: "Mon–Sat, 9 AM – 9 PM",
            href: "/rt/retailer/raise-ticket",
            color: "from-orange-500 to-orange-700",
          },
        ].map((item, index) => (
          <motion.a
            key={item.title}
            href={item.href}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.06 }}
            className="group rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition hover:border-[#1565d8]/30 hover:shadow-md"
          >
            <div
              className={`mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br text-white shadow-md ${item.color}`}
            >
              <item.icon className="h-5 w-5" />
            </div>
            <p className="text-sm font-bold text-[#0b1f3a]">{item.title}</p>
            <p className="mt-1 text-sm text-slate-500 group-hover:text-[#1565d8]">
              {item.detail}
            </p>
          </motion.a>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Frequently Asked Questions</CardTitle>
            <CardDescription>
              Quick answers to common retailer portal questions
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {FAQ_ITEMS.map((faq) => {
              const isOpen = openFaq === faq.id;
              return (
                <div
                  key={faq.id}
                  className="overflow-hidden rounded-xl border border-slate-100 bg-slate-50/50"
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaq(isOpen ? null : faq.id)}
                    className="flex w-full items-center justify-between gap-3 px-4 py-3.5 text-left"
                  >
                    <span className="text-sm font-semibold text-[#0b1f3a]">
                      {faq.question}
                    </span>
                    <ChevronDown
                      className={`h-4 w-4 shrink-0 text-slate-400 transition-transform ${isOpen ? "rotate-180" : ""}`}
                    />
                  </button>
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <p className="border-t border-slate-100 px-4 py-3 text-sm leading-relaxed text-slate-600">
                          {faq.answer}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

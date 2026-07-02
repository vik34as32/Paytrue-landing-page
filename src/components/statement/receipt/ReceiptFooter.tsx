"use client";

import Image from "next/image";
import {
  PAYTRUE_LOGO_PATH,
  PAYTRUE_SUPPORT_EMAIL,
  PAYTRUE_WEBSITE,
} from "@/types/statementReceipt";

export default function ReceiptFooter() {
  return (
    <footer className="border-t border-[#E5E7EB] bg-white px-6 py-8 text-center sm:px-8 lg:px-10">
      <div className="mx-auto flex max-w-md flex-col items-center">
        <Image
          src={PAYTRUE_LOGO_PATH}
          alt="PayTrue"
          width={36}
          height={36}
          className="mb-3 object-contain"
        />
        <p className="text-sm font-bold text-[#001F5B]">Powered by Paytrue</p>
        <p className="mt-2 text-xs text-slate-600">{PAYTRUE_SUPPORT_EMAIL}</p>
        <p className="mt-1 text-xs text-slate-600">
          {PAYTRUE_WEBSITE.replace("https://", "www.")}
        </p>
        <p className="mt-4 text-sm font-medium text-[#111827]">
          Thank you for using Paytrue.
        </p>
        <p className="mt-2 text-[11px] text-slate-400">
          Computer Generated Receipt
        </p>
        <p className="text-[11px] text-slate-400">No Signature Required</p>
      </div>
    </footer>
  );
}

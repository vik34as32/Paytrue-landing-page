"use client";

import Image from "next/image";
import {
  PAYTRUE_LOGO_PATH,
  PAYTRUE_SUPPORT_EMAIL,
  PAYTRUE_WEBSITE,
} from "@/types/statementReceipt";

export default function ReceiptFooter() {
  return (
    <footer className="receipt-footer border-t border-[#E5E7EB] bg-white px-5 py-4 text-center sm:px-7 lg:px-9">
      <div className="mx-auto flex max-w-md flex-col items-center">
        <Image
          src={PAYTRUE_LOGO_PATH}
          alt="PayTrue"
          width={28}
          height={28}
          className="mb-1.5 object-contain"
        />
        <p className="text-sm font-bold text-[#001F5B]">Powered by Paytrue</p>
        <p className="mt-1 text-xs text-slate-600">
          {PAYTRUE_SUPPORT_EMAIL} · {PAYTRUE_WEBSITE.replace("https://", "www.")}
        </p>
        <p className="mt-2 text-sm font-medium text-[#111827]">
          Thank you for using Paytrue.
        </p>
        <p className="mt-1 text-[11px] text-slate-400">
          Computer Generated Receipt · No Signature Required
        </p>
      </div>
    </footer>
  );
}

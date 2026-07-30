"use client";

import { KeyRound, ShieldCheck } from "lucide-react";
import { ChangeMpinDialog } from "../components/ChangeMpinDialog";
import { MpinQueryProvider } from "../components/MpinQueryProvider";

export function ChangeMpinPage() {
  return (
    <MpinQueryProvider>
      <div className="mx-auto max-w-2xl py-6">
        <div className="overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-[0_12px_40px_rgba(11,31,58,0.08)]">
          <div className="bg-gradient-to-r from-[#001F5B] via-[#0d47a1] to-[#1565d8] px-6 py-6 text-white sm:px-8">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/15 ring-1 ring-white/20 backdrop-blur">
                <KeyRound className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-xl font-extrabold tracking-tight">Change MPIN</h1>
                <p className="mt-1 text-sm text-blue-100/90">
                  Follow the secure 2-step wizard to update your authorization PIN.
                </p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3 px-6 py-4 text-sm text-slate-600 sm:px-8">
            <ShieldCheck className="h-4 w-4 text-[#1565d8]" />
            Complete verification in the dialog to continue.
          </div>
        </div>

        <ChangeMpinDialog />
      </div>
    </MpinQueryProvider>
  );
}

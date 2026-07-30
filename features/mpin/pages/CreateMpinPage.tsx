"use client";

import { Shield } from "lucide-react";
import { CreateMpinForm } from "../components/CreateMpinForm";
import { MpinQueryProvider } from "../components/MpinQueryProvider";

export function CreateMpinPage() {
  return (
    <MpinQueryProvider>
      <div className="mx-auto max-w-2xl py-6">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#1565d8]/10 text-[#1565d8]">
              <Shield className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-[#001F5B]">Create Secure MPIN</h1>
              <p className="mt-1 text-sm text-slate-500">
                Set up your MPIN to authorize secure wallet transactions. Complete the
                form in the dialog.
              </p>
            </div>
          </div>
        </div>
        <CreateMpinForm />
      </div>
    </MpinQueryProvider>
  );
}

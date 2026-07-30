"use client";

import { Suspense, useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Header from "@/app/shared/components/layout/Header";
import ReduxProvider from "@/src/components/common/ReduxProvider";
import VerifyOtpForm from "./VerifyOtpForm";

function VerifyOtpContent() {
  return (
    <div className="flex min-h-dvh flex-col bg-zinc-50 dark:bg-black">
      <Header />
      <section className="relative flex flex-1 items-center justify-center overflow-hidden bg-gradient-to-br from-slate-950 via-[#001F5B] to-[#0057D9] px-4 py-10">
        <div className="absolute left-0 top-0 h-[280px] w-[280px] rounded-full bg-cyan-400/20 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-[300px] w-[300px] rounded-full bg-blue-500/20 blur-3xl" />

        <div className="relative z-10 w-full max-w-md rounded-3xl border border-white/10 bg-white/95 p-6 shadow-2xl backdrop-blur-xl sm:p-8 dark:bg-slate-900/95">
          <Suspense
            fallback={
              <div className="py-16 text-center text-sm text-slate-500">
                Loading…
              </div>
            }
          >
            <VerifyOtpForm />
          </Suspense>
        </div>
      </section>
    </div>
  );
}

export default function VerifyLoginOtpPage() {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: { retry: 1, refetchOnWindowFocus: false },
          mutations: { retry: 0 },
        },
      })
  );

  return (
    <ReduxProvider>
      <QueryClientProvider client={queryClient}>
        <VerifyOtpContent />
      </QueryClientProvider>
    </ReduxProvider>
  );
}

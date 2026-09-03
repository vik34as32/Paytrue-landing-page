export default function VerifyOtpLoading() {
  return (
    <div className="flex min-h-dvh flex-col bg-zinc-50">
      <div className="h-16 border-b border-slate-200 bg-white" />
      <section className="relative flex flex-1 items-center justify-center bg-gradient-to-br from-slate-950 via-[#001F5B] to-[#0057D9] px-4 py-10">
        <div className="w-full max-w-md rounded-3xl border border-white/10 bg-white/95 p-8 text-center text-sm text-slate-500 shadow-2xl">
          Loading OTP verification…
        </div>
      </section>
    </div>
  );
}

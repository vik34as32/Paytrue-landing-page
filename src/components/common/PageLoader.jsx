"use client";

export default function PageLoader({ message = "Loading..." }) {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#1565d8]/20 border-t-[#1565d8]" />
      <p className="text-sm font-medium text-slate-500">{message}</p>
    </div>
  );
}

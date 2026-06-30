import Link from "next/link";
import { FileQuestion } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-4">
      <div className="max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-lg">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-50 text-[#1565d8]">
          <FileQuestion className="h-8 w-8" />
        </div>
        <h1 className="text-6xl font-extrabold text-[#0b1f3a]">404</h1>
        <p className="mt-2 text-lg font-semibold text-slate-700">Page Not Found</p>
        <p className="mt-2 text-sm text-slate-500">
          The page you are looking for does not exist or has been moved.
        </p>
        <Link
          href="/"
          className="mt-6 inline-flex items-center justify-center rounded-xl bg-[#1565d8] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#1254b8]"
        >
          Go to Home
        </Link>
      </div>
    </div>
  );
}

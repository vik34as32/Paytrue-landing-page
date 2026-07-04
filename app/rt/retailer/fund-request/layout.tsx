"use client";

import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import FundRequestNavTabs from "@/src/components/fundRequests/retailer/FundRequestNavTabs";

export default function FundRequestLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            refetchOnWindowFocus: false,
            retry: 1,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <div className="w-full max-w-none space-y-5">
        <FundRequestNavTabs />
        {children}
      </div>
    </QueryClientProvider>
  );
}

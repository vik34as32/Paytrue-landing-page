"use client";

import { useState } from "react";
import Sidebar from "@/components/retailer/Sidebar";
import Header from "@/components/retailer/Header";
import WalletStrip from "@/components/retailer/WalletStrip";

export default function RetailerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="rt-portal-bg min-h-screen">
      <Sidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="rt-main-shell flex min-h-screen flex-col">
        <Header onMenuClick={() => setSidebarOpen(true)} />

        <div className="flex-1 overflow-y-auto w-full max-w-none">
          <WalletStrip />
          <main className="w-full max-w-none px-4 py-4 sm:px-5 sm:py-5 lg:px-6 lg:py-6">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}

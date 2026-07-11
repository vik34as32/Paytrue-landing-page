"use client";

import { useEffect, useState } from "react";
import ReduxProvider from "@/src/components/common/ReduxProvider";
import AuthGuard from "@/src/components/auth/AuthGuard";
import IdleSessionGuard from "@/src/components/auth/IdleSessionGuard";
import BiometricVerificationGuard from "@/components/biometric/BiometricVerificationGuard";
import Sidebar from "@/components/retailer/Sidebar";
import Header from "@/components/retailer/Header";
import RetailerWalletSync from "@/components/retailer/RetailerWalletSync";
import { USER_TYPES } from "@/src/constants/auth";

export default function RetailerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    document.documentElement.classList.remove("dark");
    try {
      localStorage.removeItem("paytrue_retailer_theme");
    } catch {
      /* ignore */
    }
  }, []);

  return (
    <ReduxProvider>
      <AuthGuard allowedTypes={[USER_TYPES.RETAILER]}>
        <IdleSessionGuard>
          <BiometricVerificationGuard>
            <RetailerWalletSync />
            <div className="rt-portal-bg min-h-screen">
              <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

              <div className="rt-main-shell flex min-h-screen flex-col">
                <Header onMenuClick={() => setSidebarOpen(true)} />

                <div className="flex-1 overflow-y-auto w-full max-w-none">
                  <main className="w-full max-w-none px-4 py-4 sm:px-5 sm:py-5 lg:px-6 lg:py-6">
                    {children}
                  </main>
                </div>
              </div>
            </div>
          </BiometricVerificationGuard>
        </IdleSessionGuard>
      </AuthGuard>
    </ReduxProvider>
  );
}

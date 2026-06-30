"use client";



import { useState } from "react";

import { useDispatch, useSelector } from "react-redux";

import { useRouter } from "next/navigation";

import PortalSidebar from "@/src/components/common/PortalSidebar";

import PortalHeader from "@/src/components/common/PortalHeader";

import PortalWalletStrip from "@/src/components/common/PortalWalletStrip";

import { PORTAL_CONFIG } from "@/src/constants/portalConfig";

import { selectUser } from "@/src/redux/slices/authSlice";

import { selectMdWallet, selectDdWallet } from "@/src/redux/slices/walletSlice";

import { logoutUser } from "@/src/redux/thunks/authThunk";

import { toast } from "sonner";



export default function PortalLayout({ children, role }) {

  const dispatch = useDispatch();

  const router = useRouter();

  const [sidebarOpen, setSidebarOpen] = useState(false);

  const config = PORTAL_CONFIG[role];

  const user = useSelector(selectUser);

  const mdWallet = useSelector(selectMdWallet);

  const ddWallet = useSelector(selectDdWallet);



  const balance = role === "md" ? mdWallet.balance : ddWallet.balance;



  const handleLogout = async () => {

    await dispatch(logoutUser());

    toast.success("Logged out successfully");

    router.replace("/auth/login");

  };



  return (

    <div className="rt-portal-bg min-h-screen">

      <PortalSidebar

        open={sidebarOpen}

        onClose={() => setSidebarOpen(false)}

        links={config.sidebarLinks}

        portalLabel={config.portalLabel}

        dashboardPath={config.dashboardPath}

      />



      <div className="rt-main-shell flex min-h-screen flex-col">

        <PortalHeader

          onMenuClick={() => setSidebarOpen(true)}

          user={user}

          profilePath={`${config.basePath}/profile`}

          settingsPath={`${config.basePath}/settings`}

          portalTitle={config.portalLabel}

          onLogout={handleLogout}

        />



        <div className="flex-1 overflow-y-auto w-full max-w-none">

          <PortalWalletStrip

            balance={balance}

            fundRequestPath={`${config.basePath}/fund-requests`}

            userName={user?.name}

            userId={user?.userId}

            roleLabel={user?.roleLabel}

          />

          <main className="w-full max-w-none px-4 py-4 sm:px-5 sm:py-5 lg:px-6 lg:py-6">

            {children}

          </main>

        </div>

      </div>

    </div>

  );

}


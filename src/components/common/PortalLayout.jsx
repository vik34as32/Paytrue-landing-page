"use client";

import { useState, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";
import PortalSidebar from "@/src/components/common/PortalSidebar";
import PortalHeader from "@/src/components/common/PortalHeader";
import PortalWalletStrip from "@/src/components/common/PortalWalletStrip";
import { PORTAL_CONFIG } from "@/src/constants/portalConfig";
import {
  selectUser,
  selectAuthHydrated,
  selectIsAuthenticated,
} from "@/src/redux/slices/authSlice";
import { selectMdWallet, selectDdWallet } from "@/src/redux/slices/walletSlice";
import {
  selectProfileLoading,
  selectProfileError,
} from "@/src/redux/slices/profileSlice";
import { fetchProfile } from "@/src/redux/thunks/profileThunk";
import { fetchWalletBalance } from "@/src/redux/thunks/walletThunk";
import useLogout from "@/src/hooks/useLogout";
import { commissionLedgerPath } from "@/src/lib/commissionUtils";

export default function PortalLayout({ children, role }) {
  const dispatch = useDispatch();
  const logout = useLogout();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const config = PORTAL_CONFIG[role];
  const hideWalletStrip =
    role === "md" || (role === "dd" && pathname === "/dd/dashboard");
  const commissionHref = commissionLedgerPath(role);

  const hydrated = useSelector(selectAuthHydrated);
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const user = useSelector(selectUser);
  const profileLoading = useSelector(selectProfileLoading);
  const profileError = useSelector(selectProfileError);
  const mdWallet = useSelector(selectMdWallet);
  const ddWallet = useSelector(selectDdWallet);

  const wallet = role === "md" ? mdWallet : ddWallet;
  const balance = wallet.balance ?? 0;
  const walletLoading = wallet.loading && wallet.lastUpdated == null;
  const walletLoaded = wallet.lastUpdated != null;

  const lastWalletErrorRef = useRef(null);
  const lastProfileErrorRef = useRef(null);

  // Fetch profile + wallet only after auth session is restored (fixes empty header/sidebar on DD login).
  useEffect(() => {
    if (!hydrated || !isAuthenticated) return;

    dispatch(fetchProfile());
    dispatch(fetchWalletBalance({ role }));
  }, [dispatch, role, hydrated, isAuthenticated]);

  useEffect(() => {
    if (wallet.loading || !wallet.error) return;
    if (lastWalletErrorRef.current === wallet.error) return;
    lastWalletErrorRef.current = wallet.error;
    toast.error(
      typeof wallet.error === "string"
        ? wallet.error
        : "Failed to fetch wallet balance"
    );
  }, [wallet.loading, wallet.error]);

  useEffect(() => {
    if (profileLoading || !profileError) return;
    if (lastProfileErrorRef.current === profileError) return;
    lastProfileErrorRef.current = profileError;
    toast.error(
      typeof profileError === "string"
        ? profileError
        : "Failed to fetch profile"
    );
  }, [profileLoading, profileError]);

  const handleLogout = () => void logout();

  return (
    <div className="rt-portal-bg min-h-screen">
      <PortalSidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        links={config.sidebarLinks}
        portalLabel={config.portalLabel}
        dashboardPath={config.dashboardPath}
        user={user}
        balance={balance}
        walletLoading={walletLoading}
        walletLoaded={walletLoaded}
        profileLoading={profileLoading}
        commissionHref={commissionHref}
        onLogout={handleLogout}
      />

      <div className="rt-main-shell flex min-h-screen flex-col">
        <PortalHeader
          onMenuClick={() => setSidebarOpen(true)}
          user={user}
          profilePath={`${config.basePath}/profile`}
          settingsPath={`${config.basePath}/settings`}
          portalTitle={config.portalLabel}
          onLogout={handleLogout}
          balance={balance}
          walletLoading={walletLoading}
          walletLoaded={walletLoaded}
          profileLoading={profileLoading}
          commissionHref={commissionHref}
        />

        <div className="flex-1 overflow-y-auto w-full max-w-none">
          {!hideWalletStrip ? (
            <PortalWalletStrip
              balance={balance}
              fundRequestPath={`${config.basePath}/fund-requests`}
              userName={user?.name}
              userId={user?.userId}
              roleLabel={user?.roleLabel}
              loading={walletLoading}
              loaded={walletLoaded}
              error={wallet.error}
              commissionHref={commissionHref}
            />
          ) : null}
          <main className="w-full max-w-none px-4 py-4 sm:px-5 sm:py-5 lg:px-6 lg:py-6">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}

"use client";

import ReduxProvider from "@/src/components/common/ReduxProvider";
import PortalLayout from "@/src/components/common/PortalLayout";
import AuthGuard from "@/src/components/auth/AuthGuard";
import { USER_TYPES } from "@/src/constants/auth";

export default function DdLayout({ children }) {
  return (
    <ReduxProvider>
      <AuthGuard allowedTypes={[USER_TYPES.DISTRIBUTOR]}>
        <PortalLayout role="dd">{children}</PortalLayout>
      </AuthGuard>
    </ReduxProvider>
  );
}

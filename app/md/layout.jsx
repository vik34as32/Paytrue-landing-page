"use client";



import ReduxProvider from "@/src/components/common/ReduxProvider";

import PortalLayout from "@/src/components/common/PortalLayout";

import AuthGuard from "@/src/components/auth/AuthGuard";

import { USER_TYPES } from "@/src/constants/auth";



export default function MdLayout({ children }) {

  return (

    <ReduxProvider>

      <AuthGuard allowedTypes={[USER_TYPES.MASTER_DISTRIBUTOR]}>

        <PortalLayout role="md">{children}</PortalLayout>

      </AuthGuard>

    </ReduxProvider>

  );

}


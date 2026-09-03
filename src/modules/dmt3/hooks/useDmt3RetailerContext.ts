"use client";

import { useMemo } from "react";
import { useSelector } from "react-redux";
import { selectUser } from "@/src/redux/slices/authSlice";
import { getRetailerDisplayName } from "@/src/lib/userUtils";
import { sanitizeMobile } from "../utils/dmt3.utils";
import type { Dmt3RetailerContext } from "../types/dmt3.types";

/** Read-only retailer context for DMT3 — does not modify auth state. */
export function useDmt3RetailerContext(): Dmt3RetailerContext {
  const user = useSelector(selectUser);

  return useMemo(() => {
    const senderName = getRetailerDisplayName(user, "Retailer");
    const rawMobile = String(
      user?.mobile ?? user?.phone ?? user?.mobileNumber ?? ""
    );
    const senderMobile = sanitizeMobile(rawMobile);
    const email = String(user?.email ?? "").trim();

    return {
      senderName,
      senderMobile,
      email,
    };
  }, [user]);
}

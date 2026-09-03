"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/** Review step removed — transfer now goes MPIN → payout. */
export default function Dmt3ReviewPage() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/rt/retailer/dmt3/transfer");
  }, [router]);
  return null;
}

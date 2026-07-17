"use client";

import { useParams } from "next/navigation";
import RetailerDetailPage from "@/src/components/retailers/RetailerDetailPage";

export default function DdRetailerDetailRoute() {
  const params = useParams();
  const retailerId = String(params?.id || "");
  return <RetailerDetailPage retailerId={retailerId} />;
}

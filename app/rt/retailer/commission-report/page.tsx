import { redirect } from "next/navigation";

/** Legacy sidebar path — keep working if bookmarked. */
export default function RtCommissionReportRedirectPage() {
  redirect("/rt/retailer/commission");
}

import { redirect } from "next/navigation";

/** Legacy path — ledger Report now lives at /dd/report */
export default function DdDownlineLedgerRedirect() {
  redirect("/dd/report");
}

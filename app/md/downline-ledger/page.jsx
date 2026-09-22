import { redirect } from "next/navigation";

/** Legacy path — ledger Report now lives at /md/report */
export default function MdDownlineLedgerRedirect() {
  redirect("/md/report");
}

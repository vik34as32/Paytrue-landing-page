import DmtShell from "@/src/components/dmt/DmtShell";

export default function DmtLayout({ children }: { children: React.ReactNode }) {
  return <DmtShell>{children}</DmtShell>;
}

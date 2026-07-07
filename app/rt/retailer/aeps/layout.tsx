import AepsShell from "@/src/components/aeps/AepsShell";

export default function AepsLayout({ children }: { children: React.ReactNode }) {
  return <AepsShell>{children}</AepsShell>;
}

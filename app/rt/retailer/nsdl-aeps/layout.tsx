import NsdlAepsShell from "@/src/modules/nsdl-aeps/components/NsdlAepsShell";

export default function NsdlAepsLayout({ children }: { children: React.ReactNode }) {
  return <NsdlAepsShell>{children}</NsdlAepsShell>;
}

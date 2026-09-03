import Dmt3Shell from "@/src/modules/dmt3/components/Dmt3Shell";

export default function Dmt3Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <Dmt3Shell>{children}</Dmt3Shell>;
}

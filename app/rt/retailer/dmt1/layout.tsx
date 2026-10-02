import Dmt1Shell from "@/src/modules/dmt1/components/Dmt1Shell";

export default function Dmt1Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <Dmt1Shell>{children}</Dmt1Shell>;
}

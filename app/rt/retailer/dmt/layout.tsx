import MerchantBiometricGate from "@/components/biometric/MerchantBiometricGate";
import DmtShell from "@/src/components/dmt/DmtShell";

export default function DmtLayout({ children }: { children: React.ReactNode }) {
  return (
    <MerchantBiometricGate serviceLabel="DMT">
      <DmtShell>{children}</DmtShell>
    </MerchantBiometricGate>
  );
}

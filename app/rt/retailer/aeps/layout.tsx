import MerchantBiometricGate from "@/components/biometric/MerchantBiometricGate";
import AepsShell from "@/src/components/aeps/AepsShell";

export default function AepsLayout({ children }: { children: React.ReactNode }) {
  return (
    <MerchantBiometricGate serviceLabel="AEPS">
      <AepsShell>{children}</AepsShell>
    </MerchantBiometricGate>
  );
}

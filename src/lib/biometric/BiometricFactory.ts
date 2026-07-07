import { mantraProvider } from "@/src/lib/biometric/MantraProvider";
import { morphoProvider } from "@/src/lib/biometric/MorphoProvider";
import type { BiometricDeviceType, BiometricProvider } from "@/src/types/biometric";

const providers: Record<BiometricDeviceType, BiometricProvider> = {
  MANTRA: mantraProvider,
  MORPHO: morphoProvider,
};

export function getProvider(deviceType: BiometricDeviceType): BiometricProvider {
  return providers[deviceType] ?? mantraProvider;
}

export function clearAllProviderCaches(): void {
  mantraProvider.clearCache();
  morphoProvider.clearCache();
}

export { mantraProvider, morphoProvider };

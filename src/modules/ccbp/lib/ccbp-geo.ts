import { getCurrentLocation } from "@/src/lib/rdService";

const FALLBACK = { latitude: "20.5936", longitude: "78.9628" };

export async function resolveCcbpLocation(): Promise<{
  latitude: string;
  longitude: string;
}> {
  try {
    return await getCurrentLocation();
  } catch {
    return FALLBACK;
  }
}

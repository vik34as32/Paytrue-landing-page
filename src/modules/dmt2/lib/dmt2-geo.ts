import { getCurrentLocation } from "@/src/lib/rdService";

const FALLBACK_COORDS = {
  latitude: "20.5936",
  longitude: "78.9628",
};

export async function resolveDmt2Location(): Promise<{
  latitude: string;
  longitude: string;
}> {
  try {
    return await getCurrentLocation();
  } catch {
    return FALLBACK_COORDS;
  }
}

/**
 * Resolve latitude/longitude via internal geocode API (Nominatim proxy).
 */
export async function lookupCoordinates({ pincode, city, state, district }) {
  const params = new URLSearchParams();
  if (pincode) params.set("pincode", pincode);
  if (city) params.set("city", city);
  if (state) params.set("state", state);
  if (district) params.set("district", district);

  if (!pincode && !city && !state) return null;

  try {
    const response = await fetch(`/api/geocode?${params.toString()}`);
    if (!response.ok) return null;
    const data = await response.json();
    if (!data?.latitude || !data?.longitude) return null;
    return {
      latitude: String(data.latitude),
      longitude: String(data.longitude),
    };
  } catch {
    return null;
  }
}

import { pincodeRegex } from "@/src/validation/schemas";

/**
 * Fetch state + cities from India Post public API.
 * Falls back to null on failure (caller uses master data).
 */
export async function lookupPincode(pincode) {
  const code = String(pincode || "").trim();
  if (!pincodeRegex.test(code)) return null;

  try {
    const response = await fetch(`https://api.postalpincode.in/pincode/${code}`);
    if (!response.ok) return null;
    const data = await response.json();
    const entry = Array.isArray(data) ? data[0] : null;
    if (!entry || entry.Status !== "Success" || !entry.PostOffice?.length) {
      return null;
    }

    const offices = entry.PostOffice;
    const state = offices[0].State || "";
    const district = offices[0].District || "";
    const cities = [
      ...new Set(
        offices
          .map((office) => office.Name || office.Block || office.District)
          .filter(Boolean)
      ),
    ];

    return {
      state,
      district,
      cities,
      city: cities[0] || district || "",
    };
  } catch {
    return null;
  }
}

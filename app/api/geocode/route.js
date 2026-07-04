import { NextResponse } from "next/server";

const USER_AGENT = "PayTrue/1.0 (goodlinkservices; contact@paytrue.in)";

async function nominatimSearch(query) {
  const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1&countrycodes=in`;
  const response = await fetch(url, {
    headers: {
      Accept: "application/json",
      "User-Agent": USER_AGENT,
    },
    next: { revalidate: 86400 },
  });

  if (!response.ok) return null;

  const results = await response.json();
  const hit = results?.[0];
  if (!hit?.lat || !hit?.lon) return null;

  return {
    latitude: Number(hit.lat).toFixed(6),
    longitude: Number(hit.lon).toFixed(6),
  };
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const pincode = String(searchParams.get("pincode") || "").trim();
  const city = String(searchParams.get("city") || "").trim();
  const state = String(searchParams.get("state") || "").trim();
  const district = String(searchParams.get("district") || "").trim();

  if (!pincode && !city && !state) {
    return NextResponse.json({ error: "Location required" }, { status: 400 });
  }

  const queries = [
    [pincode, city, state, "India"].filter(Boolean).join(", "),
    [pincode, district, state, "India"].filter(Boolean).join(", "),
    [pincode, state, "India"].filter(Boolean).join(", "),
    pincode ? `${pincode}, India` : "",
  ].filter(Boolean);

  try {
    for (const query of queries) {
      const coords = await nominatimSearch(query);
      if (coords) {
        return NextResponse.json(coords);
      }
    }

    return NextResponse.json({ error: "Coordinates not found" }, { status: 404 });
  } catch {
    return NextResponse.json({ error: "Geocoding failed" }, { status: 502 });
  }
}

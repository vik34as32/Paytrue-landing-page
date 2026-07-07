const MAX_GEO_DECIMALS = 7;

export function formatGeoCoordinate(
  value: number | string,
  axis: "latitude" | "longitude"
): string {
  const num = typeof value === "number" ? value : Number(String(value).trim());
  if (!Number.isFinite(num)) {
    throw new Error(`Invalid ${axis}.`);
  }

  const min = axis === "latitude" ? -90 : -180;
  const max = axis === "latitude" ? 90 : 180;

  if (num < min || num > max) {
    throw new Error(
      axis === "latitude"
        ? "Invalid latitude — must be between -90 and 90."
        : "Invalid longitude — must be between -180 and 180."
    );
  }

  return parseFloat(num.toFixed(MAX_GEO_DECIMALS)).toString();
}

export function formatGeoLocation(location: {
  latitude: number | string;
  longitude: number | string;
}): { latitude: string; longitude: string } {
  return {
    latitude: formatGeoCoordinate(location.latitude, "latitude"),
    longitude: formatGeoCoordinate(location.longitude, "longitude"),
  };
}

import api from "@/src/lib/axios";
import { API_ENDPOINTS } from "@/src/constants/api";
import { resolveRetailerNameFields } from "@/src/lib/userNameUtils";
import { mapApiUserToFormValues } from "@/src/lib/buildUserFormData";

export interface RetailerProfileFormValues {
  name: string;
  email: string;
  mobile: string;
  alternateMobile: string;
  gender: string;
  dateOfBirth: string;
  shopName: string;
  businessName: string;
  gstNumber: string;
  panNumber: string;
  addressLine1: string;
  addressLine2: string;
  state: string;
  district: string;
  city: string;
  pincode: string;
  latitude: string;
  longitude: string;
  currentAddress: string;
  lastLocationUpdatedAt?: string;
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

function pickString(...values: unknown[]): string {
  for (const value of values) {
    if (value != null && String(value).trim()) return String(value).trim();
  }
  return "";
}

export function mapUserToProfileForm(
  user: Record<string, unknown> | null | undefined
): RetailerProfileFormValues {
  const mapped = mapApiUserToFormValues(user || {});
  const outlet = asRecord(user?.outlet);
  const addressRaw = pickString(mapped.address, user?.address);
  const [line1, ...rest] = addressRaw.split(/\n|,/).map((part) => part.trim());
  const addressLine2 =
    pickString(outlet.addressLine2, user?.addressLine2) ||
    (rest.length ? rest.join(", ") : "");

  const name =
    pickString(user?.name, user?.fullName) ||
    `${mapped.firstName || ""} ${mapped.lastName || ""}`.trim();

  return {
    name,
    email: mapped.email || "",
    mobile: mapped.mobile || "",
    alternateMobile: mapped.alternateMobileNumber || "",
    gender: mapped.gender || "",
    dateOfBirth: String(mapped.dateOfBirth || "").slice(0, 10),
    shopName: mapped.outletName || pickString(outlet.shopName) || "",
    businessName:
      pickString(outlet.businessName, user?.businessName) ||
      pickString(mapped.businessType) ||
      "",
    gstNumber: mapped.gstNumber || "",
    panNumber: mapped.panNumber || "",
    addressLine1: line1 || addressRaw,
    addressLine2,
    state: mapped.state || "",
    district: mapped.district || "",
    city: mapped.city || "",
    pincode: mapped.pincode || "",
    latitude: mapped.latitude || "",
    longitude: mapped.longitude || "",
    currentAddress: addressRaw,
    lastLocationUpdatedAt: pickString(
      outlet.locationUpdatedAt,
      outlet.lastLocationUpdatedAt,
      user?.locationUpdatedAt,
      user?.updatedAt
    ),
  };
}

/** Build JSON body compatible with PUT /users/:id */
export function buildRetailerProfileUpdatePayload(
  values: RetailerProfileFormValues
): Record<string, unknown> {
  const { firstName, lastName } = resolveRetailerNameFields({
    fullName: values.name,
  });

  const address = [values.addressLine1, values.addressLine2]
    .map((part) => part.trim())
    .filter(Boolean)
    .join(", ");

  const latitude = values.latitude ? Number(values.latitude) : undefined;
  const longitude = values.longitude ? Number(values.longitude) : undefined;

  const body: Record<string, unknown> = {
    firstName,
    lastName,
    email: values.email,
    mobile: values.mobile,
    alternateMobileNumber: values.alternateMobile,
    gender: values.gender,
    dateOfBirth: values.dateOfBirth,
    address,
    state: values.state,
    city: values.city,
    pincode: values.pincode,
    outlet: {
      outletName: values.shopName,
      businessName: values.businessName,
      businessType: values.businessName,
      gstNumber: values.gstNumber,
      address,
      addressLine2: values.addressLine2,
      state: values.state,
      district: values.district,
      city: values.city,
      pincode: values.pincode,
      ...(Number.isFinite(latitude) ? { latitude } : {}),
      ...(Number.isFinite(longitude) ? { longitude } : {}),
      locationUpdatedAt: new Date().toISOString(),
    },
    kyc: {
      panNumber: values.panNumber
        ? String(values.panNumber).toUpperCase()
        : "",
    },
  };

  if (Number.isFinite(latitude)) body.latitude = latitude;
  if (Number.isFinite(longitude)) body.longitude = longitude;

  return body;
}

export async function fetchUserById(id: string): Promise<Record<string, unknown>> {
  const response = await api.get(`${API_ENDPOINTS.users}/${id}`);
  return (response.data?.data || response.data) as Record<string, unknown>;
}

export async function updateUserById(
  id: string,
  values: RetailerProfileFormValues
): Promise<Record<string, unknown>> {
  const body = buildRetailerProfileUpdatePayload(values);
  const response = await api.put(`${API_ENDPOINTS.users}/${id}`, body);
  return (response.data?.data || response.data) as Record<string, unknown>;
}

export async function reverseGeocodeAddress(
  latitude: number,
  longitude: number
): Promise<string> {
  const url = new URL("https://nominatim.openstreetmap.org/reverse");
  url.searchParams.set("format", "jsonv2");
  url.searchParams.set("lat", String(latitude));
  url.searchParams.set("lon", String(longitude));
  url.searchParams.set("zoom", "18");
  url.searchParams.set("addressdetails", "1");

  const response = await fetch(url.toString(), {
    headers: {
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    throw new Error("Unable to resolve address for this location.");
  }

  const data = (await response.json()) as {
    display_name?: string;
    address?: Record<string, string>;
  };

  return data.display_name || "Address not found";
}

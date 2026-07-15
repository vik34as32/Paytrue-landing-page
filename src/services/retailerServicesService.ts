import api from "@/src/lib/axios";
import { RETAILER_SERVICES_ENDPOINT } from "@/src/constants/retailerServices";

/** GET /api/v1/retailer/services — raw payload (normalized by store). */
export async function fetchRetailerServices(): Promise<unknown> {
  const response = await api.get(RETAILER_SERVICES_ENDPOINT);
  return response.data;
}

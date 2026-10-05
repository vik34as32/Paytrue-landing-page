import { create } from "zustand";
import {
  findChildServiceId,
  normalizeRetailerServicesPayload,
  normalizeServiceNameKey,
} from "@/src/lib/retailerServices";
import { fetchRetailerServices } from "@/src/services/retailerServicesService";
import {
  CCBP_PARENT_SERVICE_CODE,
  CCBP_SERVICE_CODE,
  DMT1_SERVICE_NAME_ALIASES,
  DMT3_SERVICE_CODE,
  DMT3_SERVICE_NAME_ALIASES,
  RETAILER_SERVICE_NAMES,
  UPI_CASH_POINT_ALIASES,
  XPRESS_DMT_SERVICE_CODE,
  XPRESS_DMT_SERVICE_NAME_ALIASES,
} from "@/src/constants/retailerServices";
import type {
  RetailerChildService,
  RetailerParentService,
} from "@/src/types/retailerServices";
import type { DmtTransferMode } from "@/src/modules/dmt/types";

interface RetailerServicesStore {
  parents: RetailerParentService[];
  children: RetailerChildService[];
  loaded: boolean;
  loading: boolean;
  error: string | null;
  fetchedAt: number | null;
  setFromPayload: (payload: unknown) => void;
  setError: (message: string | null) => void;
  setLoading: (loading: boolean) => void;
  reset: () => void;
}

const initialState = {
  parents: [] as RetailerParentService[],
  children: [] as RetailerChildService[],
  loaded: false,
  loading: false,
  error: null as string | null,
  fetchedAt: null as number | null,
};

export const useRetailerServicesStore = create<RetailerServicesStore>((set) => ({
  ...initialState,
  setFromPayload: (payload) => {
    const normalized = normalizeRetailerServicesPayload(payload);
    set({
      parents: normalized.parents,
      children: normalized.children,
      loaded: true,
      loading: false,
      error: null,
      fetchedAt: Date.now(),
    });
  },
  setError: (message) => set({ error: message, loading: false }),
  setLoading: (loading) => set({ loading }),
  reset: () => set({ ...initialState }),
}));

let loadPromise: Promise<void> | null = null;

/** Fetch once and cache in Zustand. Safe to call from React or services. */
export async function ensureRetailerServicesLoaded(force = false): Promise<void> {
  const state = useRetailerServicesStore.getState();
  if (!force && state.loaded && state.children.length > 0) return;

  if (loadPromise) {
    await loadPromise;
    return;
  }

  loadPromise = (async () => {
    useRetailerServicesStore.getState().setLoading(true);
    try {
      const payload = await fetchRetailerServices();
      useRetailerServicesStore.getState().setFromPayload(payload);
    } catch (error) {
      const message =
        (error as { message?: string })?.message ||
        "Failed to load retailer services.";
      useRetailerServicesStore.getState().setError(message);
      throw error instanceof Error ? error : new Error(message);
    } finally {
      loadPromise = null;
    }
  })();

  await loadPromise;
}

/**
 * Resolve child service UUID by display name.
 * Never returns serviceCode — IDs only.
 */
export function getServiceId(serviceName: string): string {
  const { children, loaded } = useRetailerServicesStore.getState();
  if (!loaded) {
    throw new Error(
      "Retailer services are not loaded yet. Please wait and try again."
    );
  }

  const id = findChildServiceId(children, serviceName);
  if (!id) {
    throw new Error(`Service not found: ${serviceName}`);
  }
  return id;
}

export async function resolveServiceId(serviceName: string): Promise<string> {
  await ensureRetailerServicesLoaded();
  return getServiceId(serviceName);
}

export function getDmtTransferServiceId(transferMode: DmtTransferMode): string {
  const name =
    transferMode === "NEFT"
      ? RETAILER_SERVICE_NAMES.DMT_NEFT
      : RETAILER_SERVICE_NAMES.DMT_IMPS;
  return getServiceId(name);
}

export async function resolveDmtTransferServiceId(
  transferMode: DmtTransferMode
): Promise<string> {
  await ensureRetailerServicesLoaded();
  return getDmtTransferServiceId(transferMode);
}

export function getUpiCashPointServiceId(): string {
  for (const alias of UPI_CASH_POINT_ALIASES) {
    try {
      return getServiceId(alias);
    } catch {
      /* try next alias */
    }
  }
  throw new Error(
    "UPI Cash Point service is not configured. Contact support if this persists."
  );
}

export async function resolveUpiCashPointServiceId(): Promise<string> {
  await ensureRetailerServicesLoaded();
  return getUpiCashPointServiceId();
}

export interface ResolvedRetailerService {
  serviceId: string;
  serviceCode: string;
  name: string;
}

function catalogRows(): Array<{ id: string; name: string; code?: string }> {
  const { children, parents } = useRetailerServicesStore.getState();
  return [
    ...children,
    ...parents.map((parent) => ({
      id: parent.id,
      name: parent.name,
      code: parent.code,
    })),
  ];
}

/** Resolve DMT3 from GET /retailer/services — prefers serviceCode 104. */
export function getDmt3Service(): ResolvedRetailerService {
  const { loaded } = useRetailerServicesStore.getState();
  if (!loaded) {
    throw new Error(
      "Retailer services are not loaded yet. Please wait and try again."
    );
  }

  const rows = catalogRows();
  const byCode = rows.find(
    (row) => String(row.code || "").trim() === DMT3_SERVICE_CODE
  );
  if (byCode?.id) {
    return {
      serviceId: byCode.id,
      serviceCode: String(byCode.code || DMT3_SERVICE_CODE).trim(),
      name: byCode.name,
    };
  }

  for (const alias of DMT3_SERVICE_NAME_ALIASES) {
    const target = normalizeServiceNameKey(alias);
    const match = rows.find(
      (row) => normalizeServiceNameKey(row.name) === target
    );
    if (match?.id) {
      return {
        serviceId: match.id,
        serviceCode: String(match.code || DMT3_SERVICE_CODE).trim() || DMT3_SERVICE_CODE,
        name: match.name,
      };
    }
  }

  throw new Error("DMT3 service (code 104) is not configured. Contact support.");
}

export async function resolveDmt3Service(): Promise<ResolvedRetailerService> {
  await ensureRetailerServicesLoaded();
  return getDmt3Service();
}

/** Resolve DMT1 InstantPay remittance from GET /retailer/services (name aliases). */
export function getDmt1Service(): ResolvedRetailerService {
  const { loaded } = useRetailerServicesStore.getState();
  if (!loaded) {
    throw new Error(
      "Retailer services are not loaded yet. Please wait and try again."
    );
  }

  const rows = catalogRows();
  for (const alias of DMT1_SERVICE_NAME_ALIASES) {
    const target = normalizeServiceNameKey(alias);
    const match = rows.find(
      (row) => normalizeServiceNameKey(row.name) === target
    );
    if (match?.id) {
      return {
        serviceId: match.id,
        serviceCode: String(match.code || "").trim(),
        name: match.name,
      };
    }
  }

  // Soft match: name contains "dmt1" / "dmt 1" / "instant"
  const soft = rows.find((row) => {
    const key = normalizeServiceNameKey(row.name);
    return (
      key.includes("dmt1") ||
      key.includes("dmt 1") ||
      (key.includes("instant") && key.includes("dmt"))
    );
  });
  if (soft?.id) {
    return {
      serviceId: soft.id,
      serviceCode: String(soft.code || "").trim(),
      name: soft.name,
    };
  }

  throw new Error("DMT1 service is not configured. Contact support.");
}

export async function resolveDmt1Service(): Promise<ResolvedRetailerService> {
  await ensureRetailerServicesLoaded();
  return getDmt1Service();
}

/** Resolve Xpress DMT (DMT2 module) from GET /retailer/services — prefers serviceCode DMT004. */
export function getXpressDmtService(): ResolvedRetailerService {
  const { loaded } = useRetailerServicesStore.getState();
  if (!loaded) {
    throw new Error(
      "Retailer services are not loaded yet. Please wait and try again."
    );
  }

  const rows = catalogRows();
  const byCode = rows.find(
    (row) =>
      String(row.code || "").trim().toUpperCase() === XPRESS_DMT_SERVICE_CODE
  );
  if (byCode?.id) {
    return {
      serviceId: byCode.id,
      serviceCode: XPRESS_DMT_SERVICE_CODE,
      name: byCode.name,
    };
  }

  for (const alias of XPRESS_DMT_SERVICE_NAME_ALIASES) {
    const target = normalizeServiceNameKey(alias);
    const match = rows.find(
      (row) => normalizeServiceNameKey(row.name) === target
    );
    if (match?.id) {
      return {
        serviceId: match.id,
        serviceCode: XPRESS_DMT_SERVICE_CODE,
        name: match.name,
      };
    }
  }

  throw new Error(
    `Xpress DMT service (code ${XPRESS_DMT_SERVICE_CODE}) is not configured. Contact support.`
  );
}

export async function resolveXpressDmtService(): Promise<ResolvedRetailerService> {
  await ensureRetailerServicesLoaded();
  return getXpressDmtService();
}

/** Resolve Credit Card → Bill Payment from GET /retailer/services — prefers serviceCode CREDIT_CARD_BILL_PAYMENT. */
export function getCcbpService(): ResolvedRetailerService {
  const { loaded, parents, children } = useRetailerServicesStore.getState();
  if (!loaded) {
    throw new Error(
      "Retailer services are not loaded yet. Please wait and try again."
    );
  }

  const byCode = children.find(
    (row) => String(row.code || "").trim().toUpperCase() === CCBP_SERVICE_CODE
  );
  if (byCode?.id) {
    return { serviceId: byCode.id, serviceCode: CCBP_SERVICE_CODE, name: byCode.name };
  }

  const parent = parents.find(
    (row) =>
      String(row.code || "").trim().toUpperCase() === CCBP_PARENT_SERVICE_CODE ||
      normalizeServiceNameKey(row.name) === normalizeServiceNameKey("Credit Card")
  );
  const byName = parent?.children.find(
    (row) => normalizeServiceNameKey(row.name) === normalizeServiceNameKey("Bill Payment")
  );
  if (byName?.id) {
    return { serviceId: byName.id, serviceCode: CCBP_SERVICE_CODE, name: byName.name };
  }

  throw new Error(
    `Credit card bill payment service (code ${CCBP_SERVICE_CODE}) is not configured. Contact support.`
  );
}

export async function resolveCcbpService(): Promise<ResolvedRetailerService> {
  await ensureRetailerServicesLoaded();
  return getCcbpService();
}

export function appendServiceId<T extends Record<string, unknown>>(
  body: T,
  serviceName: string
): T & { serviceId: string } {
  return {
    ...body,
    serviceId: getServiceId(serviceName),
  };
}

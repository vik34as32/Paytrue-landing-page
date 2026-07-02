import { retailerOwnFundRequests } from "@/src/mock/retailerFundRequestHistory";
import type {
  CreateFundRequestPayload,
  FundRequest,
} from "@/src/types/fundRequest";

const delay = (ms = 450) =>
  new Promise<void>((resolve) => setTimeout(resolve, ms));

function generateId(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}

function generateRequestId(prefix: string): string {
  return `${prefix}${Math.floor(10000 + Math.random() * 90000)}`;
}

let requestStore: FundRequest[] = [...retailerOwnFundRequests];

export async function fetchRetailerOwnFundRequests(): Promise<FundRequest[]> {
  await delay();
  return [...requestStore].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export async function createRetailerFundRequest(
  payload: CreateFundRequestPayload
): Promise<FundRequest> {
  await delay(600);

  const now = new Date().toISOString();
  const request: FundRequest = {
    id: generateId("fr_rt"),
    requestId: generateRequestId("FRRT"),
    amount: payload.amount,
    paymentMode: payload.paymentMode,
    utrNumber: payload.utrNumber?.trim() ?? "",
    paymentDate: payload.paymentDate,
    remark: payload.remark?.trim() ?? "",
    status: "pending",
    createdBy: payload.createdBy,
    approvedBy: "",
    approvedDate: "",
    createdAt: now,
    updatedAt: now,
  };

  requestStore = [request, ...requestStore];
  return request;
}

export async function cancelRetailerFundRequest(
  requestId: string
): Promise<FundRequest> {
  await delay(400);

  const index = requestStore.findIndex((item) => item.id === requestId);
  if (index === -1) {
    throw new Error("Fund request not found");
  }

  const request = requestStore[index];
  if (request.status !== "pending") {
    throw new Error("Only pending requests can be cancelled");
  }

  const updated: FundRequest = {
    ...request,
    status: "cancelled",
    updatedAt: new Date().toISOString(),
  };

  requestStore[index] = updated;
  return updated;
}

export function resetRetailerFundRequestStore(): void {
  requestStore = [...retailerOwnFundRequests];
}

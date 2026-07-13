import { formatGeoLocation } from "@/src/lib/geoUtils";
import { getCurrentLocation } from "@/src/lib/rdService";
import { unwrapApiData } from "@/src/lib/dmtUtils";
import type {
  VerifyBankAccountPayload,
  VerifyBankAccountResponse,
} from "@/src/types/dmt";

const FALLBACK_COORDS = {
  latitude: "20.5936",
  longitude: "78.9628",
};

const ACCOUNT_REGEX = /^\d{9,18}$/;
const IFSC_REGEX = /^[A-Z]{4}0[A-Z0-9]{6}$/;

export async function resolveDmtGeoCoordinates(): Promise<{
  latitude: string;
  longitude: string;
}> {
  try {
    return await getCurrentLocation();
  } catch {
    return FALLBACK_COORDS;
  }
}

export function buildVerifyBankAccountPayload(input: {
  accountNumber: string;
  ifscCode: string;
  name?: string;
  pennyDrop?: "YES" | "NO" | "AUTO";
  latitude: string;
  longitude: string;
}): VerifyBankAccountPayload {
  const coords = formatGeoLocation({
    latitude: input.latitude,
    longitude: input.longitude,
  });

  const payload: VerifyBankAccountPayload = {
    accountNumber: input.accountNumber.trim(),
    bankIfsc: input.ifscCode.trim().toUpperCase(),
    pennyDrop: input.pennyDrop ?? "YES",
    latitude: coords.latitude,
    longitude: coords.longitude,
  };

  const name = input.name?.trim();
  if (name) {
    payload.name = name;
  }

  return payload;
}

export function normalizeVerifyBankAccountResponse(
  payload: unknown
): VerifyBankAccountResponse {
  const data = unwrapApiData<Record<string, unknown>>(payload) ?? {};
  const payeeRaw = (data.payee as Record<string, unknown>) ?? {};

  return {
    verified: Boolean(data.verified),
    statuscode: data.statuscode ? String(data.statuscode) : undefined,
    status: data.status ? String(data.status) : undefined,
    externalRef: data.externalRef ? String(data.externalRef) : undefined,
    payee: {
      name: payeeRaw.name ? String(payeeRaw.name) : null,
      account: payeeRaw.account ? String(payeeRaw.account) : undefined,
      ifsc: payeeRaw.ifsc ? String(payeeRaw.ifsc) : undefined,
      accountType: payeeRaw.accountType ? String(payeeRaw.accountType) : null,
      nameMatchPercent:
        payeeRaw.nameMatchPercent === null || payeeRaw.nameMatchPercent === undefined
          ? null
          : Number(payeeRaw.nameMatchPercent),
      nameMatchResult: payeeRaw.nameMatchResult
        ? String(payeeRaw.nameMatchResult)
        : null,
    },
  };
}

export function validateBankVerifyInputs(input: {
  accountNumber: string;
  ifscCode: string;
}): string | null {
  const accountNumber = input.accountNumber.trim();
  const ifscCode = input.ifscCode.trim().toUpperCase();

  if (!accountNumber) return "Enter account number first";
  if (!ACCOUNT_REGEX.test(accountNumber)) return "Enter valid 9-18 digit account number";
  if (!ifscCode) return "Enter IFSC code first";
  if (!IFSC_REGEX.test(ifscCode)) return "Enter valid IFSC code";

  return null;
}

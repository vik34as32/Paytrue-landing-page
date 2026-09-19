"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchDownlineRetailerLedger } from "@/src/services/downlineLedgerService";
import type {
  DownlineLedgerListParams,
  DownlineLedgerPortalRole,
} from "@/src/types/downlineLedger";

export const downlineLedgerQueryKey = (role: DownlineLedgerPortalRole) =>
  ["report", role] as const;

export function useDownlineLedger(
  params: DownlineLedgerListParams,
  role: DownlineLedgerPortalRole
) {
  return useQuery({
    queryKey: [...downlineLedgerQueryKey(role), params],
    queryFn: () => fetchDownlineRetailerLedger(params),
    staleTime: 20_000,
    placeholderData: (previous) => previous,
  });
}

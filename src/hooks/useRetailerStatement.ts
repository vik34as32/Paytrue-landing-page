"use client";

import { useQuery } from "@tanstack/react-query";
import {
  fetchRetailerStatement,
  type StatementFetchOptions,
} from "@/src/services/statementService";

export const STATEMENT_QUERY_KEY = ["retailer", "statement"] as const;

export function useRetailerStatement(options: StatementFetchOptions = {}) {
  const page = options.page ?? 1;
  const limit = options.limit ?? 100;

  return useQuery({
    queryKey: [...STATEMENT_QUERY_KEY, page, limit],
    queryFn: () => fetchRetailerStatement({ page, limit }),
    staleTime: 30_000,
    placeholderData: (previous) => previous,
  });
}

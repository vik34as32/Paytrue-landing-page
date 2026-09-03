"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import dmt3Api from "../services/dmt3.api";
import Dmt3TransactionHistory from "../components/Dmt3TransactionHistory";
import type { Dmt3PaginationMeta, Dmt3Transaction } from "../types/dmt3.types";

const EMPTY_PAGINATION: Dmt3PaginationMeta = {
  page: 1,
  limit: 20,
  total: 0,
  totalPages: 1,
};

export default function Dmt3TransactionsPage() {
  const [items, setItems] = useState<Dmt3Transaction[]>([]);
  const [pagination, setPagination] =
    useState<Dmt3PaginationMeta>(EMPTY_PAGINATION);
  const [loading, setLoading] = useState(false);

  const loadPage = useCallback(async (page: number) => {
    setLoading(true);
    try {
      const result = await dmt3Api.getTransactions({ page, limit: 20 });
      setItems(result.items);
      setPagination(result.pagination);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to load transactions"
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadPage(1);
  }, [loadPage]);

  return (
    <Dmt3TransactionHistory
      items={items}
      pagination={pagination}
      loading={loading}
      onPageChange={(page) => void loadPage(page)}
    />
  );
}

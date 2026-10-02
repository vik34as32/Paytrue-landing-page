"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import dmt1Api from "../services/dmt1.api";
import Dmt1TransactionHistory from "../components/Dmt1TransactionHistory";
import type { Dmt1PaginationMeta, Dmt1Transaction } from "../types/dmt1.types";

const EMPTY_PAGINATION: Dmt1PaginationMeta = {
  page: 1,
  limit: 20,
  total: 0,
  totalPages: 1,
};

export default function Dmt1TransactionsPage() {
  const [items, setItems] = useState<Dmt1Transaction[]>([]);
  const [pagination, setPagination] =
    useState<Dmt1PaginationMeta>(EMPTY_PAGINATION);
  const [loading, setLoading] = useState(false);

  const loadPage = useCallback(async (page: number) => {
    setLoading(true);
    try {
      const result = await dmt1Api.getTransactions({ page, limit: 20 });
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
    <Dmt1TransactionHistory
      items={items}
      pagination={pagination}
      loading={loading}
      onPageChange={(page) => void loadPage(page)}
    />
  );
}

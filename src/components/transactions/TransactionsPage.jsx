"use client";

import { useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { FileText } from "lucide-react";
import PageHeader from "@/src/components/common/PageHeader";
import DataTable from "@/src/components/common/DataTable";
import StatusBadge from "@/src/components/common/StatusBadge";
import StatsCards from "@/src/components/dashboard/StatsCards";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import {
  fetchMdTransactions,
  fetchDdTransactions,
} from "@/src/redux/thunks/transactionThunk";
import {
  selectMdTransactions,
  selectDdTransactions,
  selectTransactionLoading,
  selectDdTransactionSummary,
} from "@/src/redux/slices/transactionSlice";

const ddSummaryStats = [
  {
    id: "total_balance_transferred",
    label: "Total Balance Transferred",
    valueKey: "totalBalanceTransferred",
    icon: "IndianRupee",
    format: "currency",
    trend: "up",
    change: "+5%",
  },
  {
    id: "total_approved_requests",
    label: "Total Approved Requests",
    valueKey: "totalApprovedRequests",
    icon: "Users",
    format: "number",
    trend: "up",
    change: "+2",
  },
  {
    id: "total_rejected_requests",
    label: "Total Rejected Requests",
    valueKey: "totalRejectedRequests",
    icon: "Activity",
    format: "number",
    trend: "down",
    change: "-1",
  },
  {
    id: "total_failed_transactions",
    label: "Total Failed Transactions",
    valueKey: "totalFailedTransactions",
    icon: "TrendingUp",
    format: "number",
    trend: "down",
    change: "0",
  },
];

export default function TransactionsPage({ role }) {
  const dispatch = useDispatch();
  const isMd = role === "md";
  const mdTransactions = useSelector(selectMdTransactions);
  const ddTransactions = useSelector(selectDdTransactions);
  const loading = useSelector(selectTransactionLoading);
  const summary = useSelector(selectDdTransactionSummary);

  const transactions = isMd ? mdTransactions : ddTransactions;

  useEffect(() => {
    if (isMd) {
      dispatch(fetchMdTransactions());
    } else {
      dispatch(fetchDdTransactions());
    }
  }, [dispatch, isMd]);

  const mdColumns = useMemo(
    () => [
      { key: "transactionId", label: "Transaction ID" },
      { key: "transactionType", label: "Transaction Type" },
      { key: "distributorName", label: "Distributor Name" },
      {
        key: "amount",
        label: "Amount",
        render: (row) => formatCurrency(row.amount),
      },
      {
        key: "openingBalance",
        label: "Opening Balance",
        render: (row) => formatCurrency(row.openingBalance),
      },
      {
        key: "closingBalance",
        label: "Closing Balance",
        render: (row) => formatCurrency(row.closingBalance),
      },
      {
        key: "status",
        label: "Status",
        render: (row) => <StatusBadge status={row.status} />,
      },
      {
        key: "dateTime",
        label: "Date Time",
        render: (row) => new Date(row.dateTime).toLocaleString("en-IN"),
      },
      { key: "remark", label: "Remark" },
    ],
    []
  );

  const ddColumns = useMemo(
    () => [
      { key: "transactionId", label: "Transaction ID" },
      { key: "retailerName", label: "Retailer" },
      { key: "transactionType", label: "Type" },
      {
        key: "amount",
        label: "Amount",
        render: (row) => formatCurrency(row.amount),
      },
      {
        key: "status",
        label: "Status",
        render: (row) => <StatusBadge status={row.status} />,
      },
      {
        key: "dateTime",
        label: "Date",
        render: (row) => new Date(row.dateTime).toLocaleString("en-IN"),
      },
      { key: "remark", label: "Remark" },
    ],
    []
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Transactions"
        description="Complete transaction history"
        icon={FileText}
        backHref={isMd ? "/md/dashboard" : "/dd/dashboard"}
      />

      {!isMd && (
        <StatsCards stats={ddSummaryStats} values={summary} loading={loading} />
      )}

      <Card>
        <CardHeader>
          <CardTitle>Transaction History</CardTitle>
          <CardDescription>{transactions.length} records found</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="py-12 text-center text-sm text-slate-500">Loading...</p>
          ) : (
            <DataTable
              columns={isMd ? mdColumns : ddColumns}
              rows={transactions}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}

"use client";

import DataTable from "react-data-table-component";
import { Store } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  cyanDataTableStyles,
  CyanDataTableSortIcon,
} from "@/src/components/common/cyanDataTableStyles";
import type { BusinessBreakdownItem } from "@/src/types/masterDistributorDashboard";

function getDisplayName(user: BusinessBreakdownItem["user"] = {}) {
  const fullName = `${user.name || ""}`.trim();
  if (fullName) return fullName;
  return user.email || user.userCode || "Distributor";
}

export default function MasterDistributorBusinessBreakdown({
  breakdown = [],
  retailerCount = 0,
  loading = false,
}: {
  breakdown?: BusinessBreakdownItem[];
  retailerCount?: number;
  loading?: boolean;
}) {
  const columns = [
    {
      id: "name",
      name: "Distributor",
      selector: (row: BusinessBreakdownItem) => getDisplayName(row.user),
      sortable: true,
      minWidth: "180px",
      cell: (row: BusinessBreakdownItem) => (
        <div>
          <p className="font-semibold text-[#0b1f3a]">{getDisplayName(row.user)}</p>
          <p className="text-xs text-slate-500">{row.user?.userCode || row.user?.email || "—"}</p>
        </div>
      ),
    },
    {
      id: "retailerCount",
      name: "Retailers",
      selector: (row: BusinessBreakdownItem) => row.retailerCount || 0,
      sortable: true,
      center: true,
      minWidth: "100px",
    },
    {
      id: "today",
      name: "Today",
      selector: (row: BusinessBreakdownItem) => row.business?.today || 0,
      sortable: true,
      minWidth: "120px",
      cell: (row: BusinessBreakdownItem) => (
        <span className="font-semibold text-emerald-700">
          {formatCurrency(row.business?.today || 0)}
        </span>
      ),
    },
    {
      id: "monthly",
      name: "Monthly",
      selector: (row: BusinessBreakdownItem) => row.business?.monthly || 0,
      sortable: true,
      minWidth: "120px",
      cell: (row: BusinessBreakdownItem) => formatCurrency(row.business?.monthly || 0),
    },
    {
      id: "yearly",
      name: "Yearly",
      selector: (row: BusinessBreakdownItem) => row.business?.yearly || 0,
      sortable: true,
      minWidth: "120px",
      cell: (row: BusinessBreakdownItem) => formatCurrency(row.business?.yearly || 0),
    },
    {
      id: "total",
      name: "Total",
      selector: (row: BusinessBreakdownItem) => row.business?.total || 0,
      sortable: true,
      minWidth: "130px",
      cell: (row: BusinessBreakdownItem) => (
        <span className="font-bold text-[#1565d8]">
          {formatCurrency(row.business?.total || 0)}
        </span>
      ),
    },
  ];

  return (
    <Card className="overflow-hidden rounded-2xl border-slate-200/80 shadow-sm">
      <CardHeader className="border-b border-slate-100 bg-slate-50/50">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <CardTitle className="text-[#001F5B]">Distributor Business Breakdown</CardTitle>
            <CardDescription>
              Per-distributor business volume across your network
            </CardDescription>
          </div>
          <div className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm">
            <Store className="h-4 w-4 text-[#1565d8]" />
            <span className="text-slate-500">Total Retailers</span>
            <span className="font-bold text-[#0b1f3a]">{retailerCount}</span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="px-0 pb-0">
        <div className="paytrue-cyan-datatable overflow-x-auto px-4 pb-4 sm:px-6">
          <DataTable
            columns={columns}
            data={breakdown}
            progressPending={loading}
            pagination
            paginationPerPage={8}
            sortIcon={<CyanDataTableSortIcon />}
            highlightOnHover
            striped
            customStyles={cyanDataTableStyles}
            noDataComponent={
              <div className="py-12 text-center text-sm text-slate-500">
                {loading ? "Loading business breakdown..." : "No distributor business data yet"}
              </div>
            }
          />
        </div>
      </CardContent>
    </Card>
  );
}

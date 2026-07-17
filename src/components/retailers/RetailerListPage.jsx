"use client";

import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import Link from "next/link";
import DataTable from "react-data-table-component";
import { Store, Plus, Eye, Pencil, Search } from "lucide-react";
import PageHeader from "@/src/components/common/PageHeader";
import StatusBadge from "@/src/components/common/StatusBadge";
import { BankLogo } from "@/components/retailer/BankLogo";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { fetchRetailers } from "@/src/redux/thunks/retailerThunk";
import {
  selectRetailers,
  selectRetailerLoading,
} from "@/src/redux/slices/retailerSlice";
import { updateDdRetailerCount } from "@/src/redux/slices/dashboardSlice";
import {
  cyanDataTableStyles,
  CyanDataTableSortIcon,
} from "@/src/components/common/cyanDataTableStyles";
import {
  getRetailerInitials,
  maskRetailerAccount,
} from "@/src/lib/retailerListUtils";
import { formatCurrency } from "@/lib/utils";

const TABLE_MIN_WIDTH = "1100px";

function RetailerAvatar({ row }) {
  return (
    <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl bg-[#1565d8]/10 text-xs font-bold text-[#1565d8]">
      {row.profileImage ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={row.profileImage}
          alt={row.name}
          className="h-full w-full object-cover"
        />
      ) : (
        getRetailerInitials(row.name)
      )}
    </div>
  );
}

export default function RetailerListPage() {
  const dispatch = useDispatch();
  const retailers = useSelector(selectRetailers);
  const loading = useSelector(selectRetailerLoading);

  const [search, setSearch] = useState("");

  useEffect(() => {
    dispatch(fetchRetailers({ page: 1, limit: 100 }));
  }, [dispatch]);

  useEffect(() => {
    dispatch(updateDdRetailerCount(retailers.length));
  }, [dispatch, retailers.length]);

  const filteredRetailers = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return retailers;
    return retailers.filter((row) =>
      [
        row.name,
        row.email,
        row.mobile,
        row.alternateMobileNumber,
        row.outletName,
        row.outletId,
        row.bankName,
        row.accountNumber,
        row.accountHolderName,
        row.address,
        row.pincode,
        row.city,
        row.state,
      ]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(query))
    );
  }, [retailers, search]);

  const columns = useMemo(
    () => [
      {
        id: "bank",
        name: "Bank",
        selector: (row) => row.bankName || row.name,
        sortable: true,
        minWidth: "220px",
        grow: 1,
        cell: (row) => (
          <div className="flex min-w-0 items-center gap-2.5 py-1">
            {row.bankName || row.ifscCode ? (
              <BankLogo
                bank={{
                  name: row.bankName || row.name,
                  shortName: row.bankName || row.name,
                  ifscPrefix: row.ifscCode?.slice(0, 4) || "",
                }}
                size={28}
              />
            ) : (
              <RetailerAvatar row={row} />
            )}
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-[#0b1f3a]">
                {row.accountHolderName || row.name || "—"}
              </p>
              <p className="truncate text-[11px] text-slate-500">
                {row.bankName || row.outletName || "—"}
              </p>
            </div>
          </div>
        ),
      },
      {
        id: "account",
        name: "Account",
        selector: (row) => row.accountNumber,
        sortable: true,
        minWidth: "140px",
        cell: (row) => (
          <span className="font-mono text-xs font-medium text-slate-700">
            {row.accountNumber ? maskRetailerAccount(row.accountNumber) : "—"}
          </span>
        ),
      },
      {
        id: "mobile",
        name: "Mobile",
        selector: (row) => row.mobile,
        sortable: true,
        minWidth: "120px",
        cell: (row) => (
          <span className="tabular-nums text-sm text-slate-700">
            {row.mobile || "—"}
          </span>
        ),
      },
      {
        id: "type",
        name: "Type",
        selector: () => "Debit",
        sortable: false,
        minWidth: "100px",
        center: true,
        cell: () => (
          <Badge
            variant="destructive"
            className="rounded-full px-3 py-0.5 text-[11px] font-bold"
          >
            Debit
          </Badge>
        ),
      },
      {
        id: "status",
        name: "Status",
        selector: (row) => row.status,
        sortable: true,
        minWidth: "110px",
        center: true,
        cell: (row) => {
          const normalized = String(row.status || "").toLowerCase();
          const mapped =
            normalized === "active"
              ? "success"
              : normalized === "inactive"
                ? "failed"
                : row.status;
          return <StatusBadge status={mapped} />;
        },
      },
      {
        id: "previousBalance",
        name: "Previous Balance",
        selector: (row) => row.walletBalance ?? 0,
        sortable: true,
        right: true,
        minWidth: "140px",
        cell: (row) => (
          <span className="font-bold tabular-nums text-slate-800">
            {formatCurrency(row.walletBalance ?? 0)}
          </span>
        ),
      },
      {
        id: "actions",
        name: "Actions",
        minWidth: "110px",
        center: true,
        cell: (row) => (
          <div className="flex items-center justify-center gap-1.5">
            <Button
              size="icon"
              variant="outline"
              className="h-8 w-8 shrink-0"
              title="View retailer"
              aria-label="View retailer"
              asChild
            >
              <Link href={`/dd/retailers/${row.id}`}>
                <Eye className="h-4 w-4" />
              </Link>
            </Button>
            <Button
              size="icon"
              variant="outline"
              className="h-8 w-8 shrink-0"
              title="Edit retailer"
              aria-label="Edit retailer"
              asChild
            >
              <Link href={`/dd/retailers/${row.id}/edit`}>
                <Pencil className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        ),
      },
    ],
    []
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Retailers"
        description="Manage your retailer network with complete onboarding details"
        icon={Store}
        actions={
          <Button asChild>
            <Link href="/dd/retailers/create">
              <Plus className="h-4 w-4" />
              Create Retailer
            </Link>
          </Button>
        }
      />

      <Card className="rounded-2xl border-slate-200/80 shadow-sm">
        <CardHeader className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="text-[#001F5B]">Retailer List</CardTitle>
              <CardDescription>
                {filteredRetailers.length} retailer
                {filteredRetailers.length === 1 ? "" : "s"} in your network
              </CardDescription>
            </div>
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search name, bank, mobile, account..."
                className="h-10 pl-9"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="px-0 pb-0">
          <div className="paytrue-cyan-datatable overflow-x-auto px-4 pb-4 sm:px-6">
            <DataTable
              columns={columns}
              data={filteredRetailers}
              progressPending={loading}
              pagination
              paginationPerPage={10}
              paginationRowsPerPageOptions={[10, 25, 50, 100]}
              sortIcon={<CyanDataTableSortIcon />}
              defaultSortFieldId="bank"
              highlightOnHover
              dense
              responsive={false}
              customStyles={{
                ...cyanDataTableStyles,
                table: {
                  style: {
                    ...cyanDataTableStyles.table.style,
                    minWidth: TABLE_MIN_WIDTH,
                  },
                },
                headCells: {
                  style: {
                    ...cyanDataTableStyles.headCells.style,
                    justifyContent: "flex-start",
                    textAlign: "left",
                    textTransform: "uppercase",
                    fontSize: "11px",
                    letterSpacing: "0.04em",
                  },
                },
              }}
              noDataComponent={
                <div className="py-16 text-center text-sm text-slate-500">
                  {loading ? "Loading retailers..." : "No retailers found"}
                </div>
              }
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

"use client";

import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import Link from "next/link";
import DataTable from "react-data-table-component";
import {
  Store,
  Plus,
  Eye,
  Search,
  Download,
  FileSpreadsheet,
  Printer,
} from "lucide-react";
import PageHeader from "@/src/components/common/PageHeader";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  maskRetailerAadhaar,
  maskRetailerPan,
} from "@/src/lib/retailerListUtils";
import { exportToCsv, exportToExcel, printTable } from "@/src/lib/exportUtils";
import { formatCurrency } from "@/lib/utils";

const TABLE_MIN_WIDTH = "1600px";

function TableHeaderLabel({ children }) {
  return (
    <span
      style={{
        display: "inline-block",
        color: "#ffffff",
        fontWeight: 700,
        fontSize: 12,
        letterSpacing: "0.04em",
        textTransform: "uppercase",
        whiteSpace: "nowrap",
        lineHeight: 1.2,
      }}
    >
      {children}
    </span>
  );
}

const EXPORT_COLUMNS = [
  { label: "Name", selector: (row) => row.displayName || row.firstName || "" },
  { label: "User Code", selector: (row) => row.userCode || "" },
  { label: "Email", selector: (row) => row.email || "" },
  { label: "Phone", selector: (row) => row.mobile || "" },
  { label: "Address", selector: (row) => row.address || "" },
  { label: "Outlet Name", selector: (row) => row.outletName || "" },
  {
    label: "Outlet ID",
    selector: (row) => row.instantpayOutletId || row.outletId || "",
  },
  { label: "Aadhaar", selector: (row) => row.aadhaarNumber || "" },
  { label: "PAN", selector: (row) => row.panNumber || "" },
  { label: "Wallet Balance", selector: (row) => row.walletBalance ?? 0 },
  { label: "Status", selector: (row) => row.status || "" },
];

export default function RetailerListPage() {
  const dispatch = useDispatch();
  const retailers = useSelector(selectRetailers);
  const loading = useSelector(selectRetailerLoading);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [miniKycFilter, setMiniKycFilter] = useState("all");

  useEffect(() => {
    dispatch(fetchRetailers({ page: 1, limit: 100 }));
  }, [dispatch]);

  useEffect(() => {
    dispatch(updateDdRetailerCount(retailers.length));
  }, [dispatch, retailers.length]);

  const filteredRetailers = useMemo(() => {
    const query = search.trim().toLowerCase();

    return retailers.filter((row) => {
      if (statusFilter !== "all") {
        const status = String(row.status || "").toLowerCase();
        if (status !== statusFilter) return false;
      }

      if (miniKycFilter !== "all") {
        const mini = String(row.miniKycStatus || "").toUpperCase();
        if (miniKycFilter === "none" && mini) return false;
        if (miniKycFilter !== "none" && mini !== miniKycFilter) return false;
      }

      if (!query) return true;

      return [
        row.displayName,
        row.firstName,
        row.userCode,
        row.email,
        row.mobile,
        row.address,
        row.outletName,
        row.instantpayOutletId,
        row.outletId,
        row.aadhaarNumber,
        row.panNumber,
        row.id,
      ]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(query));
    });
  }, [retailers, search, statusFilter, miniKycFilter]);

  const hasActiveFilters =
    Boolean(search.trim()) || statusFilter !== "all" || miniKycFilter !== "all";

  const exportDisabled = filteredRetailers.length === 0 || loading;

  const columns = useMemo(
    () => [
      {
        id: "name",
        name: "Name",
        selector: (row) => row.displayName || row.firstName,
        sortable: true,
        minWidth: "150px",
        cell: (row) => (
          <div className="min-w-0 py-1.5">
            <p className="truncate text-sm font-bold text-[#0b1f3a]">
              {row.displayName || row.firstName || "—"}
            </p>
            <p className="truncate font-mono text-[11px] text-slate-500">
              {row.userCode || "—"}
            </p>
          </div>
        ),
      },
      {
        id: "email",
        name: "Email",
        selector: (row) => row.email,
        sortable: true,
        minWidth: "200px",
        cell: (row) => (
          <span className="block max-w-[220px] truncate text-xs font-medium text-slate-700">
            {row.email || "—"}
          </span>
        ),
      },
      {
        id: "phone",
        name: "Phone",
        selector: (row) => row.mobile,
        sortable: true,
        minWidth: "120px",
        cell: (row) => (
          <span className="tabular-nums text-sm font-medium text-slate-700">
            {row.mobile || "—"}
          </span>
        ),
      },
      {
        id: "address",
        name: "Address",
        selector: (row) => row.address,
        sortable: true,
        minWidth: "160px",
        cell: (row) => (
          <span
            className="line-clamp-2 max-w-[180px] text-xs leading-snug text-slate-600"
            title={row.address || ""}
          >
            {row.address || "—"}
          </span>
        ),
      },
      {
        id: "outlet",
        name: "Outlet Name",
        selector: (row) => row.outletName,
        sortable: true,
        minWidth: "160px",
        cell: (row) => (
          <span className="block max-w-[180px] truncate text-sm font-semibold text-[#0b1f3a]">
            {row.outletName || "—"}
          </span>
        ),
      },
      {
        id: "outletId",
        name: "Outlet ID",
        selector: (row) => row.instantpayOutletId || row.outletId,
        sortable: true,
        minWidth: "110px",
        cell: (row) => (
          <span className="font-mono text-xs font-semibold text-slate-700">
            {row.instantpayOutletId || row.outletId || "—"}
          </span>
        ),
      },
      {
        id: "aadhaar",
        name: "Aadhaar",
        selector: (row) => row.aadhaarNumber,
        sortable: true,
        minWidth: "130px",
        cell: (row) => (
          <span className="font-mono text-xs text-slate-700">
            {maskRetailerAadhaar(row.aadhaarNumber)}
          </span>
        ),
      },
      {
        id: "pan",
        name: "PAN",
        selector: (row) => row.panNumber,
        sortable: true,
        minWidth: "110px",
        cell: (row) => (
          <span className="font-mono text-xs font-semibold tracking-wide text-slate-700">
            {row.panNumber ? maskRetailerPan(row.panNumber) : "—"}
          </span>
        ),
      },
      {
        id: "wallet",
        name: "Wallet",
        selector: (row) => row.walletBalance ?? 0,
        sortable: true,
        minWidth: "120px",
        cell: (row) => (
          <span className="font-bold tabular-nums text-[#0b1f3a]">
            {formatCurrency(Number(row.walletBalance ?? 0))}
          </span>
        ),
      },
      {
        id: "status",
        name: <TableHeaderLabel>Status</TableHeaderLabel>,
        selector: (row) => row.status,
        sortable: true,
        width: "120px",
        minWidth: "120px",
        grow: 0,
        center: true,
        allowOverflow: true,
        cell: (row) => {
          const active = String(row.status || "").toLowerCase() === "active";
          return (
            <Badge
              className={
                active
                  ? "rounded-full bg-emerald-100 px-3 py-0.5 text-[11px] font-bold text-emerald-700 hover:bg-emerald-100"
                  : "rounded-full bg-slate-100 px-3 py-0.5 text-[11px] font-bold text-slate-600 hover:bg-slate-100"
              }
            >
              {active ? "Active" : String(row.status || "—").toUpperCase()}
            </Badge>
          );
        },
      },
      {
        id: "action",
        name: <TableHeaderLabel>Action</TableHeaderLabel>,
        selector: (row) => row.id,
        sortable: false,
        width: "100px",
        minWidth: "100px",
        grow: 0,
        center: true,
        allowOverflow: true,
        button: true,
        ignoreRowClick: true,
        cell: (row) => (
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
        <CardHeader className="space-y-4 border-b border-slate-100 pb-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <CardTitle className="text-[#001F5B]">Retailer List</CardTitle>
              <CardDescription>
                {filteredRetailers.length} retailer
                {filteredRetailers.length === 1 ? "" : "s"}
                {hasActiveFilters ? " (filtered)" : ""} in your network
              </CardDescription>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="gap-1.5"
                disabled={exportDisabled}
                onClick={() =>
                  exportToCsv(
                    `Paytrue_Retailers_${new Date().toISOString().slice(0, 10)}.csv`,
                    filteredRetailers,
                    EXPORT_COLUMNS
                  )
                }
              >
                <Download className="h-4 w-4" />
                CSV
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="gap-1.5"
                disabled={exportDisabled}
                onClick={() =>
                  exportToExcel(
                    `Paytrue_Retailers_${new Date().toISOString().slice(0, 10)}.xls`,
                    filteredRetailers,
                    EXPORT_COLUMNS
                  )
                }
              >
                <FileSpreadsheet className="h-4 w-4" />
                Excel
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="gap-1.5"
                disabled={exportDisabled}
                onClick={() =>
                  printTable("PayTrue Retailers", filteredRetailers, EXPORT_COLUMNS)
                }
              >
                <Printer className="h-4 w-4" />
                Print
              </Button>
            </div>
          </div>

          <div className="grid gap-3 md:grid-cols-[minmax(0,1.4fr)_160px_180px]">
            <div className="flex min-w-0 flex-col gap-1.5">
              <Label htmlFor="retailer-search" className="text-xs font-medium text-slate-500">
                Search
              </Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                  id="retailer-search"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search name, email, phone, outlet, aadhaar..."
                  className="h-10 pl-9"
                  disabled={loading}
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label className="text-xs font-medium text-slate-500">Status</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="h-10">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label className="text-xs font-medium text-slate-500">Mini KYC</Label>
              <Select value={miniKycFilter} onValueChange={setMiniKycFilter}>
                <SelectTrigger className="h-10">
                  <SelectValue placeholder="Mini KYC" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Mini KYC</SelectItem>
                  <SelectItem value="COMPLETED">Completed</SelectItem>
                  <SelectItem value="PENDING">Pending</SelectItem>
                  <SelectItem value="none">Not started</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>

        <CardContent className="px-0 pb-0">
          <div className="paytrue-cyan-datatable retailer-list-datatable overflow-x-auto px-4 pb-4 sm:px-6">
            <DataTable
              columns={columns}
              data={filteredRetailers}
              progressPending={loading}
              pagination
              paginationPerPage={10}
              paginationRowsPerPageOptions={[10, 25, 50, 100]}
              sortIcon={<CyanDataTableSortIcon />}
              defaultSortFieldId="name"
              highlightOnHover
              striped
              responsive={false}
              customStyles={{
                ...cyanDataTableStyles,
                table: {
                  style: {
                    ...cyanDataTableStyles.table?.style,
                    minWidth: TABLE_MIN_WIDTH,
                  },
                },
                headCells: {
                  style: {
                    ...cyanDataTableStyles.headCells?.style,
                    overflow: "visible",
                    whiteSpace: "nowrap",
                  },
                },
              }}
              noDataComponent={
                <div className="py-16 text-center text-sm text-slate-500">
                  {loading
                    ? "Loading retailers..."
                    : hasActiveFilters
                      ? "No retailers match your search / filters"
                      : "No retailers found"}
                </div>
              }
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

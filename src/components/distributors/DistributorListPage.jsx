"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import Link from "next/link";
import DataTable from "react-data-table-component";
import { Users, Plus, Eye, Pencil, Search } from "lucide-react";
import PageHeader from "@/src/components/common/PageHeader";
import StatusBadge from "@/src/components/common/StatusBadge";
import DistributorViewModal from "@/src/components/distributors/DistributorViewModal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  fetchDistributors,
  fetchDistributorById,
} from "@/src/redux/thunks/distributorThunk";
import {
  selectDistributors,
  selectDistributorLoading,
  selectSelectedDistributor,
  selectDistributorDetailLoading,
} from "@/src/redux/slices/distributorSlice";
import { updateMdDistributorCount } from "@/src/redux/slices/dashboardSlice";
import {
  cyanDataTableStyles,
  CyanDataTableSortIcon,
} from "@/src/components/common/cyanDataTableStyles";
import {
  getDistributorInitials,
  maskDistributorAadhaar,
  maskDistributorPan,
} from "@/src/lib/distributorListUtils";

const TABLE_MIN_WIDTH = "1680px";

function DistributorAvatar({ row }) {
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
        getDistributorInitials(row.name)
      )}
    </div>
  );
}

export default function DistributorListPage() {
  const dispatch = useDispatch();
  const distributors = useSelector(selectDistributors);
  const loading = useSelector(selectDistributorLoading);
  const selectedDistributor = useSelector(selectSelectedDistributor);
  const detailLoading = useSelector(selectDistributorDetailLoading);

  const [search, setSearch] = useState("");
  const [viewOpen, setViewOpen] = useState(false);

  useEffect(() => {
    dispatch(fetchDistributors({ page: 1, limit: 100 }));
  }, [dispatch]);

  useEffect(() => {
    dispatch(updateMdDistributorCount(distributors.length));
  }, [dispatch, distributors.length]);

  const filteredDistributors = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return distributors;
    return distributors.filter((row) =>
      [
        row.name,
        row.email,
        row.mobile,
        row.alternateMobileNumber,
        row.outletName,
        row.outletId,
        row.address,
        row.pincode,
        row.aadhaarNumber,
        row.panNumber,
        row.city,
        row.state,
      ]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(query))
    );
  }, [distributors, search]);

  const handleView = useCallback(
    async (row) => {
      setViewOpen(true);
      await dispatch(fetchDistributorById(row.id));
    },
    [dispatch]
  );

  const columns = useMemo(
    () => [
      {
        id: "image",
        name: "Image",
        width: "72px",
        center: true,
        cell: (row) => <DistributorAvatar row={row} />,
      },
      {
        id: "name",
        name: "Name",
        selector: (row) => row.name,
        sortable: true,
        minWidth: "140px",
        cell: (row) => <span className="font-semibold text-[#0b1f3a]">{row.name}</span>,
      },
      {
        id: "email",
        name: "Email",
        selector: (row) => row.email,
        sortable: true,
        minWidth: "180px",
        cell: (row) => <span className="text-slate-600">{row.email || "—"}</span>,
      },
      {
        id: "mobile",
        name: "Phone",
        selector: (row) => row.mobile,
        sortable: true,
        minWidth: "120px",
        cell: (row) => <span className="whitespace-nowrap font-mono text-sm">{row.mobile || "—"}</span>,
      },
      {
        id: "alternateMobileNumber",
        name: "Alt. Phone",
        selector: (row) => row.alternateMobileNumber,
        sortable: true,
        minWidth: "120px",
        cell: (row) => (
          <span className="whitespace-nowrap font-mono text-sm">
            {row.alternateMobileNumber || "—"}
          </span>
        ),
      },
      {
        id: "outletName",
        name: "Outlet Name",
        selector: (row) => row.outletName,
        sortable: true,
        minWidth: "150px",
        cell: (row) => <span className="text-slate-700">{row.outletName || "—"}</span>,
      },
      {
        id: "outletId",
        name: "Outlet ID",
        selector: (row) => row.outletId,
        sortable: true,
        minWidth: "130px",
        cell: (row) => (
          <span className="whitespace-nowrap font-mono text-xs text-slate-600">
            {row.outletId || "—"}
          </span>
        ),
      },
      {
        id: "address",
        name: "Address",
        selector: (row) => row.address,
        sortable: true,
        minWidth: "180px",
        cell: (row) => (
          <span className="block max-w-[220px] truncate text-slate-600" title={row.address || ""}>
            {row.address || "—"}
          </span>
        ),
      },
      {
        id: "pincode",
        name: "Pincode",
        selector: (row) => row.pincode,
        sortable: true,
        minWidth: "90px",
        center: true,
        cell: (row) => <span className="font-mono text-sm">{row.pincode || "—"}</span>,
      },
      {
        id: "aadhaarNumber",
        name: "Aadhaar",
        selector: (row) => row.aadhaarNumber,
        sortable: true,
        minWidth: "150px",
        cell: (row) => (
          <span className="whitespace-nowrap font-mono text-xs">
            {maskDistributorAadhaar(row.aadhaarNumber)}
          </span>
        ),
      },
      {
        id: "panNumber",
        name: "PAN",
        selector: (row) => row.panNumber,
        sortable: true,
        minWidth: "110px",
        cell: (row) => (
          <span className="whitespace-nowrap font-mono text-xs">
            {maskDistributorPan(row.panNumber)}
          </span>
        ),
      },
      {
        id: "status",
        name: "Status",
        selector: (row) => row.status,
        sortable: true,
        minWidth: "110px",
        center: true,
        cell: (row) => <StatusBadge status={row.status} />,
      },
      {
        id: "actions",
        name: "Actions",
        minWidth: "100px",
        center: true,
        cell: (row) => (
          <div className="flex items-center justify-center gap-1.5">
            <Button
              size="icon"
              variant="outline"
              className="h-8 w-8 shrink-0"
              title="View distributor"
              aria-label="View distributor"
              onClick={() => void handleView(row)}
            >
              <Eye className="h-4 w-4" />
            </Button>
            <Button
              size="icon"
              variant="outline"
              className="h-8 w-8 shrink-0"
              title="Edit distributor"
              aria-label="Edit distributor"
              asChild
            >
              <Link href={`/md/distributors/${row.id}/edit`}>
                <Pencil className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        ),
      },
    ],
    [handleView]
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Distributors"
        description="Manage your distributor network with complete onboarding details"
        icon={Users}
        actions={
          <Button asChild>
            <Link href="/md/distributors/create">
              <Plus className="h-4 w-4" />
              Create Distributor
            </Link>
          </Button>
        }
      />

      <Card className="rounded-2xl border-slate-200/80 shadow-sm">
        <CardHeader className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="text-[#001F5B]">Distributor List</CardTitle>
              <CardDescription>
                {filteredDistributors.length} distributor
                {filteredDistributors.length === 1 ? "" : "s"} in your network
              </CardDescription>
            </div>
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search name, email, phone, outlet, address..."
                className="h-10 pl-9"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="px-0 pb-0">
          <div className="paytrue-cyan-datatable overflow-x-auto px-4 pb-4 sm:px-6">
            <DataTable
              columns={columns}
              data={filteredDistributors}
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
                    ...cyanDataTableStyles.table.style,
                    minWidth: TABLE_MIN_WIDTH,
                  },
                },
              }}
              noDataComponent={
                <div className="py-16 text-center text-sm text-slate-500">
                  {loading ? "Loading distributors..." : "No distributors found"}
                </div>
              }
            />
          </div>
        </CardContent>
      </Card>

      <DistributorViewModal
        open={viewOpen}
        onOpenChange={setViewOpen}
        distributor={selectedDistributor}
        loading={detailLoading}
      />
    </div>
  );
}

"use client";



import { useCallback, useEffect, useMemo, useState } from "react";

import { useDispatch, useSelector } from "react-redux";

import Link from "next/link";

import {

  Users,

  Plus,

  Eye,

  Pencil,

  Power,

  Search,

  Download,

  Printer,

  Trash2,

} from "lucide-react";

import { toast } from "sonner";

import PageHeader from "@/src/components/common/PageHeader";

import ServerDataTable from "@/src/components/common/ServerDataTable";

import StatusBadge from "@/src/components/common/StatusBadge";

import ViewDetailsModal from "@/src/components/common/ViewDetailsModal";

import ConfirmationModal from "@/src/components/common/ConfirmationModal";

import NoDataIllustration from "@/src/components/common/NoDataIllustration";

import { Button } from "@/components/ui/button";

import { Input } from "@/components/ui/input";

import {

  Card,

  CardContent,

  CardDescription,

  CardHeader,

  CardTitle,

} from "@/components/ui/card";

import { formatCurrency } from "@/lib/utils";

import { useDebounce } from "@/src/hooks/useDebounce";

import { exportToCsv, exportToExcel, printTable } from "@/src/lib/exportUtils";

import {

  fetchDistributors,

  toggleDistributorStatus,

  deleteDistributor,

} from "@/src/redux/thunks/distributorThunk";

import {

  selectDistributors,

  selectDistributorTotal,

  selectDistributorPage,

  selectDistributorLimit,

  selectDistributorLoading,

  selectDistributorActionLoading,

  setDistributorQuery,

} from "@/src/redux/slices/distributorSlice";

import { updateMdDistributorCount } from "@/src/redux/slices/dashboardSlice";



const EXPORT_COLUMNS = [

  { key: "distributorId", label: "Distributor ID" },

  { key: "name", label: "Name" },

  { key: "email", label: "Email" },

  { key: "mobile", label: "Mobile" },

  { key: "city", label: "City" },

  {

    key: "status",

    label: "Status",

    selector: (row) => row.status,

  },

  {

    key: "createdAt",

    label: "Created Date",

    selector: (row) =>

      row.createdAt ? new Date(row.createdAt).toLocaleString("en-IN") : "",

  },

];



export default function DistributorListPage() {

  const dispatch = useDispatch();

  const distributors = useSelector(selectDistributors);

  const total = useSelector(selectDistributorTotal);

  const page = useSelector(selectDistributorPage);

  const limit = useSelector(selectDistributorLimit);

  const loading = useSelector(selectDistributorLoading);

  const actionLoading = useSelector(selectDistributorActionLoading);



  const [search, setSearch] = useState("");

  const [viewOpen, setViewOpen] = useState(false);

  const [statusOpen, setStatusOpen] = useState(false);

  const [deleteOpen, setDeleteOpen] = useState(false);

  const [selected, setSelected] = useState(null);



  const debouncedSearch = useDebounce(search, 400);



  const loadData = useCallback(

    (overrides = {}) => {

      dispatch(

        fetchDistributors({

          page: overrides.page ?? page,

          limit: overrides.limit ?? limit,

          search: overrides.search ?? debouncedSearch,

        })

      );

    },

    [dispatch, page, limit, debouncedSearch]

  );



  useEffect(() => {

    loadData({ page: 1, search: debouncedSearch });

    dispatch(setDistributorQuery({ page: 1, search: debouncedSearch }));

  }, [debouncedSearch]); // eslint-disable-line react-hooks/exhaustive-deps



  useEffect(() => {

    dispatch(updateMdDistributorCount(total || distributors.length));

  }, [dispatch, total, distributors.length]);



  const columns = useMemo(

    () => [

      {

        name: "Profile",

        width: "80px",

        cell: (row) =>

          row.profileImage ? (

            // eslint-disable-next-line @next/next/no-img-element

            <img

              src={row.profileImage}

              alt={row.name}

              className="h-9 w-9 rounded-lg object-cover"

            />

          ) : (

            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-xs font-bold text-[#1565d8]">

              {row.name?.charAt(0) || "D"}

            </div>

          ),

      },

      {

        name: "Distributor ID",

        selector: (row) => row.distributorId,

        sortable: true,

        sortField: "id",

      },

      {

        name: "Name",

        selector: (row) => row.name,

        sortable: true,

        sortField: "firstName",

      },

      { name: "Mobile", selector: (row) => row.mobile },

      { name: "City", selector: (row) => row.city },

      {

        name: "Wallet",

        selector: (row) => row.walletBalance,

        cell: (row) => formatCurrency(row.walletBalance || 0),

      },

      {

        name: "Status",

        cell: (row) => <StatusBadge status={row.status} />,

      },

      {

        name: "Created",

        selector: (row) => row.createdAt,

        sortable: true,

        sortField: "createdAt",

        cell: (row) =>

          row.createdAt

            ? new Date(row.createdAt).toLocaleDateString("en-IN")

            : "—",

      },

      {

        name: "Actions",

        minWidth: "280px",

        cell: (row) => (

          <div className="flex flex-wrap gap-1.5">

            <Button

              size="sm"

              variant="outline"

              onClick={() => {

                setSelected(row);

                setViewOpen(true);

              }}

            >

              <Eye className="h-3.5 w-3.5" />

            </Button>

            <Button size="sm" variant="outline" asChild>

              <Link href={`/md/distributors/${row.id}/edit`}>

                <Pencil className="h-3.5 w-3.5" />

              </Link>

            </Button>

            <Button

              size="sm"

              variant={row.status === "active" ? "destructive" : "default"}

              onClick={() => {

                setSelected(row);

                setStatusOpen(true);

              }}

            >

              <Power className="h-3.5 w-3.5" />

            </Button>

            <Button

              size="sm"

              variant="outline"

              onClick={() => {

                setSelected(row);

                setDeleteOpen(true);

              }}

            >

              <Trash2 className="h-3.5 w-3.5" />

            </Button>

          </div>

        ),

      },

    ],

    []

  );



  const viewFields = selected

    ? [

        { label: "Distributor ID", value: selected.distributorId },

        { label: "Name", value: selected.name },

        { label: "Email", value: selected.email },

        { label: "Mobile", value: selected.mobile },

        { label: "City", value: selected.city },

        { label: "State", value: selected.state },

        { label: "Wallet Balance", value: formatCurrency(selected.walletBalance || 0) },

        { label: "Status", value: selected.status },

        {

          label: "Created At",

          value: selected.createdAt

            ? new Date(selected.createdAt).toLocaleString("en-IN")

            : "—",

        },

      ]

    : [];



  const handleToggleStatus = async () => {

    if (!selected) return;

    const nextStatus = selected.status === "active" ? "inactive" : "active";

    try {

      await dispatch(toggleDistributorStatus({ id: selected.id, status: nextStatus })).unwrap();

      toast.success(`Distributor ${nextStatus === "active" ? "activated" : "deactivated"}`);

      loadData();

    } catch (err) {

      toast.error(typeof err === "string" ? err : "Status update failed");

    } finally {

      setStatusOpen(false);

      setSelected(null);

    }

  };



  const handleDelete = async () => {

    if (!selected) return;

    try {

      await dispatch(deleteDistributor(selected.id)).unwrap();

      toast.success("Distributor deleted");

      loadData();

    } catch (err) {

      toast.error(typeof err === "string" ? err : "Delete not available or failed");

    } finally {

      setDeleteOpen(false);

      setSelected(null);

    }

  };



  return (

    <div className="space-y-6">

      <PageHeader

        title="Distributors"

        description="Manage your distributor network"

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



      <Card>

        <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

          <div>

            <CardTitle>Distributor List</CardTitle>

            <CardDescription>{total} distributors in your network</CardDescription>

          </div>

          <div className="flex flex-wrap items-center gap-2">

            <div className="relative">

              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

              <Input

                placeholder="Search distributors..."

                value={search}

                onChange={(e) => setSearch(e.target.value)}

                className="w-full pl-9 sm:w-64"

              />

            </div>

            <Button

              variant="outline"

              size="sm"

              onClick={() => exportToCsv("distributors.csv", distributors, EXPORT_COLUMNS)}

            >

              <Download className="h-4 w-4" />

              CSV

            </Button>

            <Button

              variant="outline"

              size="sm"

              onClick={() => exportToExcel("distributors", distributors, EXPORT_COLUMNS)}

            >

              <Download className="h-4 w-4" />

              Excel

            </Button>

            <Button

              variant="outline"

              size="sm"

              onClick={() => printTable("Distributor List", distributors, EXPORT_COLUMNS)}

            >

              <Printer className="h-4 w-4" />

              Print

            </Button>

          </div>

        </CardHeader>

        <CardContent>

          <ServerDataTable

            columns={columns}

            data={distributors}

            loading={loading}

            totalRows={total}

            paginationPerPage={limit}

            paginationDefaultPage={page}

            onChangePage={(newPage) => {

              dispatch(setDistributorQuery({ page: newPage }));

              loadData({ page: newPage });

            }}

            onChangeRowsPerPage={(newLimit, newPage) => {

              dispatch(setDistributorQuery({ page: newPage, limit: newLimit }));

              loadData({ page: newPage, limit: newLimit });

            }}

            onSort={(column, direction) => {

              const sortBy = column.sortField || column.selector?.name || "createdAt";

              dispatch(

                setDistributorQuery({

                  sortBy,

                  sortOrder: direction,

                })

              );

              loadData({ sortBy, sortOrder: direction });

            }}

            noDataComponent={

              <NoDataIllustration

                title="No distributors found"

                description="Create your first distributor or adjust your search filters."

              />

            }

          />

        </CardContent>

      </Card>



      <ViewDetailsModal

        open={viewOpen}

        onOpenChange={setViewOpen}

        title="Distributor Details"

        fields={viewFields}

      />



      <ConfirmationModal

        open={statusOpen}

        onOpenChange={setStatusOpen}

        title={

          selected?.status === "active"

            ? "Deactivate Distributor"

            : "Activate Distributor"

        }

        message={`Are you sure you want to ${

          selected?.status === "active" ? "deactivate" : "activate"

        } ${selected?.name}?`}

        confirmLabel={selected?.status === "active" ? "Deactivate" : "Activate"}

        onConfirm={handleToggleStatus}

        loading={actionLoading}

        variant={selected?.status === "active" ? "destructive" : "default"}

      />



      <ConfirmationModal

        open={deleteOpen}

        onOpenChange={setDeleteOpen}

        title="Delete Distributor"

        message={`Are you sure you want to delete ${selected?.name}? This action may be irreversible.`}

        confirmLabel="Delete"

        onConfirm={handleDelete}

        loading={actionLoading}

        variant="destructive"

      />

    </div>

  );

}


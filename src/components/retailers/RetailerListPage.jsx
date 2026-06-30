"use client";

import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import Link from "next/link";
import { Store, Plus, Eye, Pencil, Power } from "lucide-react";
import PageHeader from "@/src/components/common/PageHeader";
import DataTable from "@/src/components/common/DataTable";
import StatusBadge from "@/src/components/common/StatusBadge";
import ViewDetailsModal from "@/src/components/common/ViewDetailsModal";
import ConfirmationModal from "@/src/components/common/ConfirmationModal";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import { fetchRetailers, toggleRetailerStatus } from "@/src/redux/thunks/retailerThunk";
import {
  selectRetailers,
  selectRetailerLoading,
  selectRetailerActionLoading,
} from "@/src/redux/slices/retailerSlice";
import { updateDdRetailerCount } from "@/src/redux/slices/dashboardSlice";

export default function RetailerListPage() {
  const dispatch = useDispatch();
  const retailers = useSelector(selectRetailers);
  const loading = useSelector(selectRetailerLoading);
  const actionLoading = useSelector(selectRetailerActionLoading);
  const [viewOpen, setViewOpen] = useState(false);
  const [statusOpen, setStatusOpen] = useState(false);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    dispatch(fetchRetailers());
  }, [dispatch]);

  useEffect(() => {
    dispatch(updateDdRetailerCount(retailers.length));
  }, [dispatch, retailers.length]);

  const columns = useMemo(
    () => [
      { key: "retailerId", label: "Retailer ID" },
      { key: "name", label: "Name" },
      { key: "shopName", label: "Shop Name" },
      { key: "mobile", label: "Mobile" },
      {
        key: "walletBalance",
        label: "Wallet",
        render: (row) => formatCurrency(row.walletBalance),
      },
      {
        key: "status",
        label: "Status",
        render: (row) => <StatusBadge status={row.status} />,
      },
      {
        key: "actions",
        label: "Actions",
        className: "min-w-[220px]",
        render: (row) => (
          <div className="flex flex-wrap gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setSelected(row);
                setViewOpen(true);
              }}
            >
              <Eye className="h-3.5 w-3.5" />
              View
            </Button>
            <Button size="sm" variant="outline" asChild>
              <Link href={`/dd/retailers/${row.id}/edit`}>
                <Pencil className="h-3.5 w-3.5" />
                Edit
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
              {row.status === "active" ? "Deactivate" : "Activate"}
            </Button>
          </div>
        ),
      },
    ],
    []
  );

  const viewFields = selected
    ? [
        { label: "Retailer ID", value: selected.retailerId },
        { label: "Name", value: selected.name },
        { label: "Shop Name", value: selected.shopName },
        { label: "Email", value: selected.email },
        { label: "Mobile", value: selected.mobile },
        { label: "City", value: selected.city },
        { label: "State", value: selected.state },
        { label: "Commission", value: `${selected.commission}%` },
        { label: "Wallet Balance", value: formatCurrency(selected.walletBalance) },
        { label: "Status", value: selected.status },
        {
          label: "Created At",
          value: new Date(selected.createdAt).toLocaleString("en-IN"),
        },
      ]
    : [];

  const handleToggleStatus = async () => {
    if (!selected) return;
    const nextStatus = selected.status === "active" ? "inactive" : "active";
    await dispatch(toggleRetailerStatus({ id: selected.id, status: nextStatus }));
    setStatusOpen(false);
    setSelected(null);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Retailers"
        description="Manage your retailer network"
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

      <Card>
        <CardHeader>
          <CardTitle>Retailer List</CardTitle>
          <CardDescription>{retailers.length} retailers in your network</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="py-12 text-center text-sm text-slate-500">Loading...</p>
          ) : (
            <DataTable columns={columns} rows={retailers} />
          )}
        </CardContent>
      </Card>

      <ViewDetailsModal
        open={viewOpen}
        onOpenChange={setViewOpen}
        title="Retailer Details"
        fields={viewFields}
      />

      <ConfirmationModal
        open={statusOpen}
        onOpenChange={setStatusOpen}
        title={
          selected?.status === "active" ? "Deactivate Retailer" : "Activate Retailer"
        }
        message={`Are you sure you want to ${
          selected?.status === "active" ? "deactivate" : "activate"
        } ${selected?.name}?`}
        confirmLabel={selected?.status === "active" ? "Deactivate" : "Activate"}
        onConfirm={handleToggleStatus}
        loading={actionLoading}
        variant={selected?.status === "active" ? "destructive" : "default"}
      />
    </div>
  );
}

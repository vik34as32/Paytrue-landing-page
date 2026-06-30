"use client";

import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Wallet, Check, X } from "lucide-react";
import PageHeader from "@/src/components/common/PageHeader";
import DataTable from "@/src/components/common/DataTable";
import StatusBadge from "@/src/components/common/StatusBadge";
import ConfirmationModal from "@/src/components/common/ConfirmationModal";
import RejectModal from "@/src/components/common/RejectModal";
import SuccessModal from "@/src/components/common/SuccessModal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import {
  fetchMdFundRequests,
  fetchDdFundRequests,
  fetchRetailerFundRequests,
  submitMdFundRequest,
  submitDdFundRequest,
  approveRetailerFundRequest,
  rejectRetailerFundRequest,
} from "@/src/redux/thunks/fundRequestThunk";
import {
  selectMdFundRequests,
  selectDdFundRequests,
  selectRetailerFundRequests,
  selectFundRequestLoading,
  selectFundRequestActionLoading,
} from "@/src/redux/slices/fundRequestSlice";
import { selectMdUser, selectDdUser } from "@/src/redux/slices/authSlice";

export default function FundRequestsPage({ role }) {
  const dispatch = useDispatch();
  const isMd = role === "md";
  const mdRequests = useSelector(selectMdFundRequests);
  const ddRequests = useSelector(selectDdFundRequests);
  const retailerRequests = useSelector(selectRetailerFundRequests);
  const loading = useSelector(selectFundRequestLoading);
  const actionLoading = useSelector(selectFundRequestActionLoading);
  const mdUser = useSelector(selectMdUser);
  const ddUser = useSelector(selectDdUser);

  const [amount, setAmount] = useState("");
  const [remark, setRemark] = useState("");
  const [errors, setErrors] = useState({});
  const [approveOpen, setApproveOpen] = useState(false);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [successOpen, setSuccessOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [selectedRequest, setSelectedRequest] = useState(null);

  const ownRequests = isMd ? mdRequests : ddRequests;

  useEffect(() => {
    if (isMd) {
      dispatch(fetchMdFundRequests());
    } else {
      dispatch(fetchDdFundRequests());
      dispatch(fetchRetailerFundRequests());
    }
  }, [dispatch, isMd]);

  const ownRequestColumns = useMemo(
    () => [
      { key: "requestId", label: "Request ID" },
      {
        key: "amount",
        label: "Amount",
        render: (row) => formatCurrency(row.amount),
      },
      { key: "remark", label: "Remark" },
      {
        key: "status",
        label: "Status",
        render: (row) => <StatusBadge status={row.status} />,
      },
      {
        key: "createdAt",
        label: "Date",
        render: (row) => new Date(row.createdAt).toLocaleString("en-IN"),
      },
    ],
    []
  );

  const retailerRequestColumns = useMemo(
    () => [
      { key: "requestId", label: "Request ID" },
      { key: "retailerName", label: "Retailer" },
      { key: "shopName", label: "Shop" },
      {
        key: "amount",
        label: "Amount",
        render: (row) => formatCurrency(row.amount),
      },
      { key: "remark", label: "Remark" },
      {
        key: "status",
        label: "Status",
        render: (row) => <StatusBadge status={row.status} />,
      },
      {
        key: "actions",
        label: "Actions",
        render: (row) =>
          row.status === "pending" ? (
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={() => {
                  setSelectedRequest(row);
                  setApproveOpen(true);
                }}
              >
                <Check className="h-3.5 w-3.5" />
                Approve
              </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={() => {
                  setSelectedRequest(row);
                  setRejectOpen(true);
                }}
              >
                <X className="h-3.5 w-3.5" />
                Reject
              </Button>
            </div>
          ) : (
            <span className="text-xs text-slate-400">No actions</span>
          ),
      },
    ],
    []
  );

  const handleSubmit = async (event) => {
    event.preventDefault();
    const nextErrors = {};
    if (!amount || Number(amount) <= 0) nextErrors.amount = "Enter valid amount";
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    if (isMd) {
      await dispatch(
        submitMdFundRequest({
          amount: Number(amount),
          remark,
          requestedBy: mdUser.name,
        })
      );
    } else {
      await dispatch(
        submitDdFundRequest({
          amount: Number(amount),
          remark,
          requestedBy: ddUser.name,
        })
      );
    }

    setSuccessMessage("Your fund request has been submitted successfully.");
    setSuccessOpen(true);
    setAmount("");
    setRemark("");
  };

  const handleApprove = async () => {
    if (!selectedRequest) return;
    try {
      await dispatch(approveRetailerFundRequest(selectedRequest.id)).unwrap();
      setApproveOpen(false);
      setSuccessMessage("Fund request approved successfully.");
      setSuccessOpen(true);
      setSelectedRequest(null);
    } catch (error) {
      setApproveOpen(false);
    }
  };

  const handleReject = async () => {
    if (!selectedRequest) return;
    await dispatch(rejectRetailerFundRequest(selectedRequest.id));
    setRejectOpen(false);
    setSuccessMessage("Fund request rejected.");
    setSuccessOpen(true);
    setSelectedRequest(null);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Fund Requests"
        description={
          isMd
            ? "Request funds from admin and track status"
            : "Submit fund requests and manage retailer requests"
        }
        icon={Wallet}
        backHref={isMd ? "/md/dashboard" : "/dd/dashboard"}
      />

      <Card>
        <CardHeader>
          <CardTitle>New Fund Request</CardTitle>
          <CardDescription>
            {isMd
              ? "Request wallet top-up from admin"
              : "Request wallet top-up from master distributor"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="grid gap-4 lg:grid-cols-2">
            <div className="space-y-2">
              <Label>Amount (₹)</Label>
              <Input
                type="number"
                placeholder="Enter amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
              {errors.amount && (
                <p className="text-xs text-red-500">{errors.amount}</p>
              )}
            </div>
            <div className="space-y-2 lg:col-span-2">
              <Label>Remark</Label>
              <Input
                placeholder="Add remark"
                value={remark}
                onChange={(e) => setRemark(e.target.value)}
              />
            </div>
            <div className="lg:col-span-2">
              <Button type="submit" disabled={actionLoading} className="w-full sm:w-auto sm:min-w-[200px]">
                Submit Request
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>My Fund Requests</CardTitle>
          <CardDescription>Track pending, approved, and rejected requests</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="py-12 text-center text-sm text-slate-500">Loading...</p>
          ) : (
            <DataTable columns={ownRequestColumns} rows={ownRequests} />
          )}
        </CardContent>
      </Card>

      {!isMd && (
        <Card>
          <CardHeader>
            <CardTitle>Retailer Fund Requests</CardTitle>
            <CardDescription>Approve or reject retailer fund requests</CardDescription>
          </CardHeader>
          <CardContent>
            <DataTable
              columns={retailerRequestColumns}
              rows={retailerRequests}
              emptyMessage="No retailer fund requests found"
            />
          </CardContent>
        </Card>
      )}

      <ConfirmationModal
        open={approveOpen}
        onOpenChange={setApproveOpen}
        title="Approve Fund Request"
        message="Are you sure you want to approve this fund request?"
        confirmLabel="Approve"
        onConfirm={handleApprove}
        loading={actionLoading}
      />

      <RejectModal
        open={rejectOpen}
        onOpenChange={setRejectOpen}
        onConfirm={handleReject}
        loading={actionLoading}
      />

      <SuccessModal
        open={successOpen}
        onOpenChange={setSuccessOpen}
        title="Success!"
        message={successMessage}
      />
    </div>
  );
}

"use client";

import { useEffect, useMemo } from "react";
import Link from "next/link";
import { useDispatch, useSelector } from "react-redux";
import DataTable from "react-data-table-component";
import {
  ArrowLeft,
  Pencil,
  RefreshCw,
  Store,
  Wallet,
  Mail,
  Phone,
  MapPin,
  Loader2,
} from "lucide-react";
import PageHeader from "@/src/components/common/PageHeader";
import StatusBadge from "@/src/components/common/StatusBadge";
import { BankLogo } from "@/components/retailer/BankLogo";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import { fetchRetailerById } from "@/src/redux/thunks/retailerThunk";
import {
  selectSelectedRetailer,
  selectRetailerDetailLoading,
} from "@/src/redux/slices/retailerSlice";
import {
  getRetailerInitials,
  maskRetailerAccount,
  maskRetailerAadhaar,
  maskRetailerPan,
} from "@/src/lib/retailerListUtils";
import { formatCurrency } from "@/lib/utils";
import { getBusinessTypeLabel } from "@/src/constants/businessTypes";

function DetailPill({ label, value }) {
  return (
    <div className="rounded-xl border border-slate-100 bg-slate-50/80 px-3 py-2.5">
      <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
        {label}
      </p>
      <p className="mt-0.5 truncate text-sm font-semibold text-[#0b1f3a]">
        {value || "—"}
      </p>
    </div>
  );
}

function MediaThumb({ label, url }) {
  return (
    <div className="overflow-hidden rounded-xl border border-slate-100 bg-white">
      <p className="border-b border-slate-100 px-3 py-2 text-[10px] font-bold uppercase tracking-wide text-slate-400">
        {label}
      </p>
      <div className="flex h-32 items-center justify-center bg-slate-50 p-2">
        {url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <a href={url} target="_blank" rel="noreferrer">
            <img
              src={url}
              alt={label}
              className="max-h-28 max-w-full rounded-lg object-contain"
            />
          </a>
        ) : (
          <span className="text-xs text-slate-400">Not uploaded</span>
        )}
      </div>
    </div>
  );
}

export default function RetailerDetailPage({ retailerId }) {
  const dispatch = useDispatch();
  const retailer = useSelector(selectSelectedRetailer);
  const loading = useSelector(selectRetailerDetailLoading);

  useEffect(() => {
    if (retailerId) {
      dispatch(fetchRetailerById(retailerId));
    }
  }, [dispatch, retailerId]);

  const bankRows = useMemo(() => {
    if (!retailer) return [];
    if (!retailer.bankName && !retailer.accountNumber && !retailer.mobile) {
      return [];
    }
    return [
      {
        id: retailer.id,
        bankName: retailer.bankName || "—",
        accountHolderName: retailer.accountHolderName || retailer.name || "—",
        accountNumber: retailer.accountNumber || "",
        ifscCode: retailer.ifscCode || "",
        mobile: retailer.mobile || "",
        type: "Debit",
        status:
          String(retailer.status).toLowerCase() === "active"
            ? "success"
            : String(retailer.status).toLowerCase() === "inactive"
              ? "failed"
              : retailer.status,
        previousBalance: retailer.walletBalance ?? 0,
        hasBalance: retailer.walletBalance != null,
      },
    ];
  }, [retailer]);

  const columns = useMemo(
    () => [
      {
        id: "bank",
        name: "Bank",
        selector: (row) => row.bankName,
        sortable: true,
        minWidth: "200px",
        grow: 1,
        cell: (row) => (
          <div className="flex min-w-0 items-center gap-2.5 py-1">
            <BankLogo
              bank={{
                name: row.bankName,
                shortName: row.bankName,
                ifscPrefix: row.ifscCode?.slice(0, 4) || "",
              }}
              size={28}
            />
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-[#0b1f3a]">
                {row.accountHolderName || row.bankName}
              </p>
              {row.bankName && row.accountHolderName !== row.bankName ? (
                <p className="truncate text-[11px] text-slate-500">{row.bankName}</p>
              ) : null}
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
        selector: (row) => row.type,
        sortable: true,
        minWidth: "100px",
        center: true,
        cell: (row) => (
          <Badge
            variant="destructive"
            className="rounded-full px-3 py-0.5 text-[11px] font-bold capitalize"
          >
            {row.type}
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
        cell: (row) => <StatusBadge status={row.status} />,
      },
      {
        id: "previousBalance",
        name: "Previous Balance",
        selector: (row) => row.previousBalance,
        sortable: true,
        right: true,
        minWidth: "140px",
        cell: (row) =>
          row.hasBalance ? (
            <span className="font-bold tabular-nums text-slate-800">
              {formatCurrency(row.previousBalance)}
            </span>
          ) : (
            <span className="text-slate-300">—</span>
          ),
      },
    ],
    []
  );

  const media = retailer?.media || {};

  return (
    <div className="space-y-5">
      <PageHeader
        title="Retailer Details"
        description="Bank account, wallet and KYC overview"
        icon={Store}
        backHref="/dd/retailers/list"
        actions={
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              disabled={loading || !retailerId}
              onClick={() => dispatch(fetchRetailerById(retailerId))}
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
              Refresh
            </Button>
            {retailerId ? (
              <Button asChild>
                <Link href={`/dd/retailers/${retailerId}/edit`}>
                  <Pencil className="h-4 w-4" />
                  Edit Retailer
                </Link>
              </Button>
            ) : null}
          </div>
        }
      />

      {loading && !retailer ? (
        <Card className="rounded-2xl border-slate-200/80">
          <CardContent className="flex items-center justify-center gap-2 py-20 text-slate-500">
            <Loader2 className="h-5 w-5 animate-spin" />
            Loading retailer details...
          </CardContent>
        </Card>
      ) : !retailer ? (
        <Card className="rounded-2xl border-slate-200/80">
          <CardContent className="py-16 text-center text-sm text-slate-500">
            Retailer not found.
            <div className="mt-4">
              <Button variant="outline" asChild>
                <Link href="/dd/retailers/list">
                  <ArrowLeft className="h-4 w-4" />
                  Back to list
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          <Card className="overflow-hidden rounded-2xl border-slate-200/80 shadow-sm">
            <div className="border-b border-slate-100 bg-gradient-to-r from-[#001F5B] via-[#003380] to-[#1565d8] px-5 py-5 text-white">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-white/15 text-lg font-bold ring-2 ring-white/20">
                    {retailer.profileImage ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={retailer.profileImage}
                        alt={retailer.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      getRetailerInitials(retailer.name)
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="truncate text-xl font-bold tracking-tight">
                        {retailer.name}
                      </h2>
                      <StatusBadge status={retailer.status} />
                    </div>
                    <p className="mt-1 text-sm text-white/80">
                      {retailer.userCode || retailer.outletId || "—"}
                      {retailer.outletName ? ` · ${retailer.outletName}` : ""}
                    </p>
                    <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-white/75">
                      <span className="inline-flex items-center gap-1">
                        <Phone className="h-3.5 w-3.5" />
                        {retailer.mobile || "—"}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Mail className="h-3.5 w-3.5" />
                        {retailer.email || "—"}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5" />
                        {[retailer.city, retailer.state].filter(Boolean).join(", ") ||
                          "—"}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="rounded-2xl bg-white/10 px-4 py-3 backdrop-blur">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-white/70">
                    Wallet Balance
                  </p>
                  <p className="mt-1 flex items-center gap-2 text-2xl font-black tabular-nums">
                    <Wallet className="h-5 w-5 text-emerald-300" />
                    {formatCurrency(retailer.walletBalance ?? 0)}
                  </p>
                </div>
              </div>
            </div>

            <CardContent className="grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-4">
              <DetailPill
                label="Business Type"
                value={getBusinessTypeLabel(retailer.businessType)}
              />
              <DetailPill label="GST" value={retailer.gstNumber} />
              <DetailPill
                label="Aadhaar"
                value={maskRetailerAadhaar(retailer.aadhaarNumber)}
              />
              <DetailPill
                label="PAN"
                value={maskRetailerPan(retailer.panNumber)}
              />
              <DetailPill label="Address" value={retailer.address} />
              <DetailPill label="City" value={retailer.city} />
              <DetailPill label="State" value={retailer.state} />
              <DetailPill label="Pincode" value={retailer.pincode} />
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-slate-200/80 shadow-sm">
            <CardHeader>
              <CardTitle className="text-[#001F5B]">Bank & Account Overview</CardTitle>
              <CardDescription>
                Bank, account, mobile, type, status and previous balance in data table
              </CardDescription>
            </CardHeader>
            <CardContent className="px-0 pb-4">
              <div className="paytrue-cyan-datatable overflow-x-auto px-4 sm:px-6">
                <DataTable
                  columns={columns}
                  data={bankRows}
                  progressPending={loading}
                  sortIcon={<CyanDataTableSortIcon />}
                  highlightOnHover
                  dense
                  responsive
                  pagination={false}
                  customStyles={{
                    ...cyanDataTableStyles,
                    table: {
                      style: {
                        ...cyanDataTableStyles.table.style,
                        minWidth: "920px",
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
                    <div className="py-14 text-center text-sm text-slate-500">
                      No bank account details found for this retailer.
                    </div>
                  }
                />
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-slate-200/80 shadow-sm">
            <CardHeader>
              <CardTitle className="text-[#001F5B]">Documents</CardTitle>
              <CardDescription>KYC and bank document previews</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              <MediaThumb label="Profile Photo" url={media.profileImage || retailer.profileImage} />
              <MediaThumb label="Aadhaar Front" url={media.aadhaarFront} />
              <MediaThumb label="Aadhaar Back" url={media.aadhaarBack} />
              <MediaThumb label="PAN Card" url={media.panCard} />
              <MediaThumb label="Owner Photo" url={media.ownerPhoto} />
              <MediaThumb label="Passbook" url={media.passbookImage} />
              <MediaThumb label="Cancelled Cheque" url={media.cancelledChequeImage} />
              <MediaThumb label="Video Verification" url={media.videoVerification} />
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}

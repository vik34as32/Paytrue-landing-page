"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import StatusBadge from "@/src/components/common/StatusBadge";
import {
  getDistributorInitials,
  maskDistributorAadhaar,
  maskDistributorAccount,
  maskDistributorPan,
} from "@/src/lib/distributorListUtils";
import { formatCurrency } from "@/lib/utils";
import { getBusinessTypeLabel } from "@/src/constants/businessTypes";

function DetailRow({ label, value, mono = false }) {
  return (
    <div className="rounded-xl border border-slate-100 bg-slate-50/70 px-4 py-3">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
        {label}
      </p>
      <p className={`mt-1 text-sm font-semibold text-[#0b1f3a] ${mono ? "font-mono" : ""}`}>
        {value || "—"}
      </p>
    </div>
  );
}

function MediaCard({ label, url }) {
  return (
    <div className="overflow-hidden rounded-xl border border-slate-100 bg-white">
      <p className="border-b border-slate-100 px-3 py-2 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
        {label}
      </p>
      <div className="flex h-36 items-center justify-center bg-slate-50 p-2">
        {url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={url} alt={label} className="max-h-full max-w-full rounded-lg object-contain" />
        ) : (
          <span className="text-xs text-slate-400">Not uploaded</span>
        )}
      </div>
    </div>
  );
}

export default function DistributorViewModal({
  open,
  onOpenChange,
  distributor,
  loading = false,
}) {
  if (!distributor && !loading) return null;

  const media = distributor?.media || {};

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-4xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-[#0b1f3a]">Distributor Details</DialogTitle>
        </DialogHeader>

        {loading ? (
          <p className="py-12 text-center text-sm text-slate-500">
            Loading distributor details...
          </p>
        ) : distributor ? (
          <div className="space-y-6">
            <div className="flex flex-col gap-4 rounded-2xl border border-slate-100 bg-gradient-to-r from-slate-50 to-white p-4 sm:flex-row sm:items-center">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-[#1565d8]/10 text-lg font-bold text-[#1565d8]">
                {distributor.profileImage ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={distributor.profileImage}
                    alt={distributor.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  getDistributorInitials(distributor.name)
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-xl font-bold text-[#0b1f3a]">{distributor.name}</h3>
                  <StatusBadge status={distributor.status} />
                </div>
                <p className="mt-1 text-sm text-slate-500">
                  {distributor.outletName || "—"} · Outlet ID {distributor.outletId || "—"}
                </p>
              </div>
              <div className="text-right">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                  Wallet Balance
                </p>
                <p className="text-lg font-bold text-[#0b1f3a]">
                  {formatCurrency(distributor.walletBalance || 0)}
                </p>
              </div>
            </div>

            <section className="space-y-3">
              <h4 className="text-sm font-bold text-[#0b1f3a]">Personal Information</h4>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                <DetailRow label="Name" value={distributor.name} />
                <DetailRow label="Email" value={distributor.email} />
                <DetailRow label="Phone Number" value={distributor.mobile} mono />
                <DetailRow
                  label="Alternate Phone"
                  value={distributor.alternateMobileNumber}
                  mono
                />
                <DetailRow label="User Code" value={distributor.userCode} mono />
              </div>
            </section>

            <section className="space-y-3">
              <h4 className="text-sm font-bold text-[#0b1f3a]">Outlet Information</h4>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                <DetailRow label="Outlet Name" value={distributor.outletName} />
                <DetailRow label="Outlet ID" value={distributor.outletId} mono />
                <DetailRow
                  label="Business Type"
                  value={
                    distributor.businessType
                      ? getBusinessTypeLabel(distributor.businessType)
                      : "—"
                  }
                />
                <DetailRow label="GST Number" value={distributor.gstNumber} mono />
                <DetailRow label="Address" value={distributor.address} />
                <DetailRow label="City" value={distributor.city} />
                <DetailRow label="State" value={distributor.state} />
                <DetailRow label="District" value={distributor.district} />
                <DetailRow label="Pincode" value={distributor.pincode} mono />
              </div>
            </section>

            <section className="space-y-3">
              <h4 className="text-sm font-bold text-[#0b1f3a]">KYC Documents</h4>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                <DetailRow
                  label="Aadhaar Number"
                  value={maskDistributorAadhaar(distributor.aadhaarNumber)}
                  mono
                />
                <DetailRow
                  label="PAN Card Number"
                  value={maskDistributorPan(distributor.panNumber)}
                  mono
                />
              </div>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                <MediaCard label="Profile Image" url={media.profileImage} />
                <MediaCard label="Aadhaar Front" url={media.aadhaarFront} />
                <MediaCard label="Aadhaar Back" url={media.aadhaarBack} />
                <MediaCard label="PAN Card" url={media.panCard} />
                <MediaCard label="Owner Photo" url={media.ownerPhoto} />
                <MediaCard label="Video Verification" url={media.videoVerification} />
              </div>
            </section>

            <section className="space-y-3">
              <h4 className="text-sm font-bold text-[#0b1f3a]">Bank Account</h4>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                <DetailRow label="Account Holder" value={distributor.accountHolderName} />
                <DetailRow label="Bank Name" value={distributor.bankName} />
                <DetailRow
                  label="Account Number"
                  value={maskDistributorAccount(distributor.accountNumber)}
                  mono
                />
                <DetailRow label="IFSC Code" value={distributor.ifscCode} mono />
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <MediaCard label="Passbook Image" url={media.passbookImage} />
                <MediaCard label="Cancelled Cheque" url={media.cancelledChequeImage} />
              </div>
            </section>

            <div className="flex justify-end">
              <Button onClick={() => onOpenChange(false)}>Close</Button>
            </div>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}

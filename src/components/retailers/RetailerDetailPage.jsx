"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useDispatch, useSelector } from "react-redux";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Eye,
  FileText,
  Landmark,
  Loader2,
  Mail,
  MapPin,
  Pencil,
  Phone,
  RefreshCw,
  ShieldCheck,
  Store,
  Wallet,
} from "lucide-react";
import PageHeader from "@/src/components/common/PageHeader";
import StatusBadge from "@/src/components/common/StatusBadge";
import BankDetailsCard from "@/src/components/statement/receipt/BankDetailsCard";
import ReceiptPageLayout from "@/src/components/statement/receipt/ReceiptPageLayout";
import {
  ProfileDocumentCard,
  profileStagger,
} from "@/src/components/profile/ProfileModules";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { fetchRetailerById } from "@/src/redux/thunks/retailerThunk";
import {
  selectSelectedRetailer,
  selectRetailerDetailLoading,
} from "@/src/redux/slices/retailerSlice";
import {
  getRetailerInitials,
  maskRetailerAadhaar,
  maskRetailerPan,
} from "@/src/lib/retailerListUtils";
import { formatCurrency, cn } from "@/lib/utils";
import { getBusinessTypeLabel } from "@/src/constants/businessTypes";
import { PAYTRUE_LOGO_PATH } from "@/types/statementReceipt";

function formatDocumentDate(value) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function StatementField({ label, value, mono = false, className }) {
  return (
    <div
      className={cn(
        "grid grid-cols-[minmax(110px,36%)_1fr] border-b border-[#E5E7EB] last:border-b-0",
        className
      )}
    >
      <div className="border-r border-[#E5E7EB] bg-[#F8FAFC] px-4 py-3 text-xs font-semibold uppercase tracking-[0.08em] text-[#64748b]">
        {label}
      </div>
      <div
        className={cn(
          "break-words px-4 py-3 text-sm font-semibold leading-snug text-[#111827]",
          mono && "font-mono text-[13px] tracking-wide"
        )}
      >
        {value || "—"}
      </div>
    </div>
  );
}

function DocumentSection({ icon: Icon, title, description, children }) {
  return (
    <section className="border-t border-[#E5E7EB] px-6 py-7 sm:px-8 lg:px-10">
      <div className="mb-5 flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#001F5B]/5 text-[#1565d8]">
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <h3 className="text-base font-bold tracking-tight text-[#001F5B]">
            {title}
          </h3>
          <p className="mt-0.5 text-sm text-slate-500">{description}</p>
        </div>
      </div>
      {children}
    </section>
  );
}

function RetailerDetailDocument({ retailerId }) {
  const dispatch = useDispatch();
  const retailer = useSelector(selectSelectedRetailer);
  const loading = useSelector(selectRetailerDetailLoading);
  const [preview, setPreview] = useState(null);

  useEffect(() => {
    if (retailerId) {
      dispatch(fetchRetailerById(retailerId));
    }
  }, [dispatch, retailerId]);

  const displayName =
    retailer?.displayName || retailer?.firstName || retailer?.name || "—";
  const media = retailer?.media || {};

  const bankReceipt = useMemo(() => {
    if (!retailer) return null;
    if (!retailer.bankName && !retailer.accountNumber && !retailer.ifscCode) {
      return null;
    }
    return {
      bankName: retailer.bankName || "Bank",
      accountNumber: retailer.accountNumber || "",
      accountHolderName: retailer.accountHolderName || displayName || "",
      ifscCode: retailer.ifscCode || "",
    };
  }, [retailer, displayName]);

  const kycDocuments = useMemo(
    () => [
      {
        label: "Profile Photo",
        url: media.profileImage || retailer?.profileImage,
      },
      { label: "Aadhaar Front", url: media.aadhaarFront },
      { label: "Aadhaar Back", url: media.aadhaarBack },
      { label: "PAN Card", url: media.panCard },
      { label: "Owner Photo", url: media.ownerPhoto },
      { label: "Video Verification", url: media.videoVerification },
    ],
    [media, retailer?.profileImage]
  );

  const bankDocuments = useMemo(
    () => [
      { label: "Passbook", url: media.passbookImage },
      { label: "Cancelled Cheque", url: media.cancelledChequeImage },
    ],
    [media]
  );

  const locationLine = [retailer?.city, retailer?.state, retailer?.pincode]
    .filter(Boolean)
    .join(", ");

  return (
    <div className="space-y-5">
      <PageHeader
        title="Retailer Account Document"
        description="Bank-statement style view of retailer profile, KYC and settlement documents"
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
        <div className="flex items-center justify-center gap-2 rounded-3xl border border-[#E5E7EB] bg-white py-24 text-slate-500 shadow-sm">
          <Loader2 className="h-5 w-5 animate-spin" />
          Loading retailer document...
        </div>
      ) : !retailer ? (
        <div className="rounded-3xl border border-[#E5E7EB] bg-white py-16 text-center shadow-sm">
          <p className="text-sm text-slate-500">Retailer not found.</p>
          <div className="mt-4">
            <Button variant="outline" asChild>
              <Link href="/dd/retailers/list">
                <ArrowLeft className="h-4 w-4" />
                Back to list
              </Link>
            </Button>
          </div>
        </div>
      ) : (
        <ReceiptPageLayout>
          <header className="border-b border-[#E5E7EB] bg-white px-6 py-8 sm:px-8 lg:px-10">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
              <div className="flex items-start gap-4">
                <div className="relative flex h-14 w-14 shrink-0 items-center justify-center rounded-xl border border-[#E5E7EB] bg-[#F8FAFC] p-2 shadow-sm">
                  <Image
                    src={PAYTRUE_LOGO_PATH}
                    alt="PayTrue Logo"
                    width={42}
                    height={42}
                    className="object-contain"
                    priority
                  />
                </div>
                <div>
                  <h1 className="text-3xl font-extrabold tracking-tight">
                    <span className="text-[#001F5B]">Pay</span>
                    <span className="bg-gradient-to-r from-[#0A84FF] to-[#0057D9] bg-clip-text text-transparent">
                      true
                    </span>
                  </h1>
                  <p className="mt-1 text-sm font-medium text-slate-500">
                    Retailer Account Statement / KYC Document
                  </p>
                </div>
              </div>

              <div className="grid gap-2 text-sm lg:text-right">
                <div className="flex flex-wrap items-center gap-2 lg:justify-end">
                  <StatusBadge status={retailer.status} />
                </div>
                <p className="text-[#111827]">
                  <span className="font-medium text-slate-500">Document No.</span>{" "}
                  <span className="font-semibold font-mono">
                    {retailer.userCode ||
                      retailer.outletId ||
                      retailer.id?.slice(0, 8)}
                  </span>
                </p>
                <p className="text-[#111827]">
                  <span className="font-medium text-slate-500">Outlet ID</span>{" "}
                  <span className="font-semibold font-mono">
                    {retailer.instantpayOutletId || retailer.outletId || "—"}
                  </span>
                </p>
                <p className="text-[#111827]">
                  <span className="font-medium text-slate-500">Member Since</span>{" "}
                  <span className="font-semibold">
                    {formatDocumentDate(retailer.createdAt)}
                  </span>
                </p>
              </div>
            </div>
          </header>

          <div className="bg-gradient-to-r from-[#001F5B] via-[#003380] to-[#1565d8] px-6 py-6 text-white sm:px-8 lg:px-10">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-center gap-4">
                <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-white/15 text-lg font-bold ring-2 ring-white/20">
                  {retailer.profileImage || media.profileImage ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={retailer.profileImage || media.profileImage}
                      alt={displayName}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    getRetailerInitials(displayName)
                  )}
                </div>
                <div className="min-w-0">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-blue-100">
                    Account Holder
                  </p>
                  <h2 className="mt-0.5 truncate text-2xl font-bold tracking-tight">
                    {displayName}
                  </h2>
                  <p className="mt-1 text-sm text-white/80">
                    {retailer.outletName || "Retail Outlet"}
                  </p>
                  <div className="mt-2.5 flex flex-wrap gap-x-4 gap-y-1 text-xs text-white/75">
                    <span className="inline-flex items-center gap-1.5">
                      <Phone className="h-3.5 w-3.5" />
                      {retailer.mobile || "—"}
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <Mail className="h-3.5 w-3.5" />
                      {retailer.email || "—"}
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <MapPin className="h-3.5 w-3.5" />
                      {locationLine || "—"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-white/15 bg-white/10 px-5 py-4 backdrop-blur">
                <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-white/70">
                  Wallet Balance
                </p>
                <p className="mt-1.5 flex items-center gap-2 text-2xl font-black tabular-nums">
                  <Wallet className="h-5 w-5 text-emerald-300" />
                  {formatCurrency(retailer.walletBalance ?? 0)}
                </p>
              </div>
            </div>
          </div>

          <DocumentSection
            icon={FileText}
            title="Account Summary"
            description="Registered business and contact particulars"
          >
            <div className="overflow-hidden rounded-2xl border border-[#E5E7EB]">
              <div className="grid md:grid-cols-2">
                <StatementField label="Full Name" value={displayName} />
                <StatementField
                  label="User Code"
                  value={retailer.userCode}
                  mono
                />
                <StatementField label="Email" value={retailer.email} />
                <StatementField label="Mobile" value={retailer.mobile} mono />
                <StatementField
                  label="Business Type"
                  value={getBusinessTypeLabel(retailer.businessType)}
                />
                <StatementField label="GSTIN" value={retailer.gstNumber} mono />
                <StatementField
                  label="Outlet Name"
                  value={retailer.outletName}
                />
                <StatementField
                  label="Outlet ID"
                  value={retailer.instantpayOutletId || retailer.outletId}
                  mono
                />
                <StatementField
                  label="Address"
                  value={retailer.address}
                  className="md:col-span-2"
                />
                <StatementField label="City" value={retailer.city} />
                <StatementField label="State" value={retailer.state} />
                <StatementField label="Pincode" value={retailer.pincode} mono />
                <StatementField label="District" value={retailer.district} />
              </div>
            </div>
          </DocumentSection>

          <DocumentSection
            icon={Landmark}
            title="Bank & Settlement Account"
            description="Settlement bank details as registered for this retailer"
          >
            {bankReceipt ? (
              <BankDetailsCard receipt={bankReceipt} />
            ) : (
              <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-6 py-12 text-center text-sm text-slate-500">
                No bank account details on file for this retailer.
              </div>
            )}
          </DocumentSection>

          <DocumentSection
            icon={ShieldCheck}
            title="KYC Identity"
            description="Verified identity numbers on record"
          >
            <div className="overflow-hidden rounded-2xl border border-[#E5E7EB]">
              <div className="grid md:grid-cols-2">
                <StatementField
                  label="Aadhaar"
                  value={maskRetailerAadhaar(retailer.aadhaarNumber)}
                  mono
                />
                <StatementField
                  label="PAN"
                  value={maskRetailerPan(retailer.panNumber)}
                  mono
                />
                <StatementField
                  label="Mini KYC"
                  value={retailer.miniKycStatus || "Not started"}
                />
                <StatementField
                  label="Biometric"
                  value={
                    retailer.biometricStatusMessage ||
                    retailer.biometricStatus ||
                    "—"
                  }
                />
              </div>
            </div>
          </DocumentSection>

          <DocumentSection
            icon={Eye}
            title="KYC Documents"
            description="Identity proofs — click View Full to open high-resolution preview"
          >
            <motion.div
              variants={profileStagger}
              initial="hidden"
              animate="show"
              className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
            >
              {kycDocuments.map((doc, index) => (
                <ProfileDocumentCard
                  key={doc.label}
                  label={doc.label}
                  url={doc.url}
                  index={index}
                  onPreview={(url, title) => setPreview({ url, title })}
                />
              ))}
            </motion.div>
          </DocumentSection>

          <DocumentSection
            icon={Landmark}
            title="Bank Documents"
            description="Passbook and cancelled cheque as submitted for settlement verification"
          >
            <motion.div
              variants={profileStagger}
              initial="hidden"
              animate="show"
              className="grid gap-4 sm:grid-cols-2"
            >
              {bankDocuments.map((doc, index) => (
                <ProfileDocumentCard
                  key={doc.label}
                  label={doc.label}
                  url={doc.url}
                  index={index}
                  onPreview={(url, title) => setPreview({ url, title })}
                />
              ))}
            </motion.div>
          </DocumentSection>

          <footer className="border-t border-[#E5E7EB] bg-[#F8FAFC] px-6 py-5 sm:px-8 lg:px-10">
            <div className="flex flex-col gap-2 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">
              <p>
                This is a system-generated retailer account document for internal
                verification use.
              </p>
              <p className="font-medium text-slate-600">
                Confidential · PayTrue Fintech
              </p>
            </div>
          </footer>
        </ReceiptPageLayout>
      )}

      <Dialog open={Boolean(preview)} onOpenChange={() => setPreview(null)}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-[#0b1f3a]">
              <Eye className="h-4 w-4 text-[#1565d8]" />
              {preview?.title || "Document Preview"}
            </DialogTitle>
          </DialogHeader>
          {preview?.url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={preview.url}
              alt={preview.title || "Document"}
              className="max-h-[70vh] w-full rounded-xl object-contain bg-slate-50"
            />
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function RetailerDetailPage({ retailerId }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            refetchOnWindowFocus: false,
            retry: 1,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <RetailerDetailDocument retailerId={retailerId} />
    </QueryClientProvider>
  );
}

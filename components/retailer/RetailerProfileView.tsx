"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useSelector } from "react-redux";
import { useAppDispatch } from "@/src/redux/types";
import { motion, type Variants } from "framer-motion";
import {
  ArrowLeft,
  BadgeCheck,
  Building2,
  Calendar,
  CreditCard,
  Eye,
  FileImage,
  Fingerprint,
  Landmark,
  Mail,
  MapPin,
  Phone,
  Shield,
  Store,
  User,
  Users,
  Wallet,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";
import PageLoader from "@/src/components/common/PageLoader";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { fetchProfile } from "@/src/redux/thunks/profileThunk";
import {
  selectProfile,
  selectProfileError,
  selectProfileLoading,
} from "@/src/redux/slices/profileSlice";
import { selectUser } from "@/src/redux/slices/authSlice";
import { getBusinessTypeLabel } from "@/src/constants/businessTypes";
import { getRetailerDisplayName } from "@/src/lib/userUtils";
import { formatCurrency } from "@/lib/utils";
import {
  extractProfileMedia,
  formatDateTime,
  formatProfileStatus,
  getProfileBank,
  maskAadhaar,
  maskAccountNumber,
  maskCardNumber,
  maskPan,
  resolveStatusBadge,
} from "@/src/lib/profileUtils";

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: "easeOut" } },
};

const stagger: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08, delayChildren: 0.05 } },
};

function DetailItem({
  label,
  value,
  mono = false,
}: {
  label: string;
  value?: string | null;
  mono?: boolean;
}) {
  return (
    <motion.div
      variants={fadeUp}
      className="rounded-xl border border-slate-100 bg-white px-4 py-3 shadow-sm transition hover:border-[#1565d8]/20 hover:shadow-md"
    >
      <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">
        {label}
      </p>
      <p
        className={`mt-1 text-sm font-semibold text-[#0b1f3a] ${mono ? "font-mono" : ""}`}
      >
        {value?.trim() ? value : "—"}
      </p>
    </motion.div>
  );
}

function StatusBadge({ status }: { status: unknown }) {
  const badge = resolveStatusBadge(status);
  return <Badge variant={badge.variant}>{badge.label}</Badge>;
}

function DocumentPreview({
  label,
  subtitle,
  url,
  onPreview,
  index = 0,
}: {
  label: string;
  subtitle?: string;
  url: string | null;
  onPreview: (url: string, title: string) => void;
  index?: number;
}) {
  return (
    <motion.div
      variants={fadeUp}
      custom={index}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className="group overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm transition hover:border-[#1565d8]/35 hover:shadow-lg"
    >
      <div className="border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white px-4 py-2.5">
        <p className="text-xs font-bold uppercase tracking-wide text-[#1565d8]">
          {label}
        </p>
        {subtitle ? (
          <p className="text-[11px] text-slate-500">{subtitle}</p>
        ) : null}
      </div>
      <div className="relative aspect-[1.58/1] bg-gradient-to-br from-slate-100 to-slate-50">
        {url ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={url} alt={label} className="h-full w-full object-cover" />
            <button
              type="button"
              onClick={() => onPreview(url, label)}
              className="absolute inset-0 flex items-center justify-center bg-[#0b1f3a]/0 opacity-0 transition group-hover:bg-[#0b1f3a]/45 group-hover:opacity-100"
              aria-label={`View ${label}`}
            >
              <span className="inline-flex items-center gap-2 rounded-full bg-white/95 px-3 py-1.5 text-xs font-semibold text-[#0b1f3a] shadow-lg">
                <Eye className="h-3.5 w-3.5" />
                View Full
              </span>
            </button>
          </>
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-2 text-slate-400">
            <FileImage className="h-8 w-8 opacity-40" />
            <p className="text-xs font-medium">Not uploaded</p>
          </div>
        )}
      </div>
    </motion.div>
  );
}

function SectionCard({
  icon: Icon,
  iconClass,
  title,
  description,
  badge,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>;
  iconClass: string;
  title: string;
  description: string;
  badge?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <motion.div variants={fadeUp}>
      <Card className="overflow-hidden border-slate-100 shadow-sm">
        <CardHeader className="border-b border-slate-50 bg-slate-50/60">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-xl ${iconClass}`}
              >
                <Icon className="h-5 w-5" />
              </div>
              <div>
                <CardTitle className="text-base">{title}</CardTitle>
                <CardDescription>{description}</CardDescription>
              </div>
            </div>
            {badge}
          </div>
        </CardHeader>
        <CardContent className="pt-5">{children}</CardContent>
      </Card>
    </motion.div>
  );
}

export default function RetailerProfileView() {
  const dispatch = useAppDispatch();
  const profile = useSelector(selectProfile) as Record<string, unknown> | null;
  const authUser = useSelector(selectUser);
  const loading = useSelector(selectProfileLoading);
  const error = useSelector(selectProfileError);
  const lastErrorRef = useRef<string | null>(null);
  const [preview, setPreview] = useState<{ url: string; title: string } | null>(
    null
  );

  useEffect(() => {
    dispatch(fetchProfile());
  }, [dispatch]);

  useEffect(() => {
    if (loading || !error) return;
    if (lastErrorRef.current === error) return;
    lastErrorRef.current = String(error);
    toast.error(typeof error === "string" ? error : "Failed to fetch profile");
  }, [loading, error]);

  const data = (profile || authUser || {}) as Record<string, unknown>;
  const outlet = (data.outlet || {}) as Record<string, unknown>;
  const kyc = (data.kyc || {}) as Record<string, unknown>;
  const bank = getProfileBank(data);
  const wallet = (data.wallet || {}) as Record<string, unknown>;
  const parent = (data.parent || {}) as Record<string, unknown>;
  const media = extractProfileMedia(data);

  const displayName = getRetailerDisplayName(data, "Retailer");
  const userCode = String(data.userCode ?? data.userId ?? data.id ?? "—");
  const email = String(data.email ?? "—");
  const mobile = String(data.mobile ?? "—");
  const firstNameOnly = String(data.firstName ?? displayName).trim() || displayName;

  const bioResponse = outlet.biometricKycStatusResponse as
    | Record<string, unknown>
    | undefined;
  const bioData = bioResponse?.data as Record<string, unknown> | undefined;
  const outletAadhaarDisplay = bioData?.outletAadhaarNumber
    ? String(bioData.outletAadhaarNumber)
    : maskAadhaar(String(kyc.aadhaarNumber ?? ""));

  if (loading && !profile && !authUser?.email) {
    return <PageLoader message="Loading profile..." />;
  }

  return (
    <motion.div
      initial="hidden"
      animate="show"
      variants={stagger}
      className="mx-auto w-full max-w-6xl space-y-6 pb-8"
    >
      <motion.div variants={fadeUp} className="flex flex-wrap items-center gap-3">
        <Link
          href="/rt/retailer"
          className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:border-[#1565d8]/30 hover:text-[#1565d8]"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl font-bold tracking-tight text-[#001F5B]">
            My Profile
          </h1>
          <p className="text-sm text-slate-500">
            Complete retailer identity, KYC & settlement details
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href="/rt/retailer/profile/edit"
            className="inline-flex h-10 items-center gap-2 rounded-xl bg-[#1565d8] px-4 text-sm font-bold text-white shadow-md transition hover:bg-[#0d47a1]"
          >
            Edit Profile
          </Link>
          <StatusBadge status={data.kycStatus ?? kyc.status} />
        </div>
      </motion.div>

      {error ? (
        <motion.div
          variants={fadeUp}
          className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600"
        >
          {String(error)}
        </motion.div>
      ) : null}

      {/* Hero — bank-grade identity banner */}
      <motion.div variants={fadeUp}>
        <div className="overflow-hidden rounded-2xl border border-slate-200/80 shadow-[0_12px_36px_rgba(11,31,58,0.12)]">
          <div className="relative bg-gradient-to-r from-[#0b2a4a] via-[#0e3a63] to-[#1565d8] px-5 py-6 text-white sm:px-7 sm:py-7">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(255,255,255,0.12),transparent_55%)]" />

            <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
                <div className="relative shrink-0">
                  {media.profileImage ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={media.profileImage}
                      alt={displayName}
                      className="h-24 w-24 rounded-2xl border-2 border-white/30 object-cover shadow-2xl sm:h-28 sm:w-28"
                    />
                  ) : (
                    <div className="flex h-24 w-24 items-center justify-center rounded-2xl border-2 border-white/30 bg-white/10 text-3xl font-bold shadow-2xl sm:h-28 sm:w-28">
                      {displayName.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <span className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full border-2 border-[#0b2a4a] bg-emerald-500 shadow">
                    <BadgeCheck className="h-4 w-4 text-white" />
                  </span>
                </div>

                <div className="min-w-0">
                  <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-blue-100/85">
                    PayTrue Retailer Account
                  </p>
                  <h2 className="mt-1 text-2xl font-extrabold tracking-tight sm:text-3xl">
                    {displayName}
                  </h2>
                  <p className="mt-1 font-mono text-sm text-blue-100/90">
                    Retailer ID · {userCode}
                  </p>

                  <div className="mt-4 flex flex-wrap gap-2">
                    <span className="inline-flex max-w-full items-center gap-1.5 rounded-lg border border-white/15 bg-black/15 px-2.5 py-1.5 text-[11px] font-medium backdrop-blur-sm">
                      <Mail className="h-3.5 w-3.5 shrink-0 opacity-80" />
                      <span className="truncate">{email}</span>
                    </span>
                    <span className="inline-flex items-center gap-1.5 rounded-lg border border-white/15 bg-black/15 px-2.5 py-1.5 text-[11px] font-medium backdrop-blur-sm">
                      <Phone className="h-3.5 w-3.5 opacity-80" />
                      {mobile}
                    </span>
                    {data.mobileVerified ? (
                      <span className="inline-flex items-center gap-1 rounded-lg border border-emerald-300/30 bg-emerald-500/20 px-2.5 py-1.5 text-[11px] font-semibold text-emerald-50">
                        <BadgeCheck className="h-3.5 w-3.5" />
                        Mobile Verified
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-lg border border-amber-300/30 bg-amber-500/20 px-2.5 py-1.5 text-[11px] font-semibold text-amber-50">
                        <XCircle className="h-3.5 w-3.5" />
                        Mobile Pending
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:min-w-[320px]">
                {[
                  { label: "Account", value: formatProfileStatus(data.status) },
                  {
                    label: "KYC",
                    value: formatProfileStatus(data.kycStatus ?? kyc.status),
                  },
                  {
                    label: "Mini KYC",
                    value: formatProfileStatus(outlet.miniKycStatus),
                  },
                  {
                    label: "Biometric",
                    value: formatProfileStatus(outlet.biometricStatus),
                  },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="rounded-xl border border-white/12 bg-white/10 px-3 py-2.5 backdrop-blur-sm"
                  >
                    <p className="text-[9px] font-bold uppercase tracking-[0.12em] text-blue-100/70">
                      {item.label}
                    </p>
                    <p className="mt-1 text-[13px] font-bold leading-tight">
                      {item.value}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Quick stats */}
      <motion.div variants={fadeUp} className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          {
            icon: Wallet,
            label: "Wallet Balance",
            value: formatCurrency(Number(data.walletBalance ?? wallet.balance ?? 0)),
            tone: "from-emerald-500 to-emerald-600",
          },
          {
            icon: Calendar,
            label: "Last Login",
            value: formatDateTime(data.lastLoginAt),
            tone: "from-violet-500 to-violet-600",
          },
          {
            icon: Store,
            label: "Outlet ID",
            value: String(outlet.instantpayOutletId ?? "—"),
            tone: "from-orange-500 to-orange-600",
          },
          {
            icon: Fingerprint,
            label: "Outlet Aadhaar",
            value: outletAadhaarDisplay,
            tone: "from-[#1565d8] to-[#0057D9]",
          },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            whileHover={{ y: -3 }}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 + i * 0.07 }}
            className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm"
          >
            <div className={`h-1 bg-gradient-to-r ${stat.tone}`} />
            <div className="flex items-start gap-3 p-4">
              <div
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${stat.tone} text-white shadow-md`}
              >
                <stat.icon className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
                  {stat.label}
                </p>
                <p className="mt-1 truncate text-sm font-bold text-[#0b1f3a]">
                  {stat.value}
                </p>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      <div className="grid gap-6 lg:grid-cols-2">
        <SectionCard
          icon={User}
          iconClass="bg-[#1565d8]/10 text-[#1565d8]"
          title="Personal Information"
          description="Account & contact details"
        >
          <motion.div variants={stagger} initial="hidden" animate="show" className="grid gap-3 sm:grid-cols-2">
            <DetailItem label="Name" value={firstNameOnly} />
            <DetailItem label="Email" value={email} />
            <DetailItem label="Mobile" value={mobile} />
            <DetailItem
              label="Alternate Mobile"
              value={String(data.alternateMobileNumber ?? "—")}
            />
            <DetailItem
              label="Email Verified"
              value={data.isEmailVerified ? "Yes" : "No"}
            />
            <DetailItem
              label="Mobile Verified At"
              value={formatDateTime(data.mobileVerifiedAt)}
            />
            <DetailItem label="Member Since" value={formatDateTime(data.createdAt)} />
            <DetailItem label="Last Login IP" value={String(data.lastLoginIp ?? "—")} mono />
            <DetailItem label="Account Status" value={formatProfileStatus(data.status)} />
          </motion.div>
        </SectionCard>

        <SectionCard
          icon={Building2}
          iconClass="bg-violet-500/10 text-violet-600"
          title="Outlet & Business"
          description={String(outlet.outletName ?? "Business outlet")}
          badge={<StatusBadge status={outlet.miniKycStatus} />}
        >
          <motion.div variants={stagger} initial="hidden" animate="show" className="grid gap-3 sm:grid-cols-2">
            <DetailItem label="Outlet Name" value={String(outlet.outletName ?? "")} />
            <DetailItem
              label="Business Type"
              value={
                getBusinessTypeLabel(String(outlet.businessType ?? "")) ||
                String(outlet.businessType ?? "")
              }
            />
            <DetailItem label="GST Number" value={String(outlet.gstNumber || "—")} mono />
            <DetailItem label="Pincode" value={String(outlet.pincode ?? "")} />
            <DetailItem label="City" value={String(outlet.city ?? "")} />
            <DetailItem label="District" value={String(outlet.district ?? "")} />
            <DetailItem label="State" value={String(outlet.state ?? "")} />
            <DetailItem
              label="InstantPay Outlet"
              value={String(outlet.instantpayOutletId ?? "—")}
              mono
            />
            <DetailItem
              label="KYC Completed"
              value={formatDateTime(outlet.kycCompletedAt)}
            />
            <DetailItem
              label="Biometric Status"
              value={formatProfileStatus(outlet.biometricStatus)}
            />
            <div className="rounded-xl border border-slate-100 bg-white px-4 py-3 shadow-sm sm:col-span-2">
              <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">
                Address
              </p>
              <p className="mt-1 flex items-start gap-2 text-sm font-semibold text-[#0b1f3a]">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[#1565d8]" />
                {String(outlet.address ?? "—")}
                {outlet.latitude && outlet.longitude ? (
                  <span className="block text-xs font-normal text-slate-500">
                    GPS: {String(outlet.latitude)}, {String(outlet.longitude)}
                  </span>
                ) : null}
              </p>
            </div>
          </motion.div>
        </SectionCard>
      </div>

      {/* Wallet card */}
      {wallet.cardNumber ? (
        <SectionCard
          icon={CreditCard}
          iconClass="bg-[#1565d8] text-white shadow-md"
          title="PayTrue Virtual Wallet"
          description="Retailer settlement card"
        >
          <motion.div
            variants={fadeUp}
            className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#18335D] via-[#204E9D] to-[#1F6BFF] p-6 text-white shadow-xl"
          >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.18),transparent_40%)]" />
            <div className="relative flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-white/50">
                  PayTrue Virtual
                </p>
                <p className="mt-1 text-xl font-bold">Retailer Wallet Card</p>
                <p className="mt-4 font-mono text-lg tracking-[0.2em]">
                  {maskCardNumber(String(wallet.cardNumber))}
                </p>
                <p className="mt-3 text-sm font-semibold uppercase text-white/90">
                  {String(wallet.cardHolderName ?? displayName)}
                </p>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-bold uppercase tracking-wide text-white/50">
                  Balance
                </p>
                <p className="text-3xl font-bold">
                  {formatCurrency(Number(wallet.balance ?? data.walletBalance ?? 0))}
                </p>
                <StatusBadge status={wallet.status} />
              </div>
            </div>
          </motion.div>
        </SectionCard>
      ) : null}

      {/* Parent distributor */}
      {parent.id ? (
        <SectionCard
          icon={Users}
          iconClass="bg-slate-500/10 text-slate-600"
          title="Parent Distributor"
          description="Your uplink distributor account"
        >
          <motion.div variants={stagger} initial="hidden" animate="show" className="grid gap-3 sm:grid-cols-2">
            <DetailItem
              label="Name"
              value={`${parent.firstName ?? ""} ${parent.lastName ?? ""}`.trim()}
            />
            <DetailItem label="Distributor Code" value={String(parent.userCode ?? "")} mono />
            <DetailItem label="Email" value={String(parent.email ?? "")} />
            <DetailItem label="Mobile" value={String(parent.mobile ?? "")} />
          </motion.div>
        </SectionCard>
      ) : null}

      {/* KYC */}
      <SectionCard
        icon={Shield}
        iconClass="bg-emerald-500/10 text-emerald-600"
        title="KYC Documents"
        description="Identity verification records"
        badge={<StatusBadge status={kyc.status ?? data.kycStatus} />}
      >
        <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-5">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <DetailItem
              label="Aadhaar Number"
              value={maskAadhaar(String(kyc.aadhaarNumber ?? ""))}
              mono
            />
            <DetailItem label="PAN Number" value={maskPan(String(kyc.panNumber ?? ""))} mono />
            <DetailItem label="KYC Status" value={formatProfileStatus(kyc.status)} />
            <DetailItem label="Verified At" value={formatDateTime(kyc.verifiedAt)} />
          </div>

          <div>
            <p className="mb-3 text-xs font-bold uppercase tracking-wide text-slate-500">
              Aadhaar Card
            </p>
            <div className="grid gap-4 sm:grid-cols-2">
              <DocumentPreview
                label="Aadhaar Front"
                subtitle="Government ID — front side"
                url={media.aadhaarFront}
                onPreview={(url, title) => setPreview({ url, title })}
                index={0}
              />
              <DocumentPreview
                label="Aadhaar Back"
                subtitle="Government ID — back side"
                url={media.aadhaarBack}
                onPreview={(url, title) => setPreview({ url, title })}
                index={1}
              />
            </div>
          </div>

          <div>
            <p className="mb-3 text-xs font-bold uppercase tracking-wide text-slate-500">
              PAN & Owner Photo
            </p>
            <div className="grid gap-4 sm:grid-cols-2">
              <DocumentPreview
                label="PAN Card"
                subtitle="Income Tax identity document"
                url={media.panCard}
                onPreview={(url, title) => setPreview({ url, title })}
                index={2}
              />
              <DocumentPreview
                label="Owner Photo"
                subtitle="Passport-size photograph"
                url={media.ownerPhoto}
                onPreview={(url, title) => setPreview({ url, title })}
                index={3}
              />
            </div>
          </div>
        </motion.div>
      </SectionCard>

      {/* Bank */}
      <SectionCard
        icon={Landmark}
        iconClass="bg-[#1565d8] text-white shadow-md"
        title="Bank Account Details"
        description="Settlement & payout account"
      >
        <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-5">
          <motion.div
            variants={fadeUp}
            className="rounded-2xl border border-[#1565d8]/20 bg-gradient-to-br from-blue-50/90 to-white p-5 shadow-sm"
          >
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#1565d8] text-white shadow-md">
                <Landmark className="h-6 w-6" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[11px] font-bold uppercase tracking-wide text-[#1565d8]">
                  Primary Bank Account
                </p>
                <p className="mt-1 text-xl font-bold text-[#001F5B]">
                  {String(bank.accountHolderName ?? "—")}
                </p>
                <p className="text-sm font-semibold text-slate-700">
                  {String(bank.bankName ?? "—")}
                </p>
                <div className="mt-3 flex flex-wrap gap-x-8 gap-y-2">
                  <div>
                    <p className="text-[10px] font-bold uppercase text-slate-400">
                      Account Number
                    </p>
                    <p className="font-mono text-sm font-bold text-[#0b1f3a]">
                      {maskAccountNumber(String(bank.accountNumber ?? ""))}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase text-slate-400">
                      IFSC Code
                    </p>
                    <p className="font-mono text-sm font-bold text-[#0b1f3a]">
                      {String(bank.ifscCode ?? "—")}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {(media.passbookImage || media.cancelledChequeImage) && (
            <div>
              <p className="mb-3 text-xs font-bold uppercase tracking-wide text-slate-500">
                Bank Proof Documents
              </p>
              <div className="grid gap-4 sm:grid-cols-2">
                {media.passbookImage ? (
                  <DocumentPreview
                    label="Passbook"
                    subtitle="Bank passbook copy"
                    url={media.passbookImage}
                    onPreview={(url, title) => setPreview({ url, title })}
                  />
                ) : null}
                {media.cancelledChequeImage ? (
                  <DocumentPreview
                    label="Cancelled Cheque"
                    subtitle="Cancelled cheque leaf"
                    url={media.cancelledChequeImage}
                    onPreview={(url, title) => setPreview({ url, title })}
                  />
                ) : null}
              </div>
            </div>
          )}
        </motion.div>
      </SectionCard>

      <Dialog open={Boolean(preview)} onOpenChange={() => setPreview(null)}>
        <DialogContent className="max-h-[92vh] max-w-4xl overflow-hidden border-0 bg-[#0b1f3a] p-3 sm:p-4">
          <DialogHeader className="pr-10">
            <DialogTitle className="text-white">{preview?.title ?? "Document Preview"}</DialogTitle>
          </DialogHeader>
          {preview?.url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={preview.url}
              alt={preview.title}
              className="max-h-[calc(92vh-5rem)] w-full rounded-xl object-contain bg-black/20"
            />
          ) : null}
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}

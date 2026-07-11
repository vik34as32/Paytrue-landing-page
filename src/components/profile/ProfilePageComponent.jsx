"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useDispatch, useSelector } from "react-redux";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  BadgeCheck,
  Building2,
  Calendar,
  Eye,
  Landmark,
  Mail,
  Phone,
  Shield,
  User,
  Wallet,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";
import PageLoader from "@/src/components/common/PageLoader";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card } from "@/components/ui/card";
import { fetchProfile } from "@/src/redux/thunks/profileThunk";
import {
  selectProfile,
  selectProfileLoading,
  selectProfileError,
} from "@/src/redux/slices/profileSlice";
import { selectUser } from "@/src/redux/slices/authSlice";
import { getBusinessTypeLabel } from "@/src/constants/businessTypes";
import { getUserDisplayName } from "@/src/lib/userUtils";
import { formatCurrency } from "@/lib/utils";
import {
  extractProfileMedia,
  formatDateTime,
  formatProfileStatus,
  getProfileBank,
  maskAadhaar,
  maskAccountNumber,
  maskPan,
} from "@/src/lib/profileUtils";
import {
  ProfileDetailItem,
  ProfileDocumentCard,
  ProfileHeroMetric,
  ProfileSectionCard,
  ProfileStatCard,
  ProfileStatusBadge,
  profileFadeUp,
  profileStagger,
} from "@/src/components/profile/ProfileModules";

const ROLE_CONFIG = {
  dd: {
    portalLabel: "PayTrue Distributor",
    idLabel: "Distributor ID",
    backHref: "/dd/dashboard",
    fallbackName: "Distributor",
  },
  md: {
    portalLabel: "PayTrue Master Distributor",
    idLabel: "Master Distributor ID",
    backHref: "/md/dashboard",
    fallbackName: "Master Distributor",
  },
  rt: {
    portalLabel: "PayTrue Retailer",
    idLabel: "Retailer ID",
    backHref: "/rt/retailer",
    fallbackName: "Retailer",
  },
};

export default function ProfilePageComponent({ role = "dd" }) {
  const dispatch = useDispatch();
  const profile = useSelector(selectProfile);
  const authUser = useSelector(selectUser);
  const loading = useSelector(selectProfileLoading);
  const error = useSelector(selectProfileError);
  const lastErrorRef = useRef(null);
  const [preview, setPreview] = useState(null);

  const config = ROLE_CONFIG[role] || ROLE_CONFIG.dd;

  useEffect(() => {
    dispatch(fetchProfile());
  }, [dispatch]);

  useEffect(() => {
    if (loading || !error) return;
    if (lastErrorRef.current === error) return;
    lastErrorRef.current = error;
    toast.error(typeof error === "string" ? error : "Failed to fetch profile");
  }, [loading, error]);

  const data = profile || authUser || {};
  const outlet = data.outlet || {};
  const kyc = data.kyc || data.kycDocument || {};
  const bank = getProfileBank(data);
  const wallet = data.wallet || {};
  const media = extractProfileMedia(data);

  const displayName = getUserDisplayName(data, config.fallbackName);
  const userCode = String(data.userCode || data.userId || data.id || "—");
  const email = String(data.email || "—");
  const mobile = String(data.mobile || "—");

  if (loading && !profile && !authUser?.email) {
    return <PageLoader message="Loading profile..." />;
  }

  const heroMetrics = [
    { label: "Account", value: formatProfileStatus(data.status) },
    { label: "KYC", value: formatProfileStatus(data.kycStatus || kyc.status) },
    {
      label: "Email",
      value: data.isEmailVerified || data.emailVerified ? "Verified" : "Pending",
    },
    {
      label: "Mobile",
      value: data.mobileVerified ? "Verified" : "Pending",
    },
  ];

  const quickStats = [
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
      icon: Building2,
      label: "Outlet Name",
      value: String(outlet.outletName || "—"),
      tone: "from-orange-500 to-orange-600",
    },
    {
      icon: User,
      label: "Member Since",
      value: formatDateTime(data.createdAt),
      tone: "from-[#1565d8] to-[#0057D9]",
    },
  ];

  const kycDocuments = [
    { label: "Profile Photo", url: media.profileImage },
    { label: "Aadhaar Front", url: media.aadhaarFront },
    { label: "Aadhaar Back", url: media.aadhaarBack },
    { label: "PAN Card", url: media.panCard },
    { label: "Owner Photo", url: media.ownerPhoto },
  ];

  const bankDocuments = [
    { label: "Passbook", url: media.passbookImage },
    { label: "Cancelled Cheque", url: media.cancelledChequeImage },
  ];

  return (
    <motion.div
      initial="hidden"
      animate="show"
      variants={profileStagger}
      className="mx-auto w-full max-w-6xl space-y-6 pb-8"
    >
      <motion.div variants={profileFadeUp} className="flex flex-wrap items-center gap-3">
        <Link
          href={config.backHref}
          className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:border-[#1565d8]/30 hover:text-[#1565d8]"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl font-bold tracking-tight text-[#001F5B]">My Profile</h1>
          <p className="text-sm text-slate-500">
            Complete account identity, KYC & settlement details
          </p>
        </div>
        <ProfileStatusBadge status={data.status} />
      </motion.div>

      {error ? (
        <motion.div
          variants={profileFadeUp}
          className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600"
        >
          {error}
        </motion.div>
      ) : null}

      <motion.div variants={profileFadeUp}>
        <Card className="overflow-hidden border-0 shadow-xl">
          <div className="relative bg-gradient-to-br from-[#001F5B] via-[#0057D9] to-[#1565d8] px-6 py-8 text-white sm:px-8">
            <motion.div
              animate={{ scale: [1, 1.08, 1], opacity: [0.15, 0.25, 0.15] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
              className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/20 blur-3xl"
            />
            <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
                <motion.div
                  initial={{ scale: 0.85, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: "spring", stiffness: 200, damping: 18 }}
                  className="relative shrink-0"
                >
                  {media.profileImage ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={media.profileImage}
                      alt={displayName}
                      className="h-28 w-28 rounded-2xl border-4 border-white/25 object-cover shadow-2xl ring-4 ring-white/10"
                    />
                  ) : (
                    <div className="flex h-28 w-28 items-center justify-center rounded-2xl border-4 border-white/25 bg-white/10 text-4xl font-bold shadow-2xl">
                      {displayName.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <span className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full border-2 border-[#0057D9] bg-emerald-500">
                    <BadgeCheck className="h-4 w-4 text-white" />
                  </span>
                </motion.div>

                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-blue-100/80">
                    {config.portalLabel}
                  </p>
                  <h2 className="mt-1 text-3xl font-bold">{displayName}</h2>
                  <p className="mt-1 font-mono text-sm text-blue-100">{userCode}</p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs">
                      <Mail className="h-3.5 w-3.5" />
                      {email}
                    </span>
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs">
                      <Phone className="h-3.5 w-3.5" />
                      {mobile}
                    </span>
                    {data.mobileVerified ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/25 px-3 py-1 text-xs text-emerald-100">
                        <BadgeCheck className="h-3.5 w-3.5" />
                        Mobile Verified
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/25 px-3 py-1 text-xs text-amber-100">
                        <XCircle className="h-3.5 w-3.5" />
                        Mobile Pending
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4">
                {heroMetrics.map((item, index) => (
                  <ProfileHeroMetric
                    key={item.label}
                    label={item.label}
                    value={item.value}
                    delay={0.15 + index * 0.06}
                  />
                ))}
              </div>
            </div>
          </div>
        </Card>
      </motion.div>

      <motion.div variants={profileFadeUp} className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {quickStats.map((stat, index) => (
          <ProfileStatCard
            key={stat.label}
            icon={stat.icon}
            label={stat.label}
            value={stat.value}
            tone={stat.tone}
            delay={0.2 + index * 0.07}
          />
        ))}
      </motion.div>

      <div className="grid gap-6 lg:grid-cols-2">
        <ProfileSectionCard
          icon={User}
          iconClass="bg-[#1565d8]/10 text-[#1565d8]"
          title="Personal Information"
          description="Account & contact details"
        >
          <motion.div
            variants={profileStagger}
            initial="hidden"
            animate="show"
            className="grid gap-3 sm:grid-cols-2"
          >
            <ProfileDetailItem label="First Name" value={data.firstName} />
            <ProfileDetailItem label="Last Name" value={data.lastName} />
            <ProfileDetailItem label="Full Name" value={displayName} />
            <ProfileDetailItem label={config.idLabel} value={userCode} mono />
            <ProfileDetailItem label="Email" value={email} />
            <ProfileDetailItem label="Mobile" value={mobile} mono />
            <ProfileDetailItem
              label="Alternate Mobile"
              value={data.alternateMobileNumber}
              mono
            />
            <ProfileDetailItem
              label="Email Verified"
              value={data.isEmailVerified || data.emailVerified ? "Yes" : "No"}
            />
            <ProfileDetailItem
              label="Mobile Verified At"
              value={formatDateTime(data.mobileVerifiedAt)}
            />
            <ProfileDetailItem label="Member Since" value={formatDateTime(data.createdAt)} />
            <ProfileDetailItem
              label="Last Login IP"
              value={data.lastLoginIp}
              mono
            />
            <ProfileDetailItem
              label="Account Status"
              value={formatProfileStatus(data.status)}
            />
          </motion.div>
        </ProfileSectionCard>

        <ProfileSectionCard
          icon={Building2}
          iconClass="bg-violet-500/10 text-violet-600"
          title="Outlet & Business"
          description={outlet.outletName || "Business outlet details"}
          badge={<ProfileStatusBadge status={outlet.miniKycStatus || data.kycStatus} />}
        >
          <motion.div
            variants={profileStagger}
            initial="hidden"
            animate="show"
            className="grid gap-3 sm:grid-cols-2"
          >
            <ProfileDetailItem label="Outlet Name" value={outlet.outletName} />
            <ProfileDetailItem
              label="Business Type"
              value={
                getBusinessTypeLabel(outlet.businessType) || outlet.businessType
              }
            />
            <ProfileDetailItem label="GST Number" value={outlet.gstNumber || "—"} mono />
            <ProfileDetailItem label="Pincode" value={outlet.pincode} mono />
            <ProfileDetailItem label="City" value={outlet.city} />
            <ProfileDetailItem label="District" value={outlet.district} />
            <ProfileDetailItem label="State" value={outlet.state} />
            <ProfileDetailItem
              label="Outlet ID"
              value={outlet.instantpayOutletId || outlet.outletId}
              mono
            />
            <ProfileDetailItem label="Address" value={outlet.address} />
            <ProfileDetailItem
              label="KYC Completed"
              value={formatDateTime(outlet.kycCompletedAt)}
            />
          </motion.div>
        </ProfileSectionCard>
      </div>

      <ProfileSectionCard
        icon={Shield}
        iconClass="bg-amber-500/10 text-amber-600"
        title="KYC Documents"
        description="Identity verification records"
        badge={<ProfileStatusBadge status={data.kycStatus || kyc.status} />}
      >
        <motion.div
          variants={profileStagger}
          initial="hidden"
          animate="show"
          className="mb-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4"
        >
          <ProfileDetailItem
            label="Aadhaar Number"
            value={maskAadhaar(kyc.aadhaarNumber)}
            mono
          />
          <ProfileDetailItem label="PAN Number" value={maskPan(kyc.panNumber)} mono />
        </motion.div>
        <motion.div
          variants={profileStagger}
          initial="hidden"
          animate="show"
          className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5"
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
      </ProfileSectionCard>

      <ProfileSectionCard
        icon={Landmark}
        iconClass="bg-emerald-500/10 text-emerald-600"
        title="Bank & Settlement"
        description="Settlement account details"
      >
        <motion.div
          variants={profileStagger}
          initial="hidden"
          animate="show"
          className="mb-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4"
        >
          <ProfileDetailItem
            label="Account Holder"
            value={bank.accountHolderName}
          />
          <ProfileDetailItem label="Bank Name" value={bank.bankName} />
          <ProfileDetailItem
            label="Account Number"
            value={maskAccountNumber(bank.accountNumber)}
            mono
          />
          <ProfileDetailItem label="IFSC Code" value={bank.ifscCode} mono />
        </motion.div>
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
      </ProfileSectionCard>

      <Dialog open={Boolean(preview)} onOpenChange={() => setPreview(null)}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-[#0b1f3a]">
              <Eye className="h-4 w-4" />
              {preview?.title}
            </DialogTitle>
          </DialogHeader>
          {preview?.url ? (
            <div className="overflow-hidden rounded-2xl border border-slate-100 bg-slate-50">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={preview.url}
                alt={preview.title}
                className="max-h-[70vh] w-full object-contain"
              />
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}

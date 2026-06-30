"use client";

import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  User,
  Mail,
  Phone,
  Building2,
  Shield,
  Landmark,
  Pencil,
} from "lucide-react";
import PageHeader from "@/src/components/common/PageHeader";
import PageLoader from "@/src/components/common/PageLoader";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { fetchProfile } from "@/src/redux/thunks/profileThunk";
import {
  selectProfile,
  selectProfileLoading,
  selectProfileError,
} from "@/src/redux/slices/profileSlice";

function InfoCard({ icon: Icon, title, children }) {
  return (
    <Card className="overflow-hidden border-slate-100 shadow-sm dark:border-slate-800">
      <CardHeader className="border-b border-slate-50 bg-gradient-to-r from-[#1565d8]/5 to-transparent dark:border-slate-800">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#1565d8]/10 text-[#1565d8]">
            <Icon className="h-5 w-5" />
          </div>
          <div>
            <CardTitle className="text-base">{title}</CardTitle>
          </div>
        </div>
      </CardHeader>
      <CardContent className="grid gap-3 pt-4 sm:grid-cols-2">{children}</CardContent>
    </Card>
  );
}

function InfoField({ label, value }) {
  return (
    <div className="rounded-xl border border-slate-100 bg-slate-50/80 px-4 py-3 dark:border-slate-800 dark:bg-slate-900/50">
      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{label}</p>
      <p className="mt-1 text-sm font-semibold text-[#0b1f3a] dark:text-white">{value || "—"}</p>
    </div>
  );
}

export default function ProfilePageComponent({ role }) {
  const dispatch = useDispatch();
  const profile = useSelector(selectProfile);
  const loading = useSelector(selectProfileLoading);
  const error = useSelector(selectProfileError);

  useEffect(() => {
    dispatch(fetchProfile());
  }, [dispatch]);

  const backHref = role === "md" ? "/md/dashboard" : "/dd/dashboard";
  const data = profile || {};

  if (loading && !profile) {
    return <PageLoader message="Loading profile..." />;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="My Profile"
        description="View your account, KYC and bank information"
        icon={User}
        backHref={backHref}
        actions={
          <Button variant="outline" size="sm" disabled title="Edit profile API pending">
            <Pencil className="h-4 w-4" />
            Edit Profile
          </Button>
        }
      />

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      <Card className="overflow-hidden border-0 bg-gradient-to-br from-[#001F5B] via-[#0057D9] to-[#1565d8] text-white shadow-xl">
        <CardContent className="flex flex-col items-center gap-4 p-8 sm:flex-row sm:items-start">
          {data.profileImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={data.profileImage}
              alt={data.name}
              className="h-24 w-24 rounded-2xl border-4 border-white/20 object-cover shadow-lg"
            />
          ) : (
            <div className="flex h-24 w-24 items-center justify-center rounded-2xl border-4 border-white/20 bg-white/10 text-3xl font-bold">
              {data.name?.charAt(0) || "U"}
            </div>
          )}
          <div className="text-center sm:text-left">
            <h2 className="text-2xl font-bold">{data.name}</h2>
            <p className="mt-1 text-blue-100">{data.roleLabel || data.userType}</p>
            <div className="mt-3 flex flex-wrap justify-center gap-3 text-sm sm:justify-start">
              <span className="inline-flex items-center gap-1 rounded-full bg-white/10 px-3 py-1">
                <Mail className="h-3.5 w-3.5" />
                {data.email}
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-white/10 px-3 py-1">
                <Phone className="h-3.5 w-3.5" />
                {data.mobile}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      <InfoCard icon={User} title="Personal Information">
        <InfoField label="First Name" value={data.firstName} />
        <InfoField label="Last Name" value={data.lastName} />
        <InfoField label="Email" value={data.email} />
        <InfoField label="Mobile" value={data.mobile} />
        <InfoField label="Alternate Mobile" value={data.alternateMobileNumber} />
        <InfoField label="User Type" value={data.roleLabel || data.userType} />
      </InfoCard>

      {data.outlet && (
        <InfoCard icon={Building2} title="Outlet Information">
          <InfoField label="Outlet Name" value={data.outlet.outletName} />
          <InfoField label="Business Type" value={data.outlet.businessType} />
          <InfoField label="GST Number" value={data.outlet.gstNumber} />
          <InfoField label="Address" value={data.outlet.address} />
          <InfoField label="State" value={data.outlet.state} />
          <InfoField label="District" value={data.outlet.district} />
          <InfoField label="City" value={data.outlet.city} />
          <InfoField label="Pincode" value={data.outlet.pincode} />
        </InfoCard>
      )}

      {data.kyc && (
        <InfoCard icon={Shield} title="KYC Information">
          <InfoField label="Aadhaar Number" value={data.kyc.aadhaarNumber} />
          <InfoField label="PAN Number" value={data.kyc.panNumber} />
        </InfoCard>
      )}

      {data.bankAccount && (
        <InfoCard icon={Landmark} title="Bank Information">
          <InfoField label="Account Holder" value={data.bankAccount.accountHolderName} />
          <InfoField label="Bank Name" value={data.bankAccount.bankName} />
          <InfoField label="Account Number" value={data.bankAccount.accountNumber} />
          <InfoField label="IFSC Code" value={data.bankAccount.ifscCode} />
        </InfoCard>
      )}
    </div>
  );
}

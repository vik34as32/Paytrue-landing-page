"use client";

import { User, Settings, BarChart3 } from "lucide-react";
import PageHeader from "@/src/components/common/PageHeader";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useSelector } from "react-redux";
import { selectMdUser, selectDdUser } from "@/src/redux/slices/authSlice";

export default function ProfilePage({ role }) {
  const mdUser = useSelector(selectMdUser);
  const ddUser = useSelector(selectDdUser);
  const user = role === "md" ? mdUser : ddUser;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Profile"
        description="Your account information"
        icon={User}
        backHref={role === "md" ? "/md/dashboard" : "/dd/dashboard"}
      />

      <Card>
        <CardHeader>
          <CardTitle>Account Details</CardTitle>
          <CardDescription>Personal and portal information</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          {[
            ["Full Name", user?.name],
            ["User ID", user?.userId],
            ["Role", user?.roleLabel],
            ["Email", user?.email],
            ["Mobile", user?.mobile],
          ].map(([label, value]) => (
            <div
              key={label}
              className="rounded-xl border border-slate-100 bg-slate-50/80 px-4 py-3"
            >
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                {label}
              </p>
              <p className="mt-1 text-sm font-semibold text-[#0b1f3a]">{value}</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

export function SettingsPage({ role }) {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Settings"
        description="Manage your portal preferences"
        icon={Settings}
        backHref={role === "md" ? "/md/dashboard" : "/dd/dashboard"}
      />
      <Card>
        <CardHeader>
          <CardTitle>Portal Settings</CardTitle>
          <CardDescription>Configuration options will be available with API integration</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-slate-500">
            Notification preferences, password change, and security settings will be connected to backend APIs.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

export function ReportsPage({ role }) {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Reports"
        description="Business and commission reports"
        icon={BarChart3}
        backHref={role === "md" ? "/md/dashboard" : "/dd/dashboard"}
      />
      <Card>
        <CardHeader>
          <CardTitle>Reports Dashboard</CardTitle>
          <CardDescription>Detailed reports will load from API endpoints</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-slate-500">
            Commission reports, business summaries, and export options will be available once APIs are integrated.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

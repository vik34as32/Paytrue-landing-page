"use client";

import Link from "next/link";
import { ArrowLeft, BadgeCheck, Mail, Phone, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import VirtualCard from "@/components/retailer/VirtualCard";
import { RETAILER_USER } from "@/features/retailer/constants";
import { useWalletStore, selectRetailerDisplayBalance } from "@/features/retailer/store/walletStore";
import { formatCurrency } from "@/lib/utils";

export default function ProfilePage() {
  const balance = useWalletStore(selectRetailerDisplayBalance);
  const transactions = useWalletStore((s) => s.transactions);

  return (
    <div className="w-full max-w-none space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild>
          <Link href="/rt/retailer">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-[#001F5B]">
            Profile Management
          </h1>
          <p className="text-sm text-slate-500">
            Manage your account & KYC details
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="w-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              My Profile
            </CardTitle>
            <CardDescription>Retailer account information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-[#0A84FF] to-[#0057D9] text-2xl font-bold text-white">
                {RETAILER_USER.name.charAt(0)}
              </div>
              <div>
                <p className="text-lg font-bold text-slate-800">
                  {RETAILER_USER.name}
                </p>
                <p className="text-sm text-slate-500">
                  ID: {RETAILER_USER.retailerId}
                </p>
                <Badge
                  variant={
                    RETAILER_USER.kycStatus === "verified"
                      ? "success"
                      : "warning"
                  }
                  className="mt-1"
                >
                  KYC {RETAILER_USER.kycStatus}
                </Badge>
              </div>
            </div>

            <div className="space-y-3 rounded-xl bg-slate-50 p-4">
              <div className="flex items-center gap-3 text-sm">
                <Mail className="h-4 w-4 text-[#0057D9]" />
                {RETAILER_USER.email}
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Phone className="h-4 w-4 text-[#0057D9]" />
                {RETAILER_USER.mobile}
              </div>
              <div className="flex items-center gap-3 text-sm">
                <BadgeCheck className="h-4 w-4 text-[#0057D9]" />
                Wallet: {formatCurrency(balance)}
              </div>
            </div>

            <Button className="w-full">Complete KYC Verification</Button>
          </CardContent>
        </Card>

        <div className="flex items-center justify-center">
          <VirtualCard />
        </div>
      </div>

      <Card className="w-full">
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
          <CardDescription>Your latest wallet activity</CardDescription>
        </CardHeader>
        <CardContent>
          {transactions.length === 0 ? (
            <p className="py-6 text-center text-sm text-slate-500">
              No transactions yet
            </p>
          ) : (
            <div className="space-y-2">
              {transactions.slice(0, 10).map((txn) => (
                <div
                  key={txn.id}
                  className="flex items-center justify-between rounded-xl border border-slate-100 p-3"
                >
                  <div>
                    <p className="text-sm font-medium">{txn.description}</p>
                    <p className="text-xs text-slate-400">
                      {new Date(txn.createdAt).toLocaleString("en-IN")}
                    </p>
                  </div>
                  <div className="text-right">
                    <p
                      className={`text-sm font-bold ${
                        txn.type === "debit"
                          ? "text-red-600"
                          : "text-emerald-600"
                      }`}
                    >
                      {txn.type === "debit" ? "-" : "+"}
                      {formatCurrency(txn.amount)}
                    </p>
                    <p className="text-xs text-slate-400">
                      Bal: {formatCurrency(txn.balanceAfter)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

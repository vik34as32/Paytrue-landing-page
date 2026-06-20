"use client";

import Link from "next/link";
import { ArrowLeft, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useWalletStore } from "@/features/retailer/store/walletStore";
import { formatCurrency } from "@/lib/utils";

export default function StatementPage() {
  const transactions = useWalletStore((s) => s.transactions);

  return (
    <div className="w-full max-w-none space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild>
          <Link href="/rt/retailer">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-[#0A84FF] to-[#0057D9] text-white shadow-lg">
            <FileText className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[#001F5B]">Statement</h1>
            <p className="text-sm text-slate-500">
              Complete transaction history
            </p>
          </div>
        </div>
      </div>

      <Card className="w-full">
        <CardHeader>
          <CardTitle>Transaction Statement</CardTitle>
          <CardDescription>
            All debit and credit entries with balance
          </CardDescription>
        </CardHeader>
        <CardContent>
          {transactions.length === 0 ? (
            <p className="py-12 text-center text-slate-500">
              No transactions found
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-left text-xs uppercase tracking-wider text-slate-500">
                    <th className="pb-3 pr-4">Date</th>
                    <th className="pb-3 pr-4">Description</th>
                    <th className="pb-3 pr-4">Type</th>
                    <th className="pb-3 pr-4 text-right">Amount</th>
                    <th className="pb-3 text-right">Balance</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((txn) => (
                    <tr
                      key={txn.id}
                      className="border-b border-slate-100 hover:bg-slate-50"
                    >
                      <td className="py-3 pr-4 whitespace-nowrap text-slate-600">
                        {new Date(txn.createdAt).toLocaleDateString("en-IN")}
                      </td>
                      <td className="py-3 pr-4 font-medium text-slate-800">
                        {txn.description}
                      </td>
                      <td className="py-3 pr-4">
                        <Badge
                          variant={
                            txn.type === "debit" ? "destructive" : "success"
                          }
                        >
                          {txn.type}
                        </Badge>
                      </td>
                      <td
                        className={`py-3 pr-4 text-right font-semibold ${
                          txn.type === "debit"
                            ? "text-red-600"
                            : "text-emerald-600"
                        }`}
                      >
                        {txn.type === "debit" ? "-" : "+"}
                        {formatCurrency(txn.amount)}
                      </td>
                      <td className="py-3 text-right font-medium text-slate-700">
                        {formatCurrency(txn.balanceAfter)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

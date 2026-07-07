"use client";

import { useState } from "react";
import Link from "next/link";
import { useSelector } from "react-redux";
import {
  Bell,
  User,
  Wallet,
  CreditCard,
  LogOut,
  ChevronDown,
  KeyRound,
  Loader2,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import ChangePasswordDialog from "@/src/components/common/ChangePasswordDialog";
import { selectUser } from "@/src/redux/slices/authSlice";
import { selectProfileLoading } from "@/src/redux/slices/profileSlice";
import { getUserDisplayName } from "@/src/lib/userUtils";
import { useLogout } from "@/src/hooks/useLogout";
import VirtualCard from "./VirtualCard";

export default function ProfileDropdown() {
  const [showVirtualCard, setShowVirtualCard] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const user = useSelector(selectUser);
  const profileLoading = useSelector(selectProfileLoading);
  const logout = useLogout();

  const displayName = getUserDisplayName(user, "Retailer");
  const userId = user?.userId || user?.retailerId || user?.id || "—";
  const email = user?.email || "—";
  const initial = displayName.charAt(0).toUpperCase();

  return (
    <>
      <button className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200/80 bg-white text-slate-500 shadow-sm transition hover:border-[#1565d8]/30 hover:text-[#1565d8] hover:shadow-md">
        <Bell className="h-[18px] w-[18px]" />
        <span className="absolute right-2 top-2 h-2 w-2 rounded-full border-2 border-white bg-red-500" />
      </button>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="flex items-center gap-2 rounded-xl border border-slate-200/80 bg-white py-1.5 pl-1.5 pr-2.5 shadow-sm transition hover:border-[#1565d8]/25 hover:shadow-md">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-[#f57c00] to-[#ff9800] text-xs font-bold text-white shadow-sm">
              {profileLoading && !user?.name ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                initial
              )}
            </div>
            <div className="hidden text-left md:block">
              <p className="text-[13px] font-bold leading-tight text-[#0b1f3a]">
                {profileLoading && !user?.name ? "Loading..." : displayName}
              </p>
              <p className="text-[10px] font-medium text-slate-400">{userId}</p>
            </div>
            <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
          </button>
        </DropdownMenuTrigger>

        <DropdownMenuContent
          align="end"
          className="w-60 rounded-xl border-slate-100 p-1.5 shadow-xl"
        >
          <DropdownMenuLabel className="px-3 py-2.5">
            <p className="text-sm font-bold text-[#0b1f3a]">{displayName}</p>
            <p className="text-[11px] font-normal text-slate-400">{email}</p>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />

          <DropdownMenuItem asChild>
            <Link href="/rt/retailer/profile" className="cursor-pointer rounded-lg">
              <User className="h-4 w-4 text-[#1565d8]" />
              My Profile
            </Link>
          </DropdownMenuItem>

          <DropdownMenuItem asChild>
            <Link
              href="/rt/retailer/wallet-history"
              className="cursor-pointer rounded-lg"
            >
              <Wallet className="h-4 w-4 text-emerald-600" />
              Wallet History
            </Link>
          </DropdownMenuItem>

          <DropdownMenuItem
            onClick={() => setShowVirtualCard(true)}
            className="rounded-lg"
          >
            <CreditCard className="h-4 w-4 text-violet-600" />
            Virtual Card
          </DropdownMenuItem>

          <DropdownMenuItem
            onClick={() => setShowChangePassword(true)}
            className="rounded-lg"
          >
            <KeyRound className="h-4 w-4 text-amber-600" />
            Change Password
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          <DropdownMenuItem
            onClick={() => void logout()}
            className="cursor-pointer rounded-lg text-red-600 focus:text-red-600"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={showVirtualCard} onOpenChange={setShowVirtualCard}>
        <DialogContent className="max-w-md border-0 bg-transparent p-0 shadow-none">
          <DialogHeader className="sr-only">
            <DialogTitle>Virtual Card</DialogTitle>
          </DialogHeader>
          <VirtualCard />
        </DialogContent>
      </Dialog>

      <ChangePasswordDialog
        open={showChangePassword}
        onOpenChange={setShowChangePassword}
      />
    </>
  );
}

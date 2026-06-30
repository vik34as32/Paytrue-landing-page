"use client";



import Link from "next/link";

import {

  Mail,

  Menu,

  Phone,

  ChevronDown,

  User,

  Settings,

  LogOut,

  Bell,

  Moon,

  Sun,

} from "lucide-react";

import {

  DropdownMenu,

  DropdownMenuContent,

  DropdownMenuItem,

  DropdownMenuLabel,

  DropdownMenuSeparator,

  DropdownMenuTrigger,

} from "@/components/ui/dropdown-menu";

import { SUPPORT_EMAIL, SUPPORT_MOBILE } from "@/src/constants/portalConfig";

import { useDarkMode } from "@/src/hooks/useDarkMode";

import { toast } from "sonner";



export default function PortalHeader({

  onMenuClick,

  user,

  profilePath,

  settingsPath,

  portalTitle,

  onLogout,

}) {

  const { dark, toggle } = useDarkMode();



  const copyUserId = async () => {

    if (!user?.userId) return;

    try {

      await navigator.clipboard.writeText(String(user.userId));

      toast.success("User ID copied");

    } catch {

      toast.error("Failed to copy User ID");

    }

  };



  return (

    <header className="sticky top-0 z-50 shrink-0 border-b border-slate-200/70 bg-white/95 backdrop-blur-xl dark:border-slate-800 dark:bg-slate-950/95">

      <div className="flex items-center justify-between gap-3 px-4 py-3 sm:px-5 lg:px-6">

        <div className="flex items-center gap-2.5 sm:gap-3">

          <button

            onClick={onMenuClick}

            className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200/80 bg-white text-slate-600 shadow-sm transition hover:border-[#1565d8]/30 hover:text-[#1565d8] md:hidden dark:border-slate-700 dark:bg-slate-900"

            aria-label="Open menu"

          >

            <Menu className="h-5 w-5" />

          </button>



          <div className="min-w-0 md:hidden">

            <p className="truncate text-[13px] font-bold text-[#0b1f3a] dark:text-white">

              {portalTitle}

            </p>

          </div>



          <div className="hidden items-center gap-1 rounded-xl border border-slate-100 bg-slate-50/80 px-1 py-1 md:flex dark:border-slate-800 dark:bg-slate-900/80">

            <a

              href={`mailto:${SUPPORT_EMAIL}`}

              className="flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:bg-white hover:text-[#1565d8] hover:shadow-sm dark:text-slate-300"

            >

              <Mail className="h-3.5 w-3.5 shrink-0 text-[#1565d8]" />

              <span className="hidden lg:inline">{SUPPORT_EMAIL}</span>

              <span className="lg:hidden">Email</span>

            </a>

            <span className="h-4 w-px bg-slate-200 dark:bg-slate-700" />

            <a

              href={`tel:${SUPPORT_MOBILE.replace(/\s/g, "")}`}

              className="flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:bg-white hover:text-[#1565d8] hover:shadow-sm dark:text-slate-300"

            >

              <Phone className="h-3.5 w-3.5 shrink-0 text-[#1565d8]" />

              {SUPPORT_MOBILE}

            </a>

          </div>

        </div>



        <div className="flex items-center gap-2">

          <button

            type="button"

            onClick={toggle}

            className="hidden h-10 w-10 items-center justify-center rounded-xl border border-slate-200/80 bg-white text-slate-600 shadow-sm transition hover:border-[#1565d8]/30 sm:flex dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"

            aria-label="Toggle dark mode"

          >

            {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}

          </button>



          <button

            type="button"

            className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200/80 bg-white text-slate-600 shadow-sm transition hover:border-[#1565d8]/30 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"

            aria-label="Notifications"

          >

            <Bell className="h-4 w-4" />

            <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-red-500" />

          </button>



          <DropdownMenu>

            <DropdownMenuTrigger asChild>

              <button className="flex items-center gap-2 rounded-xl border border-slate-200/80 bg-white py-1.5 pl-1.5 pr-2.5 shadow-sm transition hover:border-[#1565d8]/25 hover:shadow-md dark:border-slate-700 dark:bg-slate-900">

                {user?.profileImage ? (

                  // eslint-disable-next-line @next/next/no-img-element

                  <img

                    src={user.profileImage}

                    alt={user.name}

                    className="h-8 w-8 rounded-lg object-cover"

                  />

                ) : (

                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-[#f57c00] to-[#ff9800] text-xs font-bold text-white shadow-sm">

                    {user?.name?.charAt(0) || "U"}

                  </div>

                )}

                <div className="hidden text-left md:block">

                  <p className="text-[13px] font-bold leading-tight text-[#0b1f3a] dark:text-white">

                    {user?.name}

                  </p>

                  <p className="text-[10px] font-medium text-slate-400">{user?.userId}</p>

                </div>

                <ChevronDown className="h-3.5 w-3.5 text-slate-400" />

              </button>

            </DropdownMenuTrigger>

            <DropdownMenuContent

              align="end"

              className="w-60 rounded-xl border-slate-100 p-1.5 shadow-xl dark:border-slate-800 dark:bg-slate-900"

            >

              <DropdownMenuLabel className="px-3 py-2.5">

                <p className="text-sm font-bold text-[#0b1f3a] dark:text-white">{user?.name}</p>

                <p className="text-[11px] font-normal text-slate-400">{user?.email}</p>

              </DropdownMenuLabel>

              <DropdownMenuSeparator />

              <DropdownMenuItem onClick={copyUserId} className="cursor-pointer rounded-lg">

                Copy User ID

              </DropdownMenuItem>

              <DropdownMenuItem asChild>

                <Link href={profilePath} className="cursor-pointer rounded-lg">

                  <User className="h-4 w-4 text-[#1565d8]" />

                  My Profile

                </Link>

              </DropdownMenuItem>

              <DropdownMenuItem asChild>

                <Link href={settingsPath} className="cursor-pointer rounded-lg">

                  <Settings className="h-4 w-4 text-slate-500" />

                  Settings

                </Link>

              </DropdownMenuItem>

              <DropdownMenuSeparator />

              <DropdownMenuItem

                onClick={onLogout}

                className="cursor-pointer rounded-lg text-red-600 focus:text-red-600"

              >

                <LogOut className="h-4 w-4" />

                Logout

              </DropdownMenuItem>

            </DropdownMenuContent>

          </DropdownMenu>

        </div>

      </div>

    </header>

  );

}


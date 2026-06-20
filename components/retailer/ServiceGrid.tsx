"use client";

import { useState } from "react";
import { Search, LayoutGrid } from "lucide-react";
import ServiceCard from "./ServiceCard";
import { POPULAR_SERVICES } from "@/features/retailer/constants";
import {
  SERVICE_CATEGORIES,
  filterServicesByCategory,
} from "@/features/retailer/dashboard";
import { cn } from "@/lib/utils";

export default function ServiceGrid() {
  const [activeCategory, setActiveCategory] = useState("all");
  const [search, setSearch] = useState("");

  const filtered = filterServicesByCategory(
    POPULAR_SERVICES,
    activeCategory
  ).filter((s) =>
    s.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div
      className="w-full overflow-hidden rounded-2xl border border-slate-100 bg-white"
      style={{ boxShadow: "var(--rt-card-shadow)" }}
    >
      <div className="border-b border-slate-100 px-4 py-4 sm:px-5 sm:py-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#1565d8]/10">
              <LayoutGrid className="h-5 w-5 text-[#1565d8]" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#0b1f3a] sm:text-[16px]">
                All Services
              </h2>
              <p className="text-[12px] text-slate-500">
                {filtered.length} services · Instant settlement
              </p>
            </div>
          </div>

          <div className="relative w-full sm:w-auto">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search services..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50/80 pl-9 pr-4 text-sm outline-none transition focus:border-[#1565d8]/40 focus:bg-white focus:ring-2 focus:ring-[#1565d8]/10 sm:w-56"
            />
          </div>
        </div>

        <div className="rt-service-grid mt-4 flex gap-2 overflow-x-auto pb-0.5">
          {SERVICE_CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={cn(
                "shrink-0 rounded-lg px-3.5 py-2 text-[12px] font-semibold transition-all duration-200",
                activeCategory === cat.id
                  ? "bg-[#1565d8] text-white shadow-md shadow-blue-200"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              )}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      <div className="p-4 sm:p-5">
        {filtered.length === 0 ? (
          <p className="py-12 text-center text-sm text-slate-400">
            No services found for &quot;{search}&quot;
          </p>
        ) : (
          <div className="grid grid-cols-3 gap-2.5 sm:grid-cols-4 sm:gap-3 md:grid-cols-5 md:gap-3 lg:grid-cols-7 lg:gap-3">
            {filtered.map((service) => (
              <ServiceCard key={service.id} service={service} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

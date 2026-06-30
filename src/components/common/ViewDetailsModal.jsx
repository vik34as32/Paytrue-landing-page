"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export default function ViewDetailsModal({
  open,
  onOpenChange,
  title = "Details",
  fields = [],
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-[#0b1f3a]">{title}</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          {fields.map((field) => (
            <div
              key={field.label}
              className="flex flex-col gap-1 rounded-xl border border-slate-100 bg-slate-50/80 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
            >
              <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                {field.label}
              </span>
              <span className="text-sm font-semibold text-[#0b1f3a]">
                {field.value ?? "-"}
              </span>
            </div>
          ))}
        </div>
        <Button onClick={() => onOpenChange(false)} className="w-full">
          Close
        </Button>
      </DialogContent>
    </Dialog>
  );
}

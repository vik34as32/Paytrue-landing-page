"use client";

import { CheckCircle2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export default function SuccessModal({
  open,
  onOpenChange,
  title = "Success!",
  message,
  buttonLabel = "Done",
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md text-center">
        <DialogHeader>
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
            <CheckCircle2 className="h-8 w-8 text-emerald-600" />
          </div>
          <DialogTitle className="text-[#0b1f3a]">{title}</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-slate-500">{message}</p>
        <Button onClick={() => onOpenChange(false)} className="w-full">
          {buttonLabel}
        </Button>
      </DialogContent>
    </Dialog>
  );
}

"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { ImagePlus, Loader2, MessageCircle, Ticket, Trash2, Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogDescription,
  DialogPortal,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import {
  TICKET_CATEGORIES,
  TICKET_CATEGORY_TEMPLATES,
  TICKET_PRIORITIES,
  type TicketCategory,
} from "@/features/retailer/constants";
import type {
  NewTicketFormValues,
  TicketAttachment,
} from "@/components/retailer/support/ticketTypes";

const MAX_IMAGES = 3;
const MAX_SIZE_MB = 5;
const ACCEPT = "image/jpeg,image/jpg,image/png,image/webp,.jpg,.jpeg,.png,.webp";

function getCategoryTemplate(category: string) {
  const key = category as TicketCategory;
  return (
    TICKET_CATEGORY_TEMPLATES[key] ??
    TICKET_CATEGORY_TEMPLATES["Other Issue"]
  );
}

interface NewTicketModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  submitting?: boolean;
  onSubmit: (values: NewTicketFormValues) => void;
  retailerName?: string;
  retailerMobile?: string;
  retailerId?: string;
}

function formatFileSize(bytes: number) {
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsDataURL(file);
  });
}

function validateImage(file: File): string | null {
  const ext = file.name.slice(file.name.lastIndexOf(".")).toLowerCase();
  const allowed = [".jpg", ".jpeg", ".png", ".webp"];
  const allowedTypes = ["image/jpeg", "image/png", "image/webp"];

  if (!allowed.includes(ext) && !allowedTypes.includes(file.type)) {
    return "Only JPG, PNG and WEBP images are allowed";
  }
  if (file.size > MAX_SIZE_MB * 1024 * 1024) {
    return `Maximum file size is ${MAX_SIZE_MB} MB per image`;
  }
  return null;
}

const fieldClassName =
  "w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-900 shadow-sm outline-none placeholder:text-slate-400 focus:ring-2 focus:ring-[#1565d8]";

const inputClassName = cn(fieldClassName, "h-11");

const selectClassName = cn(
  inputClassName,
  "appearance-none bg-[url('data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 width=%2716%27 height=%2716%27 viewBox=%270 0 24 24%27 fill=%27none%27 stroke=%27%2364748b%27 stroke-width=%272%27 stroke-linecap=%27round%27 stroke-linejoin=%27round%27%3E%3Cpolyline points=%276 9 12 15 18 9%27/%3E%3C/svg%3E')] bg-[length:16px] bg-[right_12px_center] bg-no-repeat pr-10"
);

export default function NewTicketModal({
  open,
  onOpenChange,
  submitting = false,
  onSubmit,
  retailerName,
  retailerMobile,
  retailerId,
}: NewTicketModalProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const initial = getCategoryTemplate(TICKET_CATEGORIES[0]);
  const [subject, setSubject] = useState(initial.subject);
  const [category, setCategory] = useState<string>(TICKET_CATEGORIES[0]);
  const [priority, setPriority] = useState<string>("Medium");
  const [description, setDescription] = useState(initial.description);
  const [attachments, setAttachments] = useState<TicketAttachment[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const [uploadError, setUploadError] = useState("");

  const applyCategoryTemplate = useCallback((nextCategory: string) => {
    const template = getCategoryTemplate(nextCategory);
    setCategory(nextCategory);
    setSubject(template.subject);
    setDescription(template.description);
  }, []);

  const resetForm = useCallback(() => {
    const template = getCategoryTemplate(TICKET_CATEGORIES[0]);
    setCategory(TICKET_CATEGORIES[0]);
    setSubject(template.subject);
    setPriority("Medium");
    setDescription(template.description);
    setAttachments([]);
    setUploadError("");
  }, []);

  useEffect(() => {
    if (!open) resetForm();
  }, [open, resetForm]);

  const addImages = async (files: FileList | File[]) => {
    const list = Array.from(files);
    if (list.length === 0) return;

    const remaining = MAX_IMAGES - attachments.length;
    if (remaining <= 0) {
      setUploadError(`Maximum ${MAX_IMAGES} images allowed`);
      return;
    }

    const toAdd = list.slice(0, remaining);
    const next: TicketAttachment[] = [];

    for (const file of toAdd) {
      const error = validateImage(file);
      if (error) {
        setUploadError(error);
        return;
      }
      const dataUrl = await readFileAsDataUrl(file);
      next.push({
        id: `${Date.now()}-${file.name}`,
        name: file.name,
        type: file.type,
        size: file.size,
        dataUrl,
      });
    }

    setUploadError("");
    setAttachments((prev) => [...prev, ...next]);
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    onSubmit({
      subject: subject.trim(),
      category,
      priority,
      description: description.trim(),
      attachments,
    });
  };

  const handleClose = () => {
    if (submitting) return;
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={(next) => !submitting && onOpenChange(next)}>
      <DialogPortal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <DialogPrimitive.Content
          className={cn(
            "fixed left-1/2 top-1/2 z-[101] flex max-h-[min(92vh,820px)] w-[calc(100%-1.5rem)] max-w-[640px] -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl",
            "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95"
          )}
        >
          <header className="relative shrink-0 border-b border-slate-100 px-6 py-4 pr-14">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-md">
                <Ticket className="h-5 w-5" />
              </div>
              <div>
                <DialogTitle className="text-base font-bold text-[#001F5B]">
                  Create Support Query
                </DialogTitle>
                <DialogDescription className="mt-0.5 text-xs text-slate-500">
                  Opens WhatsApp chat with support (+91 98995 99956) — your details are included.
                </DialogDescription>
              </div>
            </div>
            <DialogPrimitive.Close
              onClick={handleClose}
              disabled={submitting}
              className="absolute right-4 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:opacity-50"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </DialogPrimitive.Close>
          </header>

          <form
            id="new-ticket-form"
            onSubmit={handleSubmit}
            className="flex min-h-0 flex-1 flex-col overflow-hidden"
          >
            <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-6 py-5">
              {(retailerName || retailerMobile || retailerId) && (
                <div className="rounded-xl border border-emerald-100 bg-emerald-50/70 px-4 py-3 text-xs text-slate-600">
                  <p className="font-semibold text-emerald-800">
                    Will be sent with your details
                  </p>
                  <p className="mt-1">
                    {[
                      retailerName && `Name: ${retailerName}`,
                      retailerMobile && `Mobile: ${retailerMobile}`,
                      retailerId && `ID: ${retailerId}`,
                    ]
                      .filter(Boolean)
                      .join(" · ")}
                  </p>
                </div>
              )}

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="ticket-category">Category</Label>
                  <select
                    id="ticket-category"
                    value={category}
                    onChange={(e) => applyCategoryTemplate(e.target.value)}
                    className={selectClassName}
                  >
                    {TICKET_CATEGORIES.map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ticket-priority">Priority</Label>
                  <select
                    id="ticket-priority"
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                    className={selectClassName}
                  >
                    {TICKET_PRIORITIES.map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="ticket-subject">Subject</Label>
                <Input
                  id="ticket-subject"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Auto-filled from category — you can edit"
                  maxLength={140}
                  className={inputClassName}
                  required
                />
                <p className="text-[11px] text-slate-400">
                  Auto-filled from category. You can edit if needed.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="ticket-description">Description</Label>
                <Textarea
                  id="ticket-description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Fill the blank fields with your transaction details..."
                  rows={10}
                  className={cn(fieldClassName, "min-h-[180px] resize-y py-3 font-normal leading-relaxed")}
                  required
                />
                <p className="text-[11px] text-slate-400">
                  Template is in English. Fill the blank lines with your details, then send.
                </p>
              </div>

              <div className="space-y-2">
                <Label>Attach Images</Label>
                <p className="text-xs text-slate-500">
                  Optional screenshots (saved in your query history). After WhatsApp opens, you can also share images in the chat. Max {MAX_IMAGES} images, {MAX_SIZE_MB} MB each.
                </p>

                {attachments.length < MAX_IMAGES && (
                  <div
                    onDragOver={(e) => {
                      e.preventDefault();
                      setDragOver(true);
                    }}
                    onDragLeave={() => setDragOver(false)}
                    onDrop={(e) => {
                      e.preventDefault();
                      setDragOver(false);
                      void addImages(e.dataTransfer.files);
                    }}
                    onClick={() => inputRef.current?.click()}
                    className={cn(
                      "flex cursor-pointer items-center gap-3 rounded-xl border border-dashed px-4 py-4 transition-colors",
                      dragOver
                        ? "border-[#1565d8] bg-blue-50/80"
                        : "border-slate-200 bg-slate-50/80 hover:border-[#1565d8]/50 hover:bg-blue-50/40"
                    )}
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white shadow-sm ring-1 ring-slate-100">
                      <Upload className="h-4 w-4 text-[#1565d8]" />
                    </div>
                    <div className="min-w-0 flex-1 text-left">
                      <p className="text-sm font-semibold text-slate-800">
                        Drop images or{" "}
                        <span className="text-[#1565d8]">browse</span>
                      </p>
                      <p className="mt-0.5 text-xs text-slate-400">
                        {attachments.length}/{MAX_IMAGES} uploaded
                      </p>
                    </div>
                    <ImagePlus className="h-5 w-5 shrink-0 text-slate-400" />
                    <input
                      ref={inputRef}
                      type="file"
                      accept={ACCEPT}
                      multiple
                      className="hidden"
                      onChange={(e) => {
                        if (e.target.files) void addImages(e.target.files);
                        e.target.value = "";
                      }}
                    />
                  </div>
                )}

                {uploadError && (
                  <p className="text-xs text-red-500">{uploadError}</p>
                )}

                {attachments.length > 0 && (
                  <div className="grid gap-2 sm:grid-cols-2">
                    {attachments.map((file) => (
                      <div
                        key={file.id}
                        className="flex items-center gap-2.5 rounded-xl border border-slate-200 bg-white p-2.5"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={file.dataUrl}
                          alt={file.name}
                          className="h-12 w-12 shrink-0 rounded-lg border border-slate-100 object-cover"
                        />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-xs font-semibold text-slate-800">
                            {file.name}
                          </p>
                          <p className="text-[10px] text-slate-500">
                            {formatFileSize(file.size)}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() =>
                            setAttachments((prev) =>
                              prev.filter((item) => item.id !== file.id)
                            )
                          }
                          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-red-500 transition hover:bg-red-50"
                          aria-label={`Remove ${file.name}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <footer className="flex shrink-0 items-center justify-end gap-2 border-t border-slate-100 bg-slate-50/60 px-6 py-4">
              <Button
                type="button"
                variant="outline"
                disabled={submitting}
                onClick={handleClose}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={submitting}
                className="bg-[#25D366] text-white hover:bg-[#1ebe57]"
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Opening WhatsApp...
                  </>
                ) : (
                  <>
                    <MessageCircle className="h-4 w-4" />
                    Send on WhatsApp
                  </>
                )}
              </Button>
            </footer>
          </form>
        </DialogPrimitive.Content>
      </DialogPortal>
    </Dialog>
  );
}

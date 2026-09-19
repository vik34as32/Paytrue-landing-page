"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { ImageIcon, MessageCircle, Plus, Ticket } from "lucide-react";
import { useSelector } from "react-redux";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import RetailerPageHeader from "@/components/retailer/RetailerPageHeader";
import NewTicketModal from "@/components/retailer/support/NewTicketModal";
import type {
  NewTicketFormValues,
  SupportTicket,
} from "@/components/retailer/support/ticketTypes";
import { RETAILER_USER } from "@/features/retailer/constants";
import { openSupportWhatsApp } from "@/src/lib/supportWhatsApp";
import { getUserDisplayName } from "@/src/lib/userUtils";
import { selectUser } from "@/src/redux/slices/authSlice";

const STORAGE_KEY = "paytrue_retailer_tickets";

function generateTicketId() {
  const seq = Math.floor(Math.random() * 90000) + 10000;
  return `TKT-${Date.now().toString().slice(-6)}-${seq}`;
}

function statusVariant(status: SupportTicket["status"]) {
  if (status === "Resolved") return "default";
  if (status === "In Progress") return "secondary";
  return "outline";
}

export default function RaiseTicketView() {
  const user = useSelector(selectUser) as Record<string, unknown> | null;
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [previewTicket, setPreviewTicket] = useState<SupportTicket | null>(null);

  const retailerName = getUserDisplayName(user, RETAILER_USER.name);
  const retailerMobile = String(
    user?.mobile || user?.phoneNumber || user?.phone || RETAILER_USER.mobile
  );
  const retailerId = String(
    user?.userId ||
      user?.retailerId ||
      user?.retailerCode ||
      user?.userCode ||
      RETAILER_USER.retailerId
  );
  const retailerEmail = String(user?.email || RETAILER_USER.email || "");

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as SupportTicket[];
        setTickets(
          parsed.map((ticket) => ({
            ...ticket,
            attachments: ticket.attachments ?? [],
          }))
        );
      }
    } catch {
      setTickets([]);
    }
  }, []);

  const persistTickets = useCallback((next: SupportTicket[]) => {
    setTickets(next);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      toast.error("Could not save ticket. Try fewer or smaller images.");
    }
  }, []);

  const handleSubmit = (values: NewTicketFormValues) => {
    if (!values.subject || !values.description) {
      toast.error("Subject and description are required.");
      return;
    }

    setSubmitting(true);
    const ticket: SupportTicket = {
      id: generateTicketId(),
      subject: values.subject,
      category: values.category,
      priority: values.priority,
      description: values.description,
      attachments: values.attachments,
      status: "Open",
      createdAt: new Date().toISOString(),
    };

    try {
      persistTickets([ticket, ...tickets]);
      openSupportWhatsApp({
        subject: values.subject,
        category: values.category,
        priority: values.priority,
        description: values.description,
        retailerName,
        retailerMobile,
        retailerId,
        retailerEmail: retailerEmail || undefined,
        attachmentCount: values.attachments.length,
      });
      toast.success("Opening WhatsApp with your query…");
      setModalOpen(false);
    } catch {
      toast.error("Failed to open WhatsApp. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const openCount = useMemo(
    () => tickets.filter((t) => t.status !== "Resolved").length,
    [tickets]
  );

  const whatsappDisplay = "+91 98995 99956";

  return (
    <div className="min-w-0 space-y-6">
      <RetailerPageHeader
        title="Raise Ticket"
        description="Send your query on WhatsApp — your name, mobile and retailer ID are included automatically."
        icon={Ticket}
        iconClassName="from-amber-500 to-orange-600"
        actions={
          <Button onClick={() => setModalOpen(true)}>
            <MessageCircle className="h-4 w-4" />
            New Query
          </Button>
        }
      />

      <div className="rounded-2xl border border-emerald-200 bg-gradient-to-r from-emerald-50 via-white to-blue-50 px-5 py-4 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#25D366] text-white shadow-sm">
              <MessageCircle className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-bold text-[#0b1f3a]">
                Queries go to WhatsApp support
              </p>
              <p className="mt-0.5 text-xs text-slate-600">
                Support number:{" "}
                <span className="font-semibold text-emerald-700">
                  {whatsappDisplay}
                </span>
                {" · "}
                Logged in as{" "}
                <span className="font-semibold text-[#0b1f3a]">
                  {retailerName}
                </span>{" "}
                ({retailerMobile})
              </p>
            </div>
          </div>
          <Button onClick={() => setModalOpen(true)} className="shrink-0">
            <Plus className="h-4 w-4" />
            Create Query
          </Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { label: "Total Queries", value: tickets.length },
          { label: "Open Queries", value: openCount },
          { label: "Avg. Response", value: "2 hrs" },
        ].map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="rounded-2xl border border-slate-200/80 bg-white px-5 py-4 shadow-sm"
          >
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              {stat.label}
            </p>
            <p className="mt-1 text-2xl font-bold text-[#001F5B]">{stat.value}</p>
          </motion.div>
        ))}
      </div>

      <NewTicketModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        submitting={submitting}
        onSubmit={handleSubmit}
        retailerName={retailerName}
        retailerMobile={retailerMobile}
        retailerId={retailerId}
      />

      <Card>
        <CardHeader>
          <CardTitle>Your Queries</CardTitle>
          <CardDescription>
            Local history of queries you sent to WhatsApp support
          </CardDescription>
        </CardHeader>
        <CardContent>
          {tickets.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/80 px-6 py-10 text-center">
              <MessageCircle className="mx-auto h-10 w-10 text-slate-300" />
              <p className="mt-3 text-sm font-semibold text-[#0b1f3a]">
                No queries yet
              </p>
              <p className="mt-1 text-sm text-slate-500">
                Click &quot;New Query&quot; to message support on WhatsApp.
              </p>
              <Button className="mt-4" onClick={() => setModalOpen(true)}>
                <Plus className="h-4 w-4" />
                New Query
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {tickets.map((ticket, index) => (
                <motion.div
                  key={ticket.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.03 }}
                  className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-[#0b1f3a]">
                        {ticket.subject}
                      </p>
                      <p className="mt-0.5 font-mono text-xs text-slate-400">
                        {ticket.id}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant={statusVariant(ticket.status)}>
                        {ticket.status}
                      </Badge>
                      <Badge variant="outline">{ticket.priority}</Badge>
                    </div>
                  </div>
                  <p className="mt-2 text-sm text-slate-600 line-clamp-2">
                    {ticket.description}
                  </p>

                  {ticket.attachments.length > 0 && (
                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      <div className="flex -space-x-2">
                        {ticket.attachments.slice(0, 3).map((file) => (
                          <button
                            key={file.id}
                            type="button"
                            onClick={() => setPreviewTicket(ticket)}
                            className="relative h-9 w-9 overflow-hidden rounded-lg border-2 border-white shadow-sm ring-1 ring-slate-100"
                          >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={file.dataUrl}
                              alt={file.name}
                              className="h-full w-full object-cover"
                            />
                          </button>
                        ))}
                      </div>
                      <button
                        type="button"
                        onClick={() => setPreviewTicket(ticket)}
                        className="flex items-center gap-1 text-xs font-medium text-[#1565d8] hover:underline"
                      >
                        <ImageIcon className="h-3.5 w-3.5" />
                        {ticket.attachments.length} image
                        {ticket.attachments.length > 1 ? "s" : ""}
                      </button>
                    </div>
                  )}

                  <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-slate-400">
                    <span>{ticket.category}</span>
                    <span>•</span>
                    <span>
                      {new Date(ticket.createdAt).toLocaleString("en-IN", {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog
        open={Boolean(previewTicket)}
        onOpenChange={(open) => !open && setPreviewTicket(null)}
      >
        <DialogContent className="max-w-lg border-slate-200 bg-white">
          <DialogHeader>
            <DialogTitle className="text-[#001F5B]">
              Query Attachments
            </DialogTitle>
          </DialogHeader>
          {previewTicket && (
            <div className="grid gap-3 sm:grid-cols-2">
              {previewTicket.attachments.map((file) => (
                <a
                  key={file.id}
                  href={file.dataUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group overflow-hidden rounded-xl border border-slate-200"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={file.dataUrl}
                    alt={file.name}
                    className="aspect-video w-full object-cover transition group-hover:scale-105"
                  />
                  <p className="truncate px-2 py-1.5 text-xs text-slate-600">
                    {file.name}
                  </p>
                </a>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

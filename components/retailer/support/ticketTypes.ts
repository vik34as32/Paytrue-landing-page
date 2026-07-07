export type TicketAttachment = {
  id: string;
  name: string;
  type: string;
  size: number;
  dataUrl: string;
};

export type SupportTicket = {
  id: string;
  subject: string;
  category: string;
  priority: string;
  description: string;
  attachments: TicketAttachment[];
  status: "Open" | "In Progress" | "Resolved";
  createdAt: string;
};

export type NewTicketFormValues = {
  subject: string;
  category: string;
  priority: string;
  description: string;
  attachments: TicketAttachment[];
};

/** Support WhatsApp — always send retailer queries here (digits only with country code). */
export const SUPPORT_WHATSAPP_PHONE = "919899599956";

export type SupportWhatsAppPayload = {
  subject: string;
  category: string;
  priority: string;
  description: string;
  retailerName: string;
  retailerMobile: string;
  retailerId: string;
  retailerEmail?: string;
  attachmentCount?: number;
};

export function buildSupportWhatsAppMessage(
  payload: SupportWhatsAppPayload
): string {
  const lines = [
    "*PayTrue Support Query*",
    "",
    "*Retailer Details*",
    `Name: ${payload.retailerName || "-"}`,
    `Mobile: ${payload.retailerMobile || "-"}`,
    `Retailer ID: ${payload.retailerId || "-"}`,
  ];

  if (payload.retailerEmail) {
    lines.push(`Email: ${payload.retailerEmail}`);
  }

  lines.push(
    "",
    "*Query Details*",
    `Subject: ${payload.subject}`,
    `Category: ${payload.category}`,
    `Priority: ${payload.priority}`,
    "",
    "*Description*",
    payload.description
  );

  if (payload.attachmentCount && payload.attachmentCount > 0) {
    lines.push(
      "",
      `_Note: Retailer selected ${payload.attachmentCount} image(s) — please ask them to share screenshots in this chat._`
    );
  }

  return lines.join("\n");
}

/** Opens WhatsApp chat with support number 98995 99956 only — never retailer/customer mobile. */
export function openSupportWhatsApp(payload: SupportWhatsAppPayload): void {
  const phone = SUPPORT_WHATSAPP_PHONE;
  const text = encodeURIComponent(buildSupportWhatsAppMessage(payload));
  const url = `https://api.whatsapp.com/send?phone=${phone}&text=${text}`;

  const opened = window.open(url, "_blank", "noopener,noreferrer");
  if (!opened) {
    window.location.href = url;
  }
}

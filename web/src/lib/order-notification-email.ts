type OrderNotificationDetails = {
  id: string;
  created_at: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string | null;
  product_option: string;
  quantity: number;
  amount_cents: number;
  status: string;
  notes: string | null;
  design_path: string;
  paid_at: string | null;
  fileLink?: string | null;
};

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function formatUsd(amountCents: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amountCents / 100);
}

function formatOrderNumber(order: OrderNotificationDetails): string {
  return order.id.slice(0, 8);
}

function formatDateTime(value: string | null): string {
  if (!value) {
    return "Not recorded";
  }

  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "America/Chicago",
  }).format(new Date(value));
}

function detailRow(label: string, value: string): string {
  return `<tr><td style="padding:6px 10px;color:#365142;font-weight:700;vertical-align:top;">${escapeHtml(
    label,
  )}</td><td style="padding:6px 10px;color:#2f2a2a;">${value}</td></tr>`;
}

export function buildOrderNotificationEmail(order: OrderNotificationDetails) {
  const orderNumber = formatOrderNumber(order);
  const safeCustomerName = escapeHtml(order.customer_name);
  const safeDesignPath = escapeHtml(order.design_path);
  const fileLink = order.fileLink?.trim() ? order.fileLink.trim() : null;
  const notes = order.notes?.trim() ? order.notes.trim() : "No notes provided.";
  const downloadHtml = fileLink
    ? `<a href="${escapeHtml(fileLink)}" style="color:#9f3f58;font-weight:700;">Download Upload</a>`
    : "No upload link available.";

  const html = `
    <div style="font-family:Arial,sans-serif;line-height:1.5;color:#2f2a2a;">
      <h1 style="margin:0 0 12px;color:#365142;font-size:24px;">New paid order #${escapeHtml(
        orderNumber,
      )}</h1>
      <p style="margin:0 0 18px;">A customer payment just completed in Stripe.</p>
      <table style="border-collapse:collapse;width:100%;max-width:680px;background:#fffaf7;border:1px solid #ead6d6;">
        <tbody>
          ${detailRow("Customer", safeCustomerName)}
          ${detailRow("Email", escapeHtml(order.customer_email))}
          ${detailRow("Phone", escapeHtml(order.customer_phone ?? "N/A"))}
          ${detailRow("Option", escapeHtml(order.product_option))}
          ${detailRow("Qty", escapeHtml(String(order.quantity)))}
          ${detailRow("Total", escapeHtml(formatUsd(order.amount_cents)))}
          ${detailRow("Status", escapeHtml(order.status))}
          ${detailRow("Placed", escapeHtml(formatDateTime(order.created_at)))}
          ${detailRow("Paid", escapeHtml(formatDateTime(order.paid_at)))}
          ${detailRow("File", safeDesignPath)}
          ${detailRow("Download", downloadHtml)}
        </tbody>
      </table>
      <h2 style="margin:20px 0 8px;color:#365142;font-size:18px;">Notes</h2>
      <p style="white-space:pre-wrap;margin:0;">${escapeHtml(notes)}</p>
    </div>
  `;

  const text = [
    `New paid order #${orderNumber}`,
    `Customer: ${order.customer_name}`,
    `Email: ${order.customer_email}`,
    `Phone: ${order.customer_phone ?? "N/A"}`,
    `Option: ${order.product_option}`,
    `Qty: ${order.quantity}`,
    `Total: ${formatUsd(order.amount_cents)}`,
    `Status: ${order.status}`,
    `Placed: ${formatDateTime(order.created_at)}`,
    `Paid: ${formatDateTime(order.paid_at)}`,
    `File: ${order.design_path}`,
    `Download: ${fileLink ?? "No upload link available."}`,
    `Notes: ${notes}`,
  ].join("\n");

  return {
    subject: `New paid order #${orderNumber} - ${order.customer_name}`,
    html,
    text,
  };
}

export type { OrderNotificationDetails };

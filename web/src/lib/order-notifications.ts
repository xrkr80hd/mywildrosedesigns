import {
  getOrderNotificationEmailEnv,
  getUploadBucket,
  hasCustomerOrderConfirmationEmailEnv,
  hasOrderNotificationEmailEnv,
} from "@/lib/env";
import {
  buildCustomerOrderConfirmationEmail,
  buildOrderNotificationEmail,
  type OrderNotificationDetails,
} from "@/lib/order-notification-email";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";

type NotificationResult =
  | { sent: true }
  | { sent: false; reason: "disabled" | "missing_order" };

type ResendResponse = {
  id?: string;
  message?: string;
  name?: string;
};

const RESEND_EMAIL_ENDPOINT = "https://api.resend.com/emails";

async function getOrderForNotification(
  orderId: string,
): Promise<OrderNotificationDetails | null> {
  const supabase = getSupabaseAdminClient();
  const result = await supabase
    .from("orders")
    .select(
      "id, created_at, customer_name, customer_email, customer_phone, product_option, quantity, amount_cents, status, notes, design_path, paid_at",
    )
    .eq("id", orderId)
    .maybeSingle();

  if (result.error) {
    throw new Error(result.error.message);
  }

  if (!result.data) {
    return null;
  }

  const order = result.data as OrderNotificationDetails;
  if (order.design_path && order.design_path !== "cart/no-upload") {
    const signedResult = await supabase.storage
      .from(getUploadBucket())
      .createSignedUrl(order.design_path, 60 * 60 * 24);

    order.fileLink = signedResult.data?.signedUrl ?? null;
  }

  return order;
}

export async function sendPaidOrderNotification(
  orderId: string,
): Promise<NotificationResult> {
  if (!hasOrderNotificationEmailEnv()) {
    return { sent: false, reason: "disabled" };
  }

  const order = await getOrderForNotification(orderId);
  if (!order) {
    return { sent: false, reason: "missing_order" };
  }

  const { resendApiKey, recipients, from } = getOrderNotificationEmailEnv();
  const email = buildOrderNotificationEmail(order);
  const response = await fetch(RESEND_EMAIL_ENDPOINT, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${resendApiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: recipients,
      subject: email.subject,
      html: email.html,
      text: email.text,
    }),
  });

  if (!response.ok) {
    const payload = (await response.json().catch(() => null)) as ResendResponse | null;
    throw new Error(
      payload?.message ?? `Resend email request failed with ${response.status}`,
    );
  }

  return { sent: true };
}

export async function sendCustomerPaidOrderConfirmation(
  orderId: string,
): Promise<NotificationResult> {
  if (!hasCustomerOrderConfirmationEmailEnv()) {
    return { sent: false, reason: "disabled" };
  }

  const order = await getOrderForNotification(orderId);
  if (!order) {
    return { sent: false, reason: "missing_order" };
  }

  const customerEmail = order.customer_email.trim();
  if (!customerEmail) {
    return { sent: false, reason: "missing_order" };
  }

  const { resendApiKey, from } = getOrderNotificationEmailEnv();
  const email = buildCustomerOrderConfirmationEmail(order);
  const response = await fetch(RESEND_EMAIL_ENDPOINT, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${resendApiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [customerEmail],
      subject: email.subject,
      html: email.html,
      text: email.text,
    }),
  });

  if (!response.ok) {
    const payload = (await response.json().catch(() => null)) as ResendResponse | null;
    throw new Error(
      payload?.message ?? `Resend email request failed with ${response.status}`,
    );
  }

  return { sent: true };
}

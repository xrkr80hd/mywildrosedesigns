import "server-only";

type AlertMetadata = Record<string, unknown>;

export type AlertPayload = {
  eventType: string;
  message: string;
  path?: string;
  recipientEmail?: string;
  metadata?: AlertMetadata;
};

type AlertResult =
  | { sent: true }
  | { sent: false; reason: "disabled" | "request_failed" };

const DEFAULT_OWNER_EMAIL = "mywildrosedesignsllc@gmail.com";

function getOwnerEmail(): string {
  const configured = (process.env.ALERT_OWNER_EMAIL ?? "").trim();
  return configured || DEFAULT_OWNER_EMAIL;
}

export async function sendAlert(payload: AlertPayload): Promise<AlertResult> {
  const webhookUrl = (process.env.ALERT_WEBHOOK_URL ?? "").trim();
  if (!webhookUrl) {
    return { sent: false, reason: "disabled" };
  }

  try {
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        eventType: payload.eventType,
        message: payload.message,
        path: payload.path ?? null,
        recipientEmail: payload.recipientEmail ?? getOwnerEmail(),
        metadata: payload.metadata ?? {},
        timestamp: new Date().toISOString(),
      }),
    });

    if (!response.ok) {
      return { sent: false, reason: "request_failed" };
    }

    return { sent: true };
  } catch {
    return { sent: false, reason: "request_failed" };
  }
}

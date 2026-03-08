import { NextResponse } from "next/server";
import { z } from "zod";
import { FUNNEL_EVENT_TYPES, recordFunnelEvent } from "@/lib/funnel-analytics";

export const runtime = "nodejs";

const SESSION_COOKIE = "wr_funnel_sid";
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const funnelEventSchema = z.object({
  eventType: z.enum(FUNNEL_EVENT_TYPES),
  sourcePath: z.string().trim().max(500).optional(),
  productId: z.string().trim().max(120).optional(),
  productSlug: z.string().trim().max(180).optional(),
  variantId: z.string().trim().max(120).optional(),
  orderId: z.string().trim().max(120).optional(),
  cartSize: z.coerce.number().int().min(0).max(500).optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

function parseCookies(header: string | null): Map<string, string> {
  const output = new Map<string, string>();
  if (!header) {
    return output;
  }

  const segments = header.split(";");
  for (const segment of segments) {
    const trimmed = segment.trim();
    if (!trimmed) {
      continue;
    }

    const separatorIndex = trimmed.indexOf("=");
    if (separatorIndex <= 0) {
      continue;
    }

    const key = trimmed.slice(0, separatorIndex).trim();
    const value = trimmed.slice(separatorIndex + 1).trim();
    if (key) {
      output.set(key, decodeURIComponent(value));
    }
  }

  return output;
}

function getSessionId(request: Request): { value: string; fromCookie: boolean } {
  const cookies = parseCookies(request.headers.get("cookie"));
  const existing = cookies.get(SESSION_COOKIE) ?? "";
  if (UUID_RE.test(existing)) {
    return { value: existing, fromCookie: true };
  }

  return { value: crypto.randomUUID(), fromCookie: false };
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = funnelEventSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid analytics payload." }, { status: 400 });
    }

    const session = getSessionId(request);
    try {
      await recordFunnelEvent({
        eventType: parsed.data.eventType,
        sessionId: session.value,
        sourcePath: parsed.data.sourcePath,
        productId: parsed.data.productId,
        productSlug: parsed.data.productSlug,
        variantId: parsed.data.variantId,
        orderId: parsed.data.orderId,
        cartSize: parsed.data.cartSize,
        metadata: parsed.data.metadata,
      });
    } catch (analyticsError) {
      console.error("Unable to save funnel event", analyticsError);
    }

    const response = NextResponse.json({ ok: true });
    if (!session.fromCookie) {
      response.cookies.set({
        name: SESSION_COOKIE,
        value: session.value,
        maxAge: 60 * 60 * 24 * 365,
        path: "/",
        sameSite: "lax",
        secure: true,
        httpOnly: false,
      });
    }

    return response;
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }
}

import "server-only";

import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import type { Json } from "@/lib/supabase/types";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export const FUNNEL_EVENT_TYPES = [
  "view_product",
  "add_to_cart",
  "start_checkout",
  "paid",
] as const;

export type FunnelEventType = (typeof FUNNEL_EVENT_TYPES)[number];

type RecordFunnelEventInput = {
  eventType: FunnelEventType;
  sessionId?: string | null;
  sourcePath?: string | null;
  productId?: string | null;
  productSlug?: string | null;
  variantId?: string | null;
  orderId?: string | null;
  cartSize?: number | null;
  metadata?: Record<string, unknown> | null;
};

function sanitizeUuid(value?: string | null): string | null {
  if (!value) {
    return null;
  }
  return UUID_RE.test(value) ? value : null;
}

export async function recordFunnelEvent(input: RecordFunnelEventInput): Promise<void> {
  const supabase = getSupabaseAdminClient();
  const insertResult = await supabase.from("funnel_events").insert({
    event_type: input.eventType,
    session_id: (input.sessionId ?? "").trim() || null,
    source_path: (input.sourcePath ?? "").trim() || null,
    product_id: sanitizeUuid(input.productId),
    product_slug: (input.productSlug ?? "").trim() || null,
    variant_id: sanitizeUuid(input.variantId),
    order_id: sanitizeUuid(input.orderId),
    cart_size:
      Number.isInteger(input.cartSize) && Number(input.cartSize) >= 0
        ? Number(input.cartSize)
        : null,
    metadata: (input.metadata ?? {}) as Json,
  });

  if (insertResult.error) {
    throw new Error(insertResult.error.message);
  }
}

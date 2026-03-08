"use client";

export type FunnelClientEventType =
  | "view_product"
  | "add_to_cart"
  | "start_checkout"
  | "paid";

type TrackFunnelEventInput = {
  eventType: FunnelClientEventType;
  sourcePath?: string;
  productId?: string;
  productSlug?: string;
  variantId?: string;
  orderId?: string;
  cartSize?: number;
  metadata?: Record<string, unknown>;
};

export function trackFunnelEvent(input: TrackFunnelEventInput) {
  if (typeof window === "undefined") {
    return;
  }

  const payload = {
    eventType: input.eventType,
    sourcePath: input.sourcePath ?? window.location.pathname,
    productId: input.productId,
    productSlug: input.productSlug,
    variantId: input.variantId,
    orderId: input.orderId,
    cartSize: input.cartSize,
    metadata: input.metadata,
  };

  fetch("/api/analytics/funnel", {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify(payload),
    keepalive: true,
  }).catch(() => undefined);
}

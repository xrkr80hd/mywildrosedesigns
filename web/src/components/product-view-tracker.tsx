"use client";

import { useEffect } from "react";
import { trackFunnelEvent } from "@/lib/funnel-tracking";

type ProductViewTrackerProps = {
  productId: string;
  productSlug: string;
};

export function ProductViewTracker({ productId, productSlug }: ProductViewTrackerProps) {
  useEffect(() => {
    trackFunnelEvent({
      eventType: "view_product",
      productId,
      productSlug,
    });
  }, [productId, productSlug]);

  return null;
}

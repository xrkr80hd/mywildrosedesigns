"use client";

import { useState } from "react";
import { CART_KEY, buildCartLineId, sanitizeCartItems } from "@/lib/cart";
import { trackFunnelEvent } from "@/lib/funnel-tracking";

type AddToCartButtonProps = {
  id: string;
  title: string;
  price: number;
  productSlug?: string;
  variantId?: string;
  variantSize?: string;
  variantColor?: string;
  label?: string;
  addedLabel?: string;
  className?: string;
  disabled?: boolean;
  onAdded?: () => void;
};

export function AddToCartButton({
  id,
  title,
  price,
  productSlug,
  variantId,
  variantSize,
  variantColor,
  label = "Add to Cart",
  addedLabel = "Added",
  className,
  disabled = false,
  onAdded,
}: AddToCartButtonProps) {
  const [added, setAdded] = useState(false);

  function handleAdd() {
    if (disabled) {
      return;
    }

    const raw = window.localStorage.getItem(CART_KEY);
    const cart = sanitizeCartItems(raw ? JSON.parse(raw) : []);
    const lineId = buildCartLineId(id, variantId);
    const existing = cart.find((item) => item.lineId === lineId);

    if (existing) {
      existing.quantity += 1;
    } else {
      cart.push({
        lineId,
        id,
        variantId,
        variantSize,
        variantColor,
        productSlug,
        title,
        price,
        quantity: 1,
      });
    }

    window.localStorage.setItem(CART_KEY, JSON.stringify(cart));
    trackFunnelEvent({
      eventType: "add_to_cart",
      productId: id,
      productSlug,
      variantId,
      cartSize: cart.reduce((sum, item) => sum + item.quantity, 0),
      metadata: {
        variantSize: variantSize ?? null,
        variantColor: variantColor ?? null,
      },
    });
    setAdded(true);
    onAdded?.();
    window.setTimeout(() => setAdded(false), 1000);
  }

  return (
    <button
      type="button"
      onClick={handleAdd}
      disabled={disabled}
      className={
        className ??
        "rounded-xl bg-rose px-4 py-2 text-sm font-semibold text-white transition hover:bg-rose/90 disabled:cursor-not-allowed disabled:opacity-70"
      }
    >
      {added ? addedLabel : label}
    </button>
  );
}

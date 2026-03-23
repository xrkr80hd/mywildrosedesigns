"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
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
  showViewCartAfterAdd?: boolean;
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
  showViewCartAfterAdd = true,
  onAdded,
}: AddToCartButtonProps) {
  const [added, setAdded] = useState(false);
  const [showViewCart, setShowViewCart] = useState(false);
  const addedTimerRef = useRef<number | null>(null);
  const viewCartTimerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (addedTimerRef.current != null) {
        window.clearTimeout(addedTimerRef.current);
      }
      if (viewCartTimerRef.current != null) {
        window.clearTimeout(viewCartTimerRef.current);
      }
    };
  }, []);

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

    if (addedTimerRef.current != null) {
      window.clearTimeout(addedTimerRef.current);
    }
    if (viewCartTimerRef.current != null) {
      window.clearTimeout(viewCartTimerRef.current);
    }

    setAdded(true);
    setShowViewCart(showViewCartAfterAdd);
    onAdded?.();
    addedTimerRef.current = window.setTimeout(() => setAdded(false), 1000);
    if (showViewCartAfterAdd) {
      viewCartTimerRef.current = window.setTimeout(() => setShowViewCart(false), 4500);
    }
  }

  const fullWidth = className?.includes("w-full") ?? false;

  return (
    <div className={fullWidth ? "flex w-full flex-wrap items-center gap-2" : "inline-flex items-center gap-2"}>
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
      {showViewCart ? (
        <Link
          href="/cart"
          className="rounded-xl border border-forest/20 bg-white px-4 py-2 text-xs font-semibold text-forest hover:bg-forest hover:text-white"
        >
          View Cart
        </Link>
      ) : null}
    </div>
  );
}

"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

type CartItem = {
  id: string;
  title: string;
  price: number;
  quantity: number;
};

const CART_KEY = "wild-rose-cart";
const SHIPPING = 5.99;
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function formatUsd(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value);
}

function loadItems(): CartItem[] {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const raw = window.localStorage.getItem(CART_KEY);
    const parsed = raw ? (JSON.parse(raw) as CartItem[]) : [];
    const sanitized = parsed.filter(
      (item) =>
        typeof item.id === "string" &&
        UUID_RE.test(item.id) &&
        typeof item.title === "string" &&
        typeof item.price === "number" &&
        Number.isFinite(item.price) &&
        item.price > 0 &&
        Number.isInteger(item.quantity) &&
        item.quantity > 0,
    );

    if (sanitized.length !== parsed.length) {
      window.localStorage.setItem(CART_KEY, JSON.stringify(sanitized));
    }

    return sanitized;
  } catch {
    return [];
  }
}

export function CartClient() {
  const [items, setItems] = useState<CartItem[]>(() => loadItems());

  function save(next: CartItem[]) {
    setItems(next);
    window.localStorage.setItem(CART_KEY, JSON.stringify(next));
  }

  function updateQuantity(id: string, quantity: number) {
    if (quantity <= 0) {
      save(items.filter((item) => item.id !== id));
      return;
    }

    save(items.map((item) => (item.id === id ? { ...item, quantity } : item)));
  }

  function removeItem(id: string) {
    save(items.filter((item) => item.id !== id));
  }

  function clearCart() {
    save([]);
  }

  const subtotal = useMemo(
    () => items.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [items],
  );
  const total = subtotal + (items.length > 0 ? SHIPPING : 0);

  if (!items.length) {
    return (
      <div className="rounded-2xl border border-rose/20 bg-white/85 p-8 text-center">
        <h2 className="text-3xl text-forest">Your cart is empty</h2>
        <p className="mt-2 text-foreground/75">
          Add products from the shop to get started.
        </p>
        <Link
          href="/shop"
          className="mt-5 inline-flex rounded-xl bg-rose px-5 py-3 text-sm font-semibold text-white"
        >
          Go to Shop
        </Link>
      </div>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
      <section className="space-y-3">
        {items.map((item) => (
          <article
            key={item.id}
            className="rounded-2xl border border-rose/20 bg-white/90 p-4"
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="text-lg text-forest">{item.title}</h3>
                <p className="text-sm text-foreground/70">{formatUsd(item.price)} each</p>
              </div>
              <p className="text-sm font-semibold text-rose">
                {formatUsd(item.price * item.quantity)}
              </p>
            </div>

            <div className="mt-3 flex items-center gap-2">
              <button
                type="button"
                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                className="h-8 w-8 rounded-full border border-rose/30 bg-white text-sm font-semibold"
              >
                -
              </button>
              <span className="min-w-8 text-center text-sm font-semibold">{item.quantity}</span>
              <button
                type="button"
                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                className="h-8 w-8 rounded-full border border-rose/30 bg-white text-sm font-semibold"
              >
                +
              </button>
              <button
                type="button"
                onClick={() => removeItem(item.id)}
                className="ml-auto rounded-lg border border-rose/30 px-3 py-1.5 text-xs font-semibold hover:bg-rose hover:text-white"
              >
                Remove
              </button>
            </div>
          </article>
        ))}
      </section>

      <aside className="h-fit rounded-2xl border border-rose/20 bg-white/90 p-5">
        <h2 className="text-2xl text-forest">Summary</h2>
        <div className="mt-4 space-y-2 text-sm">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span>{formatUsd(subtotal)}</span>
          </div>
          <div className="flex justify-between">
            <span>Shipping</span>
            <span>{formatUsd(SHIPPING)}</span>
          </div>
          <div className="flex justify-between border-t border-rose/20 pt-2 text-base font-semibold">
            <span>Total</span>
            <span>{formatUsd(total)}</span>
          </div>
        </div>

        <p className="mt-4 text-xs text-foreground/70">
          Ready to finalize? Continue to secure Stripe checkout.
        </p>
        <div className="mt-4 space-y-2">
          <Link
            href="/checkout"
            className="inline-flex w-full items-center justify-center rounded-xl bg-forest px-4 py-2.5 text-sm font-semibold text-white"
          >
            Proceed to Checkout
          </Link>
          <button
            type="button"
            onClick={clearCart}
            className="inline-flex w-full items-center justify-center rounded-xl border border-rose/30 px-4 py-2.5 text-sm font-semibold"
          >
            Clear Cart
          </button>
        </div>
      </aside>
    </div>
  );
}

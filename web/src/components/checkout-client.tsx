"use client";

import Link from "next/link";
import { FormEvent, useEffect, useMemo, useState } from "react";

type CartItem = {
  id: string;
  title: string;
  price: number;
  quantity: number;
};

type CheckoutResponse = {
  url?: string;
  error?: string;
};

const CART_KEY = "wild-rose-cart";
const SHIPPING = 5.99;

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
    return raw ? (JSON.parse(raw) as CartItem[]) : [];
  } catch {
    return [];
  }
}

export function CheckoutClient() {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setItems(loadItems());
    setIsLoaded(true);
  }, []);

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

  const subtotal = useMemo(
    () => items.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [items],
  );
  const total = subtotal + (items.length > 0 ? SHIPPING : 0);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (!items.length) {
      setError("Your cart is empty.");
      return;
    }

    setIsSubmitting(true);
    const formData = new FormData(event.currentTarget);

    const payload = {
      customerName: String(formData.get("customerName") ?? ""),
      customerEmail: String(formData.get("customerEmail") ?? ""),
      customerPhone: String(formData.get("customerPhone") ?? ""),
      notes: String(formData.get("notes") ?? ""),
      items: items.map((item) => ({ id: item.id, quantity: item.quantity })),
    };

    try {
      const response = await fetch("/api/checkout/cart", {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const checkoutResponse = (await response.json().catch(() => ({}))) as CheckoutResponse;
      if (!response.ok || !checkoutResponse.url) {
        throw new Error(checkoutResponse.error ?? "Unable to start checkout right now.");
      }

      window.location.href = checkoutResponse.url;
    } catch (submitError) {
      setIsSubmitting(false);
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Unable to start checkout right now.",
      );
    }
  }

  if (!isLoaded) {
    return <div className="rounded-2xl border border-rose/20 bg-white/85 p-6 text-sm">Loading checkout...</div>;
  }

  if (!items.length) {
    return (
      <section className="rounded-3xl border border-rose/20 bg-white/90 p-8 text-center">
        <h2 className="text-3xl text-forest">Your cart is empty</h2>
        <p className="mt-2 text-sm text-foreground/75">
          Add products to your cart before starting checkout.
        </p>
        <Link
          href="/shop"
          className="mt-5 inline-flex rounded-xl bg-rose px-5 py-2.5 text-sm font-semibold text-white"
        >
          Go to Shop
        </Link>
      </section>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
      <section className="space-y-4 rounded-3xl border border-rose/20 bg-white/90 p-6">
        <h2 className="text-3xl text-forest">Checkout Details</h2>
        <p className="text-sm text-foreground/75">
          Enter your details and continue to secure Stripe checkout.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="space-y-1">
              <span className="text-sm font-semibold text-forest">Name</span>
              <input
                name="customerName"
                required
                minLength={2}
                className="w-full rounded-xl border border-rose/20 bg-white px-3 py-2 text-sm outline-none transition focus:border-rose"
              />
            </label>
            <label className="space-y-1">
              <span className="text-sm font-semibold text-forest">Email</span>
              <input
                name="customerEmail"
                type="email"
                required
                className="w-full rounded-xl border border-rose/20 bg-white px-3 py-2 text-sm outline-none transition focus:border-rose"
              />
            </label>
          </div>

          <label className="space-y-1">
            <span className="text-sm font-semibold text-forest">Phone (optional)</span>
            <input
              name="customerPhone"
              className="w-full rounded-xl border border-rose/20 bg-white px-3 py-2 text-sm outline-none transition focus:border-rose"
            />
          </label>

          <label className="space-y-1">
            <span className="text-sm font-semibold text-forest">Order Notes (optional)</span>
            <textarea
              name="notes"
              rows={4}
              maxLength={2000}
              className="w-full rounded-xl border border-rose/20 bg-white px-3 py-2 text-sm outline-none transition focus:border-rose"
              placeholder="Any production notes, colors, or special requests"
            />
          </label>

          {error ? <p className="text-sm font-semibold text-red-700">{error}</p> : null}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-xl bg-forest px-4 py-3 text-sm font-semibold text-white transition hover:bg-forest/90 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isSubmitting ? "Redirecting to Stripe..." : "Proceed to Secure Checkout"}
          </button>
        </form>
      </section>

      <aside className="h-fit rounded-3xl border border-rose/20 bg-white/90 p-5">
        <h2 className="text-2xl text-forest">Order Summary</h2>
        <div className="mt-4 space-y-3">
          {items.map((item) => (
            <article key={item.id} className="rounded-xl border border-rose/20 bg-surface p-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-sm font-semibold text-forest">{item.title}</p>
                  <p className="text-xs text-foreground/70">{formatUsd(item.price)} each</p>
                </div>
                <p className="text-sm font-semibold text-rose">
                  {formatUsd(item.price * item.quantity)}
                </p>
              </div>
              <div className="mt-2 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => updateQuantity(item.id, item.quantity - 1)}
                  className="h-7 w-7 rounded-full border border-rose/30 bg-white text-xs font-semibold"
                >
                  -
                </button>
                <span className="min-w-8 text-center text-sm font-semibold">{item.quantity}</span>
                <button
                  type="button"
                  onClick={() => updateQuantity(item.id, item.quantity + 1)}
                  className="h-7 w-7 rounded-full border border-rose/30 bg-white text-xs font-semibold"
                >
                  +
                </button>
                <button
                  type="button"
                  onClick={() => removeItem(item.id)}
                  className="ml-auto rounded-lg border border-rose/30 px-2.5 py-1 text-xs font-semibold hover:bg-rose hover:text-white"
                >
                  Remove
                </button>
              </div>
            </article>
          ))}
        </div>

        <div className="mt-4 space-y-2 border-t border-rose/20 pt-3 text-sm">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span>{formatUsd(subtotal)}</span>
          </div>
          <div className="flex justify-between">
            <span>Shipping</span>
            <span>{formatUsd(SHIPPING)}</span>
          </div>
          <div className="flex justify-between text-base font-semibold">
            <span>Total</span>
            <span>{formatUsd(total)}</span>
          </div>
        </div>

        <Link
          href="/cart"
          className="mt-4 inline-flex w-full items-center justify-center rounded-xl border border-rose/30 px-4 py-2 text-sm font-semibold"
        >
          Back to Cart
        </Link>
      </aside>
    </div>
  );
}

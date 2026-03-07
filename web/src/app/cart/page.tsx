import type { Metadata } from "next";
import { CartClient } from "@/components/cart-client";

export const metadata: Metadata = {
  title: "Cart",
  description: "Review your selected products and continue to secure checkout.",
};

export default function CartPage() {
  return (
    <main className="mx-auto w-full max-w-6xl px-6 py-10">
      <header className="mb-6 rounded-3xl border border-rose/20 bg-white/85 p-7">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gold">
          Shopping Cart
        </p>
        <h1 className="mt-2 text-4xl text-forest">Your Cart</h1>
      </header>

      <CartClient />
    </main>
  );
}


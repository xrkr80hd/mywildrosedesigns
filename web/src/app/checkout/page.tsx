import type { Metadata } from "next";
import { CheckoutClient } from "@/components/checkout-client";

export const metadata: Metadata = {
  title: "Checkout",
  description: "Review your order details and complete secure Stripe checkout.",
};

export default function CheckoutPage() {
  return (
    <main className="mx-auto w-full max-w-6xl px-6 py-10">
      <header className="mb-6 rounded-3xl border border-rose/20 bg-white/85 p-7">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gold">
          Secure Checkout
        </p>
        <h1 className="mt-2 text-4xl text-forest">Checkout</h1>
      </header>

      <CheckoutClient />
    </main>
  );
}

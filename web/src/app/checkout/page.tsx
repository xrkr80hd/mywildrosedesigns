import type { Metadata } from "next";
import { CheckoutClient } from "@/components/checkout-client";

type CheckoutPageProps = {
  searchParams?: {
    cancelled?: string | string[];
  };
};

export const metadata: Metadata = {
  title: "Checkout",
  description: "Review your order details and complete secure Stripe checkout.",
};

function asSingle(value?: string | string[]) {
  return Array.isArray(value) ? value[0] : value;
}

export default function CheckoutPage({ searchParams }: CheckoutPageProps) {
  const wasCancelled = asSingle(searchParams?.cancelled) === "1";

  return (
    <main className="mx-auto w-full max-w-6xl px-6 py-10">
      <header className="mb-6 rounded-3xl border border-rose/20 bg-white/85 p-7">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gold">
          Secure Checkout
        </p>
        <h1 className="mt-2 text-4xl text-forest">Checkout</h1>
        {wasCancelled ? (
          <p className="mt-2 rounded-xl border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-amber-900">
            Checkout was canceled. Your cart is still saved, and you can try again now.
          </p>
        ) : null}
      </header>

      <CheckoutClient />
    </main>
  );
}
